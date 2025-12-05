#!/usr/bin/env node

/**
 * Standalone book import script
 * Run with: node --env-file=.env scripts/import-books.mjs
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Define the books table schema
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

async function parseCSV(filePath) {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const lines = fileContent.split("\n");
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));

    const booksData = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line || line.trim() === "") continue;

        // Parse CSV line handling quoted fields
        const values = [];
        let currentValue = "";
        let insideQuotes = false;

        for (let j = 0; j < line.length; j++) {
            const char = line[j];

            if (char === '"') {
                insideQuotes = !insideQuotes;
            } else if (char === "," && !insideQuotes) {
                values.push(currentValue.trim());
                currentValue = "";
            } else {
                currentValue += char;
            }
        }
        values.push(currentValue.trim());

        if (values.length >= headers.length) {
            const book = {};
            headers.forEach((header, index) => {
                book[header] = values[index] || "";
            });
            booksData.push(book);
        }
    }

    return booksData;
}

async function importBooks() {
    console.log("Starting book import...");

    // Get DATABASE_URL from environment
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        throw new Error("DATABASE_URL environment variable is required");
    }

    // Create database connection
    const client = postgres(databaseUrl);
    const db = drizzle(client);

    const csvPath = path.join(__dirname, "..", "books.csv");
    console.log(`Reading CSV from: ${csvPath}`);

    const csvBooks = await parseCSV(csvPath);
    console.log(`Found ${csvBooks.length} books in CSV`);

    // Transform CSV data to match database schema
    const booksToInsert = csvBooks.map((book) => ({
        title: book.title,
        author: book.author || "Unknown Author",
        description: book.description,
        isbn: book.isbn,
        publicationDate: book.publication_date,
        keywords: book.keywords,
        price: book.price,
        genre: book.genre,
        coverImageUrl: book.cover_image_url,
        status: book.status,
        externalId: book.id,
        createdBy: book.created_by,
        isSample: book.is_sample,
    }));

    // Insert in batches of 50
    const batchSize = 50;
    let imported = 0;

    for (let i = 0; i < booksToInsert.length; i += batchSize) {
        const batch = booksToInsert.slice(i, i + batchSize);
        await db.insert(books).values(batch);
        imported += batch.length;
        console.log(`Imported ${imported}/${booksToInsert.length} books...`);
    }

    console.log(`✅ Successfully imported ${imported} books!`);

    // Close connection
    await client.end();
}

importBooks()
    .then(() => {
        console.log("Import completed successfully!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("Import failed:", error);
        process.exit(1);
    });
