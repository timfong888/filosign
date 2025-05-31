'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Upload, FileText, Shield, Copy, Check } from 'lucide-react';
import { mockStorage, MockUser, MOCK_USERS } from '@/lib/mock-storage';

export default function SendDocument() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<MockUser | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [retrievalId, setRetrievalId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const user = mockStorage.getCurrentUser();
    if (!user) {
      router.push('/');
      return;
    }
    setCurrentUser(user);
  }, [router]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      alert('Please select a PDF file');
    }
  };

  const handleRecipientSelect = (user: MockUser) => {
    setRecipientAddress(user.address);
    setRecipientName(user.name);
  };

  const handleSignAndSecure = async () => {
    if (!selectedFile || !recipientAddress || !recipientName || !currentUser) {
      alert('Please fill in all fields');
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

      // Save document with mock encryption
      const document = mockStorage.saveDocument({
        title: selectedFile.name,
        fileName: selectedFile.name,
        fileData: mockStorage.encryptDocument(fileData, recipientAddress),
        senderAddress: currentUser.address,
        senderName: currentUser.name,
        recipientAddress,
        recipientName,
      });

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

  if (!currentUser) {
    return <div>Loading...</div>;
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
          
          <div className="text-sm">
            <div className="font-medium">{currentUser.name}</div>
            <div className="text-muted-foreground">
              {currentUser.address.substring(0, 6)}...{currentUser.address.substring(38)}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {!retrievalId ? (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">Send Document</h2>
              <p className="text-muted-foreground">
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
                <CardDescription>
                  Select a PDF document to upload and share securely
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-medium">Click to upload PDF</p>
                      <p className="text-sm text-muted-foreground">or drag and drop</p>
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
                <CardDescription>
                  Specify who should receive and sign this document
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="recipient-address">Recipient Ethereum Address</Label>
                    <Input
                      id="recipient-address"
                      value={recipientAddress}
                      onChange={(e) => setRecipientAddress(e.target.value)}
                      placeholder="0x..."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="recipient-name">Recipient Full Name</Label>
                    <Input
                      id="recipient-name"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="Enter recipient's full legal name"
                    />
                  </div>

                  {/* Quick Select Recipients */}
                  <div className="space-y-2">
                    <Label>Quick Select (Demo Users)</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {MOCK_USERS.filter(user => user.address !== currentUser.address).map((user) => (
                        <Button
                          key={user.address}
                          variant="outline"
                          size="sm"
                          onClick={() => handleRecipientSelect(user)}
                          className="justify-start"
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
                  disabled={!selectedFile || !recipientAddress || !recipientName || isUploading}
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
