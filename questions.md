# Questions for Async Review

## Project Understanding Questions

### 1. Technology Stack Clarification
- **Question**: The PRDs mention "Filecoin" in the title but the encryption PRD suggests IPFS storage. Should this be a Filecoin-based dApp or IPFS-based? The PDP documentation suggests Filecoin integration.
- **Impact**: This affects the entire storage architecture and smart contract deployment strategy.
- **Answer**: PDP, which is a new proof on Filecoin, would be the integration instead of IPFS.

### 2. MVP Scope Definition
- **Question**: The MVP.md shows hardcoded values for Calibration testnet. Should the dApp be deployed to:
  - Calibration testnet only (for demo purposes)
  - Ethereum mainnet with Filecoin integration
  - Both with environment-based switching
- **Current Assumption**: Building for Calibration testnet with the hardcoded values from MVP.md
- **Answer**: We will build for Calibration testnet only for the MVP.  Ethereum mainnet with Filecoin integration will be a future enhancement.

### 3. Encryption Implementation
- **Question**: The encryption PRD suggests two different approaches:
  - Simple MetaMask signature-based encryption (prd-encryption.md)
  - Full PDP + Payments workflow (from aiDocs)
- **Current Assumption**: Implementing the simpler MetaMask signature approach for MVP, with PDP integration as future enhancement
- **Answer**: We will implement the simpler MetaMask signature-based encryption for the MVP.  Full PDP + Payments workflow will be a future enhancement.

### 4. Smart Contract Deployment
- **Question**: Should I deploy new smart contracts or use the existing deployed contracts mentioned in MVP.md?
- **Current Assumption**: Using existing deployed contracts from MVP.md for faster development
- **Answer**: We will deploy new smart contracts for the MVP.  The existing contracts are from a previous version of the dApp and may not be compatible with the new architecture.  (if we can avoid doing so, then we will, but I am curious about whether or not we can, in fact, do this while keeping the uploaded document encryption compatible with the new architecture)

### 5. Document Storage Location
- **Question**: Where should encrypted documents be stored?
  - IPFS (as suggested in encryption PRD)
  - Filecoin via PDP system (as suggested in aiDocs)
  - Simple cloud storage for MVP
- **Current Assumption**: IPFS for MVP, with clear migration path to Filecoin/PDP
- **Answer**: PDP, interacting directly with the smart contracts, hard coding where we need to.  IPFS is not needed.  

### 6. Wallet Integration Scope
- **Question**: Should the dApp support:
  - MetaMask only (as mentioned in PRDs)
  - Multiple wallet providers (WalletConnect, etc.)
- **Current Assumption**: MetaMask only for MVP
- **Answer**: MetaMask only for the MVP.  Multiple wallet providers will be a future enhancement.  (However, my assumption is that any MetaMask compatible wallet should work, so WalletConnect, etc. should be a relatively minor change.)

### 7. PDF Preview Implementation
- **Question**: The PRD mentions PDF preview functionality. Should this be:
  - Client-side PDF rendering (using PDF.js)
  - Server-side PDF to image conversion
  - Simple download link
- **Current Assumption**: Client-side PDF.js for better UX
- **Answer**: Client-side PDF.js for better UX; (my understanding is that this library should make it straightforward)

### 8. Retrieval ID Format
- **Question**: What format should the Retrieval ID have?
  - Simple UUID
  - Blockchain transaction hash
  - IPFS content hash
- **Current Assumption**: UUID for simplicity, with metadata stored on-chain
- **Answer**: this i don't know; I believe when working with PDP, a retrieval ID is returned; but you will need to review the code and try to implement that to find out.  My understanding is a hash is returned, but it may not be a UUID.

## Technical Implementation Questions

### 9. Backend Architecture
- **Question**: The prompts suggest a Python FastAPI backend, but the PRDs don't specify backend requirements. Should I:
  - Build a full backend API
  - Use a serverless approach (Vercel functions)
  - Go fully client-side with smart contracts
- **Current Assumption**: Serverless Vercel functions for MVP simplicity
- **Answer**: That is a mistake; the prompt is incorrect, so we need to change that.  Serverless Vercel functions for MVP simplicity.

### 10. Database Requirements
- **Question**: What data needs to be stored off-chain?
  - User profiles and document metadata
  - Just temporary upload data
  - Nothing (fully on-chain)
- **Current Assumption**: Minimal off-chain storage, primarily on-chain for transparency
- **Answer**: Minimal off-chain storage, primarily on-chain for transparency.  Right now, I don't think we need any off-chain storage.  Something like the FullName might be able to be included as meta-data in the smart contract.

### 11. Testing Strategy
- **Question**: What level of testing is expected for the MVP?
  - Unit tests only
  - Integration tests with testnet
  - E2E tests with MetaMask simulation
- **Current Assumption**: Basic unit tests + manual E2E testing
- **Answer**: Basic unit tests + manual E2E testing

## Deployment Questions

### 12. Vercel Deployment Configuration
- **Question**: Any specific Vercel deployment requirements?
  - Custom domain setup needed
  - Environment variable management
  - Build optimization preferences
- **Current Assumption**: Standard Vercel deployment with environment variables
- **Answer**: Standard Vercel deployment with environment variables.  More specifically: if you can just use the Vercel SDK and deploy your code directly to Vercel, we should.  Let me know if we can do this.

### 13. Environment Management
- **Question**: How should different environments be handled?
  - Development (local)
  - Staging (testnet)
  - Production (mainnet)
- **Current Assumption**: Development and staging environments, production as future phase
- **Answer**: Development only (which includes pushing to MVP); if development is just localhost, then staging is to Vercel.

## Additional PRD Clarification Questions

### 14. PDF Preview Implementation Details
- **Question**: The PRD mentions "Your Document" section with PDF preview after upload. Should this be:
  - Full embedded PDF viewer with zoom/navigation controls
  - Simple thumbnail preview
  - First page preview only
- **Current Implementation**: Planning full PDF.js viewer with navigation
- **Answer**: The simplest possible.  If PDF.js viewer is too hard, then a thumbnail preview is fine.  But I am not familiar with PDF.js so not clear on the effort or complexity.

### 15. Document Signing UX Flow
- **Question**: The PRD mentions "Sign and Secure" but doesn't specify the signing UX. Should this:
  - Show a MetaMask signature popup immediately
  - Display a confirmation dialog first, then MetaMask
  - Include a digital signature overlay on the PDF itself
- **Current Implementation**: Planning MetaMask signature popup with confirmation
- **Answer**: Please update the PRD with this answer: It show just show a MetaMask signature popup immediately.  Maybe there is a small text on the page that says, "Signing with MetaMask is the same as signing a document.  This action can only be performed by the owner of your private key."

### 16. Signed Documents Section Location
- **Question**: The PRD mentions "Signed Documents" section but doesn't specify where this appears:
  - On the main dashboard after wallet connection
  - As a separate page/tab
  - Both sender and recipient see their respective signed documents
- **Current Implementation**: Planning dashboard section showing user's document history
- **Answer**: Please update the PRD with this answer: On the main dashboard after wallet connection.  Both sender and recipient see their respective signed documents.  It's on the same main page afte wallet connection.

### 17. Document Re-access Functionality
- **Question**: The PRD says "Clicking on the Link of the Retrieval ID takes User back to a page with a full Preview". Should this:
  - Allow re-downloading the signed document
  - Show read-only preview with signature status
  - Allow additional signatures from other parties
- **Current Implementation**: Planning read-only preview with signature status
- **Answer**: Please update the PRD with this answer: Show read-only preview with signature status.  No re-downloading the signed document.  No additional signatures from other parties.

### 18. Wallet Address Verification
- **Question**: The PRD mentions "Make sure that you are using the same Wallet Address that your sender said they have used." Should this:
  - Be just instructional text
  - Include automatic verification against the document metadata
  - Show the expected wallet address from the document
- **Current Implementation**: Planning to show expected recipient address with verification
- **Answer**: Please update the PRD with this answer: Include automatic verification against the document metadata.  Show the expected wallet address from the document.  If the wrong wallet is used, show an error message.  If the correct wallet is used, show a success message.  Note: this verification should be part of the decryption process.

### 19. Error Handling Scenarios
- **Question**: The PRD doesn't specify error handling. What should happen when:
  - Invalid Retrieval ID is entered
  - Wrong wallet tries to access a document
  - Document decryption fails
  - Network/blockchain errors occur
- **Current Implementation**: Planning user-friendly error messages with retry options
- **Answer**: Please update the PRD with this answer: For Invalid Retrieval ID, show an error message and allow the user to try again.  For Wrong wallet, show an error message and allow the user to try again.  For Document decryption fails, show an error message and allow the user to try again.  For Network/blockchain errors, show an error message and allow the user to try again.  For all errors, the user should be able to try again.

### 20. Document Metadata Display
- **Question**: The PRD mentions showing "Date and Time of signature, Wallet Address of signee, Full Name" but doesn't specify:
  - Date format (relative time vs absolute)
  - How to handle long wallet addresses (truncation)
  - Whether to show additional metadata (file size, upload time, etc.)
- **Current Implementation**: Planning relative time, truncated addresses, basic metadata
- **Answer**:  Please update the PRD with this answer: Show the date and time of signature in absolute format (MM/DD/YYYY HH:MM AM/PM)  Show the full wallet address.  Do not show additional metadata.

### 21. Multi-Document Support
- **Question**: The PRD focuses on single document flow. Should the MVP support:
  - Multiple documents per retrieval ID
  - Batch document operations
  - Document versioning/updates
- **Current Implementation**: Planning single document per retrieval ID for MVP
- **Answer**: Please update the PRD with this answer: The MVP will support single document per retrieval ID.  Multiple documents per retrieval ID will be a future enhancement.  Batch document operations will be a future enhancement.  Document versioning/updates will be a future enhancement.

### 22. Mobile Responsiveness Requirements
- **Question**: The PRD mentions "modern SaaS page" but doesn't specify mobile requirements:
  - Should MetaMask mobile app integration work
  - Touch-friendly PDF viewing on mobile
  - Responsive design priorities (mobile-first vs desktop-first)
- **Current Implementation**: Planning responsive design with mobile MetaMask support
- **Answer**: Please update the PRD with this answer: Inherit whatever responsiveness comes with Vercel.  Mobile MetaMask support is not required for the MVP.  Touch-friendly PDF viewing on mobile is not required for the MVP.  Responsive design should be mobile-first - but do not expend effort on this for the MVP -- only if we get it for "free" based on templates or UI frameworks.

### 23. Document Access Permissions
- **Question**: The PRD doesn't specify access control beyond encryption:
  - Can sender access the document after sending
  - Can documents be shared with multiple recipients
  - Should there be document expiration/revocation
- **Current Implementation**: Planning sender can always access, single recipient for MVP
- **Answer**: Please update the PRD with this answer: the document is always retrievable by the sender and recipient.  Multiple recipients are not supported in the MVP.  Document expiration/revocation is not supported in the MVP.Sure i

## Encryption Flow Analysis & Questions

### 24. Encryption Architecture Gap Analysis
- **Question**: After reviewing the encryption PRD, there's a significant architecture gap between current mock implementation and the proposed encryption flow:
  - **Current**: Simple mock storage with fake encryption
  - **PRD Proposed**: Complex smart contract + public key extraction + ECIES encryption + IPFS storage
- **Impact**: The encryption PRD describes a completely different application architecture that would require:
  - Smart contract deployment and interaction
  - Public key extraction from MetaMask signatures
  - Real ECIES encryption implementation
  - IPFS integration for document storage
  - Transaction-based request/acceptance flow
- **Current Implementation Status**: We have a working SaaS app with mock encryption that demonstrates the UX flow
- **Question**: Should we:
  - A) Continue with mock implementation for UX validation, then implement real encryption later
  - B) Pivot to implement the full encryption architecture from the PRD
  - C) Implement a simplified version of the encryption flow that bridges both approaches

### 25. Request/Acceptance Flow vs Current UX
- **Question**: The encryption PRD describes a 2-step transaction flow:
  1. Alice signs "sending request" to Bob's address
  2. Bob signs "acceptance" transaction
  3. Then document upload/encryption happens
- **Current Implementation**: Direct document upload with recipient specification
- **UX Impact**: The PRD flow requires Bob to accept before Alice can even upload the document
- **Question**: Should we modify the current UX to match the PRD's request/acceptance pattern, or adapt the encryption to work with the current direct-send UX?

### 26. Smart Contract Deployment Requirements
- **Question**: The encryption PRD specifies a complete smart contract system with:
  - DocumentExchange contract with specific functions
  - Request management and IPFS CID storage
  - Event emission for real-time updates
- **Current Status**: No smart contracts deployed or integrated
- **Development Impact**: This would require significant additional development time
- **Question**: Is smart contract development a priority for the current phase, or should we focus on perfecting the UX with mocks first?

### 27. Public Key Extraction Complexity
- **Question**: The PRD describes automatic public key extraction from MetaMask transaction signatures
- **Technical Complexity**: This requires:
  - Transaction monitoring and signature analysis
  - Public key recovery from ECDSA signatures
  - Key caching and validation systems
- **Current Implementation**: No key extraction, using mock encryption
- **Question**: Should we implement a simplified version using MetaMask's built-in encryption methods instead of transaction-based key extraction?

### 28. IPFS vs PDP Storage Integration
- **Question**: The encryption PRD mentions IPFS storage, but previous answers indicated PDP integration
- **Conflict**:
  - Encryption PRD: "Upload encrypted payload to IPFS"
  - Previous Answer: "PDP, interacting directly with the smart contracts"
- **Question**: Should the encryption implementation use IPFS (as in PRD) or PDP (as previously answered)?

### 29. Development Priority and Timeline
- **Question**: Given the current working mock implementation, what's the priority order:
  - A) Perfect the UX flow with mocks, then implement real encryption
  - B) Implement basic encryption first, then enhance UX
  - C) Implement the full PRD encryption architecture immediately
- **Current Status**: We have a working SaaS app that demonstrates the complete user journey
- **Question**: Should we deploy the current mock version for user testing while developing the encryption backend?

## Proposed Simplified Encryption Approach

### 30. MetaMask Signature-Based Encryption
- **Proposal**: Use MetaMask message signing to derive encryption keys instead of complex transaction-based key extraction
- **Benefits**:
  - Works with current UX flow (no request/acceptance required)
  - Simpler implementation than transaction monitoring
  - Still achieves core security goal (only sender/recipient can decrypt)
  - Uses familiar MetaMask signing UX
- **Technical Approach**:
  - Alice signs deterministic message to derive encryption key
  - Bob signs same message format to derive decryption key
  - Hybrid encryption with recipient's public key
  - Store encrypted data in PDP with retrieval ID
- **Question**: Does this approach meet the security requirements while maintaining UX simplicity?

### 31. Public Key Discovery Method
- **Question**: For the proposed encryption, how should we obtain recipient's public key?
  - A) Require recipient to sign a "registration" message first (one-time setup)
  - B) Use a public key registry smart contract
  - C) Extract from any previous transaction by the recipient
  - D) Request it directly through a separate flow
- **Recommendation**: Option A - one-time registration message signing

### 32. Message Format Standardization
- **Question**: For deterministic encryption, should the message format be:
  - A) Simple: "FiloSign-{sender}-{recipient}-{timestamp}"
  - B) Structured: JSON with metadata
  - C) Include document hash for additional security
- **Security Consideration**: Message must be reconstructible by recipient
- **Recommendation**: Option A for simplicity, with option to enhance later

### 33. Retrieval ID Generation
- **Question**: Should retrieval ID be:
  - A) Hash of the signed message (deterministic)
  - B) Random UUID stored with metadata
  - C) PDP storage hash/CID
- **Current Proposal**: Hash of signed message for deterministic retrieval
- **Question**: Does this approach work with PDP storage patterns?

## Next Steps
I'll proceed with the assumptions listed above and build a functional MVP. Please review these questions and provide guidance on any items where my assumptions might not align with your vision.

The goal is to have a working dApp that demonstrates the core golden path functionality while being easily extensible for the more advanced features.
