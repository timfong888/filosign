import { EncryptedPackage } from './hybrid-encryption-service';

export interface StorageMetadata {
  retrieval_id: string;
  sender_address: string;
  recipient_address: string;
  filename: string;
  file_size: number;
  upload_timestamp: number;
  storage_key: string; // Local storage key
}

export class LocalStorageService {
  private static readonly DOCUMENTS_KEY = 'filosign_encrypted_documents';
  private static readonly METADATA_KEY = 'filosign_document_metadata';

  /**
   * Store an encrypted document package locally
   */
  async storeDocument(encryptedPackage: EncryptedPackage): Promise<string> {
    try {
      const retrievalId = encryptedPackage.retrieval_id;
      const storageKey = `doc_${retrievalId}`;

      // Store the encrypted package
      localStorage.setItem(storageKey, JSON.stringify(encryptedPackage));

      // Update metadata index
      await this.updateMetadataIndex(encryptedPackage, storageKey);

      console.log(`Document stored with retrieval ID: ${retrievalId}`);
      return retrievalId;
    } catch (error) {
      console.error('Failed to store document:', error);
      throw new Error(`Storage failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retrieve an encrypted document package by retrieval ID
   */
  async retrieveDocument(retrievalId: string): Promise<EncryptedPackage> {
    try {
      if (!this.validateRetrievalId(retrievalId)) {
        throw new Error('Invalid retrieval ID format');
      }

      const storageKey = `doc_${retrievalId}`;
      const storedData = localStorage.getItem(storageKey);

      if (!storedData) {
        throw new Error('Document not found. Please check the retrieval ID.');
      }

      const encryptedPackage: EncryptedPackage = JSON.parse(storedData);
      
      // Validate the package structure
      if (!this.validateEncryptedPackage(encryptedPackage)) {
        throw new Error('Invalid document format');
      }

      console.log(`Document retrieved: ${encryptedPackage.filename}`);
      return encryptedPackage;
    } catch (error) {
      console.error('Failed to retrieve document:', error);
      throw new Error(`Retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get documents for a specific user (sender or recipient)
   */
  async getDocumentsForUser(userAddress: string): Promise<StorageMetadata[]> {
    try {
      const allMetadata = this.getMetadataIndex();
      
      return allMetadata.filter(metadata => 
        metadata.sender_address.toLowerCase() === userAddress.toLowerCase() ||
        metadata.recipient_address.toLowerCase() === userAddress.toLowerCase()
      );
    } catch (error) {
      console.error('Failed to get user documents:', error);
      return [];
    }
  }

  /**
   * Get documents sent by a user
   */
  async getSentDocuments(senderAddress: string): Promise<StorageMetadata[]> {
    try {
      const allMetadata = this.getMetadataIndex();
      
      return allMetadata.filter(metadata => 
        metadata.sender_address.toLowerCase() === senderAddress.toLowerCase()
      );
    } catch (error) {
      console.error('Failed to get sent documents:', error);
      return [];
    }
  }

  /**
   * Get documents received by a user
   */
  async getReceivedDocuments(recipientAddress: string): Promise<StorageMetadata[]> {
    try {
      const allMetadata = this.getMetadataIndex();
      
      return allMetadata.filter(metadata => 
        metadata.recipient_address.toLowerCase() === recipientAddress.toLowerCase()
      );
    } catch (error) {
      console.error('Failed to get received documents:', error);
      return [];
    }
  }

  /**
   * Check if a document exists
   */
  async documentExists(retrievalId: string): Promise<boolean> {
    try {
      const storageKey = `doc_${retrievalId}`;
      return localStorage.getItem(storageKey) !== null;
    } catch (error) {
      console.error('Failed to check document existence:', error);
      return false;
    }
  }

  /**
   * Delete a document (for cleanup)
   */
  async deleteDocument(retrievalId: string): Promise<void> {
    try {
      const storageKey = `doc_${retrievalId}`;
      
      // Remove the document
      localStorage.removeItem(storageKey);
      
      // Update metadata index
      await this.removeFromMetadataIndex(retrievalId);
      
      console.log(`Document deleted: ${retrievalId}`);
    } catch (error) {
      console.error('Failed to delete document:', error);
      throw new Error(`Deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<{
    totalDocuments: number;
    totalSize: number;
    storageUsed: string;
  }> {
    try {
      const metadata = this.getMetadataIndex();
      const totalDocuments = metadata.length;
      const totalSize = metadata.reduce((sum, doc) => sum + doc.file_size, 0);
      
      // Estimate storage used (rough calculation)
      let storageUsed = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('doc_') || key === LocalStorageService.METADATA_KEY) {
          const value = localStorage.getItem(key);
          if (value) {
            storageUsed += value.length;
          }
        }
      }

      return {
        totalDocuments,
        totalSize,
        storageUsed: this.formatBytes(storageUsed)
      };
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return {
        totalDocuments: 0,
        totalSize: 0,
        storageUsed: '0 B'
      };
    }
  }

  /**
   * Clear all stored documents (for testing/cleanup)
   */
  async clearAllDocuments(): Promise<void> {
    try {
      // Get all document keys
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('doc_') || key === LocalStorageService.METADATA_KEY) {
          keysToRemove.push(key);
        }
      }

      // Remove all document-related keys
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      console.log(`Cleared ${keysToRemove.length} documents from storage`);
    } catch (error) {
      console.error('Failed to clear documents:', error);
      throw new Error('Failed to clear storage');
    }
  }

  /**
   * Update the metadata index
   */
  private async updateMetadataIndex(encryptedPackage: EncryptedPackage, storageKey: string): Promise<void> {
    try {
      const metadata = this.getMetadataIndex();
      
      const newMetadata: StorageMetadata = {
        retrieval_id: encryptedPackage.retrieval_id,
        sender_address: encryptedPackage.sender_address,
        recipient_address: encryptedPackage.recipient_address,
        filename: encryptedPackage.filename,
        file_size: encryptedPackage.file_size,
        upload_timestamp: encryptedPackage.timestamp,
        storage_key: storageKey
      };

      // Remove existing entry if it exists
      const existingIndex = metadata.findIndex(m => m.retrieval_id === encryptedPackage.retrieval_id);
      if (existingIndex >= 0) {
        metadata[existingIndex] = newMetadata;
      } else {
        metadata.push(newMetadata);
      }

      localStorage.setItem(LocalStorageService.METADATA_KEY, JSON.stringify(metadata));
    } catch (error) {
      console.error('Failed to update metadata index:', error);
    }
  }

  /**
   * Remove from metadata index
   */
  private async removeFromMetadataIndex(retrievalId: string): Promise<void> {
    try {
      const metadata = this.getMetadataIndex();
      const filteredMetadata = metadata.filter(m => m.retrieval_id !== retrievalId);
      localStorage.setItem(LocalStorageService.METADATA_KEY, JSON.stringify(filteredMetadata));
    } catch (error) {
      console.error('Failed to remove from metadata index:', error);
    }
  }

  /**
   * Get the metadata index
   */
  private getMetadataIndex(): StorageMetadata[] {
    try {
      const stored = localStorage.getItem(LocalStorageService.METADATA_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get metadata index:', error);
      return [];
    }
  }

  /**
   * Validate retrieval ID format
   */
  private validateRetrievalId(retrievalId: string): boolean {
    // Should start with 'FS' and be followed by alphanumeric characters
    return /^FS[a-zA-Z0-9]{12}$/.test(retrievalId);
  }

  /**
   * Validate encrypted package structure
   */
  private validateEncryptedPackage(pkg: any): pkg is EncryptedPackage {
    return (
      typeof pkg === 'object' &&
      typeof pkg.encrypted_document === 'string' &&
      typeof pkg.encrypted_key_for_sender === 'string' &&
      typeof pkg.encrypted_key_for_recipient === 'string' &&
      typeof pkg.sender_address === 'string' &&
      typeof pkg.recipient_address === 'string' &&
      typeof pkg.filename === 'string' &&
      typeof pkg.file_size === 'number' &&
      typeof pkg.timestamp === 'number' &&
      typeof pkg.retrieval_id === 'string'
    );
  }

  /**
   * Format bytes to human readable string
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Export singleton instance
export const localStorageService = new LocalStorageService();
