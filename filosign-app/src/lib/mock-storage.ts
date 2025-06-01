import { v4 as uuidv4 } from 'uuid';

export interface Document {
  id: string;
  retrievalId: string;
  title: string;
  fileName: string;
  fileData: string; // Base64 encoded file data
  senderAddress: string;
  senderName: string;
  recipientAddress: string;
  recipientName: string;
  status: 'pending' | 'signed';
  createdAt: string;
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
  saveDocument(params: {
    title: string;
    fileName: string;
    fileData: string;
    senderAddress: string;
    senderName: string;
    recipientAddress: string;
    recipientName: string;
  }): Document {
    try {
      const documents = this.getDocuments();

      const newDoc: Document = {
        id: uuidv4(),
        retrievalId: this.generateRetrievalId(),
        title: params.title,
        fileName: params.fileName,
        fileData: params.fileData,
        senderAddress: params.senderAddress,
        senderName: params.senderName,
        recipientAddress: params.recipientAddress,
        recipientName: params.recipientName,
        createdAt: new Date().toISOString(),
        status: 'pending'
      };

      documents.push(newDoc);
      localStorage.setItem(this.storageKey, JSON.stringify(documents));
      return newDoc;
    } catch (error) {
      console.error('Failed to save document:', error);
      throw new Error('Failed to save document');
    }
  }

  getDocuments(): Document[] {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) return [];

    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('Failed to parse stored documents:', error);
      return [];
    }
  }

  getDocumentByRetrievalId(retrievalId: string): Document | null {
    const documents = this.getDocuments();
    return documents.find(doc => doc.retrievalId === retrievalId) || null;
  }

  // Note: getDocumentsByUser removed - no longer possible without storing addresses
  // This is intentional for privacy preservation

  signDocument(retrievalId: string, userAddress: string): boolean {
    const documents = this.getDocuments();
    const docIndex = documents.findIndex(doc => doc.retrievalId === retrievalId);

    if (docIndex === -1) return false;

    const doc = documents[docIndex];

    // Simple address check for MVP
    if (doc.recipientAddress.toLowerCase() !== userAddress.toLowerCase()) {
      return false;
    }

    documents[docIndex] = {
      ...doc,
      status: 'signed'
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

  // Check if user can access document (simple address check for MVP)
  canUserAccessDocument(document: Document, userAddress: string): { canAccess: boolean; role: 'sender' | 'recipient' | 'none'; reason?: string } {
    const userAddressLower = userAddress.toLowerCase();

    if (document.senderAddress.toLowerCase() === userAddressLower) {
      return { canAccess: true, role: 'sender' };
    }

    if (document.recipientAddress.toLowerCase() === userAddressLower) {
      return { canAccess: true, role: 'recipient' };
    }

    return {
      canAccess: false,
      role: 'none',
      reason: 'User is not sender or recipient'
    };
  }



  // Clear all data (for development/testing)
  clearAll(): void {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.userKey);
    console.log('All FiloSign data cleared');
  }

  // Debug function to list all documents
  debugListDocuments(): void {
    const documents = this.getDocuments();
    console.log('All stored documents:', documents);
    documents.forEach((doc, index) => {
      console.log(`Document ${index + 1}:`, {
        retrievalId: doc.retrievalId,
        title: doc.title,
        fileName: doc.fileName,
        senderName: doc.senderName,
        recipientName: doc.recipientName,
        status: doc.status,
        createdAt: doc.createdAt
      });
    });
  }
}

export const mockStorage = new MockStorage();
