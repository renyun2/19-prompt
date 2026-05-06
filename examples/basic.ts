/**
 * 基础示例 - 如何使用IM SDK
 */

import {
  IMClient,
  ConnectionConfig,
  SDKOptions,
  UserStatus,
  MessageType,
  LogLevel
} from '../src/index';

async function basicExample() {
  // 配置连接参数
  const connectionConfig: ConnectionConfig = {
    url: 'ws://localhost:3000/socket',
    timeout: 5000,
    reconnectInterval: 3000,
    maxReconnectAttempts: 10,
    heartbeatInterval: 30000
  };

  // 配置SDK选项
  const options: SDKOptions = {
    userId: 'user123',
    token: 'your-token-here',
    connectionConfig,
    enableLogging: true,
    logLevel: LogLevel.Debug
  };

  // 创建IM客户端
  const imClient = new IMClient(options);

  // 监听连接事件
  imClient.on('connected', () => {
    console.log('✓ 已连接到服务器');
  });

  imClient.on('disconnected', () => {
    console.log('✗ 已断开连接');
  });

  // 监听消息接收事件
  imClient.on('message:received', (event: any) => {
    console.log('📨 收到消息:', event.message);
  });

  // 监听消息发送事件
  imClient.on('message:sent', (event: any) => {
    console.log('✓ 消息已发送');
  });

  // 监听用户状态变更
  imClient.on('user:status:changed', (event: any) => {
    console.log(`用户 ${event.userId} 状态变更为: ${event.status}`);
  });

  try {
    // 初始化SDK
    await imClient.initialize();
    console.log('✓ SDK 初始化成功');

    // 获取当前用户
    const currentUser = imClient.getUserManager().getCurrentUser();
    console.log('当前用户:', currentUser);

    // 创建私聊会话
    const conversation = imClient.createPrivateConversation('user456');
    console.log('✓ 创建私聊会话:', conversation.id);

    // 发送消息
    const message = await imClient.sendMessage(
      conversation.id,
      'Hello, this is a test message!',
      MessageType.Text
    );
    console.log('✓ 发送消息:', message.id);

    // 获取会话消息
    const messages = imClient.getMessages(conversation.id, 10, 0);
    console.log('会话消息:', messages);

    // 更新用户状态
    imClient.setUserStatus(UserStatus.Away);
    console.log('✓ 用户状态已更新');

    // 获取在线用户
    const onlineUsers = imClient.getOnlineUsers();
    console.log('在线用户数:', onlineUsers.length);

  } catch (error) {
    console.error('错误:', error);
  } finally {
    // 关闭SDK连接
    await imClient.destroy();
    console.log('✓ SDK 已关闭');
  }
}

// 运行示例
basicExample().catch(console.error);
