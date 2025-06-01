'use client'

import { useAccount, useConnect, useDisconnect, useSignMessage } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatAddress, getChainName } from '@/lib/wagmi-config'
import { publicKeyService } from '@/lib/public-key-service'
import { useState, useEffect, useCallback } from 'react'
import type { Connector } from 'wagmi'

interface WalletConnectionProps {
  onWalletConnected?: (address: string, publicKey: string) => void
  onWalletDisconnected?: () => void
}

export function WalletConnection({ onWalletConnected, onWalletDisconnected }: WalletConnectionProps) {
  const { address, isConnected, chain } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { signMessageAsync } = useSignMessage()
  
  const [isDiscoveringKey, setIsDiscoveringKey] = useState(false)
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const checkCachedKey = useCallback(async () => {
    if (!address) return

    try {
      const cachedKey = await publicKeyService.getPublicKey(address)
      if (cachedKey) {
        setPublicKey(cachedKey)
        onWalletConnected?.(address, cachedKey)
      } else {
        // Need to discover public key
        await discoverPublicKey()
      }
    } catch (error) {
      console.error('Failed to check cached key:', error)
    }
  }, [address, onWalletConnected])

  // Check for cached public key when wallet connects
  useEffect(() => {
    if (isConnected && address && !publicKey) {
      checkCachedKey()
    }
  }, [isConnected, address, publicKey, checkCachedKey])

  const discoverPublicKey = async () => {
    if (!address || !signMessageAsync) return
    
    setIsDiscoveringKey(true)
    setError(null)
    
    try {
      const discoveredKey = await publicKeyService.discoverPublicKey(address, signMessageAsync)
      setPublicKey(discoveredKey)
      onWalletConnected?.(address, discoveredKey)
    } catch (error) {
      console.error('Failed to discover public key:', error)
      setError(error instanceof Error ? error.message : 'Failed to discover public key')
    } finally {
      setIsDiscoveringKey(false)
    }
  }

  const handleConnect = (connector: Connector) => {
    setError(null)
    connect({ connector })
  }

  const handleDisconnect = () => {
    disconnect()
    setPublicKey(null)
    setError(null)
    onWalletDisconnected?.()
  }

  if (isConnected && address) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Wallet Connected</span>
            <Button variant="outline" size="sm" onClick={handleDisconnect}>
              Disconnect
            </Button>
          </CardTitle>
          <CardDescription>
            {formatAddress(address)} on {chain ? getChainName(chain.id) : 'Unknown Network'}
          </CardDescription>
        </CardHeader>
        
        {!publicKey && !isDiscoveringKey && (
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                To use FiloSign, we need to discover your public key for encryption.
              </p>
              <Button onClick={discoverPublicKey} className="w-full">
                Setup Encryption Key
              </Button>
            </div>
          </CardContent>
        )}

        {isDiscoveringKey && (
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Please sign the message in your wallet to discover your public key...
              </p>
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm">Discovering encryption key...</span>
              </div>
            </div>
          </CardContent>
        )}

        {publicKey && (
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-green-600">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-sm font-medium">✅ SUCCESS: Public Key Extracted!</span>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Public Key:</p>
                <div className="bg-gray-50 p-3 rounded-md border">
                  <code className="text-xs font-mono break-all text-gray-700">
                    {publicKey}
                  </code>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Your wallet is configured for secure document encryption.
              </p>
            </div>
          </CardContent>
        )}

        {error && (
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-red-600">
                ❌ {error}
              </p>
              <Button onClick={discoverPublicKey} variant="outline" className="w-full">
                Try Again
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connect Wallet</CardTitle>
        <CardDescription>
          Connect your wallet to start using FiloSign for secure document sharing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {connectors.length > 0 ? (
            <Button
              onClick={() => handleConnect(connectors[0])}
              disabled={isPending}
              className="w-full"
              size="lg"
            >
              {isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Connecting...
                </>
              ) : (
                'Connect Wallet'
              )}
            </Button>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                No wallet detected. Please install MetaMask or another compatible wallet to continue.
              </p>
              <Button
                variant="outline"
                onClick={() => window.open('https://metamask.io/download/', '_blank')}
                className="w-full"
              >
                Install MetaMask
              </Button>
            </div>
          )}

          {error && (
            <div className="alert-error mt-4">
              <p className="alert-description">
                {error}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
