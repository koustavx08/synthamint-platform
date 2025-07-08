// Auto-generated contract configuration
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

export const CONTRACT_CONFIGS: ContractConfigs = {
  fuji: {
    address: "0x75123e5fF2efB0ECa8b8DaBE532c0f4844BBa439",
    chainId: 43113,
    network: "fuji",
    deployedAt: "2025-07-08T06:32:16.210Z"
  }
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
export const FUJI_CONFIG = CONTRACT_CONFIGS.fuji;



// Legacy exports for compatibility with existing app
export const NFT_CONTRACT_ADDRESS = CURRENT_CONTRACT_CONFIG?.address || '0x75123e5fF2efB0ECa8b8DaBE532c0f4844BBa439';

export const NFT_CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "prompt",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "metadataURI",
        "type": "string"
      }
    ],
    "name": "mintNFT",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user1",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "user2",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "prompt1",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "prompt2",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "metadataURI",
        "type": "string"
      }
    ],
    "name": "mintCollaborativeNFT",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "mintPrice",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getContractInfo",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "currentSupply",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "maxSupply_",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "mintPrice_",
        "type": "uint256"
      },
      {
        "internalType": "uint96",
        "name": "royaltyFee_",
        "type": "uint96"
      },
      {
        "internalType": "bool",
        "name": "isPaused",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getUserStats",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "totalMinted",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "totalCollaborations",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "lastMintTimestamp",
            "type": "uint256"
          }
        ],
        "internalType": "struct DreamMintNFT.UserStats",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "prompt",
        "type": "string"
      }
    ],
    "name": "Minted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user1",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "user2",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "minter",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "prompt1",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "prompt2",
        "type": "string"
      }
    ],
    "name": "CollaborativeMinted",
    "type": "event"
  }
] as const;

// Complete Contract ABI alias (for compatibility)
export const CONTRACT_ABI = NFT_CONTRACT_ABI;
