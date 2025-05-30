# Questions for Async Review

## Project Understanding Questions

### 1. Technology Stack Clarification
- **Question**: The PRDs mention "Filecoin" in the title but the encryption PRD suggests IPFS storage. Should this be a Filecoin-based dApp or IPFS-based? The PDP documentation suggests Filecoin integration.
- **Impact**: This affects the entire storage architecture and smart contract deployment strategy.

### 2. MVP Scope Definition
- **Question**: The MVP.md shows hardcoded values for Calibration testnet. Should the dApp be deployed to:
  - Calibration testnet only (for demo purposes)
  - Ethereum mainnet with Filecoin integration
  - Both with environment-based switching
- **Current Assumption**: Building for Calibration testnet with the hardcoded values from MVP.md

### 3. Encryption Implementation
- **Question**: The encryption PRD suggests two different approaches:
  - Simple MetaMask signature-based encryption (prd-encryption.md)
  - Full PDP + Payments workflow (from aiDocs)
- **Current Assumption**: Implementing the simpler MetaMask signature approach for MVP, with PDP integration as future enhancement

### 4. Smart Contract Deployment
- **Question**: Should I deploy new smart contracts or use the existing deployed contracts mentioned in MVP.md?
- **Current Assumption**: Using existing deployed contracts from MVP.md for faster development

### 5. Document Storage Location
- **Question**: Where should encrypted documents be stored?
  - IPFS (as suggested in encryption PRD)
  - Filecoin via PDP system (as suggested in aiDocs)
  - Simple cloud storage for MVP
- **Current Assumption**: IPFS for MVP, with clear migration path to Filecoin/PDP

### 6. Wallet Integration Scope
- **Question**: Should the dApp support:
  - MetaMask only (as mentioned in PRDs)
  - Multiple wallet providers (WalletConnect, etc.)
- **Current Assumption**: MetaMask only for MVP

### 7. PDF Preview Implementation
- **Question**: The PRD mentions PDF preview functionality. Should this be:
  - Client-side PDF rendering (using PDF.js)
  - Server-side PDF to image conversion
  - Simple download link
- **Current Assumption**: Client-side PDF.js for better UX

### 8. Retrieval ID Format
- **Question**: What format should the Retrieval ID have?
  - Simple UUID
  - Blockchain transaction hash
  - IPFS content hash
- **Current Assumption**: UUID for simplicity, with metadata stored on-chain

## Technical Implementation Questions

### 9. Backend Architecture
- **Question**: The prompts suggest a Python FastAPI backend, but the PRDs don't specify backend requirements. Should I:
  - Build a full backend API
  - Use a serverless approach (Vercel functions)
  - Go fully client-side with smart contracts
- **Current Assumption**: Serverless Vercel functions for MVP simplicity

### 10. Database Requirements
- **Question**: What data needs to be stored off-chain?
  - User profiles and document metadata
  - Just temporary upload data
  - Nothing (fully on-chain)
- **Current Assumption**: Minimal off-chain storage, primarily on-chain for transparency

### 11. Testing Strategy
- **Question**: What level of testing is expected for the MVP?
  - Unit tests only
  - Integration tests with testnet
  - E2E tests with MetaMask simulation
- **Current Assumption**: Basic unit tests + manual E2E testing

## Deployment Questions

### 12. Vercel Deployment Configuration
- **Question**: Any specific Vercel deployment requirements?
  - Custom domain setup needed
  - Environment variable management
  - Build optimization preferences
- **Current Assumption**: Standard Vercel deployment with environment variables

### 13. Environment Management
- **Question**: How should different environments be handled?
  - Development (local)
  - Staging (testnet)
  - Production (mainnet)
- **Current Assumption**: Development and staging environments, production as future phase

## Next Steps
I'll proceed with the assumptions listed above and build a functional MVP. Please review these questions and provide guidance on any items where my assumptions might not align with your vision.

The goal is to have a working dApp that demonstrates the core golden path functionality while being easily extensible for the more advanced features.
