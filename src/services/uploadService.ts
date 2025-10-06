import { apiRequest } from './api';
import type { ApiResponse } from '@/types/api';

export interface UploadedReceipt {
  url: string;
  publicId: string;
  thumbnailUrl?: string;
  previewUrl?: string;
  originalName: string;
  size: number;
  format: string;
}

export interface UploadReceiptResponse {
  success: boolean;
  data: UploadedReceipt;
  message?: string;
}

export const uploadService = {
  async uploadReceipt(file: File): Promise<ApiResponse<UploadedReceipt>> {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Please upload a valid image (JPEG, PNG, WebP) or PDF file');
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      throw new Error('File size must be less than 10MB');
    }

    const formData = new FormData();
    formData.append('receipt', file);
    
    return await apiRequest<UploadedReceipt>('POST', '/upload/receipt', formData);
  },

  async deleteReceipt(publicId: string): Promise<ApiResponse<{ success: boolean; message?: string }>> {
    return await apiRequest<{ success: boolean; message?: string }>(
      'DELETE', 
      `/upload/receipt/${encodeURIComponent(publicId)}`
    );
  },

  // Utility methods
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  isImageFile(format: string): boolean {
    return ['jpg', 'jpeg', 'png', 'webp'].includes(format?.toLowerCase());
  },

  validateFileType(file: File): boolean {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    return allowedTypes.includes(file.type);
  },

  validateFileSize(file: File, maxSizeInMB: number = 10): boolean {
    const maxSize = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSize;
  }
};