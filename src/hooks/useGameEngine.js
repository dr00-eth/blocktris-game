import { useState, useEffect, useCallback, useRef } from 'react';
import { getBlockFromSeed } from '../engine/BlockDefinitions';
import { 
  createEmptyBoard, 
  isValidPosition, 
  placeBlock, 
  checkCompletedLines, 
  removeLines, 
  calculateLineScore,
  calculateLevel,
  calculateDropSpeed,
  findGhostPosition,
  isGameOver,
  applySpecialEffect
} from '../utils/gameUtils';

export function useGameEngine(gameId, seed) {
  // Game state
  const [gameState, setGameState] = useState({
    board: createEmptyBoard(),
    currentBlock: null,
    currentBlockPosition: { x: 0, y: 0 },
    ghostPosition: { x: 0, y: 0 },
    nextBlock: null,
    score: 0,
    linesCleared: 0,
    level: 1,
    gameOver: false,
    actions: [],
    timeFreezeUntil: 0,
    scoreMultiplierUntil: 0 // Add multiplier state
  });
  
  // Game loop references
  const gameLoopRef = useRef(null);
  const lastDropTimeRef = useRef(Date.now());
  const blockIndexRef = useRef(0);
  const gameStateRef = useRef(gameState);
  
  // Update the ref whenever gameState changes
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);
  
  // Create refs to break circular dependencies
  const lockBlockRef = useRef(null);
  const moveDownRef = useRef(null);
  const startGameLoopRef = useRef(null);
  
  // Lock the current block in place
  const lockBlock = useCallback(() => {
    const state = gameStateRef.current;
    let { board, currentBlock, currentBlockPosition, score, linesCleared } = state;
    
    // Check if currentBlock is null
    if (!currentBlock) return;
    
    // Place block on board
    board = placeBlock(board, currentBlock, currentBlockPosition.x, currentBlockPosition.y);
    
    // Apply special effect if any
    if (currentBlock.special && currentBlock.effect) {
      const effectResult = applySpecialEffect(board, currentBlock.effect, currentBlockPosition.x, currentBlockPosition.y);
      board = effectResult.board;
      
      // Apply score multiplier if active
      const now = Date.now();
      if (state.scoreMultiplierUntil > now) {
        score += effectResult.scoreBonus * 2;
      } else {
        score += effectResult.scoreBonus;
      }
      
      // Handle timeFreeze effect
      if (currentBlock.effect === 'timeFreeze') {
        const freezeDuration = 10000; // 10 seconds
        setGameState(prev => ({
          ...prev,
          timeFreezeUntil: Date.now() + freezeDuration
        }));
      }
      
      // Handle multiplier effect
      if (currentBlock.effect === 'multiplier') {
        const multiplierDuration = 30000; // 30 seconds
        setGameState(prev => ({
          ...prev,
          scoreMultiplierUntil: Date.now() + multiplierDuration
        }));
      }
    }
    
    // Check for completed lines
    const completedLines = checkCompletedLines(board);
    const newLinesCleared = linesCleared + completedLines.length;
    const newLevel = calculateLevel(newLinesCleared);
    const lineScore = calculateLineScore(completedLines.length, newLevel);
    
    // Apply score multiplier to line clear score if active
    const now = Date.now();
    if (state.scoreMultiplierUntil > now) {
      score += lineScore * 2;
    } else {
      score += lineScore;
    }
    
    // Remove completed lines
    board = removeLines(board, completedLines);
    
    // Check if game is over
    const gameIsOver = isGameOver(board);
    
    if (!gameIsOver) {
      // Get next block
      const nextBlock = getBlockFromSeed(seed, blockIndexRef.current++);
      
      // Make sure nextBlock exists before accessing its properties
      if (!state.nextBlock) {
        // If nextBlock is null, create a new game state with the next block
        setGameState(prev => ({
          ...prev,
          board,
          currentBlock: nextBlock,
          currentBlockPosition: { x: Math.floor((10 - nextBlock.shape[0].length) / 2), y: 0 },
          ghostPosition: { x: Math.floor((10 - nextBlock.shape[0].length) / 2), y: 0 },
          nextBlock: getBlockFromSeed(seed, blockIndexRef.current++),
          score,
          linesCleared: newLinesCleared,
          level: newLevel
        }));
      } else {
        // Set initial position for new block
        const initialX = Math.floor((10 - state.nextBlock.shape[0].length) / 2);
        const initialY = 0;
        
        // Calculate ghost position
        const ghostY = findGhostPosition(board, state.nextBlock, initialX, initialY);
        
        // Update game state
        setGameState(prev => ({
          ...prev,
          board,
          currentBlock: prev.nextBlock,
          currentBlockPosition: { x: initialX, y: initialY },
          ghostPosition: { x: initialX, y: ghostY },
          nextBlock,
          score,
          linesCleared: newLinesCleared,
          level: newLevel
        }));
      }
    } else {
      // Game over
      setGameState(prev => ({
        ...prev,
        board,
        score,
        linesCleared: newLinesCleared,
        level: newLevel,
        gameOver: true
      }));
      
      // Stop game loop
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    }
  }, [seed]);
  
  // Move current block down
  const moveDown = useCallback(() => {
    const state = gameStateRef.current;
    if (state.gameOver) return false;
    
    const { currentBlock, currentBlockPosition, board } = state;
    
    // Check if currentBlock is null
    if (!currentBlock) return false;
    
    const newY = currentBlockPosition.y + 1;
    
    // Check if can move down
    if (isValidPosition(board, currentBlock, currentBlockPosition.x, newY)) {
      // Update position
      setGameState(prev => ({
        ...prev,
        currentBlockPosition: { ...prev.currentBlockPosition, y: newY }
      }));
      return true;
    } else {
      // Lock block in place using the ref
      if (lockBlockRef.current) {
        lockBlockRef.current();
      }
      return false;
    }
  }, []);
  
  // Start game loop
  const startGameLoop = useCallback(() => {
    const state = gameStateRef.current;
    // Don't start the game loop if the game state isn't properly initialized
    if (!state.currentBlock || !state.nextBlock) {
      console.warn('Game loop not started: blocks not initialized');
      return;
    }
    
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
    
    gameLoopRef.current = setInterval(() => {
      const now = Date.now();
      const state = gameStateRef.current;
      let dropSpeed = calculateDropSpeed(state.level);
      
      // Apply time freeze effect if active
      if (state.timeFreezeUntil > now) {
        dropSpeed *= 2; // Slow down the drop speed
      }
      
      if (now - lastDropTimeRef.current > dropSpeed) {
        // Use the moveDown ref to avoid circular dependencies
        if (moveDownRef.current) {
          moveDownRef.current();
        }
        lastDropTimeRef.current = now;
      }
    }, 16); // ~60fps
  }, []);
  
  // Store the functions in refs to break circular dependencies
  // Use useEffect to ensure these are only set once after the functions are defined
  useEffect(() => {
    lockBlockRef.current = lockBlock;
    moveDownRef.current = moveDown;
    startGameLoopRef.current = startGameLoop;
  }, [lockBlock, moveDown, startGameLoop]);
  
  // Initialize game
  useEffect(() => {
    if (!gameId || !seed) return;
    
    // Generate first blocks
    const firstBlock = getBlockFromSeed(seed, blockIndexRef.current++);
    const nextBlock = getBlockFromSeed(seed, blockIndexRef.current++);
    
    // Make sure blocks are valid before proceeding
    if (!firstBlock || !nextBlock) {
      console.error('Failed to initialize blocks with seed:', seed);
      return;
    }
    
    // Set initial position
    const initialX = Math.floor((10 - firstBlock.shape[0].length) / 2);
    const initialY = 0;
    
    // Calculate ghost position
    const ghostY = findGhostPosition(
      gameState.board, 
      firstBlock, 
      initialX, 
      initialY
    );
    
    // Update game state
    setGameState(prev => ({
      ...prev,
      currentBlock: firstBlock,
      currentBlockPosition: { x: initialX, y: initialY },
      ghostPosition: { x: initialX, y: ghostY },
      nextBlock: nextBlock
    }));
    
    // Start game loop after a short delay to ensure state is updated
    setTimeout(() => {
      if (startGameLoopRef.current) {
        startGameLoopRef.current();
      }
    }, 100);
    
    // Cleanup on unmount
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameId, seed]);
  
  // Handle user input
  const handleInput = useCallback((inputType) => {
    const state = gameStateRef.current;
    if (state.gameOver) return false;
    
    const { currentBlock, currentBlockPosition, board } = state;
    
    // Check if currentBlock is null
    if (!currentBlock) return false;
    
    let newX = currentBlockPosition.x;
    let newY = currentBlockPosition.y;
    let rotatedBlock = currentBlock;
    
    switch (inputType) {
      case 'left':
        newX -= 1;
        break;
      case 'right':
        newX += 1;
        break;
      case 'down':
        newY += 1;
        break;
      case 'rotate':
        // Simple rotation for now
        const rotated = rotateBlock(currentBlock);
        if (isValidPosition(board, rotated, currentBlockPosition.x, currentBlockPosition.y)) {
          rotatedBlock = rotated;
        }
        break;
      case 'hardDrop':
        // Find the lowest valid position
        while (isValidPosition(board, currentBlock, newX, newY + 1)) {
          newY += 1;
        }
        break;
      default:
        return false;
    }
    
    // Check if the new position is valid
    if (isValidPosition(board, rotatedBlock, newX, newY)) {
      // Calculate ghost position
      const ghostY = findGhostPosition(board, rotatedBlock, newX, newY);
      
      // Update position
      setGameState(prev => ({
        ...prev,
        currentBlock: rotatedBlock,
        currentBlockPosition: { x: newX, y: newY },
        ghostPosition: { x: newX, y: ghostY }
      }));
      
      // If hard drop, lock the block immediately
      if (inputType === 'hardDrop') {
        setTimeout(() => {
          if (lockBlockRef.current) {
            lockBlockRef.current();
          }
        }, 0);
      }
      
      return true;
    }
    
    return false;
  }, []);
  
  // Simple block rotation
  const rotateBlock = useCallback((block) => {
    const shape = block.shape;
    const size = shape.length;
    const rotated = Array(size).fill().map(() => Array(size).fill(0));
    
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        rotated[x][size - 1 - y] = shape[y][x];
      }
    }
    
    return { ...block, shape: rotated };
  }, []);
  
  // Finalize game (placeholder for blockchain integration)
  const finalizeGame = useCallback(() => {
    const state = gameStateRef.current;
    if (!state.gameOver) return null;
    
    // For now, just return the game data
    return {
      gameId,
      seed,
      score: state.score,
      linesCleared: state.linesCleared,
      level: state.level,
      board: state.board,
      actions: state.actions
    };
  }, [gameId, seed]);
  
  return {
    gameState,
    handleInput,
    finalizeGame
  };
}
