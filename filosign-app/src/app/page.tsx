'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Shield, Users, Wallet } from 'lucide-react';
import { WalletConnection } from '@/components/wallet-connection';
import { useAccount } from 'wagmi';
import { localStorageService, StorageMetadata } from '@/lib/local-storage-service';

export default function Home() {
  const { address, isConnected } = useAccount();
  const [userPublicKey, setUserPublicKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setIsLoading(false);
  }, []);

  const handleWalletConnected = (walletAddress: string, publicKey: string) => {
    setUserPublicKey(publicKey);
    setIsWalletModalOpen(false); // Close modal when wallet connects
  };

  const handleWalletDisconnected = () => {
    setUserPublicKey(null);
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!isMounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">FiloSign</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {isConnected && address ? (
              <div className="flex items-center space-x-4">
                <div className="text-sm">
                  <div className="font-medium">Connected</div>
                  <div className="text-muted-foreground">
                    {address.substring(0, 6)}...{address.substring(38)}
                  </div>
                </div>
                {userPublicKey && (
                  <div className="text-xs text-green-600">
                    ✅ Encryption Ready
                  </div>
                )}
              </div>
            ) : (
              <Dialog open={isWalletModalOpen} onOpenChange={setIsWalletModalOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center space-x-2">
                    <Wallet className="h-4 w-4" />
                    <span>Connect Wallet</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <WalletConnection
                    onWalletConnected={handleWalletConnected}
                    onWalletDisconnected={handleWalletDisconnected}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {!isConnected ? (
          // Landing Page for Non-Connected Users
          <div className="text-center space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl font-bold tracking-tight">
                Secure Document Signing
                <span className="block text-primary">Powered by Filecoin</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Sign and share documents securely using blockchain technology. 
                Your documents are encrypted and stored on a decentralized network.
              </p>
              <div className="max-w-md mx-auto">
                <WalletConnection
                  onWalletConnected={handleWalletConnected}
                  onWalletDisconnected={handleWalletDisconnected}
                />
              </div>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <Card>
                <CardHeader className="text-center">
                  <Shield className="h-12 w-12 text-primary mb-4 mx-auto" />
                  <CardTitle>Secure & Encrypted</CardTitle>
                  <CardDescription>
                    Documents are encrypted using your wallet private key, ensuring only intended recipients can access them.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="text-center">
                  <FileText className="h-12 w-12 text-primary mb-4 mx-auto" />
                  <CardTitle>Easy Document Sharing</CardTitle>
                  <CardDescription>
                    Upload, sign, and share documents with a simple retrieval ID. No complex setup required.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="text-center">
                  <Users className="h-12 w-12 text-primary mb-4 mx-auto" />
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
          <div className="space-y-6">
            {!userPublicKey ? (
              // Show wallet connection setup if public key not ready
              <div className="text-center space-y-6">
                <h2 className="text-3xl font-bold">Almost Ready!</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Your wallet is connected. Now let's set up encryption so you can securely send and receive documents.
                </p>
                <div className="max-w-md mx-auto">
                  <WalletConnection
                    onWalletConnected={handleWalletConnected}
                    onWalletDisconnected={handleWalletDisconnected}
                  />
                </div>
              </div>
            ) : (
              // Full dashboard when everything is ready
              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <h2 className="text-3xl font-bold">Welcome to FiloSign!</h2>
                  <p className="text-muted-foreground">
                    Your wallet is connected and encryption is ready. What would you like to do?
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
                <SignedDocumentsSection userAddress={address} />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// Signed Documents Section Component
function SignedDocumentsSection({ userAddress }: { userAddress: string | undefined }) {
  const [documents, setDocuments] = useState<StorageMetadata[]>([]);

  useEffect(() => {
    if (userAddress) {
      loadUserDocuments();
    }
  }, [userAddress, loadUserDocuments]);

  const loadUserDocuments = async () => {
    if (!userAddress) return;
    try {
      const userDocs = await localStorageService.getDocumentsForUser(userAddress);
      setDocuments(userDocs);
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  };

  const sentDocs = documents.filter(doc => doc.sender_address.toLowerCase() === userAddress?.toLowerCase());
  const receivedDocs = documents.filter(doc => doc.recipient_address.toLowerCase() === userAddress?.toLowerCase());

  return (
    <div className="mt-8 space-y-6">
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
                  <Card key={doc.retrieval_id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{doc.retrieval_id}</span>
                            <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                              Encrypted
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            To: {doc.recipient_address.substring(0, 6)}...{doc.recipient_address.substring(38)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Sent: {new Date(doc.upload_timestamp).toLocaleDateString()} {new Date(doc.upload_timestamp).toLocaleTimeString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Size: {(doc.file_size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{doc.filename}</p>
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
                  <Card key={doc.retrieval_id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{doc.retrieval_id}</span>
                            <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                              Available
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            From: {doc.sender_address.substring(0, 6)}...{doc.sender_address.substring(38)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Received: {new Date(doc.upload_timestamp).toLocaleDateString()} {new Date(doc.upload_timestamp).toLocaleTimeString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Size: {(doc.file_size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{doc.filename}</p>
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
