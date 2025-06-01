// jest.setup.js
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import { Crypto } from '@peculiar/webcrypto';

// Polyfill for Web Crypto API
global.crypto = new Crypto();

// Polyfill for TextEncoder/TextDecoder
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock fetch API
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock window.ethereum (MetaMask)
global.window = {
  ...global.window,
  ethereum: {
    isMetaMask: true,
    request: jest.fn(),
    on: jest.fn(),
    removeListener: jest.fn(),
    selectedAddress: '0x1234567890123456789012345678901234567890',
  },
};

// Mock File API
global.File = class File {
  constructor(bits, name, options = {}) {
    this.bits = bits;
    this.name = name;
    this.options = options;
    this.type = options.type || '';
  }
};

global.Blob = class Blob {
  constructor(bits, options = {}) {
    this.bits = bits;
    this.options = options;
    this.type = options.type || '';
  }
};

// Mock URL API
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});
