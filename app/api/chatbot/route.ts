import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAllJobPaths } from "@/lib/repositories/jobPaths";
import { getAllSHSTracks } from "@/lib/repositories/shsTracks";
import { getAllColleges } from "@/lib/repositories/colleges";
import { getAllScholarships } from "@/lib/repositories/scholarships";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

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
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

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

Available Data:
${context}

Remember: You're helping Grade 10 students make important life decisions. Be supportive, clear, and helpful!`;

    const prompt = `${systemPrompt}\n\nStudent's question: ${message}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return NextResponse.json({
      response: text.trim(),
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
