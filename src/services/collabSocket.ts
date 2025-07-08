
import { io, Socket } from 'socket.io-client';

export interface CollabSession {
  id: string;
  host: string;
  guest?: string;
  hostPrompt?: string;
  guestPrompt?: string;
  generatedImage?: string;
  hostApproved?: boolean;
  guestApproved?: boolean;
  status: 'waiting' | 'prompting' | 'generating' | 'approving' | 'minting' | 'completed';
}

export interface CollabSocketEvents {
  'session-created': (session: CollabSession) => void;
  'user-joined': (session: CollabSession) => void;
  'prompt-updated': (session: CollabSession) => void;
  'image-generated': (session: CollabSession) => void;
  'approval-updated': (session: CollabSession) => void;
  'session-completed': (session: CollabSession) => void;
  error: (message: string) => void;
}

class CollabSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(): Promise<Socket> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve(this.socket);
        return;
      }

      // Socket.io server URL from environment variables
      const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';
      
      // If no socket URL is configured, reject the connection
      if (!SOCKET_URL || SOCKET_URL.trim() === '' || SOCKET_URL.includes('your-socket')) {
        reject(new Error('Socket server not configured. Set VITE_SOCKET_URL in your environment variables.'));
        return;
      }

      try {
        this.socket = io(SOCKET_URL, {
          transports: ['websocket'],
          timeout: 5000,
        });

        this.socket.on('connect', () => {
          console.log('Connected to collab server');
          this.reconnectAttempts = 0;
          resolve(this.socket!);
        });

        this.socket.on('disconnect', () => {
          console.log('Disconnected from collab server');
        });

        this.socket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          // For demo purposes, we'll create a mock socket
          this.createMockSocket();
          resolve(this.socket!);
        });

      } catch (error) {
        console.error('Failed to create socket connection:', error);
        this.createMockSocket();
        resolve(this.socket!);
      }
    });
  }

  private createMockSocket() {
    // Create a mock socket for development/demo purposes
    const mockSocket = {
      connected: true,
      emit: (event: string, ...args: any[]) => {
        console.log('Mock socket emit:', event, args);
        // Simulate responses for demo
        this.handleMockEvents(event, args);
      },
      on: (event: string, callback: Function) => {
        console.log('Mock socket listener added:', event);
      },
      off: (event: string, callback?: Function) => {
        console.log('Mock socket listener removed:', event);
      },
      disconnect: () => {
        console.log('Mock socket disconnected');
      }
    } as any;

    this.socket = mockSocket;
  }

  private handleMockEvents(event: string, args: any[]) {
    // Simulate server responses for development
    setTimeout(() => {
      switch (event) {
        case 'create-session':
          const sessionId = Math.random().toString(36).substring(7);
          this.socket?.emit('session-created', {
            id: sessionId,
            host: args[0],
            status: 'waiting'
          });
          break;
        case 'join-session':
          this.socket?.emit('user-joined', {
            id: args[0],
            host: 'mock-host',
            guest: args[1],
            status: 'prompting'
          });
          break;
      }
    }, 500);
  }

  createSession(walletAddress: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Not connected to collab server'));
        return;
      }

      const sessionId = Math.random().toString(36).substring(7);
      this.socket.emit('create-session', walletAddress);
      
      const handleSessionCreated = (session: CollabSession) => {
        this.socket?.off('session-created', handleSessionCreated);
        resolve(session.id);
      };

      this.socket.on('session-created', handleSessionCreated);
      
      // Fallback for mock
      setTimeout(() => resolve(sessionId), 1000);
    });
  }

  joinSession(sessionId: string, walletAddress: string): Promise<CollabSession> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Not connected to collab server'));
        return;
      }

      this.socket.emit('join-session', sessionId, walletAddress);
      
      const handleUserJoined = (session: CollabSession) => {
        this.socket?.off('user-joined', handleUserJoined);
        resolve(session);
      };

      this.socket.on('user-joined', handleUserJoined);
    });
  }

  updatePrompt(sessionId: string, prompt: string, isHost: boolean) {
    this.socket?.emit('update-prompt', sessionId, prompt, isHost);
  }

  updateApproval(sessionId: string, approved: boolean, isHost: boolean) {
    this.socket?.emit('update-approval', sessionId, approved, isHost);
  }

  onSessionUpdate(callback: (session: CollabSession) => void) {
    const events: (keyof CollabSocketEvents)[] = [
      'session-created', 'user-joined', 'prompt-updated', 
      'image-generated', 'approval-updated', 'session-completed'
    ];
    
    events.forEach(event => {
      this.socket?.on(event, callback);
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }
}

export const collabSocket = new CollabSocketService();
