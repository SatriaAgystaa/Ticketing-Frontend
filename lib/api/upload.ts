import { api } from "./client";

export const uploadApi = {
  /** Get a presigned URL for uploading a file */
  getPresignedUrl(data: { filename: string; content_type: string; folder: string }) {
    return api.post<{ upload_url: string; public_url: string }>("/uploads/presigned", data);
  },

  /** Upload file to presigned URL, return public URL */
  async uploadFile(file: File, folder: string): Promise<string> {
    const { data } = await this.getPresignedUrl({
      filename: file.name,
      content_type: file.type,
      folder,
    });

    await fetch(data.upload_url, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });

    return data.public_url;
  },
};
