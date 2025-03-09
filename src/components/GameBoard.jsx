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
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });
  const [cellSize, setCellSize] = useState(DEFAULT_CELL_SIZE);
  const [isMobile, setIsMobile] = useState(false);
  
  // Control the visibility of the help/controls
  const [showControlsHint, setShowControlsHint] = useState(true);
  const [showHelpIcon, setShowHelpIcon] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  
  const { board, currentBlock, currentBlockPosition, ghostPosition, gameOver, isPaused } = gameState;
  
  // Adjust cell size based on screen width
  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) return;
      
      const containerWidth = containerRef.current.clientWidth;
      const maxBoardWidth = Math.min(containerWidth, 600); // Cap at 600px max width
      
      // Calculate cell size based on available width
      const newCellSize = Math.max(Math.floor(maxBoardWidth / BOARD_WIDTH), MIN_CELL_SIZE);
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
  
  // Handle touch controls
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
      
      // Minimum distance for a swipe
      const minSwipeDistance = 30;
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
    notification.className = 'hard-drop-notification';
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
  
  // Render touch controls hint overlay (only at beginning)
  const renderTouchHint = () => {
    if (!isMobile || gameOver || !showControlsHint) return null;
    
    const boardWidth = BOARD_WIDTH * cellSize;
    const boardHeight = BOARD_HEIGHT * cellSize;
    
    return (
      <Group className="controls-hint">
        <Rect
          x={boardWidth / 2 - 140}
          y={boardHeight / 2 - 70}
          width={280}
          height={140}
          fill="rgba(0, 0, 0, 0.7)"
          cornerRadius={10}
        />
        <Text
          x={boardWidth / 2}
          y={boardHeight / 2 - 50}
          text="How to Play:"
          fontSize={16}
          fontFamily="sans-serif"
          fontStyle="bold"
          fill="white"
          align="center"
          verticalAlign="middle"
          width={boardWidth}
          offsetX={boardWidth / 2}
        />
        <Text
          x={boardWidth / 2}
          y={boardHeight / 2 - 20}
          text="Swipe ← → to move"
          fontSize={14}
          fontFamily="sans-serif"
          fill="white"
          align="center"
          verticalAlign="middle"
          width={boardWidth}
          offsetX={boardWidth / 2}
        />
        <Text
          x={boardWidth / 2}
          y={boardHeight / 2 + 10}
          text="Tap to rotate"
          fontSize={14}
          fontFamily="sans-serif"
          fill="white"
          align="center"
          verticalAlign="middle"
          width={boardWidth}
          offsetX={boardWidth / 2}
        />
        <Text
          x={boardWidth / 2}
          y={boardHeight / 2 + 40}
          text="Swipe ↑ for HARD DROP"
          fontSize={16}
          fontFamily="sans-serif"
          fontStyle="bold"
          fill="#FFD700"
          align="center"
          verticalAlign="middle"
          width={boardWidth}
          offsetX={boardWidth / 2}
        />
      </Group>
    );
  };
  
  return (
    <div className="game-board w-full relative" ref={containerRef}>
      <Stage
        ref={stageRef}
        width={BOARD_WIDTH * cellSize}
        height={BOARD_HEIGHT * cellSize}
        className="border border-gray-700 rounded-md overflow-hidden shadow-lg mx-auto"
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
          {renderTouchHint()}
        </Layer>
      </Stage>
      
      {/* Help Icon (appears after control hints disappear) */}
      {showHelpIcon && isMobile && !gameOver && (
        <button 
          className="help-icon" 
          onClick={toggleHelpModal}
          aria-label="Game Controls Help"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      )}
      
      {/* Help Modal */}
      {showHelpModal && (
        <div className="help-modal">
          <div className="help-modal-content">
            <h3>Game Controls</h3>
            <ul>
              <li><strong>Swipe Left/Right:</strong> Move piece</li>
              <li><strong>Tap:</strong> Rotate piece</li>
              <li><strong>Swipe Down:</strong> Move down</li>
              <li><strong>Swipe Up:</strong> Hard drop</li>
            </ul>
            <button onClick={toggleHelpModal}>Close</button>
          </div>
        </div>
      )}
      
      {/* Hard Drop Notification is handled by CSS/JS */}
    </div>
  );
};

export default GameBoard;