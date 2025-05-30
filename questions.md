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

## Next Steps
I'll proceed with the assumptions listed above and build a functional MVP. Please review these questions and provide guidance on any items where my assumptions might not align with your vision.

The goal is to have a working dApp that demonstrates the core golden path functionality while being easily extensible for the more advanced features.
