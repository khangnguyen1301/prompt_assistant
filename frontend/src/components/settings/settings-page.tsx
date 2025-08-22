import { useState, useEffect } from "react";
import {
  CheckCircle,
  AlertCircle,
  Settings,
  Key,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@clerk/nextjs";

interface ApiKeyStatus {
  hasApiKey: boolean;
  isValid?: boolean;
  lastValidated?: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
}

export function SettingsPage() {
  const { getToken } = useAuth();
  const [apiKey, setApiKey] = useState("");
  const [status, setStatus] = useState<ApiKeyStatus>({ hasApiKey: false });
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);

  // Load API key status on component mount
  useEffect(() => {
    loadApiKeyStatus();
  }, []);

  const loadApiKeyStatus = async () => {
    try {
      const token = await getToken();
      console.log("🔍 Token:", token ? "exists" : "null");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/settings/api-key/status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("🔍 Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("🔍 Response data:", data);
        setStatus(data);
      } else {
        const errorText = await response.text();
        console.error("🚨 API Error:", response.status, errorText);
      }
    } catch (error) {
      console.error("Failed to load API key status:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    setLoading(true);
    setMessage(null);

    try {
      const token = await getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/settings/api-key`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ apiKey }),
        }
      );

      const data: ApiResponse = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: data.message });
        setApiKey("");
        await loadApiKeyStatus();
      } else {
        setMessage({
          type: "error",
          text: data.message || "Failed to update API key",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async () => {
    setValidating(true);
    setMessage(null);

    try {
      const token = await getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/settings/api-key/validate`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      setMessage({
        type: data.isValid ? "success" : "error",
        text: data.message,
      });
      await loadApiKeyStatus();
    } catch (error) {
      setMessage({ type: "error", text: "Failed to validate API key" });
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="mx-auto p-3 max-w-2xl">
      <div className="bg-white border-gray-200 rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Key className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Gemini API Key</h2>
          </div>
          <p className="text-gray-600">
            Configure your personal Google Gemini API key to use the prompt
            optimization service.
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Current Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Current Status
            </label>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50">
              {status.hasApiKey ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-700">
                    API key configured
                  </span>
                  {status.lastValidated && (
                    <span className="text-xs text-gray-500 ml-auto">
                      Last updated:{" "}
                      {new Date(status.lastValidated).toLocaleString()}
                    </span>
                  )}
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <span className="text-sm text-amber-700">
                    No API key configured
                  </span>
                </>
              )}
            </div>
          </div>

          {/* API Key Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="apiKey"
                className="text-sm font-medium text-gray-700"
              >
                {status.hasApiKey ? "Update API Key" : "Enter API Key"}
              </label>
              <input
                id="apiKey"
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIza..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
              />
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  id="showApiKey"
                  checked={showApiKey}
                  onChange={(e) => setShowApiKey(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="showApiKey">Show API key</label>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading || !apiKey.trim()}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading
                  ? "Saving..."
                  : status.hasApiKey
                    ? "Update API Key"
                    : "Save API Key"}
              </button>

              {status.hasApiKey && (
                <button
                  type="button"
                  onClick={handleValidate}
                  disabled={validating}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {validating ? "Validating..." : "Test"}
                </button>
              )}
            </div>
          </form>

          {/* Get API Key Instructions */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              How to get your API key:
            </label>
            <div className="p-4 rounded-lg bg-blue-50 text-sm space-y-2 text-black">
              <p>
                1. Go to{" "}
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                  Google AI Studio <ExternalLink className="h-3 w-3" />
                </a>
              </p>
              <p>2. Sign in with your Google account</p>
              <p>3. Click "Create API Key" and select a project</p>
              <p>4. Copy the generated API key and paste it above</p>
              <p className="text-blue-700 font-medium">
                ⚠️ Keep your API key secure and never share it publicly.
              </p>
            </div>
          </div>

          {/* Messages */}
          {message && (
            <div
              className={`p-3 rounded-md ${
                message.type === "success"
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              <p
                className={`text-sm ${
                  message.type === "success" ? "text-green-700" : "text-red-700"
                }`}
              >
                {message.text}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
