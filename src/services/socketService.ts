import { io, Socket } from 'socket.io-client';

export interface DeckGenerationProgress {
  stage: 'starting' | 'generating' | 'saving';
  message: string;
  progress: number;
}

export interface DeckGenerationComplete {
  deck: any;
  message: string;
  progress: number;
}

export interface DeckGenerationError {
  error: string;
}

export type DeckGenerationProgressCallback = (data: DeckGenerationProgress) => void;
export type DeckGenerationCompleteCallback = (data: DeckGenerationComplete) => void;
export type DeckGenerationErrorCallback = (data: DeckGenerationError) => void;

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket && this.isConnected) {
        resolve();
        return;
      }

      // Get the WebSocket URL from environment or use default
      const socketUrl = process.env.REACT_APP_SOCKET_URL || window.location.origin;
      
      this.socket = io(socketUrl, {
        transports: ['polling', 'websocket'], // Try polling first, then websocket
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        forceNew: true,
        upgrade: true,
        rememberUpgrade: false,
      });

      this.socket.on('connect', () => {
        console.log('Connected to WebSocket server');
        this.isConnected = true;
        resolve();
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        reject(error);
      });

      // Set a timeout for connection
      setTimeout(() => {
        if (!this.isConnected) {
          reject(new Error('WebSocket connection timeout'));
        }
      }, 10000);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  getSocketId(): string | null {
    return this.socket?.id || null;
  }

  onDeckGenerationProgress(callback: DeckGenerationProgressCallback): void {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }
    this.socket.on('deck-generation-progress', callback);
  }

  onDeckGenerationComplete(callback: DeckGenerationCompleteCallback): void {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }
    this.socket.on('deck-generation-complete', callback);
  }

  onDeckGenerationError(callback: DeckGenerationErrorCallback): void {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }
    this.socket.on('deck-generation-error', callback);
  }

  removeAllListeners(): void {
    if (this.socket) {
      this.socket.removeAllListeners('deck-generation-progress');
      this.socket.removeAllListeners('deck-generation-complete');
      this.socket.removeAllListeners('deck-generation-error');
    }
  }

  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }
}

// Export a singleton instance
export const socketService = new SocketService();