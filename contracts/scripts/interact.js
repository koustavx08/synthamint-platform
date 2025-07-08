const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("📊 Contract Interaction Script");
  console.log("🌐 Network:", hre.network.name);

  // Load deployment
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  const deploymentFile = path.join(deploymentsDir, `${hre.network.name}-deployment.json`);

  if (!fs.existsSync(deploymentFile)) {
    console.error("❌ No deployment found for", hre.network.name);
    process.exit(1);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  const [deployer, user1, user2] = await hre.ethers.getSigners();

  // Get contract instance
  const DreamMintNFT = await hre.ethers.getContractFactory("DreamMintNFT");
  const contract = DreamMintNFT.attach(deploymentInfo.contractAddress);

  console.log("📍 Contract:", deploymentInfo.contractAddress);
  console.log("👤 Deployer:", deployer.address);

  // Interactive menu
  const action = process.argv[2];

  switch (action) {
    case "info":
      await showContractInfo(contract);
      break;
    case "mint":
      await testMint(contract, deployer);
      break;
    case "collab":
      await testCollabMint(contract, deployer, user1);
      break;
    case "stats":
      await showStats(contract, deployer.address);
      break;
    case "admin":
      await adminActions(contract, deployer);
      break;
    default:
      showHelp();
  }
}

async function showContractInfo(contract) {
  console.log("\n📋 Contract Information:");
  
  const name = await contract.name();
  const symbol = await contract.symbol();
  const owner = await contract.owner();
  const contractInfo = await contract.getContractInfo();

  console.log("   Name:", name);
  console.log("   Symbol:", symbol);
  console.log("   Owner:", owner);
  console.log("   Current Supply:", contractInfo.currentSupply.toString());
  console.log("   Max Supply:", contractInfo.maxSupply_.toString());
  console.log("   Mint Price:", hre.ethers.formatEther(contractInfo.mintPrice_), "ETH");
  console.log("   Royalty Fee:", contractInfo.royaltyFee_.toString(), "basis points");
  console.log("   Is Paused:", contractInfo.isPaused);
}

async function testMint(contract, signer) {
  console.log("\n🎨 Testing Individual Mint:");
  
  const prompt = "A beautiful AI-generated landscape with mountains and rivers";
  const metadataURI = `ipfs://QmTest${Date.now()}`;
  const mintPrice = await contract.mintPrice();

  try {
    console.log("   Prompt:", prompt);
    console.log("   Metadata URI:", metadataURI);
    console.log("   Mint Price:", hre.ethers.formatEther(mintPrice), "ETH");

    const tx = await contract.connect(signer).mintNFT(
      signer.address,
      prompt,
      metadataURI,
      { value: mintPrice }
    );

    console.log("   🔄 Transaction hash:", tx.hash);
    const receipt = await tx.wait();
    console.log("   ✅ Minted! Gas used:", receipt.gasUsed.toString());

    const totalSupply = await contract.totalSupply();
    console.log("   📊 New total supply:", totalSupply.toString());

  } catch (error) {
    console.error("   ❌ Mint failed:", error.message);
  }
}

async function testCollabMint(contract, user1, user2) {
  console.log("\n🤝 Testing Collaborative Mint:");
  
  const prompt1 = "Cyberpunk cityscape with neon lights";
  const prompt2 = "Peaceful nature scene with wildlife";
  const metadataURI = `ipfs://QmCollab${Date.now()}`;
  const mintPrice = await contract.mintPrice();

  try {
    console.log("   User 1:", user1.address);
    console.log("   User 2:", user2.address);
    console.log("   Prompt 1:", prompt1);
    console.log("   Prompt 2:", prompt2);

    const tx = await contract.connect(user1).mintCollaborativeNFT(
      user1.address,
      user2.address,
      prompt1,
      prompt2,
      metadataURI,
      { value: mintPrice }
    );

    console.log("   🔄 Transaction hash:", tx.hash);
    const receipt = await tx.wait();
    console.log("   ✅ Collaborative NFT minted! Gas used:", receipt.gasUsed.toString());

    const totalSupply = await contract.totalSupply();
    const tokenId = totalSupply; // Latest token
    const isCollab = await contract.isCollaboration(tokenId);
    console.log("   📊 Token ID:", tokenId.toString());
    console.log("   🤝 Is collaboration:", isCollab);

  } catch (error) {
    console.error("   ❌ Collaborative mint failed:", error.message);
  }
}

async function showStats(contract, userAddress) {
  console.log("\n📊 User Statistics:");
  console.log("   Address:", userAddress);
  
  try {
    const stats = await contract.getUserStats(userAddress);
    console.log("   Total Minted:", stats.totalMinted.toString());
    console.log("   Total Collaborations:", stats.totalCollaborations.toString());
    console.log("   Last Mint:", new Date(Number(stats.lastMintTimestamp) * 1000).toLocaleString());

    // Show owned tokens
    const totalSupply = await contract.totalSupply();
    const ownedTokens = [];

    for (let i = 1; i <= totalSupply; i++) {
      try {
        const owner = await contract.ownerOf(i);
        if (owner.toLowerCase() === userAddress.toLowerCase()) {
          ownedTokens.push(i);
        }
      } catch (error) {
        // Token doesn't exist or error reading
      }
    }

    console.log("   Owned Tokens:", ownedTokens.join(", ") || "None");

  } catch (error) {
    console.error("   ❌ Failed to get stats:", error.message);
  }
}

async function adminActions(contract, signer) {
  console.log("\n🔧 Admin Actions:");
  
  try {
    const ADMIN_ROLE = await contract.ADMIN_ROLE();
    const hasAdminRole = await contract.hasRole(ADMIN_ROLE, signer.address);
    
    console.log("   Has Admin Role:", hasAdminRole);

    if (!hasAdminRole) {
      console.log("   ⚠️ No admin permissions");
      return;
    }

    // Show current settings
    const contractInfo = await contract.getContractInfo();
    console.log("   Current Mint Price:", hre.ethers.formatEther(contractInfo.mintPrice_), "ETH");
    console.log("   Current Max Supply:", contractInfo.maxSupply_.toString());
    console.log("   Is Paused:", contractInfo.isPaused);

    // Example: Set new mint price (commented out for safety)
    /*
    console.log("   🔧 Setting new mint price...");
    const newPrice = hre.ethers.parseEther("0.02");
    const tx = await contract.setMintPrice(newPrice);
    await tx.wait();
    console.log("   ✅ New mint price set:", hre.ethers.formatEther(newPrice), "ETH");
    */

  } catch (error) {
    console.error("   ❌ Admin action failed:", error.message);
  }
}

function showHelp() {
  console.log("\n📖 Usage:");
  console.log("   npm run interact info     - Show contract information");
  console.log("   npm run interact mint     - Test individual minting");
  console.log("   npm run interact collab   - Test collaborative minting");
  console.log("   npm run interact stats    - Show user statistics");
  console.log("   npm run interact admin    - Show admin capabilities");
  console.log("\nExample:");
  console.log("   node scripts/interact.js info");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
