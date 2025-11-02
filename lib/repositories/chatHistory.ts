import { supabaseAdmin } from "@/lib/supabase/server";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface ChatConversation {
  id: string;
  user_id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Get or create a conversation for a user
 * Returns the most recent active conversation or creates a new one
 */
export async function getOrCreateConversation(userId: string): Promise<string> {
  try {
    // Try to get the most recent conversation
    const { data: existingConversations, error: fetchError } = await supabaseAdmin
      .from("chat_conversations")
      .select("id")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error("Error fetching conversation:", fetchError);
      throw fetchError;
    }

    // If a conversation exists, return it
    if (existingConversations && existingConversations.length > 0) {
      return existingConversations[0].id;
    }

    // Otherwise, create a new conversation
    const { data: newConversation, error: createError } = await supabaseAdmin
      .from("chat_conversations")
      .insert({
        user_id: userId,
        title: "Career Guidance Chat",
      })
      .select("id")
      .single();

    if (createError) {
      console.error("Error creating conversation:", createError);
      throw createError;
    }

    return newConversation.id;
  } catch (error) {
    console.error("Error in getOrCreateConversation:", error);
    throw error;
  }
}

/**
 * Save a message to the database
 */
export async function saveMessage(
  conversationId: string,
  role: "user" | "assistant",
  content: string
): Promise<ChatMessage> {
  try {
    const { data, error } = await supabaseAdmin
      .from("chat_messages")
      .insert({
        conversation_id: conversationId,
        role,
        content,
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving message:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in saveMessage:", error);
    throw error;
  }
}

/**
 * Get conversation history for a user
 * Returns messages ordered by creation time
 */
export async function getConversationHistory(
  conversationId: string,
  limit: number = 50
): Promise<ChatMessage[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("chat_messages")
      .select("id, role, content, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(limit);

    if (error) {
      console.error("Error fetching conversation history:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error in getConversationHistory:", error);
    throw error;
  }
}

/**
 * Get all conversations for a user
 */
export async function getUserConversations(
  userId: string
): Promise<ChatConversation[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("chat_conversations")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching user conversations:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error in getUserConversations:", error);
    throw error;
  }
}

/**
 * Delete a conversation and all its messages
 */
export async function deleteConversation(conversationId: string): Promise<void> {
  try {
    const { error } = await supabaseAdmin
      .from("chat_conversations")
      .delete()
      .eq("id", conversationId);

    if (error) {
      console.error("Error deleting conversation:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in deleteConversation:", error);
    throw error;
  }
}
