/**
 * blockchain.js
 * Utilities for interacting with the Ethereum blockchain and smart contracts
 */

import { ethers } from 'ethers';
import BlockTrisABI from '../contracts/BlockTris.json';
import BlockTrisMarketplaceABI from '../contracts/BlockTrisMarketplace.json';
import BlockTrisTournamentABI from '../contracts/BlockTrisTournament.json';

// Contract addresses (from environment variables)
export const BLOCKTRIS_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '';
export const MARKETPLACE_ADDRESS = import.meta.env.VITE_MARKETPLACE_ADDRESS || '';
export const TOURNAMENT_ADDRESS = import.meta.env.VITE_TOURNAMENT_ADDRESS || '';

// Chain ID (from environment variables)
export const CHAIN_ID = parseInt(import.meta.env.VITE_CHAIN_ID || '8453');

// RPC URL (from environment variables)
export const RPC_URL = import.meta.env.VITE_RPC_URL || 'https://mainnet.base.org';

/**
 * Get a provider for the Ethereum network
 * @returns {ethers.Provider} Ethereum provider
 */
export const getProvider = () => {
  // Use window.ethereum if available (MetaMask)
  if (window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  
  // Otherwise use RPC URL
  return new ethers.JsonRpcProvider(RPC_URL);
};

/**
 * Get a signer for transactions
 * @param {ethers.Provider} provider - Ethereum provider
 * @returns {Promise<ethers.Signer>} Ethereum signer
 */
export const getSigner = async (provider) => {
  if (!provider) {
    provider = getProvider();
  }
  
  return await provider.getSigner();
};

/**
 * Get the BlockTris contract instance
 * @param {ethers.Signer|ethers.Provider} signerOrProvider - Signer or provider
 * @returns {ethers.Contract} BlockTris contract
 */
export const getBlockTrisContract = (signerOrProvider) => {
  if (!BLOCKTRIS_ADDRESS) {
    throw new Error('BlockTris contract address not set');
  }
  
  return new ethers.Contract(BLOCKTRIS_ADDRESS, BlockTrisABI.abi, signerOrProvider);
};

/**
 * Get the BlockTrisMarketplace contract instance
 * @param {ethers.Signer|ethers.Provider} signerOrProvider - Signer or provider
 * @returns {ethers.Contract} BlockTrisMarketplace contract
 */
export const getMarketplaceContract = (signerOrProvider) => {
  if (!MARKETPLACE_ADDRESS) {
    throw new Error('Marketplace contract address not set');
  }
  
  return new ethers.Contract(MARKETPLACE_ADDRESS, BlockTrisMarketplaceABI.abi, signerOrProvider);
};

/**
 * Get the BlockTrisTournament contract instance
 * @param {ethers.Signer|ethers.Provider} signerOrProvider - Signer or provider
 * @returns {ethers.Contract} BlockTrisTournament contract
 */
export const getTournamentContract = (signerOrProvider) => {
  if (!TOURNAMENT_ADDRESS) {
    throw new Error('Tournament contract address not set');
  }
  
  return new ethers.Contract(TOURNAMENT_ADDRESS, BlockTrisTournamentABI.abi, signerOrProvider);
};

/**
 * Connect to the wallet
 * @returns {Promise<string>} Connected address
 */
export const connectWallet = async () => {
  if (!window.ethereum) {
    throw new Error('No Ethereum wallet found');
  }
  
  try {
    // Request account access
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    return accounts[0];
  } catch (error) {
    throw new Error(`Failed to connect wallet: ${error.message}`);
  }
};

/**
 * Check if the wallet is connected to the correct network
 * @returns {Promise<boolean>} Whether the wallet is on the correct network
 */
export const checkNetwork = async () => {
  if (!window.ethereum) {
    return false;
  }
  
  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    return parseInt(chainId) === CHAIN_ID;
  } catch (error) {
    console.error('Error checking network:', error);
    return false;
  }
};

/**
 * Switch to the correct network
 * @returns {Promise<boolean>} Whether the switch was successful
 */
export const switchNetwork = async () => {
  if (!window.ethereum) {
    return false;
  }
  
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${CHAIN_ID.toString(16)}` }]
    });
    return true;
  } catch (error) {
    console.error('Error switching network:', error);
    return false;
  }
};

/**
 * Format Ethereum value to human-readable string
 * @param {ethers.BigNumberish} value - Value in wei
 * @returns {string} Formatted value in ETH
 */
export const formatEther = (value) => {
  return ethers.formatEther(value);
};

/**
 * Parse Ethereum value from human-readable string
 * @param {string} value - Value in ETH
 * @returns {ethers.BigNumber} Value in wei
 */
export const parseEther = (value) => {
  return ethers.parseEther(value);
};

/**
 * Get transaction receipt and wait for confirmation
 * @param {ethers.TransactionResponse} tx - Transaction response
 * @returns {Promise<ethers.TransactionReceipt>} Transaction receipt
 */
export const waitForTransaction = async (tx) => {
  return await tx.wait();
};

/**
 * Listen for contract events
 * @param {ethers.Contract} contract - Contract instance
 * @param {string} eventName - Event name
 * @param {Function} callback - Callback function
 * @returns {ethers.Contract} Contract with event listener
 */
export const listenForEvent = (contract, eventName, callback) => {
  contract.on(eventName, callback);
  return contract;
};

/**
 * Stop listening for contract events
 * @param {ethers.Contract} contract - Contract instance
 * @param {string} eventName - Event name
 * @param {Function} callback - Callback function
 * @returns {ethers.Contract} Contract without event listener
 */
export const removeEventListener = (contract, eventName, callback) => {
  contract.off(eventName, callback);
  return contract;
};
