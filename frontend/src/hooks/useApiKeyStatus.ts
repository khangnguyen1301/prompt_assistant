import { useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { useApiKeyStore } from "@/stores/apiKeyStore";

interface ApiKeyStatus {
  hasApiKey: boolean;
  isValid?: boolean;
  lastValidated?: string;
}

export function useApiKeyStatus() {
  const { getToken } = useAuth();
  const {
    status,
    isLoading,
    error,
    setStatus,
    setLoading,
    setError,
    shouldRefetch,
  } = useApiKeyStore();

  const checkApiKeyStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/settings/api-key/status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      } else {
        setError("Failed to check API key status");
      }
    } catch (err) {
      setError("Network error");
      console.error("Error checking API key status:", err);
    } finally {
      setLoading(false);
    }
  }, [getToken, setStatus, setLoading, setError]);

  useEffect(() => {
    // Only fetch if we should refetch (no data or stale data)
    if (shouldRefetch()) {
      checkApiKeyStatus();
    }
  }, [checkApiKeyStatus, shouldRefetch]);

  return {
    status,
    loading: isLoading,
    error,
    refetch: checkApiKeyStatus,
  };
}
