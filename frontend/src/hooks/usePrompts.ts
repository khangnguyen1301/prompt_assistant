import { useState } from "react";
import { useAuth } from "@clerk/nextjs";

export interface OptimizePromptRequest {
  userInput: string;
  images?: string[]; // Add images support (base64)
  fileUris?: Array<{ uri: string; mimeType: string }>; // Add file URIs support
  options?: {
    language?: string;
    style?: string;
    includeExamples?: boolean;
  };
  conversationId?: string;
}

export interface OptimizedPrompt {
  goal: string;
  input: string;
  output: string;
  instructions: string[];
  notes: string[];
  rawText: string;
}

export interface OptimizeResponse {
  success: boolean;
  optimizedPrompt: OptimizedPrompt;
  originalInput: string;
  metadata?: {
    processingTime?: number;
    tokensUsed?: number;
  };
}

export function usePrompts() {
  const { getToken, isLoaded, userId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const optimizePrompt = async (
    request: OptimizePromptRequest
  ): Promise<OptimizeResponse | null> => {
    if (!isLoaded || !userId) {
      setError("Authentication required");
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/prompts/generate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to optimize prompt");
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error("Error optimizing prompt:", err);
      setError(
        err instanceof Error ? err.message : "Failed to optimize prompt"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getPromptHistory = async (page = 1, limit = 20) => {
    if (!isLoaded || !userId) {
      setError("Authentication required");
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/prompts/history?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to fetch prompt history");
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error("Error fetching prompt history:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch prompt history"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    optimizePrompt,
    getPromptHistory,
    loading,
    error,
  };
}
