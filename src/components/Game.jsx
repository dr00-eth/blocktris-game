import React, { useState, useEffect, useCallback } from 'react';
import GameBoard from './GameBoard';
import GameControls from './GameControls';
import BlockPreview from './BlockPreview';
import ScoreBoard from './ScoreBoard';
import GameFinalize from './GameFinalize';
import { useGameEngine } from '../hooks/useGameEngine';
import { getBlockFromSeed } from '../engine/BlockDefinitions';

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
  
  // Compact header for mobile
  const renderCompactHeader = () => {
    if (!isMobile) return null;
    
    return (
      <div className="compact-header bg-gray-800 p-2 rounded-md mb-2 flex justify-between items-center">
        <div className="score-display">
          <div className="text-xs text-gray-400">Score</div>
          <div className="text-xl font-bold text-green-400">{gameState.score}</div>
        </div>
        
        <div className="level-display mx-2">
          <div className="text-xs text-gray-400">Level</div>
          <div className="text-lg font-bold text-yellow-400">{gameState.level || 1}</div>
        </div>
        
        <div className="lines-display">
          <div className="text-xs text-gray-400">Lines</div>
          <div className="text-lg font-bold text-blue-400">{gameState.linesCleared}</div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="game-container p-2 sm:p-4 max-w-6xl mx-auto">
      {renderCompactHeader()}
      
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 justify-center items-center lg:items-start">
        <div className="game-main w-full lg:w-auto">
          <GameBoard 
            gameState={enhancedGameState} 
            onInput={onInput}
          />
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
              <div className="flex flex-row lg:flex-col gap-4">
                <ScoreBoard 
                  score={gameState.score} 
                  linesCleared={gameState.linesCleared}
                  level={gameState.level || 1}
                  gameOver={gameState.gameOver} 
                  className="flex-1"
                />
                
                <BlockPreview nextBlock={gameState.nextBlock} className="flex-1" />
              </div>
              
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
        
        {/* Game over and pause notifications for mobile */}
        {isMobile && (
          <>
            {gameState.gameOver && (
              <div className="mt-4 w-full">
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
            
            {gameStatus === 'paused' && (
              <div className="mt-4 w-full bg-gray-800 p-4 rounded-md text-center">
                <h3 className="text-xl font-bold text-yellow-400 mb-2">Game Paused</h3>
                <p className="text-gray-300">Press 'P' to resume</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Game;
