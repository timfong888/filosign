import { v4 as uuidv4 } from 'uuid';

export interface Document {
  id: string;
  retrievalId: string;
  title: string;
  fileName: string;
  fileData: string; // base64 encoded PDF
  senderAddress: string;
  senderName: string;
  recipientAddress: string;
  recipientName: string;
  createdAt: string;
  signedAt?: string;
  status: 'pending' | 'signed';
}

export interface MockUser {
  address: string;
  name: string;
}

// Mock wallet addresses for testing
export const MOCK_USERS: MockUser[] = [
  { address: '0x1234567890123456789012345678901234567890', name: 'Alice Johnson' },
  { address: '0x0987654321098765432109876543210987654321', name: 'Bob Smith' },
  { address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', name: 'Carol Davis' },
];

class MockStorage {
  private storageKey = 'filosign-documents';
  private userKey = 'filosign-current-user';

  // Document operations
  saveDocument(doc: Omit<Document, 'id' | 'retrievalId' | 'createdAt' | 'status'>): Document {
    const documents = this.getDocuments();
    const newDoc: Document = {
      ...doc,
      id: uuidv4(),
      retrievalId: this.generateRetrievalId(),
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    
    documents.push(newDoc);
    localStorage.setItem(this.storageKey, JSON.stringify(documents));
    return newDoc;
  }

  getDocuments(): Document[] {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : [];
  }

  getDocumentByRetrievalId(retrievalId: string): Document | null {
    const documents = this.getDocuments();
    return documents.find(doc => doc.retrievalId === retrievalId) || null;
  }

  getDocumentsByUser(userAddress: string): Document[] {
    const documents = this.getDocuments();
    return documents.filter(doc => 
      doc.senderAddress === userAddress || doc.recipientAddress === userAddress
    );
  }

  signDocument(retrievalId: string, signerAddress: string): boolean {
    const documents = this.getDocuments();
    const docIndex = documents.findIndex(doc => doc.retrievalId === retrievalId);
    
    if (docIndex === -1) return false;
    
    const doc = documents[docIndex];
    if (doc.recipientAddress !== signerAddress) return false;
    
    documents[docIndex] = {
      ...doc,
      status: 'signed',
      signedAt: new Date().toISOString()
    };
    
    localStorage.setItem(this.storageKey, JSON.stringify(documents));
    return true;
  }

  // User operations
  setCurrentUser(user: MockUser): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  getCurrentUser(): MockUser | null {
    const stored = localStorage.getItem(this.userKey);
    return stored ? JSON.parse(stored) : null;
  }

  clearCurrentUser(): void {
    localStorage.removeItem(this.userKey);
  }

  // Utility functions
  private generateRetrievalId(): string {
    return `FS-${uuidv4().substring(0, 8).toUpperCase()}`;
  }

  // Mock encryption/decryption (just base64 for demo)
  encryptDocument(fileData: string, recipientAddress: string): string {
    // In real implementation, this would use the recipient's public key
    return btoa(fileData + ':encrypted-for:' + recipientAddress);
  }

  decryptDocument(encryptedData: string, userAddress: string): string | null {
    try {
      const decoded = atob(encryptedData);
      const [fileData, , address] = decoded.split(':encrypted-for:');
      
      if (address === userAddress) {
        return fileData;
      }
      return null;
    } catch {
      return null;
    }
  }

  // Clear all data (for testing)
  clearAll(): void {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.userKey);
  }
}

export const mockStorage = new MockStorage();
