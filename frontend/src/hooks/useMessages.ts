import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  conversationId: string;
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
      setMessages([]);
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
      setMessages(data.messages || []);
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
    role: "user" | "assistant" = "user",
    metadata?: any
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
          }),
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();
      const newMessage = data.message;
      console.log("🚀 ~ sendMessage ~ newMessage:", newMessage);

      setMessages((prev) => [...prev, newMessage]);
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
    clearMessages,
  };
}
