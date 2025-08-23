"use client";

import { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { filesApiService } from "@/lib/files-api";
import {
  Send,
  Loader2,
  Zap,
  Sparkles,
  X,
  Image,
  Paperclip,
} from "lucide-react";

interface ChatInputProps {
  onSendMessage: (
    message: string,
    images?: string[],
    uploadedFileIds?: string[] // Change to uploaded file IDs
  ) => void;
  isLoading?: boolean;
  disabled?: boolean;
  isNewConversation?: boolean;
}

export function ChatInput({
  onSendMessage,
  isLoading = false,
  disabled = false,
  isNewConversation = false,
}: ChatInputProps) {
  const { user } = useUser();
  const [message, setMessage] = useState("");
  const [showExamples, setShowExamples] = useState(true);
  const [images, setImages] = useState<string[]>([]); // Store base64 images (legacy)
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{
      id: string;
      originalName: string;
      displayName: string;
      mimeType: string;
      sizeBytes: number;
      cloudinarySecureUrl?: string;
      uri: string;
    }>
  >([]); // Store uploaded file info
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set()); // Track uploading status
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setImages([]); // Clear images for new conversation
      setUploadedFiles([]); // Clear uploaded files for new conversation
    }
  }, [isNewConversation]);

  // Handle file selection and upload immediately
  const handleFileSelection = async (files: FileList | null) => {
    if (!files || !user?.id) return;

    const maxSize = 20 * 1024 * 1024; // 20MB limit for Gemini Files API
    const validFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Check file size
      if (file.size > maxSize) {
        alert(`${file.name} is too large. Maximum size is 20MB`);
        continue;
      }

      validFiles.push(file);
    }

    // Upload each valid file immediately
    for (const file of validFiles) {
      const fileKey = `${file.name}-${file.lastModified}`;
      setUploadingFiles((prev) => new Set([...prev, fileKey]));

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("displayName", file.name);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/files/upload`,
          {
            method: "POST",
            headers: {
              "x-user-id": user.id,
            },
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error("Failed to upload file");
        }

        const uploadedFile = await response.json();

        setUploadedFiles((prev) => [...prev, uploadedFile]);
      } catch (error) {
        console.error("Error uploading file:", error);
        alert(`Failed to upload ${file.name}`);
      } finally {
        setUploadingFiles((prev) => {
          const newSet = new Set(prev);
          newSet.delete(fileKey);
          return newSet;
        });
      }
    }
  };

  // Handle paste event - use new API for files
  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    const imageFiles: File[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          imageFiles.push(file);
        }
      }
    }

    if (imageFiles.length > 0) {
      e.preventDefault();
      const fileList = imageFiles.reduce((dt, file) => {
        dt.items.add(file);
        return dt;
      }, new DataTransfer()).files;

      await handleFileSelection(fileList);
    }
  };

  // Remove image (legacy)
  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Remove uploaded file and delete from server
  const removeUploadedFile = async (index: number) => {
    const fileToRemove = uploadedFiles[index];

    try {
      // Delete from server
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/files/${fileToRemove.id}`,
        {
          method: "DELETE",
          headers: {
            "x-user-id": user?.id || "",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete file from server");
      }

      // Remove from local state
      setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("Failed to delete file");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      (message.trim() || images.length > 0 || uploadedFiles.length > 0) &&
      !isLoading &&
      !disabled
    ) {
      onSendMessage(
        message.trim(),
        images,
        uploadedFiles.map((f) => f.id)
      );
      setMessage("");
      setImages([]);
      setUploadedFiles([]);
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
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      {/* Example prompts (show when input is empty, it's a new conversation, and examples are not closed) */}
      {!message && isNewConversation && showExamples && (
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Try these examples:
              </span>
            </div>
            <button
              onClick={() => setShowExamples(false)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              title="Close examples"
            >
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {examplePrompts.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                className="text-left p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group"
                disabled={disabled || isLoading}
              >
                <div className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-700 dark:group-hover:text-blue-400">
                  {example}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input form */}
      <form onSubmit={handleSubmit} className="p-4">
        {/* Image preview (legacy base64 images) */}
        {images.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-2">
              Legacy images (base64):
            </p>
            <div className="flex flex-wrap gap-2">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={`data:image/jpeg;base64,${image}`}
                    alt={`Upload ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Uploaded files preview */}
        {uploadedFiles.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-2">Uploaded files:</p>
            <div className="flex flex-wrap gap-2">
              {uploadedFiles.map((file, index) => (
                <div
                  key={file.id}
                  className="relative group p-2 border border-gray-200 rounded-lg bg-gray-50"
                >
                  <div className="flex items-center justify-between gap-2">
                    {file.mimeType.startsWith("image/") ? (
                      <Image className="w-4 h-4 text-blue-500" />
                    ) : (
                      <Paperclip className="w-4 h-4 text-gray-500" />
                    )}
                    <span className="text-sm text-gray-700 truncate max-w-32">
                      {file.displayName}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeUploadedFile(index)}
                      className="w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                      title="Delete file from server"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {file.mimeType} • {Math.round(file.sizeBytes / 1024)}KB
                  </div>
                  {/* Image preview for uploaded images */}
                  {file.mimeType.startsWith("image/") &&
                    file.cloudinarySecureUrl && (
                      <div className="mt-2">
                        <img
                          src={file.cloudinarySecureUrl}
                          alt={file.displayName}
                          className="w-20 h-20 object-cover rounded border"
                        />
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Uploading files indicator */}
        {uploadingFiles.size > 0 && (
          <div className="mb-3">
            <p className="text-xs text-blue-500 mb-2 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              Uploading {uploadingFiles.size} file(s)...
            </p>
          </div>
        )}

        <div className="relative flex items-center gap-3">
          <div className="flex-1 relative flex items-center">
            <textarea
              ref={textareaRef}
              name="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder={
                images.length > 0 || uploadedFiles.length > 0
                  ? "Add a description for your files..."
                  : "Describe the prompt you want to optimize..."
              }
              disabled={disabled || isLoading}
              rows={1}
              className="w-full px-4 py-3 pr-20 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none disabled:opacity-50 disabled:cursor-not-allowed hidden-scrollbar placeholder-gray-500 dark:placeholder-gray-400"
              style={{ minHeight: "52px", maxHeight: "200px" }}
            />

            <div className="absolute bottom-[6px] right-2 flex items-center gap-1">
              {/* File upload button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isLoading}
                className="flex items-center justify-center w-10 h-10 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Select files"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              {/* Send button */}
              <button
                type="submit"
                disabled={
                  (!message.trim() &&
                    images.length === 0 &&
                    uploadedFiles.length === 0) ||
                  isLoading ||
                  disabled ||
                  uploadingFiles.size > 0 // Disable while uploading
                }
                className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,audio/*,.pdf,.txt,.csv,.json,.docx,.xlsx"
          multiple
          className="hidden"
          onChange={(e) => handleFileSelection(e.target.files)}
        />

        {/* Optimization info */}
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
          <Zap className="w-3 h-3" />
          <span>
            Your prompt will be optimized for clarity, structure, and
            effectiveness. Files are uploaded to Gemini Files API for better
            performance.
          </span>
        </div>

        {/* File upload instructions */}
        <div className="flex items-center gap-2  mt-1 text-xs text-gray-500">
          <Zap className="w-3 h-3" />
          <span>
            Tip: You can paste images directly (Ctrl+V) or click the paperclip
            icon to upload files (max 20MB each)
          </span>
        </div>
      </form>
    </div>
  );
}
