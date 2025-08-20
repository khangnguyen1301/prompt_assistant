import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

export function useConversations() {
  const { getToken, isLoaded, userId } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = async () => {
    if (!isLoaded || !userId) return;

    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/conversations`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch conversations");
      }

      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (err) {
      console.error("Error fetching conversations:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [isLoaded, userId]);

  const createConversation = async (title: string) => {
    if (!isLoaded || !userId) return null;

    try {
      const token = await getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/conversations`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create conversation");
      }

      const data = await response.json();
      const newConversation = data;

      setConversations((prev) => [newConversation, ...prev]);
      return newConversation;
    } catch (err) {
      console.error("Error creating conversation:", err);
      setError(
        err instanceof Error ? err.message : "Failed to create conversation"
      );
      return null;
    }
  };

  const updateConversation = async (
    id: string,
    updates: Partial<Conversation>
  ) => {
    if (!isLoaded || !userId) return null;

    try {
      const token = await getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/conversations/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update conversation");
      }

      const data = await response.json();
      const updatedConversation = data;

      setConversations((prev) =>
        prev
          .filter((conv) => conv.id)
          .map((conv) => (conv.id === id ? updatedConversation : conv))
      );
      return updatedConversation;
    } catch (err) {
      console.error("Error updating conversation:", err);
      setError(
        err instanceof Error ? err.message : "Failed to update conversation"
      );
      return null;
    }
  };

  const deleteConversation = async (id: string) => {
    if (!isLoaded || !userId) return false;

    try {
      const token = await getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/conversations/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete conversation");
      }

      setConversations((prev) => prev.filter((conv) => conv.id !== id));
      return true;
    } catch (err) {
      console.error("Error deleting conversation:", err);
      setError(
        err instanceof Error ? err.message : "Failed to delete conversation"
      );
      return false;
    }
  };

  return {
    conversations,
    loading,
    error,
    fetchConversations,
    createConversation,
    updateConversation,
    deleteConversation,
  };
}
