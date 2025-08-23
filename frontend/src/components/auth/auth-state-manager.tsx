import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useApiKeyStore } from "@/stores/apiKeyStore";

export function AuthStateManager() {
  const { isSignedIn } = useAuth();
  const clearStatus = useApiKeyStore((state) => state.clearStatus);

  useEffect(() => {
    // Clear API key store when user signs out
    if (!isSignedIn) {
      clearStatus();
    }
  }, [isSignedIn, clearStatus]);

  return null; // This component doesn't render anything
}
