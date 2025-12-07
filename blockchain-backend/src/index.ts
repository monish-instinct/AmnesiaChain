import dotenv from 'dotenv';
import { AmnesiaChain } from './blockchain/AmnesiaChain';
import { Database, DatabaseConfig } from './database/Database';
import { Logger } from './utils/Logger';
import { ApiServer } from './api/ApiServer';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

// Load environment variables
dotenv.config();

// Configuration
const config = {
  // Server configuration
  port: parseInt(process.env.PORT || '3001'),
  host: process.env.HOST || 'localhost',
  
  // Database configuration
  database: {
    connectionString: process.env.MONGODB_URL || 'mongodb://localhost:27017',
    databaseName: process.env.DB_NAME || 'amnesiachain'
  } as DatabaseConfig,
  
  // Blockchain configuration
  blockchain: {
    minerAddress: process.env.MINER_ADDRESS || 'system',
    miningEnabled: process.env.MINING_ENABLED !== 'false',
    autoMining: process.env.AUTO_MINING === 'true',
    miningInterval: parseInt(process.env.MINING_INTERVAL || '60000') // 1 minute
  },
  
  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
    filename: process.env.LOG_FILE || 'logs/amnesiachain.log',
    console: process.env.LOG_CONSOLE !== 'false'
  }
};

class AmnesiaChainNode {
  private logger: Logger;
  private database: Database;
  private blockchain: AmnesiaChain;
  private apiServer: ApiServer;
  private httpServer: any;
  private io: SocketIOServer;
  private miningInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Initialize logger
    this.logger = new Logger({
      level: config.logging.level,
      filename: config.logging.filename,
      console: config.logging.console
    });

    // Initialize database
    this.database = new Database(config.database, this.logger);

    // Initialize blockchain
    this.blockchain = new AmnesiaChain(this.database, this.logger);

    // Initialize API server
    this.apiServer = new ApiServer(this.blockchain, this.database, this.logger);

    // Create HTTP server and Socket.IO
    this.httpServer = createServer(this.apiServer.getApp());
    this.io = new SocketIOServer(this.httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN || "*",
        methods: ["GET", "POST"]
      }
    });

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Blockchain events
    this.blockchain.on('initialized', () => {
      this.logger.info('AmnesiaChain initialized');
      this.io.emit('blockchain:initialized');
    });

    this.blockchain.on('blockAdded', (block) => {
      this.logger.blockAdded(block.index, block.hash, block.transactions.length);
      this.io.emit('blockchain:blockAdded', block);
    });

    this.blockchain.on('transactionAdded', (transaction) => {
      this.logger.transactionAdded(transaction.id, transaction.from, transaction.type);
      this.io.emit('blockchain:transactionAdded', transaction);
    });

    this.blockchain.on('dataArchived', (data) => {
      this.logger.memoryOperation('archive', data.id, data.relevanceScore);
      this.io.emit('memory:dataArchived', data);
    });

    this.blockchain.on('dataPromoted', (data) => {
      this.logger.memoryOperation('promote', data.id, data.relevanceScore);
      this.io.emit('memory:dataPromoted', data);
    });

    this.blockchain.on('dataForgotten', (data) => {
      this.logger.memoryOperation('forget', data.id, data.relevanceScore);
      this.io.emit('memory:dataForgotten', data);
    });

    this.blockchain.on('difficultyAdjusted', (newDifficulty) => {
      this.logger.consensusEvent('DIFFICULTY_ADJUSTED', { newDifficulty });
      this.io.emit('consensus:difficultyAdjusted', newDifficulty);
    });

    // Socket.IO connections
    this.io.on('connection', (socket) => {
      this.logger.networkEvent('CLIENT_CONNECTED', socket.id);

      socket.on('disconnect', () => {
        this.logger.networkEvent('CLIENT_DISCONNECTED', socket.id);
      });

      // Send initial blockchain state
      socket.emit('blockchain:state', this.blockchain.getBlockchainState());
    });

    // Graceful shutdown
    process.on('SIGINT', () => this.shutdown('SIGINT'));
    process.on('SIGTERM', () => this.shutdown('SIGTERM'));
    process.on('uncaughtException', (error) => {
      this.logger.handleError(error, 'UNCAUGHT_EXCEPTION');
      this.shutdown('UNCAUGHT_EXCEPTION');
    });
    process.on('unhandledRejection', (reason, promise) => {
      this.logger.error('Unhandled Rejection', { reason, promise });
      this.shutdown('UNHANDLED_REJECTION');
    });
  }

  public async start(): Promise<void> {
    try {
      this.logger.info('Starting AmnesiaChain Node...');
      
      // Connect to database
      this.logger.info('Connecting to database...');
      await this.database.connect();
      
      // Initialize blockchain
      this.logger.info('Initializing blockchain...');
      await this.blockchain.initialize();
      
      // Start API server
      this.logger.info('Starting API server...');
      this.httpServer.listen(config.port, config.host, () => {
        this.logger.info(`AmnesiaChain Node started successfully`);
        this.logger.info(`API Server: http://${config.host}:${config.port}`);
        this.logger.info(`WebSocket: ws://${config.host}:${config.port}`);
        this.logger.info(`Mining enabled: ${config.blockchain.miningEnabled}`);
        this.logger.info(`Auto mining: ${config.blockchain.autoMining}`);
      });

      // Start auto-mining if enabled
      if (config.blockchain.autoMining && config.blockchain.miningEnabled) {
        this.startAutoMining();
      }

      this.logger.info('AmnesiaChain Node is ready to receive connections');
      
    } catch (error) {
      this.logger.handleError(error as Error, 'STARTUP');
      process.exit(1);
    }
  }

  private startAutoMining(): void {
    this.logger.info('Starting auto-mining...');
    
    this.miningInterval = setInterval(async () => {
      try {
        const pendingTransactions = this.blockchain.getPendingTransactions();
        if (pendingTransactions.length > 0) {
          this.logger.miningStarted(config.blockchain.minerAddress, 0);
          const startTime = Date.now();
          
          const block = await this.blockchain.mineBlock(config.blockchain.minerAddress);
          
          if (block) {
            const duration = Date.now() - startTime;
            this.logger.miningCompleted(block.index, block.nonce, block.hash, duration);
            this.io.emit('mining:blockMined', block);
          }
        }
      } catch (error) {
        this.logger.handleError(error as Error, 'AUTO_MINING');
      }
    }, config.blockchain.miningInterval);
  }

  private stopAutoMining(): void {
    if (this.miningInterval) {
      clearInterval(this.miningInterval);
      this.miningInterval = null;
      this.logger.info('Auto-mining stopped');
    }
  }

  private async shutdown(signal: string): Promise<void> {
    this.logger.info(`Received ${signal}. Shutting down gracefully...`);

    try {
      // Stop auto-mining
      this.stopAutoMining();

      // Close Socket.IO server
      if (this.io) {
        this.io.close();
        this.logger.info('Socket.IO server closed');
      }

      // Close HTTP server
      if (this.httpServer) {
        this.httpServer.close(() => {
          this.logger.info('HTTP server closed');
        });
      }

      // Disconnect from database
      if (this.database) {
        await this.database.disconnect();
        this.logger.info('Database connection closed');
      }

      this.logger.info('AmnesiaChain Node shutdown complete');
      
      // Close logger
      this.logger.close();

      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  }

  // Public methods for external access
  public getBlockchain(): AmnesiaChain {
    return this.blockchain;
  }

  public getDatabase(): Database {
    return this.database;
  }

  public getLogger(): Logger {
    return this.logger;
  }

  public getApiServer(): ApiServer {
    return this.apiServer;
  }

  public async mineBlock(): Promise<any> {
    if (!config.blockchain.miningEnabled) {
      throw new Error('Mining is disabled');
    }

    const startTime = Date.now();
    this.logger.miningStarted(config.blockchain.minerAddress, 0);
    
    const block = await this.blockchain.mineBlock(config.blockchain.minerAddress);
    
    if (block) {
      const duration = Date.now() - startTime;
      this.logger.miningCompleted(block.index, block.nonce, block.hash, duration);
      this.io.emit('mining:blockMined', block);
      return block;
    }
    
    return null;
  }

  public async getStats(): Promise<any> {
    const blockchainState = this.blockchain.getBlockchainState();
    const chain = this.blockchain.getChain();
    const dbHealth = await this.database.healthCheck();
    
    return {
      node: {
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        nodeEnv: process.env.NODE_ENV || 'development',
        miningEnabled: config.blockchain.miningEnabled,
        autoMining: config.blockchain.autoMining
      },
      blockchain: blockchainState,
      database: dbHealth,
      memory: {
        used: process.memoryUsage().heapUsed,
        total: process.memoryUsage().heapTotal,
        external: process.memoryUsage().external
      },
      chain: {
        length: chain.length,
        lastBlock: chain.length > 0 ? {
          index: chain[chain.length - 1].index,
          hash: chain[chain.length - 1].hash,
          timestamp: chain[chain.length - 1].timestamp
        } : null
      }
    };
  }
}

// Create and start the node
const node = new AmnesiaChainNode();

// Export for external use
export { AmnesiaChainNode, config };

// Start the node if this file is run directly
if (require.main === module) {
  node.start().catch((error) => {
    console.error('Failed to start AmnesiaChain Node:', error);
    process.exit(1);
  });
}
