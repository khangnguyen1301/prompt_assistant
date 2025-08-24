"use client";

import { useRef, useEffect } from "react";
import { Send, Loader2, Settings } from "lucide-react";
import { Message } from "./chat-layout";
import { useApiKeyStatus } from "@/hooks/useApiKeyStatus";
import { ApiKeyWarning } from "./api-key-warning";
import { SettingsDialog } from "../settings/settings-dialog";
import { DarkModeToggle } from "../ui/dark-mode-toggle";

import { ChatInput } from "./chat-input";
import { MessageBubble } from "./message-bubble";
import { MessageSkeleton } from "@/components/ui/message-skeleton";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/stores";

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  messagesLoading?: boolean; // Add this for message history loading
  onSendMessage: (
    content: string,
    images?: string[],
    uploadedFileIds?: string[]
  ) => void;
  isNewConversation?: boolean; // Add this prop
}

export function ChatArea({
  messages,
  isLoading,
  messagesLoading = false,
  onSendMessage,
  isNewConversation = false,
}: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { status: apiKeyStatus, loading: apiKeyLoading } = useApiKeyStatus();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="relative flex flex-col h-full bg-white dark:bg-gray-900 transition-colors">
      {/* Header - Responsive */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 md:p-4 transition-colors">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1 ml-12 md:ml-0">
            <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white truncate">
              Prompt Optimization Chat
            </h2>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate">
              Transform your raw requests into optimized prompts
            </p>
          </div>
          <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
            {/* Dark Mode Toggle */}
            <DarkModeToggle />

            {/* Settings Button */}
            <SettingsDialog
              trigger={
                <div
                  className={cn(
                    "flex items-center gap-1 md:gap-3 p-1.5 md:p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                  )}
                >
                  <Settings
                    size={16}
                    className="md:w-5 md:h-5 text-gray-500 dark:text-gray-400"
                  />
                </div>
              }
            />
          </div>
        </div>
      </div>

      {/* Messages Area - Responsive */}
      <div className="flex-1 overflow-y-auto pt-2 md:pt-4 pb-36 md:mb-16 space-y-2 md:space-y-4 bg-gray-50 dark:bg-gray-900 px-2 md:px-4 lg:px-8 xl:px-16 2xl:px-32">
        {/* API Key Warning */}
        {!apiKeyLoading && !apiKeyStatus?.hasApiKey && <ApiKeyWarning />}

        {messagesLoading ? (
          // Show skeleton loading for message history
          <div className="space-y-4">
            <MessageSkeleton isUser={true} />
            <MessageSkeleton isUser={false} />
            <MessageSkeleton isUser={true} />
            <MessageSkeleton isUser={false} />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center mt-5">
            <div className="bg-blue-50 rounded-full p-6 mb-4">
              <Send className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Welcome to Prompt Assistant
            </h3>
            <p className="text-gray-600 dark:text-gray-300 max-w-md mb-6">
              Start by typing your raw request or idea. I'll help you transform
              it into a well-structured, optimized prompt for AI systems.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Example Input:
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  "Help me write a blog post about climate change"
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Optimized Output:
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Structured prompt with goal, context, format, and constraints
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages
              .filter((message) => message && message.id) // Filter out undefined/null messages
              .map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
            {isLoading && (
              <div className="flex items-center space-x-2 text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AI is optimizing your prompt...</span>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input - Responsive */}
      <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 p-2 md:p-4">
        <div className="max-w-4xl mx-auto">
          <ChatInput
            onSendMessage={onSendMessage}
            isLoading={isLoading}
            isNewConversation={isNewConversation}
            disabled={!apiKeyStatus?.hasApiKey}
          />
        </div>
      </div>
    </div>
  );
}
