import { EventEmitter } from 'eventemitter3';
import { v4 as uuid } from 'uuid';
import {
  Conversation,
  ConversationType,
  ConversationMember,
  MemberRole
} from '../types';

/**
 * 会话管理器
 * 负责会话的创建、更新、删除和成员管理
 */
export class ConversationManager extends EventEmitter {
  private conversations: Map<string, Conversation> = new Map();

  /**
   * 创建私聊会话
   */
  createPrivateConversation(
    member1Id: string,
    member2Id: string,
    existingId?: string
  ): Conversation {
    const id = existingId || uuid();
    const now = new Date();

    const conversation: Conversation = {
      id,
      type: ConversationType.Private,
      members: [
        { userId: member1Id, joinedAt: now, role: MemberRole.Member },
        { userId: member2Id, joinedAt: now, role: MemberRole.Member }
      ],
      isArchived: false,
      isMuted: false,
      createdAt: now,
      updatedAt: now
    };

    this.conversations.set(id, conversation);
    return conversation;
  }

  /**
   * 创建群组会话
   */
  createGroupConversation(
    name: string,
    ownerId: string,
    members: string[] = [],
    options?: {
      description?: string;
      avatar?: string;
    }
  ): Conversation {
    const now = new Date();
    const allMembers: ConversationMember[] = [
      { userId: ownerId, joinedAt: now, role: MemberRole.Owner }
    ];

    members.forEach(memberId => {
      if (memberId !== ownerId) {
        allMembers.push({
          userId: memberId,
          joinedAt: now,
          role: MemberRole.Member
        });
      }
    });

    const conversation: Conversation = {
      id: uuid(),
      type: ConversationType.Group,
      name,
      description: options?.description,
      avatar: options?.avatar,
      members: allMembers,
      isArchived: false,
      isMuted: false,
      createdAt: now,
      updatedAt: now
    };

    this.conversations.set(conversation.id, conversation);
    return conversation;
  }

  /**
   * 创建频道
   */
  createChannel(
    name: string,
    ownerId: string,
    options?: {
      description?: string;
      avatar?: string;
      public?: boolean;
    }
  ): Conversation {
    const now = new Date();
    const conversation: Conversation = {
      id: uuid(),
      type: ConversationType.Channel,
      name,
      description: options?.description,
      avatar: options?.avatar,
      members: [{ userId: ownerId, joinedAt: now, role: MemberRole.Owner }],
      isArchived: false,
      isMuted: false,
      createdAt: now,
      updatedAt: now,
      metadata: { public: options?.public ?? true }
    };

    this.conversations.set(conversation.id, conversation);
    return conversation;
  }

  /**
   * 获取会话
   */
  getConversation(conversationId: string): Conversation | undefined {
    return this.conversations.get(conversationId);
  }

  /**
   * 获取用户的所有会话
   */
  getUserConversations(userId: string): Conversation[] {
    const conversations = Array.from(this.conversations.values());
    return conversations.filter(conv =>
      conv.members.some(member => member.userId === userId)
    );
  }

  /**
   * 添加成员到会话
   */
  addMemberToConversation(
    conversationId: string,
    userId: string,
    role: MemberRole = MemberRole.Member
  ): boolean {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) return false;

    const isMemberExists = conversation.members.some(m => m.userId === userId);
    if (isMemberExists) return false;

    conversation.members.push({
      userId,
      joinedAt: new Date(),
      role
    });

    conversation.updatedAt = new Date();
    return true;
  }

  /**
   * 移除成员
   */
  removeMemberFromConversation(
    conversationId: string,
    userId: string
  ): boolean {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) return false;

    const index = conversation.members.findIndex(m => m.userId === userId);
    if (index === -1) return false;

    conversation.members.splice(index, 1);
    conversation.updatedAt = new Date();
    return true;
  }

  /**
   * 更新成员角色
   */
  updateMemberRole(
    conversationId: string,
    userId: string,
    role: MemberRole
  ): boolean {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) return false;

    const member = conversation.members.find(m => m.userId === userId);
    if (!member) return false;

    member.role = role;
    conversation.updatedAt = new Date();
    return true;
  }

  /**
   * 更新会话信息
   */
  updateConversation(
    conversationId: string,
    updates: Partial<Conversation>
  ): boolean {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) return false;

    Object.assign(conversation, updates, { updatedAt: new Date() });
    return true;
  }

  /**
   * 删除会话
   */
  deleteConversation(conversationId: string): boolean {
    return this.conversations.delete(conversationId);
  }

  /**
   * 获取会话成员
   */
  getConversationMembers(conversationId: string): ConversationMember[] {
    const conversation = this.conversations.get(conversationId);
    return conversation?.members || [];
  }
}
