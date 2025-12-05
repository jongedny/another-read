import { db } from "~/server/db";
import { books } from "~/server/db/schema";
import { env } from "~/env";
import * as fs from "fs";
import * as path from "path";

interface CSVBook {
    title: string;
    author: string;
    description: string;
    isbn: string;
    publication_date: string;
    keywords: string;
    price: string;
    genre: string;
    cover_image_url: string;
    status: string;
    id: string;
    created_date: string;
    updated_date: string;
    created_by_id: string;
    created_by: string;
    is_sample: string;
}

async function parseCSV(filePath: string): Promise<CSVBook[]> {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const lines = fileContent.split("\n");
    const headers = lines[0]!.split(",").map((h) => h.trim().replace(/"/g, ""));

    const books: CSVBook[] = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line || line.trim() === "") continue;

        // Parse CSV line handling quoted fields
        const values: string[] = [];
        let currentValue = "";
        let insideQuotes = false;

        for (let j = 0; j < line.length; j++) {
            const char = line[j]!;

            if (char === '"') {
                insideQuotes = !insideQuotes;
            } else if (char === "," && !insideQuotes) {
                values.push(currentValue.trim());
                currentValue = "";
            } else {
                currentValue += char;
            }
        }
        values.push(currentValue.trim()); // Push the last value

        if (values.length >= headers.length) {
            const book: any = {};
            headers.forEach((header, index) => {
                book[header] = values[index] || "";
            });
            books.push(book as CSVBook);
        }
    }

    return books;
}

async function importBooks() {
    console.log("Starting book import...");

    const csvPath = path.join(process.cwd(), "books.csv");
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

    // Insert in batches of 50 to avoid overwhelming the database
    const batchSize = 50;
    let imported = 0;

    for (let i = 0; i < booksToInsert.length; i += batchSize) {
        const batch = booksToInsert.slice(i, i + batchSize);
        await db.insert(books).values(batch);
        imported += batch.length;
        console.log(`Imported ${imported}/${booksToInsert.length} books...`);
    }

    console.log(`✅ Successfully imported ${imported} books!`);

    // Verify the import
    const count = await db.query.books.findMany();
    console.log(`📚 Total books in database: ${count.length}`);
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
