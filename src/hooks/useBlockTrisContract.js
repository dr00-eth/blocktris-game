import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import BlockTrisABI from '../artifacts/contracts/BlockTris.sol/BlockTris.json';

export function useBlockTrisContract(contractAddress) {
  const [contract, setContract] = useState(null);
  const [signer, setSigner] = useState(null);
  const [provider, setProvider] = useState(null);
  const [address, setAddress] = useState('');

  // Initialize provider and contract
  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          // Connect to provider - updated for ethers v6
          const ethersProvider = new ethers.BrowserProvider(window.ethereum);
          setProvider(ethersProvider);

          // Get signer and address - updated for ethers v6
          const ethersSigner = await ethersProvider.getSigner();
          setSigner(ethersSigner);
          const signerAddress = await ethersSigner.getAddress();
          setAddress(signerAddress);

          // Initialize contract
          if (contractAddress) {
            const blockTrisContract = new ethers.Contract(
              contractAddress,
              BlockTrisABI.abi,
              ethersSigner
            );
            setContract(blockTrisContract);
          }
        } catch (error) {
          console.error('Error initializing contract:', error);
        }
      }
    };

    init();
  }, [contractAddress]);

  // Create a new game
  const createGame = useCallback(async () => {
    if (!contract) return null;

    try {
      const tx = await contract.createGame();
      const receipt = await tx.wait();

      // Get game ID from event - updated for ethers v6
      const gameCreatedEvent = receipt.logs
        .filter(log => contract.interface.parseLog(log))
        .map(log => contract.interface.parseLog(log))
        .find(event => event.name === 'GameCreated');
      
      const gameId = gameCreatedEvent.args.gameId;

      // Wait for randomness to be fulfilled
      const filter = contract.filters.RandomnessFulfilled(gameId);
      
      // This is a simplified approach - in production you'd implement
      // a more robust waiting mechanism or webhook
      return new Promise((resolve) => {
        contract.once(filter, (gameId, randomWords) => {
          resolve({
            gameId: Number(gameId),
            seed: Number(randomWords[0]),
            blockSequence: randomWords.map(word => Number(word))
          });
        });
      });
    } catch (error) {
      console.error('Error creating game:', error);
      return null;
    }
  }, [contract]);

  // Finalize a game
  const finalizeGame = useCallback(async (gameId, score, boardState, hash) => {
    if (!contract) return null;

    try {
      const tx = await contract.finalizeGame(
        gameId,
        score,
        boardState,
        hash
      );
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error('Error finalizing game:', error);
      return null;
    }
  }, [contract]);

  return {
    provider,
    signer,
    address,
    contract,
    createGame,
    finalizeGame
  };
}
