"use client";
import React, { useState, useEffect } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import {
  Plus,
  Search,
  MessageSquare,
  History,
  PanelLeft,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/stores/sidebarStore";
import { useApiKeyStatus } from "@/hooks/useApiKeyStatus";
import { ConversationMenu } from "./conversation-menu";
import { SearchModal } from "./search-modal";
import { Conversation } from "./chat-layout";

interface SidebarProps {
  conversations: Conversation[];
  currentConversationId?: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  loading?: boolean;
  isMobile?: boolean;
}

export default function Sidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onRenameConversation,
  loading = false,
  isMobile = false,
}: SidebarProps) {
  const { user } = useUser();
  const { isCollapsed, toggleCollapse } = useSidebarStore();
  const { status: apiKeyStatus, loading: apiKeyLoading } = useApiKeyStatus();
  const [apiKeyStatusState, setApiKeyStatusState] = useState(false);

  useEffect(() => {
    setApiKeyStatusState(!!apiKeyStatus?.hasApiKey);
  }, [apiKeyStatus]);

  const handleUserInfoClick = () => {
    // This will trigger the same action as clicking UserButton
    const userButton = document.querySelector(
      ".cl-userButtonTrigger"
    ) as HTMLElement;
    userButton?.click();
  };

  const renderSidebarContent = () => (
    <div className="flex flex-col h-[100vh]">
      {/* Header - Responsive */}
      <div className="p-2 md:p-2 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Zap className="w-3 h-3 md:w-4 md:h-4 text-white" />
              </div>
              <h1 className="text-sm md:text-lg font-semibold text-gray-900 dark:text-white truncate">
                Prompt Assistant
              </h1>
            </div>
          )}
          {/* Collapse Button - Desktop only */}
          {!isMobile && (
            <button
              onClick={toggleCollapse}
              className={cn(
                "flex items-center p-2 md:p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0",
                isCollapsed ? "justify-center" : ""
              )}
            >
              <PanelLeft size={16} className="md:w-5 md:h-5" />
            </button>
          )}
        </div>
      </div>

      {/* New Conversation Button */}
      <div className="p-2 flex-shrink-0">
        <button
          onClick={onNewConversation}
          className={cn(
            "w-full mb-3 flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors",
            isCollapsed ? "w-[44px] justify-center" : ""
          )}
        >
          <Plus size={20} />
          {!isCollapsed && <span>New Chats</span>}
        </button>

        {/* Search Button */}
        <SearchModal
          conversations={conversations}
          onSelectConversation={onSelectConversation}
          isCollapsed={isCollapsed}
        />
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto md:max-h-[calc(100vh-250px)] mb-3">
        <div className="px-3 md:px-4 space-y-1">
          {!isCollapsed && (
            <h2 className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
              <History size={14} className="md:w-4 md:h-4" />
              Recent Conversations
            </h2>
          )}
          <div className="space-y-1">
            {loading ? (
              <div className="animate-pulse space-y-1 md:space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-12 md:h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"
                  ></div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              !isCollapsed && (
                <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400 text-center py-6 md:py-8 px-2">
                  No conversations yet.
                  <br />
                  Start a new one!
                </div>
              )
            ) : (
              !isCollapsed &&
              conversations.map((conversation, index) => (
                <div
                  key={conversation?.id || `conversation-${index}`}
                  className={cn(
                    "w-full group relative flex items-center rounded-lg transition-colors overflow-hidden",
                    currentConversationId === conversation?.id
                      ? "bg-blue-600 dark:bg-blue-500"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}
                >
                  <button
                    onClick={() => onSelectConversation(conversation?.id)}
                    className={cn(
                      "flex-1 text-left p-2 md:p-3 transition-colors min-w-0",
                      currentConversationId === conversation?.id
                        ? "text-white"
                        : "text-gray-700 dark:text-gray-300",
                      isCollapsed && "flex justify-center"
                    )}
                  >
                    {isCollapsed ? (
                      <MessageSquare size={16} className="md:w-5 md:h-5" />
                    ) : (
                      <div className="pr-6 md:pr-8 min-w-0">
                        <div className="font-medium truncate text-sm md:text-base">
                          {conversation?.title}
                        </div>
                        <div className="text-[10px] md:text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 md:mt-1 truncate">
                          {conversation?.messageCount} messages •{" "}
                          {new Date(
                            conversation?.updatedAt
                          ).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </button>

                  {!isCollapsed && (
                    <div className="absolute right-1 md:right-2 top-1/2 transform -translate-y-1/2">
                      <ConversationMenu
                        conversationId={conversation?.id}
                        currentTitle={conversation?.title}
                        onRename={onRenameConversation}
                        onDelete={onDeleteConversation}
                      />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0 h-[64px]">
        <div
          className={cn(
            "flex items-center gap-3",
            isCollapsed && "justify-center"
          )}
        >
          <div className="flex items-center justify-between gap-2 flex-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-2 transition-colors">
            <div className="flex items-center gap-2">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8",
                  },
                }}
                afterSignOutUrl="/sign-in"
              />
              {!isCollapsed && (
                <div onClick={handleUserInfoClick}>
                  <div className="text-sm font-medium truncate text-gray-900 dark:text-white">
                    {user?.fullName || user?.firstName || "User"}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user?.emailAddresses?.[0]?.emailAddress || "No email"}
                  </div>
                </div>
              )}
            </div>
            <div
              className={`w-2 h-2 rounded-full ${
                apiKeyLoading
                  ? "bg-gray-400"
                  : apiKeyStatusState
                    ? "bg-green-500"
                    : "bg-amber-500"
              }`}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );

  // Handle mobile overlay logic
  if (isMobile) {
    return (
      <>
        {/* Mobile sidebar overlay */}
        {!isCollapsed && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={toggleCollapse}
            />
            {/* Sidebar */}
            <div className="absolute left-0 top-0 bottom-0 w-72 sm:w-80 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 overflow-hidden shadow-xl">
              {renderSidebarContent()}
            </div>
          </div>
        )}

        {/* Mobile menu button - Responsive */}
        <button
          onClick={toggleCollapse}
          className="fixed top-4 left-3 z-40 lg:hidden p-2 md:p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
        >
          <PanelLeft
            size={18}
            className="md:w-5 md:h-5 text-gray-600 dark:text-gray-300"
          />
        </button>
      </>
    );
  }

  // Desktop sidebar - Responsive width
  return (
    <div
      className={cn(
        "relative flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700 transition-all duration-300",
        isCollapsed ? "w-12 md:w-16" : "w-64 md:w-72 lg:w-80"
      )}
    >
      {renderSidebarContent()}
    </div>
  );
}
