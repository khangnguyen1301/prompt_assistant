import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

export interface Message {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  images?: string[]; // Add images support (base64)
  uploadedFiles?: {
    id: string;
    geminiFileId: string;
    originalName: string;
    displayName: string;
    mimeType: string;
    sizeBytes: number;
    uri: string;
    createdAt: string;
  }[]; // Updated to match backend response
  createdAt: string;
  conversationId: string;
  isNewMessage?: boolean; // Flag để kiểm tra tin nhắn mới
  metadata?: {
    optimizedPrompt?: {
      goal: string;
      input: string;
      output: string;
      instructions: string[];
      notes: string[];
      rawText: string;
    };
    processingTime?: number;
    tokensUsed?: number;
  };
}

export function useMessages(conversationId: string | null) {
  const { getToken, isLoaded, userId } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = async () => {
    if (!isLoaded || !userId || !conversationId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/messages/conversation/${conversationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }

      const data = await response.json();
      conversationId &&
        data.messages.length > 0 &&
        setMessages((prev) => [...prev, ...(data.messages || [])]);
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [conversationId, isLoaded, userId]);

  const sendMessage = async (
    content: string,
    currentConversationId?: string,
    role: "USER" | "ASSISTANT" = "USER",
    metadata?: any,
    images?: string[],
    fileUris?: string[]
  ) => {
    if (!isLoaded || !userId) return null;

    try {
      const token = await getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content,
            role: role.toUpperCase(), // Convert to uppercase for backend enum
            conversationId: currentConversationId || conversationId,
            metadata,
            images,
            fileUris,
          }),
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();
      const newMessage = data;
      return newMessage;
    } catch (err) {
      console.error("Error sending message:", err);
      setError(err instanceof Error ? err.message : "Failed to send message");
      return null;
    }
  };

  const addMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);
  };

  const updateMessage = (messageId: string, updates: Partial<Message>) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, ...updates } : msg))
    );
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return {
    messages,
    loading,
    error,
    fetchMessages,
    sendMessage,
    addMessage,
    updateMessage,
    clearMessages,
  };
}
