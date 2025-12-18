/**
 * Book Import Service
 * Handles importing books from ONIX XML files
 */

import { db } from '../db';
import { books, importLogs, importErrors, contributors, bookContributors, publishers } from '../db/schema';
import { parseOnixFile, detectOnixSource, type ParsedBook, type ParsedContributor } from './onixParser';
import { eq, or, sql } from 'drizzle-orm';
import { readdir, rename } from 'fs/promises';
import { join } from 'path';

const IMPORTS_DIR = join(process.cwd(), 'imports');
const INCOMING_DIR = join(IMPORTS_DIR, 'incoming');
const PROCESSED_DIR = join(IMPORTS_DIR, 'processed');
const FAILED_DIR = join(IMPORTS_DIR, 'failed');

export interface ImportResult {
    success: boolean;
    importLogId: number;
    totalBooks: number;
    importedBooks: number;
    skippedBooks: number;
    errorCount: number;
    errors?: string[];
}

/**
 * Check if a book already exists in the database and return it
 */
async function findExistingBook(isbn13?: string, isbn10?: string, recordReference?: string) {
    if (!isbn13 && !isbn10 && !recordReference) {
        return null;
    }

    try {
        const existingBooks = await db
            .select()
            .from(books)
            .where(
                isbn13 ? eq(books.isbn, isbn13) :
                    isbn10 ? eq(books.isbn, isbn10) :
                        eq(books.externalId, recordReference!)
            )
            .limit(1);

        return existingBooks.length > 0 ? existingBooks[0] : null;
    } catch (error) {
        console.error('Error checking book existence:', error);
        return null;
    }
}

/**
 * Find or create a contributor by name
 */
async function findOrCreateContributor(contributorData: ParsedContributor): Promise<number> {
    try {
        // Check if contributor already exists
        const existing = await db
            .select()
            .from(contributors)
            .where(eq(contributors.name, contributorData.name))
            .limit(1);

        if (existing.length > 0) {
            return existing[0]!.id;
        }

        // Create new contributor
        const [newContributor] = await db
            .insert(contributors)
            .values({
                name: contributorData.name,
                biography: contributorData.biography || null,
            })
            .returning();

        return newContributor!.id;
    } catch (error) {
        console.error('Error finding/creating contributor:', error);
        throw error;
    }
}

/**
 * Find or create a publisher by name
 */
async function findOrCreatePublisher(publisherName: string): Promise<number | null> {
    if (!publisherName || publisherName.trim() === '') {
        return null;
    }

    try {
        // Check if publisher already exists
        const existing = await db
            .select()
            .from(publishers)
            .where(eq(publishers.name, publisherName.trim()))
            .limit(1);

        if (existing.length > 0) {
            return existing[0]!.id;
        }

        // Create new publisher
        const [newPublisher] = await db
            .insert(publishers)
            .values({
                name: publisherName.trim(),
            })
            .returning();

        return newPublisher!.id;
    } catch (error) {
        console.error('Error finding/creating publisher:', error);
        return null;
    }
}

/**
 * Import a single book to the database (insert new or update existing)
 */
async function importBook(book: ParsedBook, importLogId: number): Promise<{
    success: boolean;
    skipped: boolean;
    error?: string;
}> {
    try {
        // Check if book already exists
        const existingBook = await findExistingBook(book.isbn13, book.isbn10, book.recordReference);

        // Process contributors
        const contributorIds: number[] = [];
        if (book.contributors && book.contributors.length > 0) {
            for (const contributor of book.contributors) {
                const contributorId = await findOrCreateContributor(contributor);
                contributorIds.push(contributorId);
            }
        }

        // Process publisher
        const publisherId = book.publisher
            ? await findOrCreatePublisher(book.publisher)
            : null;

        // Prepare book data
        const bookData = {
            title: book.title || 'Untitled',
            contributorIds: contributorIds.length > 0 ? JSON.stringify(contributorIds) : null,
            publisherId,
            description: book.description,
            isbn: book.isbn13 || book.isbn10,
            publicationDate: book.publicationDate,
            keywords: book.keywords ? JSON.stringify(book.keywords) : null,
            price: book.price,
            genre: book.genre,
            coverImageUrl: book.coverImageUrl,
            status: 'active',
            externalId: book.recordReference,
            createdBy: 'import',
            isSample: 'false',
        };

        let bookId: number;

        if (existingBook) {
            // Update existing book
            await db.update(books)
                .set({
                    ...bookData,
                    updatedAt: new Date(),
                })
                .where(eq(books.id, existingBook.id));

            bookId = existingBook.id;

            // Delete existing book-contributor relationships
            await db.delete(bookContributors)
                .where(eq(bookContributors.bookId, bookId));
        } else {
            // Insert new book
            const [newBook] = await db.insert(books).values(bookData).returning();
            bookId = newBook!.id;
        }

        // Create book-contributor relationships
        if (book.contributors && book.contributors.length > 0) {
            for (let i = 0; i < book.contributors.length; i++) {
                const contributor = book.contributors[i]!;
                const contributorId = contributorIds[i]!;

                // Map ONIX role codes to readable roles
                let role = 'contributor';
                if (contributor.role === 'A01') role = 'author';
                else if (contributor.role === 'A12') role = 'illustrator';
                else if (contributor.role === 'B01') role = 'editor';
                else if (contributor.role === 'A06') role = 'translator';

                await db.insert(bookContributors).values({
                    bookId,
                    contributorId,
                    role,
                    sequenceNumber: contributor.sequenceNumber || (i + 1),
                });
            }
        }

        return { success: true, skipped: false };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        // Log error to import_errors table
        await db.insert(importErrors).values({
            importLogId,
            bookIdentifier: book.isbn13 || book.isbn10 || book.recordReference,
            errorType: 'database_error',
            errorMessage,
            errorDetails: JSON.stringify({
                book: book.title,
                author: book.author,
                stack: error instanceof Error ? error.stack : undefined,
            }),
        });

        return { success: false, skipped: false, error: errorMessage };
    }
}

/**
 * Import a single book using cached contributor and publisher IDs (optimized)
 */
async function importBookWithCache(
    book: ParsedBook,
    importLogId: number,
    contributorIdMap: Map<string, number>,
    publisherIdMap: Map<string, number>
): Promise<{
    success: boolean;
    skipped: boolean;
    error?: string;
}> {
    try {
        // Check if book already exists
        const existingBook = await findExistingBook(book.isbn13, book.isbn10, book.recordReference);

        // Get contributor IDs from cache
        const contributorIds: number[] = [];
        if (book.contributors && book.contributors.length > 0) {
            for (const contributor of book.contributors) {
                const contributorId = contributorIdMap.get(contributor.name);
                if (contributorId) {
                    contributorIds.push(contributorId);
                }
            }
        }

        // Get publisher ID from cache
        const publisherId = book.publisher
            ? publisherIdMap.get(book.publisher.trim()) ?? null
            : null;

        // Prepare book data
        const bookData = {
            title: book.title || 'Untitled',
            contributorIds: contributorIds.length > 0 ? JSON.stringify(contributorIds) : null,
            publisherId,
            description: book.description,
            isbn: book.isbn13 || book.isbn10,
            publicationDate: book.publicationDate,
            keywords: book.keywords ? JSON.stringify(book.keywords) : null,
            price: book.price,
            genre: book.genre,
            coverImageUrl: book.coverImageUrl,
            status: 'active',
            externalId: book.recordReference,
            createdBy: 'import',
            isSample: 'false',
        };

        let bookId: number;

        if (existingBook) {
            // Update existing book
            const updated = await db
                .update(books)
                .set({ ...bookData, updatedAt: new Date() })
                .where(eq(books.id, existingBook.id))
                .returning();

            bookId = updated[0]!.id;
        } else {
            // Insert new book
            const inserted = await db.insert(books).values(bookData).returning();
            bookId = inserted[0]!.id;
        }

        // Handle book-contributor relationships
        if (book.contributors && book.contributors.length > 0) {
            // Delete existing relationships
            await db.delete(bookContributors).where(eq(bookContributors.bookId, bookId));

            // Map ONIX role codes to our role names
            const roleMap: Record<string, string> = {
                'A01': 'author',
                'A12': 'illustrator',
                'B01': 'editor',
                'A06': 'translator',
            };

            // Create new relationships
            const relationships = book.contributors.map((contributor) => {
                const contributorId = contributorIdMap.get(contributor.name);
                if (!contributorId) return null;

                return {
                    bookId,
                    contributorId,
                    role: roleMap[contributor.role] || contributor.role.toLowerCase(),
                    sequenceNumber: contributor.sequenceNumber,
                };
            }).filter((rel): rel is NonNullable<typeof rel> => rel !== null);

            if (relationships.length > 0) {
                await db.insert(bookContributors).values(relationships);
            }
        }

        return {
            success: true,
            skipped: false,
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        // Log the error
        await db.insert(importErrors).values({
            importLogId,
            errorType: 'import_error',
            errorMessage,
            errorDetails: JSON.stringify({
                isbn: book.isbn13 || book.isbn10,
                title: book.title,
                recordReference: book.recordReference,
            }),
        });

        return {
            success: false,
            skipped: false,
            error: errorMessage,
        };
    }
}

/**
 * Import books from a single ONIX XML file (with batch optimization)
 */
export async function importOnixFile(filepath: string, filename: string): Promise<ImportResult> {
    // Create import log entry
    const [importLog] = await db.insert(importLogs).values({
        filename,
        filepath,
        status: 'processing',
        importSource: detectOnixSource(filename),
        startedAt: new Date(),
    }).returning();

    if (!importLog) {
        throw new Error('Failed to create import log');
    }

    const importLogId = importLog.id;
    let importedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    try {
        // Parse the ONIX file
        const { books: parsedBooks, error: parseError } = await parseOnixFile(filepath);

        if (parseError) {
            // Log parse error
            await db.insert(importErrors).values({
                importLogId,
                errorType: 'parse_error',
                errorMessage: parseError,
                errorDetails: JSON.stringify({ filepath, filename }),
            });

            // Update import log
            await db.update(importLogs)
                .set({
                    status: 'failed',
                    errorCount: 1,
                    completedAt: new Date(),
                })
                .where(eq(importLogs.id, importLogId));

            return {
                success: false,
                importLogId,
                totalBooks: 0,
                importedBooks: 0,
                skippedBooks: 0,
                errorCount: 1,
                errors: [parseError],
            };
        }

        console.log(`[Import] Parsed ${parsedBooks.length} books from ${filename}`);

        // BATCH OPTIMIZATION: Pre-process all contributors and publishers
        console.log(`[Import] Batch processing contributors and publishers...`);

        const uniqueContributors = new Map<string, ParsedContributor>();
        const uniquePublishers = new Set<string>();

        // Collect all unique contributors and publishers
        for (const book of parsedBooks) {
            if (book.contributors) {
                for (const contributor of book.contributors) {
                    uniqueContributors.set(contributor.name, contributor);
                }
            }
            if (book.publisher) {
                uniquePublishers.add(book.publisher.trim());
            }
        }

        console.log(`[Import] Found ${uniqueContributors.size} unique contributors and ${uniquePublishers.size} unique publishers`);

        // Batch create/fetch contributors
        const contributorIdMap = new Map<string, number>();
        if (uniqueContributors.size > 0) {
            const contributorNames = Array.from(uniqueContributors.keys());

            // Fetch existing contributors
            const existingContributors = await db
                .select()
                .from(contributors)
                .where(
                    sql`${contributors.name} IN (${sql.join(contributorNames.map(name => sql`${name}`), sql`, `)})`
                );

            existingContributors.forEach(c => contributorIdMap.set(c.name, c.id));

            // Create new contributors in batch
            const newContributors = contributorNames.filter(name => !contributorIdMap.has(name));
            if (newContributors.length > 0) {
                const createdContributors = await db
                    .insert(contributors)
                    .values(newContributors.map(name => ({ name })))
                    .returning();

                createdContributors.forEach(c => contributorIdMap.set(c.name, c.id));
                console.log(`[Import] Created ${createdContributors.length} new contributors`);
            }
        }

        // Batch create/fetch publishers
        const publisherIdMap = new Map<string, number>();
        if (uniquePublishers.size > 0) {
            const publisherNames = Array.from(uniquePublishers);

            // Fetch existing publishers
            const existingPublishers = await db
                .select()
                .from(publishers)
                .where(
                    sql`${publishers.name} IN (${sql.join(publisherNames.map(name => sql`${name}`), sql`, `)})`
                );

            existingPublishers.forEach(p => publisherIdMap.set(p.name, p.id));

            // Create new publishers in batch
            const newPublishers = publisherNames.filter(name => !publisherIdMap.has(name));
            if (newPublishers.length > 0) {
                const createdPublishers = await db
                    .insert(publishers)
                    .values(newPublishers.map(name => ({ name })))
                    .returning();

                createdPublishers.forEach(p => publisherIdMap.set(p.name, p.id));
                console.log(`[Import] Created ${createdPublishers.length} new publishers`);
            }
        }

        console.log(`[Import] Starting book import with cached contributor/publisher IDs...`);

        // Import each book (now much faster with cached IDs)
        for (let i = 0; i < parsedBooks.length; i++) {
            const book = parsedBooks[i]!;
            const result = await importBookWithCache(book, importLogId, contributorIdMap, publisherIdMap);

            if (result.success) {
                if (result.skipped) {
                    skippedCount++;
                } else {
                    importedCount++;
                }
            } else {
                errorCount++;
                if (result.error) {
                    errors.push(result.error);
                }
            }

            // Log progress every 10 books
            if ((i + 1) % 10 === 0 || (i + 1) === parsedBooks.length) {
                console.log(`[Import] Progress: ${i + 1}/${parsedBooks.length} books (${importedCount} imported, ${skippedCount} skipped, ${errorCount} errors)`);
            }
        }

        // Update import log with final status
        const status = errorCount === parsedBooks.length ? 'failed' : 'completed';

        await db.update(importLogs)
            .set({
                status,
                totalBooks: parsedBooks.length,
                importedBooks: importedCount,
                skippedBooks: skippedCount,
                errorCount,
                completedAt: new Date(),
            })
            .where(eq(importLogs.id, importLogId));

        // Move file to appropriate directory
        const targetDir = status === 'failed' ? FAILED_DIR : PROCESSED_DIR;
        const targetPath = join(targetDir, filename);
        await rename(filepath, targetPath);

        return {
            success: status === 'completed',
            importLogId,
            totalBooks: parsedBooks.length,
            importedBooks: importedCount,
            skippedBooks: skippedCount,
            errorCount,
            errors: errors.length > 0 ? errors : undefined,
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        // Log unexpected error
        await db.insert(importErrors).values({
            importLogId,
            errorType: 'system_error',
            errorMessage,
            errorDetails: JSON.stringify({
                filepath,
                filename,
                stack: error instanceof Error ? error.stack : undefined,
            }),
        });

        // Update import log
        await db.update(importLogs)
            .set({
                status: 'failed',
                errorCount: errorCount + 1,
                completedAt: new Date(),
            })
            .where(eq(importLogs.id, importLogId));

        // Move file to failed directory
        try {
            const targetPath = join(FAILED_DIR, filename);
            await rename(filepath, targetPath);
        } catch (moveError) {
            console.error('Failed to move file to failed directory:', moveError);
        }

        return {
            success: false,
            importLogId,
            totalBooks: 0,
            importedBooks: importedCount,
            skippedBooks: skippedCount,
            errorCount: errorCount + 1,
            errors: [...errors, errorMessage],
        };
    }
}

/**
 * Process all XML/ONX files in the incoming directory
 */
export async function processIncomingFiles(): Promise<ImportResult[]> {
    try {
        const files = await readdir(INCOMING_DIR);
        // Filter for both .xml and .onx files (ONIX format)
        const onixFiles = files.filter(file => {
            const lower = file.toLowerCase();
            return lower.endsWith('.xml') || lower.endsWith('.onx');
        });

        const results: ImportResult[] = [];

        for (const filename of onixFiles) {
            const filepath = join(INCOMING_DIR, filename);
            console.log(`Processing file: ${filename}`);

            const result = await importOnixFile(filepath, filename);
            results.push(result);

            console.log(`Completed ${filename}: ${result.importedBooks} imported, ${result.skippedBooks} skipped, ${result.errorCount} errors`);
        }

        return results;
    } catch (error) {
        console.error('Error processing incoming files:', error);
        throw error;
    }
}

/**
 * Get import log details
 */
export async function getImportLog(importLogId: number) {
    const [log] = await db
        .select()
        .from(importLogs)
        .where(eq(importLogs.id, importLogId));

    if (!log) {
        return null;
    }

    const errors = await db
        .select()
        .from(importErrors)
        .where(eq(importErrors.importLogId, importLogId));

    return {
        ...log,
        errors,
    };
}

/**
 * Get all import logs
 */
export async function getAllImportLogs() {
    return await db
        .select()
        .from(importLogs)
        .orderBy(importLogs.createdAt);
}
