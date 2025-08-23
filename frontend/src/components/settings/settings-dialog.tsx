"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Settings, X } from "lucide-react";
import { SettingsPage } from "../settings/settings-page";
import { cn } from "@/lib/utils";

interface SettingsDialogProps {
  isCollapsed?: boolean;
  trigger?: React.ReactNode;
}

export function SettingsDialog({
  isCollapsed = false,
  trigger,
}: SettingsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const defaultTrigger = (
    <button
      className={cn(
        "flex items-center gap-3 p-2 hover:bg-gray-700 rounded-lg transition-colors cursor-pointer",
        isCollapsed && "justify-center"
      )}
    >
      <Settings size={20} />
      {!isCollapsed && <span>Settings</span>}
    </button>
  );

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>{trigger || defaultTrigger}</Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] z-50">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Settings size={20} className="text-gray-500 dark:text-gray-400" />
                <Dialog.Title className="text-lg font-semibold text-black dark:text-white">
                  Settings
                </Dialog.Title>
              </div>
              <Dialog.Close asChild>
                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                  <X size={20} className="text-gray-500 dark:text-gray-400" />
                </button>
              </Dialog.Close>
            </div>

            {/* Content */}
            <div className="flex-1 max-h-[80vh] z-50 overflow-auto">
              <SettingsPage />
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
