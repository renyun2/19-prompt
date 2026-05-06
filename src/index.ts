// 导出所有类型
export * from './types';

// 导出核心类
export { IMClient } from './core/IMClient';
export { MessageManager } from './core/MessageManager';
export { ConversationManager } from './core/ConversationManager';
export { ConnectionManager } from './core/ConnectionManager';
export { UserManager } from './core/UserManager';

// 导出工具类
export { Logger } from './utils/Logger';
export { LocalStorageAdapter, MemoryStorageAdapter } from './utils/StorageAdapter';
export { AESEncryptionAdapter, NoEncryptionAdapter } from './utils/EncryptionAdapter';
