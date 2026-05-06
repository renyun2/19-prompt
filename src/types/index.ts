/**
 * IM SDK 核心类型定义
 */

/** 用户信息 */
export interface User {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  status: UserStatus;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

/** 用户状态 */
export enum UserStatus {
  Online = 'online',
  Offline = 'offline',
  Away = 'away',
  DoNotDisturb = 'dnd'
}

/** 消息类型 */
export enum MessageType {
  Text = 'text',
  Image = 'image',
  Video = 'video',
  Audio = 'audio',
  File = 'file',
  Location = 'location',
  Custom = 'custom'
}

/** 消息状态 */
export enum MessageStatus {
  Sending = 'sending',
  Sent = 'sent',
  Delivered = 'delivered',
  Read = 'read',
  Failed = 'failed'
}

/** 聊天消息 */
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  type: MessageType;
  content: string;
  status: MessageStatus;
  timestamp: Date;
  editedAt?: Date;
  reactions?: MessageReaction[];
  mentions?: string[];
  replies?: Message[];
  metadata?: Record<string, any>;
  encryptionKey?: string;
}

/** 消息反应 */
export interface MessageReaction {
  userId: string;
  emoji: string;
  createdAt: Date;
}

/** 会话类型 */
export enum ConversationType {
  Private = 'private',
  Group = 'group',
  Channel = 'channel'
}

/** 会话 */
export interface Conversation {
  id: string;
  type: ConversationType;
  name?: string;
  description?: string;
  members: ConversationMember[];
  lastMessage?: Message;
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  isArchived: boolean;
  isMuted: boolean;
  avatar?: string;
  metadata?: Record<string, any>;
}

/** 会话成员 */
export interface ConversationMember {
  userId: string;
  joinedAt: Date;
  role: MemberRole;
  permissions?: string[];
}

/** 成员角色 */
export enum MemberRole {
  Owner = 'owner',
  Admin = 'admin',
  Member = 'member',
  Guest = 'guest'
}

/** 连接配置 */
export interface ConnectionConfig {
  url: string;
  timeout?: number;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  enableEncryption?: boolean;
  encryptionKey?: string;
}

/** 连接状态 */
export enum ConnectionStatus {
  Connecting = 'connecting',
  Connected = 'connected',
  Disconnected = 'disconnected',
  Reconnecting = 'reconnecting',
  Failed = 'failed'
}

/** 事件类型 */
export enum EventType {
  Connected = 'connected',
  Disconnected = 'disconnected',
  MessageReceived = 'message:received',
  MessageSent = 'message:sent',
  MessageEdited = 'message:edited',
  MessageDeleted = 'message:deleted',
  UserStatusChanged = 'user:status:changed',
  TypingStatusChanged = 'user:typing',
  ConversationCreated = 'conversation:created',
  ConversationUpdated = 'conversation:updated',
  ConversationDeleted = 'conversation:deleted',
  MemberJoined = 'member:joined',
  MemberLeft = 'member:left',
  Error = 'error'
}

/** 基础事件 */
export interface BaseEvent {
  type: EventType;
  timestamp: Date;
}

/** 消息接收事件 */
export interface MessageReceivedEvent extends BaseEvent {
  message: Message;
}

/** 用户状态变更事件 */
export interface UserStatusChangedEvent extends BaseEvent {
  userId: string;
  status: UserStatus;
}

/** 输入状态事件 */
export interface TypingEvent extends BaseEvent {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

/** 错误事件 */
export interface ErrorEvent extends BaseEvent {
  error: Error;
  code?: string;
}

/** SDK配置选项 */
export interface SDKOptions {
  userId: string;
  token: string;
  connectionConfig: ConnectionConfig;
  enableLogging?: boolean;
  logLevel?: LogLevel;
  storageAdapter?: StorageAdapter;
  encryptionAdapter?: EncryptionAdapter;
}

/** 日志级别 */
export enum LogLevel {
  Debug = 'debug',
  Info = 'info',
  Warn = 'warn',
  Error = 'error'
}

/** 存储适配器接口 */
export interface StorageAdapter {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}

/** 加密适配器接口 */
export interface EncryptionAdapter {
  encrypt(data: string, key: string): Promise<string>;
  decrypt(data: string, key: string): Promise<string>;
}

/** API响应 */
export interface APIResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  timestamp: Date;
}

/** 分页查询参数 */
export interface PaginationParams {
  page: number;
  pageSize: number;
  sort?: string;
}

/** 分页结果 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
