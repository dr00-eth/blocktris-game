import React from 'react';
import { Stage, Layer, Rect } from 'react-konva';

const CELL_SIZE = 25;
const PREVIEW_SIZE = 4;

const BlockPreview = ({ nextBlock }) => {
  // Render the next block
  const renderNextBlock = () => {
    if (!nextBlock) return [];
    
    const { shape, color } = nextBlock;
    const blocks = [];
    
    // Calculate offset to center the block in the preview
    const width = shape[0].length;
    const height = shape.length;
    const offsetX = Math.floor((PREVIEW_SIZE - width) / 2);
    const offsetY = Math.floor((PREVIEW_SIZE - height) / 2);
    
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          blocks.push(
            <Rect
              key={`preview-${x}-${y}`}
              x={(offsetX + x) * CELL_SIZE}
              y={(offsetY + y) * CELL_SIZE}
              width={CELL_SIZE}
              height={CELL_SIZE}
              fill={color}
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
  
  // Render the preview grid
  const renderPreviewGrid = () => {
    const grid = [];
    
    for (let y = 0; y < PREVIEW_SIZE; y++) {
      for (let x = 0; x < PREVIEW_SIZE; x++) {
        grid.push(
          <Rect
            key={`preview-grid-${x}-${y}`}
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
  
  return (
    <div className="block-preview bg-gray-800 p-4 rounded-md">
      <h3 className="text-lg font-medium mb-2 text-center">Next Block</h3>
      <div className="flex justify-center">
        <Stage
          width={PREVIEW_SIZE * CELL_SIZE}
          height={PREVIEW_SIZE * CELL_SIZE}
          className="border border-gray-700 rounded-md overflow-hidden"
        >
          <Layer>
            {renderPreviewGrid()}
            {renderNextBlock()}
          </Layer>
        </Stage>
      </div>
      
      {nextBlock && nextBlock.special && (
        <div className="mt-2 text-center">
          <span className="text-xs font-medium px-2 py-1 bg-purple-700 rounded-full">
            {nextBlock.name} - Special
          </span>
          {nextBlock.effect && (
            <p className="text-xs mt-1 text-gray-400">{nextBlock.description}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default BlockPreview;
