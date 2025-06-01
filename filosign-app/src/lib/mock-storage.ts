import { v4 as uuidv4 } from 'uuid';
import { encryptionService, EncryptedDocument } from './encryption-service';

export interface Document {
  id: string;
  retrievalId: string;
  encryptedDocument: EncryptedDocument; // Privacy-preserving encrypted document
  createdAt: string;
  status: 'pending' | 'signed';
  // NOTE: No sender/recipient addresses, names, titles, or filenames stored
  // This prevents metadata leakage and relationship analysis
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
  async saveDocument(
    fileData: string,
    alicePublicKey: string,
    bobPublicKey: string
  ): Promise<Document> {
    try {
      // Encrypt document with privacy-preserving dual access
      const encryptedDocument = await encryptionService.encryptDocument(
        fileData,
        alicePublicKey,
        bobPublicKey
      );

      const documents = this.getDocuments();
      const newDoc: Document = {
        encryptedDocument,
        id: uuidv4(),
        retrievalId: this.generateRetrievalId(),
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
      const documents = JSON.parse(stored);
      // Filter out documents with old format (missing encryptedDocument)
      return documents.filter((doc: any) => {
        if (!doc.encryptedDocument) {
          console.warn('Skipping document with old format:', doc.retrievalId);
          return false;
        }
        return true;
      });
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

  async signDocument(retrievalId: string, userPublicKey: string): Promise<boolean> {
    const documents = this.getDocuments();
    const docIndex = documents.findIndex(doc => doc.retrievalId === retrievalId);

    if (docIndex === -1) return false;

    const doc = documents[docIndex];

    // Use cryptographic verification instead of address checking
    const accessCheck = await this.canUserAccessDocument(doc, userPublicKey);
    if (!accessCheck.canAccess) return false;

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

  // Decrypt document for user (privacy-preserving)
  async decryptDocumentForUser(document: Document, userPublicKey: string): Promise<string | null> {
    try {
      return await encryptionService.decryptDocument(
        document.encryptedDocument,
        userPublicKey
      );
    } catch (error) {
      console.error('Failed to decrypt document:', error);
      return null;
    }
  }

  // Check if user can access document (privacy-preserving)
  async canUserAccessDocument(document: Document, userPublicKey: string): Promise<{ canAccess: boolean; role: 'alice' | 'bob' | 'none'; reason?: string }> {
    try {
      return await encryptionService.canUserAccessDocument(
        document.encryptedDocument,
        userPublicKey
      );
    } catch (error) {
      console.error('Failed to check document access:', error);
      return {
        canAccess: false,
        role: 'none',
        reason: 'Access check failed'
      };
    }
  }



  // Clear all data (for development/testing)
  clearAll(): void {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.userKey);
    console.log('All FiloSign data cleared');
  }

  // Debug function to list all documents (privacy-preserving)
  debugListDocuments(): void {
    const documents = this.getDocuments();
    console.log('All stored documents (privacy-preserving):', documents);
    documents.forEach((doc, index) => {
      console.log(`Document ${index + 1}:`, {
        retrievalId: doc.retrievalId,
        status: doc.status,
        createdAt: doc.createdAt,
        encryptionMethod: doc.encryptedDocument.encryptionMethod
        // NOTE: No addresses, names, or titles shown - privacy preserved
      });
    });
  }
}

export const mockStorage = new MockStorage();
