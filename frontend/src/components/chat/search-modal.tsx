"use client";

import { useState, useMemo, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Search, X, MessageSquare } from "lucide-react";
import { Conversation } from "./chat-layout";
import { cn } from "@/lib/utils";

interface SearchModalProps {
  conversations: Conversation[];
  onSelectConversation: (conversationId: string) => void;
  isCollapsed?: boolean;
  // Add access to messages for content search
  allMessages?: Array<{
    id: string;
    content: string;
    conversationId: string;
    role: string;
    createdAt: string;
  }>;
}

export function SearchModal({
  conversations,
  onSelectConversation,
  isCollapsed = false,
  allMessages = [],
}: SearchModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Enhanced filter that searches conversation titles
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;

    const query = searchQuery.toLowerCase();

    return conversations.filter((conversation) => {
      // Search in conversation title
      return conversation.title.toLowerCase().includes(query);
    });
  }, [conversations, searchQuery]);

  const handleSelectConversation = (conversationId: string) => {
    onSelectConversation(conversationId);
    setIsOpen(false);
    setSearchQuery("");
  };

  // Add keyboard shortcut to open search (Ctrl/Cmd + K)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        setIsOpen(true);
      }
      // Close modal with Escape
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        <button
          className={cn(
            "w-full h-10 sm:h-12 flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors",
            isCollapsed ? "justify-center" : ""
          )}
        >
          <Search
            size={16}
            className="md:w-5 md:h-5 flex-shrink-0 text-gray-600 dark:text-gray-300"
          />
          {!isCollapsed && (
            <span className="text-sm md:text-base text-gray-700 dark:text-gray-200">
              Search Chats
            </span>
          )}
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-[10%] sm:top-1/2 left-1/2 transform -translate-x-1/2 sm:-translate-y-1/2 bg-white dark:bg-gray-900 rounded-lg shadow-xl w-[95vw] sm:w-[90vw] max-w-sm sm:max-w-lg md:max-w-2xl h-[80vh] sm:max-h-[80vh] z-50 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-3 md:p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Search
                  size={18}
                  className="md:w-5 md:h-5 text-gray-500 dark:text-gray-400"
                />
                <Dialog.Title className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">
                  Search chats
                </Dialog.Title>
              </div>
              <Dialog.Close asChild>
                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                  <X
                    size={18}
                    className="md:w-5 md:h-5 text-gray-500 dark:text-gray-400"
                  />
                </button>
              </Dialog.Close>
            </div>

            {/* Search Input */}
            <div className="p-3 md:p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search
                  size={14}
                  className="md:w-4 md:h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
                />
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-gray-900 dark:text-white bg-white dark:bg-gray-800 pl-8 md:pl-10 pr-3 md:pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-sm md:text-base placeholder-gray-500 dark:placeholder-gray-400"
                  autoFocus
                />
              </div>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto p-3 md:p-4">
              {filteredConversations.length === 0 ? (
                <div className="text-center py-6 md:py-8 text-gray-500 dark:text-gray-400 text-sm md:text-base">
                  {searchQuery.trim()
                    ? "No conversations found"
                    : "Start typing to search..."}
                </div>
              ) : (
                <div className="space-y-1 md:space-y-2">
                  {filteredConversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() => handleSelectConversation(conversation.id)}
                      className="w-full text-left p-2 md:p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    >
                      <div className="flex items-start gap-2 md:gap-3">
                        <div className="p-1 sm:p-1.5 md:p-2 bg-gray-100 dark:bg-gray-700 rounded-full flex-shrink-0">
                          <MessageSquare
                            size={12}
                            className="sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-gray-600 dark:text-gray-300"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 dark:text-white truncate text-sm md:text-base">
                            {conversation.title}
                          </div>
                          <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5 md:mt-1 truncate">
                            {conversation.messageCount} messages •{" "}
                            {formatDate(conversation.updatedAt)}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 md:p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 flex flex-col sm:flex-row justify-between gap-2 sm:gap-0">
              <span>Press Escape to close</span>
              <span className="hidden sm:inline">⌘K to open search</span>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
