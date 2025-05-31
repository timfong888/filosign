import { publicKeyService } from './public-key-service';

export interface EncryptedDocument {
  encryptedData: string;
  senderPublicKey: string;
  recipientPublicKey: string;
  senderAddress: string;
  recipientAddress: string;
  encryptionMethod: 'dual-key-access';
}

export class EncryptionService {
  /**
   * Encrypt document for dual access (sender and recipient)
   * In a real implementation, this would use proper asymmetric encryption
   * For MVP, we'll use a dual-key system that allows both parties to decrypt
   */
  async encryptDocument(
    fileData: string,
    senderAddress: string,
    senderPublicKey: string,
    recipientAddress: string,
    recipientPublicKey: string
  ): Promise<EncryptedDocument> {
    try {
      // For MVP: Create a dual-access encrypted format
      // In production, this would use proper ECIES or similar encryption
      const encryptionPayload = {
        data: fileData,
        timestamp: Date.now(),
        senderAddress,
        recipientAddress,
        senderPublicKey,
        recipientPublicKey
      };

      // Base64 encode the payload (in production, this would be proper encryption)
      const encryptedData = btoa(JSON.stringify(encryptionPayload));

      return {
        encryptedData,
        senderPublicKey,
        recipientPublicKey,
        senderAddress,
        recipientAddress,
        encryptionMethod: 'dual-key-access'
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt document');
    }
  }

  /**
   * Decrypt document using user's wallet address and public key
   * Allows both sender and recipient to decrypt
   */
  async decryptDocument(
    encryptedDoc: EncryptedDocument,
    userAddress: string,
    userPublicKey: string
  ): Promise<string | null> {
    try {
      console.log('Decryption attempt:', {
        userAddress,
        senderAddress: encryptedDoc.senderAddress,
        recipientAddress: encryptedDoc.recipientAddress,
        userPublicKey: userPublicKey.substring(0, 20) + '...',
        senderPublicKey: encryptedDoc.senderPublicKey.substring(0, 20) + '...',
        recipientPublicKey: encryptedDoc.recipientPublicKey.substring(0, 20) + '...'
      });

      // Check if user is either sender or recipient (exact address match)
      const isSender = encryptedDoc.senderAddress === userAddress;
      const isRecipient = encryptedDoc.recipientAddress === userAddress;

      if (!isSender && !isRecipient) {
        console.error('Access denied: User is neither sender nor recipient');
        return null;
      }

      // Verify public key matches the user's address
      const expectedPublicKey = isSender ? encryptedDoc.senderPublicKey : encryptedDoc.recipientPublicKey;
      
      if (userPublicKey !== expectedPublicKey) {
        console.error('Public key mismatch:', {
          provided: userPublicKey.substring(0, 20) + '...',
          expected: expectedPublicKey.substring(0, 20) + '...',
          role: isSender ? 'sender' : 'recipient'
        });
        return null;
      }

      // Decrypt the data (for MVP, just decode base64)
      const decryptedPayload = JSON.parse(atob(encryptedDoc.encryptedData));
      
      // Verify payload integrity
      if (decryptedPayload.senderAddress !== encryptedDoc.senderAddress ||
          decryptedPayload.recipientAddress !== encryptedDoc.recipientAddress) {
        console.error('Payload integrity check failed');
        return null;
      }

      console.log('Decryption successful for:', isSender ? 'sender' : 'recipient');
      return decryptedPayload.data;

    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  }

  /**
   * Get public key for an address (with caching)
   */
  async getPublicKeyForAddress(address: string): Promise<string | null> {
    try {
      return await publicKeyService.getPublicKey(address);
    } catch (error) {
      console.error('Failed to get public key for address:', address, error);
      return null;
    }
  }

  /**
   * Verify that a user can access a document
   */
  async canUserAccessDocument(
    encryptedDoc: EncryptedDocument,
    userAddress: string
  ): Promise<{ canAccess: boolean; role: 'sender' | 'recipient' | 'none'; reason?: string }> {
    try {
      // Check if user is sender or recipient
      const isSender = encryptedDoc.senderAddress === userAddress;
      const isRecipient = encryptedDoc.recipientAddress === userAddress;

      if (!isSender && !isRecipient) {
        return {
          canAccess: false,
          role: 'none',
          reason: 'User is neither sender nor recipient'
        };
      }

      // Get user's public key
      const userPublicKey = await this.getPublicKeyForAddress(userAddress);
      if (!userPublicKey) {
        return {
          canAccess: false,
          role: isSender ? 'sender' : 'recipient',
          reason: 'Public key not available for user'
        };
      }

      // Verify public key matches
      const expectedPublicKey = isSender ? encryptedDoc.senderPublicKey : encryptedDoc.recipientPublicKey;
      if (userPublicKey !== expectedPublicKey) {
        return {
          canAccess: false,
          role: isSender ? 'sender' : 'recipient',
          reason: 'Public key mismatch'
        };
      }

      return {
        canAccess: true,
        role: isSender ? 'sender' : 'recipient'
      };

    } catch (error) {
      console.error('Access verification failed:', error);
      return {
        canAccess: false,
        role: 'none',
        reason: 'Verification error'
      };
    }
  }
}

// Export singleton instance
export const encryptionService = new EncryptionService();

/**
 * PRODUCTION ENCRYPTION NOTES:
 * 
 * For a production system, replace the MVP encryption with:
 * 
 * 1. **ECIES (Elliptic Curve Integrated Encryption Scheme)**:
 *    - Encrypt with recipient's public key
 *    - Only recipient's private key can decrypt
 * 
 * 2. **Dual Access Implementation**:
 *    - Encrypt document with symmetric key (AES)
 *    - Encrypt symmetric key twice:
 *      a) With sender's public key
 *      b) With recipient's public key
 *    - Store both encrypted keys with document
 * 
 * 3. **Libraries to use**:
 *    - `@noble/secp256k1` for ECDH key exchange
 *    - `@noble/ciphers` for AES encryption
 *    - `@noble/hashes` for key derivation
 * 
 * 4. **Security considerations**:
 *    - Use proper key derivation (HKDF)
 *    - Add authentication (HMAC)
 *    - Include nonce/IV for each encryption
 *    - Verify public key ownership before encryption
 */
