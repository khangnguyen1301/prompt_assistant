"use client";

import { useState } from "react";
import {
  Copy,
  Check,
  Clock,
  Zap,
  Target,
  FileText,
  List,
  StickyNote,
} from "lucide-react";
import { Message } from "./chat-layout";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
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

  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] bg-blue-600 text-white rounded-lg p-4">
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>
          <div className="text-xs text-blue-100 mt-2 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatTime(message.timestamp)}
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
      <div className="max-w-[90%] bg-white rounded-lg border border-gray-200 shadow-sm">
        {/* Header with metadata */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-medium text-gray-900">Optimized Prompt</div>
              <div className="text-xs text-gray-500 flex items-center gap-2">
                {metadata?.processingTime && (
                  <span>⚡ {metadata.processingTime}s</span>
                )}
                {metadata?.tokensUsed && (
                  <span>📊 {metadata.tokensUsed} tokens</span>
                )}
                <span>🕒 {formatTime(message.timestamp)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() =>
              copyToClipboard(optimizedPrompt?.rawText || message.content)
            }
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4 text-gray-500" />
            )}
          </button>
        </div>

        {/* Optimized prompt structure */}
        {optimizedPrompt ? (
          <div className="p-4 space-y-4">
            {/* Goal */}
            {optimizedPrompt.goal && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Target className="w-4 h-4 text-green-600" />
                  Goal
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-800">{optimizedPrompt.goal}</p>
                </div>
              </div>
            )}

            {/* Input */}
            {optimizedPrompt.input && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Input
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-blue-800">{optimizedPrompt.input}</p>
                </div>
              </div>
            )}

            {/* Output */}
            {optimizedPrompt.output && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <FileText className="w-4 h-4 text-purple-600" />
                  Expected Output
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <p className="text-purple-800">{optimizedPrompt.output}</p>
                </div>
              </div>
            )}

            {/* Instructions */}
            {optimizedPrompt.instructions &&
              optimizedPrompt.instructions.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <List className="w-4 h-4 text-orange-600" />
                    Instructions
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <ul className="space-y-1 text-orange-800">
                      {optimizedPrompt.instructions.map(
                        (instruction, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-orange-400 mt-1">•</span>
                            <span>{instruction}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
              )}

            {/* Notes */}
            {optimizedPrompt.notes && optimizedPrompt.notes.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <StickyNote className="w-4 h-4 text-yellow-600" />
                  Additional Notes
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <ul className="space-y-1 text-yellow-800">
                    {optimizedPrompt.notes.map((note, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-yellow-400 mt-1">•</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Raw optimized prompt */}
            {optimizedPrompt.rawText && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <FileText className="w-4 h-4 text-gray-600" />
                    Complete Optimized Prompt
                  </div>
                  <button
                    onClick={() => copyToClipboard(optimizedPrompt.rawText)}
                    className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                  >
                    {copied ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    Copy
                  </button>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 font-mono text-sm">
                  <pre className="whitespace-pre-wrap text-gray-800">
                    {optimizedPrompt.rawText}
                  </pre>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Fallback for simple message content
          <div className="p-4">
            <div className="whitespace-pre-wrap break-words text-gray-800">
              {message.content}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
