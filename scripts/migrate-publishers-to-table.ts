/**
 * Migration Script: Populate Publishers Table
 * 
 * This script:
 * 1. Creates publishers from existing book publisher data
 * 2. Updates books to reference the publisher via publisherId
 */

import 'dotenv/config';
import { db } from '../src/server/db';
import { books, publishers } from '../src/server/db/schema';
import { eq } from 'drizzle-orm';

async function migratePublishersToTable() {
    console.log('Starting migration: Publishers to Table...\n');

    try {
        // Step 1: Get all books with their current publisher data
        const allBooks = await db.select().from(books);
        console.log(`Found ${allBooks.length} books to process\n`);

        const publisherMap = new Map<string, number>(); // Map publisher name to publisher ID
        let booksProcessed = 0;
        let publishersCreated = 0;
        let booksUpdated = 0;

        for (const book of allBooks) {
            // Skip books without publisher data
            const publisherName = (book as any).publisher;
            if (!publisherName || publisherName.trim() === '') {
                booksProcessed++;
                continue;
            }

            const trimmedName = publisherName.trim();
            let publisherId: number;

            // Check if we've already created a publisher for this name
            if (publisherMap.has(trimmedName)) {
                publisherId = publisherMap.get(trimmedName)!;
            } else {
                // Create new publisher
                const [newPublisher] = await db
                    .insert(publishers)
                    .values({
                        name: trimmedName,
                    })
                    .returning();

                publisherId = newPublisher!.id;
                publisherMap.set(trimmedName, publisherId);
                publishersCreated++;
                console.log(`✓ Created publisher: ${trimmedName} (ID: ${publisherId})`);
            }

            // Update book's publisherId field
            await db
                .update(books)
                .set({
                    publisherId: publisherId,
                })
                .where(eq(books.id, book.id));

            booksUpdated++;
            booksProcessed++;

            if (booksProcessed % 100 === 0) {
                console.log(`Progress: ${booksProcessed}/${allBooks.length} books processed...`);
            }
        }

        console.log('\n✅ Migration completed successfully!');
        console.log(`\nSummary:`);
        console.log(`  - Books processed: ${booksProcessed}`);
        console.log(`  - Books updated with publisher: ${booksUpdated}`);
        console.log(`  - Unique publishers created: ${publishersCreated}`);
        console.log(`\nNote: The 'publisher' column can now be removed from the books table if desired.`);

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
}

// Run the migration
migratePublishersToTable()
    .then(() => {
        console.log('\nMigration script finished.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\nMigration script failed:', error);
        process.exit(1);
    });
