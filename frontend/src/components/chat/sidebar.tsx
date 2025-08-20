"use client";

import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { Plus, MessageSquare, Settings, History } from "lucide-react";
import { Conversation } from "./chat-layout";
import { ConversationMenu } from "./conversation-menu";
import { cn } from "@/lib/utils";

interface SidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onNewConversation: () => void;
  onSelectConversation: (conversationId: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onDeleteConversation: (id: string) => void;
  loading?: boolean;
}

export function Sidebar({
  conversations,
  currentConversationId,
  onNewConversation,
  onSelectConversation,
  onRenameConversation,
  onDeleteConversation,
  loading = false,
}: SidebarProps) {
  console.log("🚀 ~ Sidebar ~ conversations:", conversations);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={cn(
        "relative flex flex-col bg-gray-900 text-white transition-all duration-300",
        isCollapsed ? "w-16" : "w-72"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h1 className="text-lg font-semibold text-white">
              Prompt Assistant
            </h1>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <MessageSquare size={20} />
          </button>
        </div>
      </div>

      {/* New Conversation Button */}
      <div className="p-4">
        <button
          onClick={onNewConversation}
          className={cn(
            "w-full flex items-center gap-3 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors",
            isCollapsed && "justify-center"
          )}
        >
          <Plus size={20} />
          {!isCollapsed && <span>New Conversation</span>}
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto mb-20"> {/* Change from overflow-y-scroll to overflow-y-auto */}
        <div className="px-4 space-y-1"> {/* Add space-y-1 here and remove from space-y-2 below */}
          {!isCollapsed && (
            <h2 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
              <History size={16} />
              Recent Conversations
            </h2>
          )}

          <div className="space-y-1"> {/* Change from space-y-2 to space-y-1 for tighter spacing */}
            {loading ? (
              <div className="animate-pulse space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-700 rounded-lg"></div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              !isCollapsed && (
                <div className="text-sm text-gray-500 text-center py-8">
                  No conversations yet.
                  <br />
                  Start a new one!
                </div>
              )
            ) : (
              conversations.map((conversation, index) => (
                <div
                  key={conversation?.id || `conversation-${index}`}
                  className={cn(
                    "w-full group relative flex items-center rounded-lg transition-colors overflow-hidden", // Add overflow-hidden
                    currentConversationId === conversation?.id
                      ? "bg-blue-600"
                      : "hover:bg-gray-700"
                  )}
                >
                  <button
                    onClick={() => onSelectConversation(conversation?.id)}
                    className={cn(
                      "flex-1 text-left p-3 transition-colors min-w-0", // Add flex-1 and min-w-0 for proper text truncation
                      currentConversationId === conversation?.id
                        ? "text-white"
                        : "text-gray-300",
                      isCollapsed && "flex justify-center"
                    )}
                  >
                    {isCollapsed ? (
                      <MessageSquare size={20} />
                    ) : (
                      <div className="pr-8 min-w-0"> {/* Add min-w-0 for proper truncation */}
                        <div className="font-medium truncate">
                          {conversation?.title}
                        </div>
                        <div className="text-xs text-gray-400 mt-1 truncate"> {/* Add truncate here too */}
                          {conversation?.messageCount} messages •{" "}
                          {new Date(conversation?.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </button>
                  
                  {!isCollapsed && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
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

        {/* Footer */}
        <div className="w-full absolute bottom-0 left-0 p-4 border-t border-gray-700 bg-gray-800">
          <div
            className={cn(
              "flex items-center gap-3",
              isCollapsed && "justify-center"
            )}
          >
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                },
              }}
              afterSignOutUrl="/sign-in"
            />
            {!isCollapsed && (
              <div className="flex-1">
                <div className="text-sm font-medium">Your Account</div>
              </div>
            )}
            {!isCollapsed && (
              <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                <Settings size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
