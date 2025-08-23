import { AlertCircle, Settings } from "lucide-react";
import { SettingsDialog } from "../settings/settings-dialog";

interface ApiKeyWarningProps {
  className?: string;
}

export function ApiKeyWarning({ className = "" }: ApiKeyWarningProps) {
  return (
    <div
      className={`bg-amber-50 border border-amber-200 rounded-lg p-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-amber-800 font-medium mb-1">API Key Required</h3>
          <p className="text-amber-700 text-sm mb-3">
            You need to configure your Gemini API key to use the prompt
            optimization service. Get your free API key from Google AI Studio.
          </p>
          <SettingsDialog
            trigger={
              <button className="inline-flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 transition-colors text-sm">
                <Settings className="h-4 w-4" />
                Configure API Key
              </button>
            }
          />
        </div>
      </div>
    </div>
  );
}
