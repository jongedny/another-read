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
        console.log(`   Author: ${book.author}`);
        console.log(`   ISBN: ${book.isbn}`);
        console.log(`   Price: ${book.price}`);
        console.log(`   Status: ${book.status}`);
    });

    // Verify data integrity
    const booksWithoutTitle = allBooks.filter((b) => !b.title);
    const booksWithoutAuthor = allBooks.filter((b) => !b.author);

    console.log(`\n✓ Books without title: ${booksWithoutTitle.length}`);
    console.log(`✓ Books without author: ${booksWithoutAuthor.length}`);

    console.log("\n✅ Verification complete!");
}

verifyBooks()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Verification failed:", error);
        process.exit(1);
    });
