import React, { useState } from 'react';

const GameFinalize = ({ gameState, finalizeGame, wallet, disabled }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinalized, setIsFinalized] = useState(false);
  const [error, setError] = useState(null);
  
  // Handle finalize game
  const handleFinalize = async () => {
    if (disabled || isSubmitting || isFinalized) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // For now, just simulate blockchain interaction
      const gameData = finalizeGame();
      
      // Simulate a delay for "blockchain" processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Game finalized:', gameData);
      setIsFinalized(true);
      
      // In a real implementation, this would call the blockchain
      // if (wallet && wallet.isConnected) {
      //   const tx = await blockTrisContract.finalizeGame(gameData.gameId, gameData.score, gameData.replayURI);
      //   await tx.wait();
      // }
    } catch (err) {
      console.error('Error finalizing game:', err);
      setError(err.message || 'Failed to finalize game');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // If wallet is not connected, show connect prompt
  if (wallet && !wallet.isConnected) {
    return (
      <div className="game-finalize bg-gray-800 p-4 rounded-md">
        <h3 className="text-lg font-medium mb-2 text-center">Save Your Game</h3>
        <p className="text-sm text-gray-400 mb-3 text-center">
          Connect your wallet to save this game as an NFT
        </p>
        <button
          className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white font-medium"
          onClick={wallet.connect}
        >
          Connect Wallet
        </button>
      </div>
    );
  }
  
  return (
    <div className="game-finalize bg-gray-800 p-4 rounded-md">
      <h3 className="text-lg font-medium mb-2 text-center">Game Complete!</h3>
      
      {isFinalized ? (
        <div className="text-center">
          <div className="mb-3 text-green-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="mt-2">Game saved successfully!</p>
          </div>
          <p className="text-sm text-gray-400">
            Your game has been saved with a score of <span className="font-bold text-white">{gameState.score}</span>
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-400 mb-3 text-center">
            Save your game to preserve your score
          </p>
          
          <button
            className="w-full py-2 bg-green-600 hover:bg-green-500 rounded-md text-white font-medium flex items-center justify-center"
            onClick={handleFinalize}
            disabled={disabled || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              'Save Game'
            )}
          </button>
          
          {error && (
            <div className="mt-2 text-red-500 text-sm text-center">
              {error}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GameFinalize;
