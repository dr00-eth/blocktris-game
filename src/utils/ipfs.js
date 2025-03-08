/**
 * ipfs.js
 * Utilities for storing and retrieving data from IPFS using NFT.Storage
 */

import { NFTStorage, Blob } from 'nft.storage';

// NFT.Storage API key (from environment variables)
const NFT_STORAGE_KEY = import.meta.env.VITE_NFT_STORAGE_KEY || '';

// Create NFT.Storage client
const client = new NFTStorage({ token: NFT_STORAGE_KEY });

/**
 * Store game replay data on IPFS
 * @param {Object} replayData - Game replay data
 * @returns {Promise<string>} IPFS CID
 */
export const storeReplayData = async (replayData) => {
  if (!NFT_STORAGE_KEY) {
    throw new Error('NFT.Storage API key not set');
  }
  
  try {
    // Convert replay data to JSON string
    const jsonData = JSON.stringify(replayData);
    
    // Create a blob with the JSON data
    const blob = new Blob([jsonData], { type: 'application/json' });
    
    // Store the blob on IPFS
    const cid = await client.storeBlob(blob);
    
    return cid;
  } catch (error) {
    console.error('Error storing replay data:', error);
    throw new Error(`Failed to store replay data: ${error.message}`);
  }
};

/**
 * Store game metadata on IPFS
 * @param {Object} metadata - Game metadata
 * @returns {Promise<string>} IPFS CID
 */
export const storeMetadata = async (metadata) => {
  if (!NFT_STORAGE_KEY) {
    throw new Error('NFT.Storage API key not set');
  }
  
  try {
    // Store the metadata as NFT metadata
    const result = await client.store(metadata);
    
    return result.ipnft;
  } catch (error) {
    console.error('Error storing metadata:', error);
    throw new Error(`Failed to store metadata: ${error.message}`);
  }
};

/**
 * Retrieve data from IPFS
 * @param {string} cid - IPFS CID
 * @returns {Promise<Object>} Retrieved data
 */
export const retrieveData = async (cid) => {
  try {
    // Fetch data from IPFS gateway
    const response = await fetch(`https://nftstorage.link/ipfs/${cid}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }
    
    // Parse JSON data
    const data = await response.json();
    
    return data;
  } catch (error) {
    console.error('Error retrieving data:', error);
    throw new Error(`Failed to retrieve data: ${error.message}`);
  }
};

/**
 * Create game replay metadata
 * @param {Object} gameData - Game data
 * @returns {Object} Game metadata
 */
export const createGameMetadata = (gameData) => {
  const { gameId, score, board, actions, seed, player } = gameData;
  
  return {
    name: `BlockTris Game #${gameId}`,
    description: `A BlockTris game played by ${player} with a score of ${score}`,
    image: generateGameImage(board),
    properties: {
      gameId,
      score,
      seed,
      player,
      timestamp: Date.now(),
      actionCount: actions.length
    }
  };
};

/**
 * Generate a data URL for the game board image
 * @param {Array} board - Game board state
 * @returns {string} Data URL for the image
 */
export const generateGameImage = (board) => {
  // This is a placeholder - in a real implementation, this would generate
  // an SVG or canvas image of the game board
  return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzNTAiIGhlaWdodD0iMzUwIiBzdHlsZT0iYmFja2dyb3VuZC1jb2xvcjojMDAwOyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iYmxhY2siIC8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiMwMEZGMDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkJsb2NrVHJpczwvdGV4dD48L3N2Zz4=';
};

/**
 * Get IPFS gateway URL for a CID
 * @param {string} cid - IPFS CID
 * @returns {string} IPFS gateway URL
 */
export const getIpfsUrl = (cid) => {
  return `https://nftstorage.link/ipfs/${cid}`;
};

/**
 * Check if NFT.Storage is configured
 * @returns {boolean} Whether NFT.Storage is configured
 */
export const isNftStorageConfigured = () => {
  return !!NFT_STORAGE_KEY;
};
