import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Group, Text } from 'react-konva';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const DEFAULT_CELL_SIZE = 30;
const MIN_CELL_SIZE = 15;
const PREVIEW_SIZE = 4;

const GameBoard = ({ gameState, onInput }) => {
  const stageRef = useRef(null);
  const containerRef = useRef(null);
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });
  const [cellSize, setCellSize] = useState(DEFAULT_CELL_SIZE);
  const [isMobile, setIsMobile] = useState(false);
  const { board, currentBlock, currentBlockPosition, ghostPosition, gameOver, isPaused, nextBlock } = gameState;
  
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
  }, [onInput, gameOver, isPaused, isMobile]);
  
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
  
  // Render next block preview for mobile overlay
  const renderNextBlockPreview = () => {
    if (!nextBlock || !isMobile) return null;
    
    const blocks = [];
    const previewCellSize = Math.max(cellSize * 0.6, 10); // Smaller cells for preview
    const { shape, color } = nextBlock;
    
    // Calculate offset to center the block in the preview
    const width = shape[0].length;
    const height = shape.length;
    const offsetX = Math.floor((PREVIEW_SIZE - width) / 2);
    const offsetY = Math.floor((PREVIEW_SIZE - height) / 2);
    
    // Background for preview
    blocks.push(
      <Rect
        key="preview-bg"
        x={0}
        y={0}
        width={PREVIEW_SIZE * previewCellSize}
        height={PREVIEW_SIZE * previewCellSize}
        fill="rgba(0, 0, 0, 0.5)"
        cornerRadius={4}
      />
    );
    
    // Preview grid
    for (let y = 0; y < PREVIEW_SIZE; y++) {
      for (let x = 0; x < PREVIEW_SIZE; x++) {
        blocks.push(
          <Rect
            key={`preview-grid-${x}-${y}`}
            x={x * previewCellSize}
            y={y * previewCellSize}
            width={previewCellSize}
            height={previewCellSize}
            stroke="#333"
            strokeWidth={1}
            fill="#111"
          />
        );
      }
    }
    
    // Next block
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          blocks.push(
            <Rect
              key={`preview-block-${x}-${y}`}
              x={(offsetX + x) * previewCellSize}
              y={(offsetY + y) * previewCellSize}
              width={previewCellSize}
              height={previewCellSize}
              fill={color}
              stroke="#000"
              strokeWidth={1}
              cornerRadius={2}
            />
          );
        }
      }
    }
    
    // Label
    blocks.push(
      <Text
        key="preview-label"
        x={PREVIEW_SIZE * previewCellSize / 2}
        y={-previewCellSize / 2}
        text="NEXT"
        fontSize={previewCellSize * 0.8}
        fontFamily="sans-serif"
        fill="white"
        align="center"
        verticalAlign="middle"
        width={PREVIEW_SIZE * previewCellSize}
        offsetX={PREVIEW_SIZE * previewCellSize / 2}
      />
    );
    
    return (
      <Group
        x={BOARD_WIDTH * cellSize - (PREVIEW_SIZE * previewCellSize) - 10}
        y={10}
      >
        {blocks}
      </Group>
    );
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
    if (!isMobile || gameOver) return null;
    
    const boardWidth = BOARD_WIDTH * cellSize;
    const boardHeight = BOARD_HEIGHT * cellSize;
    
    return (
      <Group>
        <Rect
          x={0}
          y={0}
          width={boardWidth}
          height={boardHeight}
          fill="rgba(0, 0, 0, 0.1)"
          opacity={0.3}
        />
        <Text
          x={boardWidth / 2}
          y={boardHeight / 2 - 30}
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
          y={boardHeight / 2}
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
          y={boardHeight / 2 + 30}
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
          {renderNextBlockPreview()}
          {renderGameOver()}
          {isPaused ? null : renderTouchHint()}
        </Layer>
      </Stage>
      {isMobile && !gameOver && !isPaused && (
        <div className="touch-controls-hint absolute top-2 left-0 right-0 text-center pointer-events-none">
          <div className="inline-block bg-black bg-opacity-50 text-white text-xs px-3 py-1 rounded-full">
            <span className="text-yellow-300 font-bold">↑ HARD DROP</span> • Tap to rotate
          </div>
        </div>
      )}
    </div>
  );
};

export default GameBoard;
