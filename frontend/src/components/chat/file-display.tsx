"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Image, File, FileText, Loader2 } from "lucide-react";

interface FileDisplayProps {
  file: {
    id: string;
    geminiFileId?: string | null;
    originalName: string;
    displayName: string;
    mimeType: string;
    sizeBytes: number;
    uri: string;
    cloudinaryPublicId?: string | null;
    cloudinaryUrl?: string | null;
    cloudinarySecureUrl?: string | null;
    createdAt: string;
  };
  isImage?: boolean;
}

export function FileDisplay({ file, isImage = false }: FileDisplayProps) {
  const { user } = useUser();
  const [imageSrc, setImageSrc] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isImage) {
      // Prefer Cloudinary secure URL if available (more reliable)
      if (file.cloudinarySecureUrl) {
        setImageSrc(file.cloudinarySecureUrl);
        setError(false);
        setLoading(false);
        return;
      }

      // Fallback to proxy for Gemini files if user is authenticated
      if (file.geminiFileId && user?.id) {
        setLoading(true);
        fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/${file.geminiFileId}`,
          {
            headers: {
              "x-user-id": user.id,
            },
          }
        )
          .then((response) => {
            if (response.ok) {
              return response.blob();
            }
            throw new Error("Failed to fetch file");
          })
          .then((blob) => {
            const url = URL.createObjectURL(blob);
            setImageSrc(url);
            setError(false);
          })
          .catch((err) => {
            console.error("Error loading file:", err);
            setError(true);
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        // No reliable source available
        setError(true);
        setLoading(false);
      }
    }
  }, [file.cloudinarySecureUrl, file.geminiFileId, user?.id, isImage]);

  // Helper function to get file icon based on mime type
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return <Image className="w-4 h-4" />;
    if (mimeType.startsWith("video/")) return <FileText className="w-4 h-4" />;
    if (mimeType.startsWith("audio/")) return <FileText className="w-4 h-4" />;
    if (mimeType.includes("pdf")) return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  if (isImage) {
    return (
      <div className="space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-32 bg-blue-600 bg-opacity-30 rounded border border-blue-400">
            <Loader2 className="w-6 h-6 animate-spin text-blue-200" />
          </div>
        ) : error || !imageSrc ? (
          <div className="flex items-center gap-2 text-xs text-blue-100 p-2 bg-blue-600 bg-opacity-30 rounded">
            {getFileIcon(file.mimeType)}
            <span className="text-blue-200">
              ({Math.round(file.sizeBytes / 1024)}KB)
            </span>
          </div>
        ) : (
          <>
            <img
              src={imageSrc}
              alt={file.displayName}
              className="max-w-full h-32 object-contain rounded border border-blue-400"
            />
            <div className="flex items-center gap-2 text-xs text-blue-100">
              <span className="text-blue-200">
                ({Math.round(file.sizeBytes / 1024)}KB)
              </span>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs text-blue-100">
      {getFileIcon(file.mimeType)}
      <span className="flex-1 truncate">{file.displayName}</span>
      <span className="text-blue-200">
        ({Math.round(file.sizeBytes / 1024)}KB)
      </span>
    </div>
  );
}
