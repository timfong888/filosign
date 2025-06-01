'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Upload, FileText, Shield, Copy, Check, AlertCircle, Wallet } from 'lucide-react';
import { MOCK_USERS, MockUser, mockStorage } from '@/lib/mock-storage';
import { useUploadLocal } from '@/lib/hooks/use-upload-local';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { WalletConnection } from '@/components/wallet-connection';

// Using local storage for MVP

export default function SendDocument() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [userPublicKey, setUserPublicKey] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [retrievalId, setRetrievalId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Local storage upload state
  const {
    phase,
    progress,
    result,
    error: uploadError,
    isWalletConnected,
    // walletAddress,
    startUpload
  } = useUploadLocal();

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

  // Client-side mounting guard
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Update UI based on upload phase
  useEffect(() => {
    if (phase === 'complete' && result) {
      setIsUploading(false);
      setRetrievalId(result.retrievalId);
    } else if (phase === 'error' && uploadError) {
      setIsUploading(false);
      setErrorMessage(uploadError);
    } else if (phase !== 'idle') {
      setIsUploading(true);
    }
  }, [phase, result, uploadError]);

  // Prevent hydration mismatch by not rendering until mounted
  if (!isMounted) {
    return null;
  }

  // Show wallet connection if not connected
  if (!isConnected || !address) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card/80 backdrop-blur-sm border-border">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.push('/')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold text-foreground">FiloSign</h1>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </header>

        <main className="container mx-auto px-4 py-12 max-w-2xl">
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold text-foreground">Connect Your Wallet</h2>
            <p className="text-muted-foreground">
              Please connect your wallet to send documents securely
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setErrorMessage(null);
    } else {
      setErrorMessage('Please select a PDF file');
    }
  };

  const handleRecipientSelect = (user: MockUser) => {
    setRecipientAddress(user.address);
    setRecipientName(user.name);
    setErrorMessage(null);
  };

  const handleSignAndSecure = async () => {
    if (!selectedFile || !recipientAddress || !recipientName || !address) {
      setErrorMessage('Please fill in all fields and connect your wallet');
      return;
    }

    setErrorMessage(null);
    setIsUploading(true);

    try {
      // Simple mock storage without encryption for MVP
      // Convert file to base64
      const fileData = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(selectedFile);
      });

      // Save document with simple storage (no encryption for now)
      const document = mockStorage.saveDocument({
        title: selectedFile.name,
        fileName: selectedFile.name,
        fileData: fileData, // Store directly without encryption
        senderAddress: address,
        senderName: 'Current User',
        recipientAddress,
        recipientName,
      });

      setRetrievalId(document.retrievalId);
      setIsUploading(false);
    } catch (error) {
      console.error('Error uploading document:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Error uploading document. Please try again.');
      setIsUploading(false);
    }
  };

  const copyToClipboard = () => {
    if (retrievalId) {
      navigator.clipboard.writeText(retrievalId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Helper function removed - using direct error messages from local storage

  // Get upload status text based on phase
  const getUploadStatusText = (): string => {
    switch (phase) {
      case 'connecting':
        return 'Connecting to wallet...';
      case 'encrypting':
        return `Encrypting file... ${progress}%`;
      case 'storing':
        return `Storing securely... ${progress}%`;
      default:
        return 'Processing...';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.push('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">FiloSign</h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <div className="text-sm">
              <div className="font-medium text-foreground">Connected Wallet</div>
              <div className="text-muted-foreground">
                {address?.substring(0, 6)}...{address?.substring(38)}
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {!retrievalId ? (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2 text-foreground">Send Document</h2>
              <p className="text-muted-foreground">
                Upload a document and specify a recipient to generate a secure retrieval ID
              </p>
              <div className="mt-2 text-sm font-medium text-primary">
                Using Local Storage (MVP)
              </div>
            </div>

            {errorMessage && (
              <div className="alert-error">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 alert-error-icon mt-0.5" />
                  <div>
                    <p className="alert-title">Error</p>
                    <p className="alert-description">{errorMessage}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Document */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-card-foreground">
                  <Upload className="h-5 w-5" />
                  <span>Upload Document</span>
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Select a PDF document to upload and share securely
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="upload-area border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors bg-muted/50">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-medium text-foreground">Click to upload PDF</p>
                      <p className="text-sm text-muted-foreground">or drag and drop</p>
                    </label>
                  </div>
                  
                  {selectedFile && (
                    <div className="alert-success">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 alert-success-icon" />
                        <span className="alert-title">{selectedFile.name}</span>
                        <span className="alert-description">
                          ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Document Recipient */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Document Recipient</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Specify who should receive and sign this document
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="recipient-address" className="text-foreground">Recipient Ethereum Address</Label>
                    <Input
                      id="recipient-address"
                      value={recipientAddress}
                      onChange={(e) => setRecipientAddress(e.target.value)}
                      placeholder="0x..."
                      className="bg-input border-border text-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recipient-name" className="text-foreground">Recipient Full Name</Label>
                    <Input
                      id="recipient-name"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="Enter recipient's full legal name"
                      className="bg-input border-border text-foreground"
                    />
                  </div>

                  {/* Quick Select Recipients */}
                  <div className="space-y-2">
                    <Label className="text-foreground">Quick Select (Demo Users)</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {MOCK_USERS.filter(user => user.address !== address).map((user) => (
                        <Button
                          key={user.address}
                          variant="outline"
                          size="sm"
                          onClick={() => handleRecipientSelect(user)}
                          className="justify-start bg-secondary border-border text-secondary-foreground hover:bg-secondary/80"
                        >
                          <div className="text-left">
                            <div className="font-medium">{user.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {user.address.substring(0, 6)}...{user.address.substring(38)}
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sign and Secure */}
            <Card>
              <CardContent className="pt-6">
                <Button
                  onClick={handleSignAndSecure}
                  disabled={!selectedFile || !recipientAddress || !recipientName || isUploading || !isConnected}
                  className="w-full"
                  variant="success"
                  size="lg"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {getUploadStatusText()}
                    </>
                  ) : (
                    <>
                      <Shield className="h-5 w-5 mr-2" />
                      Sign and Secure
                    </>
                  )}
                </Button>

                {phase !== 'idle' && phase !== 'error' && phase !== 'complete' && (
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div
                        className="bg-primary h-2.5 rounded-full"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-center mt-1 text-muted-foreground">
                      {progress}% - {phase}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          // Success State
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-foreground">Document Uploaded!</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Your document has been stored successfully.
                Share the retrieval ID below with {recipientName}
                so they can access and sign the document.
              </p>

              <div className="alert-info max-w-md mx-auto">
                <p className="alert-description">
                  <span className="alert-title">Document ID:</span> {retrievalId}
                </p>
                <p className="alert-description">
                  <span className="alert-title">Storage:</span> Local Storage (MVP)
                </p>
                <p className="alert-description">
                  <span className="alert-title">Status:</span> Ready for Signing
                </p>
              </div>
            </div>

            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Retrieval ID</CardTitle>
                <CardDescription>
                  Share this ID with the recipient
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Input value={retrievalId} readOnly className="font-mono" />
                  <Button onClick={copyToClipboard} size="sm">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                {copied && (
                  <p className="text-sm text-green-600 mt-2">Copied to clipboard!</p>
                )}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="flex space-x-4 justify-center">
                <Button onClick={() => router.push('/')} variant="outline">
                  Return to Dashboard
                </Button>
                <Button onClick={() => window.location.reload()}>
                  Send Another Document
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
