'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Search, FileText, Shield, Check, AlertCircle } from 'lucide-react';
import { mockStorage, Document } from '@/lib/mock-storage';
import { WalletConnection } from '@/components/wallet-connection';
import { ThemeToggle } from '@/components/ui/theme-toggle';

// Extended document interface for receive page
interface DocumentWithDecryption extends Document {
  decryptedFileData?: string;
}

export default function ReceiveDocument() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [userPublicKey, setUserPublicKey] = useState<string | null>(null);
  const [retrievalId, setRetrievalId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [document, setDocument] = useState<DocumentWithDecryption | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [signed, setSigned] = useState(false);

  const handleWalletConnected = (walletAddress: string, publicKey: string) => {
    setUserPublicKey(publicKey);
  };

  const handleWalletDisconnected = () => {
    setUserPublicKey(null);
  };

  const handleLogout = () => {
    disconnect();
    setUserPublicKey(null);
    router.push('/');
  };

  const handleRetrieveDocument = async () => {
    if (!retrievalId.trim()) {
      setError('Please enter a Retrieval ID');
      return;
    }

    if (!address) {
      setError('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const doc = mockStorage.getDocumentByRetrievalId(retrievalId.trim());

      if (!doc) {
        setError('Invalid Retrieval ID. Please check and try again.');
        return;
      }

      // Check if user can access this document (sender or recipient)
      const accessCheck = await mockStorage.canUserAccessDocument(doc, address);

      console.log('Access verification:', {
        userAddress: address,
        senderAddress: doc.senderAddress,
        recipientAddress: doc.recipientAddress,
        canAccess: accessCheck.canAccess,
        role: accessCheck.role,
        reason: accessCheck.reason
      });

      if (!accessCheck.canAccess) {
        if (accessCheck.role === 'none') {
          setError(`Access denied. This document is for sender ${doc.senderAddress} or recipient ${doc.recipientAddress}. Please use the correct wallet.`);
        } else {
          setError(`Access denied: ${accessCheck.reason || 'Unknown error'}`);
        }
        return;
      }

      // Get user's public key for decryption
      if (!userPublicKey) {
        setError('Public key not available. Please ensure your wallet encryption is set up.');
        return;
      }

      // Try to decrypt document
      console.log(`Attempting to decrypt document for ${accessCheck.role}:`, address);
      const decryptedData = await mockStorage.decryptDocumentForUser(doc, address, userPublicKey);
      if (!decryptedData) {
        setError('Document decryption failed. Please check the browser console for details.');
        return;
      }

      // Update document with decrypted data for preview
      setDocument({
        ...doc,
        decryptedFileData: decryptedData // Store decrypted data separately
      });

    } catch (error) {
      console.error('Error retrieving document:', error);
      setError('Network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignDocument = async () => {
    if (!document || !address) return;

    setIsSigning(true);

    try {
      // Simulate MetaMask signature
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Sign the document
      const success = mockStorage.signDocument(document.retrievalId, address);

      if (success) {
        setSigned(true);
        // Refresh document to show updated status
        const updatedDoc = mockStorage.getDocumentByRetrievalId(document.retrievalId);
        if (updatedDoc) {
          setDocument(updatedDoc);
        }
      } else {
        setError('Failed to sign document. Please try again.');
      }
    } catch (error) {
      console.error('Error signing document:', error);
      setError('Signing failed. Please try again.');
    } finally {
      setIsSigning(false);
    }
  };

  // Show wallet connection if not connected
  if (!isConnected || !address) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.push('/')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold">FiloSign</h1>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </header>

        <main className="container mx-auto px-4 py-12 max-w-2xl">
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold">Connect Your Wallet</h2>
            <p className="text-muted-foreground">
              Please connect your wallet to receive and sign documents
            </p>
            <WalletConnection
              onWalletConnected={handleWalletConnected}
              onWalletDisconnected={handleWalletDisconnected}
            />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.push('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">FiloSign</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <div className="text-sm">
              <div className="font-medium">Connected User</div>
              <div className="text-muted-foreground">
                {address.substring(0, 6)}...{address.substring(38)}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {!document ? (
          // Retrieval ID Input
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2 text-foreground">Sign Received Document</h2>
              <p className="text-muted-foreground">
                Enter the Retrieval ID you received to access and sign the document
              </p>
            </div>

            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="h-5 w-5" />
                  <span>Retrieval ID</span>
                </CardTitle>
                <CardDescription className="form-description">
                  Make sure you are using the same wallet address that the sender specified
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="retrieval-id" className="form-label">Enter Retrieval ID</Label>
                    <Input
                      id="retrieval-id"
                      value={retrievalId}
                      onChange={(e) => setRetrievalId(e.target.value)}
                      placeholder="FS-XXXXXXXX"
                      className="font-mono"
                    />
                  </div>

                  {/* Wallet Verification Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-900">Wallet Verification</p>
                        <p className="text-blue-700">
                          Connected wallet: <span className="font-mono">{address}</span>
                        </p>
                        <p className="text-blue-700 mt-1">
                          This must match the recipient address specified by the sender.
                        </p>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-red-900">Error</p>
                          <p className="text-red-700">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleRetrieveDocument}
                    disabled={!retrievalId.trim() || isLoading}
                    className="w-full"
                    variant="success"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Retrieving Document...
                      </>
                    ) : (
                      <>
                        <Search className="h-5 w-5 mr-2" />
                        Retrieve Document
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Document Preview and Signing
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2 text-foreground">Document Retrieved</h2>
              <p className="text-muted-foreground">
                Review the document below and sign when ready
              </p>
            </div>

            {/* Document Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>{document.title}</span>
                </CardTitle>
                <CardDescription>
                  From: {document.senderName} ({document.senderAddress})
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Sent:</span> {new Date(document.createdAt).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      document.status === 'signed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {document.status === 'signed' ? 'Signed' : 'Pending Signature'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* PDF Preview Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Document Preview</CardTitle>
                <CardDescription>
                  PDF preview (simplified for MVP)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center bg-gray-50">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-600">{document.fileName}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    PDF preview would be displayed here using PDF.js
                  </p>
                  <p className="text-xs text-gray-400 mt-4">
                    For MVP: Simplified preview implementation
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Sign Document */}
            {document.status !== 'signed' && !signed ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-700">
                        <strong>Important:</strong> Signing with MetaMask is the same as signing a document. 
                        This action can only be performed by the owner of your private key.
                      </p>
                    </div>
                    
                    <Button
                      onClick={handleSignDocument}
                      disabled={isSigning}
                      className="w-full"
                      variant="success"
                      size="lg"
                    >
                      {isSigning ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Signing with MetaMask...
                        </>
                      ) : (
                        <>
                          <Shield className="h-5 w-5 mr-2" />
                          Sign Document
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              // Signed State
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <Check className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold">Document Signed Successfully!</h3>
                    <p className="text-muted-foreground">
                      Your signature has been recorded on the blockchain.
                    </p>
                    {document.signedAt && (
                      <p className="text-sm text-gray-600">
                        Signed on: {new Date(document.signedAt).toLocaleString()}
                      </p>
                    )}
                    <Button onClick={() => router.push('/')} variant="outline">
                      Return to Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
