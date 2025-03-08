/**
 * Renderer.js
 * Provides rendering utilities for the BlockTris game using React Konva
 */

// Constants for rendering
export const CELL_SIZE = 30;
export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;
export const BOARD_BORDER = 4;
export const PREVIEW_SIZE = 4;

// Calculate board dimensions
export const BOARD_PIXEL_WIDTH = BOARD_WIDTH * CELL_SIZE + BOARD_BORDER * 2;
export const BOARD_PIXEL_HEIGHT = BOARD_HEIGHT * CELL_SIZE + BOARD_BORDER * 2;
export const PREVIEW_PIXEL_SIZE = PREVIEW_SIZE * CELL_SIZE + BOARD_BORDER * 2;

// Color constants
export const COLORS = {
  background: '#000000',
  border: '#333333',
  grid: '#222222',
  ghost: 'rgba(255, 255, 255, 0.2)',
  text: '#FFFFFF',
  scoreText: '#00FF00',
  levelText: '#FFFF00',
  linesText: '#00FFFF',
  gameOver: '#FF0000',
  specialEffect: '#FFFFFF'
};

/**
 * Renders a single cell of the game board
 * @param {Object} props - Cell properties
 * @returns {Object} Cell configuration for Konva
 */
export const renderCell = ({ x, y, color, opacity = 1, stroke = '#000000', strokeWidth = 1 }) => {
  return {
    x: x * CELL_SIZE + BOARD_BORDER,
    y: y * CELL_SIZE + BOARD_BORDER,
    width: CELL_SIZE,
    height: CELL_SIZE,
    fill: color,
    opacity,
    stroke,
    strokeWidth
  };
};

/**
 * Renders a block on the game board
 * @param {Object} block - Block definition
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {boolean} isGhost - Whether this is a ghost block
 * @returns {Array} Array of cell configurations for Konva
 */
export const renderBlock = (block, x, y, isGhost = false) => {
  if (!block) return [];
  
  const cells = [];
  const { shape, color } = block;
  
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col]) {
        cells.push(renderCell({
          x: x + col,
          y: y + row,
          color: color,
          opacity: isGhost ? 0.3 : 1,
          stroke: isGhost ? 'rgba(255, 255, 255, 0.5)' : '#000000',
          strokeWidth: isGhost ? 1 : 2
        }));
      }
    }
  }
  
  return cells;
};

/**
 * Renders the game board grid
 * @returns {Array} Array of line configurations for Konva
 */
export const renderGrid = () => {
  const lines = [];
  
  // Vertical lines
  for (let i = 0; i <= BOARD_WIDTH; i++) {
    lines.push({
      points: [
        i * CELL_SIZE + BOARD_BORDER,
        BOARD_BORDER,
        i * CELL_SIZE + BOARD_BORDER,
        BOARD_HEIGHT * CELL_SIZE + BOARD_BORDER
      ],
      stroke: COLORS.grid,
      strokeWidth: 1
    });
  }
  
  // Horizontal lines
  for (let i = 0; i <= BOARD_HEIGHT; i++) {
    lines.push({
      points: [
        BOARD_BORDER,
        i * CELL_SIZE + BOARD_BORDER,
        BOARD_WIDTH * CELL_SIZE + BOARD_BORDER,
        i * CELL_SIZE + BOARD_BORDER
      ],
      stroke: COLORS.grid,
      strokeWidth: 1
    });
  }
  
  return lines;
};

/**
 * Renders the game board border
 * @returns {Object} Rectangle configuration for Konva
 */
export const renderBoardBorder = () => {
  return {
    x: 0,
    y: 0,
    width: BOARD_PIXEL_WIDTH,
    height: BOARD_PIXEL_HEIGHT,
    stroke: COLORS.border,
    strokeWidth: BOARD_BORDER
  };
};

/**
 * Renders the preview box border
 * @returns {Object} Rectangle configuration for Konva
 */
export const renderPreviewBorder = () => {
  return {
    x: 0,
    y: 0,
    width: PREVIEW_PIXEL_SIZE,
    height: PREVIEW_PIXEL_SIZE,
    stroke: COLORS.border,
    strokeWidth: BOARD_BORDER
  };
};

/**
 * Renders a block in the preview box
 * @param {Object} block - Block definition
 * @returns {Array} Array of cell configurations for Konva
 */
export const renderPreviewBlock = (block) => {
  if (!block) return [];
  
  const { shape } = block;
  
  // Calculate offset to center the block in the preview
  const width = shape[0].length;
  const height = shape.length;
  const offsetX = Math.floor((PREVIEW_SIZE - width) / 2);
  const offsetY = Math.floor((PREVIEW_SIZE - height) / 2);
  
  return renderBlock(block, offsetX, offsetY);
};

/**
 * Renders a special effect animation
 * @param {string} effect - Effect type
 * @param {number} x - X position
 * @param {number} y - Y position
 * @returns {Object} Animation configuration for Konva
 */
export const renderSpecialEffect = (effect, x, y) => {
  switch (effect) {
    case 'explosion':
      return {
        type: 'circle',
        x: x * CELL_SIZE + BOARD_BORDER + CELL_SIZE / 2,
        y: y * CELL_SIZE + BOARD_BORDER + CELL_SIZE / 2,
        radius: CELL_SIZE * 1.5,
        fill: 'rgba(255, 165, 0, 0.5)',
        stroke: '#FFA500',
        strokeWidth: 2,
        animation: {
          duration: 0.5,
          easing: 'easeOut',
          to: {
            radius: CELL_SIZE * 3,
            opacity: 0
          }
        }
      };
      
    case 'colorClear':
      return {
        type: 'star',
        x: x * CELL_SIZE + BOARD_BORDER + CELL_SIZE / 2,
        y: y * CELL_SIZE + BOARD_BORDER + CELL_SIZE / 2,
        numPoints: 5,
        innerRadius: CELL_SIZE / 2,
        outerRadius: CELL_SIZE,
        fill: '#FF00FF',
        animation: {
          duration: 0.8,
          easing: 'easeInOut',
          to: {
            rotation: 180,
            scale: 2,
            opacity: 0
          }
        }
      };
      
    case 'mirror':
      return {
        type: 'rect',
        x: BOARD_BORDER,
        y: BOARD_BORDER,
        width: BOARD_WIDTH * CELL_SIZE,
        height: BOARD_HEIGHT * CELL_SIZE,
        fill: 'rgba(192, 192, 192, 0.3)',
        animation: {
          duration: 0.5,
          easing: 'easeIn',
          to: {
            opacity: 0
          }
        }
      };
      
    case 'quantum':
      return {
        type: 'rect',
        x: BOARD_BORDER,
        y: BOARD_BORDER,
        width: BOARD_WIDTH * CELL_SIZE,
        height: BOARD_HEIGHT * CELL_SIZE,
        fill: 'rgba(125, 249, 255, 0.3)',
        animation: {
          duration: 0.7,
          easing: 'easeInOut',
          to: {
            opacity: 0
          }
        }
      };
      
    default:
      return null;
  }
};

/**
 * Renders game over text
 * @returns {Object} Text configuration for Konva
 */
export const renderGameOverText = () => {
  return {
    x: BOARD_PIXEL_WIDTH / 2,
    y: BOARD_PIXEL_HEIGHT / 2,
    text: 'GAME OVER',
    fontSize: 36,
    fontFamily: 'Arial',
    fill: COLORS.gameOver,
    align: 'center',
    width: BOARD_PIXEL_WIDTH,
    offsetX: BOARD_PIXEL_WIDTH / 2,
    shadowColor: 'black',
    shadowBlur: 5,
    shadowOffset: { x: 2, y: 2 },
    shadowOpacity: 0.5
  };
};
