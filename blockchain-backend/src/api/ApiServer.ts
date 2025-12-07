import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { AmnesiaChain } from '../blockchain/AmnesiaChain';
import { Database } from '../database/Database';
import { Logger } from '../utils/Logger';
import { 
  Block, 
  Transaction, 
  MemoryData, 
  TransactionType, 
  DataLifecycleState,
  BlockchainUtils 
} from '../blockchain/types';

export interface ApiError {
  success: false;
  error: string;
  code?: number;
  details?: any;
}

export interface ApiSuccess<T = any> {
  success: true;
  data: T;
  timestamp: string;
}

export type ApiResponse<T = any> = ApiSuccess<T> | ApiError;

export class ApiServer {
  private app: Express;
  private blockchain: AmnesiaChain;
  private database: Database;
  private logger: Logger;

  constructor(blockchain: AmnesiaChain, database: Database, logger: Logger) {
    this.blockchain = blockchain;
    this.database = database;
    this.logger = logger;
    this.app = express();
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet());
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      credentials: true
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP',
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use('/api/', limiter);

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logging middleware
    this.app.use(morgan('combined', {
      stream: {
        write: (message: string) => this.logger.info(message.trim())
      }
    }));

    // Request timing middleware
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      const startTime = Date.now();
      
      res.on('finish', () => {
        const duration = Date.now() - startTime;
        this.logger.apiRequest(
          req.method,
          req.originalUrl,
          res.statusCode,
          duration,
          req.get('User-Agent')
        );
      });
      
      next();
    });
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', this.handleHealthCheck.bind(this));
    this.app.get('/api/health', this.handleHealthCheck.bind(this));

    // Blockchain endpoints
    this.app.get('/api/blockchain/state', this.handleGetBlockchainState.bind(this));
    this.app.get('/api/blockchain/stats', this.handleGetBlockchainStats.bind(this));
    
    // Block endpoints
    this.app.get('/api/blocks', this.handleGetBlocks.bind(this));
    this.app.get('/api/blocks/latest', this.handleGetLatestBlocks.bind(this));
    this.app.get('/api/blocks/:identifier', this.handleGetBlock.bind(this));
    this.app.post('/api/blocks/mine', this.handleMineBlock.bind(this));

    // Transaction endpoints
    this.app.get('/api/transactions', this.handleGetTransactions.bind(this));
    this.app.get('/api/transactions/:id', this.handleGetTransaction.bind(this));
    this.app.post('/api/transactions', this.handleCreateTransaction.bind(this));
    this.app.get('/api/transactions/address/:address', this.handleGetTransactionsByAddress.bind(this));
    this.app.get('/api/transactions/pending', this.handleGetPendingTransactions.bind(this));

    // Memory data endpoints
    this.app.get('/api/memory', this.handleGetMemoryData.bind(this));
    this.app.get('/api/memory/stats', this.handleGetMemoryStats.bind(this));
    this.app.get('/api/memory/search', this.handleSearchMemoryData.bind(this));
    this.app.get('/api/memory/:id', this.handleGetMemoryDataById.bind(this));
    this.app.post('/api/memory', this.handleStoreMemoryData.bind(this));
    this.app.put('/api/memory/:id/archive', this.handleArchiveMemoryData.bind(this));
    this.app.put('/api/memory/:id/promote', this.handlePromoteMemoryData.bind(this));
    this.app.delete('/api/memory/:id', this.handleForgetMemoryData.bind(this));

    // Address/wallet endpoints
    this.app.get('/api/address/:address', this.handleGetAddressInfo.bind(this));
    this.app.get('/api/address/:address/memory', this.handleGetAddressMemoryData.bind(this));

    // Consensus endpoints
    this.app.get('/api/consensus/difficulty', this.handleGetDifficulty.bind(this));
    this.app.get('/api/consensus/stats', this.handleGetConsensusStats.bind(this));

    // Network endpoints
    this.app.get('/api/network/hashrate', this.handleGetNetworkHashRate.bind(this));
    
    // Analytics endpoints
    this.app.get('/api/analytics/memory-trends', this.handleGetMemoryTrends.bind(this));
    this.app.get('/api/analytics/performance', this.handleGetPerformanceMetrics.bind(this));

    // Admin endpoints (should be protected in production)
    this.app.post('/api/admin/reset', this.handleResetBlockchain.bind(this));
    this.app.get('/api/admin/logs', this.handleGetLogs.bind(this));
  }

  private setupErrorHandling(): void {
    // 404 handler
    this.app.use((req: Request, res: Response) => {
      this.sendError(res, 'Endpoint not found', 404);
    });

    // Global error handler
    this.app.use((error: any, req: Request, res: Response, next: NextFunction) => {
      this.logger.handleError(error, 'API_ERROR');
      this.sendError(res, 'Internal server error', 500);
    });
  }

  // Utility methods
  private sendSuccess<T>(res: Response, data: T, statusCode: number = 200): void {
    const response: ApiSuccess<T> = {
      success: true,
      data,
      timestamp: new Date().toISOString()
    };
    res.status(statusCode).json(response);
  }

  private sendError(res: Response, error: string, statusCode: number = 400, details?: any): void {
    const response: ApiError = {
      success: false,
      error,
      code: statusCode,
      details
    };
    res.status(statusCode).json(response);
  }

  // Route handlers
  private async handleHealthCheck(req: Request, res: Response): Promise<void> {
    try {
      const health = await this.database.healthCheck();
      const stats = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0',
        blockchain: {
          height: this.blockchain.getBlockchainState().height,
          lastBlock: this.blockchain.getLatestBlock()?.hash || null
        },
        database: health
      };
      this.sendSuccess(res, stats);
    } catch (error) {
      this.logger.handleError(error as Error, 'HEALTH_CHECK');
      this.sendError(res, 'Health check failed', 500);
    }
  }

  private async handleGetBlockchainState(req: Request, res: Response): Promise<void> {
    try {
      const state = this.blockchain.getBlockchainState();
      this.sendSuccess(res, state);
    } catch (error) {
      this.logger.handleError(error as Error, 'GET_BLOCKCHAIN_STATE');
      this.sendError(res, 'Failed to get blockchain state', 500);
    }
  }

  private async handleGetBlockchainStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.database.getBlockchainStats();
      this.sendSuccess(res, stats);
    } catch (error) {
      this.logger.handleError(error as Error, 'GET_BLOCKCHAIN_STATS');
      this.sendError(res, 'Failed to get blockchain stats', 500);
    }
  }

  private async handleGetBlocks(req: Request, res: Response): Promise<void> {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const offset = parseInt(req.query.offset as string) || 0;
      
      const blocks = await this.database.getBlocks(limit, offset);
      this.sendSuccess(res, {
        blocks,
        total: blocks.length,
        limit,
        offset
      });
    } catch (error) {
      this.logger.handleError(error as Error, 'GET_BLOCKS');
      this.sendError(res, 'Failed to get blocks', 500);
    }
  }

  private async handleGetLatestBlocks(req: Request, res: Response): Promise<void> {
    try {
      const count = Math.min(parseInt(req.query.count as string) || 10, 50);
      const blocks = await this.database.getLatestBlocks(count);
      this.sendSuccess(res, blocks);
    } catch (error) {
      this.logger.handleError(error as Error, 'GET_LATEST_BLOCKS');
      this.sendError(res, 'Failed to get latest blocks', 500);
    }
  }

  private async handleGetBlock(req: Request, res: Response): Promise<void> {
    try {
      const identifier = req.params.identifier;
      let block: Block | null = null;

      // Try to get by index first
      if (!isNaN(Number(identifier))) {
        block = await this.database.getBlock(parseInt(identifier));
      } else {
        // Try to get by hash
        block = await this.database.getBlockByHash(identifier);
      }

      if (!block) {
        this.sendError(res, 'Block not found', 404);
        return;
      }

      this.sendSuccess(res, block);
    } catch (error) {
      this.logger.handleError(error as Error, 'GET_BLOCK');
      this.sendError(res, 'Failed to get block', 500);
    }
  }

  private async handleMineBlock(req: Request, res: Response): Promise<void> {
    try {
      const minerAddress = req.body.minerAddress || 'api-miner';
      
      const startTime = Date.now();
      const block = await this.blockchain.mineBlock(minerAddress);
      const duration = Date.now() - startTime;

      if (block) {
        this.sendSuccess(res, {
          block,
          miningTime: duration,
          success: true
        });
      } else {
        this.sendError(res, 'No transactions to mine', 400);
      }
    } catch (error) {
      this.logger.handleError(error as Error, 'MINE_BLOCK');
      this.sendError(res, 'Failed to mine block', 500);
    }
  }

  private async handleGetTransactions(req: Request, res: Response): Promise<void> {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const offset = parseInt(req.query.offset as string) || 0;
      const type = req.query.type as TransactionType;
      
      const filter: any = {};
      if (type) filter.type = type;

      const transactions = await this.database.getTransactions(filter, limit, offset);
      this.sendSuccess(res, {
        transactions,
        total: transactions.length,
        limit,
        offset
      });
    } catch (error) {
      this.logger.handleError(error as Error, 'GET_TRANSACTIONS');
      this.sendError(res, 'Failed to get transactions', 500);
    }
  }

  private async handleGetTransaction(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      let transaction: Transaction | null = null;

      // Try to get by ID first
      transaction = await this.database.getTransaction(id);
      if (!transaction) {
        // Try to get by hash
        transaction = await this.database.getTransactionByHash(id);
      }

      if (!transaction) {
        this.sendError(res, 'Transaction not found', 404);
        return;
      }

      this.sendSuccess(res, transaction);
    } catch (error) {
      this.logger.handleError(error as Error, 'GET_TRANSACTION');
      this.sendError(res, 'Failed to get transaction', 500);
    }
  }

  private async handleCreateTransaction(req: Request, res: Response): Promise<void> {
    try {
      const { from, to, type, data, gasPrice, gasLimit } = req.body;

      if (!from || !type) {
        this.sendError(res, 'Missing required fields: from, type', 400);
        return;
      }

      const transaction: Transaction = {
        id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        hash: '',
        from,
        to,
        type,
        data,
        gasPrice: gasPrice || 1,
        gasLimit: gasLimit || 100000,
        nonce: Date.now(),
        timestamp: new Date(),
        signature: 'api_generated',
        relevanceImpact: data?.relevanceScore || 0
      };

      transaction.hash = BlockchainUtils.generateHash(JSON.stringify(transaction));
      
      const added = await this.blockchain.addTransaction(transaction);
      if (added) {
        this.sendSuccess(res, transaction, 201);
      } else {
        this.sendError(res, 'Failed to add transaction', 400);
      }
    } catch (error) {
      this.logger.handleError(error as Error, 'CREATE_TRANSACTION');
      this.sendError(res, 'Failed to create transaction', 500);
    }
  }

  private async handleGetTransactionsByAddress(req: Request, res: Response): Promise<void> {
    try {
      const address = req.params.address;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      
      const transactions = await this.database.getTransactionsByAddress(address, limit);
      this.sendSuccess(res, transactions);
    } catch (error) {
      this.logger.handleError(error as Error, 'GET_TRANSACTIONS_BY_ADDRESS');
      this.sendError(res, 'Failed to get transactions by address', 500);
    }
  }

  private async handleGetPendingTransactions(req: Request, res: Response): Promise<void> {
    try {
      const pendingTransactions = this.blockchain.getPendingTransactions();
      this.sendSuccess(res, pendingTransactions);
    } catch (error) {
      this.logger.handleError(error as Error, 'GET_PENDING_TRANSACTIONS');
      this.sendError(res, 'Failed to get pending transactions', 500);
    }
  }

  private async handleGetMemoryData(req: Request, res: Response): Promise<void> {
    try {
      const state = req.query.state as DataLifecycleState;
      const owner = req.query.owner as string;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

      let memoryData: MemoryData[] = [];
      
      if (state) {
        memoryData = await this.database.getMemoryDataByState(state);
      } else if (owner) {
        memoryData = await this.database.getMemoryDataByOwner(owner);
      } else {
        memoryData = await this.database.getAllMemoryData();
      }

      // Apply limit
      memoryData = memoryData.slice(0, limit);

      this.sendSuccess(res, memoryData);
    } catch (error) {
      this.logger.handleError(error as Error, 'GET_MEMORY_DATA');
      this.sendError(res, 'Failed to get memory data', 500);
    }
  }

  private async handleGetMemoryStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.blockchain.getAllMemoryData();
      const memoryStats = {
        total: stats.length,
        active: stats.filter(d => d.state === DataLifecycleState.ACTIVE).length,
        archived: stats.filter(d => d.state === DataLifecycleState.ARCHIVED).length,
        dead: stats.filter(d => d.state === DataLifecycleState.DEAD).length,
        totalSize: stats.reduce((sum, d) => sum + d.size, 0),
        averageRelevance: stats.length > 0 ? stats.reduce((sum, d) => sum + d.relevanceScore, 0) / stats.length : 0
      };

      this.sendSuccess(res, memoryStats);
    } catch (error) {
      this.logger.handleError(error as Error, 'GET_MEMORY_STATS');
      this.sendError(res, 'Failed to get memory stats', 500);
    }
  }

  private async handleSearchMemoryData(req: Request, res: Response): Promise<void> {
    try {
      const query = {
        state: req.query.state as DataLifecycleState,
        owner: req.query.owner as string,
        minRelevance: req.query.minRelevance ? parseFloat(req.query.minRelevance as string) : undefined,
        maxAge: req.query.maxAge ? parseInt(req.query.maxAge as string) : undefined,
        contentHash: req.query.contentHash as string
      };

      // Remove undefined values
      Object.keys(query).forEach(key => {
        if ((query as any)[key] === undefined) {
          delete (query as any)[key];
        }
      });

      const results = await this.blockchain.getAllMemoryData();
      // Note: In a real implementation, this should be done in the database
      const filteredResults = results.filter(data => {
        if (query.state && data.state !== query.state) return false;
        if (query.owner && data.owner !== query.owner) return false;
        if (query.minRelevance && data.relevanceScore < query.minRelevance) return false;
        if (query.contentHash && data.hash !== query.contentHash) return false;
        
        if (query.maxAge) {
          const age = Date.now() - data.createdAt.getTime();
          const maxAgeMs = query.maxAge * 24 * 60 * 60 * 1000;
          if (age > maxAgeMs) return false;
        }
        
        return true;
      });

      this.sendSuccess(res, filteredResults);
    } catch (error) {
      this.logger.handleError(error as Error, 'SEARCH_MEMORY_DATA');
      this.sendError(res, 'Failed to search memory data', 500);
    }
  }

  private async handleGetMemoryDataById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const memoryData = await this.blockchain.getMemoryData(id);

      if (!memoryData) {
        this.sendError(res, 'Memory data not found', 404);
        return;
      }

      this.sendSuccess(res, memoryData);
    } catch (error) {
      this.logger.handleError(error as Error, 'GET_MEMORY_DATA_BY_ID');
      this.sendError(res, 'Failed to get memory data', 500);
    }
  }

  private async handleStoreMemoryData(req: Request, res: Response): Promise<void> {
    try {
      const { content, owner, metadata } = req.body;

      if (!content || !owner) {
        this.sendError(res, 'Missing required fields: content, owner', 400);
        return;
      }

      const memoryData: MemoryData = {
        id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        hash: '',
        content,
        size: typeof content === 'string' ? content.length : Buffer.byteLength(content),
        state: DataLifecycleState.ACTIVE,
        relevanceScore: 100,
        accessCount: 1,
        lastAccessed: new Date(),
        createdAt: new Date(),
        owner,
        metadata: metadata || {}
      };

      // Create a transaction for storing the data
      const transaction: Transaction = {
        id: `store_${memoryData.id}`,
        hash: '',
        from: owner,
        type: TransactionType.CREATE,
        data: memoryData,
        gasPrice: 1,
        gasLimit: 100000,
        nonce: Date.now(),
        timestamp: new Date(),
        signature: 'api_generated',
        relevanceImpact: 100
      };

      transaction.hash = BlockchainUtils.generateHash(JSON.stringify(transaction));

      const added = await this.blockchain.addTransaction(transaction);
      if (added) {
        this.sendSuccess(res, memoryData, 201);
      } else {
        this.sendError(res, 'Failed to store memory data', 400);
      }
    } catch (error) {
      this.logger.handleError(error as Error, 'STORE_MEMORY_DATA');
      this.sendError(res, 'Failed to store memory data', 500);
    }
  }

  private async handleArchiveMemoryData(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const memoryData = await this.blockchain.getMemoryData(id);

      if (!memoryData) {
        this.sendError(res, 'Memory data not found', 404);
        return;
      }

      // Create archive transaction
      const transaction: Transaction = {
        id: `archive_${id}_${Date.now()}`,
        hash: '',
        from: 'system',
        type: TransactionType.ARCHIVE,
        data: memoryData,
        gasPrice: 1,
        gasLimit: 100000,
        nonce: Date.now(),
        timestamp: new Date(),
        signature: 'api_generated',
        relevanceImpact: memoryData.relevanceScore
      };

      transaction.hash = BlockchainUtils.generateHash(JSON.stringify(transaction));

      const added = await this.blockchain.addTransaction(transaction);
      if (added) {
        this.sendSuccess(res, { message: 'Archive transaction created', transactionId: transaction.id });
      } else {
        this.sendError(res, 'Failed to create archive transaction', 400);
      }
    } catch (error) {
      this.logger.handleError(error as Error, 'ARCHIVE_MEMORY_DATA');
      this.sendError(res, 'Failed to archive memory data', 500);
    }
  }

  private async handlePromoteMemoryData(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const memoryData = await this.blockchain.getMemoryData(id);

      if (!memoryData) {
        this.sendError(res, 'Memory data not found', 404);
        return;
      }

      // Create promote transaction
      const transaction: Transaction = {
        id: `promote_${id}_${Date.now()}`,
        hash: '',
        from: 'system',
        type: TransactionType.PROMOTE,
        data: memoryData,
        gasPrice: 1,
        gasLimit: 100000,
        nonce: Date.now(),
        timestamp: new Date(),
        signature: 'api_generated',
        relevanceImpact: memoryData.relevanceScore
      };

      transaction.hash = BlockchainUtils.generateHash(JSON.stringify(transaction));

      const added = await this.blockchain.addTransaction(transaction);
      if (added) {
        this.sendSuccess(res, { message: 'Promote transaction created', transactionId: transaction.id });
      } else {
        this.sendError(res, 'Failed to create promote transaction', 400);
      }
    } catch (error) {
      this.logger.handleError(error as Error, 'PROMOTE_MEMORY_DATA');
      this.sendError(res, 'Failed to promote memory data', 500);
    }
  }

  private async handleForgetMemoryData(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const { reason } = req.body;
      const memoryData = await this.blockchain.getMemoryData(id);

      if (!memoryData) {
        this.sendError(res, 'Memory data not found', 404);
        return;
      }

      // Create forget transaction
      const transaction: Transaction = {
        id: `forget_${id}_${Date.now()}`,
        hash: '',
        from: 'system',
        type: TransactionType.FORGET,
        data: { ...memoryData, reason },
        gasPrice: 1,
        gasLimit: 100000,
        nonce: Date.now(),
        timestamp: new Date(),
        signature: 'api_generated',
        relevanceImpact: memoryData.relevanceScore
      };

      transaction.hash = BlockchainUtils.generateHash(JSON.stringify(transaction));

      const added = await this.blockchain.addTransaction(transaction);
      if (added) {
        this.sendSuccess(res, { message: 'Forget transaction created', transactionId: transaction.id });
      } else {
        this.sendError(res, 'Failed to create forget transaction', 400);
      }
    } catch (error) {
      this.logger.handleError(error as Error, 'FORGET_MEMORY_DATA');
      this.sendError(res, 'Failed to forget memory data', 500);
    }
  }

  private async handleGetAddressInfo(req: Request, res: Response): Promise<void> {
    try {
      const address = req.params.address;
      
      const [transactions, memoryData] = await Promise.all([
        this.database.getTransactionsByAddress(address, 100),
        this.database.getMemoryDataByOwner(address)
      ]);

      const info = {
        address,
        transactionCount: transactions.length,
        memoryDataCount: memoryData.length,
        memoryByState: {
          active: memoryData.filter(d => d.state === DataLifecycleState.ACTIVE).length,
          archived: memoryData.filter(d => d.state === DataLifecycleState.ARCHIVED).length,
          dead: memoryData.filter(d => d.state === DataLifecycleState.DEAD).length
        },
        totalMemorySize: memoryData.reduce((sum, d) => sum + d.size, 0),
        averageRelevance: memoryData.length > 0 ? 
          memoryData.reduce((sum, d) => sum + d.relevanceScore, 0) / memoryData.length : 0
      };

      this.sendSuccess(res, info);
    } catch (error) {
      this.logger.handleError(error as Error, 'GET_ADDRESS_INFO');
      this.sendError(res, 'Failed to get address info', 500);
    }
  }

  private async handleGetAddressMemoryData(req: Request, res: Response): Promise<void> {
    try {
      const address = req.params.address;
      const state = req.query.state as DataLifecycleState;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      
      let memoryData = await this.database.getMemoryDataByOwner(address);
      
      if (state) {
        memoryData = memoryData.filter(d => d.state === state);
      }
      
      memoryData = memoryData.slice(0, limit);

      this.sendSuccess(res, memoryData);
    } catch (error) {
      this.logger.handleError(error as Error, 'GET_ADDRESS_MEMORY_DATA');
      this.sendError(res, 'Failed to get address memory data', 500);
    }
  }

  private async handleGetDifficulty(req: Request, res: Response): Promise<void> {
    try {
      const chain = this.blockchain.getChain();
      const latestBlock = this.blockchain.getLatestBlock();
      
      const difficulty = {
        current: latestBlock?.difficulty || 1,
        height: chain.length,
        lastAdjustment: latestBlock?.timestamp || null
      };

      this.sendSuccess(res, difficulty);
    } catch (error) {
      this.logger.handleError(error as Error, 'GET_DIFFICULTY');
      this.sendError(res, 'Failed to get difficulty', 500);
    }
  }

  private async handleGetConsensusStats(req: Request, res: Response): Promise<void> {
    try {
      const chain = this.blockchain.getChain();
      // Note: This would need the consensus instance to be accessible
      const stats = {
        chainLength: chain.length,
        averageDifficulty: chain.length > 0 ? 
          chain.reduce((sum, block) => sum + block.difficulty, 0) / chain.length : 0,
        averageMemoryEfficiency: chain.length > 0 ?
          chain.reduce((sum, block) => sum + block.memoryEfficiencyScore, 0) / chain.length : 0
      };

      this.sendSuccess(res, stats);
    } catch (error) {
      this.logger.handleError(error as Error, 'GET_CONSENSUS_STATS');
      this.sendError(res, 'Failed to get consensus stats', 500);
    }
  }

  private async handleGetNetworkHashRate(req: Request, res: Response): Promise<void> {
    try {
      const chain = this.blockchain.getChain();
      // Simplified hash rate calculation
      const hashRate = chain.length > 1 ? Math.pow(2, chain[chain.length - 1].difficulty) : 0;

      this.sendSuccess(res, { hashRate, unit: 'hashes/sec' });
    } catch (error) {
      this.logger.handleError(error as Error, 'GET_NETWORK_HASHRATE');
      this.sendError(res, 'Failed to get network hash rate', 500);
    }
  }

  private async handleGetMemoryTrends(req: Request, res: Response): Promise<void> {
    try {
      const chain = this.blockchain.getChain();
      const windowSize = Math.min(parseInt(req.query.window as string) || 50, 100);
      
      if (chain.length < windowSize) {
        this.sendError(res, 'Insufficient data for trend analysis', 400);
        return;
      }

      const recentBlocks = chain.slice(-windowSize);
      const trends = {
        memoryEfficiencyTrend: this.calculateTrend(recentBlocks.map(b => b.memoryEfficiencyScore)),
        relevanceTrend: this.calculateTrend(recentBlocks.map(b => b.totalRelevanceScore)),
        difficultyTrend: this.calculateTrend(recentBlocks.map(b => b.difficulty))
      };

      this.sendSuccess(res, trends);
    } catch (error) {
      this.logger.handleError(error as Error, 'GET_MEMORY_TRENDS');
      this.sendError(res, 'Failed to get memory trends', 500);
    }
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, v) => sum + v, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, v) => sum + v, 0) / secondHalf.length;
    
    return secondAvg - firstAvg;
  }

  private async handleGetPerformanceMetrics(req: Request, res: Response): Promise<void> {
    try {
      const metrics = {
        memory: process.memoryUsage(),
        uptime: process.uptime(),
        cpuUsage: process.cpuUsage(),
        blockchain: {
          height: this.blockchain.getBlockchainState().height,
          pendingTransactions: this.blockchain.getPendingTransactions().length
        }
      };

      this.sendSuccess(res, metrics);
    } catch (error) {
      this.logger.handleError(error as Error, 'GET_PERFORMANCE_METRICS');
      this.sendError(res, 'Failed to get performance metrics', 500);
    }
  }

  private async handleResetBlockchain(req: Request, res: Response): Promise<void> {
    try {
      // This is a dangerous operation that should be protected
      await this.database.clearAllData();
      
      // Reinitialize blockchain
      await this.blockchain.initialize();
      
      this.sendSuccess(res, { message: 'Blockchain reset successfully' });
    } catch (error) {
      this.logger.handleError(error as Error, 'RESET_BLOCKCHAIN');
      this.sendError(res, 'Failed to reset blockchain', 500);
    }
  }

  private async handleGetLogs(req: Request, res: Response): Promise<void> {
    try {
      const level = req.query.level as string || 'info';
      const limit = Math.min(parseInt(req.query.limit as string) || 100, 1000);
      
      // This is a simplified implementation
      // In production, you'd want to read from log files or a logging service
      this.sendSuccess(res, { 
        message: 'Log retrieval not implemented',
        level,
        limit
      });
    } catch (error) {
      this.logger.handleError(error as Error, 'GET_LOGS');
      this.sendError(res, 'Failed to get logs', 500);
    }
  }

  public getApp(): Express {
    return this.app;
  }
}
