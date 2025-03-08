/**
 * BlockDefinitions.js
 * Defines all block types and their properties for the BlockTris game
 */

// Standard Tetris block shapes (I, J, L, O, S, T, Z)
export const STANDARD_BLOCKS = [
  {
    id: 0,
    name: 'I',
    color: '#00FFFF', // Cyan
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    special: false
  },
  {
    id: 1,
    name: 'J',
    color: '#0000FF', // Blue
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    special: false
  },
  {
    id: 2,
    name: 'L',
    color: '#FF7F00', // Orange
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0]
    ],
    special: false
  },
  {
    id: 3,
    name: 'O',
    color: '#FFFF00', // Yellow
    shape: [
      [1, 1],
      [1, 1]
    ],
    special: false
  },
  {
    id: 4,
    name: 'S',
    color: '#00FF00', // Green
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0]
    ],
    special: false
  },
  {
    id: 5,
    name: 'T',
    color: '#800080', // Purple
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    special: false
  },
  {
    id: 6,
    name: 'Z',
    color: '#FF0000', // Red
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0]
    ],
    special: false
  }
];

// Special blockchain-powered blocks
export const SPECIAL_BLOCKS = [
  {
    id: 7,
    name: 'Explosion',
    color: '#FFA500', // Orange
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 1, 0]
    ],
    special: true,
    effect: 'explosion',
    description: 'Clears a 3x3 area around where it lands'
  },
  {
    id: 8,
    name: 'ColorClear',
    color: '#FF00FF', // Magenta
    shape: [
      [1, 1, 1],
      [1, 0, 1],
      [1, 1, 1]
    ],
    special: true,
    effect: 'colorClear',
    description: 'Clears all blocks of the same color as adjacent blocks'
  },
  {
    id: 9,
    name: 'Mirror',
    color: '#C0C0C0', // Silver
    shape: [
      [1, 0, 1],
      [0, 1, 0],
      [1, 0, 1]
    ],
    special: true,
    effect: 'mirror',
    description: 'Mirrors the entire board horizontally'
  },
  {
    id: 10,
    name: 'Quantum',
    color: '#7DF9FF', // Electric Blue
    shape: [
      [1, 1, 1],
      [1, 0, 1],
      [0, 1, 0]
    ],
    special: true,
    effect: 'quantum',
    description: 'Randomly rearranges blocks on the board'
  },
  {
    id: 11,
    name: 'TimeFreeze',
    color: '#87CEEB', // Sky Blue
    shape: [
      [0, 1, 0],
      [1, 0, 1],
      [0, 1, 0]
    ],
    special: true,
    effect: 'timeFreeze',
    description: 'Slows down block falling speed temporarily'
  },
  {
    id: 12,
    name: 'Multiplier',
    color: '#FFD700', // Gold
    shape: [
      [1, 1, 0],
      [1, 0, 0],
      [1, 1, 1]
    ],
    special: true,
    effect: 'multiplier',
    description: 'Doubles points for the next 30 seconds'
  },
  {
    id: 13,
    name: 'Gravity',
    color: '#8B4513', // Brown
    shape: [
      [1, 1, 1],
      [1, 0, 1],
      [1, 1, 1]
    ],
    special: true,
    effect: 'gravity',
    description: 'Pulls all blocks above down after placement'
  },
];

// All blocks combined
export const ALL_BLOCKS = [...STANDARD_BLOCKS, ...SPECIAL_BLOCKS];

// Get block by ID
export const getBlockById = (id) => {
  return ALL_BLOCKS.find(block => block.id === id);
};

// Get a random standard block
export const getRandomStandardBlock = () => {
  const randomIndex = Math.floor(Math.random() * STANDARD_BLOCKS.length);
  return STANDARD_BLOCKS[randomIndex];
};

// Get a random special block
export const getRandomSpecialBlock = () => {
  const randomIndex = Math.floor(Math.random() * SPECIAL_BLOCKS.length);
  return SPECIAL_BLOCKS[randomIndex];
};

// Get a block based on a seed and index (for deterministic sequence)
export const getBlockFromSeed = (seed, index) => {
  // Use a simple hash function to generate a deterministic block ID
  const hash = (seed + index) % 100;
  
  // 15% chance of special block
  if (hash < 15) {
    const specialIndex = hash % SPECIAL_BLOCKS.length;
    return SPECIAL_BLOCKS[specialIndex];
  } else {
    const standardIndex = hash % STANDARD_BLOCKS.length;
    return STANDARD_BLOCKS[standardIndex];
  }
};

// Rotate a block matrix clockwise
export const rotateBlockClockwise = (shape) => {
  const size = shape.length;
  const rotated = Array(size).fill().map(() => Array(size).fill(0));
  
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      rotated[x][size - 1 - y] = shape[y][x];
    }
  }
  
  return rotated;
};

// Rotate a block matrix counter-clockwise
export const rotateBlockCounterClockwise = (shape) => {
  const size = shape.length;
  const rotated = Array(size).fill().map(() => Array(size).fill(0));
  
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      rotated[size - 1 - x][y] = shape[y][x];
    }
  }
  
  return rotated;
};
