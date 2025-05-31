'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Shield, Users, Wallet } from 'lucide-react';
import { mockStorage, MockUser, MOCK_USERS, Document } from '@/lib/mock-storage';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<MockUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const user = mockStorage.getCurrentUser();
    setCurrentUser(user);
    setIsLoading(false);
  }, []);

  const handleConnectWallet = () => {
    // Mock wallet connection - in real app this would use MetaMask
    const user = MOCK_USERS[0]; // Default to first user for demo
    mockStorage.setCurrentUser(user);
    setCurrentUser(user);
  };

  const handleDisconnectWallet = () => {
    mockStorage.clearCurrentUser();
    setCurrentUser(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">FiloSign</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <div className="flex items-center space-x-4">
                <div className="text-sm">
                  <div className="font-medium">{currentUser.name}</div>
                  <div className="text-muted-foreground">
                    {currentUser.address.substring(0, 6)}...{currentUser.address.substring(38)}
                  </div>
                </div>
                <Button variant="outline" onClick={handleDisconnectWallet}>
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button onClick={handleConnectWallet} className="flex items-center space-x-2">
                <Wallet className="h-4 w-4" />
                <span>Connect Wallet</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {!currentUser ? (
          // Landing Page for Non-Connected Users
          <div className="text-center space-y-12">
            <div className="space-y-6">
              <h1 className="text-5xl font-bold tracking-tight">
                Secure Document Signing
                <span className="block text-primary">Powered by Filecoin</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Sign and share documents securely using blockchain technology. 
                Your documents are encrypted and stored on a decentralized network.
              </p>
              <Button size="lg" onClick={handleConnectWallet} className="text-lg px-8 py-6">
                <Wallet className="h-5 w-5 mr-2" />
                Get Started - Connect Wallet
              </Button>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-8 mt-16">
              <Card>
                <CardHeader>
                  <Shield className="h-12 w-12 text-primary mb-4" />
                  <CardTitle>Secure & Encrypted</CardTitle>
                  <CardDescription>
                    Documents are encrypted using your wallet private key, ensuring only intended recipients can access them.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <FileText className="h-12 w-12 text-primary mb-4" />
                  <CardTitle>Easy Document Sharing</CardTitle>
                  <CardDescription>
                    Upload, sign, and share documents with a simple retrieval ID. No complex setup required.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Users className="h-12 w-12 text-primary mb-4" />
                  <CardTitle>Blockchain Verified</CardTitle>
                  <CardDescription>
                    All signatures are recorded on the blockchain, providing immutable proof of document signing.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        ) : (
          // Dashboard for Connected Users
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">Welcome back, {currentUser.name}!</h2>
              <p className="text-muted-foreground">
                What would you like to do today?
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-6 w-6" />
                    <span>Send Document</span>
                  </CardTitle>
                  <CardDescription>
                    Upload a document, specify a recipient, and generate a secure retrieval ID for sharing.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={() => window.location.href = '/send'}>
                    Send Document
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-6 w-6" />
                    <span>Sign Received Document</span>
                  </CardTitle>
                  <CardDescription>
                    Enter a retrieval ID to access and sign a document that was shared with you.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" onClick={() => window.location.href = '/receive'}>
                    Sign Document
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Signed Documents Section */}
            <SignedDocumentsSection currentUser={currentUser} />
          </div>
        )}
      </main>
    </div>
  );
}

// Signed Documents Section Component
function SignedDocumentsSection({ currentUser }: { currentUser: MockUser }) {
  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    const userDocs = mockStorage.getDocumentsByUser(currentUser.address);
    setDocuments(userDocs);
  }, [currentUser.address]);

  const sentDocs = documents.filter(doc => doc.senderAddress === currentUser.address);
  const receivedDocs = documents.filter(doc => doc.recipientAddress === currentUser.address);

  return (
    <div className="mt-12 space-y-6">
      <h3 className="text-xl font-semibold">Signed Documents</h3>

      {documents.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-muted-foreground">No documents yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Documents you send or sign will appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Sent Documents */}
          {sentDocs.length > 0 && (
            <div>
              <h4 className="text-lg font-medium mb-3">Documents Sent</h4>
              <div className="space-y-2">
                {sentDocs.map((doc) => (
                  <Card key={doc.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{doc.retrievalId}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              doc.status === 'signed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {doc.status === 'signed' ? 'Signed' : 'Pending'}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            To: {doc.recipientName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Sent: {new Date(doc.createdAt).toLocaleDateString()} {new Date(doc.createdAt).toLocaleTimeString()}
                          </p>
                          {doc.signedAt && (
                            <p className="text-sm text-muted-foreground">
                              Signed: {new Date(doc.signedAt).toLocaleDateString()} {new Date(doc.signedAt).toLocaleTimeString()}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{doc.title}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Received Documents */}
          {receivedDocs.length > 0 && (
            <div>
              <h4 className="text-lg font-medium mb-3">Documents Received</h4>
              <div className="space-y-2">
                {receivedDocs.map((doc) => (
                  <Card key={doc.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{doc.retrievalId}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              doc.status === 'signed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {doc.status === 'signed' ? 'Signed' : 'Pending'}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            From: {doc.senderName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Received: {new Date(doc.createdAt).toLocaleDateString()} {new Date(doc.createdAt).toLocaleTimeString()}
                          </p>
                          {doc.signedAt && (
                            <p className="text-sm text-muted-foreground">
                              Signed: {new Date(doc.signedAt).toLocaleDateString()} {new Date(doc.signedAt).toLocaleTimeString()}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{doc.title}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
