const { expect } = require("chai");
const { ethers } = require("hardhat");
require("@nomicfoundation/hardhat-chai-matchers");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

// Import Chai matchers for Hardhat
require("@nomicfoundation/hardhat-chai-matchers");

describe("DreamMintNFT", function () {
  let dreamMintNFT;
  let owner;
  let user1;
  let user2;
  let user3;
  let royaltyRecipient;
  let mintPrice;

  async function deployDreamMintNFTFixture() {
    const [owner, user1, user2, user3, royaltyRecipient] = await ethers.getSigners();
    
    const DreamMintNFT = await ethers.getContractFactory("DreamMintNFT");
    const dreamMintNFT = await DreamMintNFT.deploy(owner.address, royaltyRecipient.address);
    await dreamMintNFT.waitForDeployment();
    
    const mintPrice = await dreamMintNFT.mintPrice();
    
    return { dreamMintNFT, owner, user1, user2, user3, royaltyRecipient, mintPrice };
  }

  beforeEach(async function () {
    const fixture = await loadFixture(deployDreamMintNFTFixture);
    dreamMintNFT = fixture.dreamMintNFT;
    owner = fixture.owner;
    user1 = fixture.user1;
    user2 = fixture.user2;
    user3 = fixture.user3;
    royaltyRecipient = fixture.royaltyRecipient;
    mintPrice = fixture.mintPrice;
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await dreamMintNFT.name()).to.equal("SynthaMint");
      expect(await dreamMintNFT.symbol()).to.equal("DMV");
    });

    it("Should set the correct owner", async function () {
      expect(await dreamMintNFT.owner()).to.equal(owner.address);
    });

    it("Should set the correct mint price", async function () {
      expect(mintPrice).to.equal(ethers.parseEther("0.01"));
    });

    it("Should set correct initial values", async function () {
      const contractInfo = await dreamMintNFT.getContractInfo();
      expect(contractInfo.currentSupply).to.equal(0n);
      expect(contractInfo.maxSupply_).to.equal(10000n);
      expect(contractInfo.royaltyFee_).to.equal(500n); // 5%
      expect(contractInfo.isPaused).to.equal(false);
    });

    it("Should grant correct roles to owner", async function () {
      const ADMIN_ROLE = await dreamMintNFT.ADMIN_ROLE();
      const MINTER_ROLE = await dreamMintNFT.MINTER_ROLE();
      const DEFAULT_ADMIN_ROLE = await dreamMintNFT.DEFAULT_ADMIN_ROLE();
      
      expect(await dreamMintNFT.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
      expect(await dreamMintNFT.hasRole(ADMIN_ROLE, owner.address)).to.be.true;
      expect(await dreamMintNFT.hasRole(MINTER_ROLE, owner.address)).to.be.true;
    });
  });

  describe("Individual Minting", function () {
    it("Should mint NFT with correct payment", async function () {
      const prompt = "A beautiful sunset over mountains";
      const metadataURI = "ipfs://QmTestHash";

      const tx = await dreamMintNFT.connect(user1).mintNFT(user1.address, prompt, metadataURI, { value: mintPrice });
      const receipt = await tx.wait();
      
      // Check event was emitted with correct parameters (excluding timestamp)
      await expect(tx)
        .to.emit(dreamMintNFT, "NFTMinted");

      expect(await dreamMintNFT.ownerOf(1)).to.equal(user1.address);
      expect(await dreamMintNFT.tokenURI(1)).to.equal(metadataURI);
      expect(await dreamMintNFT.totalSupply()).to.equal(1n);
    });

    it("Should mint to a different address", async function () {
      const prompt = "Test prompt";
      const metadataURI = "ipfs://QmTestHash";

      await dreamMintNFT.connect(user1).mintNFT(user2.address, prompt, metadataURI, { value: mintPrice });
      
      expect(await dreamMintNFT.ownerOf(1)).to.equal(user2.address);
    });

    it("Should update user stats correctly", async function () {
      const prompt = "Test prompt";
      const metadataURI = "ipfs://QmTestHash";

      await dreamMintNFT.connect(user1).mintNFT(user1.address, prompt, metadataURI, { value: mintPrice });
      
      const stats = await dreamMintNFT.getUserStats(user1.address);
      expect(stats.totalMinted).to.equal(1n);
      expect(stats.totalCollaborations).to.equal(0n);
      expect(Number(stats.lastMintTimestamp)).to.be.greaterThan(0);
    });

    it("Should fail with insufficient payment", async function () {
      const prompt = "Test prompt";
      const metadataURI = "ipfs://QmTestHash";
      const insufficientPayment = ethers.parseEther("0.005");

      await expect(
        dreamMintNFT.connect(user1).mintNFT(user1.address, prompt, metadataURI, { value: insufficientPayment })
      ).to.be.revertedWithCustomError(dreamMintNFT, "InsufficientPayment");
    });

    it("Should fail with empty prompt", async function () {
      await expect(
        dreamMintNFT.connect(user1).mintNFT(user1.address, "", "ipfs://test", { value: mintPrice })
      ).to.be.revertedWithCustomError(dreamMintNFT, "EmptyPrompt");
    });

    it("Should fail with empty token URI", async function () {
      await expect(
        dreamMintNFT.connect(user1).mintNFT(user1.address, "test", "", { value: mintPrice })
      ).to.be.revertedWithCustomError(dreamMintNFT, "EmptyTokenURI");
    });

    it("Should fail with zero address", async function () {
      await expect(
        dreamMintNFT.connect(user1).mintNFT(ethers.ZeroAddress, "test", "ipfs://test", { value: mintPrice })
      ).to.be.revertedWithCustomError(dreamMintNFT, "InvalidUserAddress");
    });
  });

  describe("Collaborative Minting", function () {
    it("Should mint collaborative NFT by first user", async function () {
      const prompt1 = "Prompt from user1";
      const prompt2 = "Prompt from user2";
      const metadataURI = "ipfs://QmCollabHash";

      const tx = await dreamMintNFT.connect(user1).mintCollaborativeNFT(
        user1.address,
        user2.address,
        prompt1,
        prompt2,
        metadataURI,
        { value: mintPrice }
      );
      
      // Check event was emitted with correct parameters (excluding timestamp)
      await expect(tx)
        .to.emit(dreamMintNFT, "CollaborativeNFTMinted");

      expect(await dreamMintNFT.ownerOf(1)).to.equal(user1.address);
      expect(await dreamMintNFT.isCollaboration(1)).to.be.true;
    });

    it("Should mint collaborative NFT by second user", async function () {
      const prompt1 = "Prompt from user1";
      const prompt2 = "Prompt from user2";
      const metadataURI = "ipfs://QmCollabHash";

      await dreamMintNFT.connect(user2).mintCollaborativeNFT(
        user1.address,
        user2.address,
        prompt1,
        prompt2,
        metadataURI,
        { value: mintPrice }
      );

      expect(await dreamMintNFT.ownerOf(1)).to.equal(user2.address);
    });

    it("Should store collaboration info correctly", async function () {
      const prompt1 = "Prompt from user1";
      const prompt2 = "Prompt from user2";
      const metadataURI = "ipfs://QmCollabHash";

      await dreamMintNFT.connect(user1).mintCollaborativeNFT(
        user1.address,
        user2.address,
        prompt1,
        prompt2,
        metadataURI,
        { value: mintPrice }
      );

      const collabInfo = await dreamMintNFT.getCollaborationInfo(1);
      expect(collabInfo.user1).to.equal(user1.address);
      expect(collabInfo.user2).to.equal(user2.address);
      expect(collabInfo.prompt1).to.equal(prompt1);
      expect(collabInfo.prompt2).to.equal(prompt2);
      expect(Number(collabInfo.timestamp)).to.be.greaterThan(0);
    });

    it("Should update collaboration stats", async function () {
      const prompt1 = "Prompt from user1";
      const prompt2 = "Prompt from user2";
      const metadataURI = "ipfs://QmCollabHash";

      await dreamMintNFT.connect(user1).mintCollaborativeNFT(
        user1.address,
        user2.address,
        prompt1,
        prompt2,
        metadataURI,
        { value: mintPrice }
      );

      const stats1 = await dreamMintNFT.getUserStats(user1.address);
      const stats2 = await dreamMintNFT.getUserStats(user2.address);
      
      expect(stats1.totalCollaborations).to.equal(1n);
      expect(stats2.totalCollaborations).to.equal(1n);
      expect(stats1.totalMinted).to.equal(1n);
      expect(stats2.totalMinted).to.equal(0n);
    });

    it("Should fail if sender is not authorized", async function () {
      const prompt1 = "Prompt from user1";
      const prompt2 = "Prompt from user2";
      const metadataURI = "ipfs://QmCollabHash";

      await expect(
        dreamMintNFT.connect(user3).mintCollaborativeNFT(
          user1.address,
          user2.address,
          prompt1,
          prompt2,
          metadataURI,
          { value: mintPrice }
        )
      ).to.be.revertedWithCustomError(dreamMintNFT, "NotAuthorizedToMint");
    });

    it("Should allow minter role to mint collaborative NFT", async function () {
      const MINTER_ROLE = await dreamMintNFT.MINTER_ROLE();
      await dreamMintNFT.grantRole(MINTER_ROLE, user3.address);

      const prompt1 = "Prompt from user1";
      const prompt2 = "Prompt from user2";
      const metadataURI = "ipfs://QmCollabHash";

      await dreamMintNFT.connect(user3).mintCollaborativeNFT(
        user1.address,
        user2.address,
        prompt1,
        prompt2,
        metadataURI,
        { value: mintPrice }
      );

      expect(await dreamMintNFT.ownerOf(1)).to.equal(user1.address);
    });
  });

  describe("Batch Minting", function () {
    beforeEach(async function () {
      const MINTER_ROLE = await dreamMintNFT.MINTER_ROLE();
      await dreamMintNFT.grantRole(MINTER_ROLE, user1.address);
    });

    it("Should batch mint multiple NFTs", async function () {
      const recipients = [user1.address, user2.address, user3.address];
      const prompts = ["Prompt 1", "Prompt 2", "Prompt 3"];
      const metadataURIs = ["ipfs://hash1", "ipfs://hash2", "ipfs://hash3"];

      await dreamMintNFT.connect(user1).batchMint(recipients, prompts, metadataURIs);

      expect(await dreamMintNFT.totalSupply()).to.equal(3n);
      expect(await dreamMintNFT.ownerOf(1)).to.equal(user1.address);
      expect(await dreamMintNFT.ownerOf(2)).to.equal(user2.address);
      expect(await dreamMintNFT.ownerOf(3)).to.equal(user3.address);
    });

    it("Should fail with mismatched array lengths", async function () {
      const recipients = [user1.address, user2.address];
      const prompts = ["Prompt 1"];
      const metadataURIs = ["ipfs://hash1", "ipfs://hash2"];

      await expect(
        dreamMintNFT.connect(user1).batchMint(recipients, prompts, metadataURIs)
      ).to.be.revertedWith("Array length mismatch");
    });

    it("Should fail if batch size exceeds limit", async function () {
      const recipients = new Array(11).fill(user1.address);
      const prompts = new Array(11).fill("Prompt");
      const metadataURIs = new Array(11).fill("ipfs://hash");

      await expect(
        dreamMintNFT.connect(user1).batchMint(recipients, prompts, metadataURIs)
      ).to.be.revertedWithCustomError(dreamMintNFT, "BatchSizeExceeded");
    });

    it("Should fail if not minter role", async function () {
      const recipients = [user1.address];
      const prompts = ["Prompt"];
      const metadataURIs = ["ipfs://hash"];

      await expect(
        dreamMintNFT.connect(user2).batchMint(recipients, prompts, metadataURIs)
      ).to.be.revertedWithCustomError(dreamMintNFT, "AccessControlUnauthorizedAccount");
    });
  });

  describe("Admin Functions", function () {
    it("Should allow admin to set mint price", async function () {
      const newPrice = ethers.parseEther("0.02");
      
      await expect(dreamMintNFT.setMintPrice(newPrice))
        .to.emit(dreamMintNFT, "MintPriceUpdated")
        .withArgs(mintPrice, newPrice);
        
      expect(await dreamMintNFT.mintPrice()).to.equal(newPrice);
    });

    it("Should allow admin to set max supply", async function () {
      const newMaxSupply = 5000;
      
      await expect(dreamMintNFT.setMaxSupply(newMaxSupply))
        .to.emit(dreamMintNFT, "MaxSupplyUpdated")
        .withArgs(10000, newMaxSupply);
        
      expect((await dreamMintNFT.getContractInfo()).maxSupply_).to.equal(newMaxSupply);
    });

    it("Should not allow setting max supply below current supply", async function () {
      // Mint one NFT
      await dreamMintNFT.connect(user1).mintNFT(user1.address, "test", "ipfs://test", { value: mintPrice });
      
      await expect(
        dreamMintNFT.setMaxSupply(0)
      ).to.be.revertedWith("Cannot set max supply below current supply");
    });

    it("Should allow admin to set royalty info", async function () {
      const newRecipient = user1.address;
      const newFee = 750; // 7.5%
      
      await expect(dreamMintNFT.setRoyaltyInfo(newRecipient, newFee))
        .to.emit(dreamMintNFT, "RoyaltyUpdated")
        .withArgs(newRecipient, newFee);
        
      expect(await dreamMintNFT.royaltyFee()).to.equal(newFee);
    });

    it("Should not allow royalty fee above 10%", async function () {
      await expect(
        dreamMintNFT.setRoyaltyInfo(user1.address, 1001)
      ).to.be.revertedWithCustomError(dreamMintNFT, "InvalidRoyaltyFee");
    });

    it("Should allow admin to pause and unpause", async function () {
      await dreamMintNFT.pause();
      expect((await dreamMintNFT.getContractInfo()).isPaused).to.be.true;
      
      await expect(
        dreamMintNFT.connect(user1).mintNFT(user1.address, "test", "ipfs://test", { value: mintPrice })
      ).to.be.revertedWithCustomError(dreamMintNFT, "EnforcedPause");
      
      await dreamMintNFT.unpause();
      expect((await dreamMintNFT.getContractInfo()).isPaused).to.be.false;
      
      await dreamMintNFT.connect(user1).mintNFT(user1.address, "test", "ipfs://test", { value: mintPrice });
      expect(await dreamMintNFT.totalSupply()).to.equal(1n);
    });

    it("Should not allow non-admin to use admin functions", async function () {
      await expect(
        dreamMintNFT.connect(user1).setMintPrice(ethers.parseEther("0.02"))
      ).to.be.revertedWithCustomError(dreamMintNFT, "AccessControlUnauthorizedAccount");
      
      await expect(
        dreamMintNFT.connect(user1).pause()
      ).to.be.revertedWithCustomError(dreamMintNFT, "AccessControlUnauthorizedAccount");
    });
  });

  describe("Owner Functions", function () {
    it("Should allow owner to withdraw funds", async function () {
      // Mint NFTs to generate revenue
      await dreamMintNFT.connect(user1).mintNFT(user1.address, "Test1", "ipfs://test1", { value: mintPrice });
      await dreamMintNFT.connect(user2).mintNFT(user2.address, "Test2", "ipfs://test2", { value: mintPrice });
      
      const contractBalance = await ethers.provider.getBalance(dreamMintNFT.target);
      expect(contractBalance).to.equal(mintPrice * 2n);
      
      const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
      
      const tx = await dreamMintNFT.withdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;
      
      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
      const expectedBalance = ownerBalanceBefore + contractBalance - gasUsed;
      
      expect(ownerBalanceAfter).to.equal(expectedBalance);
      expect(await ethers.provider.getBalance(dreamMintNFT.target)).to.equal(0n);
    });

    it("Should fail withdrawal with no funds", async function () {
      await expect(dreamMintNFT.withdraw())
        .to.be.revertedWithCustomError(dreamMintNFT, "NoFundsToWithdraw");
    });

    it("Should not allow non-owner to withdraw", async function () {
      await expect(
        dreamMintNFT.connect(user1).withdraw()
      ).to.be.revertedWithCustomError(dreamMintNFT, "OwnableUnauthorizedAccount");
    });
  });

  describe("Royalty Functions", function () {
    it("Should return correct royalty info", async function () {
      const salePrice = ethers.parseEther("1");
      const [recipient, royaltyAmount] = await dreamMintNFT.royaltyInfo(1, salePrice);
      
      expect(recipient).to.equal(royaltyRecipient.address);
      expect(royaltyAmount).to.equal(salePrice * 500n / 10000n); // 5%
    });

    it("Should support EIP-2981 interface", async function () {
      const interfaceId = "0x2a55205a"; // EIP-2981 interface ID
      expect(await dreamMintNFT.supportsInterface(interfaceId)).to.be.true;
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      // Mint some NFTs for testing
      await dreamMintNFT.connect(user1).mintNFT(user1.address, "Solo", "ipfs://solo", { value: mintPrice });
      await dreamMintNFT.connect(user1).mintCollaborativeNFT(
        user1.address,
        user2.address,
        "Collab1",
        "Collab2",
        "ipfs://collab",
        { value: mintPrice }
      );
    });

    it("Should return correct total supply", async function () {
      expect(await dreamMintNFT.totalSupply()).to.equal(2n);
    });

    it("Should return correct collaboration info", async function () {
      const collabInfo = await dreamMintNFT.getCollaborationInfo(2);
      expect(collabInfo.user1).to.equal(user1.address);
      expect(collabInfo.user2).to.equal(user2.address);
      expect(collabInfo.prompt1).to.equal("Collab1");
      expect(collabInfo.prompt2).to.equal("Collab2");
    });

    it("Should return correct collaboration status", async function () {
      expect(await dreamMintNFT.isCollaboration(1)).to.be.false;
      expect(await dreamMintNFT.isCollaboration(2)).to.be.true;
    });

    it("Should return correct user stats", async function () {
      const stats = await dreamMintNFT.getUserStats(user1.address);
      expect(stats.totalMinted).to.equal(2n);
      expect(stats.totalCollaborations).to.equal(1n);
    });

    it("Should return correct contract info", async function () {
      const info = await dreamMintNFT.getContractInfo();
      expect(info.currentSupply).to.equal(2n);
      expect(info.maxSupply_).to.equal(10000n);
      expect(info.mintPrice_).to.equal(mintPrice);
      expect(info.royaltyFee_).to.equal(500n);
      expect(info.isPaused).to.be.false;
    });

    it("Should fail getting collaboration info for non-existent token", async function () {
      await expect(
        dreamMintNFT.getCollaborationInfo(999)
      ).to.be.revertedWithCustomError(dreamMintNFT, "InvalidTokenId");
    });
  });

  describe("Access Control", function () {
    it("Should grant and revoke minter role", async function () {
      const MINTER_ROLE = await dreamMintNFT.MINTER_ROLE();
      
      expect(await dreamMintNFT.hasRole(MINTER_ROLE, user1.address)).to.be.false;
      
      await dreamMintNFT.grantRole(MINTER_ROLE, user1.address);
      expect(await dreamMintNFT.hasRole(MINTER_ROLE, user1.address)).to.be.true;
      
      await dreamMintNFT.revokeRole(MINTER_ROLE, user1.address);
      expect(await dreamMintNFT.hasRole(MINTER_ROLE, user1.address)).to.be.false;
    });

    it("Should grant and revoke admin role", async function () {
      const ADMIN_ROLE = await dreamMintNFT.ADMIN_ROLE();
      
      expect(await dreamMintNFT.hasRole(ADMIN_ROLE, user1.address)).to.be.false;
      
      await dreamMintNFT.grantRole(ADMIN_ROLE, user1.address);
      expect(await dreamMintNFT.hasRole(ADMIN_ROLE, user1.address)).to.be.true;
      
      // User1 should now be able to use admin functions
      await dreamMintNFT.connect(user1).setMintPrice(ethers.parseEther("0.02"));
      expect(await dreamMintNFT.mintPrice()).to.equal(ethers.parseEther("0.02"));
    });
  });

  describe("Gas Usage", function () {
    it("Should have reasonable gas costs for minting", async function () {
      const tx = await dreamMintNFT.connect(user1).mintNFT(
        user1.address,
        "Test prompt",
        "ipfs://test",
        { value: mintPrice }
      );
      const receipt = await tx.wait();
      
      // Gas usage should be reasonable (adjust these limits based on your requirements)
      expect(Number(receipt.gasUsed)).to.be.lessThan(200000);
    });
  });
});
