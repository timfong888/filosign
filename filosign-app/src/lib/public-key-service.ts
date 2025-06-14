import { hashMessage, recoverPublicKey, getAddress, recoverAddress } from 'viem';

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
  async discoverPublicKey(walletAddress: string, signMessageAsync: (args: { message: string }) => Promise<string>): Promise<string> {
    try {
      console.log('🔍 Starting public key discovery for:', walletAddress);

      // Check if we already have a valid cached key
      const cachedKey = await this.getPublicKey(walletAddress);
      if (cachedKey) {
        console.log('✅ Found cached public key for:', walletAddress);
        return cachedKey;
      }

      console.log('📝 Generating signature message...');
      // Generate standard message for key discovery
      const message = this.generateStandardMessage(walletAddress);
      console.log('📄 Message to sign:', message);

      console.log('✍️ Requesting wallet signature...');
      // Request wallet signature using Wagmi
      const signature = await signMessageAsync({ message });
      console.log('📝 Received signature:', signature.substring(0, 20) + '...');

      console.log('🔑 Extracting public key from signature...');
      // Extract public key from signature
      const publicKey = await this.extractPublicKeyFromSignature(message, signature);
      console.log('🔑 Extracted public key:', publicKey.substring(0, 20) + '...');

      console.log('✅ Validating signature...');
      // Validate that the signature matches the wallet address
      if (!await this.validateSignature(walletAddress, message, signature)) {
        throw new Error('Signature validation failed - recovered address does not match wallet address');
      }

      console.log('💾 Caching public key...');
      // Cache the validated public key
      await this.cachePublicKey(walletAddress, publicKey);

      console.log('🎉 Public key discovery complete for:', walletAddress);
      return publicKey;
    } catch (error) {
      console.error('❌ Failed to discover public key:', error);
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
      if (!entry.verified) {
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
  private async extractPublicKeyFromSignature(message: string, signature: string): Promise<string> {
    try {
      // Create message hash using viem
      const messageHash = hashMessage(message);

      // Recover public key from signature using viem
      const recoveredPublicKey = await recoverPublicKey({
        hash: messageHash,
        signature: signature as `0x${string}`
      });

      return recoveredPublicKey;
    } catch (error) {
      console.error('Failed to extract public key from signature:', error);
      throw new Error('Failed to extract public key from signature');
    }
  }

  /**
   * Validate that signature was created by the wallet address
   */
  private async validateSignature(walletAddress: string, message: string, signature: string): Promise<boolean> {
    try {
      // Create message hash using viem
      const messageHash = hashMessage(message);

      // Recover the address that created this signature
      const recoveredAddress = await recoverAddress({
        hash: messageHash,
        signature: signature as `0x${string}`
      });

      // Normalize both addresses to checksum format for comparison
      const normalizedWalletAddress = getAddress(walletAddress);
      const normalizedRecoveredAddress = getAddress(recoveredAddress);

      // Compare addresses
      return normalizedRecoveredAddress === normalizedWalletAddress;
    } catch (error) {
      console.error('Failed to validate signature:', error);
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
