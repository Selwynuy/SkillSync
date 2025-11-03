# Chatbot Conversation History Setup

This document outlines the changes made to add conversation history to the chatbot using Supabase.

## Database Changes

### Migration File
Location: `supabase/migrations/20250102_create_chat_tables.sql`

This migration creates:
1. `chat_conversations` table - Stores conversation metadata
2. `chat_messages` table - Stores individual messages
3. Indexes for better query performance
4. Row Level Security (RLS) policies
5. Trigger to auto-update conversation timestamps

### Running the Migration

To apply this migration to your Supabase database:

```bash
# If using Supabase CLI
supabase db push

# Or run the SQL file directly in your Supabase SQL Editor:
# 1. Go to your Supabase project dashboard
# 2. Navigate to SQL Editor
# 3. Copy and paste the contents of supabase/migrations/20250102_create_chat_tables.sql
# 4. Click "Run"
```

## Code Changes

### 1. Database Types (`lib/supabase/server.ts`)
Added TypeScript types for:
- `chat_conversations` table
- `chat_messages` table

### 2. Repository Functions (`lib/repositories/chatHistory.ts`)
Created helper functions:
- `getOrCreateConversation(userId)` - Gets or creates a conversation for a user
- `saveMessage(conversationId, role, content)` - Saves a message to the database
- `getConversationHistory(conversationId, limit)` - Retrieves conversation history
- `getUserConversations(userId)` - Gets all conversations for a user
- `deleteConversation(conversationId)` - Deletes a conversation

### 3. API Routes

#### `app/api/chatbot/route.ts`
- Added GET endpoint to fetch conversation history
- Updated POST endpoint to:
  - Accept `conversationId` parameter
  - Load conversation history for context
  - Save messages to database for logged-in users
  - Return `conversationId` in response

#### `app/api/chatbot/history/route.ts`
New endpoint that:
- Gets or creates a conversation when chatbot opens
- Returns conversation history
- Handles non-logged-in users gracefully

### 4. ChatBot Component (`components/chatbot/ChatBot.tsx`)
Updated to:
- Load conversation history when opened
- Send `conversationId` with each message
- Store and use `conversationId` from server response
- Maintain conversation state across sessions

## Features

### For Logged-in Users:
- Conversation history is automatically saved
- History is loaded when chatbot is opened
- AI has context from previous messages
- Conversations persist across sessions

### For Non-logged-in Users:
- Chatbot works normally
- No history is saved or loaded
- Fresh conversation each time

## Security

The implementation includes:
- Row Level Security (RLS) policies
- Users can only access their own conversations
- Auth checks in API routes
- Graceful handling of non-authenticated users

## Testing

1. **As a logged-in user:**
   - Open chatbot and send a message
   - Close and reopen chatbot
   - Verify your previous messages are loaded

2. **As a non-logged-in user:**
   - Open chatbot and send a message
   - Verify it works but doesn't persist

3. **Context awareness:**
   - Ask a follow-up question
   - Verify the AI remembers previous context

## Future Enhancements

Potential improvements:
- Multiple conversation threads per user
- Conversation titles/summaries
- Search through conversation history
- Export conversation history
- Delete specific conversations
- Message editing/deletion
