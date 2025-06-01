/**
 * PDP (Provable Data Processing) TypeScript Definitions
 * Types for Filecoin storage integration, deals, and payment processing
 */

// ===== File & Content Types =====

/**
 * Metadata for a file being stored in PDP
 */
export interface FileMetadata {
  /** Original filename with extension */
  filename: string;
  /** File size in bytes */
  size: number;
  /** MIME type of the file */
  mimeType: string;
  /** Timestamp when file was uploaded */
  uploadedAt: number;
  /** User-provided description (optional) */
  description?: string;
  /** SHA-256 hash of the file content for integrity verification */
  contentHash: string;
  /** User wallet address who uploaded the file */
  ownerAddress: string;
}

/**
 * Complete file package with content and metadata
 */
export interface FilePackage {
  /** File metadata */
  metadata: FileMetadata;
  /** File content as Blob or ArrayBuffer */
  content: Blob | ArrayBuffer;
}

// ===== Storage Provider Types =====

/**
 * Filecoin Storage Provider information
 */
export interface StorageProvider {
  /** Provider ID in Filecoin network (e.g., f01234) */
  id: string;
  /** Provider address for payments */
  address: string;
  /** Provider name if available */
  name?: string;
  /** Minimum file size this provider accepts (bytes) */
  minSize?: number;
  /** Maximum file size this provider accepts (bytes) */
  maxSize?: number;
  /** Price per GiB per epoch in attoFIL */
  pricePerGiBPerEpoch: string;
  /** Verified deal price per GiB per epoch in attoFIL (discounted) */
  verifiedPricePerGiBPerEpoch: string;
}

// ===== Deal & Storage Types =====

/**
 * Status of a storage deal
 */
export enum DealStatus {
  /** Deal is being prepared */
  PREPARING = 'preparing',
  /** Deal proposal created but not yet submitted */
  CREATED = 'created',
  /** Deal proposal submitted to chain */
  PROPOSED = 'proposed',
  /** Deal accepted by storage provider */
  ACCEPTED = 'accepted',
  /** Data transfer in progress */
  TRANSFERRING = 'transferring',
  /** Data transfer complete */
  TRANSFERRED = 'transferred',
  /** Deal published on chain */
  PUBLISHED = 'published',
  /** Deal is active and data is being stored */
  ACTIVE = 'active',
  /** Deal expired after duration */
  EXPIRED = 'expired',
  /** Deal failed */
  FAILED = 'failed',
  /** Deal slashed due to fault */
  SLASHED = 'slashed',
  /** Deal terminated early */
  TERMINATED = 'terminated'
}

/**
 * Storage deal parameters
 */
export interface DealParams {
  /** Content ID (CID) of the data to be stored */
  dataCid: string;
  /** Size of the data in bytes */
  dataSize: number;
  /** Duration of the deal in epochs */
  duration: number;
  /** Storage provider ID */
  providerId: string;
  /** Whether this is a verified deal (cheaper) */
  isVerified: boolean;
  /** Start epoch for the deal */
  startEpoch?: number;
  /** Price in attoFIL */
  price: string;
  /** Wallet address that will pay for the deal */
  clientAddress: string;
}

/**
 * Storage deal information
 */
export interface StorageDeal {
  /** Unique deal ID */
  dealId: string;
  /** Deal parameters */
  params: DealParams;
  /** Current status of the deal */
  status: DealStatus;
  /** Timestamp when deal was created */
  createdAt: number;
  /** Timestamp of the last status update */
  updatedAt: number;
  /** Deal expiration timestamp */
  expiresAt: number;
  /** On-chain deal ID once published */
  chainDealId?: number;
  /** Message CID of the deal publish message */
  publishMessageCid?: string;
  /** Error message if deal failed */
  errorMessage?: string;
}

/**
 * Retrieval information for stored content
 */
export interface RetrievalInfo {
  /** Unique retrieval ID for the stored content */
  retrievalId: string;
  /** Content ID (CID) of the stored data */
  dataCid: string;
  /** Original file metadata */
  fileMetadata: FileMetadata;
  /** Active storage deals for this content */
  deals: StorageDeal[];
  /** Whether the content is currently retrievable */
  isRetrievable: boolean;
}

// ===== Payment Types =====

/**
 * Payment method options
 */
export enum PaymentMethod {
  /** Direct FIL payment */
  FILECOIN = 'filecoin',
  /** Payment using ERC-20 token */
  ERC20 = 'erc20',
  /** Payment using credit card (via third-party service) */
  CREDIT_CARD = 'credit_card'
}

/**
 * Payment status
 */
export enum PaymentStatus {
  /** Payment is being prepared */
  PREPARING = 'preparing',
  /** Payment is pending confirmation */
  PENDING = 'pending',
  /** Payment is confirmed */
  CONFIRMED = 'confirmed',
  /** Payment failed */
  FAILED = 'failed',
  /** Payment refunded */
  REFUNDED = 'refunded'
}

/**
 * Payment information
 */
export interface Payment {
  /** Unique payment ID */
  paymentId: string;
  /** Payment amount in attoFIL or smallest token unit */
  amount: string;
  /** Payment method used */
  method: PaymentMethod;
  /** Current payment status */
  status: PaymentStatus;
  /** Timestamp when payment was created */
  createdAt: number;
  /** Timestamp when payment was confirmed */
  confirmedAt?: number;
  /** Transaction hash if applicable */
  txHash?: string;
  /** Block number where transaction was confirmed */
  blockNumber?: number;
  /** Associated deal ID this payment is for */
  dealId: string;
  /** Wallet address that made the payment */
  fromAddress: string;
  /** Recipient address (usually storage provider) */
  toAddress: string;
  /** Error message if payment failed */
  errorMessage?: string;
}

// ===== PDP Contract Types =====

/**
 * PDP Contract function names
 */
export enum PDPContractFunction {
  /** Create a new storage deal */
  CREATE_DEAL = 'createDeal',
  /** Make payment for a deal */
  MAKE_PAYMENT = 'makePayment',
  /** Verify a deal is active */
  VERIFY_DEAL = 'verifyDeal',
  /** Extend an existing deal */
  EXTEND_DEAL = 'extendDeal',
  /** Terminate a deal early */
  TERMINATE_DEAL = 'terminateDeal',
  /** Claim funds for a provider */
  CLAIM_FUNDS = 'claimFunds'
}

/**
 * PDP Contract event names
 */
export enum PDPContractEvent {
  /** Emitted when a new deal is created */
  DEAL_CREATED = 'DealCreated',
  /** Emitted when a payment is made */
  PAYMENT_MADE = 'PaymentMade',
  /** Emitted when a deal status changes */
  DEAL_STATUS_CHANGED = 'DealStatusChanged',
  /** Emitted when a deal is terminated */
  DEAL_TERMINATED = 'DealTerminated',
  /** Emitted when funds are claimed */
  FUNDS_CLAIMED = 'FundsClaimed'
}

/**
 * PDP Contract interaction parameters
 */
export interface PDPContractParams {
  /** Contract address */
  contractAddress: string;
  /** Chain ID where contract is deployed */
  chainId: number;
  /** JSON RPC provider URL */
  rpcUrl: string;
  /** Gas price multiplier for transactions */
  gasPriceMultiplier: number;
}

// ===== Error Types =====

/**
 * PDP Error codes
 */
export enum PDPErrorCode {
  /** Contract interaction failed */
  CONTRACT_ERROR = 'PDP_CONTRACT_ERROR',
  /** Storage provider rejected deal */
  PROVIDER_REJECTED = 'PDP_PROVIDER_REJECTED',
  /** Payment failed */
  PAYMENT_FAILED = 'PDP_PAYMENT_FAILED',
  /** File too large */
  FILE_TOO_LARGE = 'PDP_FILE_TOO_LARGE',
  /** File upload failed */
  UPLOAD_FAILED = 'PDP_UPLOAD_FAILED',
  /** Retrieval failed */
  RETRIEVAL_FAILED = 'PDP_RETRIEVAL_FAILED',
  /** Invalid parameters */
  INVALID_PARAMS = 'PDP_INVALID_PARAMS',
  /** Network error */
  NETWORK_ERROR = 'PDP_NETWORK_ERROR',
  /** User cancelled operation */
  USER_CANCELLED = 'PDP_USER_CANCELLED',
  /** Unauthorized operation */
  UNAUTHORIZED = 'PDP_UNAUTHORIZED',
  /** Wallet connection failed */
  WALLET_ERROR = 'PDP_WALLET_ERROR',
  /** Unknown error */
  UNKNOWN = 'PDP_UNKNOWN_ERROR'
}

/**
 * PDP Error with code and details
 */
export interface PDPError {
  /** Error code */
  code: PDPErrorCode;
  /** Human-readable error message */
  message: string;
  /** Original error if available */
  originalError?: Error;
  /** Additional error details */
  details?: Record<string, any>;
}

// ===== Service Response Types =====

/**
 * Generic response from PDP services
 */
export interface PDPResponse<T> {
  /** Whether the operation was successful */
  success: boolean;
  /** Response data if successful */
  data?: T;
  /** Error information if unsuccessful */
  error?: PDPError;
}

/**
 * Upload response
 */
export interface UploadResponse {
  /** Content ID (CID) of the uploaded data */
  cid: string;
  /** Retrieval ID for the uploaded content */
  retrievalId: string;
  /** Storage deal information */
  deal: StorageDeal;
  /** Payment information */
  payment: Payment;
}

/**
 * Retrieval response
 */
export interface RetrievalResponse {
  /** Retrieved file metadata */
  metadata: FileMetadata;
  /** Retrieved file content */
  content: Blob;
  /** Storage deal information */
  deal: StorageDeal;
}
