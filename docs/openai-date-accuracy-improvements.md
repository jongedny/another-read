# OpenAI Date Accuracy Improvements

## Problem Identified

The app was generating events with incorrect dates. For example, OpenAI created an event for J.R.R. Tolkien's birthday claiming he was born on January 1st, when his actual birthday is January 3rd.

### Root Causes

1. **Ambiguous Prompt**: The original prompt asked for events "for ${dateString}" (e.g., "for 25 December"), which OpenAI could interpret as:
   - Events that happen ON this date
   - Events ABOUT this date  
   - Events to celebrate AROUND this date

2. **Only Year Correction**: The code was correcting the year in returned dates but not validating the month/day, so if OpenAI returned the wrong date (Jan 1 instead of Jan 3), it would pass through uncorrected.

3. **No Date Verification Requirement**: The prompt didn't explicitly require OpenAI to verify the accuracy of dates for birthdays and historical events.

## Solutions Implemented

### 1. Enhanced Prompt with Explicit Date Requirements (`prompts.ts`)

Added a **"CRITICAL DATE ACCURACY REQUIREMENT"** section that:
- Explicitly states ALL events MUST have occurred on the EXACT date provided
- Provides specific examples (like the Tolkien birthday issue)
- Requires verification for birthdays, historical events, deaths, etc.
- Emphasizes "THIS EXACT DATE" throughout the event type list
- Specifies the exact ISO date that must be returned

### 2. Provide Full ISO Date to OpenAI (`openai.ts`)

- Now passes both the human-readable date ("25 December") AND the ISO date ("2025-12-25") to the prompt
- This removes ambiguity about which date we're asking for
- The prompt now explicitly tells OpenAI: "The date field in your response MUST be ${isoDate}"

### 3. Removed Automatic Date Correction (`openai.ts`)

- Removed the code that was automatically correcting the year
- Since we're now being explicit about the exact date we want, we should trust OpenAI's response
- If OpenAI returns the wrong date despite our explicit instructions, we want to catch that as a validation error rather than silently "fixing" it

## Expected Improvements

1. **Higher Accuracy**: OpenAI will now double-check facts before suggesting birthdays and historical events
2. **Exact Date Matching**: Events will only be suggested if they genuinely occurred on the specified date
3. **Better Validation**: By providing the exact ISO date we expect back, we can more easily validate responses
4. **Clearer Instructions**: The prompt now leaves no room for interpretation about what "for this date" means

## Testing Recommendations

1. **Test with Known Dates**: Try dates with famous birthdays (like January 3rd for Tolkien) to verify accuracy
2. **Check Historical Events**: Verify that suggested historical events actually occurred on the specified dates
3. **Monitor Logs**: Check the console logs to see what dates OpenAI is returning
4. **Database Review**: After running the cron job, review the events table to ensure dates are accurate

## Additional Considerations

If accuracy issues persist, you could also:
- Increase the temperature from 0.7 to 0.3 for more deterministic/factual responses
- Use a more capable model like `gpt-4o` instead of `gpt-4o-mini` (at higher cost)
- Add a post-processing validation step that checks dates against a known database of birthdays/events
- Implement a feedback mechanism to flag and correct inaccurate dates
