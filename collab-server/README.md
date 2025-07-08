# Collaboration Server Setup

This document explains how to set up and run the real-time collaboration features without demo mode.

## Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

## Quick Setup

### 1. Install Dependencies

Navigate to the collab-server directory and install dependencies:

```bash
cd collab-server
npm install
```

### 2. Start the Socket Server

Start the collaboration server on port 3001:

```bash
npm start
```

For development with auto-restart:

```bash
npm run dev
```

### 3. Verify Connection

The server should display:
```
🚀 Collaboration server running on port 3001
📡 WebSocket endpoint: ws://localhost:3001
🔗 Health check: http://localhost:3001/health
```

You can test the health endpoint by visiting: http://localhost:3001/health

### 4. Environment Configuration

Your `.env` file should already be configured with:

```bash
VITE_SOCKET_URL=ws://localhost:3001
VITE_SOCKET_URL_DEVELOPMENT=ws://localhost:3001
VITE_SOCKET_URL_PRODUCTION=wss://your-production-socket-server.com
```

### 5. Start the Frontend

In the main project directory:

```bash
npm run dev
```

## Testing Real Collaboration

1. Open your application in two different browser windows/tabs
2. Connect your wallet in both windows
3. Go to the Collaboration section
4. Create a session in one window
5. Copy the collaboration link and open it in the second window
6. Both users should now be connected for real-time collaboration!

## Production Deployment

### Deploy on Render (Recommended)

Render provides free hosting with WebSocket support, making it perfect for the collaboration server.

#### Step 1: Prepare for Deployment

1. Ensure your collab-server has a `package.json` with a start script
2. (Optional) The included `render.yaml` file will automatically configure the deployment
3. Update the `FRONTEND_URL` in `render.yaml` to match your frontend domain

#### Step 2: Deploy to Render

1. **Via GitHub with render.yaml (Easiest)**:
   - Push your code to a GitHub repository
   - Go to [render.com](https://render.com) and sign up/login
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` file and configure everything
   - Just update the `FRONTEND_URL` environment variable after deployment

2. **Via GitHub (Manual Configuration)**:
   - Push your code to a GitHub repository
   - Go to [render.com](https://render.com) and sign up/login
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository and set:
     - **Name**: `your-app-collab-server`
     - **Environment**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Instance Type**: `Free` (sufficient for collaboration)

3. **Environment Variables on Render**:
   - In your Render dashboard, go to Environment tab
   - Add these variables:

     ```env
     PORT=10000
     FRONTEND_URL=https://your-frontend-domain.com
     NODE_ENV=production
     ```

4. **Manual Upload**:
   - Zip your collab-server directory
   - Go to render.com → "New +" → "Web Service"
   - Choose "Deploy an existing image" or "Upload from computer"

#### Step 3: Get Your Render URL

After deployment, Render will provide a URL like:

```text
https://your-app-collab-server.onrender.com
```

#### Step 4: Update Frontend Environment

Update your main project's `.env` file:

```bash
VITE_SOCKET_URL_PRODUCTION=wss://your-app-collab-server.onrender.com
```

### Alternative Hosting Options

For other hosting services:

1. **Heroku**: Similar to Render, supports WebSockets
2. **DigitalOcean App Platform**: Good for scalable deployments
3. **AWS Elastic Beanstalk**: Enterprise-grade hosting
4. **Railway**: Another free option with good WebSocket support

Example configuration for any hosting service:

```bash
VITE_SOCKET_URL_PRODUCTION=wss://your-collab-server.your-host.com
```

## Troubleshooting

### Connection Issues

If you see "Connection failed" messages:

1. Ensure the collab-server is running on port 3001
2. Check that no firewall is blocking the connection
3. Verify the VITE_SOCKET_URL in your .env file is correct

### Demo Mode Still Active

If the app still shows demo mode:

1. Restart the frontend development server after updating .env
2. Clear browser cache/local storage
3. Ensure the socket server is running and accessible

### CORS Issues

If you encounter CORS errors:

1. The server is configured to allow localhost:5173 by default
2. If using a different port, update the FRONTEND_URL environment variable in the collab-server
3. For production, update the CORS origin in server.js

## Server Configuration

The collaboration server supports these environment variables:

- `PORT`: Server port (default: 3001)
- `FRONTEND_URL`: Allowed frontend origin for CORS (default: `http://localhost:5173`)

## Features

The real-time collaboration includes:

- ✅ Real-time prompt sharing
- ✅ Synchronized image generation
- ✅ Approval workflow
- ✅ Session management
- ✅ Automatic cleanup of expired sessions
- ✅ User disconnect handling
