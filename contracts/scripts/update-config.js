const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🔧 Updating frontend configuration...");

  // Load deployment info
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  const networks = ["localhost", "fuji", "avalanche"];
  
  let deployments = {};
  
  for (const network of networks) {
    const filename = `${network}-deployment.json`;
    const filepath = path.join(deploymentsDir, filename);
    
    if (fs.existsSync(filepath)) {
      const deploymentInfo = JSON.parse(fs.readFileSync(filepath, "utf8"));
      deployments[network] = deploymentInfo;
      console.log(`📍 Found ${network} deployment:`, deploymentInfo.contractAddress);
    }
  }

  if (Object.keys(deployments).length === 0) {
    console.error("❌ No deployments found!");
    console.error("Please deploy the contract first.");
    process.exit(1);
  }

  // Generate TypeScript config file
  const configContent = generateConfigFile(deployments);
  
  // Write to frontend config directory
  const frontendConfigDir = path.join(__dirname, "..", "..", "src", "config");
  const configFilePath = path.join(frontendConfigDir, "contract.ts");
  
  // Ensure directory exists
  if (!fs.existsSync(frontendConfigDir)) {
    fs.mkdirSync(frontendConfigDir, { recursive: true });
  }
  
  fs.writeFileSync(configFilePath, configContent);
  
  console.log("✅ Frontend configuration updated!");
  console.log("📁 Config file:", configFilePath);
  
  // Also create a deployments summary
  const summaryPath = path.join(deploymentsDir, "summary.json");
  fs.writeFileSync(summaryPath, JSON.stringify(deployments, null, 2));
  console.log("📊 Deployments summary:", summaryPath);
}

function generateConfigFile(deployments) {
  const imports = `// Auto-generated contract configuration
// DO NOT EDIT MANUALLY - Update using: npm run update-config

export interface ContractConfig {
  address: string;
  chainId: number;
  network: string;
  deployedAt: string;
}

export interface ContractConfigs {
  [key: string]: ContractConfig;
}
`;

  const configs = Object.entries(deployments).map(([network, info]) => {
    return `  ${network}: {
    address: "${info.contractAddress}",
    chainId: ${info.chainId},
    network: "${network}",
    deployedAt: "${info.deploymentTime}"
  }`;
  }).join(",\n");

  const exports = `
export const CONTRACT_CONFIGS: ContractConfigs = {
${configs}
};

// Helper function to get config by network
export function getContractConfig(network: string): ContractConfig | undefined {
  return CONTRACT_CONFIGS[network];
}

// Helper function to get config by chain ID
export function getContractConfigByChainId(chainId: number): ContractConfig | undefined {
  return Object.values(CONTRACT_CONFIGS).find(config => config.chainId === chainId);
}

// Current environment config (defaults to localhost for development)
export const CURRENT_CONTRACT_CONFIG = getContractConfig(
  process.env.NODE_ENV === 'production' ? 'avalanche' : 'fuji'
) || CONTRACT_CONFIGS.localhost;

// Export individual configs for convenience
${Object.keys(deployments).map(network => 
  `export const ${network.toUpperCase()}_CONFIG = CONTRACT_CONFIGS.${network};`
).join('\n')}

// Contract ABI (add your ABI here)
export const CONTRACT_ABI = [
  // Add the ABI from your compiled contract here
  // You can get it from artifacts/contracts/SynthaMintNFT.sol/DreamMintNFT.json
] as const;
`;

  return imports + exports;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Config update failed:");
    console.error(error);
    process.exit(1);
  });
