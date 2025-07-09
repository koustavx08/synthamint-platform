# Collaboration Server

> Real-time collaboration server for Dream Mint Verse NFT minting platform

## 🚀 Quick Start

**Prerequisites:** Node.js 16+

```bash
# Install dependencies
cd collab-server
npm install

# Start development server
npm run dev

# Start production server
npm start
```

Server runs on `http://localhost:3001` with WebSocket support at `ws://localhost:3001`

## 🔧 Configuration

Set environment variables in your main project's `.env`:

```bash
VITE_SOCKET_URL=ws://localhost:3001
VITE_SOCKET_URL_PRODUCTION=wss://your-production-server.com
```

## 🌐 Production Deployment

### Render (Recommended)

1. Connect your GitHub repository to [Render](https://render.com)
2. Deploy using the included `render.yaml` configuration
3. Update `FRONTEND_URL` environment variable to your frontend domain

### Environment Variables

```env
PORT=10000
FRONTEND_URL=https://your-frontend-domain.com
NODE_ENV=production
```

## ✨ Features

- Real-time prompt sharing and synchronization
- Collaborative image generation workflow
- Session management with automatic cleanup
- WebSocket-based communication
- CORS configuration for secure connections

## 🔍 Testing

1. Open the app in multiple browser windows
2. Connect wallets in each window
3. Create a collaboration session
4. Share the session link between windows
5. Collaborate in real-time!

---

**Health Check:** Visit `http://localhost:3001/health` to verify server status
