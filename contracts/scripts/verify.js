const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🔍 Starting contract verification...");
  console.log("📍 Network:", hre.network.name);

  // Load deployment info
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  const filename = `${hre.network.name}-deployment.json`;
  const filepath = path.join(deploymentsDir, filename);

  if (!fs.existsSync(filepath)) {
    console.error("❌ Deployment file not found:", filepath);
    console.error("Please deploy the contract first using: npm run deploy:" + hre.network.name);
    process.exit(1);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(filepath, "utf8"));
  
  console.log("📋 Verification Details:");
  console.log("   Contract Address:", deploymentInfo.contractAddress);
  console.log("   Constructor Args:", deploymentInfo.constructorArgs);

  try {
    console.log("\n⏳ Verifying contract...");
    
    await hre.run("verify:verify", {
      address: deploymentInfo.contractAddress,
      constructorArguments: deploymentInfo.constructorArgs,
    });

    console.log("✅ Contract verified successfully!");
    console.log("🔗 View on Explorer:", getExplorerUrl(hre.network.name, deploymentInfo.contractAddress));

  } catch (error) {
    if (error.message.toLowerCase().includes("already verified")) {
      console.log("ℹ️ Contract is already verified!");
    } else {
      console.error("❌ Verification failed:");
      console.error(error.message);
      process.exit(1);
    }
  }
}

function getExplorerUrl(networkName, address) {
  const explorers = {
    fuji: `https://testnet.snowtrace.io/address/${address}`,
    avalanche: `https://snowtrace.io/address/${address}`,
  };
  
  return explorers[networkName] || `Unknown network: ${networkName}`;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Verification script failed:");
    console.error(error);
    process.exit(1);
  });
