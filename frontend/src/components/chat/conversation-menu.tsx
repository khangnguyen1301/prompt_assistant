"use client";

import { useState, useRef, useEffect } from "react";
import { MoreVertical, Edit2, Trash2 } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

interface ConversationMenuProps {
  conversationId: string;
  currentTitle: string;
  onRename: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
}

export function ConversationMenu({
  conversationId,
  currentTitle,
  onRename,
  onDelete,
}: ConversationMenuProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(currentTitle);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when entering edit mode and handle click outside
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }

    // Handle click outside to cancel
    const handleClickOutside = (event: MouseEvent) => {
      if (isEditing && inputRef.current && !inputRef.current.contains(event.target as Node)) {
        handleCancelRename();
      }
    };

    if (isEditing) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditing]);

  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleRename = () => {
    setIsEditing(true);
  };

  const handleSaveRename = () => {
    if (editTitle.trim() && editTitle !== currentTitle) {
      onRename(conversationId, editTitle.trim());
    }
    setIsEditing(false);
    setEditTitle(currentTitle);
  };

  const handleCancelRename = () => {
    setIsEditing(false);
    setEditTitle(currentTitle);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveRename();
    } else if (e.key === "Escape") {
      handleCancelRename();
    }
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this conversation?")) {
      onDelete(conversationId);
    }
  };

  if (isEditing) {
    return (
      <div className="w-full flex items-center px-3 py-2" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full flex-1 px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          maxLength={100}
          placeholder="Enter conversation title..."
        />
      </div>
    );
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          onClick={handleMenuClick}
          className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded transition-all duration-200"
          title="More options"
        >
          <MoreVertical className="w-4 h-4 text-gray-500" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[160px] bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
          sideOffset={5}
          align="end"
        >
          <DropdownMenu.Item
            onClick={handleRename}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer outline-none"
          >
            <Edit2 className="w-4 h-4" />
            Rename
          </DropdownMenu.Item>
          
          <DropdownMenu.Item
            onClick={handleDelete}
            className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer outline-none"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
