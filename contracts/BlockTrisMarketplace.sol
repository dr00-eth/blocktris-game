// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./BlockTris.sol";

contract BlockTrisMarketplace is ReentrancyGuard, Ownable {
    // BlockTris contract
    BlockTris public blockTrisContract;
    
    // Marketplace fee percentage (in basis points, 100 = 1%)
    uint256 public feePercentage = 250; // 2.5%
    
    // Listing structure
    struct Listing {
        uint256 tokenId;
        address seller;
        uint256 price;
        bool active;
    }
    
    // Mapping from token ID to listing
    mapping(uint256 => Listing) public listings;
    
    // Events
    event GameListed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event GameSold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price);
    event ListingCancelled(uint256 indexed tokenId, address indexed seller);
    event FeePercentageUpdated(uint256 newFeePercentage);
    
    constructor(address _blockTrisAddress) Ownable(msg.sender) {
        blockTrisContract = BlockTris(_blockTrisAddress);
    }
    
    // List a game for sale
    function listGame(uint256 tokenId, uint256 price) external {
        require(blockTrisContract.ownerOf(tokenId) == msg.sender, "Not the token owner");
        require(price > 0, "Price must be greater than zero");
        require(blockTrisContract.getGameInfo(tokenId).finalized, "Game must be finalized");
        
        // Ensure marketplace is approved to transfer the token
        require(
            blockTrisContract.getApproved(tokenId) == address(this) || 
            blockTrisContract.isApprovedForAll(msg.sender, address(this)),
            "Marketplace not approved"
        );
        
        // Create listing
        listings[tokenId] = Listing({
            tokenId: tokenId,
            seller: msg.sender,
            price: price,
            active: true
        });
        
        emit GameListed(tokenId, msg.sender, price);
    }
    
    // Buy a listed game
    function buyGame(uint256 tokenId) external payable nonReentrant {
        Listing storage listing = listings[tokenId];
        
        require(listing.active, "Listing not active");
        require(msg.value >= listing.price, "Insufficient payment");
        require(msg.sender != listing.seller, "Cannot buy your own listing");
        
        // Calculate fee
        uint256 fee = (listing.price * feePercentage) / 10000;
        uint256 sellerProceeds = listing.price - fee;
        
        // Mark listing as inactive
        listing.active = false;
        
        // Transfer token to buyer
        blockTrisContract.safeTransferFrom(listing.seller, msg.sender, tokenId);
        
        // Transfer funds to seller
        (bool sellerTransferSuccess, ) = payable(listing.seller).call{value: sellerProceeds}("");
        require(sellerTransferSuccess, "Failed to send funds to seller");
        
        emit GameSold(tokenId, listing.seller, msg.sender, listing.price);
        
        // Refund excess payment
        if (msg.value > listing.price) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - listing.price}("");
            require(refundSuccess, "Failed to refund excess payment");
        }
    }
    
    // Cancel a listing
    function cancelListing(uint256 tokenId) external {
        Listing storage listing = listings[tokenId];
        
        require(listing.active, "Listing not active");
        require(listing.seller == msg.sender || msg.sender == owner(), "Not authorized");
        
        listing.active = false;
        
        emit ListingCancelled(tokenId, listing.seller);
    }
    
    // Update listing price
    function updateListingPrice(uint256 tokenId, uint256 newPrice) external {
        Listing storage listing = listings[tokenId];
        
        require(listing.active, "Listing not active");
        require(listing.seller == msg.sender, "Not the seller");
        require(newPrice > 0, "Price must be greater than zero");
        
        listing.price = newPrice;
        
        emit GameListed(tokenId, msg.sender, newPrice);
    }
    
    // Set fee percentage (owner only)
    function setFeePercentage(uint256 newFeePercentage) external onlyOwner {
        require(newFeePercentage <= 1000, "Fee cannot exceed 10%");
        feePercentage = newFeePercentage;
        
        emit FeePercentageUpdated(newFeePercentage);
    }
    
    // Withdraw accumulated fees (owner only)
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    // Get all active listings
    function getActiveListings() external view returns (Listing[] memory) {
        // Count active listings
        uint256 activeCount = 0;
        for (uint256 i = 1; i <= blockTrisContract.totalSupply(); i++) {
            if (listings[i].active) {
                activeCount++;
            }
        }
        
        // Create array of active listings
        Listing[] memory activeListings = new Listing[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= blockTrisContract.totalSupply(); i++) {
            if (listings[i].active) {
                activeListings[index] = listings[i];
                index++;
            }
        }
        
        return activeListings;
    }
    
    // Get listing for a specific token
    function getListing(uint256 tokenId) external view returns (Listing memory) {
        return listings[tokenId];
    }
}
