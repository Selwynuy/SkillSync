# Gemini AI Integration for Career Rationales

This document explains how to set up and use Google's Gemini AI to generate personalized career match explanations in SkillSync.

## Why Use Gemini AI?

Instead of template-based explanations like:
> "This role is a strong match for you. Your analytical, creative strengths align well with what this career requires..."

Gemini generates natural, personalized explanations like:
> "Your strong analytical and creative thinking make you perfect for Software Development! You'll love solving complex problems and building innovative solutions. Plus, with salaries ranging from $70K-$120K and 22% job growth, it's a field with excellent opportunities."

## Setup Instructions

### 1. Get a Free Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

**Note**: Gemini offers a generous free tier:
- 15 requests per minute
- 1 million tokens per minute
- 1,500 requests per day
- Perfect for development and small-to-medium production use!

### 2. Add API Key to Your Environment

Add the following to your `.env.local` file:

```env
GEMINI_API_KEY=your-actual-api-key-here
```

**That's it!** The app will automatically detect the API key and use Gemini for rationales.

### 3. Verify It's Working

1. Complete an assessment
2. View your recommendations
3. Look for natural, conversational explanations (not template-based)
4. Check your terminal/console logs - you won't see "falling back to deterministic" messages

## How It Works

### Automatic Detection

The system automatically detects if `GEMINI_API_KEY` is set:
- **With API Key**: Uses Gemini AI for natural, personalized explanations
- **Without API Key**: Falls back to deterministic template-based explanations
- **On Error**: Gracefully falls back to deterministic if Gemini fails

### What Data is Sent to Gemini

For each career recommendation, we send:

```typescript
{
  // Career details
  title: "Software Developer",
  description: "Design, develop, and maintain software applications...",
  salaryRange: { min: 70000, max: 120000 },
  educationLevel: "Bachelor's Degree",
  growthRate: 22,
  tags: ["analytical", "creative", "problem-solving"],

  // Match analysis
  matchScore: 0.87, // 87% match
  keyDrivers: ["analytical_thinking", "creativity", "problem_solving"],
  topTraits: {
    analytical_thinking: 0.92,
    creativity: 0.85,
    problem_solving: 0.88,
    attention_to_detail: 0.79,
    teamwork: 0.74
  }
}
```

### The Prompt

Gemini receives a carefully crafted prompt that:
1. Sets context (friendly career advisor)
2. Provides all career and match details
3. Requests 2-3 sentence explanation (max 150 words)
4. Emphasizes natural, conversational tone
5. Focuses on strengths alignment, personality fit, and practical benefits

### Model Used

We use **Gemini 1.5 Flash** because it:
- Is completely free (generous limits)
- Generates fast responses (~1-2 seconds)
- Produces high-quality, natural text
- Perfect for this use case

## Cost Considerations

### Free Tier Limits (More than Enough!)

- **15 requests/minute**: Can generate 15 career rationales per minute
- **1,500 requests/day**: Enough for 300 users getting 5 recommendations each
- **No credit card required**

### Typical Usage

- Average user: 5 recommendations = 5 API calls
- Medium traffic (100 users/day): 500 API calls/day
- **Well within free tier limits!**

### Fallback Behavior

If you hit rate limits or API errors:
- System automatically falls back to deterministic explanations
- Users still get great recommendations
- No errors shown to users
- Logged in server console for monitoring

## Testing

### Test Without API Key

1. Don't set `GEMINI_API_KEY` in `.env.local`
2. Complete assessment and view recommendations
3. You'll see template-based explanations
4. Check console for: "falling back to deterministic"

### Test With API Key

1. Add your `GEMINI_API_KEY` to `.env.local`
2. Restart your dev server
3. Complete assessment and view recommendations
4. You'll see natural, AI-generated explanations
5. Each explanation will be unique and personalized

### Test Error Handling

1. Set an invalid API key
2. System will log error and fall back gracefully
3. Users will see deterministic explanations (still works!)

## Example Outputs

### Deterministic (Template-Based)

> "This role is a strong match for you. Your analytical thinking, creativity strengths align well with what this career requires. Software Developer roles typically offer $70K - $120K and typically require Bachelor's Degree level education. This field is experiencing strong growth (22% projected), creating good opportunities for career advancement. Your analytical mindset will help you excel in problem-solving aspects of this role."

### Gemini AI (Natural)

> "Your strong analytical and creative thinking make you a natural fit for software development! You'll thrive in an environment where you can solve complex problems and build innovative solutions. With excellent salaries ($70K-$120K) and 22% job growth, this field offers both financial stability and exciting opportunities for advancement."

## Monitoring

### Development

Watch your terminal/console for:
```
✓ Generated AI rationale for Software Developer
✗ Error generating LLM rationale, falling back to deterministic
```

### Production

Consider adding monitoring for:
- API success/failure rates
- Response times
- Fallback frequency
- Rate limit approaches

## Advanced Configuration

### Using a Different Model

Edit `lib/recommendations/rationale.ts`:

```typescript
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro" // More capable but slower/costlier
});
```

### Adjusting Temperature

For more creative/varied responses:

```typescript
const result = await model.generateContent({
  contents: [{ role: 'user', parts: [{ text: prompt }] }],
  generationConfig: {
    temperature: 0.9, // 0.0 = deterministic, 1.0 = creative
    maxOutputTokens: 200,
  }
});
```

### Batch Processing

For generating many rationales at once, the system already uses `Promise.all()` for concurrent generation:

```typescript
// Generates all 5 rationales concurrently
const recommendations = await generateRecommendationsForUser(userId, 5);
```

## Troubleshooting

### "GEMINI_API_KEY not configured" Error

- Make sure you added `GEMINI_API_KEY` to `.env.local`
- Restart your development server
- Check for typos in the environment variable name

### Rate Limit Errors

- Free tier: 15 requests/minute, 1500/day
- System automatically falls back to deterministic
- Consider caching recommendations if needed

### Poor Quality Responses

- Check your prompt in `rationale.ts`
- Ensure all data is being passed correctly
- Try adjusting temperature (0.7 is balanced)

### API Key Not Working

- Verify key is correct at [Google AI Studio](https://aistudio.google.com/app/apikey)
- Check if API is enabled for your project
- Ensure you're not using a restricted key

## Security

### Best Practices

✅ **DO:**
- Store API key in `.env.local` (never in code)
- Add `.env.local` to `.gitignore` (already done)
- Use server-side API calls only
- Monitor usage and set up alerts

❌ **DON'T:**
- Commit API keys to version control
- Expose keys in client-side code
- Share keys publicly
- Use the same key across projects

### User Privacy

The system sends:
- Career details (public information)
- Match scores (calculated data)
- User's trait scores (anonymous numbers)

It **does NOT** send:
- User's name or email
- Personal information
- Assessment answers
- Any identifiable data

## Support

Need help?
- Gemini API Docs: https://ai.google.dev/docs
- Google AI Studio: https://aistudio.google.com
- SkillSync Issues: https://github.com/yourusername/skillsync/issues
