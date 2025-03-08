// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

// Mock VRF for prototype - in production would use Chainlink VRF
contract MockVRF {
    function getRandomNumber() external view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender)));
    }
}

contract BlockTris is ERC721Enumerable, Ownable {
    using Counters for Counters.Counter;
    using Strings for uint256;

    Counters.Counter private _tokenIds;
    MockVRF private vrfCoordinator;

    // Game state
    struct Game {
        uint256 id;
        address player;
        uint256 seed;
        uint256 score;
        bool finalized;
        string replayURI;
        uint256 createdAt;
        uint256 finalizedAt;
    }

    // Mapping from token ID to Game
    mapping(uint256 => Game) public games;
    
    // Game creation fee
    uint256 public gameFee = 0.001 ether;
    
    // Events
    event GameCreated(uint256 indexed gameId, address indexed player, uint256 seed);
    event GameFinalized(uint256 indexed gameId, address indexed player, uint256 score, string replayURI);

    constructor() ERC721("BlockTris", "BTRIS") Ownable(msg.sender) {
        vrfCoordinator = new MockVRF();
    }

    // Create a new game
    function createGame() external payable returns (uint256) {
        require(msg.value >= gameFee, "Insufficient fee");
        
        // Get randomness from VRF
        uint256 seed = vrfCoordinator.getRandomNumber();
        
        // Increment token ID
        _tokenIds.increment();
        uint256 newGameId = _tokenIds.current();
        
        // Create game
        games[newGameId] = Game({
            id: newGameId,
            player: msg.sender,
            seed: seed,
            score: 0,
            finalized: false,
            replayURI: "",
            createdAt: block.timestamp,
            finalizedAt: 0
        });
        
        // Mint NFT to player
        _mint(msg.sender, newGameId);
        
        emit GameCreated(newGameId, msg.sender, seed);
        
        return newGameId;
    }
    
    // Finalize a game
    function finalizeGame(uint256 gameId, uint256 score, string calldata replayURI) external {
        require(_exists(gameId), "Game does not exist");
        require(ownerOf(gameId) == msg.sender, "Not the game owner");
        require(!games[gameId].finalized, "Game already finalized");
        
        Game storage game = games[gameId];
        game.score = score;
        game.finalized = true;
        game.replayURI = replayURI;
        game.finalizedAt = block.timestamp;
        
        emit GameFinalized(gameId, msg.sender, score, replayURI);
    }
    
    // Get game info
    function getGameInfo(uint256 gameId) external view returns (Game memory) {
        require(_exists(gameId), "Game does not exist");
        return games[gameId];
    }
    
    // Get current block for a game (deterministic based on seed)
    function getCurrentBlock(uint256 gameId, uint256 blockIndex) external view returns (uint8) {
        require(_exists(gameId), "Game does not exist");
        Game memory game = games[gameId];
        
        // Generate a deterministic block type based on seed and block index
        uint256 blockType = uint256(keccak256(abi.encodePacked(game.seed, blockIndex))) % 7;
        return uint8(blockType);
    }
    
    // Set game fee
    function setGameFee(uint256 newFee) external onlyOwner {
        gameFee = newFee;
    }
    
    // Withdraw funds
    function withdraw() external onlyOwner {
        (bool success, ) = payable(owner()).call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }
    
    // Token URI for NFT metadata
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        Game memory game = games[tokenId];
        
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "BlockTris Game #', tokenId.toString(), '",',
                        '"description": "A BlockTris game on the Base network",',
                        '"attributes": [',
                        '{"trait_type": "Score", "value": "', game.score.toString(), '"},',
                        '{"trait_type": "Finalized", "value": "', game.finalized ? "Yes" : "No", '"},',
                        '{"trait_type": "Created", "value": "', game.createdAt.toString(), '"}',
                        '],',
                        '"image": "data:image/svg+xml;base64,', _generateSVG(tokenId), '"',
                        '}'
                    )
                )
            )
        );
        
        return string(abi.encodePacked("data:application/json;base64,", json));
    }
    
    // Generate SVG for NFT
    function _generateSVG(uint256 tokenId) internal view returns (string memory) {
        Game memory game = games[tokenId];
        
        string memory svg = string(
            abi.encodePacked(
                '<svg xmlns="http://www.w3.org/2000/svg" width="350" height="350" style="background-color:#000;">',
                '<rect width="100%" height="100%" fill="black" />',
                '<text x="50%" y="30%" font-family="monospace" font-size="20" fill="white" text-anchor="middle">BlockTris Game #', tokenId.toString(), '</text>',
                '<text x="50%" y="50%" font-family="monospace" font-size="24" fill="#00FF00" text-anchor="middle">Score: ', game.score.toString(), '</text>',
                '<text x="50%" y="70%" font-family="monospace" font-size="16" fill="#888888" text-anchor="middle">Player: ', _addressToString(game.player), '</text>',
                '</svg>'
            )
        );
        
        return Base64.encode(bytes(svg));
    }
    
    // Helper to convert address to string
    function _addressToString(address addr) internal pure returns (string memory) {
        bytes memory addressBytes = abi.encodePacked(addr);
        bytes memory stringBytes = new bytes(42);
        
        stringBytes[0] = '0';
        stringBytes[1] = 'x';
        
        for (uint i = 0; i < 20; i++) {
            bytes1 b = addressBytes[i];
            bytes1 hi = bytes1(uint8(b) / 16);
            bytes1 lo = bytes1(uint8(b) - 16 * uint8(hi));
            stringBytes[2 + 2 * i] = _char(hi);
            stringBytes[2 + 2 * i + 1] = _char(lo);
        }
        
        return string(stringBytes);
    }
    
    // Helper for hex conversion
    function _char(bytes1 b) internal pure returns (bytes1) {
        if (uint8(b) < 10) return bytes1(uint8(b) + 0x30);
        else return bytes1(uint8(b) + 0x57);
    }
}
