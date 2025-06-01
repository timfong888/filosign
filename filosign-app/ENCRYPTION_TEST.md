# Encryption Flow Test

This document describes the encryption flow testing functionality implemented in FiloSign.

## Overview

The encryption flow test validates that public keys can be successfully extracted from wallet signatures for both sender and recipient parties. This is a critical component of the end-to-end encryption system.

## How It Works

### 1. Public Key Discovery Process

When a user connects their wallet and clicks "Setup Encryption Key":

1. **Message Generation**: A standard message is generated using the wallet address
2. **Wallet Signature**: The user signs the message using their MetaMask (or compatible) wallet
3. **Public Key Extraction**: The signature is processed using viem's `recoverPublicKey` function
4. **Validation**: The recovered address is validated against the original wallet address
5. **Caching**: The public key is cached locally for future use

### 2. Test Page Features

The `/test-encryption` page provides:

- **Role Selection**: Test as either "Sender" or "Recipient"
- **Wallet Connection**: Connect different wallets or the same wallet in different roles
- **Public Key Display**: Shows the full extracted public key with success message
- **Test History**: Maintains a history of all successful extractions
- **Results Persistence**: Test results are saved to localStorage

### 3. Success Indicators

When public key extraction is successful, you'll see:

- ✅ **SUCCESS: Public Key Extracted!** message
- Full public key displayed in a code block
- Green success indicators
- Test results saved to history

## Testing Instructions

### Basic Test Flow

1. **Navigate to Test Page**:
   - Go to the main dashboard
   - Click "Open Encryption Test Page" in the test section
   - Or navigate directly to `/test-encryption`

2. **Test as Sender**:
   - Select "Test as Sender" role
   - Connect your wallet (MetaMask recommended)
   - Click "Setup Encryption Key"
   - Sign the message when prompted
   - Verify the public key is displayed

3. **Test as Recipient**:
   - Select "Test as Recipient" role
   - Connect the same wallet or a different wallet
   - Click "Setup Encryption Key"
   - Sign the message when prompted
   - Verify the public key is displayed

### Advanced Testing

- **Multiple Wallets**: Test with different wallet addresses
- **Role Switching**: Switch between sender and recipient roles
- **Persistence**: Refresh the page and verify test results are maintained
- **Error Handling**: Test with wallet disconnection scenarios

## Technical Implementation

### Key Components

1. **WalletConnection Component** (`/src/components/wallet-connection.tsx`):
   - Enhanced to display full public key with success message
   - Shows extracted public key in a formatted code block

2. **PublicKeyService** (`/src/lib/public-key-service.ts`):
   - Handles public key discovery and caching
   - Uses viem for cryptographic operations
   - Validates signatures against wallet addresses

3. **Test Page** (`/src/app/test-encryption/page.tsx`):
   - Dedicated testing interface
   - Role-based testing (sender/recipient)
   - Test result persistence and display

### Key Functions

- `discoverPublicKey()`: Main function that orchestrates the discovery process
- `extractPublicKeyFromSignature()`: Extracts public key using viem's recoverPublicKey
- `validateSignature()`: Ensures signature matches the wallet address

## Expected Results

### Successful Test

When the test is successful, you should see:

```
✅ SUCCESS: Public Key Extracted!

Public Key:
0x04a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890
```

### Error Scenarios

Common error scenarios and their meanings:

- **"Signature validation failed"**: The recovered address doesn't match the wallet
- **"Failed to extract public key"**: Issue with the cryptographic extraction
- **"User rejected the request"**: User cancelled the signing process

## Security Considerations

- Public keys are stored locally and are not sensitive information
- The signing process uses standard Ethereum message signing
- No private keys are ever exposed or transmitted
- All cryptographic operations use established libraries (viem)

## Next Steps

After successful public key extraction testing:

1. **Document Encryption**: Use extracted public keys for ECIES encryption
2. **Key Exchange**: Implement secure key exchange between parties
3. **End-to-End Flow**: Test complete send/receive with real encryption
4. **Production Deployment**: Deploy with real encryption backend
