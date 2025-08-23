import { useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { useApiKeyStore } from "@/stores/apiKeyStore";

export function useUpdateApiKey() {
  const { getToken } = useAuth();
  const { setStatus, setError } = useApiKeyStore();
  const [isUpdating, setIsUpdating] = useState(false);

  const updateApiKey = useCallback(
    async (apiKey: string) => {
      try {
        setIsUpdating(true);
        setError(null);

        const token = await getToken();
        const response = await fetch("/api/settings/api-key", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ apiKey }),
        });

        if (response.ok) {
          // Update the store with new status
          setStatus({
            hasApiKey: true,
            lastValidated: new Date().toISOString(),
          });
          return { success: true };
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to update API key");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Network error";
        setError(errorMessage);
        throw err;
      } finally {
        setIsUpdating(false);
      }
    },
    [getToken, setStatus, setError]
  );

  return {
    updateApiKey,
    isUpdating,
  };
}
