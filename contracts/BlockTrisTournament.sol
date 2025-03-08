// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./BlockTris.sol";

contract BlockTrisTournament is Ownable, ReentrancyGuard {
    // BlockTris contract
    BlockTris public blockTrisContract;
    
    // Tournament structure
    struct Tournament {
        uint256 id;
        string name;
        uint256 entryFee;
        uint256 prizePool;
        uint256 startTime;
        uint256 endTime;
        bool active;
        address[] participants;
        mapping(address => bool) hasParticipated;
        mapping(address => uint256) highestScores;
        address[] winners;
        uint256[] prizeSplit; // Percentages in basis points (100 = 1%)
    }
    
    // Tournament counter
    uint256 private _tournamentIds;
    
    // Mapping from tournament ID to Tournament
    mapping(uint256 => Tournament) public tournaments;
    
    // Events
    event TournamentCreated(uint256 indexed tournamentId, string name, uint256 entryFee, uint256 startTime, uint256 endTime);
    event PlayerRegistered(uint256 indexed tournamentId, address indexed player);
    event ScoreSubmitted(uint256 indexed tournamentId, address indexed player, uint256 gameId, uint256 score);
    event TournamentFinalized(uint256 indexed tournamentId, address[] winners, uint256[] prizes);
    
    constructor(address _blockTrisAddress) Ownable(msg.sender) {
        blockTrisContract = BlockTris(_blockTrisAddress);
    }
    
    // Create a new tournament
    function createTournament(
        string calldata name,
        uint256 entryFee,
        uint256 startTime,
        uint256 endTime,
        uint256[] calldata prizeSplit
    ) external onlyOwner {
        require(startTime < endTime, "Invalid time range");
        require(startTime > block.timestamp, "Start time must be in the future");
        require(prizeSplit.length > 0, "Must have at least one prize");
        
        // Validate prize split adds up to 10000 (100%)
        uint256 totalSplit = 0;
        for (uint256 i = 0; i < prizeSplit.length; i++) {
            totalSplit += prizeSplit[i];
        }
        require(totalSplit == 10000, "Prize split must total 100%");
        
        // Increment tournament ID
        _tournamentIds++;
        uint256 newTournamentId = _tournamentIds;
        
        // Create tournament
        Tournament storage newTournament = tournaments[newTournamentId];
        newTournament.id = newTournamentId;
        newTournament.name = name;
        newTournament.entryFee = entryFee;
        newTournament.prizePool = 0;
        newTournament.startTime = startTime;
        newTournament.endTime = endTime;
        newTournament.active = true;
        newTournament.prizeSplit = prizeSplit;
        
        emit TournamentCreated(newTournamentId, name, entryFee, startTime, endTime);
    }
    
    // Register for a tournament
    function registerForTournament(uint256 tournamentId) external payable nonReentrant {
        Tournament storage tournament = tournaments[tournamentId];
        
        require(tournament.active, "Tournament not active");
        require(block.timestamp >= tournament.startTime, "Tournament not started");
        require(block.timestamp < tournament.endTime, "Tournament ended");
        require(msg.value >= tournament.entryFee, "Insufficient entry fee");
        require(!tournament.hasParticipated[msg.sender], "Already registered");
        
        // Add player to tournament
        tournament.participants.push(msg.sender);
        tournament.hasParticipated[msg.sender] = true;
        tournament.prizePool += tournament.entryFee;
        
        // Refund excess payment
        if (msg.value > tournament.entryFee) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - tournament.entryFee}("");
            require(refundSuccess, "Failed to refund excess payment");
        }
        
        emit PlayerRegistered(tournamentId, msg.sender);
    }
    
    // Submit a game score for a tournament
    function submitScore(uint256 tournamentId, uint256 gameId) external {
        Tournament storage tournament = tournaments[tournamentId];
        
        require(tournament.active, "Tournament not active");
        require(block.timestamp >= tournament.startTime, "Tournament not started");
        require(block.timestamp < tournament.endTime, "Tournament ended");
        require(tournament.hasParticipated[msg.sender], "Not registered for tournament");
        
        // Get game info
        BlockTris.Game memory game = blockTrisContract.getGameInfo(gameId);
        
        require(game.player == msg.sender, "Not the game owner");
        require(game.finalized, "Game not finalized");
        require(game.createdAt >= tournament.startTime, "Game created before tournament start");
        require(game.finalizedAt <= tournament.endTime, "Game finalized after tournament end");
        
        // Update highest score if applicable
        if (game.score > tournament.highestScores[msg.sender]) {
            tournament.highestScores[msg.sender] = game.score;
        }
        
        emit ScoreSubmitted(tournamentId, msg.sender, gameId, game.score);
    }
    
    // Finalize a tournament and distribute prizes
    function finalizeTournament(uint256 tournamentId) external onlyOwner nonReentrant {
        Tournament storage tournament = tournaments[tournamentId];
        
        require(tournament.active, "Tournament not active");
        require(block.timestamp >= tournament.endTime, "Tournament not ended");
        
        // Sort participants by score
        address[] memory sortedParticipants = _sortParticipantsByScore(tournamentId);
        
        // Determine winners (limited by prize split length)
        uint256 winnerCount = tournament.prizeSplit.length;
        if (sortedParticipants.length < winnerCount) {
            winnerCount = sortedParticipants.length;
        }
        
        // Store winners
        for (uint256 i = 0; i < winnerCount; i++) {
            tournament.winners.push(sortedParticipants[i]);
        }
        
        // Distribute prizes
        uint256[] memory prizes = new uint256[](winnerCount);
        for (uint256 i = 0; i < winnerCount; i++) {
            uint256 prize = (tournament.prizePool * tournament.prizeSplit[i]) / 10000;
            prizes[i] = prize;
            
            (bool success, ) = payable(sortedParticipants[i]).call{value: prize}("");
            require(success, "Failed to send prize");
        }
        
        // Mark tournament as inactive
        tournament.active = false;
        
        emit TournamentFinalized(tournamentId, tournament.winners, prizes);
    }
    
    // Get tournament info
    function getTournamentInfo(uint256 tournamentId) external view returns (
        uint256 id,
        string memory name,
        uint256 entryFee,
        uint256 prizePool,
        uint256 startTime,
        uint256 endTime,
        bool active,
        uint256 participantCount,
        address[] memory winners,
        uint256[] memory prizeSplit
    ) {
        Tournament storage tournament = tournaments[tournamentId];
        
        return (
            tournament.id,
            tournament.name,
            tournament.entryFee,
            tournament.prizePool,
            tournament.startTime,
            tournament.endTime,
            tournament.active,
            tournament.participants.length,
            tournament.winners,
            tournament.prizeSplit
        );
    }
    
    // Get participant score
    function getParticipantScore(uint256 tournamentId, address participant) external view returns (uint256) {
        return tournaments[tournamentId].highestScores[participant];
    }
    
    // Get all participants
    function getParticipants(uint256 tournamentId) external view returns (address[] memory) {
        return tournaments[tournamentId].participants;
    }
    
    // Get active tournaments
    function getActiveTournaments() external view returns (uint256[] memory) {
        // Count active tournaments
        uint256 activeCount = 0;
        for (uint256 i = 1; i <= _tournamentIds; i++) {
            if (tournaments[i].active) {
                activeCount++;
            }
        }
        
        // Create array of active tournament IDs
        uint256[] memory activeTournaments = new uint256[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= _tournamentIds; i++) {
            if (tournaments[i].active) {
                activeTournaments[index] = i;
                index++;
            }
        }
        
        return activeTournaments;
    }
    
    // Helper function to sort participants by score
    function _sortParticipantsByScore(uint256 tournamentId) internal view returns (address[] memory) {
        Tournament storage tournament = tournaments[tournamentId];
        
        // Create a copy of participants array
        address[] memory participants = tournament.participants;
        
        // Simple bubble sort (not efficient but works for small arrays)
        for (uint256 i = 0; i < participants.length; i++) {
            for (uint256 j = 0; j < participants.length - i - 1; j++) {
                if (tournament.highestScores[participants[j]] < tournament.highestScores[participants[j + 1]]) {
                    // Swap
                    address temp = participants[j];
                    participants[j] = participants[j + 1];
                    participants[j + 1] = temp;
                }
            }
        }
        
        return participants;
    }
    
    // Cancel a tournament and refund participants
    function cancelTournament(uint256 tournamentId) external onlyOwner nonReentrant {
        Tournament storage tournament = tournaments[tournamentId];
        
        require(tournament.active, "Tournament not active");
        
        // Refund all participants
        for (uint256 i = 0; i < tournament.participants.length; i++) {
            address participant = tournament.participants[i];
            (bool success, ) = payable(participant).call{value: tournament.entryFee}("");
            require(success, "Failed to refund participant");
        }
        
        // Mark tournament as inactive
        tournament.active = false;
    }
}
