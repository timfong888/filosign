'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount, useSignMessage } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Check, AlertCircle, Key } from 'lucide-react';
import { WalletConnection } from '@/components/wallet-connection';
import { publicKeyService } from '@/lib/public-key-service';

export default function SetupKeyPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);

  // Check if user already has a public key setup
  const checkExistingKey = async () => {
    if (!address) return;
    
    try {
      const existingKey = await publicKeyService.getPublicKey(address);
      if (existingKey) {
        setPublicKey(existingKey);
        setSetupComplete(true);
      }
    } catch (error) {
      console.error('Error checking existing key:', error);
    }
  };

  // Setup encryption key
  const handleSetupKey = async () => {
    if (!address || !signMessageAsync) {
      setError('Please connect your wallet first');
      return;
    }

    setIsSettingUp(true);
    setError(null);

    try {
      // Extract public key from wallet signature
      const extractedKey = await publicKeyService.discoverPublicKey(address, signMessageAsync);
      
      setPublicKey(extractedKey);
      setSetupComplete(true);
      
      console.log('Public key setup complete for:', address);
      console.log('Public key:', extractedKey);
      
    } catch (error) {
      console.error('Key setup failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to setup encryption key');
    } finally {
      setIsSettingUp(false);
    }
  };

  const handleWalletConnected = () => {
    checkExistingKey();
  };

  const handleWalletDisconnected = () => {
    setSetupComplete(false);
    setPublicKey(null);
    setError(null);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-12 max-w-2xl">
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <Key className="h-16 w-16 mx-auto text-primary" />
              <h1 className="text-3xl font-bold">Setup Encryption Key</h1>
              <p className="text-muted-foreground">
                Connect your wallet to setup your encryption key for secure document sharing
              </p>
            </div>
            
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
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <Key className="h-16 w-16 mx-auto text-primary" />
            <h1 className="text-3xl font-bold">Encryption Key Setup</h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              To send and receive encrypted documents, you need to setup your encryption key. 
              This is a one-time process that extracts your public key from your wallet.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900">Error</p>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {!setupComplete ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Setup Your Encryption Key</span>
                </CardTitle>
                <CardDescription>
                  This process will ask you to sign a message with MetaMask to extract your public key. 
                  Your private key never leaves your wallet and is never exposed.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">What happens during setup:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• You&apos;ll sign a message with MetaMask</li>
                    <li>• Your public key will be extracted from the signature</li>
                    <li>• The public key will be cached locally for future use</li>
                    <li>• Your private key remains secure in MetaMask</li>
                  </ul>
                </div>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Connected wallet: <span className="font-mono">{address}</span>
                  </p>
                  
                  <Button
                    onClick={handleSetupKey}
                    disabled={isSettingUp}
                    className="w-full"
                    variant="success"
                    size="lg"
                  >
                    {isSettingUp ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Setting up encryption key...
                      </>
                    ) : (
                      <>
                        <Shield className="h-5 w-5 mr-2" />
                        Setup Encryption Key
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold">Encryption Key Setup Complete!</h3>
                  <p className="text-muted-foreground">
                    Your encryption key has been successfully setup. You can now send and receive encrypted documents.
                  </p>
                  
                  {publicKey && (
                    <div className="bg-gray-50 rounded-lg p-4 mt-4">
                      <p className="text-sm font-medium mb-2">Your Public Key:</p>
                      <p className="text-xs font-mono break-all text-gray-600">
                        {publicKey}
                      </p>
                    </div>
                  )}

                  <div className="flex space-x-4 justify-center mt-6">
                    <Button onClick={() => router.push('/')} variant="outline">
                      Return to Dashboard
                    </Button>
                    <Button onClick={() => router.push('/send')} variant="success">
                      Send Document
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
