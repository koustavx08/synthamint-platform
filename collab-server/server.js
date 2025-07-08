const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Configure CORS for Socket.IO
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

// Store active collaboration sessions
const sessions = new Map();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Collaboration server is running',
    activeSessions: sessions.size
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Create a new collaboration session
  socket.on('create-session', (hostAddress, callback) => {
    try {
      const sessionId = generateSessionId();
      const session = {
        id: sessionId,
        host: hostAddress,
        hostSocketId: socket.id,
        guest: null,
        guestSocketId: null,
        hostPrompt: '',
        guestPrompt: '',
        generatedImage: null,
        hostApproved: false,
        guestApproved: false,
        status: 'waiting',
        createdAt: new Date()
      };

      sessions.set(sessionId, session);
      socket.join(sessionId);

      console.log(`Session created: ${sessionId} by ${hostAddress}`);
      
      if (callback) {
        callback({
          success: true,
          sessionId: sessionId,
          session: formatSessionForClient(session)
        });
      }

      // Broadcast session creation
      socket.to(sessionId).emit('session-created', formatSessionForClient(session));
    } catch (error) {
      console.error('Error creating session:', error);
      if (callback) {
        callback({ success: false, error: error.message });
      }
    }
  });

  // Join an existing collaboration session
  socket.on('join-session', (sessionId, guestAddress, callback) => {
    try {
      const session = sessions.get(sessionId);
      
      if (!session) {
        if (callback) {
          callback({ success: false, error: 'Session not found' });
        }
        return;
      }

      if (session.guest) {
        if (callback) {
          callback({ success: false, error: 'Session is full' });
        }
        return;
      }

      // Add guest to session
      session.guest = guestAddress;
      session.guestSocketId = socket.id;
      session.status = 'prompting';

      socket.join(sessionId);

      console.log(`Guest ${guestAddress} joined session: ${sessionId}`);

      if (callback) {
        callback({
          success: true,
          session: formatSessionForClient(session)
        });
      }

      // Notify all participants about the new user
      io.to(sessionId).emit('user-joined', formatSessionForClient(session));
    } catch (error) {
      console.error('Error joining session:', error);
      if (callback) {
        callback({ success: false, error: error.message });
      }
    }
  });

  // Update prompt for a session
  socket.on('update-prompt', (sessionId, prompt, isHost) => {
    try {
      const session = sessions.get(sessionId);
      
      if (!session) {
        socket.emit('error', 'Session not found');
        return;
      }

      // Update the appropriate prompt
      if (isHost) {
        session.hostPrompt = prompt;
      } else {
        session.guestPrompt = prompt;
      }

      // Check if both prompts are ready for generation
      if (session.hostPrompt && session.guestPrompt && session.status === 'prompting') {
        session.status = 'generating';
      }

      console.log(`Prompt updated in session ${sessionId} by ${isHost ? 'host' : 'guest'}`);

      // Broadcast prompt update to all participants
      io.to(sessionId).emit('prompt-updated', formatSessionForClient(session));
    } catch (error) {
      console.error('Error updating prompt:', error);
      socket.emit('error', error.message);
    }
  });

  // Update approval status
  socket.on('update-approval', (sessionId, approved, isHost) => {
    try {
      const session = sessions.get(sessionId);
      
      if (!session) {
        socket.emit('error', 'Session not found');
        return;
      }

      // Update approval status
      if (isHost) {
        session.hostApproved = approved;
      } else {
        session.guestApproved = approved;
      }

      // Check if both users approved
      if (session.hostApproved && session.guestApproved) {
        session.status = 'minting';
      } else if (!approved) {
        // If someone rejected, go back to prompting
        session.status = 'prompting';
        session.hostApproved = false;
        session.guestApproved = false;
        session.generatedImage = null;
      }

      console.log(`Approval updated in session ${sessionId} by ${isHost ? 'host' : 'guest'}: ${approved}`);

      // Broadcast approval update
      io.to(sessionId).emit('approval-updated', formatSessionForClient(session));
    } catch (error) {
      console.error('Error updating approval:', error);
      socket.emit('error', error.message);
    }
  });

  // Update generated image
  socket.on('image-generated', (sessionId, imageUrl) => {
    try {
      const session = sessions.get(sessionId);
      
      if (!session) {
        socket.emit('error', 'Session not found');
        return;
      }

      session.generatedImage = imageUrl;
      session.status = 'approving';

      console.log(`Image generated for session ${sessionId}`);

      // Broadcast image generation
      io.to(sessionId).emit('image-generated', formatSessionForClient(session));
    } catch (error) {
      console.error('Error updating generated image:', error);
      socket.emit('error', error.message);
    }
  });

  // Mark session as completed
  socket.on('session-completed', (sessionId) => {
    try {
      const session = sessions.get(sessionId);
      
      if (!session) {
        socket.emit('error', 'Session not found');
        return;
      }

      session.status = 'completed';

      console.log(`Session completed: ${sessionId}`);

      // Broadcast completion
      io.to(sessionId).emit('session-completed', formatSessionForClient(session));

      // Clean up session after a delay
      setTimeout(() => {
        sessions.delete(sessionId);
        console.log(`Session ${sessionId} cleaned up`);
      }, 60000); // Clean up after 1 minute
    } catch (error) {
      console.error('Error completing session:', error);
      socket.emit('error', error.message);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    
    // Find and clean up any sessions this user was part of
    for (const [sessionId, session] of sessions.entries()) {
      if (session.hostSocketId === socket.id || session.guestSocketId === socket.id) {
        console.log(`Cleaning up session ${sessionId} due to user disconnect`);
        
        // Notify other participants
        socket.to(sessionId).emit('user-disconnected', {
          sessionId: sessionId,
          disconnectedUser: session.hostSocketId === socket.id ? 'host' : 'guest'
        });
        
        // Remove the session
        sessions.delete(sessionId);
      }
    }
  });
});

// Utility functions
function generateSessionId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function formatSessionForClient(session) {
  return {
    id: session.id,
    host: session.host,
    guest: session.guest,
    hostPrompt: session.hostPrompt,
    guestPrompt: session.guestPrompt,
    generatedImage: session.generatedImage,
    hostApproved: session.hostApproved,
    guestApproved: session.guestApproved,
    status: session.status
  };
}

// Clean up old sessions periodically
setInterval(() => {
  const now = new Date();
  const expiredSessions = [];
  
  for (const [sessionId, session] of sessions.entries()) {
    const sessionAge = now - session.createdAt;
    const maxAge = 2 * 60 * 60 * 1000; // 2 hours
    
    if (sessionAge > maxAge) {
      expiredSessions.push(sessionId);
    }
  }
  
  expiredSessions.forEach(sessionId => {
    console.log(`Cleaning up expired session: ${sessionId}`);
    sessions.delete(sessionId);
  });
}, 30 * 60 * 1000); // Check every 30 minutes

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Collaboration server running on port ${PORT}`);
  console.log(`📡 WebSocket endpoint: ws://localhost:${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});
