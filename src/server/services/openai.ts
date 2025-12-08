import OpenAI from "openai";
import { env } from "~/env";

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: env.OPENAI_API_KEY,
});

export interface DailyEvent {
    name: string;
    keywords: string[];
    description: string;
    date: string;
}

/**
 * Fetches daily UK events from OpenAI API
 * @returns Array of event objects with name, keywords, and description
 */
export async function fetchDailyUKEvents(): Promise<DailyEvent[]> {
    const today = new Date();
    const dateString = today.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
    });

    const prompt = `Suggest up to 4 events, celebrations, or awareness days that are observed or could be celebrated in the United Kingdom on ${dateString}. 

These can include:
- Major holidays (e.g., Christmas Day on 25th December)
- National awareness days (e.g., National Dog Day on 26th August)
- Historical commemorations
- Seasonal celebrations
- International days observed in the UK

If there are no major well-known events on this specific date, suggest relevant seasonal events, awareness days, or historical events that occurred on this date.

For each event, provide:
1. name: The event name
2. keywords: An array of 3-5 relevant keywords related to the event
3. description: A brief description of the event (maximum 200 words)

Please respond with ONLY a JSON array of objects in this exact format:
[
  {
    "name": "Event Name 1",
    "keywords": ["keyword1", "keyword2", "keyword3"],
    "description": "A brief description of the event..."
  }
]

Do not include any other text or explanation. Always provide at least 1-2 events.`;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content:
                        "You are a helpful assistant that provides information about UK events and celebrations. Always respond with valid JSON arrays only.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.7,
            max_tokens: 500,
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) {
            throw new Error("No response from OpenAI");
        }

        console.log(`[OpenAI Service] Raw response:`, content);

        // Parse the JSON response
        const events = JSON.parse(content.trim()) as DailyEvent[];

        // Validate that we got an array of objects
        if (!Array.isArray(events)) {
            throw new Error("OpenAI response is not an array");
        }

        // Filter and validate event objects, limit to 4 events
        const validEvents = events
            .filter((event) => {
                return (
                    typeof event === "object" &&
                    event !== null &&
                    typeof event.name === "string" &&
                    event.name.length > 0 &&
                    Array.isArray(event.keywords) &&
                    event.keywords.length > 0 &&
                    typeof event.description === "string" &&
                    event.description.length > 0
                );
            })
            .slice(0, 4);

        console.log(`[OpenAI Service] Fetched ${validEvents.length} events for ${dateString}:`, validEvents);

        return validEvents;
    } catch (error) {
        console.error("[OpenAI Service] Error fetching events:", error);
        throw new Error(
            `Failed to fetch events from OpenAI: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
    }
}
