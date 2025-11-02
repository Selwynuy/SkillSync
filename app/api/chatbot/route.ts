import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAllJobPaths } from "@/lib/repositories/jobPaths";
import { getAllSHSTracks } from "@/lib/repositories/shsTracks";
import { getAllColleges } from "@/lib/repositories/colleges";
import { getAllScholarships } from "@/lib/repositories/scholarships";
import {
  getOrCreateConversation,
  saveMessage,
  getConversationHistory,
} from "@/lib/repositories/chatHistory";
import { auth } from "@/auth";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function GET(request: NextRequest) {
  try {
    // Get the current user session
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the conversation ID from query params
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return NextResponse.json(
        { error: "Conversation ID is required" },
        { status: 400 }
      );
    }

    // Get conversation history
    const history = await getConversationHistory(conversationId, 50);

    return NextResponse.json({
      messages: history,
    });
  } catch (error) {
    console.error("Error fetching conversation history:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversation history" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, conversationId: clientConversationId } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Get the current user session
    const session = await auth();
    const userId = session?.user?.id;

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          response:
            "I'm sorry, but the AI service is not configured right now. Please contact support for help with your career questions! 😊",
        },
        { status: 200 }
      );
    }

    // Get or create conversation for logged-in users
    let conversationId = clientConversationId;
    if (userId && !conversationId) {
      conversationId = await getOrCreateConversation(userId);
    }

    // Get conversation history for context (only for logged-in users)
    let conversationHistory: any[] = [];
    if (userId && conversationId) {
      const history = await getConversationHistory(conversationId, 20);
      conversationHistory = history.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));
    }

    // Fetch all website data for context
    const [jobPaths, shsTracks, colleges, scholarships] = await Promise.all([
      getAllJobPaths(),
      getAllSHSTracks(),
      getAllColleges(),
      getAllScholarships(),
    ]);

    // Build context for the AI
    const context = buildContext(jobPaths, shsTracks, colleges, scholarships);

    // Generate response using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemPrompt = `You are a friendly and helpful career advisor chatbot for SkillSync, a platform that helps Grade 10 students in the Philippines choose their career paths, SHS strands, colleges, and scholarships.

Your personality:
- Warm, encouraging, and relatable to teenagers
- Use emojis occasionally to be friendly 😊
- Keep responses SHORT (2-4 sentences max)
- Be precise and actionable
- Speak like a supportive older friend or mentor
- Use simple language that Grade 10 students can understand

Your knowledge is LIMITED to the SkillSync platform data provided below. You can ONLY answer questions about:
- Career paths available in our system
- SHS (Senior High School) strands and tracks
- Colleges and their programs
- Available scholarships
- How to use SkillSync features

IMPORTANT RULES:
1. Keep answers under 100 words
2. If asked about something not in the data, politely say you can only help with careers, strands, colleges, and scholarships available on SkillSync
3. Always be encouraging and positive
4. If relevant, suggest they take the assessment or explore specific features
5. Don't make up information - only use the data provided below
6. Be aware of previous conversation context and refer back to it when relevant

Available Data:
${context}

Remember: You're helping Grade 10 students make important life decisions. Be supportive, clear, and helpful!`;

    // Build conversation context with history
    let fullPrompt = systemPrompt;
    if (conversationHistory.length > 0) {
      fullPrompt += "\n\nPrevious conversation:\n";
      conversationHistory.forEach((msg) => {
        fullPrompt += `${msg.role === "user" ? "Student" : "You"}: ${msg.content}\n`;
      });
    }
    fullPrompt += `\n\nStudent's question: ${message}`;

    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const text = response.text();

    // Save messages to database for logged-in users
    if (userId && conversationId) {
      await saveMessage(conversationId, "user", message);
      await saveMessage(conversationId, "assistant", text.trim());
    }

    return NextResponse.json({
      response: text.trim(),
      conversationId: conversationId,
    });
  } catch (error) {
    console.error("Chatbot error:", error);

    // Return a friendly error message
    return NextResponse.json(
      {
        response:
          "Oops! I'm having a little trouble right now. 😅 Could you try asking your question again? If it keeps happening, maybe try rephrasing it!",
      },
      { status: 200 }
    );
  }
}

function buildContext(
  jobPaths: any[],
  shsTracks: any[],
  colleges: any[],
  scholarships: any[]
): string {
  let context = "";

  // Career Paths Summary
  context += "CAREER PATHS:\n";
  jobPaths.slice(0, 20).forEach((job) => {
    context += `- ${job.title} (${job.category}): ${job.description.substring(0, 100)}... Education: ${job.educationLevel}, Salary: $${job.salaryRange.min}-$${job.salaryRange.max}\n`;
  });

  // SHS Tracks Summary
  context += "\n\nSHS TRACKS/STRANDS:\n";
  shsTracks.forEach((track) => {
    context += `- ${track.title}: ${track.description.substring(0, 150)}...\n`;
    context += `  Core subjects: ${track.coreSubjects.slice(0, 3).join(", ")}\n`;
    context += `  College programs: ${track.collegePrograms.slice(0, 3).join(", ")}\n`;
  });

  // Colleges Summary
  context += "\n\nCOLLEGES:\n";
  colleges.slice(0, 15).forEach((college) => {
    context += `- ${college.name} (${college.location}): Programs: ${college.programs.slice(0, 5).join(", ")}\n`;
  });

  // Scholarships Summary
  context += "\n\nSCHOLARSHIPS:\n";
  scholarships.slice(0, 10).forEach((scholarship) => {
    context += `- ${scholarship.name} (${scholarship.type}): $${scholarship.amount}, Provider: ${scholarship.provider}\n`;
  });

  return context;
}
