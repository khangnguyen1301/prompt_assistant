import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// Types for the optimization request and response
interface OptimizeRequest {
  prompt: string;
  context?: string;
  style?: "professional" | "casual" | "technical" | "creative";
  targetAudience?: string;
}

interface OptimizedPrompt {
  goal: string;
  input: string;
  output: string;
  instructions: string[];
  notes: string[];
  rawText: string;
}

interface OptimizeResponse {
  success: boolean;
  optimizedPrompt: OptimizedPrompt;
  originalPrompt: string;
  processingTime: number;
  tokensUsed: number;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    let userId = "dev-user";
    let authToken = "";

    if (process.env.NODE_ENV !== "development") {
      const { userId: clerkUserId } = await auth();
      if (!clerkUserId) {
        return NextResponse.json(
          {
            error: "Unauthorized",
            message: "You must be logged in to use this service",
          },
          { status: 401 }
        );
      }
      userId = clerkUserId;
      // Get the token for backend authentication
      const { getToken } = await auth();
      authToken = (await getToken()) || "";
    }

    const startTime = Date.now();
    const body: OptimizeRequest = await request.json();

    if (
      !body.prompt ||
      typeof body.prompt !== "string" ||
      body.prompt.trim().length === 0
    ) {
      return NextResponse.json(
        {
          error: "Invalid input",
          message: "Prompt is required and must be a non-empty string",
        },
        { status: 400 }
      );
    }

    const { prompt, context, style = "professional", targetAudience } = body;

    // Call backend service to optimize prompt
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Only add Authorization header in production or if we have a token
    if (process.env.NODE_ENV !== "development" && authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${backendUrl}/api/prompts/generate`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        userInput: prompt, // Changed from originalPrompt to userInput
        options: {
          language: "vi",
          style: style,
          includeExamples: true,
        },
        conversationId: context ? undefined : undefined, // Will be implemented later
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error("Backend API error:", errorData);

      return NextResponse.json(
        {
          error: "Optimization failed",
          message:
            errorData?.message ||
            "Failed to optimize prompt. Please try again.",
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const processingTime = (Date.now() - startTime) / 1000;

    // Structure the response according to our frontend expectations
    const optimizedResponse: OptimizeResponse = {
      success: true,
      optimizedPrompt: {
        goal:
          data.optimizedPrompt?.goal ||
          "Optimize the user's request for better AI interaction",
        input: data.optimizedPrompt?.input || prompt,
        output:
          data.optimizedPrompt?.output ||
          "A well-structured response that meets the user's needs",
        instructions: data.optimizedPrompt?.instructions || [
          "Be specific and clear in your request",
          "Provide relevant context when necessary",
          "Define the expected output format",
          "Consider the target audience",
        ],
        notes: data.optimizedPrompt?.notes || [
          "This prompt has been optimized for clarity and effectiveness",
          "Adjust as needed based on specific use cases",
        ],
        rawText:
          data.optimizedPrompt?.rawText ||
          "Optimized prompt generated successfully",
      },
      originalPrompt: data.originalInput || prompt,
      processingTime: data.metadata?.processingTime || processingTime,
      tokensUsed: data.metadata?.tokensUsed || 0,
      message: "Prompt optimized successfully",
    };

    return NextResponse.json(optimizedResponse);
  } catch (error) {
    console.error("API Error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request",
      },
      { status: 500 }
    );
  }
}
