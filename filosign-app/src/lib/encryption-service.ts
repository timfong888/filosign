import { publicKeyService } from './public-key-service';

export interface EncryptedDocument {
  encryptedData: string;
  encryptedKeyForAlice: string;  // ECIES encrypted AES key for first party
  encryptedKeyForBob: string;    // ECIES encrypted AES key for second party
  encryptionMethod: 'privacy-preserving-dual-access';
  // NOTE: No addresses stored - privacy-preserving design
}

export class EncryptionService {
  /**
   * Encrypt document for dual access (privacy-preserving)
   * Uses hybrid encryption: AES for document, ECIES for key encryption
   * No addresses stored - pure cryptographic access control
   */
  async encryptDocument(
    fileData: string,
    alicePublicKey: string,
    bobPublicKey: string
  ): Promise<EncryptedDocument> {
    try {
      console.log('🔐 Starting encryption process...');
      console.log('📄 File data length:', fileData.length);
      console.log('🔑 Alice public key:', alicePublicKey.substring(0, 20) + '...');
      console.log('🔑 Bob public key:', bobPublicKey.substring(0, 20) + '...');

      // Generate a random AES key for this document (simulated for MVP)
      const aesKey = this.generateMockAESKey();
      console.log('🎲 Generated AES key:', aesKey);

      // Encrypt the document with AES (simulated for MVP)
      const encryptionPayload = {
        data: fileData,
        timestamp: Date.now(),
        aesKey // In production, this would be the actual encrypted content
      };

      // Encrypt document with AES (simulated as base64 for MVP)
      const encryptedData = btoa(JSON.stringify(encryptionPayload));
      console.log('📦 Encrypted document length:', encryptedData.length);

      // Encrypt the AES key for both parties (simulated for MVP)
      // In production, these would be ECIES encrypted versions of the AES key
      const encryptedKeyForAlice = this.simulateECIESEncryption(aesKey, alicePublicKey);
      const encryptedKeyForBob = this.simulateECIESEncryption(aesKey, bobPublicKey);

      console.log('🔐 Encrypted key for Alice:', encryptedKeyForAlice.substring(0, 30) + '...');
      console.log('🔐 Encrypted key for Bob:', encryptedKeyForBob.substring(0, 30) + '...');
      console.log('✅ Encryption complete!');

      return {
        encryptedData,
        encryptedKeyForAlice,
        encryptedKeyForBob,
        encryptionMethod: 'privacy-preserving-dual-access'
      };
    } catch (error) {
      console.error('❌ Encryption failed:', error);
      throw new Error('Failed to encrypt document');
    }
  }

  /**
   * Decrypt document using pure cryptographic access control
   * Tries both encrypted keys - if either works, user is authorized
   */
  async decryptDocument(
    encryptedDoc: EncryptedDocument,
    userPublicKey: string
  ): Promise<string | null> {
    try {
      console.log('Privacy-preserving decryption attempt:', {
        userPublicKey: userPublicKey.substring(0, 20) + '...',
        encryptionMethod: encryptedDoc.encryptionMethod
      });

      // Try to decrypt with the first encrypted key (Alice's key)
      try {
        const aesKey = this.simulateECIESDecryption(encryptedDoc.encryptedKeyForAlice, userPublicKey);
        if (aesKey) {
          const decryptedData = this.decryptWithAESKey(encryptedDoc.encryptedData, aesKey);
          console.log('Decryption successful - user is Alice (first authorized party)');
          return decryptedData;
        }
      } catch (error) {
        // Failed to decrypt with Alice's key, try Bob's key
        console.log('Failed to decrypt with first key, trying second key...');
      }

      // Try to decrypt with the second encrypted key (Bob's key)
      try {
        const aesKey = this.simulateECIESDecryption(encryptedDoc.encryptedKeyForBob, userPublicKey);
        if (aesKey) {
          const decryptedData = this.decryptWithAESKey(encryptedDoc.encryptedData, aesKey);
          console.log('Decryption successful - user is Bob (second authorized party)');
          return decryptedData;
        }
      } catch (error) {
        // Failed to decrypt with Bob's key as well
        console.log('Failed to decrypt with second key');
      }

      // If we get here, user couldn't decrypt either key
      console.log('Access denied: User cannot decrypt any of the encrypted keys');
      return null;

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
   * Verify that a user can access a document using cryptographic proof
   * No address checking - pure cryptographic access control
   */
  async canUserAccessDocument(
    encryptedDoc: EncryptedDocument,
    userPublicKey: string
  ): Promise<{ canAccess: boolean; role: 'alice' | 'bob' | 'none'; reason?: string }> {
    try {
      // Try to decrypt with Alice's key
      try {
        const aesKey = this.simulateECIESDecryption(encryptedDoc.encryptedKeyForAlice, userPublicKey);
        if (aesKey) {
          return {
            canAccess: true,
            role: 'alice'
          };
        }
      } catch (error) {
        // Continue to try Bob's key
      }

      // Try to decrypt with Bob's key
      try {
        const aesKey = this.simulateECIESDecryption(encryptedDoc.encryptedKeyForBob, userPublicKey);
        if (aesKey) {
          return {
            canAccess: true,
            role: 'bob'
          };
        }
      } catch (error) {
        // User cannot decrypt either key
      }

      return {
        canAccess: false,
        role: 'none',
        reason: 'Cannot decrypt any of the encrypted keys'
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

  /**
   * Helper methods for MVP simulation
   */
  private generateMockAESKey(): string {
    // In production, this would generate a real 256-bit AES key
    return 'mock-aes-key-' + Math.random().toString(36).substring(2, 15);
  }

  private simulateECIESEncryption(aesKey: string, publicKey: string): string {
    // In production, this would use ECIES to encrypt the AES key with the public key
    // For MVP, we'll create a deterministic "encrypted" key based on both inputs
    const combined = aesKey + '|' + publicKey;
    return 'ecies-encrypted-' + btoa(combined);
  }

  private simulateECIESDecryption(encryptedKey: string, userPublicKey: string): string | null {
    try {
      // In production, this would use ECIES to decrypt with the user's private key
      // For MVP, we'll reverse the simulation
      if (!encryptedKey.startsWith('ecies-encrypted-')) {
        return null;
      }

      const combined = atob(encryptedKey.replace('ecies-encrypted-', ''));
      const [aesKey, originalPublicKey] = combined.split('|');

      // Check if the user's public key matches the one used for encryption
      if (originalPublicKey === userPublicKey) {
        return aesKey;
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  private decryptWithAESKey(encryptedData: string, aesKey: string): string {
    try {
      // In production, this would use AES to decrypt the document
      // For MVP, we'll decode and verify the AES key matches
      const payload = JSON.parse(atob(encryptedData));

      if (payload.aesKey === aesKey) {
        return payload.data;
      }

      throw new Error('AES key mismatch');
    } catch (error) {
      throw new Error('Failed to decrypt with AES key');
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
