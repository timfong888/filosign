import { v4 as uuidv4 } from 'uuid';
import { localStorageService } from '../local-storage-service';
import { hybridEncryptionService } from '../hybrid-encryption-service';

/**
 * Local Storage Interface - Replaceable with PDP Storage
 * This interface provides the same API as PDP storage but uses local storage
 */

export interface StorageUploadOptions {
  file: File;
  senderAddress: string;
  recipientAddress: string;
  metadata?: {
    filename?: string;
    description?: string;
  };
  onProgress?: (progress: number) => void;
}

export interface StorageUploadResult {
  success: boolean;
  retrievalId?: string;
  cid?: string;
  error?: string;
}

export interface StorageRetrievalResult {
  success: boolean;
  file?: File;
  metadata?: {
    filename: string;
    senderAddress: string;
    recipientAddress: string;
    uploadTimestamp: number;
  };
  error?: string;
}

/**
 * Local Storage Service - MVP Implementation
 * This will be replaced with PDP storage in production
 */
export class LocalStorageInterface {
  /**
   * Upload and encrypt a file for local storage
   */
  async uploadFile(options: StorageUploadOptions): Promise<StorageUploadResult> {
    try {
      const { file, senderAddress, recipientAddress, metadata, onProgress } = options;
      
      // Progress: Starting
      onProgress?.(0);
      
      // Generate retrieval ID
      const retrievalId = `FS-${uuidv4().substring(0, 8).toUpperCase()}`;
      
      // Progress: Encrypting
      onProgress?.(20);
      
      // Encrypt the file for both sender and recipient
      const encryptedPackage = await hybridEncryptionService.encryptForBoth(
        file,
        senderAddress,
        recipientAddress,
        retrievalId,
        metadata?.filename || file.name
      );
      
      // Progress: Storing
      onProgress?.(70);
      
      // Store in local storage
      await localStorageService.storeDocument(encryptedPackage);
      
      // Generate mock CID for consistency with PDP interface
      const cid = `bafybeig${retrievalId.toLowerCase().replace(/-/g, '')}${'0'.repeat(40)}`;
      
      // Progress: Complete
      onProgress?.(100);
      
      return {
        success: true,
        retrievalId,
        cid
      };
      
    } catch (error) {
      console.error('Local storage upload failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }
  
  /**
   * Retrieve and decrypt a file from local storage
   */
  async retrieveFile(retrievalId: string, userAddress: string): Promise<StorageRetrievalResult> {
    try {
      // Get encrypted package from local storage
      const encryptedPackage = await localStorageService.retrieveDocument(retrievalId);
      
      if (!encryptedPackage) {
        return {
          success: false,
          error: 'Document not found'
        };
      }
      
      // Decrypt the file
      const decryptedFile = await hybridEncryptionService.decryptFile(
        encryptedPackage,
        userAddress
      );
      
      return {
        success: true,
        file: decryptedFile,
        metadata: {
          filename: encryptedPackage.filename,
          senderAddress: encryptedPackage.sender_address,
          recipientAddress: encryptedPackage.recipient_address,
          uploadTimestamp: encryptedPackage.upload_timestamp
        }
      };
      
    } catch (error) {
      console.error('Local storage retrieval failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Retrieval failed'
      };
    }
  }
  
  /**
   * Check if a document exists
   */
  async documentExists(retrievalId: string): Promise<boolean> {
    try {
      const encryptedPackage = await localStorageService.retrieveDocument(retrievalId);
      return !!encryptedPackage;
    } catch {
      return false;
    }
  }
  
  /**
   * Get document metadata without decrypting
   */
  async getDocumentMetadata(retrievalId: string) {
    try {
      const encryptedPackage = await localStorageService.retrieveDocument(retrievalId);
      if (!encryptedPackage) return null;
      
      return {
        filename: encryptedPackage.filename,
        senderAddress: encryptedPackage.sender_address,
        recipientAddress: encryptedPackage.recipient_address,
        uploadTimestamp: encryptedPackage.upload_timestamp,
        fileSize: encryptedPackage.file_size
      };
    } catch {
      return null;
    }
  }
}

// Export singleton instance
export const localStorageInterface = new LocalStorageInterface();
