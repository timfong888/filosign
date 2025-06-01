import { useState, useCallback, useEffect } from 'react';
import { createPDPContractService } from '../services/pdp-contract-service';
import { createFilecoinStorageService } from '../services/filecoin-storage-service';
import { FileMetadata, PDPErrorCode, UploadResponse } from '../types/pdp';

// Upload workflow phases
export type UploadPhase = 
  | 'idle'
  | 'connecting'
  | 'uploading'
  | 'creating-deal'
  | 'paying'
  | 'complete'
  | 'error';

// Hook return state
export interface UploadPDPState {
  phase: UploadPhase;
  progress: number;
  result: UploadResponse | null;
  error: {
    code: PDPErrorCode;
    message: string;
  } | null;
  isWalletConnected: boolean;
  walletAddress: string | null;
}

// Upload options
export interface UploadPDPOptions {
  metadata?: Partial<FileMetadata>;
  onProgress?: (progress: number) => void;
  onPhaseChange?: (phase: UploadPhase) => void;
  onComplete?: (result: UploadResponse) => void;
  onError?: (error: { code: PDPErrorCode; message: string }) => void;
}

/**
 * React hook for the complete PDP upload workflow
 * Handles wallet connection, file upload, deal creation, and payment
 */
export function useUploadPDP() {
  // Initialize services
  const pdpContractService = createPDPContractService();
  const filecoinStorageService = createFilecoinStorageService();
  
  // State
  const [state, setState] = useState<UploadPDPState>({
    phase: 'idle',
    progress: 0,
    result: null,
    error: null,
    isWalletConnected: false,
    walletAddress: null
  });

  // Update state helper
  const updateState = useCallback((updates: Partial<UploadPDPState>) => {
    setState(current => ({ ...current, ...updates }));
  }, []);

  // Connect wallet
  const connectWallet = useCallback(async () => {
    if (state.isWalletConnected) return true;
    
    try {
      updateState({ phase: 'connecting', progress: 0, error: null });
      
      // Check if MetaMask is available
      if (!window.ethereum) {
        throw new Error('MetaMask not detected. Please install MetaMask and try again.');
      }
      
      // Request account access
      const walletAddress = await pdpContractService.connectWallet(window.ethereum);
      
      // Initialize storage service
      await filecoinStorageService.initialize();
      
      updateState({ 
        isWalletConnected: true, 
        walletAddress,
        progress: 100
      });
      
      return true;
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to connect wallet';
      
      updateState({
        phase: 'error',
        progress: 0,
        error: {
          code: PDPErrorCode.WALLET_ERROR,
          message: errorMessage
        },
        isWalletConnected: false,
        walletAddress: null
      });
      
      return false;
    }
  }, [state.isWalletConnected, pdpContractService, filecoinStorageService, updateState]);

  // Start upload workflow
  const startUpload = useCallback(async (
    file: File,
    options: UploadPDPOptions = {}
  ) => {
    // Reset state
    updateState({
      phase: 'idle',
      progress: 0,
      result: null,
      error: null
    });
    
    try {
      // Step 1: Connect wallet if not already connected
      if (!state.isWalletConnected) {
        updateState({ phase: 'connecting', progress: 0 });
        options.onPhaseChange?.('connecting');
        
        const connected = await connectWallet();
        if (!connected) return;
      }
      
      // Step 2: Upload file to Filecoin
      updateState({ phase: 'uploading', progress: 0 });
      options.onPhaseChange?.('uploading');
      
      const uploadResult = await filecoinStorageService.uploadFile(
        file,
        options.metadata || {},
        (progress) => {
          updateState({ progress });
          options.onProgress?.(progress);
        }
      );
      
      if (!uploadResult.success || !uploadResult.data) {
        throw new Error(uploadResult.error?.message || 'File upload failed');
      }
      
      // Upload complete
      updateState({ 
        phase: 'complete',
        progress: 100,
        result: uploadResult.data
      });
      
      options.onPhaseChange?.('complete');
      options.onProgress?.(100);
      options.onComplete?.(uploadResult.data);
      
      return uploadResult.data;
    } catch (error: any) {
      console.error('Upload workflow failed:', error);
      
      let errorCode = PDPErrorCode.UNKNOWN;
      let errorMessage = 'Unknown error occurred during upload';
      
      // Extract error details if available
      if (error?.code && Object.values(PDPErrorCode).includes(error.code)) {
        errorCode = error.code as PDPErrorCode;
        errorMessage = error.message || errorMessage;
      } else if (error?.message) {
        errorMessage = error.message;
        
        // Try to determine error type from message
        if (errorMessage.includes('wallet') || errorMessage.includes('MetaMask')) {
          errorCode = PDPErrorCode.WALLET_ERROR;
        } else if (errorMessage.includes('upload')) {
          errorCode = PDPErrorCode.UPLOAD_FAILED;
        } else if (errorMessage.includes('contract')) {
          errorCode = PDPErrorCode.CONTRACT_ERROR;
        } else if (errorMessage.includes('payment')) {
          errorCode = PDPErrorCode.PAYMENT_FAILED;
        }
      }
      
      const errorInfo = {
        code: errorCode,
        message: errorMessage
      };
      
      updateState({
        phase: 'error',
        error: errorInfo
      });
      
      options.onPhaseChange?.('error');
      options.onError?.(errorInfo);
      
      return null;
    }
  }, [state.isWalletConnected, connectWallet, filecoinStorageService, updateState]);

  // Check wallet connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum && pdpContractService.isWalletConnected()) {
        const address = await pdpContractService.getWalletAddress();
        if (address) {
          updateState({
            isWalletConnected: true,
            walletAddress: address
          });
        }
      }
    };
    
    checkConnection();
    
    // Listen for account changes
    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected wallet
        updateState({
          isWalletConnected: false,
          walletAddress: null
        });
      } else {
        // User switched account
        updateState({
          isWalletConnected: true,
          walletAddress: accounts[0]
        });
      }
    };
    
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, [pdpContractService, updateState]);

  return {
    ...state,
    connectWallet,
    startUpload
  };
}
