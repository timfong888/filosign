# FiloSign Testing Guide

## Quick Fix for Current Error

The "Invalid encrypted data format" error occurs because there are old format documents in storage. To fix this immediately:

### 1. Clear All Data (Recommended)
Open browser console and run:
```javascript
mockStorage.clearAll();
```

This will remove all old format documents and give you a clean slate.

### 2. Refresh the Page
After clearing data, refresh the page to ensure clean state.

## Testing the Production Workflow

There are no separate "test" methods - everything uses the same production workflow:

### Step 1: Connect First Wallet (Sender)
1. Go to http://localhost:3000
2. Click "Connect Wallet" 
3. Connect with MetaMask
4. Click "Setup Encryption Key" and sign the message
5. You should see "✅ Encryption Ready"

### Step 2: Send a Document
1. Click "Send Document"
2. Upload a PDF file
3. Enter recipient address (you can use one of the mock addresses or another real wallet)
4. Enter recipient name
5. Click "Sign and Secure"

**Note**: If recipient doesn't have a public key cached, you'll get an error. This is correct behavior.

### Step 3: Set Up Recipient (if needed)
If using a second wallet:
1. Logout from first wallet
2. Connect second wallet (recipient)
3. Set up encryption key
4. Note the address

### Step 4: Receive Document
1. Make sure you're connected as the recipient wallet
2. Go to "Sign Received Document"
3. Enter the retrieval ID from step 2
4. Click "Retrieve Document"
5. The document should decrypt successfully

## Mock Users for Testing

You can use these pre-defined addresses for quick testing:

```javascript
// Available in MOCK_USERS
const mockUsers = [
  { address: '0x1234567890123456789012345678901234567890', name: 'Alice Johnson' },
  { address: '0x0987654321098765432109876543210987654321', name: 'Bob Smith' },
  { address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', name: 'Carol Davis' }
];
```

**Important**: These mock users don't have public keys cached, so you need to connect with real wallets to test the full encryption flow.

## Testing Dual Access

The system allows both sender and recipient to decrypt documents:

### Test Sender Access
1. Send a document as Wallet A
2. Stay connected as Wallet A
3. Go to receive page
4. Enter the retrieval ID
5. You should be able to decrypt as the sender

### Test Recipient Access  
1. Logout and connect as Wallet B (recipient)
2. Go to receive page
3. Enter the same retrieval ID
4. You should be able to decrypt as the recipient

### Test Access Denial
1. Connect as Wallet C (neither sender nor recipient)
2. Try to access the document
3. Should get "Access denied" error

## Debugging Commands

### Check Storage
```javascript
// List all documents
mockStorage.debugListDocuments();

// Check if user has public key
await publicKeyService.getPublicKey('0x...');

// Check document access
const doc = mockStorage.getDocumentByRetrievalId('FS-ABC12345');
await mockStorage.canUserAccessDocument(doc, 'YOUR_ADDRESS');
```

### Clear Data
```javascript
// Clear everything
mockStorage.clearAll();

// Clear just public keys
await publicKeyService.clearCache();
```

## Common Issues

### "Cannot find public key for recipient"
**Cause**: Recipient hasn't connected their wallet and set up encryption
**Solution**: Connect recipient wallet and complete encryption setup

### "Access denied"
**Cause**: Connected wallet is neither sender nor recipient
**Solution**: Connect with the correct wallet address

### "Document decryption failed"
**Cause**: Public key mismatch or corrupted data
**Solution**: Check console logs for details, may need to clear data

### "Invalid encrypted data format"
**Cause**: Old format documents in storage
**Solution**: Run `mockStorage.clearAll()` in console

## Production vs Development

### What's the Same
- Encryption/decryption logic
- Public key extraction
- Access control
- Document storage structure

### What's Different in Production
- Real IPFS/Filecoin storage instead of localStorage
- Proper ECIES encryption instead of base64
- Real blockchain signatures instead of mock signing
- ENS name resolution for user names

## Best Practices

1. **Always clear data** when switching between different encryption implementations
2. **Use real wallet addresses** for testing, not hardcoded mock addresses
3. **Test both sender and recipient flows** to verify dual access
4. **Check console logs** for detailed debugging information
5. **Test access denial** to ensure security works correctly

The system now uses a single, consistent workflow for all operations - no separate test methods or confusing parallel systems.
