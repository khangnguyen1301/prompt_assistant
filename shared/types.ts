// Shared TypeScript types for Prompt Assistant

export interface User {
  id: string;
  clerkId: string; // Clerk user ID
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
}

export interface Message {
  id: string;
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  metadata?: MessageMetadata;
}

export interface MessageMetadata {
  tokens?: number;
  cost?: number;
  processingTime?: number;
  model?: string;
}

export interface GeneratePromptRequest {
  userInput: string;
  conversationId?: string;
  context?: string;
  options?: PromptOptions;
}

export interface PromptOptions {
  language?: "vi" | "en";
  style?: "formal" | "casual" | "technical";
  includeExamples?: boolean;
  maxLength?: number;
}

export interface GeneratePromptResponse {
  optimizedPrompt: StructuredPrompt;
  originalInput: string;
  metadata: {
    processingTime: number;
    tokensUsed: number;
    cost: number;
    model: string;
  };
}

export interface StructuredPrompt {
  goal: string;
  input: string;
  output: string;
  instructions: string[];
  notes: string[];
  rawText: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// API Endpoints
export const API_ENDPOINTS = {
  WEBHOOKS: {
    CLERK: "/api/webhooks/clerk",
  },
  AUTH: {
    ME: "/api/auth/me",
  },
  CONVERSATIONS: {
    LIST: "/api/conversations",
    CREATE: "/api/conversations",
    GET: (id: string) => `/api/conversations/${id}`,
    UPDATE: (id: string) => `/api/conversations/${id}`,
    DELETE: (id: string) => `/api/conversations/${id}`,
  },
  MESSAGES: {
    LIST: (conversationId: string) =>
      `/api/conversations/${conversationId}/messages`,
    CREATE: "/api/messages",
  },
  PROMPTS: {
    GENERATE: "/api/prompts/generate",
    HISTORY: "/api/prompts/history",
  },
} as const;

// Error codes
export enum ErrorCode {
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  AI_SERVICE_ERROR = "AI_SERVICE_ERROR",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  INTERNAL_ERROR = "INTERNAL_ERROR",
}

// Constants
export const CONSTANTS = {
  MAX_MESSAGE_LENGTH: 10000,
  MAX_CONVERSATIONS_PER_USER: 100,
  DEFAULT_PAGE_SIZE: 20,
  AI_MODELS: {
    GEMINI_PRO: "gemini-pro",
    GEMINI_PRO_VISION: "gemini-pro-vision",
  },
  PROMPT_STRUCTURE: {
    SECTIONS: [
      "🎯 Goal",
      "📥 Input",
      "📤 Output",
      "📝 Instructions",
      "⚡ Notes",
    ],
  },
} as const;
