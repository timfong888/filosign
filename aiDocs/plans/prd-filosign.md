# FiloSign PRD - Secure Document Sharing on Filecoin PDP

## Overview
FiloSign enables secure document sharing using Filecoin's Proof of Data Possession (PDP) for decentralized storage. Users pay directly from their connected wallet to upload documents to Filecoin, receive retrieval IDs, and share documents with others who can access them using those IDs.

## Project Scope & Milestones

### Phase 1: Core Document Sharing (This PRD)
- Upload documents to Filecoin PDP with wallet payment
- Generate and share retrieval IDs
- Retrieve and view documents
- Basic wallet integration with wagmi
- Direct payment flow from connected wallet

### Phase 2: Encryption Layer (Separate PRD)
- Hybrid encryption (AES + ECIES)
- Private document sharing
- Cryptographic access control

## Core User Flows

### Sender Flow
1. **Connect Wallet**: User connects MetaMask via wagmi
2. **Upload Document**: Select and upload PDF file
3. **Review Cost**: Display storage cost and duration
4. **Confirm Payment**: User approves transaction from their wallet
5. **Store on PDP**: Document automatically stored on Filecoin PDP after payment confirmation
6. **Receive Retrieval ID**: Get unique ID (CID-based) for document access
7. **Share ID**: Copy/send retrieval ID to intended recipient

### Recipient Flow
1. **Connect Wallet**: User connects MetaMask via wagmi (optional for retrieval)
2. **Enter Retrieval ID**: Input the received retrieval ID
3. **Retrieve Document**: System fetches document from Filecoin PDP
4. **View Document**: Preview document in browser

## Payment Flow

### Storage Pricing
- **Cost Structure**: Based on PDP contract pricing (file size + storage duration)
- **Payment Token**: FIL (Filecoin native token)
- **Default Duration**: 180 days storage
- **Price Display**: Show cost in FIL and USD equivalent

### Transaction Flow
```
File Upload → Calculate Storage Cost → Display Price → 
User Confirms Payment → wagmi Transaction → PDP Contract → 
Storage Deal Created → Document Stored → Return Retrieval ID
```

### Payment UI Components
- **Cost Calculator**: Real-time price estimation based on file size
- **Transaction Preview**: Show gas fees + storage costs before confirmation
- **Payment Status**: Real-time transaction monitoring with wagmi
- **Receipt**: Transaction hash and storage deal confirmation

## Technical Architecture

### PDP Integration (Reference: hotvault-demo)
Based on the hotvault-demo implementation:

- **Smart Contracts**: Use existing PDP contracts for storage deals
- **Payment Flow**: Direct wallet payment to PDP contracts
- **Storage Verification**: PDP proofs ensure document persistence
- **Network**: Deploy on Filecoin Calibration testnet

### Key Dependencies
- **wagmi**: Modern React hooks for Ethereum (replacing ethers.js)
- **viem**: Low-level Ethereum client (wagmi's transport layer)
- **Filecoin PDP contracts**: From hotvault-demo repository
- **IPFS/Filecoin**: For document storage and retrieval

### Storage Flow with Payment
```
Document Upload → Calculate Storage Cost → wagmi Payment Transaction → 
PDP Smart Contract → Filecoin Storage Deal → Generate CID → Return Retrieval ID
```

### Retrieval Flow
```
Retrieval ID Input → Query PDP Contract → Fetch from Filecoin → 
Return Document to Browser
```

## UI/UX Requirements

### Main Page Layout
- **Header**: "FiloSign - Decentralized Document Sharing"
- **Wallet Connection**: wagmi ConnectButton component with balance display
- **Two Main Actions**:
  - "Upload Document" button
  - "Retrieve Document" section

### Upload Document Page
- **File Upload**: Drag-and-drop or file picker for PDF
- **Document Preview**: Show uploaded document
- **Cost Display**: 
  - File size and estimated storage cost
  - Storage duration selector (30, 90, 180, 365 days)
  - Real-time price updates
- **Payment Section**:
  - Wallet balance check
  - Transaction preview (storage cost + gas)
  - "Pay and Store on Filecoin" button
- **Transaction Status**: Show wagmi transaction progress
- **Success State**: Display retrieval ID with copy button and transaction receipt

### Retrieve Document Page
- **Input Field**: "Enter Retrieval ID"
- **Retrieve Button**: "Fetch Document" (no payment required)
- **Loading State**: Show retrieval progress
- **Document Display**: In-browser PDF preview

### Wallet Integration
- **Balance Display**: Show FIL balance in connected wallet
- **Network Check**: Ensure user is on Filecoin Calibration testnet
- **Transaction History**: Show recent uploads from this wallet
- **Insufficient Funds**: Clear messaging when wallet balance is too low

### Design System
- **Framework**: Next.js with TailwindCSS
- **Components**: Shadcn/ui components
- **Wallet UI**: wagmi's built-in components
- **Deployment**: Vercel

## Technical Implementation Details

### wagmi Configuration
```typescript
// Reference hotvault-demo contracts but use wagmi instead of ethers.js
import { createConfig, http } from 'wagmi'
import { filecoinCalibration } from 'wagmi/chains'

const config = createConfig({
  chains: [filecoinCalibration],
  transports: {
    [filecoinCalibration.id]: http()
  }
})
```

### Core Components
1. **DocumentUploader**: Handle file upload, cost calculation, and payment
2. **PaymentFlow**: Handle transaction confirmation and monitoring
3. **DocumentRetriever**: Handle retrieval ID input and document fetching
4. **PDPContract**: wagmi hooks for contract interactions
5. **TransactionStatus**: Real-time transaction monitoring
6. **WalletBalance**: Display and monitor wallet balance

### Payment Integration
- **Cost Calculation**: Query PDP contract for current pricing
- **Balance Validation**: Check sufficient FIL balance before transaction
- **Transaction Simulation**: Estimate gas costs before submission
- **Payment Confirmation**: Handle transaction success/failure states

### File Handling
- **Accepted Types**: PDF only for MVP
- **Size Limits**: Based on PDP contract limits and user's wallet balance
- **Storage Format**: Raw file data to IPFS/Filecoin
- **Metadata**: File size, upload timestamp, storage duration, payment amount

## Error Handling

### Upload Errors
- **File too large**: Show size limit and cost implications
- **Insufficient funds**: Clear message with required amount
- **Transaction failed**: Display wagmi error with retry option
- **PDP contract failure**: Show specific contract error
- **Network issues**: Handle connection problems

### Payment Errors
- **Transaction rejected**: User cancelled in wallet
- **Gas estimation failed**: Network congestion or contract issues
- **Insufficient gas**: Display gas requirements
- **Storage deal failed**: Refund mechanism if storage fails after payment

### Retrieval Errors
- **Invalid retrieval ID**: Clear error message
- **Document not found**: Check if storage deal expired
- **Network timeout**: Retry mechanism
- **Corrupted file**: Verification failure handling

## Security Considerations (Phase 1)

### Payment Security
- **Direct Wallet Control**: Users maintain full control of their funds
- **Transaction Transparency**: All payments visible on blockchain
- **No Custodial Risk**: No platform holds user funds
- **Smart Contract Risk**: PDP contracts handle escrow and storage deals

### Current Security Model
- **Public Documents**: All uploaded documents are publicly accessible
- **Access Control**: Anyone with retrieval ID can access document
- **Wallet Connection**: Required for uploads (payment) but not retrieval
- **Payment Required**: Only paying users can upload documents

### Known Limitations
- **No Privacy**: Documents are not encrypted in Phase 1
- **Public Retrieval IDs**: Can be shared openly but provide no privacy
- **No Access Restrictions**: Any valid retrieval ID works for anyone
- **Storage Duration**: Documents may expire based on payment period

## Success Metrics

### Technical Metrics
- **Upload Success Rate**: >95% successful PDP storage after payment
- **Payment Success Rate**: >98% successful wallet transactions
- **Retrieval Success Rate**: >98% successful document retrieval
- **Transaction Time**: <30 seconds for storage deals
- **File Integrity**: 100% document integrity verification

### User Experience Metrics
- **Time to Upload**: <3 minutes including payment flow
- **Time to Retrieve**: <30 seconds document access
- **Payment Flow**: <2 minutes from file upload to storage confirmation
- **Error Rate**: <5% user-facing errors
- **Wallet Connection**: <15 seconds setup time

### Business Metrics
- **Payment Volume**: Total FIL processed through the platform
- **Storage Utilization**: Total data stored via the platform
- **User Retention**: Users who make repeat uploads
- **Average Transaction Size**: Typical storage deal value

## Development Roadmap

### Week 1: Foundation
- [ ] Set up Next.js + wagmi + TailwindCSS
- [ ] Implement wallet connection with wagmi
- [ ] Basic UI components and routing
- [ ] Wallet balance display and monitoring

### Week 2: Payment Integration
- [ ] Integrate hotvault-demo contracts with wagmi
- [ ] Build cost calculation system
- [ ] Implement payment flow with transaction monitoring
- [ ] Add insufficient funds and error handling

### Week 3: PDP Storage & Retrieval
- [ ] Implement file upload to IPFS/Filecoin after payment
- [ ] Build retrieval ID system
- [ ] Implement document fetching from Filecoin
- [ ] Add PDF preview component

### Week 4: Polish & Deploy
- [ ] Payment flow optimization
- [ ] Error handling and edge cases
- [ ] UI/UX improvements
- [ ] Deploy to Vercel
- [ ] Testing on Calibration testnet

## Repository Structure
```
/components
  /ui              # Shadcn components
  /upload          # Document upload components
  /payment         # Payment flow components
  /retrieve        # Document retrieval components
  /wallet          # Wallet integration components
/contracts         # PDP contract ABIs and addresses
/hooks             # wagmi custom hooks
/lib               # Utilities and helpers
/pages             # Next.js pages
/public            # Static assets
/utils             # Payment calculations and helpers
```

## Environment Setup
- **Node.js**: v18+
- **Framework**: Next.js 14
- **Styling**: TailwindCSS + Shadcn/ui
- **Wallet**: wagmi v2 + viem
- **Network**: Filecoin Calibration testnet
- **Deployment**: Vercel

## Testing Requirements
- **Payment Flow Testing**: Test with various file sizes and wallet balances
- **Transaction Monitoring**: Verify all transaction states are handled
- **Balance Validation**: Test insufficient funds scenarios
- **Storage Verification**: Confirm documents are retrievable after payment
- **Gas Estimation**: Test transaction cost predictions

---

# Phase 2 Preview: Encryption Integration
Once Phase 1 is complete and tested, Phase 2 will add the encryption layer detailed in the separate encryption PRD, transforming public document sharing into private, secure document exchange.
