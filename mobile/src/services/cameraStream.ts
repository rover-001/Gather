import { storage } from './storage';

export type LiveStreamCallback = (status: 'connected' | 'disconnected' | 'reconnecting') => void;

export class LivePreviewStreamer {
  private socket: WebSocket | null = null;
  private isRunning: boolean = false;
  private reconnectTimer: any = null;
  private onStatusChange?: LiveStreamCallback;
  private isBoosted: boolean = false;

  constructor(onStatusChange?: LiveStreamCallback) {
    this.onStatusChange = onStatusChange;
  }

  async start() {
    this.isRunning = true;
    await this.connect();
  }

  private async connect() {
    if (!this.isRunning) return;

    try {
      const baseUrl = await storage.getServerUrl();
      const wsUrl = baseUrl.replace(/^http/, 'ws').replace(/\/+$/, '') + '/ws';

      this.socket = new WebSocket(wsUrl);
      this.socket.binaryType = 'arraybuffer';

      this.socket.onopen = () => {
        this.onStatusChange?.('connected');
      };

      this.socket.onclose = () => {
        this.onStatusChange?.('disconnected');
        if (this.isRunning) {
          this.reconnectTimer = setTimeout(() => {
            this.onStatusChange?.('reconnecting');
            this.connect();
          }, 2000);
        }
      };

      this.socket.onerror = () => {
        this.socket?.close();
      };

      this.socket.onmessage = (event) => {
        if (typeof event.data === 'string') {
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'boost') {
              this.isBoosted = true;
            } else if (msg.type === 'unboost') {
              this.isBoosted = false;
            }
          } catch {
            // ignore non-json
          }
        }
      };
    } catch (err) {
      this.onStatusChange?.('disconnected');
    }
  }

  sendFrame(frameBuffer: ArrayBuffer | string) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(frameBuffer);
    }
  }

  getBoosted(): boolean {
    return this.isBoosted;
  }

  stop() {
    this.isRunning = false;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.onStatusChange?.('disconnected');
  }
}
