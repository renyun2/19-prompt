import { EventEmitter } from 'eventemitter3';
import {
  ConnectionConfig,
  ConnectionStatus,
  EventType,
  ErrorEvent
} from '../types';

/**
 * 连接管理器
 * 负责WebSocket连接、心跳检测和重连机制
 */
export class ConnectionManager extends EventEmitter {
  private status: ConnectionStatus = ConnectionStatus.Disconnected;
  private socket: WebSocket | null = null;
  private config: ConnectionConfig;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectCount: number = 0;

  constructor(config: ConnectionConfig) {
    super();
    this.config = {
      timeout: 5000,
      reconnectInterval: 3000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      ...config
    };
  }

  /**
   * 连接到服务器
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.setStatus(ConnectionStatus.Connecting);
        
        // 在浏览器环境中使用WebSocket
        if (typeof WebSocket !== 'undefined') {
          this.socket = new WebSocket(this.config.url);
          
          this.socket.onopen = () => {
            this.setStatus(ConnectionStatus.Connected);
            this.reconnectCount = 0;
            this.startHeartbeat();
            resolve();
          };

          this.socket.onmessage = (event) => {
            this.handleMessage(event.data);
          };

          this.socket.onerror = (error) => {
            this.handleError(error);
            reject(error);
          };

          this.socket.onclose = () => {
            this.setStatus(ConnectionStatus.Disconnected);
            this.handleDisconnect();
          };
        } else {
          // Node.js环境中需要使用其他库
          throw new Error('WebSocket is not available in this environment');
        }

        // 设置连接超时
        const timeoutId = setTimeout(() => {
          if (this.status === ConnectionStatus.Connecting) {
            reject(new Error('Connection timeout'));
            this.disconnect();
          }
        }, this.config.timeout);

        this.socket?.addEventListener('open', () => clearTimeout(timeoutId));
      } catch (error) {
        this.setStatus(ConnectionStatus.Failed);
        reject(error);
      }
    });
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    this.clearHeartbeat();
    this.clearReconnect();

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    this.setStatus(ConnectionStatus.Disconnected);
  }

  /**
   * 发送消息
   */
  send(data: any): boolean {
    if (!this.isConnected() || !this.socket) {
      return false;
    }

    try {
      this.socket.send(JSON.stringify(data));
      return true;
    } catch (error) {
      this.handleError(error as Error);
      return false;
    }
  }

  /**
   * 检查连接状态
   */
  isConnected(): boolean {
    return this.status === ConnectionStatus.Connected;
  }

  /**
   * 获取连接状态
   */
  getStatus(): ConnectionStatus {
    return this.status;
  }

  /**
   * 设置连接状态
   */
  private setStatus(status: ConnectionStatus): void {
    if (this.status !== status) {
      this.status = status;
      this.emit(status);
    }
  }

  /**
   * 处理消息
   */
  private handleMessage(data: string): void {
    try {
      const message = JSON.parse(data);
      this.emit('message', message);
    } catch (error) {
      this.handleError(new Error('Failed to parse message'));
    }
  }

  /**
   * 处理错误
   */
  private handleError(error: Error | Event): void {
    const errorEvent: ErrorEvent = {
      type: EventType.Error,
      timestamp: new Date(),
      error: error instanceof Error ? error : new Error(String(error))
    };
    this.emit(EventType.Error, errorEvent);
  }

  /**
   * 处理断开连接
   */
  private handleDisconnect(): void {
    this.clearHeartbeat();
    this.attemptReconnect();
  }

  /**
   * 开始心跳检测
   */
  private startHeartbeat(): void {
    this.clearHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected()) {
        this.send({
          type: 'ping',
          timestamp: new Date().toISOString()
        });
      }
    }, this.config.heartbeatInterval);
  }

  /**
   * 清除心跳检测
   */
  private clearHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * 尝试重新连接
   */
  private attemptReconnect(): void {
    if (
      this.reconnectCount >= (this.config.maxReconnectAttempts || 10)
    ) {
      this.setStatus(ConnectionStatus.Failed);
      return;
    }

    this.reconnectCount++;
    this.setStatus(ConnectionStatus.Reconnecting);

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch((error) => {
        this.handleError(error);
      });
    }, this.config.reconnectInterval);
  }

  /**
   * 清除重连定时器
   */
  private clearReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}
