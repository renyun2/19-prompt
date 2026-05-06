// 类型声明：兼容Node.js和浏览器环境
declare const localStorage: any;

/**
 * 本地存储适配器
 * 仅在浏览器环境中可用
 */
export class LocalStorageAdapter {
  async get(key: string): Promise<any> {
    try {
      if (typeof localStorage === 'undefined') {
        console.warn('localStorage is not available in this environment');
        return null;
      }
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Failed to get item from localStorage: ${key}`, error);
      return null;
    }
  }

  async set(key: string, value: any): Promise<void> {
    try {
      if (typeof localStorage === 'undefined') {
        console.warn('localStorage is not available in this environment');
        return;
      }
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to set item in localStorage: ${key}`, error);
    }
  }

  async remove(key: string): Promise<void> {
    try {
      if (typeof localStorage === 'undefined') {
        console.warn('localStorage is not available in this environment');
        return;
      }
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove item from localStorage: ${key}`, error);
    }
  }

  async clear(): Promise<void> {
    try {
      if (typeof localStorage === 'undefined') {
        console.warn('localStorage is not available in this environment');
        return;
      }
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear localStorage', error);
    }
  }
}

/**
 * 内存存储适配器
 */
export class MemoryStorageAdapter {
  private store: Map<string, any> = new Map();

  async get(key: string): Promise<any> {
    return this.store.get(key) || null;
  }

  async set(key: string, value: any): Promise<void> {
    this.store.set(key, value);
  }

  async remove(key: string): Promise<void> {
    this.store.delete(key);
  }

  async clear(): Promise<void> {
    this.store.clear();
  }
}
