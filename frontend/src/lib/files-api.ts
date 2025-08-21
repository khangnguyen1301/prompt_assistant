interface UploadedFile {
  id: string;
  name: string;
  uri: string;
  mimeType: string;
  sizeBytes: number;
  createTime: string;
  expirationTime: string;
  sha256Hash: string;
  state: string;
}

export class FilesApiService {
  private baseUrl: string;

  constructor(baseUrl: string = "http://localhost:3001/api") {
    this.baseUrl = baseUrl;
  }

  /**
   * Upload file to backend which then uploads to Gemini Files API
   */
  async uploadFile(
    file: File,
    clerkId: string,
    messageId?: string
  ): Promise<UploadedFile> {
    const formData = new FormData();
    formData.append("file", file);

    const headers: HeadersInit = {
      "x-user-id": clerkId,
    };

    if (messageId) {
      headers["x-message-id"] = messageId;
    }

    const response = await fetch(`${this.baseUrl}/files/upload`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to upload file");
    }

    return response.json();
  }

  /**
   * Get file information
   */
  async getFile(geminiFileId: string, clerkId: string) {
    const response = await fetch(`${this.baseUrl}/files/${geminiFileId}`, {
      headers: {
        "x-user-id": clerkId,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to get file");
    }

    return response.json();
  }

  /**
   * List user's uploaded files
   */
  async listFiles(clerkId: string, page = 1, limit = 20) {
    const response = await fetch(
      `${this.baseUrl}/files?page=${page}&limit=${limit}`,
      {
        headers: {
          "x-user-id": clerkId,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to list files");
    }

    return response.json();
  }

  /**
   * Delete file
   */
  async deleteFile(geminiFileId: string, clerkId: string) {
    const response = await fetch(`${this.baseUrl}/files/${geminiFileId}`, {
      method: "DELETE",
      headers: {
        "x-user-id": clerkId,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete file");
    }

    return response.json();
  }
}

export const filesApiService = new FilesApiService();
