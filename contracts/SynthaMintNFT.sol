// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title DreamMintNFT
 * @dev Advanced NFT contract for SynthaMint - supports individual and collaborative AI-generated art minting
 * @author Koustav S
 * 
 * Features:
 * - Individual and collaborative minting
 * - Royalty support (EIP-2981)
 * - Pausable functionality
 * - Access control for minters
 * - Gas optimized with custom errors
 * - IPFS metadata storage
 * - Event logging for analytics
 */
contract DreamMintNFT is 
    ERC721, 
    ERC721URIStorage, 
    ERC721Pausable, 
    ERC721Royalty,
    Ownable, 
    AccessControl,
    ReentrancyGuard 
{
    using Strings for uint256;

    // Roles
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // State variables
    uint256 private _nextTokenId = 1; // Start from 1 instead of 0
    uint256 public mintPrice = 0.01 ether;
    uint256 public maxSupply = 10000;
    uint256 public constant MAX_BATCH_SIZE = 10;
    
    // Royalty fee (in basis points: 500 = 5%)
    uint96 public royaltyFee = 500;
    
    // Mapping to track collaborative NFTs
    mapping(uint256 => CollabInfo) public collaborations;
    
    // Mapping to track user minting statistics
    mapping(address => UserStats) public userStats;

    // Structs
    struct CollabInfo {
        address user1;
        address user2;
        string prompt1;
        string prompt2;
        uint256 timestamp;
    }

    struct UserStats {
        uint256 totalMinted;
        uint256 totalCollaborations;
        uint256 lastMintTimestamp;
    }

    // Custom Errors (Gas efficient)
    error InsufficientPayment(uint256 required, uint256 provided);
    error InvalidUserAddress();
    error NotAuthorizedToMint();
    error MaxSupplyExceeded();
    error InvalidTokenId();
    error EmptyPrompt();
    error EmptyTokenURI();
    error InvalidRoyaltyFee();
    error WithdrawalFailed();
    error NoFundsToWithdraw();
    error BatchSizeExceeded();

    // Events
    event NFTMinted(
        address indexed minter,
        address indexed owner,
        uint256 indexed tokenId,
        string prompt,
        string tokenURI,
        uint256 timestamp
    );
    
    event CollaborativeNFTMinted(
        address indexed user1,
        address indexed user2,
        address indexed minter,
        uint256 tokenId,
        string prompt1,
        string prompt2,
        string tokenURI,
        uint256 timestamp
    );
    
    event MintPriceUpdated(uint256 oldPrice, uint256 newPrice);
    event MaxSupplyUpdated(uint256 oldSupply, uint256 newSupply);
    event RoyaltyUpdated(address recipient, uint96 feeNumerator);

    constructor(
        address initialOwner,
        address royaltyRecipient
    ) ERC721("SynthaMint", "DMV") Ownable(initialOwner) {
        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner);
        _grantRole(ADMIN_ROLE, initialOwner);
        _grantRole(MINTER_ROLE, initialOwner);
        
        // Set default royalty
        _setDefaultRoyalty(royaltyRecipient, royaltyFee);
    }

    /**
     * @dev Mint a single NFT with AI-generated art
     * @param to Address to mint the NFT to
     * @param prompt The AI prompt used to generate the image
     * @param metadataURI The IPFS URI containing the NFT metadata
     */
    function mintNFT(
        address to,
        string calldata prompt,
        string calldata metadataURI
    ) external payable nonReentrant whenNotPaused returns (uint256) {
        if (msg.value < mintPrice) {
            revert InsufficientPayment(mintPrice, msg.value);
        }
        if (to == address(0)) {
            revert InvalidUserAddress();
        }
        if (bytes(prompt).length == 0) {
            revert EmptyPrompt();
        }
        if (bytes(metadataURI).length == 0) {
            revert EmptyTokenURI();
        }
        if (_nextTokenId > maxSupply) {
            revert MaxSupplyExceeded();
        }

        uint256 tokenId = _nextTokenId++;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);
        
        // Update user stats
        userStats[to].totalMinted++;
        userStats[to].lastMintTimestamp = block.timestamp;
        
        emit NFTMinted(
            msg.sender,
            to,
            tokenId,
            prompt,
            metadataURI,
            block.timestamp
        );
        
        return tokenId;
    }

    /**
     * @dev Mint a collaborative NFT between two users
     * @param user1 First collaborator address
     * @param user2 Second collaborator address
     * @param prompt1 First user's prompt
     * @param prompt2 Second user's prompt
     * @param metadataURI The IPFS URI containing the NFT metadata
     */
    function mintCollaborativeNFT(
        address user1,
        address user2,
        string calldata prompt1,
        string calldata prompt2,
        string calldata metadataURI
    ) external payable nonReentrant whenNotPaused returns (uint256) {
        if (msg.value < mintPrice) {
            revert InsufficientPayment(mintPrice, msg.value);
        }
        if (user1 == address(0) || user2 == address(0)) {
            revert InvalidUserAddress();
        }
        if (msg.sender != user1 && msg.sender != user2 && !hasRole(MINTER_ROLE, msg.sender)) {
            revert NotAuthorizedToMint();
        }
        if (bytes(prompt1).length == 0 || bytes(prompt2).length == 0) {
            revert EmptyPrompt();
        }
        if (bytes(metadataURI).length == 0) {
            revert EmptyTokenURI();
        }
        if (_nextTokenId > maxSupply) {
            revert MaxSupplyExceeded();
        }

        uint256 tokenId = _nextTokenId++;
        
        // Mint to the first user (or sender if they're a minter)
        address mintTo = hasRole(MINTER_ROLE, msg.sender) ? user1 : msg.sender;
        _safeMint(mintTo, tokenId);
        _setTokenURI(tokenId, metadataURI);
        
        // Store collaboration info
        collaborations[tokenId] = CollabInfo({
            user1: user1,
            user2: user2,
            prompt1: prompt1,
            prompt2: prompt2,
            timestamp: block.timestamp
        });
        
        // Update user stats
        userStats[user1].totalCollaborations++;
        userStats[user2].totalCollaborations++;
        userStats[mintTo].totalMinted++;
        userStats[mintTo].lastMintTimestamp = block.timestamp;
        
        emit CollaborativeNFTMinted(
            user1,
            user2,
            msg.sender,
            tokenId,
            prompt1,
            prompt2,
            metadataURI,
            block.timestamp
        );
        
        return tokenId;
    }

    /**
     * @dev Batch mint NFTs (only for authorized minters)
     * @param recipients Array of recipient addresses
     * @param prompts Array of prompts
     * @param metadataURIs Array of metadata URIs
     */
    function batchMint(
        address[] calldata recipients,
        string[] calldata prompts,
        string[] calldata metadataURIs
    ) external onlyRole(MINTER_ROLE) nonReentrant whenNotPaused {
        uint256 batchSize = recipients.length;
        
        if (batchSize > MAX_BATCH_SIZE) {
            revert BatchSizeExceeded();
        }
        if (batchSize != prompts.length || batchSize != metadataURIs.length) {
            revert("Array length mismatch");
        }
        if (_nextTokenId + batchSize - 1 > maxSupply) {
            revert MaxSupplyExceeded();
        }

        for (uint256 i = 0; i < batchSize; ) {
            uint256 tokenId = _nextTokenId++;
            
            _safeMint(recipients[i], tokenId);
            _setTokenURI(tokenId, metadataURIs[i]);
            
            userStats[recipients[i]].totalMinted++;
            userStats[recipients[i]].lastMintTimestamp = block.timestamp;
            
            emit NFTMinted(
                msg.sender,
                recipients[i],
                tokenId,
                prompts[i],
                metadataURIs[i],
                block.timestamp
            );
            
            unchecked { ++i; }
        }
    }

    // Admin functions
    
    /**
     * @dev Set the mint price (only admin)
     * @param newPrice New mint price in wei
     */
    function setMintPrice(uint256 newPrice) external onlyRole(ADMIN_ROLE) {
        uint256 oldPrice = mintPrice;
        mintPrice = newPrice;
        emit MintPriceUpdated(oldPrice, newPrice);
    }

    /**
     * @dev Set max supply (only admin)
     * @param newMaxSupply New maximum supply
     */
    function setMaxSupply(uint256 newMaxSupply) external onlyRole(ADMIN_ROLE) {
        if (newMaxSupply < _nextTokenId - 1) {
            revert("Cannot set max supply below current supply");
        }
        uint256 oldSupply = maxSupply;
        maxSupply = newMaxSupply;
        emit MaxSupplyUpdated(oldSupply, newMaxSupply);
    }

    /**
     * @dev Set royalty info (only admin)
     * @param recipient Royalty recipient address
     * @param feeNumerator Royalty fee in basis points
     */
    function setRoyaltyInfo(address recipient, uint96 feeNumerator) external onlyRole(ADMIN_ROLE) {
        if (feeNumerator > 1000) { // Max 10%
            revert InvalidRoyaltyFee();
        }
        _setDefaultRoyalty(recipient, feeNumerator);
        royaltyFee = feeNumerator;
        emit RoyaltyUpdated(recipient, feeNumerator);
    }

    /**
     * @dev Pause the contract (only admin)
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause the contract (only admin)
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @dev Withdraw contract balance (only owner)
     */
    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        if (balance == 0) {
            revert NoFundsToWithdraw();
        }
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        if (!success) {
            revert WithdrawalFailed();
        }
    }

    // View functions
    
    /**
     * @dev Get the total number of tokens minted
     */
    function totalSupply() external view returns (uint256) {
        return _nextTokenId - 1;
    }

    /**
     * @dev Get collaboration info for a token
     */
    function getCollaborationInfo(uint256 tokenId) external view returns (CollabInfo memory) {
        if (!_exists(tokenId)) {
            revert InvalidTokenId();
        }
        return collaborations[tokenId];
    }

    /**
     * @dev Check if a token is a collaboration
     */
    function isCollaboration(uint256 tokenId) external view returns (bool) {
        return collaborations[tokenId].user1 != address(0);
    }

    /**
     * @dev Get user statistics
     */
    function getUserStats(address user) external view returns (UserStats memory) {
        return userStats[user];
    }

    /**
     * @dev Get contract information
     */
    function getContractInfo() external view returns (
        uint256 currentSupply,
        uint256 maxSupply_,
        uint256 mintPrice_,
        uint96 royaltyFee_,
        bool isPaused
    ) {
        return (
            _nextTokenId - 1,
            maxSupply,
            mintPrice,
            royaltyFee,
            paused()
        );
    }

    // Internal functions

    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    // Required overrides

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721, ERC721Pausable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage, ERC721Royalty, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
