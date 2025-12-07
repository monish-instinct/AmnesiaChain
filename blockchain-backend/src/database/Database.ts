import { MongoClient, Db, Collection } from 'mongodb';
import { Block, Transaction, MemoryData, DataLifecycleState } from '../blockchain/types';
import { Logger } from '../utils/Logger';

export interface DatabaseConfig {
  connectionString: string;
  databaseName: string;
}

export class Database {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private logger: Logger;
  private config: DatabaseConfig;
  private isConnected = false;

  // Collections
  private blocksCollection: Collection<Block> | null = null;
  private transactionsCollection: Collection<Transaction> | null = null;
  private memoryDataCollection: Collection<MemoryData> | null = null;

  constructor(config: DatabaseConfig, logger: Logger) {
    this.config = config;
    this.logger = logger;
  }

  public async connect(): Promise<void> {
    try {
      this.logger.info('Connecting to MongoDB...');
      
      this.client = new MongoClient(this.config.connectionString);
      await this.client.connect();
      
      this.db = this.client.db(this.config.databaseName);
      
      // Initialize collections
      this.blocksCollection = this.db.collection<Block>('blocks');
      this.transactionsCollection = this.db.collection<Transaction>('transactions');
      this.memoryDataCollection = this.db.collection<MemoryData>('memory_data');
      
      // Create indexes for better performance
      await this.createIndexes();
      
      this.isConnected = true;
      this.logger.info('Connected to MongoDB successfully');
    } catch (error) {
      this.logger.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  private async createIndexes(): Promise<void> {
    if (!this.blocksCollection || !this.transactionsCollection || !this.memoryDataCollection) {
      throw new Error('Collections not initialized');
    }

    try {
      // Block indexes
      await this.blocksCollection.createIndex({ index: 1 }, { unique: true });
      await this.blocksCollection.createIndex({ hash: 1 }, { unique: true });
      await this.blocksCollection.createIndex({ timestamp: -1 });
      await this.blocksCollection.createIndex({ miner: 1 });

      // Transaction indexes
      await this.transactionsCollection.createIndex({ id: 1 }, { unique: true });
      await this.transactionsCollection.createIndex({ hash: 1 }, { unique: true });
      await this.transactionsCollection.createIndex({ from: 1 });
      await this.transactionsCollection.createIndex({ to: 1 });
      await this.transactionsCollection.createIndex({ timestamp: -1 });
      await this.transactionsCollection.createIndex({ type: 1 });

      // Memory data indexes
      await this.memoryDataCollection.createIndex({ id: 1 }, { unique: true });
      await this.memoryDataCollection.createIndex({ hash: 1 });
      await this.memoryDataCollection.createIndex({ owner: 1 });
      await this.memoryDataCollection.createIndex({ state: 1 });
      await this.memoryDataCollection.createIndex({ relevanceScore: -1 });
      await this.memoryDataCollection.createIndex({ createdAt: -1 });
      await this.memoryDataCollection.createIndex({ lastAccessed: -1 });

      this.logger.info('Database indexes created successfully');
    } catch (error) {
      this.logger.warn('Error creating indexes:', error);
    }
  }

  public async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.isConnected = false;
      this.logger.info('Disconnected from MongoDB');
    }
  }

  // Block operations
  public async saveBlock(block: Block): Promise<void> {
    if (!this.blocksCollection) {
      throw new Error('Database not connected');
    }

    try {
      await this.blocksCollection.insertOne(block);
      this.logger.debug(`Block ${block.index} saved to database`);
    } catch (error) {
      this.logger.error(`Error saving block ${block.index}:`, error);
      throw error;
    }
  }

  public async getBlock(index: number): Promise<Block | null> {
    if (!this.blocksCollection) {
      throw new Error('Database not connected');
    }

    try {
      const block = await this.blocksCollection.findOne({ index });
      return block;
    } catch (error) {
      this.logger.error(`Error getting block ${index}:`, error);
      return null;
    }
  }

  public async getBlockByHash(hash: string): Promise<Block | null> {
    if (!this.blocksCollection) {
      throw new Error('Database not connected');
    }

    try {
      const block = await this.blocksCollection.findOne({ hash });
      return block;
    } catch (error) {
      this.logger.error(`Error getting block by hash ${hash}:`, error);
      return null;
    }
  }

  public async getBlocks(limit?: number, offset?: number): Promise<Block[]> {
    if (!this.blocksCollection) {
      throw new Error('Database not connected');
    }

    try {
      let query = this.blocksCollection.find({}).sort({ index: 1 });
      
      if (offset) {
        query = query.skip(offset);
      }
      
      if (limit) {
        query = query.limit(limit);
      }

      const blocks = await query.toArray();
      return blocks;
    } catch (error) {
      this.logger.error('Error getting blocks:', error);
      return [];
    }
  }

  public async getLatestBlocks(count: number = 10): Promise<Block[]> {
    if (!this.blocksCollection) {
      throw new Error('Database not connected');
    }

    try {
      const blocks = await this.blocksCollection
        .find({})
        .sort({ index: -1 })
        .limit(count)
        .toArray();
      
      return blocks.reverse(); // Return in ascending order
    } catch (error) {
      this.logger.error('Error getting latest blocks:', error);
      return [];
    }
  }

  public async getBlockchainHeight(): Promise<number> {
    if (!this.blocksCollection) {
      throw new Error('Database not connected');
    }

    try {
      const lastBlock = await this.blocksCollection
        .findOne({}, { sort: { index: -1 } });
      
      return lastBlock ? lastBlock.index : -1;
    } catch (error) {
      this.logger.error('Error getting blockchain height:', error);
      return -1;
    }
  }

  // Transaction operations
  public async saveTransaction(transaction: Transaction): Promise<void> {
    if (!this.transactionsCollection) {
      throw new Error('Database not connected');
    }

    try {
      await this.transactionsCollection.insertOne(transaction);
      this.logger.debug(`Transaction ${transaction.id} saved to database`);
    } catch (error) {
      this.logger.error(`Error saving transaction ${transaction.id}:`, error);
      throw error;
    }
  }

  public async getTransaction(id: string): Promise<Transaction | null> {
    if (!this.transactionsCollection) {
      throw new Error('Database not connected');
    }

    try {
      const transaction = await this.transactionsCollection.findOne({ id });
      return transaction;
    } catch (error) {
      this.logger.error(`Error getting transaction ${id}:`, error);
      return null;
    }
  }

  public async getTransactionByHash(hash: string): Promise<Transaction | null> {
    if (!this.transactionsCollection) {
      throw new Error('Database not connected');
    }

    try {
      const transaction = await this.transactionsCollection.findOne({ hash });
      return transaction;
    } catch (error) {
      this.logger.error(`Error getting transaction by hash ${hash}:`, error);
      return null;
    }
  }

  public async getTransactions(filter: any = {}, limit?: number, offset?: number): Promise<Transaction[]> {
    if (!this.transactionsCollection) {
      throw new Error('Database not connected');
    }

    try {
      let query = this.transactionsCollection.find(filter).sort({ timestamp: -1 });
      
      if (offset) {
        query = query.skip(offset);
      }
      
      if (limit) {
        query = query.limit(limit);
      }

      const transactions = await query.toArray();
      return transactions;
    } catch (error) {
      this.logger.error('Error getting transactions:', error);
      return [];
    }
  }

  public async getTransactionsByAddress(address: string, limit?: number): Promise<Transaction[]> {
    if (!this.transactionsCollection) {
      throw new Error('Database not connected');
    }

    try {
      const transactions = await this.transactionsCollection
        .find({
          $or: [
            { from: address },
            { to: address }
          ]
        })
        .sort({ timestamp: -1 })
        .limit(limit || 100)
        .toArray();

      return transactions;
    } catch (error) {
      this.logger.error(`Error getting transactions for address ${address}:`, error);
      return [];
    }
  }

  // Memory data operations
  public async saveMemoryData(memoryData: MemoryData): Promise<void> {
    if (!this.memoryDataCollection) {
      throw new Error('Database not connected');
    }

    try {
      await this.memoryDataCollection.insertOne(memoryData);
      this.logger.debug(`Memory data ${memoryData.id} saved to database`);
    } catch (error) {
      this.logger.error(`Error saving memory data ${memoryData.id}:`, error);
      throw error;
    }
  }

  public async getMemoryData(id: string): Promise<MemoryData | null> {
    if (!this.memoryDataCollection) {
      throw new Error('Database not connected');
    }

    try {
      const memoryData = await this.memoryDataCollection.findOne({ id });
      return memoryData;
    } catch (error) {
      this.logger.error(`Error getting memory data ${id}:`, error);
      return null;
    }
  }

  public async getAllMemoryData(): Promise<MemoryData[]> {
    if (!this.memoryDataCollection) {
      throw new Error('Database not connected');
    }

    try {
      const memoryData = await this.memoryDataCollection.find({}).toArray();
      return memoryData;
    } catch (error) {
      this.logger.error('Error getting all memory data:', error);
      return [];
    }
  }

  public async updateMemoryData(id: string, updates: Partial<MemoryData>): Promise<void> {
    if (!this.memoryDataCollection) {
      throw new Error('Database not connected');
    }

    try {
      await this.memoryDataCollection.updateOne(
        { id },
        { $set: updates }
      );
      this.logger.debug(`Memory data ${id} updated in database`);
    } catch (error) {
      this.logger.error(`Error updating memory data ${id}:`, error);
      throw error;
    }
  }

  public async deleteMemoryData(id: string): Promise<void> {
    if (!this.memoryDataCollection) {
      throw new Error('Database not connected');
    }

    try {
      await this.memoryDataCollection.deleteOne({ id });
      this.logger.debug(`Memory data ${id} deleted from database`);
    } catch (error) {
      this.logger.error(`Error deleting memory data ${id}:`, error);
      throw error;
    }
  }

  public async getMemoryDataByOwner(owner: string): Promise<MemoryData[]> {
    if (!this.memoryDataCollection) {
      throw new Error('Database not connected');
    }

    try {
      const memoryData = await this.memoryDataCollection
        .find({ owner })
        .sort({ createdAt: -1 })
        .toArray();
      
      return memoryData;
    } catch (error) {
      this.logger.error(`Error getting memory data for owner ${owner}:`, error);
      return [];
    }
  }

  public async getMemoryDataByState(state: DataLifecycleState): Promise<MemoryData[]> {
    if (!this.memoryDataCollection) {
      throw new Error('Database not connected');
    }

    try {
      const memoryData = await this.memoryDataCollection
        .find({ state })
        .sort({ relevanceScore: -1 })
        .toArray();
      
      return memoryData;
    } catch (error) {
      this.logger.error(`Error getting memory data by state ${state}:`, error);
      return [];
    }
  }

  // Statistics and analytics
  public async getBlockchainStats(): Promise<any> {
    if (!this.blocksCollection || !this.transactionsCollection || !this.memoryDataCollection) {
      throw new Error('Database not connected');
    }

    try {
      const [
        totalBlocks,
        totalTransactions,
        totalMemoryData,
        latestBlock
      ] = await Promise.all([
        this.blocksCollection.countDocuments(),
        this.transactionsCollection.countDocuments(),
        this.memoryDataCollection.countDocuments(),
        this.blocksCollection.findOne({}, { sort: { index: -1 } })
      ]);

      // Memory data statistics
      const memoryStats = await this.memoryDataCollection.aggregate([
        {
          $group: {
            _id: '$state',
            count: { $sum: 1 },
            totalSize: { $sum: '$size' },
            avgRelevance: { $avg: '$relevanceScore' }
          }
        }
      ]).toArray();

      return {
        blockchain: {
          height: latestBlock?.index || 0,
          totalBlocks,
          totalTransactions,
          latestBlockHash: latestBlock?.hash || ''
        },
        memory: {
          totalRecords: totalMemoryData,
          byState: memoryStats.reduce((acc, stat) => {
            acc[stat._id] = {
              count: stat.count,
              totalSize: stat.totalSize,
              averageRelevance: stat.avgRelevance
            };
            return acc;
          }, {} as any)
        }
      };
    } catch (error) {
      this.logger.error('Error getting blockchain stats:', error);
      return null;
    }
  }

  // Utility methods
  public async clearAllData(): Promise<void> {
    if (!this.blocksCollection || !this.transactionsCollection || !this.memoryDataCollection) {
      throw new Error('Database not connected');
    }

    try {
      await Promise.all([
        this.blocksCollection.deleteMany({}),
        this.transactionsCollection.deleteMany({}),
        this.memoryDataCollection.deleteMany({})
      ]);
      
      this.logger.info('All data cleared from database');
    } catch (error) {
      this.logger.error('Error clearing database:', error);
      throw error;
    }
  }

  public async ping(): Promise<boolean> {
    if (!this.db) {
      return false;
    }

    try {
      await this.db.admin().ping();
      return true;
    } catch (error) {
      return false;
    }
  }

  public isConnected_(): boolean {
    return this.isConnected;
  }

  // Health check
  public async healthCheck(): Promise<{
    connected: boolean;
    collections: { blocks: boolean; transactions: boolean; memoryData: boolean };
    stats?: any;
  }> {
    const connected = await this.ping();
    
    if (!connected) {
      return {
        connected: false,
        collections: { blocks: false, transactions: false, memoryData: false }
      };
    }

    try {
      const stats = await this.getBlockchainStats();
      return {
        connected: true,
        collections: {
          blocks: !!this.blocksCollection,
          transactions: !!this.transactionsCollection,
          memoryData: !!this.memoryDataCollection
        },
        stats
      };
    } catch (error) {
      return {
        connected: true,
        collections: {
          blocks: !!this.blocksCollection,
          transactions: !!this.transactionsCollection,
          memoryData: !!this.memoryDataCollection
        }
      };
    }
  }
}
