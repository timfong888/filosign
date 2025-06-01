import {
  FileMetadata,
  FilePackage,
  PDPError,
  PDPErrorCode,
  PDPResponse,
  RetrievalInfo,
  StorageProvider,
  UploadResponse
} from '../types/pdp';
import { v4 as uuidv4 } from 'uuid';
import { PDPContractService } from './pdp-contract-service';

/**
 * Service for uploading files to Filecoin via PDP (Programmable Data Platform)
 * Handles file uploads, CID generation, and integration with storage providers
 */
export class FilecoinStorageService {
  private pdpContractService: PDPContractService;
  private storageProvider: StorageProvider;
  private isInitialized = false;

  /**
   * Create a new FilecoinStorageService instance
   * @param pdpContractService PDP contract service for deal creation
   */
  constructor(pdpContractService: PDPContractService) {
    this.pdpContractService = pdpContractService;

    // Set default storage provider from environment
    this.storageProvider = {
      id: process.env.NEXT_PUBLIC_FILECOIN_SP_ID || 'f01234',
      address: '0x0000000000000000000000000000000000000000', // Will be updated during initialization
      pricePerGiBPerEpoch: '1000000000', // Default price, will be updated
      verifiedPricePerGiBPerEpoch: '100000000' // Default verified price, will be updated
    };
  }

  /**
   * Initialize the storage service
   * Must be called before using other methods
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      // Get storage provider details (in a real implementation, this would fetch from a registry)
      // For MVP, we use the hardcoded provider from environment variables
      const providerId = process.env.NEXT_PUBLIC_FILECOIN_SP_ID || 'f01234';

      // In a real implementation, we would fetch provider details from a registry or API
      // For MVP, we'll use default values and the provider ID from environment
      this.storageProvider = {
        id: providerId,
        address: '0x0000000000000000000000000000000000000000', // Placeholder
        name: `Storage Provider ${providerId}`,
        minSize: 1024 * 1024, // 1 MB
        maxSize: 1024 * 1024 * 1024 * 10, // 10 GB
        pricePerGiBPerEpoch: '1000000000', // 1 GWei per GiB per epoch
        verifiedPricePerGiBPerEpoch: '100000000' // 0.1 GWei per GiB per epoch for verified deals
      };

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize FilecoinStorageService:', error);
      return false;
    }
  }

  /**
   * Upload a file to Filecoin via PDP
   * @param file File to upload
   * @param metadata File metadata
   * @param onProgress Progress callback
   * @returns Upload response with CID and deal information
   */
  async uploadFile(
    file: File,
    metadata: Partial<FileMetadata>,
    onProgress?: (progress: number) => void
  ): Promise<PDPResponse<UploadResponse>> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    if (!this.pdpContractService.isWalletConnected()) {
      return {
        success: false,
        error: {
          code: PDPErrorCode.WALLET_ERROR,
          message: 'Wallet not connected. Please connect your wallet before uploading.'
        }
      };
    }
    
    try {
      // Ensure we have the wallet address
      const walletAddress = await this.pdpContractService.getWalletAddress();
      if (!walletAddress) {
        throw new Error('Wallet address not available');
      }
      
      // Check file size limits
      if (file.size < (this.storageProvider.minSize || 0)) {
        return {
          success: false,
          error: {
            code: PDPErrorCode.INVALID_PARAMS,
            message: `File too small. Minimum size is ${this.formatSize(this.storageProvider.minSize || 0)}.`
          }
        };
      }
      
      if (file.size > (this.storageProvider.maxSize || Infinity)) {
        return {
          success: false,
          error: {
            code: PDPErrorCode.FILE_TOO_LARGE,
            message: `File too large. Maximum size is ${this.formatSize(this.storageProvider.maxSize || 0)}.`
          }
        };
      }
      
      // Report initial progress
      onProgress?.(0);
      
      // Calculate content hash (SHA-256)
      const contentHash = await this.calculateSHA256(file);
      
      // Prepare complete metadata
      const completeMetadata: FileMetadata = {
        filename: metadata.filename || file.name,
        size: file.size,
        mimeType: file.type || 'application/octet-stream',
        uploadedAt: Date.now(),
        description: metadata.description || '',
        contentHash,
        ownerAddress: walletAddress
      };
      
      // Create a file object with metadata
      const metadataFile = new File(
        [JSON.stringify(completeMetadata)],
        'metadata.json',
        { type: 'application/json' }
      );
      
      // Report progress - preparing upload
      onProgress?.(10);

      // Generate a mock CID for MVP (in real implementation, this would come from IPFS/Filecoin)
      // For MVP, we'll use a deterministic CID based on file content hash
      const cid = `bafybeig${contentHash.substring(0, 52)}`; // Mock CID format

      // Report progress - file processed
      onProgress?.(50);
      
      // Report progress - ready for deal creation
      onProgress?.(60);
      
      // Calculate storage cost based on file size and duration
      // For MVP, we'll use a fixed duration of 180 days (6 months)
      const durationDays = 180;
      const durationEpochs = durationDays * 2; // Approximately 2 epochs per day
      
      // Calculate price in attoFIL (simplified for MVP)
      // In a real implementation, this would use the provider's actual pricing
      const fileSizeGiB = file.size / (1024 * 1024 * 1024);
      const pricePerEpoch = BigInt(this.storageProvider.pricePerGiBPerEpoch) * BigInt(Math.ceil(fileSizeGiB * 100)) / 100n;
      const totalPrice = pricePerEpoch * BigInt(durationEpochs);
      
      // Convert to FIL for display (1 FIL = 10^18 attoFIL)
      const priceInFil = Number(totalPrice) / 1e18;
      
      // Report progress - creating deal
      onProgress?.(80);
      
      // Create a deal with the PDP contract
      const dealResult = await this.pdpContractService.createDeal({
        dataCid: cid,
        dataSize: file.size,
        duration: durationEpochs,
        providerId: this.storageProvider.id,
        isVerified: false, // For MVP, we use unverified deals
        price: priceInFil.toString(), // Convert to string for the contract
        clientAddress: walletAddress
      });
      
      if (!dealResult.success || !dealResult.data) {
        throw new Error(dealResult.error?.message || 'Failed to create storage deal');
      }
      
      // Report progress - deal created
      onProgress?.(90);
      
      // Generate a retrieval ID
      const retrievalId = `FS-${uuidv4().substring(0, 8).toUpperCase()}`;
      
      // Make payment for the deal
      const paymentResult = await this.pdpContractService.makePayment(
        dealResult.data.dealId,
        priceInFil.toString()
      );
      
      if (!paymentResult.success || !paymentResult.data) {
        throw new Error(paymentResult.error?.message || 'Failed to make payment for storage deal');
      }
      
      // Report progress - complete
      onProgress?.(100);
      
      // Return the upload response
      return {
        success: true,
        data: {
          cid,
          retrievalId,
          deal: dealResult.data,
          payment: paymentResult.data
        }
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error, PDPErrorCode.UPLOAD_FAILED, 'Failed to upload file to Filecoin')
      };
    }
  }

  /**
   * Retrieve a file by its retrieval ID
   * @param retrievalId Retrieval ID of the file
   * @returns Retrieval response with file content and metadata
   */
  async retrieveFile(retrievalId: string): Promise<PDPResponse<FilePackage>> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    try {
      // For MVP, we'll use a simplified approach to retrieve files
      // In a real implementation, this would use the PDP contract to verify the deal
      // and then retrieve the file from IPFS/Filecoin
      
      // Extract CID from retrieval ID (in a real implementation)
      // For MVP, we'll assume the retrieval ID is stored in a mapping somewhere
      // This is a placeholder implementation
      
      // Verify the deal is active
      // In a real implementation, this would check the contract
      
      // Retrieve file from web3.storage
      // This is a placeholder implementation
      
      return {
        success: false,
        error: {
          code: PDPErrorCode.RETRIEVAL_FAILED,
          message: 'File retrieval not implemented in MVP'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error, PDPErrorCode.RETRIEVAL_FAILED, 'Failed to retrieve file from Filecoin')
      };
    }
  }

  /**
   * Get information about a stored file
   * @param retrievalId Retrieval ID of the file
   * @returns Retrieval information
   */
  async getFileInfo(retrievalId: string): Promise<PDPResponse<RetrievalInfo>> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    try {
      // For MVP, this is a placeholder implementation
      // In a real implementation, this would query the PDP contract
      
      return {
        success: false,
        error: {
          code: PDPErrorCode.RETRIEVAL_FAILED,
          message: 'Get file info not implemented in MVP'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error, PDPErrorCode.RETRIEVAL_FAILED, 'Failed to get file information')
      };
    }
  }

  /**
   * Get available storage providers
   * @returns List of available storage providers
   */
  async getStorageProviders(): Promise<PDPResponse<StorageProvider[]>> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    // For MVP, we return just the single configured provider
    return {
      success: true,
      data: [this.storageProvider]
    };
  }

  /**
   * Calculate SHA-256 hash of a file
   * @param file File to hash
   * @returns Hex string of SHA-256 hash
   */
  private async calculateSHA256(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const buffer = e.target?.result;
          if (!buffer) {
            reject(new Error('Failed to read file'));
            return;
          }
          
          const hashBuffer = await crypto.subtle.digest('SHA-256', buffer as ArrayBuffer);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
          resolve(hashHex);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Format file size for display
   * @param bytes Size in bytes
   * @returns Formatted size string
   */
  private formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }

  /**
   * Handle and format errors
   * @param error Original error
   * @param code Error code
   * @param message Human-readable message
   * @returns Formatted PDP error
   */
  private handleError(error: any, code: PDPErrorCode, message: string): PDPError {
    console.error(`${code}: ${message}`, error);
    
    let errorMessage = message;
    if (error?.message) {
      errorMessage = `${message}: ${error.message}`;
    }
    
    return {
      code,
      message: errorMessage,
      originalError: error
    };
  }
}

/**
 * Create a FilecoinStorageService instance with the default PDP contract service
 * @returns Configured FilecoinStorageService
 */
export function createFilecoinStorageService(): FilecoinStorageService {
  const { createPDPContractService } = require('./pdp-contract-service');
  const pdpContractService = createPDPContractService();
  return new FilecoinStorageService(pdpContractService);
}
