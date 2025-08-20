"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Zap, Sparkles, X } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  isNewConversation?: boolean; // Add this prop
}

export function ChatInput({
  onSendMessage,
  isLoading = false,
  disabled = false,
  isNewConversation = false,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [showExamples, setShowExamples] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [message]);

  // Reset examples when starting a new conversation
  useEffect(() => {
    if (isNewConversation) {
      setShowExamples(true);
    }
  }, [isNewConversation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const examplePrompts = [
    "Write a professional email for a job application",
    "Create a marketing strategy for a new product",
    "Explain quantum computing in simple terms",
    "Draft a project proposal for a mobile app",
  ];

  const handleExampleClick = (example: string) => {
    setMessage(example);
    textareaRef.current?.focus();
  };

  return (
    <div className="border-t border-gray-200 bg-white">
      {/* Example prompts (show when input is empty, it's a new conversation, and examples are not closed) */}
      {!message && isNewConversation && showExamples && (
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">
                Try these examples:
              </span>
            </div>
            <button
              onClick={() => setShowExamples(false)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              title="Close examples"
            >
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {examplePrompts.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                className="text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                disabled={disabled || isLoading}
              >
                <div className="text-sm text-gray-700 group-hover:text-blue-700">
                  {example}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input form */}
      <form onSubmit={handleSubmit} className="p-4">
        <div className="relative flex items-center gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe the prompt you want to optimize..."
              disabled={disabled || isLoading}
              rows={1}
              className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none disabled:opacity-50 disabled:cursor-not-allowed text-black"
              style={{ minHeight: "52px", maxHeight: "200px" }}
            />

            {/* Character counter */}
            <div className="absolute bottom-2 right-3 text-xs text-gray-400">
              {message.length}/2000
            </div>
          </div>

          <button
            type="submit"
            disabled={!message.trim() || isLoading || disabled}
            className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Optimization info */}
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
          <Zap className="w-3 h-3" />
          <span>
            Your prompt will be optimized for clarity, structure, and
            effectiveness
          </span>
        </div>
      </form>
    </div>
  );
}
