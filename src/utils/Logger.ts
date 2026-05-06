import { LogLevel } from '../types';

/**
 * 日志工具类
 */
export class Logger {
  private level: LogLevel;
  private enabled: boolean;

  constructor(level: LogLevel = LogLevel.Info, enabled: boolean = true) {
    this.level = level;
    this.enabled = enabled;
  }

  /**
   * 调试日志
   */
  debug(message: string, data?: any): void {
    if (
      this.enabled &&
      (this.level === LogLevel.Debug)
    ) {
      console.debug(`[DEBUG] ${message}`, data);
    }
  }

  /**
   * 信息日志
   */
  info(message: string, data?: any): void {
    if (
      this.enabled &&
      (this.level === LogLevel.Debug || this.level === LogLevel.Info)
    ) {
      console.info(`[INFO] ${message}`, data);
    }
  }

  /**
   * 警告日志
   */
  warn(message: string, data?: any): void {
    if (
      this.enabled &&
      (this.level === LogLevel.Debug ||
        this.level === LogLevel.Info ||
        this.level === LogLevel.Warn)
    ) {
      console.warn(`[WARN] ${message}`, data);
    }
  }

  /**
   * 错误日志
   */
  error(message: string, error?: any): void {
    if (this.enabled) {
      console.error(`[ERROR] ${message}`, error);
    }
  }

  /**
   * 设置日志级别
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * 启用/禁用日志
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
}
