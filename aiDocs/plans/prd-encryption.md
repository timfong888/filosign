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

### Privacy Guarantees
- ✅ **No relationship leakage**: Wallet addresses are NOT stored on-chain
- ✅ **Cryptographic access control**: Only successful decryption proves authorization
- ✅ **Plausible deniability**: No public record of who sent what to whom
- ✅ **Metadata protection**: No timestamps, file sizes, or sender/recipient info exposed
- ✅ **Pattern analysis resistance**: Cannot determine interaction frequency between parties

### Hybrid Encryption Approach
```javascript
// 1. Generate random AES key for this document
const aes_key = generateRandomAESKey(); // 256-bit

// 2. Encrypt the document with AES
const encrypted_document = AES.encrypt(document, aes_key);

// 3. Encrypt the AES key for BOTH parties
const encrypted_key_for_alice = ECIES.encrypt(aes_key, alice_public_key);
const encrypted_key_for_bob = ECIES.encrypt(aes_key, bob_public_key);

// 4. Store ONLY encrypted data in PDP (NO addresses for privacy)
store({
  encrypted_document,
  encrypted_key_for_alice,
  encrypted_key_for_bob,
  retrieval_id
  // NOTE: No alice_address or bob_address stored - preserves privacy!
});
```

## Simplified User Experience

### Core Flow (UPDATED - Addresses Technical Limitation)
❌ **Previous Assumption**: Alice could encrypt for Bob using only his wallet address
✅ **Technical Reality**: Bob must setup his encryption key before Alice can encrypt for him

**Revised Flow - Request-Accept Model:**
1. **Alice** connects wallet and sets up encryption key (signs message)
2. **Alice** creates document request for Bob (specifies Bob's address + uploads document)
3. **Bob** receives notification about pending document request
4. **Bob** connects wallet and sets up encryption key (signs message)
5. **Bob** accepts the document request
6. **Alice** gets notification that Bob accepted - document auto-encrypts for both parties
7. **Bob** can now decrypt and download the document using retrieval ID
8. **Done** - Secure exchange with explicit consent from both parties

### Public Key Setup Process (Critical UX Flow)
After a user connects their wallet, they must complete a one-time encryption setup:

1. **Wallet Connected State**: User sees their wallet is connected but encryption is not yet enabled
2. **Setup Prompt**: A clear notification appears: "To send documents, you need to set up encryption by signing a message"
3. **Setup Button**: User clicks "Setup Encryption Key" button
4. **MetaMask Signature**: User signs a standard message in MetaMask (this does NOT expose their private key)
5. **Public Key Extraction**: The application extracts the user's public key from the signature
6. **Encryption Ready**: User can now send and receive encrypted documents

**Important Security Notes:**
- The signature process only reveals the user's **public key**, never their private key
- This public key is derived mathematically from their wallet address
- The public key is essential for others to encrypt documents that only the user can decrypt
- This is a standard cryptographic process used by many dApps
- The user's private key remains safely in their MetaMask wallet

### User Journey (UPDATED)
```
Alice: "I want to send Bob a document"
→ Enter Bob's address → Upload file → Create request → Wait for Bob's acceptance

Bob: "Alice wants to send me a document"
→ Connect wallet → Setup encryption → Accept request → Auto-encrypt happens

Alice: "Bob accepted my request"
→ Document is now encrypted → Share retrieval ID with Bob

Bob: "I have the retrieval ID"
→ Enter retrieval ID → Auto-decrypt → Download file
```

**Key Change**: Document encryption happens AFTER Bob accepts, not when Alice uploads

## Technical Requirements

### Core Capabilities
- **Hybrid Encryption**: AES-256 for documents, ECIES for key exchange
- **Public Key Management**: Extract from MetaMask signatures, cache locally
- **Privacy-First Storage**: No addresses or metadata stored on-chain
- **Cryptographic Access Control**: Decryption ability proves authorization

### Integration Requirements
- **MetaMask Integration**: Wallet connection and message signing
- **PDP Storage**: Decentralized document storage with retrieval IDs
- **Local Caching**: Public key storage for performance
- **Progressive Enhancement**: Works without complex setup

*Detailed technical specifications are available in [engineering_design.md](./engineering_design.md)*

## Simplified User Flows

### Alice Sends Document to Bob (UPDATED FLOW)
1. **Alice**: Connect MetaMask wallet → Setup encryption key (one-time)
2. **Alice**: Enter Bob's wallet address → Upload file → Create document channel request
3. **Bob**: Receives notification → Connect MetaMask wallet → Setup encryption key (one-time)
4. **Bob**: Create document channel with Alice (establishes secure pathway)
5. **System**: Auto-encrypt document for both Alice and Bob → Generate retrieval ID
6. **Alice**: Share retrieval ID with Bob (copy/paste, QR code, etc.)
7. **Bob**: Enter retrieval ID → Auto-decrypt → Download file
8. **Done** - Secure exchange with explicit consent

### Technical Flow (Hidden from Users) - UPDATED
1. Alice connects wallet → signs message → extract Alice's public key → cache
2. Alice uploads file → create document request → store unencrypted temporarily
3. Bob connects wallet → signs message → extract Bob's public key → cache
4. Bob accepts request → trigger encryption process
5. Generate AES key → encrypt document → encrypt AES key for both parties → store in PDP
6. Bob downloads → retrieve from PDP → decrypt AES key → decrypt document → save file

**Critical Change**: Encryption happens AFTER both parties have setup their keys, not during upload

*Detailed cryptographic protocols are documented in [engineering_design.md](./engineering_design.md)*

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

## Privacy Benefits (Enhanced Design)
- **Zero relationship leakage**: No wallet addresses stored on-chain
- **Cryptographic access control**: Decryption ability IS the authorization
- **Metadata protection**: No file names, sizes, timestamps, or sender info exposed
- **Pattern analysis resistance**: Cannot determine interaction patterns between parties
- **Plausible deniability**: No public proof of who sent what to whom
- **Maximum confidentiality**: Only the encrypted content and retrieval ID are public

## Development Roadmap

### Phase 1: Core Foundation
- Wallet connection and public key discovery
- Basic encryption/decryption workflow
- Local storage for testing

### Phase 2: Privacy Enhancement
- Remove address storage from documents
- Implement cryptographic access control
- Privacy-preserving document retrieval

### Phase 3: Production Ready
- PDP storage integration
- Performance optimization
- Security audit and testing

### Phase 4: Advanced Features
- Bulk document operations
- Enhanced user experience
- Mobile optimization

*Detailed implementation specifications are in [engineering_design.md](./engineering_design.md)*
