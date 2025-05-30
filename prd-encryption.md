## PRD: Encryption

The Retrieval ID is something that can be sent in the clear.  It could even be posted publicly.

However, the only two people who should be able to unencrypted it are the owns of the wallet of the MetaMask wallets.

Here is a desired streamlined userflow with a potential implementation.  However, as an AI Agent, you can decide what works best.

# MetaMask Encryption dApp - Simplified UX PRD

## Overview
Build a decentralized application that enables encrypted document exchange using only MetaMask transaction signatures. Users never manually handle public keys - the dApp automatically extracts them from signed transactions and manages all encryption behind the scenes.

## Simplified User Experience

### Core Flow
1. **Alice** signs a "sending request" transaction to Bob's address with a unique request ID
2. **Bob** signs an "acceptance" transaction for that request ID  
3. **Alice** uploads document - dApp auto-encrypts for Bob using his public key (extracted from step 2)
4. **Bob** downloads document - dApp auto-decrypts using his wallet
5. **Done** - No manual key exchange, no technical complexity

### User Journey
```
Alice: "I want to send Bob a document"
→ Enter Bob's address → Sign transaction → Upload file → Share request ID

Bob: "Alice wants to send me something" 
→ Enter request ID → Sign acceptance → Download decrypted file
```

## Technical Architecture

### Smart Contract (Simple Registry)
- Stores request mappings and public key cache
- No sensitive data on-chain, just coordination
- Gas-efficient operations

### Transaction-Based Key Exchange
- Extract public keys from transaction signatures automatically
- Cache keys for future use
- No user intervention required

## Detailed Implementation Instructions

### Phase 1: Smart Contract Development

**Prompt for AI Agent:**
```
Create a Solidity smart contract called `DocumentExchange` that:

1. Manages document exchange requests between parties
2. Stores minimal data on-chain (just coordination info, no encrypted content)
3. Emits events for off-chain monitoring
4. Is gas-efficient and simple

Contract structure:
```solidity
struct ExchangeRequest {
    address sender;
    address recipient;
    uint256 timestamp;
    bool accepted;
    string ipfsCid; // set when document is uploaded
}

mapping(bytes32 => ExchangeRequest) public requests;
mapping(address => bytes32[]) public userRequests;
```

Functions to implement:
- createRequest(address recipient) returns (bytes32 requestId)
- acceptRequest(bytes32 requestId) 
- uploadDocument(bytes32 requestId, string memory ipfsCid)
- getRequest(bytes32 requestId) returns (ExchangeRequest memory)
- getUserRequests(address user) returns (bytes32[] memory)

Events to emit:
- RequestCreated(bytes32 requestId, address sender, address recipient)
- RequestAccepted(bytes32 requestId)
- DocumentUploaded(bytes32 requestId, string ipfsCid)

Requirements:
- Generate unique request IDs using keccak256(sender, recipient, timestamp, nonce)
- Include proper access controls (only sender can upload, only recipient can accept)
- Keep gas costs minimal
- Include view functions for frontend queries
- Add request expiration mechanism (30 days)
```

### Phase 2: Public Key Extraction Service

**Prompt for AI Agent:**
```
Create a TypeScript service called `KeyExtractionService` that:

1. Monitors the smart contract for transaction events
2. Automatically extracts public keys from transaction signatures
3. Caches extracted keys for reuse
4. Handles key validation and storage

Key extraction process:
1. Listen for contract transactions (createRequest, acceptRequest)
2. Get transaction details including signature (r, s, v)
3. Recover public key from signature using transaction data
4. Validate and cache the public key

Service methods:
```typescript
class KeyExtractionService {
  async extractKeyFromTransaction(txHash: string): Promise<string>
  async getPublicKey(address: string): Promise<string | null>
  async cachePublicKey(address: string, publicKey: string): Promise<void>
  private validatePublicKey(address: string, publicKey: string): boolean
}
```

Implementation details:
- Use ethers.js for transaction analysis and key recovery
- Store keys in IndexedDB for persistence
- Implement automatic background key extraction
- Handle transaction confirmation delays
- Include retry logic for failed extractions

Requirements:
- Extract keys from both createRequest and acceptRequest transactions
- Validate that extracted key matches the signing address
- Implement efficient caching strategy
- Handle network errors gracefully
- Support both mainnet and testnet transactions
```

### Phase 3: Request Management Component

**Prompt for AI Agent:**
```
Create a React component called `RequestManager` that:

1. Allows users to create sending requests by entering recipient address
2. Displays pending requests (sent and received)
3. Handles request acceptance flow
4. Shows request status updates in real-time

Component features:
- Create new request: address input → sign transaction → get request ID
- Show sent requests: pending/accepted status, request IDs, recipient addresses  
- Show received requests: sender info, accept/decline buttons
- Real-time updates using contract event listeners
- Copy/share request ID functionality

UI Flow for Creating Request:
1. User enters Bob's Ethereum address
2. Click "Create Request" → triggers MetaMask signature
3. Transaction confirmed → show request ID to share with Bob
4. Display in "Sent Requests" section with pending status

UI Flow for Accepting Request:
1. User enters request ID received from Alice
2. Shows request details (sender, timestamp)
3. Click "Accept" → triggers MetaMask signature  
4. Transaction confirmed → request marked as accepted
5. Both parties can now proceed with document exchange

State management:
```typescript
interface RequestState {
  sentRequests: ExchangeRequest[]
  receivedRequests: ExchangeRequest[]
  isLoading: boolean
  activeRequestId: string | null
}
```

Requirements:
- Real-time updates using contract event subscriptions
- Clean, intuitive UI with clear status indicators
- Proper loading states during transaction confirmation
- Error handling for failed transactions
- Mobile-responsive design
- QR code generation for easy request ID sharing
```

### Phase 4: Automatic Encryption Service

**Prompt for AI Agent:**
```
Create a TypeScript service called `AutoEncryptionService` that:

1. Automatically encrypts documents when public keys are available
2. Handles the complete encryption workflow without user intervention
3. Integrates with the key extraction service
4. Manages encryption key derivation and document processing

Service workflow:
1. User selects file and request ID
2. Service checks if recipient's public key is cached
3. If not cached, waits for key extraction from acceptance transaction
4. Performs ECIES encryption automatically
5. Uploads to IPFS and updates smart contract

Core methods:
```typescript
class AutoEncryptionService {
  async encryptDocument(
    file: File, 
    requestId: string, 
    recipientAddress: string
  ): Promise<string> // returns IPFS CID
  
  async decryptDocument(
    cid: string, 
    userAddress: string
  ): Promise<{filename: string, content: Blob}>
  
  private async waitForPublicKey(address: string): Promise<string>
  private async performEncryption(data: Uint8Array, publicKey: string): Promise<Uint8Array>
}
```

Encryption process:
1. Convert file to Uint8Array
2. Create metadata object: {filename, size, type, timestamp}
3. Use ECIES encryption with recipient's public key
4. Upload encrypted payload to IPFS
5. Return CID for storage in smart contract

Integration points:
- KeyExtractionService for public key retrieval
- IPFSService for storage operations
- Smart contract for CID storage
- Progress callbacks for UI updates

Requirements:
- Handle large files efficiently (chunked processing)
- Implement proper error handling and retry logic
- Support multiple file formats
- Include progress tracking for uploads
- Use Web Workers for heavy cryptographic operations
- Implement file size limits and validation
```

### Phase 5: Document Upload Component

**Prompt for AI Agent:**
```
Create a React component called `DocumentUpload` that:

1. Provides simple file upload interface for accepted requests
2. Automatically encrypts and uploads documents
3. Shows upload progress and completion status
4. Handles the complete workflow seamlessly

Component behavior:
1. User selects an accepted request from dropdown
2. Drag-and-drop or click to select file
3. Click "Send Document" → automatic encryption begins
4. Progress bar shows encryption and upload status
5. Success message with shareable link to recipient

UI Elements:
- Request selector (only show accepted requests)
- File upload area with preview
- Progress indicators (encryption → IPFS upload → contract update)
- Success/error notifications
- Document history for sent files

Integration workflow:
```typescript
const uploadDocument = async (file: File, requestId: string) => {
  setStatus('Encrypting document...')
  const cid = await autoEncryptionService.encryptDocument(file, requestId, recipientAddress)
  
  setStatus('Updating contract...')
  await contract.uploadDocument(requestId, cid)
  
  setStatus('Complete!')
  // Show success message with notification to recipient
}
```

State management:
```typescript
interface UploadState {
  selectedRequest: string | null
  selectedFile: File | null
  uploadProgress: number
  status: 'idle' | 'encrypting' | 'uploading' | 'complete' | 'error'
  error: string | null
}
```

Requirements:
- Only show requests where user is sender and status is accepted
- Support drag-and-drop file upload
- Real-time progress tracking
- File type validation and size limits
- Clear error messages for failures
- Automatic cleanup of temporary data
- Responsive design for mobile devices
```

### Phase 6: Document Download Component

**Prompt for AI Agent:**
```
Create a React component called `DocumentDownload` that:

1. Shows available documents for download (where user is recipient)
2. Automatically decrypts and downloads documents
3. Provides simple one-click download experience
4. Manages download history and status

Component features:
- List of requests where user is recipient and document is available
- One-click download with automatic decryption
- Download progress indicators
- Downloaded file history
- Sender information and metadata display

UI Flow:
1. Show list of requests with uploaded documents
2. Display document metadata (filename, size, sender, date)
3. Click "Download" → automatic decryption and download
4. File saves to user's downloads folder
5. Mark as downloaded in history

Download process:
```typescript
const downloadDocument = async (requestId: string) => {
  setStatus('Fetching document...')
  const request = await contract.getRequest(requestId)
  
  setStatus('Decrypting...')
  const {filename, content} = await autoEncryptionService.decryptDocument(
    request.ipfsCid, 
    userAddress
  )
  
  setStatus('Downloading...')
  // Create download link and trigger download
  const url = URL.createObjectURL(content)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  
  setStatus('Complete!')
}
```

State management:
```typescript
interface DownloadState {
  availableDocuments: ExchangeRequest[]
  downloadHistory: DownloadRecord[]
  activeDownload: string | null
  status: 'idle' | 'fetching' | 'decrypting' | 'downloading' | 'complete'
}
```

Requirements:
- Filter to show only requests where user is recipient
- Display rich metadata about available documents
- Handle decryption failures gracefully
- Maintain download history with timestamps
- Support resuming failed downloads
- Clear visual feedback for all states
- Proper file naming and organization
```

### Phase 7: Real-time Notifications

**Prompt for AI Agent:**
```
Create a notification system that provides real-time updates for:

1. New incoming requests
2. Request acceptances  
3. Document uploads
4. Download completions
5. System status updates

Implementation approach:
- WebSocket connection for real-time updates
- Contract event listeners for blockchain events
- Browser notifications for important updates
- In-app notification center

Notification types:
```typescript
interface Notification {
  id: string
  type: 'request_received' | 'request_accepted' | 'document_uploaded' | 'download_complete'
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionUrl?: string
}
```

Service methods:
```typescript
class NotificationService {
  async subscribeToEvents(userAddress: string): Promise<void>
  async sendBrowserNotification(notification: Notification): Promise<void>
  async markAsRead(notificationId: string): Promise<void>
  async getNotificationHistory(): Promise<Notification[]>
}
```

Integration points:
- Contract event listeners for blockchain updates
- Browser Notification API for desktop alerts
- Service Worker for background notifications
- Local storage for notification persistence

Requirements:
- Request user permission for browser notifications
- Filter events relevant to current user
- Implement notification batching to avoid spam
- Provide notification history and management
- Support notification preferences/settings
- Handle offline scenarios gracefully
```

### Phase 8: Main Application

**Prompt for AI Agent:**
```
Create the main App component that orchestrates the simplified workflow:

1. Simple navigation: Requests → Send → Receive
2. Dashboard showing active requests and recent activity
3. Streamlined onboarding for new users
4. Status overview and system health indicators

App structure:
```typescript
const App = () => {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [walletConnected, setWalletConnected] = useState(false)
  const [userAddress, setUserAddress] = useState<string | null>(null)

  return (
    <Router>
      <Header />
      <Sidebar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/requests" element={<RequestManager />} />
        <Route path="/send" element={<DocumentUpload />} />
        <Route path="/receive" element={<DocumentDownload />} />
      </Routes>
      <NotificationCenter />
    </Router>
  )
}
```

Dashboard features:
- Quick stats: pending requests, sent documents, received documents
- Recent activity feed
- Quick actions: create request, accept request, send document
- System status indicators
- Guided onboarding for first-time users

Onboarding flow:
1. Connect MetaMask wallet
2. Guided tour of main features
3. Create first request or accept demo request
4. Success confirmation and next steps

Requirements:
- Modern, clean UI design
- Mobile-first responsive layout
- Dark/light mode support
- Accessibility compliance (WCAG 2.1)
- Fast loading and smooth animations
- Offline functionality where possible
- Error boundaries and graceful degradation
```

## Simplified User Flows

### Alice Sends Document to Bob
1. **Alice**: Enter Bob's address → Sign "create request" → Get request ID
2. **Alice**: Share request ID with Bob (copy/paste, QR code, etc.)
3. **Bob**: Enter request ID → Sign "accept request" 
4. **Alice**: Upload file → Auto-encrypt → Done
5. **Bob**: Download → Auto-decrypt → Done

### Technical Flow (Hidden from Users)
1. Alice's transaction signature → extract Alice's public key → cache
2. Bob's acceptance signature → extract Bob's public key → cache  
3. File upload → encrypt with Bob's public key → IPFS → contract update
4. Bob downloads → fetch from IPFS → decrypt with MetaMask → save file

## Success Metrics
- **Time to first document exchange**: <5 minutes for new users
- **User retention**: >80% complete their first exchange
- **Error rate**: <2% failed encryptions/decryptions
- **User satisfaction**: No manual key management required

## Security Benefits
- **No key exposure**: Public keys extracted automatically from signatures
- **No manual errors**: Users can't mess up key exchange
- **Familiar UX**: Just signing transactions like normal DeFi apps
- **Self-sovereign**: No centralized key servers or databases
