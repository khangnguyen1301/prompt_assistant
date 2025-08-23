"use client";

interface MessageSkeletonProps {
  isUser?: boolean;
}

export function MessageSkeleton({ isUser = false }: MessageSkeletonProps) {
  return (
    <div
      className={`p-2 flex ${isUser ? "justify-end" : "justify-start"} animate-pulse`}
    >
      <div
        className={`p-5 max-w-[${isUser ? "80%" : "90%"}] ${
          isUser
            ? "bg-blue-600 dark:bg-blue-700 text-white rounded-lg p-4"
            : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm"
        }`}
      >
        {!isUser ? (
          // Assistant message skeleton (structured prompt format)
          <div className="space-y-3">
            {/* Header skeleton */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full"></div>
                <div className="space-y-1">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-28"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-36"></div>
                </div>
              </div>
              <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>

            {/* Content skeleton - mimicking structured prompt */}
            <div className="space-y-4">
              {/* Goal section */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-300 dark:bg-green-600 rounded"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-3">
                  <div className="space-y-2">
                    <div className="h-4 bg-green-200 dark:bg-green-700 rounded w-full"></div>
                    <div className="h-4 bg-green-200 dark:bg-green-700 rounded w-3/4"></div>
                  </div>
                </div>
              </div>

              {/* Input section */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-300 dark:bg-blue-600 rounded"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                  <div className="space-y-2">
                    <div className="h-4 bg-blue-200 dark:bg-blue-700 rounded w-full"></div>
                    <div className="h-4 bg-blue-200 dark:bg-blue-700 rounded w-2/3"></div>
                  </div>
                </div>
              </div>

              {/* Output section */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-300 dark:bg-purple-600 rounded"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-3">
                  <div className="space-y-2">
                    <div className="h-4 bg-purple-200 dark:bg-purple-700 rounded w-full"></div>
                    <div className="h-4 bg-purple-200 dark:bg-purple-700 rounded w-4/5"></div>
                  </div>
                </div>
              </div>

              {/* Instructions section */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-300 dark:bg-orange-600 rounded"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-3">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-orange-300 dark:bg-orange-600 rounded-full mt-2"></div>
                      <div className="h-4 bg-orange-200 dark:bg-orange-700 rounded w-full"></div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-orange-300 dark:bg-orange-600 rounded-full mt-2"></div>
                      <div className="h-4 bg-orange-200 dark:bg-orange-700 rounded w-5/6"></div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-orange-300 dark:bg-orange-600 rounded-full mt-2"></div>
                      <div className="h-4 bg-orange-200 dark:bg-orange-700 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // User message skeleton (simpler)
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 mt-3"></div>
          </div>
        )}
      </div>
    </div>
  );
}
