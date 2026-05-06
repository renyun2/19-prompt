import { EventEmitter } from 'eventemitter3';
import { v4 as uuid } from 'uuid';
import {
  Message,
  MessageType,
  MessageStatus
} from '../types';

/**
 * 消息管理器
 * 负责消息的发送、接收、存储和查询
 */
export class MessageManager extends EventEmitter {
  private messages: Map<string, Message[]> = new Map();
  private messageIndex: Map<string, Message> = new Map();

  /**
   * 创建消息
   */
  createMessage(
    conversationId: string,
    senderId: string,
    content: string,
    type: MessageType = MessageType.Text,
    metadata?: Record<string, any>
  ): Message {
    const message: Message = {
      id: uuid(),
      conversationId,
      senderId,
      type,
      content,
      status: MessageStatus.Sending,
      timestamp: new Date(),
      metadata
    };

    this.messageIndex.set(message.id, message);
    
    if (!this.messages.has(conversationId)) {
      this.messages.set(conversationId, []);
    }
    this.messages.get(conversationId)!.push(message);

    return message;
  }

  /**
   * 获取消息
   */
  getMessage(messageId: string): Message | undefined {
    return this.messageIndex.get(messageId);
  }

  /**
   * 获取会话中的所有消息
   */
  getConversationMessages(
    conversationId: string,
    limit: number = 50,
    offset: number = 0
  ): Message[] {
    const messages = this.messages.get(conversationId) || [];
    return messages.slice(-offset - limit, -offset || undefined).reverse();
  }

  /**
   * 更新消息状态
   */
  updateMessageStatus(messageId: string, status: MessageStatus): boolean {
    const message = this.messageIndex.get(messageId);
    if (message) {
      message.status = status;
      return true;
    }
    return false;
  }

  /**
   * 删除消息
   */
  deleteMessage(messageId: string): boolean {
    const message = this.messageIndex.get(messageId);
    if (message) {
      const conversationMessages = this.messages.get(message.conversationId);
      if (conversationMessages) {
        const index = conversationMessages.indexOf(message);
        if (index > -1) {
          conversationMessages.splice(index, 1);
        }
      }
      this.messageIndex.delete(messageId);
      return true;
    }
    return false;
  }

  /**
   * 搜索消息
   */
  searchMessages(
    conversationId: string,
    keyword: string
  ): Message[] {
    const messages = this.messages.get(conversationId) || [];
    return messages.filter(msg =>
      msg.content.includes(keyword) || msg.senderName?.includes(keyword)
    );
  }

  /**
   * 清空会话消息
   */
  clearConversationMessages(conversationId: string): void {
    const messages = this.messages.get(conversationId) || [];
    messages.forEach(msg => {
      this.messageIndex.delete(msg.id);
    });
    this.messages.delete(conversationId);
  }
}
