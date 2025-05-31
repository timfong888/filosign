import { ethers } from 'ethers';

export interface PublicKeyCache {
  [address: string]: {
    publicKey: string;
    timestamp: number;
    verified: boolean;
  };
}

export class PublicKeyService {
  private static readonly STORAGE_KEY = 'filosign_public_keys';
  private static readonly KEY_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

  /**
   * Discover and cache a public key for a wallet address
   */
  async discoverPublicKey(walletAddress: string, signer: any): Promise<string> {
    try {
      // Check if we already have a valid cached key
      const cachedKey = await this.getPublicKey(walletAddress);
      if (cachedKey) {
        return cachedKey;
      }

      // Generate standard message for key discovery
      const message = this.generateStandardMessage(walletAddress);
      
      // Request MetaMask signature
      const signature = await signer.signMessage(message);
      
      // Extract public key from signature
      const publicKey = this.extractPublicKeyFromSignature(message, signature);
      
      // Validate that the public key matches the wallet address
      if (!this.validatePublicKey(walletAddress, publicKey)) {
        throw new Error('Public key validation failed - derived address does not match wallet address');
      }

      // Cache the validated public key
      await this.cachePublicKey(walletAddress, publicKey);
      
      return publicKey;
    } catch (error) {
      console.error('Failed to discover public key:', error);
      throw new Error(`Public key discovery failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get cached public key for an address
   */
  async getPublicKey(walletAddress: string): Promise<string | null> {
    try {
      const cache = this.getCache();
      const entry = cache[walletAddress.toLowerCase()];
      
      if (!entry) {
        return null;
      }

      // Check if key has expired
      if (Date.now() - entry.timestamp > PublicKeyService.KEY_EXPIRY_MS) {
        await this.removeCachedKey(walletAddress);
        return null;
      }

      // Verify the key is still valid
      if (!entry.verified || !this.validatePublicKey(walletAddress, entry.publicKey)) {
        await this.removeCachedKey(walletAddress);
        return null;
      }

      return entry.publicKey;
    } catch (error) {
      console.error('Failed to get cached public key:', error);
      return null;
    }
  }

  /**
   * Cache a public key for future use
   */
  async cachePublicKey(walletAddress: string, publicKey: string): Promise<void> {
    try {
      const cache = this.getCache();
      
      cache[walletAddress.toLowerCase()] = {
        publicKey,
        timestamp: Date.now(),
        verified: true
      };

      localStorage.setItem(PublicKeyService.STORAGE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error('Failed to cache public key:', error);
      throw new Error('Failed to cache public key');
    }
  }

  /**
   * Remove a cached key
   */
  async removeCachedKey(walletAddress: string): Promise<void> {
    try {
      const cache = this.getCache();
      delete cache[walletAddress.toLowerCase()];
      localStorage.setItem(PublicKeyService.STORAGE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error('Failed to remove cached key:', error);
    }
  }

  /**
   * Clear all cached keys
   */
  async clearCache(): Promise<void> {
    try {
      localStorage.removeItem(PublicKeyService.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear key cache:', error);
    }
  }

  /**
   * Generate standard message for key discovery
   */
  private generateStandardMessage(walletAddress: string): string {
    const timestamp = Date.now();
    return `FiloSign Key Discovery\nAddress: ${walletAddress}\nTimestamp: ${timestamp}`;
  }

  /**
   * Extract public key from message signature
   */
  private extractPublicKeyFromSignature(message: string, signature: string): string {
    try {
      // Create message hash
      const messageHash = ethers.utils.hashMessage(message);
      
      // Recover public key from signature
      const recoveredPublicKey = ethers.utils.recoverPublicKey(messageHash, signature);
      
      return recoveredPublicKey;
    } catch (error) {
      console.error('Failed to extract public key from signature:', error);
      throw new Error('Failed to extract public key from signature');
    }
  }

  /**
   * Validate that public key matches wallet address
   */
  private validatePublicKey(walletAddress: string, publicKey: string): boolean {
    try {
      // Derive address from public key
      const derivedAddress = ethers.utils.computeAddress(publicKey);
      
      // Compare addresses (case insensitive)
      return derivedAddress.toLowerCase() === walletAddress.toLowerCase();
    } catch (error) {
      console.error('Failed to validate public key:', error);
      return false;
    }
  }

  /**
   * Get cached keys from localStorage
   */
  private getCache(): PublicKeyCache {
    try {
      const cached = localStorage.getItem(PublicKeyService.STORAGE_KEY);
      return cached ? JSON.parse(cached) : {};
    } catch (error) {
      console.error('Failed to get key cache:', error);
      return {};
    }
  }

  /**
   * Get all cached addresses (for debugging)
   */
  async getCachedAddresses(): Promise<string[]> {
    const cache = this.getCache();
    return Object.keys(cache);
  }

  /**
   * Check if address has cached key
   */
  async hasCachedKey(walletAddress: string): Promise<boolean> {
    const key = await this.getPublicKey(walletAddress);
    return key !== null;
  }
}

// Export singleton instance
export const publicKeyService = new PublicKeyService();
