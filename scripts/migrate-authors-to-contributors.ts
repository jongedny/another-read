/**
 * Migration Script: Populate Contributors Table
 * 
 * This script:
 * 1. Creates contributors from existing book author data
 * 2. Links books to contributors via the bookContributors junction table
 * 3. Updates books.contributorIds with the new contributor IDs
 */

import 'dotenv/config';
import { db } from '../src/server/db';
import { books, contributors, bookContributors } from '../src/server/db/schema';
import { eq } from 'drizzle-orm';

async function migrateAuthorsToContributors() {
    console.log('Starting migration: Authors to Contributors...\n');

    try {
        // Step 1: Get all books with their current author data
        const allBooks = await db.select().from(books);
        console.log(`Found ${allBooks.length} books to process\n`);

        const contributorMap = new Map<string, number>(); // Map author name to contributor ID
        let booksProcessed = 0;
        let contributorsCreated = 0;
        let linksCreated = 0;

        for (const book of allBooks) {
            // Skip books without author data (if any exist due to schema changes)
            const authorName = (book as any).author;
            if (!authorName) {
                console.log(`⚠️  Book "${book.title}" (ID: ${book.id}) has no author, skipping...`);
                continue;
            }

            let contributorId: number;

            // Check if we've already created a contributor for this author
            if (contributorMap.has(authorName)) {
                contributorId = contributorMap.get(authorName)!;
            } else {
                // Create new contributor
                const [newContributor] = await db
                    .insert(contributors)
                    .values({
                        name: authorName,
                        biography: null, // Will be populated later if needed
                    })
                    .returning();

                contributorId = newContributor!.id;
                contributorMap.set(authorName, contributorId);
                contributorsCreated++;
                console.log(`✓ Created contributor: ${authorName} (ID: ${contributorId})`);
            }

            // Create book-contributor link with 'author' role
            await db.insert(bookContributors).values({
                bookId: book.id,
                contributorId: contributorId,
                role: 'author',
                sequenceNumber: 1, // Primary author
            });
            linksCreated++;

            // Update book's contributorIds field
            await db
                .update(books)
                .set({
                    contributorIds: JSON.stringify([contributorId]),
                })
                .where(eq(books.id, book.id));

            booksProcessed++;

            if (booksProcessed % 10 === 0) {
                console.log(`Progress: ${booksProcessed}/${allBooks.length} books processed...`);
            }
        }

        console.log('\n✅ Migration completed successfully!');
        console.log(`\nSummary:`);
        console.log(`  - Books processed: ${booksProcessed}`);
        console.log(`  - Unique contributors created: ${contributorsCreated}`);
        console.log(`  - Book-contributor links created: ${linksCreated}`);
        console.log(`\nNote: The 'author' column can now be removed from the books table in a future migration.`);

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
}

// Run the migration
migrateAuthorsToContributors()
    .then(() => {
        console.log('\nMigration script finished.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\nMigration script failed:', error);
        process.exit(1);
    });
