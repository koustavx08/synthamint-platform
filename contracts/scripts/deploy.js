const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting deployment of DreamMintNFT contract...");
  console.log("📍 Network:", hre.network.name);
  
  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("👤 Deploying from account:", deployer.address);
  
  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH");
  
  // Deployment parameters
  const initialOwner = deployer.address;
  const royaltyRecipient = deployer.address; // Can be changed later
  
  console.log("📋 Deployment Parameters:");
  console.log("   Initial Owner:", initialOwner);
  console.log("   Royalty Recipient:", royaltyRecipient);

  // Get the contract factory
  const DreamMintNFT = await hre.ethers.getContractFactory("DreamMintNFT");

  // Deploy the contract
  console.log("\n⏳ Deploying contract...");
  const dreamMintNFT = await DreamMintNFT.deploy(initialOwner, royaltyRecipient);

  await dreamMintNFT.waitForDeployment();

  const contractAddress = await dreamMintNFT.getAddress();

  console.log("\n✅ DreamMintNFT deployed successfully!");
  console.log("📍 Contract Address:", contractAddress);
  console.log("🔗 Explorer URL:", getExplorerUrl(hre.network.name, contractAddress));
  
  // Wait for block confirmations before verification
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n⏳ Waiting for block confirmations...");
    await dreamMintNFT.deploymentTransaction().wait(5);
  }

  // Get contract info
  const contractInfo = await dreamMintNFT.getContractInfo();
  console.log("\n� Contract Information:");
  console.log("   Name:", await dreamMintNFT.name());
  console.log("   Symbol:", await dreamMintNFT.symbol());
  console.log("   Current Supply:", contractInfo.currentSupply.toString());
  console.log("   Max Supply:", contractInfo.maxSupply_.toString());
  console.log("   Mint Price:", hre.ethers.formatEther(contractInfo.mintPrice_), "ETH");
  console.log("   Royalty Fee:", contractInfo.royaltyFee_.toString(), "basis points");
  console.log("   Is Paused:", contractInfo.isPaused);

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    contractName: "DreamMintNFT",
    contractAddress: contractAddress,
    deployerAddress: deployer.address,
    initialOwner: initialOwner,
    royaltyRecipient: royaltyRecipient,
    deploymentTime: new Date().toISOString(),
    txHash: dreamMintNFT.deploymentTransaction().hash,
    blockNumber: dreamMintNFT.deploymentTransaction().blockNumber,
    constructorArgs: [initialOwner, royaltyRecipient],
  };

  // Save to file
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }
  
  const filename = `${hre.network.name}-deployment.json`;
  const filepath = path.join(deploymentsDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(deploymentInfo, null, 2));
  
  console.log("\n� Deployment info saved to:", filepath);

  // Update frontend config template
  console.log("\n📝 Frontend Configuration:");
  console.log("Copy the following to your frontend config:");
  console.log("─".repeat(50));
  console.log(`export const CONTRACT_ADDRESS = "${contractAddress}";`);
  console.log(`export const CHAIN_ID = ${hre.network.config.chainId};`);
  console.log(`export const NETWORK_NAME = "${hre.network.name}";`);
  console.log("─".repeat(50));
  
  // Contract verification reminder
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n🔍 To verify the contract, run:");
    console.log(`npm run verify:${hre.network.name}`);
    console.log("\nOr manually:");
    console.log(`npx hardhat verify --network ${hre.network.name} ${contractAddress} "${initialOwner}" "${royaltyRecipient}"`);
  }

  return {
    contract: dreamMintNFT,
    address: contractAddress,
    deploymentInfo
  };
}

function getExplorerUrl(networkName, address) {
  const explorers = {
    fuji: `https://testnet.snowtrace.io/address/${address}`,
    avalanche: `https://snowtrace.io/address/${address}`,
    localhost: `Local deployment - no explorer`,
    hardhat: `Local deployment - no explorer`
  };
  
  return explorers[networkName] || `Unknown network: ${networkName}`;
}

// Only run if this script is called directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Deployment failed:");
      console.error(error);
      process.exit(1);
    });
}

module.exports = main;
