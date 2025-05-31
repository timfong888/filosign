## PRD: Encryption

### Objective
Alice and Bob are the two parties: Sender (Alice) and Recipient (Bob).

The Document should be private, accessible only to Alice and Bob.

The Retrieval ID is something that can be sent in the clear. It could even be posted publicly.

However, the only two people who should be able to decrypt it are the owners of the MetaMask wallets.

# MetaMask Hybrid Encryption dApp - Simplified UX PRD

## Overview
Build a decentralized application that enables encrypted document exchange using hybrid encryption (AES + ECIES) with MetaMask key management. Users never manually handle encryption keys - the dApp automatically manages public key discovery and encrypts documents so only the sender and recipient can decrypt them.

## Core Security Model

### Encryption Guarantees
- ✅ **Alice can decrypt**: She has her private key
- ✅ **Bob can decrypt**: He has his private key
- ❌ **No one else can decrypt**: They lack both private keys
- ✅ **Retrieval ID can be public**: Contains no decryption capability
- ✅ **Sovereign document**: Accessible to both parties independently

### Hybrid Encryption Approach
```javascript
// 1. Generate random AES key for this document
const aes_key = generateRandomAESKey(); // 256-bit

// 2. Encrypt the document with AES
const encrypted_document = AES.encrypt(document, aes_key);

// 3. Encrypt the AES key for BOTH parties
const encrypted_key_for_alice = ECIES.encrypt(aes_key, alice_public_key);
const encrypted_key_for_bob = ECIES.encrypt(aes_key, bob_public_key);

// 4. Store everything in PDP
store({
  encrypted_document,
  encrypted_key_for_alice,
  encrypted_key_for_bob,
  alice_address,
  bob_address,
  retrieval_id
});
```

## Simplified User Experience

### Core Flow
1. **Alice** uploads document and specifies Bob's wallet address
2. **Alice** signs MetaMask message to establish her public key (one-time setup)
3. **Bob** signs MetaMask message to establish his public key (one-time setup)
4. **Alice** uploads document - dApp auto-encrypts for both Alice and Bob
5. **Bob** downloads document using retrieval ID - dApp auto-decrypts using his wallet
6. **Done** - No manual key exchange, no technical complexity

### User Journey
```
Alice: "I want to send Bob a document"
→ Enter Bob's address → Upload file → Auto-encrypt → Share retrieval ID

Bob: "Alice sent me a document"
→ Enter retrieval ID → Auto-decrypt → Download file
```

## Technical Architecture

### Public Key Management
- Extract public keys from MetaMask message signatures
- Cache keys locally for reuse
- One-time setup per wallet address

### Hybrid Encryption System
- AES-256 for document encryption (fast, efficient)
- ECIES for key encryption (secure key exchange)
- Store encrypted keys for both parties

## Detailed Implementation Instructions

### Phase 1: Public Key Discovery Service

**Prompt for AI Agent:**
```
Create a TypeScript service called `PublicKeyService` that:

1. Manages public key discovery and caching for wallet addresses
2. Uses MetaMask message signing to extract public keys
3. Stores keys locally for reuse
4. Handles key validation and retrieval

Service workflow:
1. User connects wallet and signs a standard message
2. Extract public key from the signature
3. Validate that the public key matches the wallet address
4. Cache the public key for future use

Core methods:
```typescript
class PublicKeyService {
  async discoverPublicKey(walletAddress: string, signer: any): Promise<string>
  async getPublicKey(walletAddress: string): Promise<string | null>
  async cachePublicKey(walletAddress: string, publicKey: string): Promise<void>
  private validatePublicKey(walletAddress: string, publicKey: string): boolean
  private generateStandardMessage(walletAddress: string): string
}
```

Key discovery process:
1. Generate standard message: "FiloSign Key Discovery\nAddress: {walletAddress}\nTimestamp: {timestamp}"
2. Request MetaMask signature of the message
3. Extract public key from signature using ethers.js
4. Validate that derived address matches wallet address
5. Cache public key in IndexedDB for future use

Requirements:
- Use deterministic message format for consistency
- Implement proper error handling for signature failures
- Store keys securely in browser storage
- Handle network errors and retry logic
- Support both mainnet and testnet addresses
- Include key expiration and refresh mechanisms
```

### Phase 2: Hybrid Encryption Service

**Prompt for AI Agent:**
```
Create a TypeScript service called `HybridEncryptionService` that:

1. Implements the hybrid encryption scheme (AES + ECIES)
2. Encrypts documents for both sender and recipient
3. Handles decryption for authorized parties
4. Manages encryption key generation and storage

Service workflow:
1. Generate random AES key for each document
2. Encrypt document with AES-256
3. Encrypt AES key with ECIES for both parties
4. Package encrypted data for storage

Core methods:
```typescript
class HybridEncryptionService {
  async encryptDocument(
    file: File,
    senderAddress: string,
    recipientAddress: string
  ): Promise<EncryptedPackage>

  async decryptDocument(
    encryptedPackage: EncryptedPackage,
    userAddress: string,
    privateKey: string
  ): Promise<{filename: string, content: Blob}>

  private generateAESKey(): CryptoKey
  private encryptWithAES(data: Uint8Array, key: CryptoKey): Promise<Uint8Array>
  private encryptKeyWithECIES(aesKey: CryptoKey, publicKey: string): Promise<string>
}
```

Encryption process:
1. Convert file to Uint8Array
2. Generate random 256-bit AES key
3. Encrypt document data with AES-GCM
4. Get public keys for sender and recipient
5. Encrypt AES key with ECIES for both parties
6. Package all encrypted data with metadata

Data structure:
```typescript
interface EncryptedPackage {
  encrypted_document: string // Base64 encoded
  encrypted_key_for_sender: string // ECIES encrypted AES key
  encrypted_key_for_recipient: string // ECIES encrypted AES key
  sender_address: string
  recipient_address: string
  filename: string
  file_size: number
  timestamp: number
  retrieval_id: string
}
```

Requirements:
- Use Web Crypto API for AES encryption
- Use established ECIES library for key encryption
- Handle large files efficiently with streaming
- Implement proper error handling and validation
- Support multiple file formats
- Include progress callbacks for UI updates
```

### Phase 3: PDP Storage Service

**Prompt for AI Agent:**
```
Create a TypeScript service called `PDPStorageService` that:

1. Handles encrypted document storage in PDP system
2. Manages retrieval ID generation and document lookup
3. Integrates with PDP smart contracts for storage operations
4. Provides simple interface for store/retrieve operations

Service workflow:
1. Store encrypted package in PDP with metadata
2. Generate unique retrieval ID for document access
3. Return retrieval ID for sharing
4. Handle document retrieval by retrieval ID

Core methods:
```typescript
class PDPStorageService {
  async storeDocument(encryptedPackage: EncryptedPackage): Promise<string>
  async retrieveDocument(retrievalId: string): Promise<EncryptedPackage>
  async generateRetrievalId(encryptedPackage: EncryptedPackage): Promise<string>
  private validateRetrievalId(retrievalId: string): boolean
}
```

Storage process:
1. Take encrypted package from HybridEncryptionService
2. Generate unique retrieval ID (hash-based or UUID)
3. Store package in PDP with retrieval ID as key
4. Return retrieval ID for sharing

Retrieval process:
1. Accept retrieval ID from user
2. Validate retrieval ID format
3. Query PDP storage for encrypted package
4. Return encrypted package for decryption

Data flow:
```typescript
interface StorageMetadata {
  retrieval_id: string
  sender_address: string
  recipient_address: string
  filename: string
  file_size: number
  upload_timestamp: number
  storage_hash: string // PDP storage reference
}
```

Requirements:
- Integrate with PDP smart contracts for storage
- Generate collision-resistant retrieval IDs
- Handle storage failures and retry logic
- Implement efficient metadata indexing
- Support large file storage
- Include storage cost estimation
- Handle PDP provider selection and failover
```

### Phase 4: Document Upload Component

**Prompt for AI Agent:**
```
Create a React component called `DocumentUpload` that:

1. Provides simple file upload interface with recipient specification
2. Automatically encrypts and uploads documents using hybrid encryption
3. Shows upload progress and completion status
4. Handles the complete workflow seamlessly

Component behavior:
1. User enters recipient's wallet address
2. User selects file via drag-and-drop or file picker
3. Click "Send Document" → automatic encryption and storage begins
4. Progress bar shows encryption, storage, and completion status
5. Success message with retrieval ID for sharing

UI Elements:
- Recipient address input with validation
- File upload area with preview and metadata
- Progress indicators (key discovery → encryption → storage → complete)
- Success/error notifications with retrieval ID
- Document history for sent files

Integration workflow:
```typescript
const uploadDocument = async (file: File, recipientAddress: string) => {
  setStatus('Discovering public keys...')
  await publicKeyService.discoverPublicKey(recipientAddress)

  setStatus('Encrypting document...')
  const encryptedPackage = await hybridEncryptionService.encryptDocument(
    file, senderAddress, recipientAddress
  )

  setStatus('Storing in PDP...')
  const retrievalId = await pdpStorageService.storeDocument(encryptedPackage)

  setStatus('Complete!')
  setRetrievalId(retrievalId)
}
```

State management:
```typescript
interface UploadState {
  recipientAddress: string
  selectedFile: File | null
  uploadProgress: number
  status: 'idle' | 'discovering' | 'encrypting' | 'storing' | 'complete' | 'error'
  retrievalId: string | null
  error: string | null
}
```

Requirements:
- Validate Ethereum addresses for recipients
- Support drag-and-drop file upload
- Real-time progress tracking for all phases
- File type validation and size limits
- Clear error messages for failures
- Automatic cleanup of temporary data
- Copy-to-clipboard for retrieval ID
- Responsive design for mobile devices
```

### Phase 5: Document Download Component

**Prompt for AI Agent:**
```
Create a React component called `DocumentDownload` that:

1. Provides simple retrieval ID input interface
2. Automatically retrieves and decrypts documents
3. Shows download progress and completion status
4. Handles the complete workflow seamlessly

Component behavior:
1. User enters retrieval ID received from sender
2. Click "Retrieve Document" → automatic retrieval and decryption begins
3. Progress bar shows retrieval, decryption, and download status
4. File automatically downloads to user's device
5. Success message with document metadata

UI Elements:
- Retrieval ID input with validation
- Document metadata display (filename, size, sender)
- Progress indicators (retrieving → decrypting → downloading → complete)
- Success/error notifications
- Download history for received files

Integration workflow:
```typescript
const downloadDocument = async (retrievalId: string) => {
  setStatus('Retrieving document...')
  const encryptedPackage = await pdpStorageService.retrieveDocument(retrievalId)

  setStatus('Decrypting...')
  const {filename, content} = await hybridEncryptionService.decryptDocument(
    encryptedPackage, userAddress, privateKey
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
  retrievalId: string
  documentMetadata: EncryptedPackage | null
  downloadProgress: number
  status: 'idle' | 'retrieving' | 'decrypting' | 'downloading' | 'complete' | 'error'
  error: string | null
}
```

Requirements:
- Validate retrieval ID format
- Display document metadata before download
- Real-time progress tracking for all phases
- Handle decryption failures gracefully
- Automatic wallet verification (ensure user is authorized)
- Clear error messages for failures
- Download history with timestamps
- Responsive design for mobile devices
```

### Phase 6: Main Application Integration

**Prompt for AI Agent:**
```
Create the main App component that orchestrates the simplified workflow:

1. Simple navigation: Send → Receive
2. Dashboard showing document history and recent activity
3. Streamlined onboarding for new users
4. MetaMask wallet integration

App structure:
```typescript
const App = () => {
  const [walletConnected, setWalletConnected] = useState(false)
  const [userAddress, setUserAddress] = useState<string | null>(null)

  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/send" element={<DocumentUpload />} />
        <Route path="/receive" element={<DocumentDownload />} />
      </Routes>
    </Router>
  )
}
```

Dashboard features:
- Quick stats: sent documents, received documents
- Recent activity feed
- Quick actions: send document, receive document
- Document history with retrieval IDs
- Guided onboarding for first-time users

Onboarding flow:
1. Connect MetaMask wallet
2. One-time public key discovery (sign message)
3. Guided tour of send/receive features
4. Success confirmation and next steps

Integration points:
- PublicKeyService for wallet setup
- HybridEncryptionService for document operations
- PDPStorageService for storage operations
- MetaMask for wallet connectivity

Requirements:
- Modern, clean UI design matching current SaaS app
- Mobile-first responsive layout
- Dark/light mode support
- Accessibility compliance (WCAG 2.1)
- Fast loading and smooth animations
- Error boundaries and graceful degradation
- Seamless integration with existing UI components
```

## Simplified User Flows

### Alice Sends Document to Bob
1. **Alice**: Connect MetaMask wallet (one-time setup)
2. **Alice**: Enter Bob's wallet address → Upload file → Auto-encrypt → Get retrieval ID
3. **Alice**: Share retrieval ID with Bob (copy/paste, QR code, etc.)
4. **Bob**: Connect MetaMask wallet (one-time setup)
5. **Bob**: Enter retrieval ID → Auto-decrypt → Download file
6. **Done** - No complex request/acceptance flow required

### Technical Flow (Hidden from Users)
1. Alice connects wallet → signs message → extract Alice's public key → cache
2. Bob connects wallet → signs message → extract Bob's public key → cache
3. File upload → generate AES key → encrypt document → encrypt AES key for both parties → store in PDP
4. Bob downloads → retrieve from PDP → decrypt AES key → decrypt document → save file

### Decryption Access Control
```javascript
// Alice can decrypt (she has her private key)
const aes_key = ECIES.decrypt(encrypted_key_for_alice, alice_private_key);
const document = AES.decrypt(encrypted_document, aes_key);

// Bob can decrypt (he has his private key)
const aes_key = ECIES.decrypt(encrypted_key_for_bob, bob_private_key);
const document = AES.decrypt(encrypted_document, aes_key);

// No one else can decrypt (they lack both private keys)
```

## Success Metrics
- **Time to first document exchange**: <3 minutes for new users
- **User retention**: >90% complete their first exchange
- **Error rate**: <1% failed encryptions/decryptions
- **User satisfaction**: No manual key management or complex flows required

## Security Benefits
- **Hybrid encryption**: AES for speed, ECIES for security
- **Dual access**: Both sender and recipient can always decrypt
- **No key exposure**: Public keys extracted from MetaMask signatures
- **No manual errors**: Users can't mess up key exchange
- **Familiar UX**: Just signing messages like normal dApps
- **Self-sovereign**: No centralized key servers or databases
- **Public retrieval IDs**: Can be shared openly without security risk

## Implementation Priority
1. **Phase 1-3**: Core encryption services (keys, encryption, storage)
2. **Phase 4-5**: UI components (upload, download)
3. **Phase 6**: Integration with existing SaaS app
4. **Future**: Advanced features and optimizations
