/**
 * Basic setup test to verify Jest configuration is working correctly
 */

describe('Jest Environment Setup', () => {
  test('Jest is working correctly', () => {
    expect(1 + 1).toBe(2);
  });

  test('DOM environment is available', () => {
    expect(window).toBeDefined();
    expect(document).toBeDefined();
    expect(document.createElement).toBeDefined();
  });

  test('Web Crypto API polyfill is working', () => {
    expect(crypto).toBeDefined();
    expect(crypto.subtle).toBeDefined();
    expect(typeof crypto.getRandomValues).toBe('function');
    
    // Test random value generation
    const array = new Uint8Array(8);
    crypto.getRandomValues(array);
    // Check that values were actually generated (not all zeros)
    expect(array.some(value => value !== 0)).toBe(true);
  });

  test('TextEncoder/TextDecoder polyfills are working', () => {
    expect(TextEncoder).toBeDefined();
    expect(TextDecoder).toBeDefined();
    
    const encoder = new TextEncoder();
    const text = 'Hello, FiloSign!';
    const encoded = encoder.encode(text);
    
    expect(encoded).toBeInstanceOf(Uint8Array);
    expect(encoded.length).toBeGreaterThan(0);
    
    const decoder = new TextDecoder();
    const decoded = decoder.decode(encoded);
    
    expect(decoded).toBe(text);
  });

  test('Module resolution is working', () => {
    // This would fail if the module resolution in jest.config.js is incorrect
    expect(() => require('@/lib/types/pdp')).not.toThrow();
  });

  test('Fetch API mock is available', () => {
    expect(fetch).toBeDefined();
    expect(jest.isMockFunction(fetch)).toBe(true);
  });

  test('LocalStorage mock is available', () => {
    expect(localStorage).toBeDefined();
    expect(jest.isMockFunction(localStorage.getItem)).toBe(true);
    expect(jest.isMockFunction(localStorage.setItem)).toBe(true);
  });

  test('MetaMask mock is available', () => {
    expect(window.ethereum).toBeDefined();
    expect(window.ethereum.isMetaMask).toBe(true);
    expect(jest.isMockFunction(window.ethereum.request)).toBe(true);
  });
});
