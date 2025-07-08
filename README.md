<div align="center">
  <h1>🎨 SynthaMint</h1>
  <p><strong>Synthesize ideas. Mint the moment.</strong></p>
  <p>An AI-powered NFT minting platform that transforms creative ideas into unique digital assets</p>
  
  [![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
  [![Avalanche](https://img.shields.io/badge/Avalanche-Fuji-red.svg)](https://docs.avax.network/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Smart Contract Setup](#smart-contract-setup)
- [Development](#development)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## 🌟 Overview

SynthaMint is a cutting-edge decentralized application (dApp) that bridges the gap between artificial intelligence and blockchain technology. Users can generate unique AI-powered artwork and mint them as NFTs on the Avalanche network, creating a seamless experience from idea conception to digital asset ownership.

### Key Capabilities

- **AI-Powered Art Generation**: Create unique digital artwork using advanced AI algorithms
- **Collaborative Minting**: Enable multiple users to collaborate on NFT creation
- **Blockchain Integration**: Mint NFTs directly on Avalanche Fuji testnet
- **IPFS Storage**: Decentralized metadata and image storage
- **Wallet Integration**: Support for popular Web3 wallets

## ✨ Features

- 🤖 **AI Image Generation**: Transform text prompts into stunning visual art
- 🎯 **One-Click Minting**: Streamlined NFT creation process
- 👥 **Collaborative Mode**: Real-time collaboration on NFT projects
- 💾 **Decentralized Storage**: IPFS integration for metadata and assets
- 🔗 **Avalanche Network**: Fast and low-cost transactions
- 📱 **Responsive Design**: Optimized for desktop and mobile devices
- 🎨 **Modern UI**: Beautiful interface built with shadcn/ui components

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **State Management**: TanStack Query
- **Web3 Integration**: Wagmi

### Backend & Blockchain
- **Smart Contracts**: Solidity
- **Development Framework**: Hardhat
- **Network**: Avalanche (Fuji Testnet)
- **Standards**: ERC-721 (NFTs)
- **Storage**: IPFS

### Development Tools
- **Linting**: ESLint
- **Testing**: Hardhat Test Suite
- **Package Manager**: npm/bun

## ⚡ Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** or **bun** package manager
- **Git** - [Download](https://git-scm.com/)
- **MetaMask** or compatible Web3 wallet

### Recommended Setup

```bash
# Install Node.js using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install node
nvm use node
```

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd synthamint
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up smart contracts**
   ```bash
   npm run setup
   ```

4. **Configure environment variables**
   ```bash
   # Copy environment template (if available)
   cp .env.example .env
   # Edit .env with your configuration
   ```

## 🔧 Smart Contract Setup

SynthaMint requires deploying smart contracts to the Avalanche Fuji testnet. Follow these steps:

### 1. Install Contract Dependencies
```bash
npm run contracts:install
```

### 2. Compile Contracts
```bash
npm run contracts:compile
```

### 3. Deploy to Fuji Testnet
```bash
npm run contracts:deploy
```

### 4. Verify Contracts (Optional)
```bash
cd contracts
npm run verify:fuji
```

### Available Contract Commands

| Command | Description |
|---------|-------------|
| `npm run contracts:compile` | Compile smart contracts |
| `npm run contracts:test` | Run contract tests |
| `npm run contracts:deploy` | Deploy to Fuji testnet |
| `npm run contracts:install` | Install contract dependencies |

📖 **For detailed deployment instructions, see [`contracts/README.md`](./contracts/README.md)**

## 💻 Development

### Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run build:dev` | Build for development |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

### Development Workflow

1. Start the development server: `npm run dev`
2. Make your changes in the `src/` directory
3. The app will hot-reload automatically
4. Run tests: `npm run contracts:test`
5. Build for production: `npm run build`

## 🌐 Deployment

### Option 1: Vercel Deployment (Recommended)

1. Push your code to GitHub/GitLab/Bitbucket
2. Visit [Vercel](https://vercel.com) and sign in
3. Click **New Project** and import your repository
4. Configure build settings:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Click **Deploy**

### Option 2: Vercel CLI

1. Install Vercel CLI: `npm i -g vercel`
2. Build the project: `npm run build`
3. Deploy: `vercel --prod`

### Custom Domain Setup

To connect a custom domain via Vercel:

1. Navigate to your project dashboard on Vercel
2. Go to **Settings → Domains**
3. Add your custom domain
4. Configure DNS records as instructed

📚 [Vercel Custom Domain Guide](https://vercel.com/docs/concepts/projects/custom-domains)

## 📁 Project Structure

```
synthamint/
├── src/                          # Frontend source code
│   ├── components/               # React components
│   │   ├── ui/                  # UI primitives (shadcn/ui)
│   │   ├── NFTMinter.tsx        # Main minting component
│   │   └── ...
│   ├── hooks/                   # Custom React hooks
│   ├── lib/                     # Utility libraries
│   ├── pages/                   # Page components
│   ├── services/                # API services
│   └── utils/                   # Helper functions
├── contracts/                   # Smart contracts
│   ├── contracts/               # Solidity files
│   ├── scripts/                 # Deployment scripts
│   ├── test/                    # Contract tests
│   └── hardhat.config.js        # Hardhat configuration
├── public/                      # Static assets
└── package.json                 # Project dependencies
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Run tests**
   ```bash
   npm run lint
   npm run contracts:test
   ```
5. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Development Guidelines
- Follow existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>Built with ❤️ by [Koustav Singh](https://koustavx08.vercel.app)</p>
  <p>
    <a href="https://github.com/koustavx08/synthamint-platform">View Project</a> •
    <a href="#contributing">Contribute</a> •
    <a href="mailto:support@synthamint.com">Support</a>
  </p>
</div>
