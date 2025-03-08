import React, { useEffect, useState } from 'react';

const GameControls = ({ onInput, gameOver, isPaused, onRestart }) => {
  const [touchControls, setTouchControls] = useState(false);

  // Handle keyboard controls
  useEffect(() => {
    if (gameOver) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          onInput('left');
          e.preventDefault();
          break;
        case 'ArrowRight':
          onInput('right');
          e.preventDefault();
          break;
        case 'ArrowDown':
          onInput('down');
          e.preventDefault();
          break;
        case 'ArrowUp':
          onInput('rotate');
          e.preventDefault();
          break;
        case 'z':
        case 'Z':
          onInput('rotateCounterClockwise');
          e.preventDefault();
          break;
        case ' ':
          onInput('hardDrop');
          e.preventDefault();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    // Check if we're on a mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setTouchControls(isMobile);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onInput, gameOver]);

  // Handle button click
  const handleButtonClick = (inputType) => {
    if (gameOver || isPaused) return;
    onInput(inputType);
  };

  return (
    <div className="game-controls mt-4">
      {/* Mobile touch controls */}
      <div className="touch-controls grid grid-cols-3 gap-2 max-w-xs mx-auto">
        <div className="col-start-2">
          <button
            className="w-full h-14 bg-gray-700 hover:bg-gray-600 rounded-md flex items-center justify-center disabled:opacity-50"
            onClick={() => handleButtonClick('rotate')}
            disabled={gameOver || isPaused}
            aria-label="Rotate"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        
        <div className="col-start-1 col-span-1 row-start-2">
          <button
            className="w-full h-14 bg-gray-700 hover:bg-gray-600 rounded-md flex items-center justify-center disabled:opacity-50"
            onClick={() => handleButtonClick('left')}
            disabled={gameOver || isPaused}
            aria-label="Move Left"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        
        <div className="col-start-2 col-span-1 row-start-2">
          <button
            className="w-full h-14 bg-gray-700 hover:bg-gray-600 rounded-md flex items-center justify-center disabled:opacity-50"
            onClick={() => handleButtonClick('down')}
            disabled={gameOver || isPaused}
            aria-label="Move Down"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        
        <div className="col-start-3 col-span-1 row-start-2">
          <button
            className="w-full h-14 bg-gray-700 hover:bg-gray-600 rounded-md flex items-center justify-center disabled:opacity-50"
            onClick={() => handleButtonClick('right')}
            disabled={gameOver || isPaused}
            aria-label="Move Right"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        <div className="col-start-2 col-span-1 row-start-3">
          <button
            className="w-full h-14 bg-gray-700 hover:bg-gray-600 rounded-md flex items-center justify-center disabled:opacity-50"
            onClick={() => handleButtonClick('hardDrop')}
            disabled={gameOver || isPaused}
            aria-label="Hard Drop"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Game status and restart */}
      <div className="mt-4 text-center">
        {gameOver && (
          <button
            className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-md text-white font-medium"
            onClick={onRestart}
          >
            Play Again
          </button>
        )}
        
        {isPaused && (
          <div className="text-yellow-400 font-medium">
            Game Paused - Press P to resume
          </div>
        )}
      </div>
      
      {/* Keyboard controls help */}
      <div className="mt-6 text-sm text-gray-400">
        <h3 className="font-medium mb-2">Keyboard Controls:</h3>
        <ul className="grid grid-cols-2 gap-1">
          <li>← : Move Left</li>
          <li>→ : Move Right</li>
          <li>↓ : Move Down</li>
          <li>↑ : Rotate</li>
          <li>Space : Hard Drop</li>
          <li>P : Pause/Resume</li>
        </ul>
      </div>
    </div>
  );
};

export default GameControls;
