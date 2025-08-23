import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface ApiKeyStatus {
  hasApiKey: boolean;
  lastValidated: string | null;
}

interface ApiKeyStore {
  // State
  status: ApiKeyStatus | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;

  // Actions
  setStatus: (status: ApiKeyStatus) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearStatus: () => void;

  // Helper methods
  isStale: () => boolean;
  shouldRefetch: () => boolean;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useApiKeyStore = create<ApiKeyStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      status: null,
      isLoading: false,
      error: null,
      lastFetched: null,

      // Actions
      setStatus: (status: ApiKeyStatus) =>
        set(
          {
            status,
            error: null,
            lastFetched: Date.now(),
          },
          false,
          "setStatus"
        ),

      setLoading: (isLoading: boolean) =>
        set({ isLoading }, false, "setLoading"),

      setError: (error: string | null) =>
        set({ error, isLoading: false }, false, "setError"),

      clearStatus: () =>
        set(
          {
            status: null,
            error: null,
            lastFetched: null,
            isLoading: false,
          },
          false,
          "clearStatus"
        ),

      // Helper methods
      isStale: () => {
        const { lastFetched } = get();
        if (!lastFetched) return true;
        return Date.now() - lastFetched > CACHE_DURATION;
      },

      shouldRefetch: () => {
        const { status, isLoading, isStale } = get();
        return (!status && !isLoading) || isStale();
      },
    }),
    {
      name: "api-key-store",
    }
  )
);
