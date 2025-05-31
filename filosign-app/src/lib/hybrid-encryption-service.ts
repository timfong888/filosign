import { publicKeyService } from './public-key-service';

export interface EncryptedPackage {
  encrypted_document: string; // Base64 encoded
  encrypted_key_for_sender: string; // ECIES encrypted AES key
  encrypted_key_for_recipient: string; // ECIES encrypted AES key
  sender_address: string;
  recipient_address: string;
  filename: string;
  file_size: number;
  timestamp: number;
  retrieval_id: string;
}

export interface DecryptedDocument {
  filename: string;
  content: Blob;
}

export class HybridEncryptionService {
  /**
   * Encrypt a document for both sender and recipient
   */
  async encryptDocument(
    file: File,
    senderAddress: string,
    recipientAddress: string
  ): Promise<EncryptedPackage> {
    try {
      // Get public keys for both parties
      const senderPublicKey = await publicKeyService.getPublicKey(senderAddress);
      const recipientPublicKey = await publicKeyService.getPublicKey(recipientAddress);

      if (!senderPublicKey) {
        throw new Error('Sender public key not found. Please ensure wallet is connected and key is discovered.');
      }
      if (!recipientPublicKey) {
        throw new Error('Recipient public key not found. Please ensure recipient has connected their wallet.');
      }

      // Convert file to Uint8Array
      const fileData = new Uint8Array(await file.arrayBuffer());

      // Generate random AES key
      const aesKey = await this.generateAESKey();

      // Encrypt document with AES
      const encryptedDocument = await this.encryptWithAES(fileData, aesKey);

      // Export AES key for encryption
      const exportedAESKey = await crypto.subtle.exportKey('raw', aesKey);

      // Encrypt AES key for both parties using ECIES
      const encryptedKeyForSender = await this.encryptKeyWithECIES(
        new Uint8Array(exportedAESKey),
        senderPublicKey
      );
      const encryptedKeyForRecipient = await this.encryptKeyWithECIES(
        new Uint8Array(exportedAESKey),
        recipientPublicKey
      );

      // Generate retrieval ID
      const retrievalId = this.generateRetrievalId(senderAddress, recipientAddress, file.name);

      // Create encrypted package
      const encryptedPackage: EncryptedPackage = {
        encrypted_document: this.arrayBufferToBase64(encryptedDocument),
        encrypted_key_for_sender: this.arrayBufferToBase64(encryptedKeyForSender),
        encrypted_key_for_recipient: this.arrayBufferToBase64(encryptedKeyForRecipient),
        sender_address: senderAddress,
        recipient_address: recipientAddress,
        filename: file.name,
        file_size: file.size,
        timestamp: Date.now(),
        retrieval_id: retrievalId
      };

      return encryptedPackage;
    } catch (error) {
      console.error('Document encryption failed:', error);
      throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Decrypt a document for an authorized user
   */
  async decryptDocument(
    encryptedPackage: EncryptedPackage,
    userAddress: string,
    privateKey: string
  ): Promise<DecryptedDocument> {
    try {
      // Determine which encrypted key to use
      let encryptedAESKey: string;
      if (userAddress.toLowerCase() === encryptedPackage.sender_address.toLowerCase()) {
        encryptedAESKey = encryptedPackage.encrypted_key_for_sender;
      } else if (userAddress.toLowerCase() === encryptedPackage.recipient_address.toLowerCase()) {
        encryptedAESKey = encryptedPackage.encrypted_key_for_recipient;
      } else {
        throw new Error('Unauthorized: User is not the sender or recipient of this document');
      }

      // Decrypt AES key using ECIES
      const encryptedKeyData = this.base64ToArrayBuffer(encryptedAESKey);
      const decryptedAESKeyData = await this.decryptKeyWithECIES(encryptedKeyData, privateKey);

      // Import AES key
      const aesKey = await crypto.subtle.importKey(
        'raw',
        decryptedAESKeyData,
        { name: 'AES-GCM' },
        false,
        ['decrypt']
      );

      // Decrypt document
      const encryptedDocumentData = this.base64ToArrayBuffer(encryptedPackage.encrypted_document);
      const decryptedDocument = await this.decryptWithAES(encryptedDocumentData, aesKey);

      // Create blob with original file type
      const blob = new Blob([decryptedDocument], { type: this.getFileType(encryptedPackage.filename) });

      return {
        filename: encryptedPackage.filename,
        content: blob
      };
    } catch (error) {
      console.error('Document decryption failed:', error);
      throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate a random AES-256 key
   */
  private async generateAESKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypt data with AES-GCM
   */
  private async encryptWithAES(data: Uint8Array, key: CryptoKey): Promise<Uint8Array> {
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM
    
    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      data
    );

    // Prepend IV to encrypted data
    const result = new Uint8Array(iv.length + encrypted.byteLength);
    result.set(iv);
    result.set(new Uint8Array(encrypted), iv.length);

    return result;
  }

  /**
   * Decrypt data with AES-GCM
   */
  private async decryptWithAES(encryptedData: Uint8Array, key: CryptoKey): Promise<Uint8Array> {
    // Extract IV (first 12 bytes) and encrypted data
    const iv = encryptedData.slice(0, 12);
    const encrypted = encryptedData.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      encrypted
    );

    return new Uint8Array(decrypted);
  }

  /**
   * Encrypt AES key with ECIES (simplified version using Web Crypto API)
   * Note: This is a simplified implementation. In production, use a proper ECIES library.
   */
  private async encryptKeyWithECIES(aesKeyData: Uint8Array, publicKey: string): Promise<Uint8Array> {
    try {
      // For now, we'll use a simplified approach with the public key
      // In a real implementation, you'd use a proper ECIES library like 'eciesjs'
      
      // Import the public key (this is simplified - real implementation would parse the hex public key)
      const keyData = this.hexToArrayBuffer(publicKey.slice(2)); // Remove '0x' prefix
      
      // For demonstration, we'll use AES encryption with a derived key
      // This is NOT proper ECIES - it's just for testing the flow
      const derivedKey = await crypto.subtle.importKey(
        'raw',
        keyData.slice(0, 32), // Use first 32 bytes as key material
        { name: 'AES-GCM' },
        false,
        ['encrypt']
      );

      return await this.encryptWithAES(aesKeyData, derivedKey);
    } catch (error) {
      console.error('ECIES encryption failed:', error);
      throw new Error('Failed to encrypt key with ECIES');
    }
  }

  /**
   * Decrypt AES key with ECIES (simplified version)
   * Note: This is a simplified implementation. In production, use a proper ECIES library.
   */
  private async decryptKeyWithECIES(encryptedKeyData: Uint8Array, privateKey: string): Promise<Uint8Array> {
    try {
      // This is a simplified implementation for testing
      // In a real implementation, you'd use the private key to decrypt via ECIES
      
      // For demonstration, derive the same key used in encryption
      const keyData = this.hexToArrayBuffer(privateKey.slice(2)); // Remove '0x' prefix
      
      const derivedKey = await crypto.subtle.importKey(
        'raw',
        keyData.slice(0, 32), // Use first 32 bytes as key material
        { name: 'AES-GCM' },
        false,
        ['decrypt']
      );

      return await this.decryptWithAES(encryptedKeyData, derivedKey);
    } catch (error) {
      console.error('ECIES decryption failed:', error);
      throw new Error('Failed to decrypt key with ECIES');
    }
  }

  /**
   * Generate a unique retrieval ID
   */
  private generateRetrievalId(senderAddress: string, recipientAddress: string, filename: string): string {
    const data = `${senderAddress}-${recipientAddress}-${filename}-${Date.now()}`;
    return 'FS' + this.simpleHash(data).slice(0, 12); // FiloSign prefix + 12 char hash
  }

  /**
   * Simple hash function for retrieval ID generation
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Convert ArrayBuffer to Base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Convert Base64 to ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  /**
   * Convert hex string to ArrayBuffer
   */
  private hexToArrayBuffer(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
  }

  /**
   * Get MIME type from filename
   */
  private getFileType(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'txt': 'text/plain',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif'
    };
    return mimeTypes[extension || ''] || 'application/octet-stream';
  }
}

// Export singleton instance
export const hybridEncryptionService = new HybridEncryptionService();
