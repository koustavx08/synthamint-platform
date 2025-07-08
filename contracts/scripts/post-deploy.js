const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🔧 Performing post-deployment setup...");

  const networkName = hre.network.name;
  console.log("📍 Network:", networkName);

  // Load deployment info
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  const deploymentFile = path.join(deploymentsDir, `${networkName}-deployment.json`);

  if (!fs.existsSync(deploymentFile)) {
    console.error("❌ Deployment file not found:", deploymentFile);
    console.error("Please deploy the contract first.");
    process.exit(1);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  const contractAddress = deploymentInfo.contractAddress;

  console.log("📍 Contract Address:", contractAddress);

  // Get contract instance
  const DreamMintNFT = await hre.ethers.getContractFactory("DreamMintNFT");
  const contract = DreamMintNFT.attach(contractAddress);

  // Perform setup tasks
  await performSetupTasks(contract, deploymentInfo);

  console.log("✅ Post-deployment setup completed!");
}

async function performSetupTasks(contract, deploymentInfo) {
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("\n🔧 Running setup tasks...");

  try {
    // 1. Verify contract is properly deployed
    console.log("1️⃣ Verifying contract deployment...");
    const contractInfo = await contract.getContractInfo();
    console.log("   ✅ Contract is responsive");
    console.log("   📊 Current supply:", contractInfo.currentSupply.toString());
    console.log("   📊 Max supply:", contractInfo.maxSupply_.toString());
    console.log("   💰 Mint price:", hre.ethers.formatEther(contractInfo.mintPrice_), "ETH");

    // 2. Set up additional minters if needed
    console.log("\n2️⃣ Setting up additional roles...");
    const MINTER_ROLE = await contract.MINTER_ROLE();
    
    // Add deployer as minter for testing (can be removed later)
    if (!(await contract.hasRole(MINTER_ROLE, deployer.address))) {
      console.log("   🔐 Granting MINTER_ROLE to deployer...");
      await contract.grantRole(MINTER_ROLE, deployer.address);
      console.log("   ✅ MINTER_ROLE granted");
    } else {
      console.log("   ℹ️ Deployer already has MINTER_ROLE");
    }

    // 3. Test minting functionality
    if (hre.network.name !== "avalanche") { // Don't test on mainnet
      console.log("\n3️⃣ Testing minting functionality...");
      
      try {
        const testPrompt = "Test deployment - Beautiful AI generated sunset";
        const testMetadataURI = "ipfs://QmTestDeploymentHash123";
        const mintPrice = await contract.mintPrice();

        console.log("   🧪 Performing test mint...");
        const tx = await contract.mintNFT(
          deployer.address,
          testPrompt,
          testMetadataURI,
          { value: mintPrice }
        );
        await tx.wait();

        const totalSupply = await contract.totalSupply();
        console.log("   ✅ Test mint successful! Total supply:", totalSupply.toString());

        // Get user stats
        const userStats = await contract.getUserStats(deployer.address);
        console.log("   📊 User stats - Total minted:", userStats.totalMinted.toString());
      } catch (error) {
        console.log("   ⚠️ Test mint failed (this might be expected):", error.message);
      }
    }

    // 4. Generate frontend configuration
    console.log("\n4️⃣ Generating frontend configuration...");
    await generateFrontendConfig(contract, deploymentInfo);

    // 5. Display useful information
    console.log("\n5️⃣ Deployment Summary:");
    console.log("   🏠 Contract Address:", deploymentInfo.contractAddress);
    console.log("   🌐 Network:", deploymentInfo.network);
    console.log("   ⛽ Chain ID:", deploymentInfo.chainId);
    console.log("   👤 Owner:", deploymentInfo.initialOwner);
    console.log("   💎 Royalty Recipient:", deploymentInfo.royaltyRecipient);
    console.log("   🔗 Explorer:", getExplorerUrl(deploymentInfo.network, deploymentInfo.contractAddress));

  } catch (error) {
    console.error("❌ Setup task failed:", error.message);
    throw error;
  }
}

async function generateFrontendConfig(contract, deploymentInfo) {
  try {
    // Generate ABI
    const artifact = await hre.artifacts.readArtifact("DreamMintNFT");
    const contractABI = artifact.abi;

    // Create config object
    const config = {
      contractAddress: deploymentInfo.contractAddress,
      chainId: deploymentInfo.chainId,
      network: deploymentInfo.network,
      abi: contractABI,
      deploymentInfo: {
        deployer: deploymentInfo.deployerAddress,
        owner: deploymentInfo.initialOwner,
        royaltyRecipient: deploymentInfo.royaltyRecipient,
        deployedAt: deploymentInfo.deploymentTime,
        txHash: deploymentInfo.txHash
      }
    };

    // Save to multiple formats
    const outputDir = path.join(__dirname, "..", "frontend-config");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // JSON config
    fs.writeFileSync(
      path.join(outputDir, `${deploymentInfo.network}-config.json`),
      JSON.stringify(config, null, 2)
    );

    // TypeScript config
    const tsConfig = `// Auto-generated configuration for ${deploymentInfo.network}
export const ${deploymentInfo.network.toUpperCase()}_CONTRACT_CONFIG = ${JSON.stringify(config, null, 2)} as const;

export const CONTRACT_ADDRESS = "${deploymentInfo.contractAddress}";
export const CHAIN_ID = ${deploymentInfo.chainId};
export const NETWORK_NAME = "${deploymentInfo.network}";
`;

    fs.writeFileSync(
      path.join(outputDir, `${deploymentInfo.network}-config.ts`),
      tsConfig
    );

    console.log("   ✅ Frontend config generated in:", outputDir);

  } catch (error) {
    console.log("   ⚠️ Frontend config generation failed:", error.message);
  }
}

function getExplorerUrl(networkName, address) {
  const explorers = {
    fuji: `https://testnet.snowtrace.io/address/${address}`,
    avalanche: `https://snowtrace.io/address/${address}`,
    localhost: "Local deployment - no explorer",
    hardhat: "Local deployment - no explorer"
  };
  
  return explorers[networkName] || `Unknown network: ${networkName}`;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Post-deployment setup failed:");
    console.error(error);
    process.exit(1);
  });
