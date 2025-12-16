import { NextRequest, NextResponse } from "next/server";
import { fetchDailyUKEvents, reviewBookRecommendations } from "~/server/services/openai";
import { db } from "~/server/db";
import { events, books, eventBooks } from "~/server/db/schema";
import { env } from "~/env";
import { eq } from "drizzle-orm";

/**
 * Helper function to find and store related books for an event
 * @param eventId - The ID of the event
 * @param keywords - Comma-separated keywords
 * @param description - Event description
 * @returns Number of books found
 */
async function findRelatedBooksForEvent(
    eventId: number,
    keywords: string | null,
    description: string | null
): Promise<number> {
    // Parse event keywords
    const eventKeywords = keywords
        ? keywords.split(',').map(k => k.trim().toLowerCase())
        : [];

    if (eventKeywords.length === 0 && !description) {
        return 0;
    }

    // Find matching books
    const allBooks = await db.query.books.findMany();

    const matchedBooks = allBooks
        .map(book => {
            let score = 0;
            const searchText = `${book.title} ${book.description || ''} ${book.keywords || ''}`.toLowerCase();

            // Check each event keyword
            eventKeywords.forEach(keyword => {
                if (searchText.includes(keyword)) {
                    score += 10;
                }
            });

            // Check event description words
            if (description) {
                const descWords = description.toLowerCase().split(/\s+/).filter(w => w.length > 3);
                descWords.forEach(word => {
                    if (searchText.includes(word)) {
                        score += 2;
                    }
                });
            }

            return { book, score };
        })
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10); // Limit to top 10 matches

    // Store the relationships
    if (matchedBooks.length > 0) {
        await db.insert(eventBooks).values(
            matchedBooks.map(({ book, score }) => ({
                eventId: eventId,
                bookId: book.id,
                matchScore: score,
            }))
        );
    }

    return matchedBooks.length;
}


/**
 * API Route for scheduled daily event fetching
 * This endpoint is called by the cron job to fetch and save UK events
 */
export async function GET(request: NextRequest) {
    try {
        // Verify authorization
        // Vercel Cron sends requests with an Authorization header
        // Manual calls can use the secret query parameter
        const authHeader = request.headers.get("authorization");
        const cronSecret = request.nextUrl.searchParams.get("secret");

        // Check if this is a Vercel Cron request (has Authorization header starting with "Bearer")
        const isVercelCron = authHeader?.startsWith("Bearer ");

        // For manual testing, verify the secret query parameter
        if (!isVercelCron && env.CRON_SECRET && cronSecret !== env.CRON_SECRET) {
            console.error("[Cron API] Unauthorized access attempt");
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        console.log("[Cron API] Starting daily event fetch...");

        // Fetch events from OpenAI
        const dailyEvents = await fetchDailyUKEvents();

        if (dailyEvents.length === 0) {
            console.log("[Cron API] No events returned from OpenAI");
            return NextResponse.json({
                success: true,
                message: "No events to save",
                count: 0,
            });
        }

        // Save events to database
        const values = dailyEvents.map((event) => ({
            name: event.name,
            keywords: event.keywords.join(", "), // Store as comma-separated string
            description: event.description,
            eventDate: new Date(event.date), // Parse the date string to a Date object
        }));
        const insertedEvents = await db.insert(events).values(values).returning();

        console.log(`[Cron API] Successfully saved ${dailyEvents.length} events:`, dailyEvents);

        // Automatically find related books for events happening today
        // Filter to only process events with today's date
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1); // Start of tomorrow

        const todaysEvents = insertedEvents.filter(event => {
            if (!event.eventDate) return false;
            const eventDate = new Date(event.eventDate);
            eventDate.setHours(0, 0, 0, 0);
            return eventDate >= today && eventDate < tomorrow;
        });

        console.log(`[Cron API] Found ${todaysEvents.length} events for today out of ${insertedEvents.length} total events`);

        let totalBooksFound = 0;
        let totalReviewsGenerated = 0;

        for (const event of todaysEvents) {
            try {
                const booksFound = await findRelatedBooksForEvent(event.id, event.keywords, event.description);
                totalBooksFound += booksFound;
                console.log(`[Cron API] Found ${booksFound} related books for event "${event.name}"`);

                // If books were found, get AI reviews for them
                if (booksFound > 0) {
                    // Fetch the related books with their details
                    const relatedBookRecords = await db.query.eventBooks.findMany({
                        where: eq(eventBooks.eventId, event.id),
                    });

                    if (relatedBookRecords.length > 0) {
                        const bookIds = relatedBookRecords.map(r => r.bookId);
                        const bookDetails = await db.query.books.findMany({
                            where: (books, { inArray }) => inArray(books.id, bookIds),
                        });

                        // Get AI reviews for the books (max 20)
                        const reviews = await reviewBookRecommendations(
                            event.name,
                            bookDetails.map(b => ({
                                title: b.title,
                                author: b.author,
                                description: b.description,
                            }))
                        );

                        // Update the eventBooks records with AI scores and explanations
                        for (const review of reviews) {
                            const matchingBook = bookDetails.find(b => b.title === review.bookTitle);
                            if (matchingBook) {
                                const eventBookRecord = relatedBookRecords.find(r => r.bookId === matchingBook.id);
                                if (eventBookRecord) {
                                    await db.update(eventBooks)
                                        .set({
                                            aiScore: review.score,
                                            aiExplanation: review.explanation,
                                        })
                                        .where(eq(eventBooks.id, eventBookRecord.id));
                                    totalReviewsGenerated++;
                                }
                            }
                        }

                        console.log(`[Cron API] Generated ${reviews.length} AI reviews for event "${event.name}"`);
                    }
                }
            } catch (error) {
                console.error(`[Cron API] Error processing books for event ${event.id}:`, error);
                // Continue with other events even if one fails
            }
        }

        return NextResponse.json({
            success: true,
            message: `Successfully saved ${dailyEvents.length} events (${todaysEvents.length} for today), found ${totalBooksFound} related books, and generated ${totalReviewsGenerated} AI reviews`,
            count: dailyEvents.length,
            todaysEventCount: todaysEvents.length,
            events: dailyEvents,
            relatedBooksFound: totalBooksFound,
            aiReviewsGenerated: totalReviewsGenerated,
        });
    } catch (error) {
        console.error("[Cron API] Error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
