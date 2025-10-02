/**
 * Web3 Wallet Utilities
 * Helper functions for interacting with MetaMask and other Web3 wallets
 */

/**
 * Check if MetaMask or compatible wallet is installed
 */
export async function isWalletAvailable(): Promise<boolean> {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
}

/**
 * Request wallet connection and get the connected address
 * @throws Error if wallet is not available or user rejects
 */
export async function connectWallet(): Promise<string> {
  if (!window.ethereum) {
    throw new Error('No wallet found. Please install MetaMask or similar.');
  }

  const accounts = await window.ethereum.request({ 
    method: 'eth_requestAccounts' 
  });

  if (!accounts || accounts.length === 0) {
    throw new Error('No wallet account selected');
  }

  return accounts[0];
}

/**
 * Generate a unique authentication message with timestamp
 */
export function generateAuthMessage(): { message: string; fullMessage: string } {
  const timestamp = Date.now();
  const message = `auth-${timestamp}`;
  const fullMessage = `Sign this message to authenticate: ${message}`;
  return { message, fullMessage };
}

/**
 * Request signature from the wallet
 * @param message - The message to sign
 * @param address - The wallet address
 * @throws Error if wallet is not available or user rejects
 */
export async function signMessage(message: string, address: string): Promise<string> {
  if (!window.ethereum) {
    throw new Error('No wallet found');
  }

  const signature = await window.ethereum.request({
    method: 'personal_sign',
    params: [message, address]
  });

  return signature;
}
