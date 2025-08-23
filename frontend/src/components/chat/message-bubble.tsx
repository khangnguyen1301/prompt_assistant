"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Copy,
  Check,
  Clock,
  Zap,
  Target,
  ArrowRight,
  FileText,
  List,
  StickyNote,
  Paperclip,
} from "lucide-react";
import { Message } from "./chat-layout";
import { TypingText } from "@/components/ui/typing-text";
import { FileDisplay } from "./file-display";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const { user } = useUser();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  console.log("🚀 ~ MessageBubble ~ message:", message);
  if (message.role === "USER") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] bg-blue-600 dark:bg-blue-700 text-white rounded-lg p-4">
          {/* Files */}
          {message.uploadedFiles && message.uploadedFiles.length > 0 && (
            <div className="mb-3">
              <div className="space-y-2">
                {message.uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="bg-blue-700 dark:bg-blue-800 bg-opacity-50 rounded-lg p-2"
                  >
                    <FileDisplay
                      file={file}
                      isImage={file.mimeType.startsWith("image/")}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Images */}
          {message.images && message.images.length > 0 && (
            <div className="mb-3 grid grid-cols-2 gap-2">
              {message.images.map((image, index) => (
                <img
                  key={index}
                  src={`data:image/jpeg;base64,${image}`}
                  alt={`User upload ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-blue-400"
                />
              ))}
            </div>
          )}

          {/* Text content */}
          {message.content && (
            <div className="whitespace-pre-wrap break-words">
              {message.content}
            </div>
          )}

          <div className="text-xs text-blue-100 dark:text-blue-200 mt-2 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatTime(message.createdAt)}
          </div>
        </div>
      </div>
    );
  }

  // Assistant message with optimized prompt structure
  const { metadata } = message;
  const optimizedPrompt = metadata?.optimizedPrompt;

  return (
    <div className="flex justify-start">
      <div className="max-w-[90%] bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        {/* Header with metadata */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">
                Optimized Prompt
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                {metadata?.processingTime && (
                  <span>⚡ {metadata.processingTime / 1000}s</span>
                )}
                {metadata?.tokensUsed && (
                  <span>📊 {metadata.tokensUsed} tokens</span>
                )}
                <span>🕒 {formatTime(message.createdAt)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() =>
              copyToClipboard(optimizedPrompt?.rawText || message.content)
            }
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            )}
          </button>
        </div>

        {/* Optimized prompt structure */}
        {optimizedPrompt ? (
          <div className="p-4 space-y-4">
            {/* Raw optimized prompt */}
            {optimizedPrompt.rawText && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    Complete Optimized Prompt
                  </div>
                  <button
                    onClick={() => copyToClipboard(optimizedPrompt.rawText)}
                    className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1"
                  >
                    {copied ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    Copy
                  </button>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg p-3 font-mono text-sm">
                  <TypingText
                    text={optimizedPrompt.rawText || ""}
                    speed={5}
                    delay={2000}
                    className="whitespace-pre-wrap text-gray-800 dark:text-gray-200"
                    enableTyping={message.isNewMessage || false}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          // Fallback for simple message content
          <div className="p-4">
            <TypingText
              text={message.content || ""}
              speed={3}
              delay={0}
              className="whitespace-pre-wrap break-words text-gray-800 dark:text-gray-200"
              enableTyping={message.isNewMessage || false}
            />
          </div>
        )}
      </div>
    </div>
  );
}
