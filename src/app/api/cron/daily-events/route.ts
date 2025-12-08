import { NextRequest, NextResponse } from "next/server";
import { fetchDailyUKEvents } from "~/server/services/openai";
import { db } from "~/server/db";
import { events } from "~/server/db/schema";
import { env } from "~/env";

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
        }));
        await db.insert(events).values(values);

        console.log(`[Cron API] Successfully saved ${dailyEvents.length} events:`, dailyEvents);

        return NextResponse.json({
            success: true,
            message: `Successfully saved ${dailyEvents.length} events`,
            count: dailyEvents.length,
            events: dailyEvents,
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
