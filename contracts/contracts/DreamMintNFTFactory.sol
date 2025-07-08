// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../SynthaMintNFT.sol";

/**
 * @title DreamMintNFTFactory
 * @dev Factory contract to deploy multiple instances of DreamMintNFT
 */
contract DreamMintNFTFactory {
    event ContractDeployed(
        address indexed deployer,
        address indexed contractAddress,
        string name,
        string symbol
    );

    mapping(address => address[]) public deployedContracts;
    address[] public allContracts;

    /**
     * @dev Deploy a new DreamMintNFT contract
     * @param initialOwner The initial owner of the contract
     * @param royaltyRecipient The royalty recipient address
     * @param name The name of the NFT collection
     * @param symbol The symbol of the NFT collection
     */
    function deployContract(
        address initialOwner,
        address royaltyRecipient,
        string memory name,
        string memory symbol
    ) external returns (address) {
        // Deploy new contract with CREATE2 for deterministic addresses
        bytes32 salt = keccak256(abi.encodePacked(msg.sender, block.timestamp));
        
        DreamMintNFT newContract = new DreamMintNFT{salt: salt}(
            initialOwner,
            royaltyRecipient
        );

        address contractAddress = address(newContract);
        
        deployedContracts[msg.sender].push(contractAddress);
        allContracts.push(contractAddress);

        emit ContractDeployed(msg.sender, contractAddress, name, symbol);

        return contractAddress;
    }

    /**
     * @dev Get all contracts deployed by a specific address
     */
    function getDeployedContracts(address deployer) 
        external 
        view 
        returns (address[] memory) 
    {
        return deployedContracts[deployer];
    }

    /**
     * @dev Get total number of deployed contracts
     */
    function getTotalContracts() external view returns (uint256) {
        return allContracts.length;
    }

    /**
     * @dev Get contract at specific index
     */
    function getContractAt(uint256 index) external view returns (address) {
        require(index < allContracts.length, "Index out of bounds");
        return allContracts[index];
    }
}
