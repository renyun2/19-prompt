import { EventEmitter } from 'eventemitter3';
import { Logger } from '../utils/Logger';
import {
  SDKOptions,
  EventType,
  MessageType,
  Message,
  Conversation,
  User,
  UserStatus,
  MessageStatus
} from '../types';
import { MessageManager } from './MessageManager';
import { ConversationManager } from './ConversationManager';
import { ConnectionManager } from './ConnectionManager';
import { UserManager } from './UserManager';

/**
 * IM SDK 核心类
 * 主要的SDK入口点，集成所有管理器
 */
export class IMClient extends EventEmitter {
  private options: SDKOptions;
  private logger: Logger;
  private messageManager: MessageManager;
  private conversationManager: ConversationManager;
  private connectionManager: ConnectionManager;
  private userManager: UserManager;

  constructor(options: SDKOptions) {
    super();
    this.options = options;
    this.logger = new Logger(options.logLevel, options.enableLogging);
    this.messageManager = new MessageManager();
    this.conversationManager = new ConversationManager();
    this.connectionManager = new ConnectionManager(options.connectionConfig);
    this.userManager = new UserManager();

    this.setupEventListeners();
  }

  /**
   * 初始化SDK
   */
  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing IM SDK');

      // 连接到服务器
      await this.connectionManager.connect();
      this.logger.info('Connected to server');

      // 认证用户
      await this.authenticate();

      this.logger.info('IM SDK initialized successfully');
      this.emit('initialized');
    } catch (error) {
      this.logger.error('Failed to initialize IM SDK', error);
      throw error;
    }
  }

  /**
   * 关闭SDK
   */
  async destroy(): Promise<void> {
    this.connectionManager.disconnect();
    this.messageManager.removeAllListeners();
    this.conversationManager.removeAllListeners();
    this.userManager.removeAllListeners();
    this.removeAllListeners();
    this.logger.info('IM SDK destroyed');
  }

  /**
   * 发送消息
   */
  async sendMessage(
    conversationId: string,
    content: string,
    type: MessageType = MessageType.Text,
    metadata?: Record<string, any>
  ): Promise<Message> {
    const currentUser = this.userManager.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const message = this.messageManager.createMessage(
      conversationId,
      currentUser.id,
      content,
      type,
      metadata
    );

    // 发送消息到服务器
    const sent = this.connectionManager.send({
      type: 'message:send',
      payload: message
    });

    if (!sent) {
      message.status = MessageStatus.Failed;
      this.logger.error('Failed to send message');
    } else {
      message.status = MessageStatus.Sent;
      this.emit(EventType.MessageSent, { message, timestamp: new Date() });
    }

    return message;
  }

  /**
   * 获取消息
   */
  getMessage(messageId: string): Message | undefined {
    return this.messageManager.getMessage(messageId);
  }

  /**
   * 获取会话消息
   */
  getMessages(conversationId: string, limit: number = 50, offset: number = 0): Message[] {
    return this.messageManager.getConversationMessages(conversationId, limit, offset);
  }

  /**
   * 获取会话
   */
  getConversation(conversationId: string): Conversation | undefined {
    return this.conversationManager.getConversation(conversationId);
  }

  /**
   * 获取用户会话列表
   */
  getConversations(): Conversation[] {
    const currentUser = this.userManager.getCurrentUser();
    if (!currentUser) {
      return [];
    }
    return this.conversationManager.getUserConversations(currentUser.id);
  }

  /**
   * 创建私聊
   */
  createPrivateConversation(memberId: string): Conversation {
    const currentUser = this.userManager.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    return this.conversationManager.createPrivateConversation(
      currentUser.id,
      memberId
    );
  }

  /**
   * 创建群组
   */
  createGroupConversation(
    name: string,
    members: string[],
    options?: any
  ): Conversation {
    const currentUser = this.userManager.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    return this.conversationManager.createGroupConversation(
      name,
      currentUser.id,
      members,
      options
    );
  }

  /**
   * 获取用户
   */
  getUser(userId: string): User | undefined {
    return this.userManager.getUser(userId);
  }

  /**
   * 获取在线用户
   */
  getOnlineUsers(): User[] {
    return this.userManager.getOnlineUsers();
  }

  /**
   * 搜索用户
   */
  searchUsers(keyword: string): User[] {
    return this.userManager.searchUsers(keyword);
  }

  /**
   * 更新用户状态
   */
  setUserStatus(status: UserStatus): void {
    const currentUser = this.userManager.getCurrentUser();
    if (currentUser) {
      this.userManager.updateUserStatus(currentUser.id, status);
      this.connectionManager.send({
        type: 'user:status:update',
        payload: { userId: currentUser.id, status }
      });
    }
  }

  /**
   * 获取消息管理器
   */
  getMessageManager(): MessageManager {
    return this.messageManager;
  }

  /**
   * 获取会话管理器
   */
  getConversationManager(): ConversationManager {
    return this.conversationManager;
  }

  /**
   * 获取用户管理器
   */
  getUserManager(): UserManager {
    return this.userManager;
  }

  /**
   * 获取连接管理器
   */
  getConnectionManager(): ConnectionManager {
    return this.connectionManager;
  }

  /**
   * 认证用户
   */
  private async authenticate(): Promise<void> {
    const response = await new Promise<any>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Authentication timeout'));
      }, 5000);

      this.connectionManager.send({
        type: 'auth:login',
        payload: {
          userId: this.options.userId,
          token: this.options.token
        }
      });

      const messageHandler = (data: any) => {
        if (data.type === 'auth:login:success') {
          clearTimeout(timeout);
          this.connectionManager.removeListener('message', messageHandler);
          resolve(data.payload);
        }
      };

      this.connectionManager.on('message', messageHandler);
    });

    // 设置当前用户
    const user: User = {
      id: this.options.userId,
      username: response.username || 'Unknown',
      status: UserStatus.Online,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.userManager.setCurrentUser(user);
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 连接事件
    this.connectionManager.on('connected', () => {
      this.logger.info('Connected to server');
      this.emit(EventType.Connected);
    });

    this.connectionManager.on('disconnected', () => {
      this.logger.info('Disconnected from server');
      this.emit(EventType.Disconnected);
    });

    // 消息事件
    this.connectionManager.on('message', (data: any) => {
      this.handleServerMessage(data);
    });

    // 错误事件
    this.connectionManager.on(EventType.Error, (error: any) => {
      this.logger.error('Connection error', error);
      this.emit(EventType.Error, error);
    });

    // 代理管理器事件
    this.messageManager.on('*', (event, ...args) => {
      this.emit(event, ...args);
    });

    this.conversationManager.on('*', (event, ...args) => {
      this.emit(event, ...args);
    });

    this.userManager.on('*', (event, ...args) => {
      this.emit(event, ...args);
    });
  }

  /**
   * 处理服务器消息
   */
  private handleServerMessage(data: any): void {
    switch (data.type) {
      case 'message:received':
        const message = data.payload as Message;
        this.messageManager.updateMessageStatus(message.id, MessageStatus.Delivered);
        this.emit(EventType.MessageReceived, { message, timestamp: new Date() });
        break;

      case 'user:status:changed':
        this.userManager.updateUserStatus(data.payload.userId, data.payload.status);
        break;

      case 'conversation:created':
        // Handle conversation creation
        break;

      default:
        this.logger.debug('Unknown message type', data.type);
    }
  }
}
