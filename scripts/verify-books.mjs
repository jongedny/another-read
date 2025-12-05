#!/usr/bin/env node

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

const books = pgTable("Another Read_book", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    author: text("author").notNull(),
    description: text("description"),
    isbn: text("isbn"),
    publicationDate: text("publication_date"),
    keywords: text("keywords"),
    price: text("price"),
    genre: text("genre"),
    coverImageUrl: text("cover_image_url"),
    status: text("status"),
    externalId: text("external_id"),
    createdBy: text("created_by"),
    isSample: text("is_sample"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

async function verifyBooks() {
    console.log("Verifying books import...\n");

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        throw new Error("DATABASE_URL environment variable is required");
    }

    const client = postgres(databaseUrl);
    const db = drizzle(client);

    // Get all books
    const allBooks = await db.select().from(books);
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

    await client.end();
}

verifyBooks()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Verification failed:", error);
        process.exit(1);
    });
