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
  role: "USER" | "ASSISTANT";
  content: string;
  images?: string[]; // Add images support (base64)
  uploadedFiles?: {
    id: string;
    geminiFileId: string;
    originalName: string;
    displayName: string;
    mimeType: string;
    sizeBytes: number;
    uri: string;
    createdAt: string;
  }[]; // Updated to match backend response
  createdAt: string;
  conversationId: string; // Make it required to match useMessages
  isNewMessage?: boolean; // Flag để kiểm tra tin nhắn mới
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
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isNewConversation, setIsNewConversation] = useState<boolean>(false);

  // Use custom hooks for data management
  const {
    conversations,
    loading: conversationsLoading,
    createConversation,
    updateConversation,
    deleteConversation,
  } = useConversations();

  const {
    messages,
    loading: messagesLoading,
    sendMessage,
    addMessage,
    updateMessage,
    clearMessages,
  } = useMessages({ conversationId: currentConversationId, isNewConversation });

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
    clearMessages();
  };

  const handleRenameConversation = async (id: string, newTitle: string) => {
    await updateConversation(id, { title: newTitle });
  };

  const handleDeleteConversation = async (id: string) => {
    const success = await deleteConversation(id);
    if (success && currentConversationId === id) {
      // If we deleted the current conversation, reset to new conversation
      setCurrentConversationId(null);
      clearMessages();
    }
  };

  const handleSendMessage = async (
    content: string,
    images?: string[],
    uploadedFileIds?: string[]
  ) => {
    if (
      !content.trim() &&
      (!images || images.length === 0) &&
      (!uploadedFileIds || uploadedFileIds.length === 0)
    )
      return;

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
        setIsNewConversation(true);
      }

      // Add user message immediately to UI
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "USER",
        content,
        images: images, // Add images to user message
        createdAt: new Date().toISOString(),
        conversationId: conversationId || "", // Ensure it's never null
      };

      addMessage(userMessage);
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Send message to backend first to get the real messageId
      await sendMessage(
        content,
        conversationId || undefined,
        "USER",
        undefined,
        images,
        uploadedFileIds // Pass uploaded file IDs as fileUris
      );

      // If we have uploaded file IDs, fetch the file details to display and get URIs
      let uploadedFileObjects: any[] = [];
      let fileUris: Array<{ uri: string; mimeType: string }> = [];

      if (uploadedFileIds && uploadedFileIds.length > 0 && user?.id) {
        try {
          // Fetch file details for display (files are already uploaded)
          const fileDetails = await Promise.all(
            uploadedFileIds.map(async (fileId) => {
              try {
                const response = await fetch(
                  `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/files/by-id/${fileId}`,
                  {
                    headers: {
                      "x-user-id": user.id,
                    },
                  }
                );

                if (!response.ok) {
                  throw new Error("Failed to fetch file details");
                }

                return await response.json();
              } catch (error) {
                console.error(`Error fetching file ${fileId}:`, error);
                // Return placeholder for failed files
                return {
                  id: fileId,
                  geminiFileId: `files/${fileId}`,
                  originalName: "Unknown",
                  displayName: "Unknown",
                  mimeType: "unknown",
                  sizeBytes: 0,
                  uri: `files/${fileId}`, // Use basic URI format
                  createdAt: new Date().toISOString(),
                };
              }
            })
          );

          uploadedFileObjects = fileDetails;
          // Get proper URIs from file objects
          fileUris = fileDetails.map((f) => {
            return {
              uri: f.uri,
              mimeType: f.mimeType,
            };
          });

          // Update the user message in UI to show uploaded files
          if (uploadedFileObjects.length > 0) {
            updateMessage(userMessage.id, {
              uploadedFiles: uploadedFileObjects,
            });
          }
        } catch (error) {
          console.error("Error fetching file details:", error);
          // Create fallback URIs if fetch fails completely
          fileUris = uploadedFileIds.map((id) => ({
            uri: `files/${id}`,
            mimeType: "unknown",
          }));
        }
      }
      const optimizationResult = await optimizePrompt({
        userInput: content,
        images: images, // Add images to the request
        fileUris: fileUris, // Add file URIs to the request
        options: {
          language: "vi",
          style: "professional",
          includeExamples: true,
        },
        conversationId: conversationId || undefined,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "ASSISTANT",
        content:
          optimizationResult?.optimizedPrompt?.rawText ||
          "Prompt optimized successfully",
        createdAt: new Date().toISOString(),
        conversationId: conversationId || "", // Ensure it's never null
        isNewMessage: true, // Đánh dấu là tin nhắn mới
        metadata: {
          optimizedPrompt: optimizationResult?.optimizedPrompt,
          processingTime: optimizationResult?.metadata?.processingTime,
          tokensUsed: optimizationResult?.metadata?.tokensUsed,
        },
      };

      // Add assistant message locally first
      addMessage(assistantMessage);

      // Also save assistant message to database
      await sendMessage(
        assistantMessage.content,
        conversationId || undefined,
        "ASSISTANT", // Specify role as assistant
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
        role: "ASSISTANT",
        content:
          "Sorry, I encountered an error while optimizing your prompt. Please try again.",
        createdAt: new Date().toISOString(),
        conversationId: currentConversationId || "", // Ensure it's never null
        isNewMessage: true, // Đánh dấu là tin nhắn mới
      };

      addMessage(errorMessage);
    } finally {
      setIsLoading(false);
      setIsNewConversation(false);
    }
  };
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onNewConversation={handleNewConversation}
        onSelectConversation={handleSelectConversation}
        onRenameConversation={handleRenameConversation}
        onDeleteConversation={handleDeleteConversation}
        loading={conversationsLoading}
      />

      <div className="flex-1 flex flex-col">
        <ChatArea
          messages={messages}
          isLoading={isLoading}
          messagesLoading={messagesLoading}
          onSendMessage={handleSendMessage}
          isNewConversation={!currentConversationId}
        />
      </div>
    </div>
  );
}
