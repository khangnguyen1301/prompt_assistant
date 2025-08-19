"use client";

import { useState } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { Sidebar } from "./sidebar";
import { ChatArea } from "./chat-area";
import { useConversations } from "@/hooks/useConversations";
import { useMessages } from "@/hooks/useMessages";
import { usePrompts } from "@/hooks/usePrompts";

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  conversationId: string; // Make it required to match useMessages
  metadata?: {
    optimizedPrompt?: {
      goal: string;
      input: string;
      output: string;
      instructions: string[];
      notes: string[];
      rawText: string;
    };
    processingTime?: number;
    tokensUsed?: number;
  };
}

export function ChatLayout() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useAuth();

  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);

  // Use custom hooks for data management
  const {
    conversations,
    loading: conversationsLoading,
    createConversation,
    updateConversation,
  } = useConversations();

  const {
    messages,
    loading: messagesLoading,
    sendMessage,
    addMessage,
    clearMessages,
  } = useMessages(currentConversationId);

  const {
    optimizePrompt,
    loading: promptsLoading,
    error: promptsError,
  } = usePrompts();

  // Redirect to sign-in if not authenticated
  if (isLoaded && !isSignedIn) {
    redirect("/sign-in");
  }

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleNewConversation = () => {
    setCurrentConversationId(null);
    clearMessages();
  };

  const handleSelectConversation = (conversationId: string) => {
    setCurrentConversationId(conversationId);
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    setIsLoading(true);

    try {
      let conversationId = currentConversationId;

      // Create new conversation if none exists
      if (!conversationId) {
        const newConversation = await createConversation(
          content.slice(0, 50) + (content.length > 50 ? "..." : "")
        );

        if (!newConversation) {
          throw new Error("Failed to create conversation");
        }

        conversationId = newConversation.id;
        setCurrentConversationId(conversationId);
      }

      // Add user message immediately to UI
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content,
        timestamp: new Date().toISOString(),
        conversationId: conversationId || "", // Ensure it's never null
      };

      addMessage(userMessage);

      // Send message to backend
      await sendMessage(content, conversationId || undefined);

      // Call prompt optimization using hook
      const optimizationResult = await optimizePrompt({
        userInput: content,
        options: {
          language: "vi",
          style: "professional",
          includeExamples: true,
        },
        conversationId: conversationId || undefined,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          optimizationResult?.optimizedPrompt?.rawText ||
          "Prompt optimized successfully",
        timestamp: new Date().toISOString(),
        conversationId: conversationId || "", // Ensure it's never null
        metadata: {
          optimizedPrompt: optimizationResult?.optimizedPrompt,
          processingTime: optimizationResult?.metadata?.processingTime,
          tokensUsed: optimizationResult?.metadata?.tokensUsed,
        },
      };

      // Add assistant message to UI
      addMessage(assistantMessage);

      // Also save assistant message to database
      await sendMessage(
        assistantMessage.content,
        conversationId || undefined,
        "assistant", // Specify role as assistant
        assistantMessage.metadata // Include metadata
      );

      // Update conversation timestamp
      if (conversationId) {
        await updateConversation(conversationId, {
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);

      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Sorry, I encountered an error while optimizing your prompt. Please try again.",
        timestamp: new Date().toISOString(),
        conversationId: currentConversationId || "", // Ensure it's never null
      };

      addMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  console.log(messages);
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onNewConversation={handleNewConversation}
        onSelectConversation={handleSelectConversation}
        loading={conversationsLoading}
      />

      <div className="flex-1 flex flex-col">
        <ChatArea
          messages={messages}
          isLoading={isLoading || messagesLoading}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
}
