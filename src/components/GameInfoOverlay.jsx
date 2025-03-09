import React from 'react';
import { Stage, Layer, Rect, Text, Group } from 'react-konva';

const GameInfoOverlay = ({ gameState, cellSize, boardWidth }) => {
  const { score, level, linesCleared, nextBlock } = gameState;
  
  // Calculate dimensions - more responsive
  const overlayHeight = Math.max(cellSize * 3, 60); // Min height of 60px
  const overlayWidth = boardWidth * cellSize;
  
  // More responsive text sizing based on cell size
  const textSize = Math.max(12, Math.min(14, cellSize * 0.45));
  const valueSize = Math.max(16, Math.min(18, cellSize * 0.6));
  
  // Calculate next block display position and size
  const blockPreviewSize = Math.max(cellSize * 2.5, 50); // Min size of 50px
  const blockPreviewX = overlayWidth - blockPreviewSize - cellSize * 0.5;
  const blockPreviewY = (overlayHeight - blockPreviewSize) / 2;
  
  // Render the next block
  const renderNextBlock = () => {
    if (!nextBlock) return null;
    
    const blocks = [];
    const { shape, color } = nextBlock;
    const previewCellSize = blockPreviewSize / 4;
    
    // Calculate offset to center the block
    const width = shape[0].length;
    const height = shape.length;
    const offsetX = Math.floor((4 - width) / 2);
    const offsetY = Math.floor((4 - height) / 2);
    
    // Background for preview with improved styling
    blocks.push(
      <Rect
        key="preview-bg"
        x={0}
        y={0}
        width={blockPreviewSize}
        height={blockPreviewSize}
        fill="rgba(0, 0, 0, 0.6)"
        cornerRadius={4}
        stroke="rgba(255, 255, 255, 0.2)"
        strokeWidth={1}
      />
    );
    
    // Preview grid
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
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
    
    // Label with improved styling
    blocks.push(
      <Text
        key="preview-label"
        x={blockPreviewSize / 2}
        y={-previewCellSize / 2}
        text="NEXT"
        fontSize={Math.max(12, previewCellSize * 0.8)}
        fontFamily="sans-serif"
        fontStyle="bold"
        fill="white"
        align="center"
        verticalAlign="middle"
        width={blockPreviewSize}
        offsetX={blockPreviewSize / 2}
      />
    );
    
    return (
      <Group x={blockPreviewX} y={blockPreviewY}>
        {blocks}
      </Group>
    );
  };
  
  // Responsive spacing calculations
  const scorePosX = cellSize * 0.8;
  const levelPosX = Math.min(cellSize * 4, overlayWidth * 0.3);
  const linesPosX = Math.min(cellSize * 7, overlayWidth * 0.6);
  
  return (
    <Group className="game-info-overlay">
      {/* Semi-transparent background with improved styling */}
      <Rect
        x={0}
        y={0}
        width={overlayWidth}
        height={overlayHeight}
        fill="rgba(20, 30, 40, 0.85)" // More opaque for better readability
        cornerRadius={[0, 0, 5, 5]}
        shadowColor="black"
        shadowBlur={3}
        shadowOffsetY={2}
        shadowOpacity={0.3}
        stroke="rgba(255, 255, 255, 0.1)"
        strokeWidth={1}
      />
      
      {/* Score with improved styling */}
      <Group x={scorePosX} y={(overlayHeight - valueSize - textSize) / 2}>
        <Text
          text="SCORE"
          fontSize={textSize}
          fill="#bbbbbb"
          fontFamily="sans-serif"
          fontStyle="bold"
        />
        <Text
          y={textSize * 1.2}
          text={score.toString()}
          fontSize={valueSize}
          fill="#4ade80" // Green
          fontFamily="sans-serif"
          fontStyle="bold"
          shadowColor="black"
          shadowBlur={2}
          shadowOffsetY={1}
          shadowOpacity={0.5}
        />
      </Group>
      
      {/* Level with improved styling */}
      <Group x={levelPosX} y={(overlayHeight - valueSize - textSize) / 2}>
        <Text
          text="LEVEL"
          fontSize={textSize}
          fill="#bbbbbb"
          fontFamily="sans-serif"
          fontStyle="bold"
        />
        <Text
          y={textSize * 1.2}
          text={level.toString()}
          fontSize={valueSize}
          fill="#facc15" // Yellow
          fontFamily="sans-serif"
          fontStyle="bold"
          shadowColor="black"
          shadowBlur={2}
          shadowOffsetY={1}
          shadowOpacity={0.5}
        />
      </Group>
      
      {/* Lines with improved styling */}
      <Group x={linesPosX} y={(overlayHeight - valueSize - textSize) / 2}>
        <Text
          text="LINES"
          fontSize={textSize}
          fill="#bbbbbb"
          fontFamily="sans-serif"
          fontStyle="bold"
        />
        <Text
          y={textSize * 1.2}
          text={linesCleared.toString()}
          fontSize={valueSize}
          fill="#38bdf8" // Blue
          fontFamily="sans-serif"
          fontStyle="bold"
          shadowColor="black"
          shadowBlur={2}
          shadowOffsetY={1}
          shadowOpacity={0.5}
        />
      </Group>
      
      {/* Next Block Preview */}
      {renderNextBlock()}
    </Group>
  );
};

export default GameInfoOverlay;