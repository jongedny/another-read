import { db } from "~/server/db";

async function verifyBooks() {
    console.log("Verifying books import...\n");

    // Count total books
    const allBooks = await db.query.books.findMany();
    console.log(`✅ Total books in database: ${allBooks.length}`);

    // Show first 3 books
    console.log("\n📚 Sample books:");
    const sampleBooks = allBooks.slice(0, 3);
    sampleBooks.forEach((book, index) => {
        console.log(`\n${index + 1}. "${book.title}"`);
        console.log(`   Contributors: ${book.contributorIds || 'None'}`);
        console.log(`   Publisher: ${book.publisherId || 'None'}`);
        console.log(`   ISBN: ${book.isbn}`);
        console.log(`   Price: ${book.price}`);
        console.log(`   Status: ${book.status}`);
    });

    // Verify data integrity
    const booksWithoutTitle = allBooks.filter((b) => !b.title);
    const booksWithoutContributors = allBooks.filter((b) => !b.contributorIds);

    console.log(`\n✓ Books without title: ${booksWithoutTitle.length}`);
    console.log(`✓ Books without contributors: ${booksWithoutContributors.length}`);

    console.log("\n✅ Verification complete!");
}

verifyBooks()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Verification failed:", error);
        process.exit(1);
    });
