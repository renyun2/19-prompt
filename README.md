# IM SDK - 完整的TypeScript即时通讯SDK

一个功能完整、类型安全的TypeScript即时通讯（IM）SDK，提供企业级的消息、会话、用户管理功能。

## 功能特性

✨ **核心功能**
- 🔌 WebSocket实时连接管理
- 💬 消息发送、接收、编辑、删除
- 👥 用户状态管理和在线状态跟踪
- 🗣️ 私聊、群组、频道支持
- 🔐 端到端加密支持
- 📊 消息存储和查询
- ❤️ 消息反应和提及功能

🛠️ **开发特性**
- 📘 完整的TypeScript类型定义
- 🎯 事件驱动架构
- 📦 模块化设计（MessageManager, ConversationManager等）
- 🔄 自动重连机制
- 💚 心跳检测
- 📝 详细的日志输出
- 🐳 Docker一键启动
- 🚀 国内npm加速支持

## 快速开始

### 安装依赖

```bash
npm install
```

npm已配置国内加速源（npmmirror），国内用户可快速安装。

### 开发构建

```bash
# 编译TypeScript
npm run build

# 监听模式开发
npm run dev

# 代码检查
npm run lint

# 运行测试
npm run test
```

### 前端测试页面

启动测试服务器和可视化测试界面：

```bash
# 启动测试服务器（包含WebSocket和HTTP服务）
npm run start:test

# 在浏览器中访问
# http://localhost:3000
```

测试页面功能：
- 🔌 可视化WebSocket连接管理
- 💬 实时消息发送和接收
- 👥 多用户模拟测试
- 📊 实时统计数据
- 📝 系统日志查看
- 🎨 美观的用户界面

详细使用说明请查看 [测试页面文档](public/README.md)

### Docker启动

```bash
# 一键启动（包括Redis依赖）
npm run docker:run

# 或者手动启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止运行
npm run docker:down
```

## 项目结构

```
.
├── src/
│   ├── types/              # 完整的类型定义
│   ├── core/               # 核心类
│   │   ├── IMClient.ts     # SDK主类
│   │   ├── MessageManager.ts       # 消息管理
│   │   ├── ConversationManager.ts  # 会话管理
│   │   ├── ConnectionManager.ts    # 连接管理
│   │   └── UserManager.ts          # 用户管理
│   ├── utils/              # 工具类
│   │   ├── Logger.ts
│   │   ├── StorageAdapter.ts
│   │   └── EncryptionAdapter.ts
│   └── index.ts            # SDK入口
├── examples/               # 使用示例
├── public/                 # 前端测试页面
│   ├── index.html          # 测试界面
│   ├── client.js           # 前端逻辑
│   └── README.md           # 测试页面文档
├── server/                 # 测试服务器
│   └── test-server.js      # WebSocket测试服务器
├── Dockerfile              # Docker配置
├── docker-compose.yml      # Docker Compose配置
├── .npmrc                  # npm配置（国内源加速）
├── tsconfig.json           # TypeScript配置
└── package.json            # 项目配置
```

## 使用示例

### 基础初始化

```typescript
import { IMClient, ConnectionConfig, SDKOptions, LogLevel } from '@im-sdk/core';

const connectionConfig: ConnectionConfig = {
  url: 'ws://localhost:3000/socket',
  timeout: 5000,
  reconnectInterval: 3000,
  heartbeatInterval: 30000
};

const options: SDKOptions = {
  userId: 'user123',
  token: 'your-token',
  connectionConfig,
  enableLogging: true,
  logLevel: LogLevel.Debug
};

const imClient = new IMClient(options);
await imClient.initialize();
```

### 发送消息

```typescript
// 创建私聊会话
const conversation = imClient.createPrivateConversation('user456');

// 发送消息
const message = await imClient.sendMessage(
  conversation.id,
  'Hello!',
  MessageType.Text
);
```

### 监听事件

```typescript
// 连接事件
imClient.on('connected', () => {
  console.log('已连接');
});

// 消息接收
imClient.on('message:received', (event) => {
  console.log('新消息:', event.message);
});

// 用户状态变更
imClient.on('user:status:changed', (event) => {
  console.log(`用户${event.userId}状态变为${event.status}`);
});

// 消息已发送
imClient.on('message:sent', (event) => {
  console.log('消息已发送');
});

// 错误处理
imClient.on('error', (event) => {
  console.error('错误:', event.error);
});
```

### 管理用户

```typescript
// 更新用户状态
imClient.setUserStatus(UserStatus.Away);

// 获取当前用户
const currentUser = imClient.getUserManager().getCurrentUser();

// 搜索用户
const users = imClient.searchUsers('张');

// 获取在线用户
const onlineUsers = imClient.getOnlineUsers();
```

### 管理会话

```typescript
// 获取所有会话
const conversations = imClient.getConversations();

// 创建群组
const group = imClient.createGroupConversation(
  '开发团队',
  ['user2', 'user3', 'user4'],
  { description: '讨论开发问题' }
);

// 获取会话成员
const members = imClient.getConversationManager()
  .getConversationMembers(group.id);

// 添加成员
imClient.getConversationManager()
  .addMemberToConversation(group.id, 'user5');
```

### 管理消息

```typescript
// 获取会话消息（分页）
const messages = imClient.getMessages(conversationId, 50, 0);

// 搜索消息
const searchResults = imClient.getMessageManager()
  .searchMessages(conversationId, '关键词');

// 删除消息
imClient.getMessageManager().deleteMessage(messageId);
```

## 完整的类型定义

SDK提供了完整的TypeScript类型支持：

```typescript
// 用户相关
interface User {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  status: UserStatus;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// 消息相关
interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  type: MessageType;
  content: string;
  status: MessageStatus;
  timestamp: Date;
  reactions?: MessageReaction[];
  mentions?: string[];
}

// 会话相关
interface Conversation {
  id: string;
  type: ConversationType;
  name?: string;
  members: ConversationMember[];
  lastMessage?: Message;
  isArchived: boolean;
  isMuted: boolean;
}

// 更多类型详见 src/types/index.ts
```

## 配置说明

### ConnectionConfig

```typescript
interface ConnectionConfig {
  url: string;                    // WebSocket服务器地址
  timeout?: number;               // 连接超时时间（默认5000ms）
  reconnectInterval?: number;     // 重连间隔（默认3000ms）
  maxReconnectAttempts?: number;  // 最大重连次数（默认10）
  heartbeatInterval?: number;     // 心跳间隔（默认30000ms）
  enableEncryption?: boolean;     // 是否启用加密
  encryptionKey?: string;         // 加密密钥
}
```

### SDKOptions

```typescript
interface SDKOptions {
  userId: string;              // 用户ID
  token: string;               // 认证token
  connectionConfig: ConnectionConfig;  // 连接配置
  enableLogging?: boolean;     // 是否启用日志
  logLevel?: LogLevel;         // 日志级别
  storageAdapter?: StorageAdapter;     // 存储适配器
  encryptionAdapter?: EncryptionAdapter;  // 加密适配器
}
```

## 事件系统

SDK使用事件驱动架构，支持以下事件：

```typescript
// 连接事件
'connected'           // 已连接
'disconnected'        // 已断开
'error'              // 连接错误

// 消息事件
'message:received'    // 收到消息
'message:sent'        // 消息已发送
'message:edited'      // 消息已编辑
'message:deleted'     // 消息已删除

// 用户事件
'user:status:changed' // 用户状态变更
'user:typing'         // 用户输入状态

// 会话事件
'conversation:created' // 会话创建
'conversation:updated' // 会话更新
'conversation:deleted' // 会话删除
'member:joined'        // 成员加入
'member:left'          // 成员离开
```

## npm源加速

项目已配置国内npm源加速，使用npmmirror（阿里巴巴开源镜像站）：

```
registry=https://registry.npmmirror.com
```

如需更改，可编辑`.npmrc`文件。

## Docker支持

### 本地运行

```bash
# 启动服务（包括Redis）
npm run docker:run

# 查看日志
docker-compose logs -f im-sdk

# 停止
npm run docker:down
```

### 生成镜像

```bash
npm run docker:build
```

## 开发指南

### 添加新的管理器

1. 在`src/core/`创建新的管理器类，继承自`EventEmitter`
2. 在`src/types/index.ts`添加类型定义
3. 在`IMClient`中集成新的管理器
4. 在`src/index.ts`导出

### 自定义存储适配器

```typescript
import { StorageAdapter } from '@im-sdk/core';

class CustomStorageAdapter implements StorageAdapter {
  async get(key: string) { /* ... */ }
  async set(key: string, value: any) { /* ... */ }
  async remove(key: string) { /* ... */ }
  async clear() { /* ... */ }
}

// 使用
const imClient = new IMClient({
  // ...
  storageAdapter: new CustomStorageAdapter()
});
```

### 自定义加密适配器

```typescript
import { EncryptionAdapter } from '@im-sdk/core';

class CustomEncryptionAdapter implements EncryptionAdapter {
  async encrypt(data: string, key: string) { /* ... */ }
  async decrypt(data: string, key: string) { /* ... */ }
}
```

## 性能优化建议

1. **消息分页加载** - 使用`getMessages()`的分页参数
2. **消息搜索** - 仅在必要时进行，考虑建立索引
3. **内存管理** - 定期清理不需要的消息和会话数据
4. **连接复用** - 单页应用中共享一个IMClient实例
5. **事件监听** - 及时移除不需要的事件监听器

## 支持的环境

- **浏览器**: Chrome, Firefox, Safari, Edge (WebSocket支持)
- **Node.js**: 14+ (需要WebSocket库)
- **框架**: React, Vue, Angular等

## 安全建议

1. 不要在代码中硬编码token，使用环境变量
2. 启用端到端加密保护敏感消息
3. 定期轮换认证token
4. 验证服务器证书（WSS）
5. 实现消息完整性校验

## 许可证

MIT

## 贡献

欢迎提交Issue和Pull Request！

## 相关资源

- [TypeScript文档](https://www.typescriptlang.org/docs/)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [EventEmitter3](https://github.com/primus/eventemitter3)
