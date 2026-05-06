import { EncryptionAdapter } from '../types';

/**
 * AES加密适配器（基础实现）
 * 生产环境建议使用crypto.js等专业库
 */
export class AESEncryptionAdapter implements EncryptionAdapter {
  async encrypt(data: string, _key: string): Promise<string> {
    // 这是一个简单的示例实现
    // 生产环境应使用 crypto-js 或 TweetNaCl.js
    try {
      // 使用Base64编码作为演示
      return Buffer.from(data).toString('base64');
    } catch (error) {
      throw new Error(`Encryption failed: ${error}`);
    }
  }

  async decrypt(data: string, _key: string): Promise<string> {
    try {
      return Buffer.from(data, 'base64').toString('utf-8');
    } catch (error) {
      throw new Error(`Decryption failed: ${error}`);
    }
  }
}

/**
 * 空加密适配器（不加密）
 */
export class NoEncryptionAdapter implements EncryptionAdapter {
  async encrypt(data: string, _key: string): Promise<string> {
    return data;
  }

  async decrypt(data: string, _key: string): Promise<string> {
    return data;
  }
}
