/**
 * gameUtils.js
 * Helper functions for the BlockTris game logic
 */

/**
 * Create an empty game board
 * @param {number} width - Board width
 * @param {number} height - Board height
 * @returns {Array} Empty game board
 */
export const createEmptyBoard = (width = 10, height = 20) => {
  return Array(height).fill().map(() => Array(width).fill(null));
};

/**
 * Check if a position is valid for a block
 * @param {Array} board - Game board
 * @param {Array} block - Block shape
 * @param {number} x - X position
 * @param {number} y - Y position
 * @returns {boolean} Whether the position is valid
 */
export const isValidPosition = (board, block, x, y) => {
  if (!block) return false;
  
  const { shape } = block;
  
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col]) {
        const boardX = x + col;
        const boardY = y + row;
        
        // Check if out of bounds
        if (
          boardX < 0 ||
          boardX >= board[0].length ||
          boardY < 0 ||
          boardY >= board.length
        ) {
          return false;
        }
        
        // Check if cell is already occupied
        if (boardY >= 0 && board[boardY][boardX] !== null) {
          return false;
        }
      }
    }
  }
  
  return true;
};

/**
 * Place a block on the board
 * @param {Array} board - Game board
 * @param {Object} block - Block object
 * @param {number} x - X position
 * @param {number} y - Y position
 * @returns {Array} Updated board
 */
export const placeBlock = (board, block, x, y) => {
  if (!block) return board;
  
  const { shape, color, id, special, effect } = block;
  const newBoard = JSON.parse(JSON.stringify(board));
  
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col]) {
        const boardX = x + col;
        const boardY = y + row;
        
        if (
          boardY >= 0 &&
          boardY < newBoard.length &&
          boardX >= 0 &&
          boardX < newBoard[0].length
        ) {
          newBoard[boardY][boardX] = {
            color,
            id,
            special,
            effect
          };
        }
      }
    }
  }
  
  return newBoard;
};

/**
 * Check for completed lines
 * @param {Array} board - Game board
 * @returns {Array} Array of completed line indices
 */
export const checkCompletedLines = (board) => {
  const completedLines = [];
  
  for (let row = 0; row < board.length; row++) {
    if (board[row].every(cell => cell !== null)) {
      completedLines.push(row);
    }
  }
  
  return completedLines;
};

/**
 * Remove completed lines from the board
 * @param {Array} board - Game board
 * @param {Array} lines - Array of line indices to remove
 * @returns {Array} Updated board
 */
export const removeLines = (board, lines) => {
  if (lines.length === 0) return board;
  
  const newBoard = JSON.parse(JSON.stringify(board));
  
  // Remove lines
  lines.forEach(line => {
    // Shift all lines above down
    for (let row = line; row > 0; row--) {
      newBoard[row] = [...newBoard[row - 1]];
    }
    
    // Add empty line at top
    newBoard[0] = Array(newBoard[0].length).fill(null);
  });
  
  return newBoard;
};

/**
 * Calculate score for completed lines
 * @param {number} lineCount - Number of lines completed
 * @param {number} level - Current level
 * @returns {number} Score
 */
export const calculateLineScore = (lineCount, level) => {
  const baseScores = [0, 100, 300, 500, 800];
  const score = baseScores[Math.min(lineCount, 4)] * (level + 1);
  return score;
};

/**
 * Calculate level based on lines cleared
 * @param {number} linesCleared - Total lines cleared
 * @returns {number} Level
 */
export const calculateLevel = (linesCleared) => {
  return Math.floor(linesCleared / 10);
};

/**
 * Calculate drop speed based on level
 * @param {number} level - Current level
 * @returns {number} Drop speed in milliseconds
 */
export const calculateDropSpeed = (level) => {
  // Base speed is 1000ms (1 second)
  // Each level reduces speed by 50ms, with a minimum of 100ms
  return Math.max(1000 - (level * 50), 100);
};

/**
 * Find the ghost position (where the block would land)
 * @param {Array} board - Game board
 * @param {Object} block - Block object
 * @param {number} x - Current X position
 * @param {number} y - Current Y position
 * @returns {number} Ghost Y position
 */
export const findGhostPosition = (board, block, x, y) => {
  if (!block) return y;
  
  let ghostY = y;
  
  // Move down until invalid position
  while (isValidPosition(board, block, x, ghostY + 1)) {
    ghostY++;
  }
  
  return ghostY;
};

/**
 * Check if the game is over
 * @param {Array} board - Game board
 * @returns {boolean} Whether the game is over
 */
export const isGameOver = (board) => {
  // Game is over if the top row has any blocks
  return board[0].some(cell => cell !== null);
};

/**
 * Apply gravity to the entire board, pulling all blocks down to fill gaps.
 * @param {Array} board - Game board
 * @returns {Array} Updated board after applying gravity
 */
export const applyGravity = (board) => {
  const newBoard = JSON.parse(JSON.stringify(board));
  const height = board.length;
  const width = board[0].length;

  for (let col = 0; col < width; col++) {
    // Collect all non-null cells in the column
    const columnCells = [];
    for (let row = 0; row < height; row++) {
      if (newBoard[row][col] !== null) {
        columnCells.push(newBoard[row][col]);
      }
    }
    // Fill the column from the bottom
    for (let row = height - 1; row >= 0; row--) {
      if (columnCells.length > 0) {
        newBoard[row][col] = columnCells.pop();
      } else {
        newBoard[row][col] = null;
      }
    }
  }
  return newBoard;
};

/**
 * Apply special block effect
 * @param {Array} board - Game board
 * @param {string} effect - Effect type
 * @param {number} x - X position
 * @param {number} y - Y position
 * @returns {Object} Updated board and score bonus
 */
export const applySpecialEffect = (board, effect, x, y) => {
  let newBoard = JSON.parse(JSON.stringify(board));
  let scoreBonus = 0;
  
  switch (effect) {
    case 'explosion':
      // Clear a 3x3 area around the block
      for (let row = y - 1; row <= y + 1; row++) {
        for (let col = x - 1; col <= x + 1; col++) {
          if (
            row >= 0 &&
            row < newBoard.length &&
            col >= 0 &&
            col < newBoard[0].length
          ) {
            if (newBoard[row][col] !== null) {
              newBoard[row][col] = null;
              scoreBonus += 10;
            }
          }
        }
      }
      break;
      
    case 'colorClear':
      // Clear all blocks of the same color as adjacent blocks
      const targetColor = newBoard[y][x]?.color;
      if (targetColor) {
        for (let row = 0; row < newBoard.length; row++) {
          for (let col = 0; col < newBoard[0].length; col++) {
            if (newBoard[row][col]?.color === targetColor) {
              newBoard[row][col] = null;
              scoreBonus += 5;
            }
          }
        }
      }
      break;
      
    case 'mirror':
      // Mirror the board horizontally
      for (let row = 0; row < newBoard.length; row++) {
        newBoard[row] = newBoard[row].reverse();
      }
      scoreBonus += 100;
      break;
      
    case 'quantum':
      // Randomly rearrange blocks on the board
      const blocks = [];
      const emptyPositions = [];
      
      // Collect all blocks and empty positions
      for (let row = 0; row < newBoard.length; row++) {
        for (let col = 0; col < newBoard[0].length; col++) {
          if (newBoard[row][col] !== null) {
            blocks.push(newBoard[row][col]);
            newBoard[row][col] = null;
          } else {
            emptyPositions.push({ row, col });
          }
        }
      }
      
      // Shuffle blocks
      for (let i = blocks.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
      }
      
      // Place blocks in random empty positions
      for (let i = 0; i < blocks.length; i++) {
        const position = emptyPositions[i];
        newBoard[position.row][position.col] = blocks[i];
      }
      
      scoreBonus += 200;
      break;

    case 'timeFreeze':
      // For timeFreeze, we don't modify the board
      // The effect will be handled by the game engine's drop speed calculation
      scoreBonus += 75;
      break;

    case 'multiplier':
      // For multiplier, we don't modify the board
      // The effect will be handled by the game engine's score calculation
      scoreBonus += 50;
      break;

    case 'gravity':
      newBoard = applyGravity(newBoard);
      scoreBonus = 50; // Bonus for using gravity
      break;
      
    default:
      // No effect
      break;
  }
  
  return { board: newBoard, scoreBonus };
};

/**
 * Create a hash of the game state for verification
 * @param {Object} gameState - Game state
 * @returns {string} Hash
 */
export const createGameHash = (gameState) => {
  const { seed, score, board, actions } = gameState;
  
  // Convert board to string
  const boardString = board.map(row => 
    row.map(cell => cell ? `${cell.id}` : '0').join('')
  ).join('');
  
  // Convert actions to string
  const actionsString = actions.map(action => 
    `${action.type}:${action.timestamp}`
  ).join(',');
  
  // Create hash input
  const hashInput = `${seed}:${score}:${boardString}:${actionsString}`;
  
  // Use a simple hash function for the prototype
  // In production, would use a cryptographic hash function
  let hash = 0;
  for (let i = 0; i < hashInput.length; i++) {
    const char = hashInput.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return hash.toString(16);
};
