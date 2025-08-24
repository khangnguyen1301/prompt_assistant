import { useEffect, useState, useRef } from "react";
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
  const loadingRef = useRef(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 10; // Number of conversations per page

  const fetchConversations = async (
    pageNum: number = 1,
    append: boolean = false
  ) => {
    if (!isLoaded || !userId) return;

    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/conversations?page=${pageNum}&limit=${limit}`,
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
      const newConversations = data.conversations || [];
      const total = data.pagination.total || 0;

      setTotalCount(total);
      setHasMore(pageNum * limit < total);

      if (append) {
        setConversations((prev) => [...prev, ...newConversations]);
      } else {
        setConversations(newConversations);
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  const loadMoreConversations = async () => {
    // Kiểm tra cả loading state và ref để tránh race condition
    if (!hasMore || loading || loadingRef.current) {
      return;
    }

    // Set loading ref ngay lập tức để tránh duplicate calls
    loadingRef.current = true;

    const nextPage = page + 1;
    setPage(nextPage);

    try {
      await fetchConversations(nextPage, true);
    } finally {
      // Reset loading ref sau khi hoàn thành
      loadingRef.current = false;
    }
  };

  useEffect(() => {
    fetchConversations(1, false);
  }, []);

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
    hasMore,
    totalCount,
    loadMoreConversations,
    fetchConversations,
    createConversation,
    updateConversation,
    deleteConversation,
  };
}
