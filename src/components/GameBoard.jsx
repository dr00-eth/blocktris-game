import React, { useRef } from 'react';
import { Stage, Layer, Rect, Group, Text } from 'react-konva';

const CELL_SIZE = 30;
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

const GameBoard = ({ gameState }) => {
  const stageRef = useRef(null);
  const { board, currentBlock, currentBlockPosition, ghostPosition, gameOver } = gameState;
  
  // Draw the game board grid
  const renderGrid = () => {
    const grid = [];
    
    // Draw background grid
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        grid.push(
          <Rect
            key={`grid-${x}-${y}`}
            x={x * CELL_SIZE}
            y={y * CELL_SIZE}
            width={CELL_SIZE}
            height={CELL_SIZE}
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
              x={x * CELL_SIZE}
              y={y * CELL_SIZE}
              width={CELL_SIZE}
              height={CELL_SIZE}
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
              x={(posX + x) * CELL_SIZE}
              y={(posY + y) * CELL_SIZE}
              width={CELL_SIZE}
              height={CELL_SIZE}
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
              x={(posX + x) * CELL_SIZE}
              y={(posY + y) * CELL_SIZE}
              width={CELL_SIZE}
              height={CELL_SIZE}
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
    
    return (
      <Group>
        <Rect
          x={0}
          y={0}
          width={BOARD_WIDTH * CELL_SIZE}
          height={BOARD_HEIGHT * CELL_SIZE}
          fill="rgba(0, 0, 0, 0.7)"
        />
        <Rect
          x={BOARD_WIDTH * CELL_SIZE / 2 - 100}
          y={BOARD_HEIGHT * CELL_SIZE / 2 - 30}
          width={200}
          height={60}
          fill="#FF0000"
          cornerRadius={5}
        />
        <Text
          x={BOARD_WIDTH * CELL_SIZE / 2}
          y={BOARD_HEIGHT * CELL_SIZE / 2}
          text="GAME OVER"
          fontSize={24}
          fontFamily="'Press Start 2P', monospace"
          fill="white"
          align="center"
          verticalAlign="middle"
          width={200}
          height={60}
          offsetX={100}
          offsetY={30}
        />
      </Group>
    );
  };
  
  return (
    <div className="game-board">
      <Stage
        ref={stageRef}
        width={BOARD_WIDTH * CELL_SIZE}
        height={BOARD_HEIGHT * CELL_SIZE}
        className="border border-gray-700 rounded-md overflow-hidden shadow-lg"
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
