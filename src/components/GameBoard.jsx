import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Group, Text } from 'react-konva';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const DEFAULT_CELL_SIZE = 30;
const MIN_CELL_SIZE = 15;

const GameBoard = ({ gameState }) => {
  const stageRef = useRef(null);
  const containerRef = useRef(null);
  const [cellSize, setCellSize] = useState(DEFAULT_CELL_SIZE);
  const { board, currentBlock, currentBlockPosition, ghostPosition, gameOver } = gameState;
  
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
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);
  
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
  
  return (
    <div className="game-board w-full" ref={containerRef}>
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
          {renderGameOver()}
        </Layer>
      </Stage>
    </div>
  );
};

export default GameBoard;
