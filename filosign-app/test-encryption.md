# Testing the Encryption MVP

## Test Flow

### Step 1: Setup Alice (Sender)
1. Go to `http://localhost:3001`
2. Connect wallet (Alice's address)
3. Click "Setup Encryption Key"
4. Sign the message to extract public key
5. Verify key is cached locally

### Step 2: Setup Bob (Recipient) 
1. Open new browser/incognito window
2. Go to `http://localhost:3001`
3. Connect different wallet (Bob's address)
4. Click "Setup Encryption Key" 
5. Sign the message to extract public key
6. Verify key is cached locally

### Step 3: Alice Sends Document
1. In Alice's browser, go to "Send Document"
2. Upload a PDF file
3. Enter Bob's wallet address
4. Enter Bob's name
5. Click "Sign and Secure"
6. Should succeed and generate retrieval ID

### Step 4: Bob Receives Document
1. In Bob's browser, go to "Sign Received Document"
2. Enter the retrieval ID from Alice
3. Click "Retrieve Document"
4. Should decrypt and show document
5. Click "Sign Document" to complete

## Expected Behavior

### ✅ Success Cases
- Both users can setup encryption keys
- Alice can encrypt for Bob (after Bob setup key)
- Bob can decrypt Alice's document
- Retrieval ID works correctly
- Document signing works

### ❌ Error Cases
- Alice tries to encrypt before Bob setup key → Clear error message
- Invalid retrieval ID → Error message
- Wrong user tries to decrypt → Access denied

## Debug Information

Check browser console for:
- Public key extraction logs
- Encryption/decryption process logs
- Error messages with details

## Mock Users for Testing

Use these addresses for quick testing:
- Alice Johnson: `0x1234...7890`
- Bob Smith: `0x9876...4321`
- Carol Davis: `0xabcd...efgh`

## Key Points to Verify

1. **Public Key Extraction**: Works with MetaMask signatures
2. **Key Caching**: Public keys persist in localStorage
3. **Cross-User Encryption**: Alice can encrypt for Bob
4. **Decryption**: Bob can decrypt Alice's documents
5. **Access Control**: Only authorized users can decrypt
6. **Error Handling**: Clear messages when things go wrong

## Production Notes

This MVP uses simulated encryption. For production:
- Replace with real ECIES encryption
- Use proper AES encryption
- Add key derivation (HKDF)
- Add authentication (HMAC)
- Use secure random number generation
