'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Upload, FileText, Shield, Copy, Check } from 'lucide-react';
import { mockStorage, MOCK_USERS } from '@/lib/mock-storage';
import { WalletConnection } from '@/components/wallet-connection';
import { publicKeyService } from '@/lib/public-key-service';

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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      alert('Please select a PDF file');
    }
  };

  const handleRecipientSelect = (user: any) => {
    setRecipientAddress(user.address);
    setRecipientName(user.name);
  };

  const handleSignAndSecure = async () => {
    if (!selectedFile || !recipientAddress || !recipientName || !address || !userPublicKey) {
      alert('Please fill in all fields and ensure wallet is connected with encryption key setup');
      return;
    }

    setIsUploading(true);

    try {
      // Convert file to base64
      const fileData = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(selectedFile);
      });

      // Get recipient's public key
      const recipientPublicKey = await publicKeyService.getPublicKey(recipientAddress);
      if (!recipientPublicKey) {
        alert(`Cannot find public key for recipient address ${recipientAddress}. The recipient must connect their wallet and set up encryption first.`);
        return;
      }

      // Save document with proper encryption (dual access)
      const document = await mockStorage.saveDocument({
        title: selectedFile.name,
        fileName: selectedFile.name,
        senderAddress: address,
        senderName: 'Connected User', // We could get this from ENS or user input later
        recipientAddress,
        recipientName,
      }, fileData, userPublicKey, recipientPublicKey);

      setRetrievalId(document.retrievalId);
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Error uploading document. Please try again.');
    } finally {
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
          </div>
        </header>

        <main className="container mx-auto px-4 py-12 max-w-2xl">
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold">Connect Your Wallet</h2>
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
        {!retrievalId ? (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">Send Document</h2>
              <p className="text-muted-foreground form-description">
                Upload a document and specify a recipient to generate a secure retrieval ID
              </p>
            </div>

            {/* Upload Document */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5" />
                  <span>Upload Document</span>
                </CardTitle>
                <CardDescription className="form-description">
                  Select a PDF document to upload and share securely
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-all duration-200 hover:border-primary hover:bg-primary/5 hover:shadow-md cursor-pointer group">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer block">
                      <FileText className="h-12 w-12 text-gray-300 dark:text-gray-200 mx-auto mb-4 group-hover:text-primary group-hover:scale-110 transition-all duration-200" />
                      <p className="text-lg font-medium upload-text group-hover:text-primary transition-colors duration-200">Click to upload PDF</p>
                      <p className="text-sm upload-text-secondary group-hover:text-primary/70 transition-colors duration-200">or drag and drop</p>
                    </label>
                  </div>
                  
                  {selectedFile && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-green-600" />
                        <span className="font-medium">{selectedFile.name}</span>
                        <span className="text-sm text-muted-foreground">
                          ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Document Recipient */}
            <Card>
              <CardHeader>
                <CardTitle>Document Recipient</CardTitle>
                <CardDescription className="form-description">
                  Specify who should receive and sign this document
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="recipient-address" className="form-label">Recipient Ethereum Address</Label>
                    <Input
                      id="recipient-address"
                      value={recipientAddress}
                      onChange={(e) => setRecipientAddress(e.target.value)}
                      placeholder="0x..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recipient-name" className="form-label">Recipient Full Name</Label>
                    <Input
                      id="recipient-name"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="Enter recipient's full legal name"
                    />
                  </div>

                  {/* Quick Select Recipients */}
                  <div className="space-y-2">
                    <Label className="form-label">Quick Select (Demo Users)</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {MOCK_USERS.filter(user => user.address !== address).map((user) => (
                        <Button
                          key={user.address}
                          variant="outline"
                          size="sm"
                          onClick={() => handleRecipientSelect(user)}
                          className="justify-start hover:border-primary hover:bg-primary/5 group"
                        >
                          <div className="text-left">
                            <div className="font-medium group-hover:text-primary transition-colors duration-200">{user.name}</div>
                            <div className="text-xs text-muted-foreground group-hover:text-primary/70 transition-colors duration-200">
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
                {!userPublicKey && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-5 w-5 text-orange-600" />
                      <p className="text-sm text-orange-800">
                        Please setup your encryption key to continue. Click "Setup Encryption Key" in the wallet connection.
                      </p>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleSignAndSecure}
                  disabled={!selectedFile || !recipientAddress || !recipientName || isUploading || !userPublicKey}
                  className="w-full"
                  size="lg"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Shield className="h-5 w-5 mr-2" />
                      Sign and Secure
                    </>
                  )}
                </Button>
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
              <h2 className="text-3xl font-bold">Document Secured!</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Your document has been encrypted and secured. Share the retrieval ID below with {recipientName} 
                so they can access and sign the document.
              </p>
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
