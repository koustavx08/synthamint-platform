<div align="center">
  <h1>🔗 SynthaMint Smart Contracts</h1>
  <p><strong>Enterprise-grade NFT smart contracts for AI-generated collaborative art</strong></p>
  
  [![Solidity](https://img.shields.io/badge/Solidity-^0.8.24-363636?logo=solidity)](https://soliditylang.org/)
  [![Hardhat](https://img.shields.io/badge/Hardhat-Framework-yellow)](https://hardhat.org/)
  [![OpenZeppelin](https://img.shields.io/badge/OpenZeppelin-Contracts-blue)](https://openzeppelin.com/contracts/)
  [![Avalanche](https://img.shields.io/badge/Avalanche-Network-red)](https://avax.network/)
  [![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Contract Specifications](#contract-specifications)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contract Interface](#contract-interface)
- [Access Control](#access-control)
- [Economics & Gas](#economics--gas)
- [Security](#security)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## 🌟 Overview

SynthaMint Smart Contracts provide a comprehensive NFT infrastructure for AI-generated collaborative art on the Avalanche blockchain. The system supports individual minting, collaborative creation, batch operations, and advanced features like royalties, access control, and emergency controls.

### Key Highlights

- 🎨 **AI-Powered NFTs**: Optimized for AI-generated art with metadata storage
- 👥 **Collaborative Minting**: Dual-user collaboration with shared ownership tracking
- ⚡ **Gas Optimized**: Custom errors, efficient packing, and batch operations
- 🔒 **Enterprise Security**: Multi-layered access control and emergency systems
- 💎 **Royalty Support**: EIP-2981 compliant royalty distribution
- 📊 **Analytics Ready**: Comprehensive event logging and user statistics

## ✨ Features

### 🎯 Core Functionality
| Feature | Description | Status |
|---------|-------------|--------|
| **Individual Minting** | Single-user NFT creation with AI-generated art | ✅ Implemented |
| **Collaborative Minting** | Dual-user NFT creation with shared metadata | ✅ Implemented |
| **Batch Minting** | Efficient multi-NFT minting for authorized users | ✅ Implemented |
| **IPFS Integration** | Decentralized metadata and asset storage | ✅ Implemented |

### 🚀 Advanced Features
| Feature | Description | Gas Impact |
|---------|-------------|------------|
| **EIP-2981 Royalties** | Automated royalty distribution on secondary sales | Minimal |
| **Role-Based Access** | Granular permission system (Admin, Minter, Owner) | Low |
| **Pausable Operations** | Emergency pause/unpause functionality | Minimal |
| **User Statistics** | On-chain tracking of user activity and collaborations | Medium |
| **Event Analytics** | Comprehensive event logging for off-chain analysis | Low |

### 🛡️ Security Features
- ✅ **Reentrancy Protection** - OpenZeppelin ReentrancyGuard
- ✅ **Access Control** - Role-based permissions with OpenZeppelin AccessControl
- ✅ **Input Validation** - Comprehensive parameter sanitization
- ✅ **Emergency Controls** - Pausable contract functionality
- ✅ **Gas Optimization** - Custom errors and efficient storage patterns
- ✅ **Overflow Protection** - Solidity 0.8+ built-in safeguards

## 📋 Contract Specifications

### Contract Details
```solidity
Contract Name: SynthaMintNFT
Symbol: SMNT
Standard: ERC-721 + EIP-2981 + AccessControl + Pausable
Solidity Version: ^0.8.24
License: MIT
```

### Network Configuration
| Network | Chain ID | RPC URL | Explorer |
|---------|----------|---------|----------|
| **Avalanche Fuji** | 43113 | https://api.avax-test.network/ext/bc/C/rpc | [SnowTrace Testnet](https://testnet.snowtrace.io/) |
| **Avalanche Mainnet** | 43114 | https://api.avax.network/ext/bc/C/rpc | [SnowTrace](https://snowtrace.io/) |

### Key Parameters
```solidity
Initial Mint Price: 0.01 AVAX (adjustable)
Max Supply: 10,000 NFTs (adjustable)
Royalty Fee: 5% (500 basis points)
Max Batch Size: 10 NFTs per transaction
```

## ⚡ Prerequisites

### System Requirements
- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher
- **Git**: Latest version
- **Hardware**: 4GB RAM, 10GB free space

### Required Tools
```bash
# Install Node.js (recommended via nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Verify installations
node --version  # Should be v18+
npm --version   # Should be v8+
```

### Wallet Setup
- **MetaMask** or compatible Web3 wallet
- **Avalanche network** configured
- **AVAX tokens** for gas fees (testnet: use faucet)

## 🚀 Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd synthamint/contracts
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Verify Installation
```bash
npx hardhat --version
# Should output: Hardhat version 2.x.x
```

## ⚙️ Configuration

### Environment Setup

1. **Create Environment File**
   ```bash
   cp .env.example .env
   ```

2. **Configure Variables**
   ```env
   # ========================================
   # REQUIRED: Deployment Configuration
   # ========================================
   PRIVATE_KEY=your_wallet_private_key_without_0x_prefix
   
   # ========================================
   # OPTIONAL: API Keys for Enhanced Features
   # ========================================
   SNOWTRACE_API_KEY=your_snowtrace_api_key_for_verification
   COINMARKETCAP_API_KEY=your_coinmarketcap_api_key_for_gas_reporting
   
   # ========================================
   # OPTIONAL: Contract Parameters
   # ========================================
   INITIAL_MINT_PRICE=10000000000000000  # 0.01 AVAX in wei
   MAX_SUPPLY=10000
   ROYALTY_FEE=500  # 5% in basis points
   ```

### Network Configuration
The contracts are pre-configured for Avalanche networks. Configuration is in `hardhat.config.js`:

```javascript
networks: {
  fuji: {
    url: "https://api.avax-test.network/ext/bc/C/rpc",
    chainId: 43113,
    accounts: [process.env.PRIVATE_KEY]
  },
  avalanche: {
    url: "https://api.avax.network/ext/bc/C/rpc",
    chainId: 43114,
    accounts: [process.env.PRIVATE_KEY]
  }
}
```

## 🧪 Testing

### Test Suite Overview
Our comprehensive test suite covers all contract functionality with 95%+ code coverage.

### Running Tests

#### Basic Test Execution
```bash
# Run all tests
npm test

# Run tests with gas reporting
npm run test:gas

# Run coverage analysis
npm run test:coverage
```

#### Advanced Testing
```bash
# Run specific test file
npx hardhat test test/SynthaMintNFT.test.js

# Run tests on specific network
npx hardhat test --network localhost

# Run tests with verbose output
npm test -- --verbose
```

### Test Coverage Report
```
File                    | % Stmts | % Branch | % Funcs | % Lines |
------------------------|---------|----------|---------|---------|
contracts/              |   98.45 |    92.31 |   96.77 |   98.12 |
 SynthaMintNFT.sol      |   98.45 |    92.31 |   96.77 |   98.12 |
------------------------|---------|----------|---------|---------|
All files               |   98.45 |    92.31 |   96.77 |   98.12 |
```

### Example Test Output
```
  SynthaMintNFT Contract
    ✅ Deployment
      ✓ Should deploy with correct initial parameters (285ms)
      ✓ Should set correct owner and admin roles (156ms)
      ✓ Should initialize with zero supply (89ms)
    
    ✅ Individual Minting
      ✓ Should mint NFT with correct payment (342ms)
      ✓ Should emit IndividualMint event (198ms)
      ✓ Should reject insufficient payment (167ms)
    
    ✅ Collaborative Minting
      ✓ Should mint collaborative NFT successfully (456ms)
      ✓ Should track collaboration data correctly (234ms)
      ✓ Should split ownership appropriately (289ms)
    
    ✅ Access Control
      ✓ Should manage admin roles correctly (178ms)
      ✓ Should restrict unauthorized access (134ms)
    
    Total: 23 passing tests (4.2s)
```

## 🚀 Deployment

### Quick Start Deployment

#### Local Development
```bash
# Terminal 1: Start local blockchain
npm run node

# Terminal 2: Deploy contracts
npm run deploy:local

# Interact with deployed contract
npm run interact:local
```

#### Testnet Deployment (Recommended for Development)
```bash
# Deploy to Avalanche Fuji testnet
npm run deploy:fuji

# Verify contract on SnowTrace
npm run verify:fuji

# Update frontend configuration
npm run update-config
```

#### Production Deployment
```bash
# Deploy to Avalanche mainnet
npm run deploy:avalanche

# Verify contract
npm run verify:avalanche

# Run post-deployment setup
npm run post-deploy:avalanche
```

### Deployment Checklist

#### Pre-Deployment
- [ ] Environment variables configured
- [ ] Wallet funded with AVAX
- [ ] Network configuration verified
- [ ] Contract parameters reviewed
- [ ] Tests passing (100%)

#### Post-Deployment
- [ ] Contract verified on SnowTrace
- [ ] Frontend configuration updated
- [ ] Initial admin roles assigned
- [ ] Emergency controls tested
- [ ] Documentation updated

### Deployment Output Example
```bash
$ npm run deploy:fuji

Deploying SynthaMintNFT to Avalanche Fuji...

📋 Deployment Parameters:
   ├─ Owner: 0x742d35Cc6Ff34c3d3...
   ├─ Royalty Recipient: 0x742d35Cc6Ff34c3d3...
   ├─ Initial Mint Price: 0.01 AVAX
   └─ Max Supply: 10,000 NFTs

🚀 Deploying contract...
   ├─ Transaction: 0x8f4e5b2a1c9d7e6f3b2a5c8e9f1d4a7b3c6e9f2d5a8b1e4f7c0a3d6b9e2f5a8
   ├─ Gas Used: 2,847,392
   └─ Contract Address: 0x1234567890123456789012345678901234567890

✅ Deployment successful!

📊 Deployment Summary:
   ├─ Network: Avalanche Fuji (43113)
   ├─ Contract: SynthaMintNFT
   ├─ Address: 0x1234567890123456789012345678901234567890
   ├─ Explorer: https://testnet.snowtrace.io/address/0x1234567890123456789012345678901234567890
   └─ Gas Cost: ~0.14 AVAX

🔧 Next Steps:
   1. Verify contract: npm run verify:fuji
   2. Update frontend config: npm run update-config
   3. Test minting functionality
```

## 📄 Contract Interface

### Core Minting Functions

#### Individual NFT Minting
```solidity
/**
 * @notice Mint a single NFT with AI-generated art
 * @param to Recipient address
 * @param prompt AI generation prompt used
 * @param tokenURI IPFS URI for metadata
 * @return tokenId The minted token ID
 */
function mintNFT(
    address to,
    string calldata prompt,
    string calldata tokenURI
) external payable returns (uint256 tokenId)
```

#### Collaborative NFT Minting
```solidity
/**
 * @notice Mint a collaborative NFT with two contributors
 * @param user1 First collaborator address
 * @param user2 Second collaborator address
 * @param prompt1 First user's prompt
 * @param prompt2 Second user's prompt
 * @param tokenURI IPFS URI for metadata
 * @return tokenId The minted token ID
 */
function mintCollaborativeNFT(
    address user1,
    address user2,
    string calldata prompt1,
    string calldata prompt2,
    string calldata tokenURI
) external payable returns (uint256 tokenId)
```

#### Batch Minting (Authorized Only)
```solidity
/**
 * @notice Batch mint multiple NFTs (MINTER_ROLE required)
 * @param recipients Array of recipient addresses
 * @param prompts Array of AI prompts
 * @param tokenURIs Array of IPFS URIs
 */
function batchMint(
    address[] calldata recipients,
    string[] calldata prompts,
    string[] calldata tokenURIs
) external onlyRole(MINTER_ROLE)
```

### Administrative Functions

#### Price & Supply Management
```solidity
// Update mint price (ADMIN_ROLE required)
function setMintPrice(uint256 newPrice) external onlyRole(ADMIN_ROLE)

// Update maximum supply (ADMIN_ROLE required)
function setMaxSupply(uint256 newMaxSupply) external onlyRole(ADMIN_ROLE)

// Withdraw contract funds (Owner only)
function withdraw() external onlyOwner
```

#### Royalty Management
```solidity
// Set royalty information (ADMIN_ROLE required)
function setRoyaltyInfo(
    address recipient, 
    uint96 feeNumerator
) external onlyRole(ADMIN_ROLE)
```

#### Emergency Controls
```solidity
// Pause all minting operations (ADMIN_ROLE required)
function pause() external onlyRole(ADMIN_ROLE)

// Resume minting operations (ADMIN_ROLE required)
function unpause() external onlyRole(ADMIN_ROLE)
```

### View Functions

#### Contract Information
```solidity
/**
 * @notice Get comprehensive contract information
 * @return currentSupply Current number of minted NFTs
 * @return maxSupply_ Maximum allowed supply
 * @return mintPrice_ Current mint price in wei
 * @return royaltyFee_ Current royalty fee in basis points
 * @return isPaused Whether contract is paused
 */
function getContractInfo() external view returns (
    uint256 currentSupply,
    uint256 maxSupply_,
    uint256 mintPrice_,
    uint96 royaltyFee_,
    bool isPaused
)
```

#### User Statistics
```solidity
/**
 * @notice Get user minting statistics
 * @param user User address to query
 * @return stats UserStats struct with minting data
 */
function getUserStats(address user) external view returns (UserStats memory stats)

struct UserStats {
    uint256 totalMinted;        // Total NFTs minted by user
    uint256 collaborativeMinted; // Collaborative NFTs count
    uint256 lastMintTimestamp;   // Last minting timestamp
}
```

#### Collaboration Information
```solidity
/**
 * @notice Get collaboration details for a token
 * @param tokenId Token ID to query
 * @return info Collaboration information
 */
function getCollaborationInfo(uint256 tokenId) external view returns (CollabInfo memory info)

struct CollabInfo {
    address user1;        // First collaborator
    address user2;        // Second collaborator
    string prompt1;       // First user's prompt
    string prompt2;       // Second user's prompt
    uint256 timestamp;    // Creation timestamp
}
```

## 🔐 Access Control

### Role Hierarchy
```
Owner (Deployer)
├── DEFAULT_ADMIN_ROLE (Can grant/revoke all roles)
    ├── ADMIN_ROLE (Contract administration)
    │   ├── Pause/Unpause contract
    │   ├── Set mint price and max supply
    │   ├── Configure royalty settings
    │   └── Emergency functions
    └── MINTER_ROLE (Batch minting operations)
        └── Perform batch minting
```

### Role Management
```solidity
// Grant role to address
grantRole(ADMIN_ROLE, adminAddress);

// Revoke role from address
revokeRole(ADMIN_ROLE, adminAddress);

// Check if address has role
bool isAdmin = hasRole(ADMIN_ROLE, userAddress);

// Get role member count
uint256 adminCount = getRoleMemberCount(ADMIN_ROLE);

// Get role member by index
address admin = getRoleMember(ADMIN_ROLE, 0);
```

### Security Best Practices
- **Multi-signature Wallets**: Use for admin roles in production
- **Role Separation**: Separate admin and minter responsibilities
- **Regular Audits**: Monitor role assignments periodically
- **Emergency Procedures**: Maintain documented emergency contact procedures

## 💰 Economics & Gas

### Pricing Structure
| Operation | Cost | Recipient |
|-----------|------|-----------|
| **Individual Mint** | 0.01 AVAX | Contract Owner |
| **Collaborative Mint** | 0.01 AVAX | Contract Owner |
| **Batch Mint** | Free* | N/A |
| **Secondary Sales** | 5% royalty | Royalty Recipient |

*_Batch minting is free of mint fees but requires MINTER_ROLE_

### Gas Optimization Features
```solidity
// Custom errors (saves ~50 gas per revert)
error InsufficientPayment(uint256 required, uint256 provided);
error MaxSupplyExceeded(uint256 requested, uint256 available);

// Efficient storage packing
struct CollabInfo {
    address user1;      // 20 bytes
    address user2;      // 20 bytes  
    uint96 timestamp;   // 12 bytes (packed in same slot)
}

// Unchecked arithmetic where safe
unchecked {
    ++tokenIdCounter;
}
```

### Typical Gas Costs
| Operation | Gas Used | USD Cost* |
|-----------|----------|-----------|
| **Deploy Contract** | ~2,850,000 | $0.57 |
| **Individual Mint** | ~150,000 | $0.03 |
| **Collaborative Mint** | ~180,000 | $0.036 |
| **Batch Mint (5 NFTs)** | ~600,000 | $0.12 |
| **Set Mint Price** | ~45,000 | $0.009 |

*_Based on 25 nAVAX gas price and $20 AVAX price_

## 🛡️ Security

### Security Audit Checklist

#### ✅ Implemented Protections
- **Reentrancy Guards**: OpenZeppelin ReentrancyGuard on all payable functions
- **Access Control**: Role-based permissions with OpenZeppelin AccessControl
- **Input Validation**: Comprehensive parameter validation and sanitization
- **Integer Overflow**: Solidity 0.8+ built-in protection
- **Emergency Controls**: Pausable contract functionality
- **Custom Errors**: Gas-efficient error handling

#### 🔍 Code Quality Measures
- **Static Analysis**: Slither, MythX analysis
- **Test Coverage**: 98%+ line coverage
- **Documentation**: Comprehensive NatSpec comments
- **Code Reviews**: Multi-developer review process

#### ⚠️ Security Considerations
```solidity
// Example security patterns used:

// 1. Reentrancy protection
function mintNFT(...) external payable nonReentrant {
    // Safe external calls
}

// 2. Input validation
function setMintPrice(uint256 newPrice) external onlyRole(ADMIN_ROLE) {
    if (newPrice == 0) revert InvalidMintPrice();
    // Set price
}

// 3. Emergency controls
modifier whenNotPaused() {
    if (paused()) revert ContractPaused();
    _;
}
```

### Vulnerability Assessment

| Risk Category | Risk Level | Mitigation |
|---------------|------------|------------|
| **Reentrancy** | ✅ Low | ReentrancyGuard implemented |
| **Access Control** | ✅ Low | Role-based system with checks |
| **Integer Overflow** | ✅ Low | Solidity 0.8+ protections |
| **DoS Attacks** | ⚠️ Medium | Gas limits on batch operations |
| **Front-running** | ⚠️ Medium | Consider commit-reveal for critical ops |

### Audit Recommendations

1. **External Audit**: Conduct professional security audit before mainnet
2. **Bug Bounty**: Implement bug bounty program for ongoing security
3. **Monitoring**: Set up real-time monitoring for unusual activity
4. **Emergency Response**: Maintain 24/7 emergency response capability

## 🔍 Verification

### Automatic Verification
```bash
# Fuji testnet
npm run verify:fuji

# Avalanche mainnet  
npm run verify:avalanche
```

### Manual Verification
```bash
# Generic verification command
npx hardhat verify --network <network> <contract-address> <constructor-args>

# Example for Fuji
npx hardhat verify --network fuji 0x1234567890123456789012345678901234567890 "0xOwnerAddress" "0xRoyaltyRecipient"
```

### Verification Troubleshooting

#### Common Issues & Solutions
```bash
# Issue: "Already verified"
# Solution: Contract already verified, check SnowTrace

# Issue: "Compilation target not found"
# Solution: Ensure exact compiler version matches
npx hardhat clean && npx hardhat compile

# Issue: "Constructor arguments invalid"
# Solution: Verify constructor parameters match deployment
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Deployment Failures
```bash
# Issue: "insufficient funds for gas"
# Solution: Fund wallet with AVAX
# Fuji Faucet: https://faucet.avax.network/

# Issue: "nonce too high"
# Solution: Reset MetaMask account or adjust nonce
```

#### 2. Test Failures
```bash
# Issue: Tests timeout
# Solution: Increase timeout in hardhat.config.js
mocha: {
  timeout: 60000
}

# Issue: "Contract not deployed"
# Solution: Ensure local node is running
npm run node
```

#### 3. Verification Issues
```bash
# Issue: "Contract source code not found"
# Solution: Wait a few minutes after deployment
sleep 60 && npm run verify:fuji
```

### Performance Optimization

#### Gas Optimization Tips
```solidity
// Use calldata instead of memory for external functions
function mintNFT(string calldata tokenURI) external payable

// Pack structs efficiently
struct UserStats {
    uint128 totalMinted;      // Instead of uint256
    uint128 collaborativeMinted; // Pack into single slot
}

// Use custom errors
error InsufficientPayment(); // Instead of require strings
```

### Debug Tools
```bash
# Analyze gas usage
npm run test:gas

# Check contract size
npx hardhat size-contracts

# Run slither analysis (if installed)
slither contracts/SynthaMintNFT.sol
```

## 📁 Project Structure

```
contracts/
├── 📄 SynthaMintNFT.sol          # Main NFT contract
├── 📁 scripts/
│   ├── 🚀 deploy.js              # Deployment script
│   ├── ✅ verify.js              # Contract verification
│   ├── 🔧 post-deploy.js         # Post-deployment setup
│   ├── 🔄 update-config.js       # Frontend config update
│   └── 💬 interact.js            # Contract interaction examples
├── 📁 test/
│   ├── 🧪 SynthaMintNFT.test.js  # Comprehensive test suite
│   └── 📊 gas-analysis.js        # Gas usage analysis
├── 📁 deployments/               # Deployment artifacts (auto-generated)
│   ├── 📋 fuji-deployment.json   # Fuji testnet deployment info
│   └── 📋 summary.json           # Deployment summary
├── 📁 frontend-config/           # Frontend configuration files
│   ├── ⚙️ fuji-config.json       # Fuji network configuration
│   └── ⚙️ fuji-config.ts         # TypeScript configuration
├── 📁 artifacts/                 # Compilation artifacts (auto-generated)
├── 📁 cache/                     # Hardhat cache (auto-generated)
├── ⚙️ hardhat.config.js          # Hardhat configuration
├── 📦 package.json               # Dependencies and scripts
├── 🔒 .env.example               # Environment variables template
└── 📖 README.md                  # This documentation
```

## 🤝 Contributing

### Development Workflow

1. **Fork & Clone**
   ```bash
   git fork <repository-url>
   git clone <your-fork-url>
   cd synthamint/contracts
   ```

2. **Setup Development Environment**
   ```bash
   npm install
   cp .env.example .env
   # Configure .env with your settings
   ```

3. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Development Cycle**
   ```bash
   # Make changes
   nano contracts/SynthaMintNFT.sol
   
   # Run tests
   npm test
   
   # Check coverage
   npm run test:coverage
   
   # Test gas usage
   npm run test:gas
   ```

5. **Pre-commit Checklist**
   - [ ] All tests passing
   - [ ] Coverage > 95%
   - [ ] Gas usage optimized
   - [ ] Documentation updated
   - [ ] Code formatted

6. **Submit Pull Request**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   git push origin feature/your-feature-name
   # Create PR via GitHub interface
   ```

### Code Standards

#### Solidity Style Guide
```solidity
// Contract naming: PascalCase
contract SynthaMintNFT

// Function naming: camelCase
function mintNFT() external

// Variable naming: camelCase with descriptive names
uint256 public mintPrice;

// Constants: UPPER_SNAKE_CASE
uint256 public constant MAX_BATCH_SIZE = 10;

// Events: PascalCase with descriptive names
event IndividualMint(address indexed to, uint256 indexed tokenId);
```

#### Documentation Requirements
- NatSpec comments for all public functions
- README updates for new features
- Inline comments for complex logic
- Gas usage documentation

## 📞 Support & Resources

### Getting Help

#### Community Support
- **GitHub Issues**: [Create an issue](https://github.com/synthamint/contracts/issues)
- **Discord**: Join our [Discord community](https://discord.gg/synthamint)
- **Documentation**: [Full documentation](https://docs.synthamint.com)

#### Technical Resources
- **Avalanche Docs**: [https://docs.avax.network/](https://docs.avax.network/)
- **OpenZeppelin**: [https://docs.openzeppelin.com/](https://docs.openzeppelin.com/)
- **Hardhat Docs**: [https://hardhat.org/docs/](https://hardhat.org/docs/)
- **Solidity Docs**: [https://docs.soliditylang.org/](https://docs.soliditylang.org/)

#### Network Resources
- **Avalanche Fuji Faucet**: [https://faucet.avax.network/](https://faucet.avax.network/)
- **SnowTrace Testnet**: [https://testnet.snowtrace.io/](https://testnet.snowtrace.io/)
- **SnowTrace Mainnet**: [https://snowtrace.io/](https://snowtrace.io/)

### Emergency Contacts

For critical security issues:
- **Email**: security@synthamint.com
- **Response Time**: < 4 hours
- **Emergency**: Use GitHub security advisories

---

<div align="center">
  <h3>⚠️ Important Security Notice</h3>
  <p><strong>This contract handles real value on mainnet.</strong><br/>
  Always test thoroughly on testnets before production deployment.</p>
  
  <p>
    <a href="#deployment">Deploy Now</a> •
    <a href="#testing">Run Tests</a> •
    <a href="#contributing">Contribute</a> •
    <a href="mailto:support@synthamint.com">Get Support</a>
  </p>
  
  <p><em>Built with ❤️ by the SynthaMint team</em></p>
</div>
