import { ethers } from 'ethers';
import {
  DealParams,
  DealStatus,
  PDPContractEvent,
  PDPContractFunction,
  PDPContractParams,
  PDPError,
  PDPErrorCode,
  PDPResponse,
  Payment,
  PaymentStatus,
  StorageDeal
} from '../types/pdp';

// ABI for the PDP Contract (minimal interface for MVP)
const PDP_CONTRACT_ABI = [
  // Deal management
  'function createDeal(string dataCid, uint256 dataSize, uint256 duration, string providerId, bool isVerified, uint256 price) payable returns (string dealId)',
  'function verifyDeal(string dealId) view returns (bool isActive, uint256 expirationTimestamp)',
  'function extendDeal(string dealId, uint256 additionalDuration) payable returns (bool success)',
  'function terminateDeal(string dealId) returns (bool success)',
  
  // Payment
  'function makePayment(string dealId) payable returns (string paymentId)',
  'function claimFunds(string dealId) returns (uint256 amount)',
  
  // Events
  'event DealCreated(string indexed dealId, string dataCid, address indexed client, string providerId, uint256 price, uint256 duration)',
  'event PaymentMade(string indexed paymentId, string dealId, address indexed from, address indexed to, uint256 amount)',
  'event DealStatusChanged(string indexed dealId, uint8 status)',
  'event DealTerminated(string indexed dealId, address terminator, uint256 refundAmount)'
];

/**
 * Service for interacting with the PDP (Provable Data Processing) smart contract
 * Handles storage deal creation, payments, and status verification
 */
export class PDPContractService {
  private contract: ethers.Contract;
  private provider: ethers.JsonRpcProvider;
  private signer: ethers.Signer | null = null;
  private params: PDPContractParams;
  
  /**
   * Create a new PDPContractService instance
   * @param params Contract parameters including address and RPC URL
   */
  constructor(params: PDPContractParams) {
    this.params = params;
    this.provider = new ethers.JsonRpcProvider(params.rpcUrl);
    this.contract = new ethers.Contract(params.contractAddress, PDP_CONTRACT_ABI, this.provider);
  }
  
  /**
   * Connect a wallet to the service for sending transactions
   * @param provider Ethereum provider (e.g., window.ethereum)
   * @returns Connected wallet address
   */
  async connectWallet(provider: any): Promise<string> {
    try {
      const ethersProvider = new ethers.BrowserProvider(provider);
      this.signer = await ethersProvider.getSigner();
      this.contract = this.contract.connect(this.signer);
      
      return await this.signer.getAddress();
    } catch (error) {
      throw this.handleError(error, PDPErrorCode.WALLET_ERROR, 'Failed to connect wallet');
    }
  }
  
  /**
   * Check if wallet is connected
   * @returns True if wallet is connected
   */
  isWalletConnected(): boolean {
    return this.signer !== null;
  }
  
  /**
   * Get connected wallet address
   * @returns Wallet address or null if not connected
   */
  async getWalletAddress(): Promise<string | null> {
    if (!this.signer) return null;
    return await this.signer.getAddress();
  }
  
  /**
   * Create a new storage deal
   * @param dealParams Parameters for the storage deal
   * @returns Response with the created deal
   */
  async createDeal(dealParams: DealParams): Promise<PDPResponse<StorageDeal>> {
    this.ensureWalletConnected();
    
    try {
      // Prepare transaction parameters
      const txValue = ethers.parseEther(dealParams.price);
      const gasPrice = await this.getAdjustedGasPrice();
      
      // Create the deal on-chain
      const tx = await this.contract[PDPContractFunction.CREATE_DEAL](
        dealParams.dataCid,
        dealParams.dataSize,
        dealParams.duration,
        dealParams.providerId,
        dealParams.isVerified,
        ethers.parseEther(dealParams.price),
        { value: txValue, gasPrice }
      );
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      // Extract deal ID from event logs
      const dealCreatedEvent = receipt.logs
        .map(log => this.tryParseLog(log, this.contract.interface, PDPContractEvent.DEAL_CREATED))
        .find(event => !!event);
      
      if (!dealCreatedEvent) {
        throw new Error('Deal created but event not found in transaction logs');
      }
      
      const dealId = dealCreatedEvent.args[0];
      
      // Construct deal object
      const deal: StorageDeal = {
        dealId,
        params: dealParams,
        status: DealStatus.CREATED,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        expiresAt: Date.now() + (dealParams.duration * 30 * 1000), // Simplified for MVP
        publishMessageCid: receipt.hash
      };
      
      return {
        success: true,
        data: deal
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error, PDPErrorCode.CONTRACT_ERROR, 'Failed to create storage deal')
      };
    }
  }
  
  /**
   * Make a payment for a storage deal
   * @param dealId ID of the deal to pay for
   * @param amount Amount to pay in FIL (as string)
   * @returns Response with payment information
   */
  async makePayment(dealId: string, amount: string): Promise<PDPResponse<Payment>> {
    this.ensureWalletConnected();
    
    try {
      // Prepare transaction parameters
      const txValue = ethers.parseEther(amount);
      const gasPrice = await this.getAdjustedGasPrice();
      
      // Make the payment
      const tx = await this.contract[PDPContractFunction.MAKE_PAYMENT](
        dealId,
        { value: txValue, gasPrice }
      );
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      // Extract payment ID from event logs
      const paymentEvent = receipt.logs
        .map(log => this.tryParseLog(log, this.contract.interface, PDPContractEvent.PAYMENT_MADE))
        .find(event => !!event);
      
      if (!paymentEvent) {
        throw new Error('Payment made but event not found in transaction logs');
      }
      
      const [paymentId, , from, to, paymentAmount] = paymentEvent.args;
      
      // Construct payment object
      const payment: Payment = {
        paymentId,
        amount: paymentAmount.toString(),
        method: 'filecoin',
        status: PaymentStatus.CONFIRMED,
        createdAt: Date.now(),
        confirmedAt: Date.now(),
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        dealId,
        fromAddress: from,
        toAddress: to
      };
      
      return {
        success: true,
        data: payment
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error, PDPErrorCode.PAYMENT_FAILED, 'Failed to make payment')
      };
    }
  }
  
  /**
   * Verify if a deal is active
   * @param dealId ID of the deal to verify
   * @returns Response with verification result
   */
  async verifyDeal(dealId: string): Promise<PDPResponse<{ isActive: boolean; expirationTimestamp: number }>> {
    try {
      const [isActive, expirationTimestamp] = await this.contract[PDPContractFunction.VERIFY_DEAL](dealId);
      
      return {
        success: true,
        data: {
          isActive,
          expirationTimestamp: Number(expirationTimestamp) * 1000 // Convert to milliseconds
        }
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error, PDPErrorCode.CONTRACT_ERROR, 'Failed to verify deal')
      };
    }
  }
  
  /**
   * Extend an existing deal
   * @param dealId ID of the deal to extend
   * @param additionalDuration Additional duration in epochs
   * @param amount Amount to pay for extension
   * @returns Response with success status
   */
  async extendDeal(
    dealId: string, 
    additionalDuration: number, 
    amount: string
  ): Promise<PDPResponse<boolean>> {
    this.ensureWalletConnected();
    
    try {
      // Prepare transaction parameters
      const txValue = ethers.parseEther(amount);
      const gasPrice = await this.getAdjustedGasPrice();
      
      // Extend the deal
      const tx = await this.contract[PDPContractFunction.EXTEND_DEAL](
        dealId,
        additionalDuration,
        { value: txValue, gasPrice }
      );
      
      // Wait for transaction confirmation
      await tx.wait();
      
      return {
        success: true,
        data: true
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error, PDPErrorCode.CONTRACT_ERROR, 'Failed to extend deal')
      };
    }
  }
  
  /**
   * Terminate a deal early
   * @param dealId ID of the deal to terminate
   * @returns Response with success status
   */
  async terminateDeal(dealId: string): Promise<PDPResponse<boolean>> {
    this.ensureWalletConnected();
    
    try {
      // Prepare transaction parameters
      const gasPrice = await this.getAdjustedGasPrice();
      
      // Terminate the deal
      const tx = await this.contract[PDPContractFunction.TERMINATE_DEAL](
        dealId,
        { gasPrice }
      );
      
      // Wait for transaction confirmation
      await tx.wait();
      
      return {
        success: true,
        data: true
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error, PDPErrorCode.CONTRACT_ERROR, 'Failed to terminate deal')
      };
    }
  }
  
  /**
   * Listen for contract events
   * @param eventName Name of the event to listen for
   * @param callback Callback function to handle events
   * @returns Unsubscribe function
   */
  listenForEvents(eventName: PDPContractEvent, callback: (event: any) => void): () => void {
    const listener = (...args: any[]) => {
      callback(args);
    };
    
    this.contract.on(eventName, listener);
    
    return () => {
      this.contract.off(eventName, listener);
    };
  }
  
  /**
   * Get the current gas price adjusted by the multiplier
   * @returns Adjusted gas price
   */
  private async getAdjustedGasPrice(): Promise<bigint> {
    const gasPrice = await this.provider.getFeeData();
    const multiplier = Math.floor(this.params.gasPriceMultiplier * 100);
    return (gasPrice.gasPrice || 0n) * BigInt(multiplier) / 100n;
  }
  
  /**
   * Ensure wallet is connected before sending transactions
   * @throws Error if wallet is not connected
   */
  private ensureWalletConnected(): void {
    if (!this.signer) {
      throw new Error('Wallet not connected. Call connectWallet() first.');
    }
  }
  
  /**
   * Try to parse a log as a specific event
   * @param log Log to parse
   * @param contractInterface Contract interface
   * @param eventName Name of the event
   * @returns Parsed event or null if not matching
   */
  private tryParseLog(log: any, contractInterface: ethers.Interface, eventName: string): any {
    try {
      const parsedLog = contractInterface.parseLog({
        topics: log.topics,
        data: log.data
      });
      
      if (parsedLog?.name === eventName) {
        return parsedLog;
      }
      return null;
    } catch (e) {
      return null;
    }
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
    
    // Extract error message from ethers error
    let errorMessage = message;
    if (error?.message) {
      errorMessage = `${message}: ${error.message}`;
    }
    
    // Check for user rejection
    if (
      error?.code === 4001 || // MetaMask user rejected
      error?.code === 'ACTION_REJECTED' || // General wallet rejection
      error?.message?.includes('user rejected') ||
      error?.message?.includes('User denied')
    ) {
      return {
        code: PDPErrorCode.USER_CANCELLED,
        message: 'Transaction was rejected by the user',
        originalError: error
      };
    }
    
    return {
      code,
      message: errorMessage,
      originalError: error,
      details: {
        contractAddress: this.params.contractAddress,
        chainId: this.params.chainId
      }
    };
  }
}

/**
 * Create a PDPContractService instance with environment configuration
 * @returns Configured PDPContractService
 */
export function createPDPContractService(): PDPContractService {
  const isMainnet = process.env.NEXT_PUBLIC_CHAIN_ID === '1';
  
  const contractAddress = isMainnet
    ? process.env.NEXT_PUBLIC_PDP_CONTRACT_ADDRESS_MAINNET
    : process.env.NEXT_PUBLIC_PDP_CONTRACT_ADDRESS_TESTNET;
  
  if (!contractAddress) {
    throw new Error('PDP contract address not configured in environment variables');
  }
  
  const params: PDPContractParams = {
    contractAddress,
    chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID || '5'),
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'https://ethereum-goerli.publicnode.com',
    gasPriceMultiplier: Number(process.env.NEXT_PUBLIC_GAS_PRICE_MULTIPLIER || '1.2')
  };
  
  return new PDPContractService(params);
}
