import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

interface ApiKeyStatus {
  hasApiKey: boolean;
  isValid?: boolean;
  lastValidated?: string;
}

export function useApiKeyStatus() {
  const { getToken } = useAuth();
  const [status, setStatus] = useState<ApiKeyStatus>({ hasApiKey: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkApiKeyStatus = async () => {
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
  };

  useEffect(() => {
    checkApiKeyStatus();
  }, []);

  return {
    status,
    loading,
    error,
    refetch: checkApiKeyStatus,
  };
}
