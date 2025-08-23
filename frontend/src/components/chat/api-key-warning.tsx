import { AlertCircle, Settings } from "lucide-react";
import { SettingsDialog } from "../settings/settings-dialog";

interface ApiKeyWarningProps {
  className?: string;
}

export function ApiKeyWarning({ className = "" }: ApiKeyWarningProps) {
  return (
    <div
      className={`bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 md:p-4 ${className}`}
    >
      <div className="flex items-start gap-2 md:gap-3">
        <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-amber-500 dark:text-amber-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="text-amber-800 dark:text-amber-300 font-medium mb-1 text-sm md:text-base">
            API Key Required
          </h3>
          <p className="text-amber-700 dark:text-amber-400 text-xs md:text-sm mb-2 md:mb-3 leading-relaxed">
            You need to configure your Gemini API key to use the prompt
            optimization service. Get your free API key from Google AI Studio.
          </p>
          <SettingsDialog
            trigger={
              <button className="inline-flex items-center gap-1.5 md:gap-2 bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-md transition-colors text-xs md:text-sm">
                <Settings className="h-3 w-3 md:h-4 md:w-4" />
                Configure API Key
              </button>
            }
          />
        </div>
      </div>
    </div>
  );
}
