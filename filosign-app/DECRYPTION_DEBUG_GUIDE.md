# Document Decryption Debug Guide

## Issue Resolved

The user reported getting "Document decryption failed. Please try again." error when trying to retrieve a document with a valid retrieval ID. This was caused by address case sensitivity and potential data format issues in the mock encryption/decryption system.

## Root Cause Analysis

### Original Problem
The mock encryption/decryption system was failing due to:
1. **Case Sensitivity**: Ethereum addresses were being compared with exact case matching
2. **Poor Error Handling**: No debugging information when decryption failed
3. **Data Format Issues**: Potential problems with base64 encoding/decoding

### Mock Encryption Logic
```typescript
// Encryption (in send process)
encryptDocument(fileData: string, recipientAddress: string): string {
  return btoa(fileData + ':encrypted-for:' + recipientAddress);
}

// Decryption (in receive process)  
decryptDocument(encryptedData: string, userAddress: string): string | null {
  const decoded = atob(encryptedData);
  const [fileData, , address] = decoded.split(':encrypted-for:');
  
  if (address === userAddress) {  // ❌ Case sensitive comparison
    return fileData;
  }
  return null;
}
```

## Fixes Implemented

### 1. Enhanced Decryption with Case-Insensitive Comparison

**Before:**
```typescript
if (address === userAddress) {
  return fileData;
}
```

**After:**
```typescript
// Normalize addresses for comparison (convert to lowercase)
const normalizedStoredAddress = address.toLowerCase();
const normalizedUserAddress = userAddress.toLowerCase();

if (normalizedStoredAddress === normalizedUserAddress) {
  return fileData;
}
```

### 2. Added Comprehensive Debugging

**Console Logging:**
```typescript
console.log('Decryption attempt:', {
  storedAddress: address,
  userAddress: userAddress,
  normalizedStoredAddress,
  normalizedUserAddress,
  match: normalizedStoredAddress === normalizedUserAddress
});
```

**Error Logging:**
```typescript
console.error('Address mismatch during decryption:', {
  expected: address,
  provided: userAddress
});
```

### 3. Enhanced Address Verification in Receive Page

**Before:**
```typescript
if (doc.recipientAddress !== address) {
  setError('Wrong wallet address...');
}
```

**After:**
```typescript
const normalizedDocAddress = doc.recipientAddress.toLowerCase();
const normalizedUserAddress = address.toLowerCase();

if (normalizedDocAddress !== normalizedUserAddress) {
  setError('Wrong wallet address...');
}
```

### 4. Added Testing Utilities

**Debug Functions:**
```typescript
// List all stored documents
mockStorage.debugListDocuments();

// Create test document for debugging
const testDoc = mockStorage.createTestDocument(senderAddress, recipientAddress);
```

## Debugging Steps

### Step 1: Check Browser Console
When decryption fails, check the browser console for detailed logs:

```javascript
// Open browser console and run:
mockStorage.debugListDocuments();
```

**Expected Output:**
```
All stored documents: [...]
Document 1: {
  retrievalId: "FS-ABC12345",
  senderAddress: "0x1234...",
  recipientAddress: "0x5678...",
  title: "test.pdf",
  status: "pending"
}
```

### Step 2: Verify Address Matching
Check if addresses match (case-insensitive):

```javascript
// In browser console:
const doc = mockStorage.getDocumentByRetrievalId('FS-ABC12345');
const userAddress = '0x5678...'; // Your wallet address

console.log('Address comparison:', {
  docAddress: doc.recipientAddress,
  userAddress: userAddress,
  docLower: doc.recipientAddress.toLowerCase(),
  userLower: userAddress.toLowerCase(),
  match: doc.recipientAddress.toLowerCase() === userAddress.toLowerCase()
});
```

### Step 3: Test Decryption Manually
Test the decryption function directly:

```javascript
// In browser console:
const doc = mockStorage.getDocumentByRetrievalId('FS-ABC12345');
const result = mockStorage.decryptDocument(doc.fileData, userAddress);
console.log('Decryption result:', result ? 'SUCCESS' : 'FAILED');
```

### Step 4: Create Test Document
Create a test document with known addresses:

```javascript
// In browser console:
const testDoc = mockStorage.createTestDocument(
  '0x1234567890123456789012345678901234567890', // sender
  '0x0987654321098765432109876543210987654321'  // recipient
);
console.log('Test document created:', testDoc.retrievalId);
```

## Common Issues & Solutions

### Issue 1: Address Case Mismatch
**Symptoms:** "Document decryption failed" error
**Solution:** Addresses are now compared case-insensitively

### Issue 2: Invalid Retrieval ID
**Symptoms:** "Invalid Retrieval ID" error
**Debug:** Check if document exists in storage
```javascript
mockStorage.debugListDocuments();
```

### Issue 3: Wrong Wallet Connected
**Symptoms:** "Wrong wallet address" error
**Solution:** Ensure you're using the same wallet address that was specified as recipient

### Issue 4: Corrupted Document Data
**Symptoms:** Decryption fails with console errors
**Debug:** Check document data format
```javascript
const doc = mockStorage.getDocumentByRetrievalId('FS-ABC12345');
console.log('Document data length:', doc.fileData.length);
console.log('Data starts with:', doc.fileData.substring(0, 50));
```

## Testing Workflow

### 1. Send Document Test
1. Connect wallet A (sender)
2. Upload a PDF file
3. Enter wallet B address as recipient
4. Click "Sign and Secure"
5. Copy the retrieval ID

### 2. Receive Document Test
1. Logout from wallet A
2. Connect wallet B (recipient)
3. Go to receive page
4. Enter the retrieval ID
5. Click "Retrieve Document"

### 3. Debug Failed Retrieval
If retrieval fails:
1. Open browser console
2. Run `mockStorage.debugListDocuments()`
3. Check address matching
4. Verify document exists
5. Test decryption manually

## Console Commands for Debugging

```javascript
// List all documents
mockStorage.debugListDocuments();

// Get specific document
const doc = mockStorage.getDocumentByRetrievalId('FS-ABC12345');

// Test decryption
const result = mockStorage.decryptDocument(doc.fileData, 'YOUR_ADDRESS');

// Create test document
const testDoc = mockStorage.createTestDocument('SENDER_ADDRESS', 'RECIPIENT_ADDRESS');

// Clear all data (reset)
mockStorage.clearAll();
```

## Files Modified

1. **`/src/lib/mock-storage.ts`** - Enhanced decryption with case-insensitive comparison and debugging
2. **`/src/app/receive/page.tsx`** - Added address verification debugging and better error messages

## Expected Behavior After Fix

✅ **Address Comparison**: Case-insensitive matching (0xABC... matches 0xabc...)
✅ **Debug Information**: Detailed console logs for troubleshooting
✅ **Better Error Messages**: More specific error descriptions
✅ **Testing Utilities**: Functions to create test documents and debug storage

The decryption should now work correctly regardless of address case, and provide detailed debugging information when issues occur.
