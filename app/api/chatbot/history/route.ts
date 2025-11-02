import { NextRequest, NextResponse } from "next/server";
import {
  getOrCreateConversation,
  getConversationHistory,
} from "@/lib/repositories/chatHistory";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  try {
    // Get the current user session
    const session = await auth();
    const userId = session?.user?.id;

    // If user is not logged in, return empty history
    if (!userId) {
      return NextResponse.json({
        messages: [],
        conversationId: null,
      });
    }

    // Get or create conversation for the user
    const conversationId = await getOrCreateConversation(userId);

    // Get conversation history
    const messages = await getConversationHistory(conversationId, 50);

    return NextResponse.json({
      messages,
      conversationId,
    });
  } catch (error) {
    console.error("Error fetching conversation history:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch conversation history",
        messages: [],
        conversationId: null,
      },
      { status: 500 }
    );
  }
}
