// BlockTris Game Engine

class BlockTrisEngine {
    constructor(gameId, seed, blockSequence) {
      this.gameId = gameId;
      this.seed = seed;
      this.blockSequence = blockSequence;
      
      // Game state
      this.board = this.createEmptyBoard();
      this.currentBlock = null;
      this.currentBlockPosition = { x: 0, y: 0 };
      this.currentBlockRotation = 0;
      this.nextBlock = null;
      this.blockIndex = 0;
      this.score = 0;
      this.linesCleared = 0;
      this.gameOver = false;
      this.gameStartTime = Date.now();
      this.gameEndTime = null;
      
      // Game replay data for verification
      this.gameActions = [];
      this.boardStates = [];
      
      // Game settings
      this.boardWidth = 10;
      this.boardHeight = 20;
      this.gravity = 1000; // ms per drop
      this.difficultyIncrease = 0.95; // Gravity multiplier per level
      
      // Block types and colors
      this.blockDefinitions = this.initializeBlockDefinitions();
      
      // Start game
      this.initializeGame();
    }
    
    // Initialize the game
    initializeGame() {
      this.nextBlock = this.getNextBlock();
      this.spawnBlock();
      this.startGameLoop();
    }
    
    // Create an empty game board
    createEmptyBoard() {
      const board = [];
      for (let y = 0; y < this.boardHeight; y++) {
        board[y] = [];
        for (let x = 0; x < this.boardWidth; x++) {
          board[y][x] = 0; // 0 represents empty cell
        }
      }
      return board;
    }
    
    // Define all block types (including special blocks)
    initializeBlockDefinitions() {
      return {
        // Standard tetrominoes
        I: {
          shape: [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
          ],
          color: '#00FFFF',
          rarity: 'common',
          special: null
        },
        J: {
          shape: [
            [1, 0, 0],
            [1, 1, 1],
            [0, 0, 0]
          ],
          color: '#0000FF',
          rarity: 'common',
          special: null
        },
        L: {
          shape: [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 0]
          ],
          color: '#FF8000',
          rarity: 'common',
          special: null
        },
        O: {
          shape: [
            [1, 1],
            [1, 1]
          ],
          color: '#FFFF00',
          rarity: 'common',
          special: null
        },
        S: {
          shape: [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0]
          ],
          color: '#00FF00',
          rarity: 'common',
          special: null
        },
        T: {
          shape: [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0]
          ],
          color: '#8000FF',
          rarity: 'common',
          special: null
        },
        Z: {
          shape: [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0]
          ],
          color: '#FF0000',
          rarity: 'common',
          special: null
        },
        // Special blocks (with unique properties)
        Bomb: {
          shape: [
            [0, 1, 0],
            [1, 1, 1],
            [0, 1, 0]
          ],
          color: '#777777',
          rarity: 'rare',
          special: 'explosion'
        },
        Rainbow: {
          shape: [
            [0, 1, 0],
            [1, 1, 1],
            [1, 0, 1]
          ],
          color: 'gradient',
          rarity: 'rare',
          special: 'colorClear'
        },
        Mirror: {
          shape: [
            [1, 0, 1],
            [1, 1, 1],
            [0, 0, 0]
          ],
          color: '#AADDFF',
          rarity: 'rare',
          special: 'mirrorBoard'
        },
        Quantum: {
          shape: [
            [0, 1, 0],
            [1, 0, 1],
            [0, 1, 0]
          ],
          color: '#FF00FF',
          rarity: 'legendary',
          special: 'quantumTunnel'
        }
      };
    }
    
    // Get the next block based on the seed and sequence
    getNextBlock() {
      const blockTypes = Object.keys(this.blockDefinitions);
      const commonBlocks = blockTypes.filter(type => this.blockDefinitions[type].rarity === 'common');
      const rareBlocks = blockTypes.filter(type => this.blockDefinitions[type].rarity === 'rare');
      const legendaryBlocks = blockTypes.filter(type => this.blockDefinitions[type].rarity === 'legendary');
      
      // Use the blockchain-provided sequence to determine block type
      const randomValue = this.blockSequence[this.blockIndex % this.blockSequence.length];
      this.blockIndex++;
      
      // Rarity determination (90% common, 9% rare, 1% legendary)
      let blockType;
      const rarityRoll = randomValue % 100;
      
      if (rarityRoll < 90) {
        blockType = commonBlocks[randomValue % commonBlocks.length];
      } else if (rarityRoll < 99) {
        blockType = rareBlocks[randomValue % rareBlocks.length];
      } else {
        blockType = legendaryBlocks[randomValue % legendaryBlocks.length];
      }
      
      return {
        type: blockType,
        shape: [...this.blockDefinitions[blockType].shape], // Clone the shape
        color: this.blockDefinitions[blockType].color,
        special: this.blockDefinitions[blockType].special,
        effect: this.blockDefinitions[blockType].effect,
        rarity: this.blockDefinitions[blockType].rarity
      };
    }
    
    // Spawn a new block at the top of the board
    spawnBlock() {
      this.currentBlock = this.nextBlock;
      this.nextBlock = this.getNextBlock();
      
      // Position the block at the top center of the board
      this.currentBlockPosition = {
        x: Math.floor((this.boardWidth - this.currentBlock.shape[0].length) / 2),
        y: 0
      };
      this.currentBlockRotation = 0;
      
      // Check if the new block can be placed (game over check)
      if (!this.isValidPosition()) {
        this.gameOver = true;
        this.gameEndTime = Date.now();
        this.finalizeGame();
      }
      
      // Record this action
      this.recordAction('spawn', this.currentBlock.type);
    }
    
    // Check if the current position is valid
    isValidPosition(offsetX = 0, offsetY = 0, block = this.currentBlock.shape) {
      const { x, y } = this.currentBlockPosition;
      
      for (let row = 0; row < block.length; row++) {
        for (let col = 0; col < block[row].length; col++) {
          if (block[row][col]) {
            const boardX = x + col + offsetX;
            const boardY = y + row + offsetY;
            
            // Check if outside the board boundaries
            if (boardX < 0 || boardX >= this.boardWidth || boardY >= this.boardHeight) {
              return false;
            }
            
            // Check if overlapping another block (but ignore if still above the board)
            if (boardY >= 0 && this.board[boardY][boardX]) {
              return false;
            }
          }
        }
      }
      
      return true;
    }
    
    // Rotate the current block
    rotateBlock(direction = 1) {
      const { shape } = this.currentBlock;
      const size = shape.length;
      const rotated = Array(size).fill().map(() => Array(size).fill(0));
      
      // Perform rotation
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          if (direction === 1) { // Clockwise
            rotated[x][size - 1 - y] = shape[y][x];
          } else { // Counter-clockwise
            rotated[size - 1 - x][y] = shape[y][x];
          }
        }
      }
      
      // Check if rotation is valid
      if (this.isValidPosition(0, 0, rotated)) {
        this.currentBlock.shape = rotated;
        this.currentBlockRotation = (this.currentBlockRotation + direction + 4) % 4;
        this.recordAction('rotate', direction);
        return true;
      }
      
      // Wall kick attempts
      const kicks = [
        { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: -1 },
        { x: 2, y: 0 }, { x: -2, y: 0 }, { x: 0, y: -2 }
      ];
      
      for (const kick of kicks) {
        if (this.isValidPosition(kick.x, kick.y, rotated)) {
          this.currentBlock.shape = rotated;
          this.currentBlockPosition.x += kick.x;
          this.currentBlockPosition.y += kick.y;
          this.currentBlockRotation = (this.currentBlockRotation + direction + 4) % 4;
          this.recordAction('rotate', direction, kick);
          return true;
        }
      }
      
      return false;
    }
    
    // Move the current block
    moveBlock(dx, dy) {
      if (this.isValidPosition(dx, dy)) {
        this.currentBlockPosition.x += dx;
        this.currentBlockPosition.y += dy;
        this.recordAction('move', { dx, dy });
        return true;
      }
      return false;
    }
    
    // Move the block down one step
    moveDown() {
      if (this.moveBlock(0, 1)) {
        return true;
      } else {
        this.lockBlock();
        return false;
      }
    }
    
    // Hard drop the block
    hardDrop() {
      let dropDistance = 0;
      while (this.isValidPosition(0, dropDistance + 1)) {
        dropDistance++;
      }
      
      this.currentBlockPosition.y += dropDistance;
      this.score += dropDistance * 2; // Bonus points for hard drop
      this.lockBlock();
      
      this.recordAction('hardDrop', dropDistance);
      return dropDistance;
    }
    
    // Lock the current block in place
    lockBlock() {
      const { shape } = this.currentBlock;
      const { x, y } = this.currentBlockPosition;
      
      // Add the block to the board
      for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
          if (shape[row][col]) {
            const boardY = y + row;
            const boardX = x + col;
            
            if (boardY >= 0) { // Ensure we're on the board
              this.board[boardY][boardX] = {
                color: this.currentBlock.color,
                type: this.currentBlock.type,
                special: this.currentBlock.special,
                effect: this.currentBlock.effect
              };
            }
          }
        }
      }
      
      // Check for special block effects
      this.processSpecialBlockEffects();
      
      // Check for completed lines
      this.checkLines();
      
      // Spawn a new block
      this.spawnBlock();
      
      // Record board state for verification
      this.recordBoardState();
    }
    
    // Process any special effects from blocks
    processSpecialBlockEffects() {
      const special = this.currentBlock.special;
      const effect = this.currentBlock.effect;
      
      // Handle both special and effect properties
      if (!special && !effect) return;
      
      // Determine which property to use
      const effectType = special || effect;
      
      switch (effectType) {
        case 'explosion':
          // Clear a 3x3 area around the center of the block
          this.createExplosion();
          break;
        case 'colorClear':
          // Clear all blocks of the same color
          this.clearBlocksByColor();
          break;
        case 'mirrorBoard':
          // Mirror the entire board horizontally
          this.mirrorBoard();
          break;
        case 'quantumTunnel':
          // Randomly rearrange the bottom half of the board
          this.quantumEffect();
          break;
      }
    }
    
    // Special effect: Explosion
    createExplosion() {
      const centerX = this.currentBlockPosition.x + Math.floor(this.currentBlock.shape[0].length / 2);
      const centerY = this.currentBlockPosition.y + Math.floor(this.currentBlock.shape.length / 2);
      
      // Clear a 3x3 area
      for (let y = centerY - 1; y <= centerY + 1; y++) {
        for (let x = centerX - 1; x <= centerX + 1; x++) {
          if (y >= 0 && y < this.boardHeight && x >= 0 && x < this.boardWidth) {
            this.board[y][x] = 0;
          }
        }
      }
      
      this.score += 100; // Bonus for using special
      this.recordAction('special', 'explosion');
    }
    
    // Special effect: Clear blocks by color
    clearBlocksByColor() {
      const centerX = this.currentBlockPosition.x + Math.floor(this.currentBlock.shape[0].length / 2);
      const centerY = this.currentBlockPosition.y + Math.floor(this.currentBlock.shape.length / 2);
      
      // Find the color at the center position
      let targetColor = null;
      if (centerY >= 0 && centerX >= 0 && centerY < this.boardHeight && centerX < this.boardWidth) {
        if (this.board[centerY][centerX] && this.board[centerY][centerX].color) {
          targetColor = this.board[centerY][centerX].color;
        }
      }
      
      // Clear all blocks of the same color
      let blocksCleared = 0;
      if (targetColor) {
        for (let y = 0; y < this.boardHeight; y++) {
          for (let x = 0; x < this.boardWidth; x++) {
            if (this.board[y][x] && this.board[y][x].color === targetColor) {
              this.board[y][x] = 0;
              blocksCleared++;
            }
          }
        }
      }
      
      this.score += blocksCleared * 15; // Bonus points per block cleared
      this.recordAction('special', 'colorClear', blocksCleared);
    }
    
    // Special effect: Mirror the board
    mirrorBoard() {
      for (let y = 0; y < this.boardHeight; y++) {
        this.board[y].reverse();
      }
      
      this.score += 150; // Bonus for using special
      this.recordAction('special', 'mirrorBoard');
    }
    
    // Special effect: Quantum rearrangement
    quantumEffect() {
      // Only affect the bottom half of the board
      const startRow = Math.floor(this.boardHeight / 2);
      const cells = [];
      
      // Collect all cells from the bottom half
      for (let y = startRow; y < this.boardHeight; y++) {
        for (let x = 0; x < this.boardWidth; x++) {
          cells.push({ value: this.board[y][x], x, y });
        }
      }
      
      // Shuffle the cells (Fisher-Yates algorithm)
      for (let i = cells.length - 1; i > 0; i--) {
        const j = Math.floor(this.pseudoRandom() * (i + 1));
        [cells[i].value, cells[j].value] = [cells[j].value, cells[i].value];
      }
      
      // Place the shuffled cells back
      for (const cell of cells) {
        this.board[cell.y][cell.x] = cell.value;
      }
      
      this.score += 300; // Bonus for using special
      this.recordAction('special', 'quantumEffect');
    }
    
    // Pseudorandom number generator (deterministic based on seed)
    pseudoRandom() {
      const x = Math.sin(this.seed++) * 10000;
      return x - Math.floor(x);
    }
    
    // Check for completed lines
    checkLines() {
      let linesCleared = 0;
      let perfectClear = true;
      
      for (let y = this.boardHeight - 1; y >= 0; y--) {
        let lineComplete = true;
        
        // Check if the line is complete
        for (let x = 0; x < this.boardWidth; x++) {
          if (!this.board[y][x]) {
            lineComplete = false;
            break;
          }
        }
        
        if (lineComplete) {
          // Clear the line
          for (let y2 = y; y2 > 0; y2--) {
            for (let x = 0; x < this.boardWidth; x++) {
              this.board[y2][x] = this.board[y2 - 1][x];
            }
          }
          
          // Clear the top line
          for (let x = 0; x < this.boardWidth; x++) {
            this.board[0][x] = 0;
          }
          
          // Stay on the same line since we moved everything down
          y++;
          linesCleared++;
        }
      }
      
      // Check for perfect clear (no blocks left on board)
      for (let y = 0; y < this.boardHeight; y++) {
        for (let x = 0; x < this.boardWidth; x++) {
          if (this.board[y][x]) {
            perfectClear = false;
            break;
          }
        }
        if (!perfectClear) break;
      }
      
      // Calculate score
      if (linesCleared > 0) {
        // Standard scoring
        const lineScores = [0, 100, 300, 500, 800]; // 0, 1, 2, 3, 4 lines
        let scoreIncrease = lineScores[Math.min(linesCleared, 4)];
        
        // Perfect clear bonus
        if (perfectClear) {
          scoreIncrease += 1500;
        }
        
        this.score += scoreIncrease;
        this.linesCleared += linesCleared;
        
        // Record line clear
        this.recordAction('clearLines', linesCleared, perfectClear);
      }
      
      // Adjust drop speed based on lines cleared (increase difficulty)
      this.adjustDifficulty();
    }
    
    // Adjust game difficulty based on lines cleared
    adjustDifficulty() {
      const level = Math.floor(this.linesCleared / 10) + 1;
      this.gravity = Math.max(100, 1000 * Math.pow(this.difficultyIncrease, level - 1));
    }
    
    // Start the game loop
    startGameLoop() {
      this.lastDropTime = Date.now();
      this.gameLoopInterval = setInterval(() => this.gameLoop(), 16); // ~60 FPS
    }
    
    // Game loop
    gameLoop() {
      if (this.gameOver) {
        clearInterval(this.gameLoopInterval);
        return;
      }
      
      const now = Date.now();
      if (now - this.lastDropTime > this.gravity) {
        this.moveDown();
        this.lastDropTime = now;
      }
    }
    
    // Record game action for verification
    recordAction(actionType, data, extra = null) {
      this.gameActions.push({
        type: actionType,
        data: data,
        extra: extra,
        timestamp: Date.now() - this.gameStartTime
      });
    }
    
    // Record the current board state
    recordBoardState() {
      // We only store key frames for verification, not every state
      const boardCopy = JSON.parse(JSON.stringify(this.board));
      this.boardStates.push({
        board: boardCopy,
        score: this.score,
        linesCleared: this.linesCleared,
        timestamp: Date.now() - this.gameStartTime
      });
    }
    
    // Handle player input
    handleInput(inputType) {
      if (this.gameOver) return false;
      
      switch (inputType) {
        case 'left':
          return this.moveBlock(-1, 0);
        case 'right':
          return this.moveBlock(1, 0);
        case 'down':
          return this.moveDown();
        case 'rotateClockwise':
          return this.rotateBlock(1);
        case 'rotateCounterClockwise':
          return this.rotateBlock(-1);
        case 'hardDrop':
          return this.hardDrop();
        default:
          return false;
      }
    }
    
    // Finalize the game and prepare data for blockchain submission
    finalizeGame() {
      this.gameEndTime = this.gameEndTime || Date.now();
      
      // Create the game hash for verification
      const gameHash = this.createGameHash();
      
      // Prepare the game data for blockchain submission
      const gameData = {
        gameId: this.gameId,
        seed: this.seed,
        score: this.score,
        linesCleared: this.linesCleared,
        duration: this.gameEndTime - this.gameStartTime,
        boardState: this.compressBoardState(this.board),
        perfectClears: this.countPerfectClears(),
        specialsUsed: this.countSpecials(),
        hash: gameHash
      };
      
      // Prepare replay data (stored off-chain for efficiency)
      const replayData = {
        gameId: this.gameId,
        seed: this.seed,
        blockSequence: this.blockSequence,
        actions: this.gameActions,
        keyFrames: this.boardStates
      };
      
      return {
        gameData,     // For on-chain storage
        replayData    // For off-chain storage with IPFS
      };
    }
    
    // Create a hash of the game for verification
    createGameHash() {
      // In a real implementation, this would use a cryptographic hash function
      // For simplicity, we'll just concatenate key values here
      const gameString = `${this.gameId}-${this.seed}-${this.score}-${this.linesCleared}-${this.gameEndTime - this.gameStartTime}`;
      return this.simpleHash(gameString);
    }
    
    // Simple hash function (for demonstration)
    simpleHash(str) {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return hash.toString(16);
    }
    
    // Compress board state for efficient storage
    compressBoardState(board) {
      // This would implement a more sophisticated compression in practice
      // For simplicity, we'll convert to a string representation
      let compressed = '';
      for (let y = 0; y < this.boardHeight; y++) {
        for (let x = 0; x < this.boardWidth; x++) {
          if (!board[y][x]) {
            compressed += '0';
          } else {
            // Map block types to single characters
            const blockTypes = Object.keys(this.blockDefinitions);
            const typeIndex = blockTypes.indexOf(board[y][x].type);
            compressed += String.fromCharCode(65 + typeIndex); // A, B, C, etc.
          }
        }
      }
      return compressed;
    }
    
    // Count perfect clears in game history
    countPerfectClears() {
      return this.gameActions.filter(action => 
        action.type === 'clearLines' && action.extra === true
      ).length;
    }
    
    // Count special block uses
    countSpecials() {
      return this.gameActions.filter(action => 
        action.type === 'special'
      ).length;
    }
    
    // Generate a proof of legitimate gameplay
    generateGameProof() {
      // In a real implementation, this would create a zero-knowledge proof
      // For demonstration, we'll just return key verification data
      return {
        gameId: this.gameId,
        seed: this.seed,
        finalScore: this.score,
        actionCount: this.gameActions.length,
        finalBoardHash: this.createGameHash()
      };
    }
  }
  
  // Example of initializing the game with blockchain-provided data
  function initializeBlockTrisGame(gameId, seed, blockSequence) {
    const game = new BlockTrisEngine(gameId, seed, blockSequence);
    
    // Set up event listeners for user input
    document.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          game.handleInput('left');
          break;
        case 'ArrowRight':
          game.handleInput('right');
          break;
        case 'ArrowDown':
          game.handleInput('down');
          break;
        case 'ArrowUp':
          game.handleInput('rotateClockwise');
          break;
        case 'z':
          game.handleInput('rotateCounterClockwise');
          break;
        case ' ':
          game.handleInput('hardDrop');
          break;
      }
    });
    
    return game;
  }
  
  // Function to finalize game and submit to blockchain
  async function finalizeGameOnChain(game, contractInstance, walletAddress) {
    const { gameData, replayData } = game.finalizeGame();
    
    // Store replay data on IPFS or similar storage
    const replayDataCID = await storeReplayData(replayData);
    
    // Create transaction to submit game result to blockchain
    try {
      const tx = await contractInstance.finalizeGame(
        gameData.gameId,
        gameData.score,
        gameData.boardState,
        replayDataCID,
        gameData.hash,
        { from: walletAddress }
      );
      
      return {
        success: true,
        transaction: tx,
        gameData
      };
    } catch (error) {
      console.error("Error finalizing game on chain:", error);
      return {
        success: false,
        error
      };
    }
  }
  
  // Mock function for storing replay data (would use IPFS in production)
  async function storeReplayData(replayData) {
    // In a real implementation, this would upload to IPFS or similar
    console.log("Storing replay data:", replayData);
    return "ipfs://QmHashOfReplayData";
  }