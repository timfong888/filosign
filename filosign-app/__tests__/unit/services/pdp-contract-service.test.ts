import { PDPContractService } from '../../../src/lib/services/pdp-contract-service';
import { PDPContractParams, PDPErrorCode } from '../../../src/lib/types/pdp';
import { ethers } from 'ethers';

// Mock ethers
jest.mock('ethers', () => {
  const originalModule = jest.requireActual('ethers');
  
  // Mock Contract class
  const mockContract = {
    connect: jest.fn().mockReturnThis(),
    createDeal: jest.fn(),
    makePayment: jest.fn(),
    verifyDeal: jest.fn(),
    extendDeal: jest.fn(),
    terminateDeal: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    interface: {
      parseLog: jest.fn()
    }
  };
  
  // Mock Signer
  const mockSigner = {
    getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890'),
    connect: jest.fn().mockReturnThis()
  };
  
  // Mock Provider
  const mockProvider = {
    getSigner: jest.fn().mockResolvedValue(mockSigner),
    getFeeData: jest.fn().mockResolvedValue({ gasPrice: 1000000000n })
  };
  
  return {
    ...originalModule,
    Contract: jest.fn().mockImplementation(() => mockContract),
    BrowserProvider: jest.fn().mockImplementation(() => mockProvider),
    JsonRpcProvider: jest.fn().mockImplementation(() => ({
      getFeeData: jest.fn().mockResolvedValue({ gasPrice: 1000000000n })
    })),
    parseEther: jest.fn().mockImplementation((value) => BigInt(parseFloat(value) * 1e18))
  };
});

// Mock window.ethereum
const mockEthereum = {
  request: jest.fn().mockImplementation(async ({ method, params }) => {
    if (method === 'eth_requestAccounts') {
      return ['0x1234567890123456789012345678901234567890'];
    }
    return null;
  }),
  on: jest.fn(),
  removeListener: jest.fn()
};

// Test parameters
const testParams: PDPContractParams = {
  contractAddress: '0x1234567890123456789012345678901234567890',
  chainId: 5,
  rpcUrl: 'https://ethereum-goerli.publicnode.com',
  gasPriceMultiplier: 1.2
};

describe('PDPContractService', () => {
  let service: PDPContractService;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create service instance
    service = new PDPContractService(testParams);
    
    // Mock global window.ethereum
    global.window = {
      ...global.window,
      ethereum: mockEthereum
    };
  });
  
  describe('Initialization', () => {
    it('should initialize with correct parameters', () => {
      expect(service).toBeDefined();
      expect(ethers.JsonRpcProvider).toHaveBeenCalledWith(testParams.rpcUrl);
      expect(ethers.Contract).toHaveBeenCalledWith(
        testParams.contractAddress,
        expect.any(Array),
        expect.anything()
      );
    });
  });
  
  describe('Wallet Connection', () => {
    it('should connect wallet successfully', async () => {
      const address = await service.connectWallet(mockEthereum);
      
      expect(ethers.BrowserProvider).toHaveBeenCalledWith(mockEthereum);
      expect(address).toBe('0x1234567890123456789012345678901234567890');
      expect(service.isWalletConnected()).toBe(true);
    });
    
    it('should throw error when wallet connection fails', async () => {
      // Mock provider to throw error
      (ethers.BrowserProvider as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Wallet connection failed');
      });
      
      await expect(service.connectWallet(mockEthereum)).rejects.toThrow();
      expect(service.isWalletConnected()).toBe(false);
    });
    
    it('should return wallet address when connected', async () => {
      await service.connectWallet(mockEthereum);
      const address = await service.getWalletAddress();
      
      expect(address).toBe('0x1234567890123456789012345678901234567890');
    });
    
    it('should return null wallet address when not connected', async () => {
      const address = await service.getWalletAddress();
      
      expect(address).toBeNull();
    });
  });
  
  describe('Deal Creation', () => {
    beforeEach(async () => {
      // Connect wallet first
      await service.connectWallet(mockEthereum);
      
      // Mock contract method
      const mockContract = ethers.Contract.mock.results[0].value;
      mockContract.createDeal.mockResolvedValue({
        wait: jest.fn().mockResolvedValue({
          hash: '0xabcdef1234567890',
          logs: [
            {
              topics: ['topic1', 'topic2'],
              data: '0xdata'
            }
          ]
        })
      });
      
      // Mock parseLog to return a DealCreated event
      mockContract.interface.parseLog.mockReturnValue({
        name: 'DealCreated',
        args: ['deal-123', 'cid-123', '0x1234', 'f01234', '1000000000000000000', '180']
      });
    });
    
    it('should create a deal successfully', async () => {
      const dealParams = {
        dataCid: 'cid-123',
        dataSize: 1024 * 1024, // 1 MB
        duration: 180,
        providerId: 'f01234',
        isVerified: false,
        price: '1.0', // 1 FIL
        clientAddress: '0x1234567890123456789012345678901234567890'
      };
      
      const result = await service.createDeal(dealParams);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.dealId).toBe('deal-123');
      expect(result.data?.params).toEqual(dealParams);
      expect(result.data?.status).toBe('created');
      
      // Verify contract was called with correct parameters
      const mockContract = ethers.Contract.mock.results[0].value;
      expect(mockContract.createDeal).toHaveBeenCalledWith(
        dealParams.dataCid,
        dealParams.dataSize,
        dealParams.duration,
        dealParams.providerId,
        dealParams.isVerified,
        expect.anything(), // parseEther result
        expect.objectContaining({
          value: expect.anything(),
          gasPrice: expect.anything()
        })
      );
    });
    
    it('should handle errors during deal creation', async () => {
      // Mock contract to throw error
      const mockContract = ethers.Contract.mock.results[0].value;
      mockContract.createDeal.mockRejectedValue(new Error('Contract error'));
      
      const dealParams = {
        dataCid: 'cid-123',
        dataSize: 1024 * 1024,
        duration: 180,
        providerId: 'f01234',
        isVerified: false,
        price: '1.0',
        clientAddress: '0x1234567890123456789012345678901234567890'
      };
      
      const result = await service.createDeal(dealParams);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe(PDPErrorCode.CONTRACT_ERROR);
      expect(result.error?.message).toContain('Failed to create storage deal');
    });
    
    it('should throw error when wallet is not connected', async () => {
      // Create new service without connecting wallet
      service = new PDPContractService(testParams);
      
      const dealParams = {
        dataCid: 'cid-123',
        dataSize: 1024 * 1024,
        duration: 180,
        providerId: 'f01234',
        isVerified: false,
        price: '1.0',
        clientAddress: '0x1234567890123456789012345678901234567890'
      };
      
      const result = await service.createDeal(dealParams);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('Wallet not connected');
    });
  });
  
  describe('Payment', () => {
    beforeEach(async () => {
      // Connect wallet first
      await service.connectWallet(mockEthereum);
      
      // Mock contract method
      const mockContract = ethers.Contract.mock.results[0].value;
      mockContract.makePayment.mockResolvedValue({
        wait: jest.fn().mockResolvedValue({
          hash: '0xabcdef1234567890',
          blockNumber: 12345,
          logs: [
            {
              topics: ['topic1', 'topic2'],
              data: '0xdata'
            }
          ]
        })
      });
      
      // Mock parseLog to return a PaymentMade event
      mockContract.interface.parseLog.mockReturnValue({
        name: 'PaymentMade',
        args: [
          'payment-123',
          'deal-123',
          '0x1234567890123456789012345678901234567890',
          '0x0987654321098765432109876543210987654321',
          ethers.parseEther('1.0')
        ]
      });
    });
    
    it('should make a payment successfully', async () => {
      const result = await service.makePayment('deal-123', '1.0');
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.paymentId).toBe('payment-123');
      expect(result.data?.dealId).toBe('deal-123');
      expect(result.data?.status).toBe('confirmed');
      expect(result.data?.txHash).toBe('0xabcdef1234567890');
      
      // Verify contract was called with correct parameters
      const mockContract = ethers.Contract.mock.results[0].value;
      expect(mockContract.makePayment).toHaveBeenCalledWith(
        'deal-123',
        expect.objectContaining({
          value: expect.anything(),
          gasPrice: expect.anything()
        })
      );
    });
    
    it('should handle errors during payment', async () => {
      // Mock contract to throw error
      const mockContract = ethers.Contract.mock.results[0].value;
      mockContract.makePayment.mockRejectedValue(new Error('Payment error'));
      
      const result = await service.makePayment('deal-123', '1.0');
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe(PDPErrorCode.PAYMENT_FAILED);
      expect(result.error?.message).toContain('Failed to make payment');
    });
  });
  
  describe('Deal Verification', () => {
    beforeEach(() => {
      // Mock contract method
      const mockContract = ethers.Contract.mock.results[0].value;
      mockContract.verifyDeal.mockResolvedValue([true, 1718035200]);
    });
    
    it('should verify a deal successfully', async () => {
      const result = await service.verifyDeal('deal-123');
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.isActive).toBe(true);
      expect(result.data?.expirationTimestamp).toBe(1718035200 * 1000); // Converted to ms
      
      // Verify contract was called with correct parameters
      const mockContract = ethers.Contract.mock.results[0].value;
      expect(mockContract.verifyDeal).toHaveBeenCalledWith('deal-123');
    });
    
    it('should handle errors during verification', async () => {
      // Mock contract to throw error
      const mockContract = ethers.Contract.mock.results[0].value;
      mockContract.verifyDeal.mockRejectedValue(new Error('Verification error'));
      
      const result = await service.verifyDeal('deal-123');
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe(PDPErrorCode.CONTRACT_ERROR);
      expect(result.error?.message).toContain('Failed to verify deal');
    });
  });
  
  describe('Error Handling', () => {
    beforeEach(async () => {
      await service.connectWallet(mockEthereum);
    });
    
    it('should handle user rejection errors', async () => {
      // Mock contract to throw user rejection error
      const mockContract = ethers.Contract.mock.results[0].value;
      mockContract.makePayment.mockRejectedValue({
        code: 4001,
        message: 'User rejected the request'
      });
      
      const result = await service.makePayment('deal-123', '1.0');
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe(PDPErrorCode.USER_CANCELLED);
      expect(result.error?.message).toContain('rejected by the user');
    });
    
    it('should include contract address in error details', async () => {
      // Mock contract to throw error
      const mockContract = ethers.Contract.mock.results[0].value;
      mockContract.makePayment.mockRejectedValue(new Error('Contract error'));
      
      const result = await service.makePayment('deal-123', '1.0');
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.details).toBeDefined();
      expect(result.error?.details?.contractAddress).toBe(testParams.contractAddress);
      expect(result.error?.details?.chainId).toBe(testParams.chainId);
    });
  });
  
  describe('Event Listening', () => {
    it('should set up event listeners correctly', () => {
      const mockCallback = jest.fn();
      const mockContract = ethers.Contract.mock.results[0].value;
      
      const unsubscribe = service.listenForEvents('DealCreated', mockCallback);
      
      expect(mockContract.on).toHaveBeenCalledWith('DealCreated', expect.any(Function));
      
      // Test unsubscribe
      unsubscribe();
      expect(mockContract.off).toHaveBeenCalledWith('DealCreated', expect.any(Function));
    });
  });
});
