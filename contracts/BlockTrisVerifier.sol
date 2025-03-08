// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BlockTrisVerifier
 * @dev Contract for verifying BlockTris game results
 */
contract BlockTrisVerifier is Ownable {
    // Events
    event GameVerified(uint256 indexed gameId, bool verified, string reason);
    
    // Storage for verification parameters
    struct VerificationParameters {
        uint8 minMoveCount;        // Minimum number of moves for a legitimate game
        uint8 minGameDuration;     // Minimum duration in seconds
        uint16 maxPointsPerSecond; // Maximum points allowed per second of gameplay
    }
    
    VerificationParameters public params;
    
    constructor() {
        // Set default verification parameters
        params = VerificationParameters({
            minMoveCount: 10,
            minGameDuration: 30,
            maxPointsPerSecond: 50
        });
    }
    
    /**
     * @dev Updates verification parameters
     * @param _minMoveCount Minimum number of moves
     * @param _minGameDuration Minimum game duration in seconds
     * @param _maxPointsPerSecond Maximum points per second allowed
     */
    function updateVerificationParams(
        uint8 _minMoveCount,
        uint8 _minGameDuration,
        uint16 _maxPointsPerSecond
    ) 
        external 
        onlyOwner 
    {
        params.minMoveCount = _minMoveCount;
        params.minGameDuration = _minGameDuration;
        params.maxPointsPerSecond = _maxPointsPerSecond;
    }
    
    /**
     * @dev Verifies a game result based on parameters and commitments
     * @param seed The random seed used for the game
     * @param score The final score claimed
     * @param moveCount The number of moves made
     * @param gameDuration The duration of the game in seconds
     * @param boardState The compressed final board state
     * @param gameHash Hash of the game actions for verification
     * @return verified Whether the game passed verification
     * @return reason Reason for verification result
     */
    function verifyGameResult(
        uint256 seed,
        uint256 score,
        uint16 moveCount,
        uint16 gameDuration,
        bytes calldata boardState,
        bytes32 gameHash
    ) 
        external 
        view 
        returns (bool verified, string memory reason) 
    {
        // Check minimum move count
        if (moveCount < params.minMoveCount) {
            return (false, "Too few moves");
        }
        
        // Check minimum game duration
        if (gameDuration < params.minGameDuration) {
            return (false, "Game too short");
        }
        
        // Check points per second is reasonable
        if (score / gameDuration > params.maxPointsPerSecond) {
            return (false, "Score rate too high");
        }
        
        // Verify the board state is valid
        if (!isValidBoardState(boardState)) {
            return (false, "Invalid board state");
        }
        
        // This would validate the gameHash against the seed and results
        // For a full implementation, this would use zero-knowledge proofs
        // or a more sophisticated verification system
        
        return (true, "Game verified");
    }
    
    /**
     * @dev Checks if a board state is valid
     * @param boardState The compressed board state
     * @return Whether the board state is valid
     */
    function isValidBoardState(bytes calldata boardState) internal pure returns (bool) {
        // For simplicity, we're just checking the length is correct
        // A real implementation would validate the internal structure
        return boardState.length == 200; // 10x20 board
    }
    
    /**
     * @dev Calculates expected score from game parameters
     * @param linesCleared Number of lines cleared
     * @param hardDropDistance Cumulative hard drop distance
     * @param perfectClears Number of perfect clears
     * @param specialsUsed Number of special blocks used
     * @return Expected score
     */
    function calculateExpectedScore(
        uint16 linesCleared,
        uint16 hardDropDistance,
        uint8 perfectClears,
        uint8 specialsUsed
    ) 
        public 
        pure 
        returns (uint256) 
    {
        uint256 score = 0;
        
        // Score from lines cleared
        uint256 lineScore = 0;
        uint256 remainingLines = linesCleared;
        
        // Calculate score based on Tetris scoring system (simplified)
        uint256 singles = remainingLines % 4;
        remainingLines = remainingLines - singles;
        lineScore += singles * 100;
        
        uint256 doubles = (remainingLines % 12) / 4;
        remainingLines = remainingLines - (doubles * 4);
        lineScore += doubles * 300;
        
        uint256 triples = (remainingLines % 12) / 4;
        remainingLines = remainingLines - (triples * 4);
        lineScore += triples * 500;
        
        uint256 tetrises = remainingLines / 4;
        lineScore += tetrises * 800;
        
        score += lineScore;
        
        // Add hard drop score
        score += hardDropDistance * 2;
        
        // Add perfect clear bonus
        score += perfectClears * 1500;
        
        // Add specials bonus
        score += specialsUsed * 150;
        
        return score;
    }
    
    /**
     * @dev Converts raw gameplay actions into a verification hash
     * @param seed Game seed
     * @param actions Encoded actions taken during gameplay
     * @return Hash of the gameplay for verification
     */
    function hashGameActions(uint256 seed, bytes calldata actions) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(seed, actions));
    }
}