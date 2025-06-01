import { useState, useCallback, useEffect } from 'react';
import { localStorageInterface, StorageUploadOptions } from '../services/local-storage-interface';
import { useAccount } from 'wagmi';

// Upload workflow phases
export type UploadPhase = 
  | 'idle'
  | 'connecting'
  | 'encrypting'
  | 'storing'
  | 'complete'
  | 'error';

// Hook return state
export interface UploadLocalState {
  phase: UploadPhase;
  progress: number;
  result: {
    retrievalId: string;
    cid: string;
  } | null;
  error: string | null;
  isWalletConnected: boolean;
  walletAddress: string | null;
}

// Upload options
export interface UploadLocalOptions {
  recipientAddress: string;
  metadata?: {
    filename?: string;
    description?: string;
  };
  onProgress?: (progress: number) => void;
  onPhaseChange?: (phase: UploadPhase) => void;
  onComplete?: (result: { retrievalId: string; cid: string }) => void;
  onError?: (error: string) => void;
}

/**
 * React hook for local storage upload workflow
 * This replaces the PDP upload hook for MVP testing
 */
export function useUploadLocal() {
  // Get wallet connection from wagmi
  const { address: walletAddress, isConnected: isWalletConnected } = useAccount();
  
  // State
  const [state, setState] = useState<UploadLocalState>({
    phase: 'idle',
    progress: 0,
    result: null,
    error: null,
    isWalletConnected: false,
    walletAddress: null
  });

  // Update state helper
  const updateState = useCallback((updates: Partial<UploadLocalState>) => {
    setState(current => ({ ...current, ...updates }));
  }, []);

  // Update wallet connection state when wagmi state changes
  useEffect(() => {
    updateState({
      isWalletConnected,
      walletAddress: walletAddress || null
    });
  }, [isWalletConnected, walletAddress, updateState]);

  // Start upload workflow
  const startUpload = useCallback(async (
    file: File,
    options: UploadLocalOptions
  ) => {
    // Reset state
    updateState({
      phase: 'idle',
      progress: 0,
      result: null,
      error: null
    });
    
    try {
      // Check wallet connection
      if (!isWalletConnected || !walletAddress) {
        throw new Error('Wallet not connected. Please connect your wallet first.');
      }
      
      // Step 1: Start encryption
      updateState({ phase: 'encrypting', progress: 0 });
      options.onPhaseChange?.('encrypting');
      
      // Step 2: Upload to local storage
      updateState({ phase: 'storing', progress: 20 });
      options.onPhaseChange?.('storing');
      
      const uploadOptions: StorageUploadOptions = {
        file,
        senderAddress: walletAddress,
        recipientAddress: options.recipientAddress,
        metadata: options.metadata,
        onProgress: (progress) => {
          updateState({ progress });
          options.onProgress?.(progress);
        }
      };
      
      const result = await localStorageInterface.uploadFile(uploadOptions);
      
      if (!result.success || !result.retrievalId || !result.cid) {
        throw new Error(result.error || 'Upload failed');
      }
      
      // Upload complete
      const uploadResult = {
        retrievalId: result.retrievalId,
        cid: result.cid
      };
      
      updateState({ 
        phase: 'complete',
        progress: 100,
        result: uploadResult
      });
      
      options.onPhaseChange?.('complete');
      options.onComplete?.(uploadResult);
      
    } catch (error: any) {
      const errorMessage = error?.message || 'Upload failed';
      
      updateState({
        phase: 'error',
        progress: 0,
        error: errorMessage
      });
      
      options.onPhaseChange?.('error');
      options.onError?.(errorMessage);
    }
  }, [isWalletConnected, walletAddress, updateState]);

  // Return hook interface
  return {
    // State
    phase: state.phase,
    progress: state.progress,
    result: state.result,
    error: state.error,
    isWalletConnected: state.isWalletConnected,
    walletAddress: state.walletAddress,
    
    // Actions
    startUpload
  };
}
