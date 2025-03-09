import React, { useState, useEffect, useCallback, useRef } from 'react';
import GameBoard from './GameBoard';
import GameControls from './GameControls';
import GameFinalize from './GameFinalize';
import { useGameEngine } from '../hooks/useGameEngine';

const Game = ({ wallet }) => {
  const [gameStatus, setGameStatus] = useState('new'); // new, playing, paused, ended
  const [isMobile, setIsMobile] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  
  // Generate a random seed for testing without blockchain
  const [gameSeed] = useState(() => Math.floor(Math.random() * 1000000));
  const [gameId] = useState(() => Date.now()); // Use timestamp as temporary game ID
  
  // Initialize game engine with local seed
  const { gameState, handleInput, finalizeGame } = useGameEngine(gameId, gameSeed);
  
  // Check if we're on a mobile device
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      setIsMobile(isMobileDevice);
    };
    
    checkMobile();
    
    // Also check on resize in case of orientation change
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Handle pause/resume keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameStatus === 'ended') return;
      
      if (e.key === 'p') {
        setGameStatus(prev => prev === 'playing' ? 'paused' : 'playing');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStatus]);
  
  // Start game when component mounts
  useEffect(() => {
    if (gameStatus === 'new') {
      setGameStatus('playing');
    }
  }, []);
  
  // Update game status when game is over
  useEffect(() => {
    if (gameState.gameOver && gameStatus !== 'ended') {
      setGameStatus('ended');
    }
  }, [gameState.gameOver, gameStatus]);
  
  // Handle game input from controls
  const onInput = useCallback((inputType) => {
    if (gameStatus !== 'playing') return;
    
    const result = handleInput(inputType);
    return result;
  }, [gameStatus, handleInput]);
  
  // Handle game restart
  const handleRestart = useCallback(() => {
    window.location.reload(); // Simple restart for now
  }, []);

  // Determine if the user can finalize the game (requires wallet connection)
  const canFinalizeGame = wallet && wallet.isConnected && wallet.isCorrectNetwork;
  
  // Add isPaused to gameState for GameBoard
  const enhancedGameState = {
    ...gameState,
    isPaused: gameStatus === 'paused'
  };
  
  // Mobile game over overlay - improved with Tailwind classes
  const renderMobileGameOver = () => {
    if (!isMobile || !gameState.gameOver) return null;
    
    return (
      <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-20">
        <div className="bg-gray-900 bg-opacity-90 p-6 rounded-lg shadow-xl max-w-xs w-4/5 text-center">
          <h3 className="text-2xl font-bold text-red-500 mb-3">GAME OVER</h3>
          <p className="text-gray-300 mb-6">
            Final Score: <span className="font-bold text-white text-xl">{gameState.score}</span>
          </p>
          
          <div className="space-y-3">
            <button 
              className="w-full px-4 py-3 bg-green-600 hover:bg-green-500 transition-colors rounded-md font-bold"
              onClick={handleRestart}
            >
              Play Again
            </button>
            
            {canFinalizeGame ? (
              <button 
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-500 transition-colors rounded-md font-bold"
                onClick={() => finalizeGame()}
              >
                Mint as NFT
              </button>
            ) : (
              <button 
                className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-500 transition-colors rounded-md font-bold"
                onClick={wallet.connect}
              >
                Connect Wallet to Mint
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Toggle help modal
  const toggleHelpModal = () => {
    setShowHelpModal(!showHelpModal);
  };
  
  return (
    <div className="game-container p-2 sm:p-4 max-w-6xl mx-auto">
      {/* IMPORTANT: Removed flex layout that was causing the two-column issue */}
      <div className="w-full flex flex-col items-center">
        <div className="game-main w-full relative">
          <GameBoard 
            gameState={enhancedGameState} 
            onInput={onInput}
          />
          {renderMobileGameOver()}
          
          {/* Only show GameControls on non-mobile */}
          {!isMobile && (
            <GameControls 
              onInput={onInput} 
              gameOver={gameState.gameOver} 
              isPaused={gameStatus === 'paused'}
              onRestart={handleRestart}
              useOverlayControls={true}
            />
          )}
        </div>
        
        {/* Only show sidebar on desktop - moved outside the game-main div */}
        {!isMobile && gameState.gameOver && (
          <div className="game-sidebar w-full lg:max-w-xs mt-4">
            <div className="game-info flex flex-col gap-4">
              {canFinalizeGame ? (
                <GameFinalize 
                  gameState={gameState}
                  finalizeGame={finalizeGame}
                  wallet={wallet}
                  disabled={!gameState.gameOver}
                />
              ) : (
                <div className="bg-gray-800 p-4 rounded-md">
                  <h3 className="text-xl font-bold text-yellow-400 mb-2">Game Over!</h3>
                  <p className="text-gray-300 mb-4">
                    Connect your wallet to mint this game as an NFT and save your score on the blockchain.
                  </p>
                  <button 
                    className="w-full px-4 py-2 bg-green-600 rounded hover:bg-green-500 transition-colors"
                    onClick={wallet.connect}
                  >
                    Connect Wallet to Mint
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Game pause notification for mobile - improved with Tailwind */}
        {isMobile && gameStatus === 'paused' && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg max-w-xs w-5/6 text-center">
              <h3 className="text-2xl font-bold text-yellow-400 mb-4">Game Paused</h3>
              <p className="text-gray-300 mb-6">Press 'P' to resume</p>
              <button 
                className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-md font-bold"
                onClick={() => setGameStatus('playing')}
              >
                Resume Game
              </button>
            </div>
          </div>
        )}
        
        {/* Show promotional material only on mobile and only on game over */}
        {isMobile && !wallet.isConnected && gameState.gameOver && (
          <div className="mt-4 bg-gray-800 p-5 rounded-lg shadow-md w-full">
            <h3 className="text-lg font-bold text-green-400 mb-3">Enhance Your Game Experience</h3>
            <p className="text-gray-300 mb-4">
              Connect your wallet to mint this game as an NFT and save your score on the blockchain.
            </p>
            <button 
              className="w-full px-4 py-3 bg-green-600 rounded-md hover:bg-green-500 transition-colors font-bold"
              onClick={wallet.connect}
            >
              Connect Wallet
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Game;