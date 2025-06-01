import { createConfig, http } from 'wagmi'
import { mainnet, sepolia, filecoinCalibration } from 'wagmi/chains'
import { metaMask, injected } from 'wagmi/connectors'

// Define the chains we want to support
export const supportedChains = [mainnet, sepolia, filecoinCalibration] as const

// Create Wagmi configuration
export const wagmiConfig = createConfig({
  chains: supportedChains,
  connectors: [
    injected({
      target: () => ({
        id: 'injected',
        name: 'Connect Wallet',
        provider: typeof window !== 'undefined' ? window.ethereum : undefined,
      }),
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [filecoinCalibration.id]: http(),
  },
})

// Export chain information for easy access
export const chains = {
  mainnet,
  sepolia,
  filecoinCalibration,
}

// Default chain for development
export const defaultChain = filecoinCalibration

// Chain names for display
export const chainNames = {
  [mainnet.id]: 'Ethereum Mainnet',
  [sepolia.id]: 'Sepolia Testnet',
  [filecoinCalibration.id]: 'Filecoin Calibration',
} as const

// Get chain name by ID
export function getChainName(chainId: number): string {
  return chainNames[chainId as keyof typeof chainNames] || `Chain ${chainId}`
}

// Check if chain is supported
export function isSupportedChain(chainId: number): boolean {
  return Object.keys(chainNames).includes(chainId.toString())
}

// Format address for display
export function formatAddress(address: string): string {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// Validate Ethereum address format
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}
