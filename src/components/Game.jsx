import React, { useState, useEffect, useCallback } from 'react';
import GameBoard from './GameBoard';
import GameControls from './GameControls';
import GameFinalize from './GameFinalize';
import { useGameEngine } from '../hooks/useGameEngine';

const Game = ({ wallet }) => {
  const [gameStatus, setGameStatus] = useState('new'); // new, playing, paused, ended
  const [isMobile, setIsMobile] = useState(false);
  
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
  
  // Mobile game over overlay
  const renderMobileGameOver = () => {
    if (!isMobile || !gameState.gameOver) return null;
    
    return (
      <div className="mobile-game-over absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                      bg-gray-900 bg-opacity-90 p-4 rounded-md text-center z-10 w-4/5 max-w-xs">
        <h3 className="text-2xl font-bold text-red-500 mb-2">GAME OVER</h3>
        <p className="text-gray-300 mb-4">
          Final Score: <span className="font-bold text-white">{gameState.score}</span>
        </p>
        
        <div className="flex flex-col gap-3">
          <button 
            className="w-full px-4 py-2 bg-green-600 rounded hover:bg-green-500 transition-colors"
            onClick={handleRestart}
          >
            Play Again
          </button>
          
          {canFinalizeGame ? (
            <button 
              className="w-full px-4 py-2 bg-blue-600 rounded hover:bg-blue-500 transition-colors"
              onClick={() => finalizeGame()}
            >
              Mint as NFT
            </button>
          ) : (
            <button 
              className="w-full px-4 py-2 bg-purple-600 rounded hover:bg-purple-500 transition-colors"
              onClick={wallet.connect}
            >
              Connect Wallet to Mint
            </button>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className="game-container p-2 sm:p-4 max-w-6xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 justify-center items-center lg:items-start">
        <div className="game-main w-full lg:w-auto relative">
          <GameBoard 
            gameState={enhancedGameState} 
            onInput={onInput}
          />
          {renderMobileGameOver()}
          <GameControls 
            onInput={onInput} 
            gameOver={gameState.gameOver} 
            isPaused={gameStatus === 'paused'}
            onRestart={handleRestart}
            useOverlayControls={true}
          />
        </div>
        
        {/* Only show sidebar on desktop */}
        {!isMobile && (
          <div className="game-sidebar w-full lg:max-w-xs">
            <div className="game-info flex flex-col gap-4">
              {gameState.gameOver && (
                <div className="mt-4">
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
              )}
            </div>
          </div>
        )}
        
        {/* Game pause notification for mobile */}
        {isMobile && gameStatus === 'paused' && (
          <div className="mt-4 w-full bg-gray-800 p-4 rounded-md text-center">
            <h3 className="text-xl font-bold text-yellow-400 mb-2">Game Paused</h3>
            <p className="text-gray-300">Press 'P' to resume</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Game;