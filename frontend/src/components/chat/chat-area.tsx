"use client";

import { useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { Message } from "./chat-layout";

import { ChatInput } from "./chat-input";
import { MessageBubble } from "./message-bubble";
import { MessageSkeleton } from "@/components/ui/message-skeleton";

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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Prompt Optimization Chat
            </h2>
            <p className="text-sm text-gray-500">
              Transform your raw requests into optimized prompts
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">AI Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messagesLoading ? (
          // Show skeleton loading for message history
          <div className="space-y-4">
            <MessageSkeleton isUser={true} />
            <MessageSkeleton isUser={false} />
            <MessageSkeleton isUser={true} />
            <MessageSkeleton isUser={false} />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-blue-50 rounded-full p-6 mb-4">
              <Send className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Welcome to Prompt Assistant
            </h3>
            <p className="text-gray-600 max-w-md mb-6">
              Start by typing your raw request or idea. I'll help you transform
              it into a well-structured, optimized prompt for AI systems.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">
                  Example Input:
                </h4>
                <p className="text-sm text-gray-600">
                  "Help me write a blog post about climate change"
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">
                  Optimized Output:
                </h4>
                <p className="text-sm text-gray-600">
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

      {/* Chat Input */}
      <ChatInput
        onSendMessage={onSendMessage}
        isLoading={isLoading}
        isNewConversation={isNewConversation}
      />
    </div>
  );
}
