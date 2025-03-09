import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Group, Text } from 'react-konva';
import GameInfoOverlay from './GameInfoOverlay';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const DEFAULT_CELL_SIZE = 30;
const MIN_CELL_SIZE = 15;

const GameBoard = ({ gameState, onInput }) => {
  const stageRef = useRef(null);
  const containerRef = useRef(null);
  const touchAreaRef = useRef(null); // Reference for the dedicated touch area
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });
  const [cellSize, setCellSize] = useState(DEFAULT_CELL_SIZE);
  const [isMobile, setIsMobile] = useState(false);
  const [touchControls, setTouchControls] = useState(false);

  // Control the visibility of the help/controls
  const [showControlsHint, setShowControlsHint] = useState(true);
  const [showHelpIcon, setShowHelpIcon] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const { board, currentBlock, currentBlockPosition, ghostPosition, gameOver, isPaused } = gameState;

  // Adjust cell size based on screen size and ensure proper centering
  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) return;

      // Get container width
      const containerWidth = containerRef.current.clientWidth;
      // Use 75% of viewport height for better vertical usage
      const containerHeight = window.innerHeight * 0.75;

      // Calculate cell size based on both width and height constraints
      const cellSizeFromWidth = Math.floor(containerWidth / BOARD_WIDTH);
      const cellSizeFromHeight = Math.floor(containerHeight / BOARD_HEIGHT);

      // Use the smaller of the two to ensure board fits
      const newCellSize = Math.max(Math.min(cellSizeFromWidth, cellSizeFromHeight), MIN_CELL_SIZE);

      setCellSize(newCellSize);
    };

    // Initial calculation
    updateDimensions();

    // Update on resize
    window.addEventListener('resize', updateDimensions);

    // Check if we're on a mobile device
    const checkMobile = () => {
      const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      setIsMobile(isMobileDevice);
      setTouchControls(isMobileDevice); // Enable touch controls for mobile devices
    };

    checkMobile();

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Show controls hint briefly at the start
  useEffect(() => {
    // Show the controls hint for 5 seconds when the game starts
    if (showControlsHint) {
      const timer = setTimeout(() => {
        setShowControlsHint(false);
        // After hiding controls, show the help icon
        setShowHelpIcon(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [showControlsHint]);

  // Handle touch controls for the dedicated swipe area
  useEffect(() => {
    if (!touchAreaRef.current || !onInput || gameOver || !touchControls) return;

    const touchArea = touchAreaRef.current;

    const handleTouchStart = (e) => {
      if (gameOver || isPaused) return;

      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      };
    };

    const handleTouchEnd = (e) => {
      if (gameOver || isPaused) return;
      if (e.changedTouches.length === 0) return;

      // Hide controls hint after first interaction
      if (showControlsHint) {
        setShowControlsHint(false);
        setShowHelpIcon(true);
      }

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const deltaTime = Date.now() - touchStartRef.current.time;

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

            // Show temporary hard drop notification
            showHardDropNotification();
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
  }, [onInput, gameOver, isPaused, touchControls, showControlsHint]);

  // Also add touch controls to the game board for tap to rotate
  useEffect(() => {
    if (!containerRef.current || !onInput || gameOver || !isMobile) return;

    const container = containerRef.current;

    const handleTouchStart = (e) => {
      if (gameOver || isPaused) return;

      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      };
    };

    const handleTouchEnd = (e) => {
      if (gameOver || isPaused) return;
      if (e.changedTouches.length === 0) return;

      // Hide controls hint after first interaction
      if (showControlsHint) {
        setShowControlsHint(false);
        setShowHelpIcon(true);
      }

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const deltaTime = Date.now() - touchStartRef.current.time;

      // Maximum time for a tap (ms)
      const maxTapTime = 300;
      // Maximum movement for a tap
      const maxTapMovement = 10;

      // Check if it's a tap
      if (deltaTime < maxTapTime &&
        Math.abs(deltaX) < maxTapMovement &&
        Math.abs(deltaY) < maxTapMovement) {
        // It's a tap - rotate the piece
        onInput('rotate');
        return;
      }
    };

    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onInput, gameOver, isPaused, isMobile, showControlsHint]);

  // Function to show hard drop notification temporarily
  const showHardDropNotification = () => {
    const notification = document.createElement('div');
    notification.className = 'hard-drop-notification bg-yellow-600 text-white font-bold px-4 py-2 rounded-full shadow-lg';
    notification.textContent = '↑ HARD DROP!';

    if (containerRef.current) {
      containerRef.current.appendChild(notification);

      // Remove after animation
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 1000);
    }
  };

  // Toggle help modal
  const toggleHelpModal = () => {
    setShowHelpModal(!showHelpModal);
  };

  // Draw the game board grid
  const renderGrid = () => {
    const grid = [];

    // Draw background grid
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        grid.push(
          <Rect
            key={`grid-${x}-${y}`}
            x={x * cellSize}
            y={y * cellSize}
            width={cellSize}
            height={cellSize}
            stroke="#333"
            strokeWidth={1}
            fill="#111"
          />
        );
      }
    }

    return grid;
  };

  // Render placed blocks on the board
  const renderPlacedBlocks = () => {
    const blocks = [];

    if (!board || !board.length) return blocks;

    for (let y = 0; y < board.length; y++) {
      for (let x = 0; x < board[y].length; x++) {
        const cell = board[y][x];
        if (cell) {
          blocks.push(
            <Rect
              key={`block-${x}-${y}`}
              x={x * cellSize}
              y={y * cellSize}
              width={cellSize}
              height={cellSize}
              fill={cell.color || '#3366FF'}
              stroke="#000"
              strokeWidth={1}
              cornerRadius={2}
            />
          );
        }
      }
    }

    return blocks;
  };

  // Render the ghost block (preview of where the block will land)
  const renderGhostBlock = () => {
    const blocks = [];

    if (!currentBlock || !ghostPosition || gameOver) return blocks;

    const { shape, color } = currentBlock;
    const { x: posX, y: posY } = ghostPosition;

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          blocks.push(
            <Rect
              key={`ghost-${x}-${y}`}
              x={(posX + x) * cellSize}
              y={(posY + y) * cellSize}
              width={cellSize}
              height={cellSize}
              fill={color}
              opacity={0.2}
              stroke="#FFFFFF"
              strokeWidth={1}
              cornerRadius={2}
            />
          );
        }
      }
    }

    return blocks;
  };

  // Render the current active block
  const renderCurrentBlock = () => {
    const blocks = [];

    if (!currentBlock || !currentBlockPosition || gameOver) return blocks;

    const { shape, color } = currentBlock;
    const { x: posX, y: posY } = currentBlockPosition;

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          blocks.push(
            <Rect
              key={`current-${x}-${y}`}
              x={(posX + x) * cellSize}
              y={(posY + y) * cellSize}
              width={cellSize}
              height={cellSize}
              fill={color || '#3366FF'}
              stroke="#000"
              strokeWidth={1}
              cornerRadius={2}
            />
          );
        }
      }
    }

    return blocks;
  };

  // Render game over overlay
  const renderGameOver = () => {
    if (!gameOver) return null;

    const boardWidth = BOARD_WIDTH * cellSize;
    const boardHeight = BOARD_HEIGHT * cellSize;
    const fontSize = Math.max(16, Math.floor(cellSize * 0.8));

    return (
      <Group>
        <Rect
          x={0}
          y={0}
          width={boardWidth}
          height={boardHeight}
          fill="rgba(0, 0, 0, 0.7)"
        />
        <Rect
          x={boardWidth / 2 - (boardWidth * 0.4)}
          y={boardHeight / 2 - (fontSize * 1.5)}
          width={boardWidth * 0.8}
          height={fontSize * 3}
          fill="#FF0000"
          cornerRadius={5}
        />
        <Text
          x={boardWidth / 2}
          y={boardHeight / 2}
          text="GAME OVER"
          fontSize={fontSize}
          fontFamily="'Press Start 2P', monospace"
          fill="white"
          align="center"
          verticalAlign="middle"
          width={boardWidth * 0.8}
          height={fontSize * 3}
          offsetX={boardWidth * 0.4}
          offsetY={fontSize * 1.5}
        />
      </Group>
    );
  };

  // Render touch controls hint overlay
  const renderTouchHint = () => {
    if (!isMobile || gameOver || !showControlsHint) return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70">
        <div className="bg-gray-800 p-6 rounded-lg max-w-sm w-5/6 text-center">
          <h3 className="text-xl font-bold text-green-400 mb-4">How to Play</h3>

          <div className="space-y-4 mb-6">
            <div className="flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <p className="text-white">Swipe left/right to move</p>
            </div>

            <div className="flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-white">Tap screen to rotate</p>
            </div>

            <div className="flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 11l7-7 7 7M5 19l7-7 7 7" />
              </svg>
              <p className="text-white font-bold">Swipe UP for HARD DROP</p>
            </div>
          </div>

          <button
            onClick={() => {
              setShowControlsHint(false);
              setShowHelpIcon(true);
            }}
            className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    );
  };

  // Calculate the width and height of the stage
  const stageWidth = BOARD_WIDTH * cellSize;
  const stageHeight = BOARD_HEIGHT * cellSize;

  return (
    <div className="game-container flex flex-col items-center w-full">
      {/* Make sure game-board div takes full width and centers content */}
      <div className="game-board w-full flex flex-col items-center" ref={containerRef}>
        <div className="flex justify-center w-full">
          <Stage
            ref={stageRef}
            width={stageWidth}
            height={stageHeight}
            className="border border-gray-700 rounded-md overflow-hidden shadow-lg"
          >
            <Layer>
              <Group>{renderGrid()}</Group>
              <Group>{renderGhostBlock()}</Group>
              <Group>{renderPlacedBlocks()}</Group>
              <Group>{renderCurrentBlock()}</Group>

              {/* Game Info Overlay */}
              <GameInfoOverlay
                gameState={gameState}
                cellSize={cellSize}
                boardWidth={BOARD_WIDTH}
              />

              {renderGameOver()}
            </Layer>
          </Stage>
        </div>

        {/* Improved Game Controls Container - keep centered with the board */}
        <div className="game-controls-container flex items-center justify-between mt-4 mb-4 w-full max-w-xs px-2">
          {/* Touch swipe area - with proper width constraints */}
          {touchControls && !gameOver && !isPaused && (
            <>
              <div
                ref={touchAreaRef}
                className="touch-swipe-area-inline relative overflow-hidden border border-dashed border-gray-600 rounded-full h-12 w-4/5 flex items-center justify-center bg-black bg-opacity-30"
              >
                <div className="absolute inset-0 swipe-hint-animation"></div>
                <div className="flex items-center justify-center space-x-4 z-10">
                  <span className="text-gray-400">←</span>
                  <span className="text-gray-400 font-bold">SWIPE</span>
                  <span className="text-gray-400">→</span>
                </div>
              </div>

              {/* Help Icon with margin */}
              {showHelpIcon && (
                <button
                  className="help-icon bg-gray-700 hover:bg-gray-600 rounded-full w-12 h-12 flex items-center justify-center ml-4"
                  onClick={toggleHelpModal}
                  aria-label="Game Controls Help"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              )}
            </>
          )}
        </div>

        {/* Improved Help Modal */}
        {showHelpModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-5 shadow-lg max-w-xs w-full mx-4">
              <h3 className="text-xl text-green-400 font-bold mb-4 text-center">Game Controls</h3>
              <ul className="space-y-3 mb-5">
                <li className="flex justify-between items-center border-b border-gray-700 pb-2">
                  <span className="text-gray-300">Swipe Left/Right</span>
                  <span className="font-bold text-white">Move piece</span>
                </li>
                <li className="flex justify-between items-center border-b border-gray-700 pb-2">
                  <span className="text-gray-300">Tap</span>
                  <span className="font-bold text-white">Rotate piece</span>
                </li>
                <li className="flex justify-between items-center border-b border-gray-700 pb-2">
                  <span className="text-gray-300">Swipe Down</span>
                  <span className="font-bold text-white">Soft drop</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-gray-300">Swipe Up</span>
                  <span className="font-bold text-white">Hard drop</span>
                </li>
              </ul>
              <button
                onClick={toggleHelpModal}
                className="w-full py-3 bg-green-600 hover:bg-green-500 transition-colors rounded-md font-bold text-white"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Render the touch hint overlay */}
      {renderTouchHint()}
    </div>
  );
};

export default GameBoard;