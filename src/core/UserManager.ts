import { EventEmitter } from 'eventemitter3';
import {
  User,
  UserStatus,
  EventType,
  UserStatusChangedEvent
} from '../types';

/**
 * 用户管理器
 * 负责用户信息管理和状态跟踪
 */
export class UserManager extends EventEmitter {
  private users: Map<string, User> = new Map();
  private currentUser: User | null = null;

  /**
   * 设置当前用户
   */
  setCurrentUser(user: User): void {
    this.currentUser = user;
    this.users.set(user.id, user);
  }

  /**
   * 获取当前用户
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * 添加用户
   */
  addUser(user: User): void {
    this.users.set(user.id, user);
  }

  /**
   * 批量添加用户
   */
  addUsers(users: User[]): void {
    users.forEach(user => this.addUser(user));
  }

  /**
   * 获取用户
   */
  getUser(userId: string): User | undefined {
    return this.users.get(userId);
  }

  /**
   * 获取所有用户
   */
  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  /**
   * 更新用户状态
   */
  updateUserStatus(userId: string, status: UserStatus): boolean {
    const user = this.users.get(userId);
    if (!user) return false;

    user.status = status;
    user.updatedAt = new Date();

    const event: UserStatusChangedEvent = {
      type: EventType.UserStatusChanged,
      timestamp: new Date(),
      userId,
      status
    };

    this.emit(EventType.UserStatusChanged, event);
    return true;
  }

  /**
   * 更新用户信息
   */
  updateUser(userId: string, updates: Partial<User>): boolean {
    const user = this.users.get(userId);
    if (!user) return false;

    Object.assign(user, updates, { updatedAt: new Date() });
    return true;
  }

  /**
   * 删除用户
   */
  removeUser(userId: string): boolean {
    return this.users.delete(userId);
  }

  /**
   * 搜索用户
   */
  searchUsers(keyword: string): User[] {
    return Array.from(this.users.values()).filter(user =>
      user.username.includes(keyword) ||
      user.email?.includes(keyword)
    );
  }

  /**
   * 获取在线用户
   */
  getOnlineUsers(): User[] {
    return Array.from(this.users.values()).filter(
      user => user.status === UserStatus.Online
    );
  }

  /**
   * 清空用户缓存
   */
  clear(): void {
    this.users.clear();
    this.currentUser = null;
  }
}
