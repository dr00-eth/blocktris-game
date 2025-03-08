import React, { useEffect, useState, useRef } from 'react';

const GameControls = ({ onInput, gameOver, isPaused, onRestart, useOverlayControls = false }) => {
  const [touchControls, setTouchControls] = useState(false);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const touchAreaRef = useRef(null);

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

  // Handle swipe gestures (only if not using overlay controls)
  useEffect(() => {
    if (!touchControls || gameOver || isPaused || !touchAreaRef.current || useOverlayControls) return;

    const touchArea = touchAreaRef.current;
    
    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    };
    
    const handleTouchEnd = (e) => {
      if (e.changedTouches.length === 0) return;
      
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      
      // Minimum distance for a swipe
      const minSwipeDistance = 30;
      
      // Determine if horizontal or vertical swipe based on which delta is larger
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > minSwipeDistance) {
          if (deltaX > 0) {
            onInput('right');
          } else {
            onInput('left');
          }
        }
      } else {
        // Vertical swipe
        if (Math.abs(deltaY) > minSwipeDistance) {
          if (deltaY > 0) {
            onInput('down');
          } else {
            onInput('hardDrop');
          }
        }
      }
    };
    
    touchArea.addEventListener('touchstart', handleTouchStart);
    touchArea.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      touchArea.removeEventListener('touchstart', handleTouchStart);
      touchArea.removeEventListener('touchend', handleTouchEnd);
    };
  }, [touchControls, onInput, gameOver, isPaused, useOverlayControls]);

  // Handle button click
  const handleButtonClick = (inputType) => {
    if (gameOver || isPaused) return;
    onInput(inputType);
  };

  return (
    <div className="game-controls mt-2">
      {/* Swipe area for touch gestures - only show if not using overlay controls */}
      {touchControls && !useOverlayControls && (
        <div 
          ref={touchAreaRef}
          className="touch-swipe-area w-full h-20 bg-gray-800 bg-opacity-30 rounded-md mb-4 flex items-center justify-center"
        >
          <p className="text-gray-400 text-sm">Swipe area: ← → ↑ ↓</p>
        </div>
      )}

      {/* Mobile touch controls */}
      <div className="touch-controls grid grid-cols-3 gap-2 max-w-xs mx-auto">
        <div className="col-start-2">
          <button
            className="w-full h-12 bg-gray-700 hover:bg-gray-600 rounded-md flex items-center justify-center disabled:opacity-50"
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
            className="w-full h-12 bg-gray-700 hover:bg-gray-600 rounded-md flex items-center justify-center disabled:opacity-50"
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
            className="w-full h-12 bg-gray-700 hover:bg-gray-600 rounded-md flex items-center justify-center disabled:opacity-50"
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
            className="w-full h-12 bg-gray-700 hover:bg-gray-600 rounded-md flex items-center justify-center disabled:opacity-50"
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
            className="w-full h-12 bg-yellow-600 hover:bg-yellow-500 rounded-md flex items-center justify-center disabled:opacity-50"
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
        {gameOver && !useOverlayControls && (
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
      
      {/* Keyboard controls help - only show on desktop */}
      {!touchControls && (
        <div className="mt-4 text-sm text-gray-400">
          <h3 className="font-medium mb-2">Controls:</h3>
          <ul className="grid grid-cols-2 gap-1">
            <li>← : Move Left</li>
            <li>→ : Move Right</li>
            <li>↓ : Move Down</li>
            <li>↑ : Rotate</li>
            <li>Space : Hard Drop</li>
            <li>P : Pause/Resume</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default GameControls;
