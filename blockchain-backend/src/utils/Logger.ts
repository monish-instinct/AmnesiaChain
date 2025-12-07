import winston from 'winston';
import { format } from 'winston';

export interface LoggerConfig {
  level: string;
  filename?: string;
  console: boolean;
  maxSize?: string;
  maxFiles?: string;
}

export class Logger {
  private logger!: winston.Logger;
  private config: LoggerConfig;

  constructor(config: LoggerConfig) {
    this.config = config;
    this.initializeLogger();
  }

  private initializeLogger(): void {
    const { combine, timestamp, printf, colorize, errors } = format;

    // Custom format for log messages
    const logFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
      const metaString = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
      const stackTrace = stack ? `\n${stack}` : '';
      return `${timestamp} [${level}]: ${message}${metaString ? `\nMeta: ${metaString}` : ''}${stackTrace}`;
    });

    const transports: winston.transport[] = [];

    // Console transport
    if (this.config.console) {
      transports.push(
        new winston.transports.Console({
          format: combine(
            colorize(),
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            errors({ stack: true }),
            logFormat
          )
        })
      );
    }

    // File transport
    if (this.config.filename) {
      transports.push(
        new winston.transports.File({
          filename: this.config.filename,
          format: combine(
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            errors({ stack: true }),
            logFormat
          ),
          maxsize: this.parseSize(this.config.maxSize || '10MB'),
          maxFiles: parseInt(this.config.maxFiles || '5'),
          tailable: true
        })
      );
    }

    // Rotating file transport for errors
    if (this.config.filename) {
      const errorFilename = this.config.filename.replace(/\.log$/, '.error.log');
      transports.push(
        new winston.transports.File({
          filename: errorFilename,
          level: 'error',
          format: combine(
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            errors({ stack: true }),
            logFormat
          ),
          maxsize: this.parseSize(this.config.maxSize || '10MB'),
          maxFiles: parseInt(this.config.maxFiles || '5'),
          tailable: true
        })
      );
    }

    this.logger = winston.createLogger({
      level: this.config.level,
      transports,
      exitOnError: false,
      handleExceptions: true,
      handleRejections: true
    });

    // Handle uncaught exceptions and rejections
    process.on('uncaughtException', (error) => {
      this.logger.error('Uncaught Exception:', error);
    });

    process.on('unhandledRejection', (reason, promise) => {
      this.logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });
  }

  private parseSize(sizeString: string): number {
    const match = sizeString.match(/^(\d+)(KB|MB|GB)?$/i);
    if (!match) {
      return 10 * 1024 * 1024; // Default 10MB
    }

    const size = parseInt(match[1]);
    const unit = (match[2] || 'B').toUpperCase();

    switch (unit) {
      case 'KB':
        return size * 1024;
      case 'MB':
        return size * 1024 * 1024;
      case 'GB':
        return size * 1024 * 1024 * 1024;
      default:
        return size;
    }
  }

  // Core logging methods
  public error(message: string, meta?: any): void {
    this.logger.error(message, meta);
  }

  public warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  public info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  public debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }

  public verbose(message: string, meta?: any): void {
    this.logger.verbose(message, meta);
  }

  // Blockchain-specific logging methods
  public blockAdded(blockIndex: number, hash: string, transactionCount: number): void {
    this.info('Block added', {
      blockIndex,
      hash,
      transactionCount,
      timestamp: new Date().toISOString(),
      event: 'BLOCK_ADDED'
    });
  }

  public transactionAdded(transactionId: string, from: string, type: string): void {
    this.info('Transaction added', {
      transactionId,
      from,
      type,
      timestamp: new Date().toISOString(),
      event: 'TRANSACTION_ADDED'
    });
  }

  public miningStarted(minerAddress: string, difficulty: number): void {
    this.info('Mining started', {
      minerAddress,
      difficulty,
      timestamp: new Date().toISOString(),
      event: 'MINING_STARTED'
    });
  }

  public miningCompleted(blockIndex: number, nonce: number, hash: string, duration: number): void {
    this.info('Mining completed', {
      blockIndex,
      nonce,
      hash,
      duration,
      timestamp: new Date().toISOString(),
      event: 'MINING_COMPLETED'
    });
  }

  public memoryOperation(operation: string, dataId: string, relevanceScore?: number): void {
    this.info('Memory operation', {
      operation,
      dataId,
      relevanceScore,
      timestamp: new Date().toISOString(),
      event: 'MEMORY_OPERATION'
    });
  }

  public consensusEvent(event: string, data: any): void {
    this.info('Consensus event', {
      consensusEvent: event,
      data,
      timestamp: new Date().toISOString(),
      eventType: 'CONSENSUS_EVENT'
    });
  }

  public networkEvent(event: string, peerId?: string, data?: any): void {
    this.info('Network event', {
      networkEvent: event,
      peerId,
      data,
      timestamp: new Date().toISOString(),
      eventType: 'NETWORK_EVENT'
    });
  }

  public apiRequest(method: string, url: string, statusCode: number, duration: number, userAgent?: string): void {
    this.info('API request', {
      method,
      url,
      statusCode,
      duration,
      userAgent,
      timestamp: new Date().toISOString(),
      event: 'API_REQUEST'
    });
  }

  public performanceMetric(metric: string, value: number, unit?: string): void {
    this.info('Performance metric', {
      metric,
      value,
      unit: unit || 'ms',
      timestamp: new Date().toISOString(),
      event: 'PERFORMANCE_METRIC'
    });
  }

  // Security logging
  public securityEvent(event: string, severity: 'low' | 'medium' | 'high' | 'critical', details: any): void {
    const logMethod = severity === 'critical' || severity === 'high' ? 'error' : 
                      severity === 'medium' ? 'warn' : 'info';
    
    this[logMethod]('Security event', {
      securityEvent: event,
      severity,
      details,
      timestamp: new Date().toISOString(),
      eventType: 'SECURITY_EVENT'
    });
  }

  public authenticationAttempt(address: string, success: boolean, method?: string): void {
    const logMethod = success ? 'info' : 'warn';
    this[logMethod]('Authentication attempt', {
      address,
      success,
      method,
      timestamp: new Date().toISOString(),
      event: 'AUTHENTICATION_ATTEMPT'
    });
  }

  // Error handling
  public handleError(error: Error, context?: string): void {
    this.error(`${context ? `[${context}] ` : ''}${error.message}`, {
      stack: error.stack,
      name: error.name,
      context,
      timestamp: new Date().toISOString()
    });
  }

  // Database operations
  public databaseOperation(operation: string, collection?: string, duration?: number): void {
    this.debug('Database operation', {
      operation,
      collection,
      duration,
      timestamp: new Date().toISOString(),
      event: 'DATABASE_OPERATION'
    });
  }

  public databaseError(operation: string, error: Error, collection?: string): void {
    this.error('Database error', {
      operation,
      collection,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      event: 'DATABASE_ERROR'
    });
  }

  // Utility methods
  public createChildLogger(context: string): Logger {
    const childConfig = { ...this.config };
    const originalFormat = this.logger.format;
    
    // Create a child logger with context
    const childLogger = new Logger(childConfig);
    
    // Override methods to include context
    const originalMethods = ['error', 'warn', 'info', 'debug', 'verbose'];
    
    originalMethods.forEach(method => {
      const originalMethod = (childLogger as any)[method].bind(childLogger);
      (childLogger as any)[method] = (message: string, meta?: any) => {
        originalMethod(`[${context}] ${message}`, meta);
      };
    });

    return childLogger;
  }

  public setLevel(level: string): void {
    this.logger.level = level;
    this.info(`Log level changed to: ${level}`);
  }

  public getLevel(): string {
    return this.logger.level;
  }

  // Get statistics
  public getStats(): {
    level: string;
    transports: number;
    hasFileTransport: boolean;
    hasConsoleTransport: boolean;
  } {
    return {
      level: this.logger.level,
      transports: this.logger.transports.length,
      hasFileTransport: this.logger.transports.some(t => t instanceof winston.transports.File),
      hasConsoleTransport: this.logger.transports.some(t => t instanceof winston.transports.Console)
    };
  }

  // Cleanup
  public close(): void {
    this.logger.close();
  }

  // Static factory methods
  static createDevelopmentLogger(): Logger {
    return new Logger({
      level: 'debug',
      console: true,
      filename: 'logs/amnesiachain-dev.log',
      maxSize: '50MB',
      maxFiles: '7'
    });
  }

  static createProductionLogger(): Logger {
    return new Logger({
      level: 'info',
      console: false,
      filename: 'logs/amnesiachain-prod.log',
      maxSize: '100MB',
      maxFiles: '10'
    });
  }

  static createTestLogger(): Logger {
    return new Logger({
      level: 'error',
      console: false,
      filename: 'logs/amnesiachain-test.log',
      maxSize: '10MB',
      maxFiles: '3'
    });
  }
}
