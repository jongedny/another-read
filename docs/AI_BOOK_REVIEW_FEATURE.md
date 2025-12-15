# AI Book Review Feature

## Summary

This feature adds automated AI-powered review and scoring of book recommendations for events. When the daily cron job creates new events and finds related books, OpenAI now evaluates how well each book matches the event.

## What Was Added

### 1. Database Schema Changes
**File:** `src/server/db/schema.ts`

Added two new fields to the `eventBooks` table:
- `aiScore` (integer): AI-generated score from 0-10 (10 = best recommendation)
- `aiExplanation` (text): Short explanation (max 100 words) of the score

### 2. New OpenAI Prompt Configuration
**File:** `src/server/config/prompts.ts`

Added `bookReview` configuration with:
- **Model**: `gpt-4o-mini`
- **Temperature**: `0.3` (lower for consistent scoring)
- **Max Tokens**: `2000`
- **System Message**: Defines AI as a critical book reviewer
- **User Prompt**: Asks AI to judge book-event relevance with scores and explanations

The prompt instructs the AI to:
- Score each book from 0-10
- Provide constructive criticism
- Consider theme alignment and reader interest
- Explain decisions in max 100 words

### 3. New OpenAI Service Function
**File:** `src/server/services/openai.ts`

Added `reviewBookRecommendations()` function that:
- Accepts event name and up to 20 books
- Formats book information for AI review
- Calls OpenAI API with the review prompt
- Validates and returns scores and explanations
- Tracks credit usage if userId provided
- Returns `BookReview[]` interface with:
  - `bookTitle`: string
  - `score`: number (0-10)
  - `explanation`: string

### 4. Enhanced Cron Job
**File:** `src/app/api/cron/daily-events/route.ts`

Updated the daily events cron job to:
1. Create events from OpenAI
2. Find related books for each event
3. **NEW**: Get AI reviews for the related books
4. **NEW**: Store scores and explanations in database
5. Return summary including `aiReviewsGenerated` count

The process:
- After finding books, fetches their full details
- Sends up to 20 books to `reviewBookRecommendations()`
- Matches returned reviews to books by title
- Updates `eventBooks` records with `aiScore` and `aiExplanation`

### 5. Updated Documentation
**File:** `docs/PROMPTS.md`

Added comprehensive documentation for the Book Review prompt including:
- Purpose and usage
- Customizable parameters
- What it does
- Example customization
- Storage location in database

## How It Works

### Daily Workflow:
1. **6 AM Cron Job Runs**
2. OpenAI generates 4 UK events for the day
3. Events saved to database
4. For each event:
   - Algorithm finds up to 10 related books
   - Books saved to `eventBooks` table with `matchScore`
   - **AI reviews the books** (new step)
   - Reviews saved as `aiScore` and `aiExplanation`

### AI Review Process:
```
Event: "World Book Day"
Books: [
  "Harry Potter and the Philosopher's Stone" by J.K. Rowling
  "The Very Hungry Caterpillar" by Eric Carle
  ...
]

↓ Send to OpenAI ↓

AI Response: [
  {
    bookTitle: "Harry Potter and the Philosopher's Stone",
    score: 9,
    explanation: "Excellent recommendation. This beloved children's classic perfectly embodies the spirit of World Book Day, encouraging young readers to discover the magic of literature. Its universal appeal and cultural significance make it an ideal choice for celebrating reading."
  },
  ...
]

↓ Store in Database ↓

eventBooks table updated with aiScore and aiExplanation
```

## Database Migration

A new migration was created and applied:
- **File**: `drizzle/0001_wandering_wolverine.sql`
- **Changes**: Added `ai_score` and `ai_explanation` columns to `Another Read_event_book` table

## Benefits

1. **Quality Control**: AI provides objective assessment of book-event matches
2. **Transparency**: Explanations help understand why books were recommended
3. **Improvement**: Scores can be used to filter or sort recommendations
4. **Insights**: Explanations provide context for content creators
5. **Automated**: No manual review needed, runs automatically daily

## Future Enhancements

Potential uses for the AI scores and explanations:
- Display scores on the Books page when filtered by event
- Filter books by minimum AI score (e.g., only show 7+ rated books)
- Use explanations in generated content/blog posts
- Track AI scoring accuracy over time
- Allow users to agree/disagree with AI assessments

## Credit Usage

The book review feature uses OpenAI credits:
- Operation type: `"book_review"`
- Tracked in `creditUsage` table
- Metadata includes: model, tokens, eventId, eventName, booksReviewed count

## Customization

To modify the AI review behavior, edit `src/server/config/prompts.ts`:

```typescript
bookReview: {
    temperature: 0.5, // Increase for more varied scoring
    
    systemMessage: "You are an expert librarian...", // Change AI personality
    
    userPrompt: (eventName, booksInfo) => 
        `Your custom prompt here...`, // Modify instructions
}
```

See `docs/PROMPTS.md` for detailed customization guide.

## Technical Notes

- Maximum 20 books reviewed per event (as requested)
- Reviews happen synchronously in cron job
- Failures in review don't prevent event creation
- Book matching by title (exact match required)
- Lower temperature (0.3) ensures consistent scoring
- Explanations limited to 100 words per prompt instruction
