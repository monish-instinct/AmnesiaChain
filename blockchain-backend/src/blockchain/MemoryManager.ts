import { EventEmitter } from 'events';
import { MemoryData, DataLifecycleState, BlockchainUtils } from './types';
import { Database } from '../database/Database';
import { Logger } from '../utils/Logger';

export interface MemoryStats {
  activeSize: number;
  archivedSize: number;
  deadPurged: number;
  totalSize: number;
  activeCount: number;
  archivedCount: number;
  deadCount: number;
  averageRelevance: number;
}

export class MemoryManager extends EventEmitter {
  private database: Database;
  private logger: Logger;
  private memoryStore: Map<string, MemoryData> = new Map();
  private isInitialized = false;

  // Memory management parameters
  private readonly MAX_ACTIVE_SIZE = 100 * 1024 * 1024; // 100MB active memory limit
  private readonly RELEVANCE_UPDATE_INTERVAL = 60000; // Update relevance scores every minute
  private readonly CLEANUP_INTERVAL = 300000; // Run cleanup every 5 minutes

  constructor(database: Database, logger: Logger) {
    super();
    this.database = database;
    this.logger = logger;
  }

  public async initialize(): Promise<void> {
    this.logger.info('Initializing Memory Manager...');
    
    try {
      // Load existing memory data from database
      await this.loadMemoryFromDatabase();
      
      // Start background processes
      this.startRelevanceUpdater();
      this.startMemoryCleanup();
      
      this.isInitialized = true;
      this.logger.info('Memory Manager initialized successfully');
      this.emit('initialized');
    } catch (error) {
      this.logger.error('Failed to initialize Memory Manager:', error);
      throw error;
    }
  }

  private async loadMemoryFromDatabase(): Promise<void> {
    try {
      const memoryData = await this.database.getAllMemoryData();
      this.memoryStore.clear();
      
      for (const data of memoryData) {
        this.memoryStore.set(data.id, data);
      }
      
      this.logger.info(`Loaded ${memoryData.length} memory records from database`);
    } catch (error) {
      this.logger.warn('Could not load memory data from database:', error);
    }
  }

  public async storeData(data: MemoryData): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error('Memory Manager not initialized');
    }

    try {
      // Set initial state as active
      data.state = DataLifecycleState.ACTIVE;
      data.createdAt = new Date();
      data.lastAccessed = new Date();
      data.accessCount = 1;
      data.relevanceScore = 100; // Start with maximum relevance

      // Calculate content hash if not provided
      if (!data.hash) {
        const content = typeof data.content === 'string' ? data.content : data.content.toString();
        data.hash = BlockchainUtils.generateHash(content);
      }

      // Store in memory and database
      this.memoryStore.set(data.id, data);
      await this.database.saveMemoryData(data);

      this.logger.info(`Data stored: ${data.id} (${data.size} bytes)`);
      this.emit('dataStored', data);
      
      // Check if we need to trigger archival due to memory pressure
      await this.checkMemoryPressure();
      
      return true;
    } catch (error) {
      this.logger.error(`Error storing data ${data.id}:`, error);
      return false;
    }
  }

  public async getData(id: string): Promise<MemoryData | null> {
    const data = this.memoryStore.get(id);
    if (!data) {
      return null;
    }

    // Update access metrics
    data.lastAccessed = new Date();
    data.accessCount += 1;
    
    // Recalculate relevance score
    data.relevanceScore = BlockchainUtils.calculateRelevanceScore(data);
    
    // Update in database
    await this.database.updateMemoryData(id, {
      lastAccessed: data.lastAccessed,
      accessCount: data.accessCount,
      relevanceScore: data.relevanceScore
    });

    this.logger.debug(`Data accessed: ${id} (new relevance: ${data.relevanceScore.toFixed(2)})`);
    return data;
  }

  public async getAllData(): Promise<MemoryData[]> {
    return Array.from(this.memoryStore.values());
  }

  public async getActiveData(): Promise<MemoryData[]> {
    return Array.from(this.memoryStore.values()).filter(
      data => data.state === DataLifecycleState.ACTIVE
    );
  }

  public async getArchivedData(): Promise<MemoryData[]> {
    return Array.from(this.memoryStore.values()).filter(
      data => data.state === DataLifecycleState.ARCHIVED
    );
  }

  public async getDeadData(): Promise<MemoryData[]> {
    return Array.from(this.memoryStore.values()).filter(
      data => data.state === DataLifecycleState.DEAD
    );
  }

  public async archiveData(id: string): Promise<boolean> {
    const data = this.memoryStore.get(id);
    if (!data || data.state !== DataLifecycleState.ACTIVE) {
      this.logger.warn(`Cannot archive data: ${id} (not found or not active)`);
      return false;
    }

    try {
      data.state = DataLifecycleState.ARCHIVED;
      data.metadata = { ...data.metadata, archivedAt: new Date() };

      // Update in memory and database
      this.memoryStore.set(id, data);
      await this.database.updateMemoryData(id, {
        state: data.state,
        metadata: data.metadata
      });

      this.logger.info(`Data archived: ${id}`);
      this.emit('dataArchived', data);
      return true;
    } catch (error) {
      this.logger.error(`Error archiving data ${id}:`, error);
      return false;
    }
  }

  public async promoteData(id: string): Promise<boolean> {
    const data = this.memoryStore.get(id);
    if (!data || data.state !== DataLifecycleState.ARCHIVED) {
      this.logger.warn(`Cannot promote data: ${id} (not found or not archived)`);
      return false;
    }

    try {
      data.state = DataLifecycleState.ACTIVE;
      data.lastAccessed = new Date();
      data.accessCount += 1;
      data.relevanceScore = Math.min(100, data.relevanceScore + 20); // Boost relevance
      data.metadata = { ...data.metadata, promotedAt: new Date() };

      // Update in memory and database
      this.memoryStore.set(id, data);
      await this.database.updateMemoryData(id, {
        state: data.state,
        lastAccessed: data.lastAccessed,
        accessCount: data.accessCount,
        relevanceScore: data.relevanceScore,
        metadata: data.metadata
      });

      this.logger.info(`Data promoted: ${id} (new relevance: ${data.relevanceScore.toFixed(2)})`);
      this.emit('dataPromoted', data);
      return true;
    } catch (error) {
      this.logger.error(`Error promoting data ${id}:`, error);
      return false;
    }
  }

  public async forgetData(id: string): Promise<boolean> {
    const data = this.memoryStore.get(id);
    if (!data) {
      this.logger.warn(`Cannot forget data: ${id} (not found)`);
      return false;
    }

    try {
      if (data.state !== DataLifecycleState.DEAD) {
        data.state = DataLifecycleState.DEAD;
        data.metadata = { ...data.metadata, forgottenAt: new Date() };
        
        // Mark as dead first
        await this.database.updateMemoryData(id, {
          state: data.state,
          metadata: data.metadata
        });
      }

      // Remove from memory after a delay to allow for recovery
      setTimeout(async () => {
        this.memoryStore.delete(id);
        await this.database.deleteMemoryData(id);
        this.logger.info(`Data permanently forgotten: ${id}`);
      }, 24 * 60 * 60 * 1000); // 24 hour grace period

      this.logger.info(`Data marked for forgetting: ${id}`);
      this.emit('dataForgotten', data);
      return true;
    } catch (error) {
      this.logger.error(`Error forgetting data ${id}:`, error);
      return false;
    }
  }

  public async getMemoryStats(): Promise<MemoryStats> {
    const allData = Array.from(this.memoryStore.values());
    
    const activeData = allData.filter(d => d.state === DataLifecycleState.ACTIVE);
    const archivedData = allData.filter(d => d.state === DataLifecycleState.ARCHIVED);
    const deadData = allData.filter(d => d.state === DataLifecycleState.DEAD);
    
    const activeSize = activeData.reduce((sum, d) => sum + d.size, 0);
    const archivedSize = archivedData.reduce((sum, d) => sum + d.size, 0);
    const deadSize = deadData.reduce((sum, d) => sum + d.size, 0);
    
    const totalRelevance = allData.reduce((sum, d) => sum + d.relevanceScore, 0);
    const averageRelevance = allData.length > 0 ? totalRelevance / allData.length : 0;

    return {
      activeSize,
      archivedSize,
      deadPurged: deadSize,
      totalSize: activeSize + archivedSize + deadSize,
      activeCount: activeData.length,
      archivedCount: archivedData.length,
      deadCount: deadData.length,
      averageRelevance
    };
  }

  private async checkMemoryPressure(): Promise<void> {
    const stats = await this.getMemoryStats();
    const memoryUsage = stats.activeSize / this.MAX_ACTIVE_SIZE;
    
    if (memoryUsage > 0.8) { // 80% threshold
      this.logger.warn(`Memory pressure detected: ${(memoryUsage * 100).toFixed(1)}%`);
      
      // Trigger emergency archival of least relevant active data
      const activeData = await this.getActiveData();
      const candidates = activeData
        .sort((a, b) => a.relevanceScore - b.relevanceScore)
        .slice(0, Math.ceil(activeData.length * 0.2)); // Archive bottom 20%
      
      for (const data of candidates) {
        await this.archiveData(data.id);
      }
      
      this.emit('memoryPressure', { usage: memoryUsage, archived: candidates.length });
    }
  }

  private startRelevanceUpdater(): void {
    setInterval(async () => {
      try {
        await this.updateRelevanceScores();
      } catch (error) {
        this.logger.error('Error updating relevance scores:', error);
      }
    }, this.RELEVANCE_UPDATE_INTERVAL);
  }

  private startMemoryCleanup(): void {
    setInterval(async () => {
      try {
        await this.performMemoryCleanup();
      } catch (error) {
        this.logger.error('Error in memory cleanup:', error);
      }
    }, this.CLEANUP_INTERVAL);
  }

  private async updateRelevanceScores(): Promise<void> {
    this.logger.debug('Updating relevance scores...');
    
    let updated = 0;
    for (const [id, data] of this.memoryStore.entries()) {
      const oldScore = data.relevanceScore;
      const newScore = BlockchainUtils.calculateRelevanceScore(data);
      
      if (Math.abs(newScore - oldScore) > 1) { // Only update if significant change
        data.relevanceScore = newScore;
        this.memoryStore.set(id, data);
        
        await this.database.updateMemoryData(id, {
          relevanceScore: newScore
        });
        
        updated++;
      }
    }
    
    if (updated > 0) {
      this.logger.debug(`Updated relevance scores for ${updated} records`);
    }
  }

  private async performMemoryCleanup(): Promise<void> {
    this.logger.debug('Performing memory cleanup...');
    
    const now = Date.now();
    const deadData = Array.from(this.memoryStore.values()).filter(
      data => data.state === DataLifecycleState.DEAD
    );
    
    let cleaned = 0;
    for (const data of deadData) {
      const forgottenAt = data.metadata?.forgottenAt;
      if (forgottenAt) {
        const timeSinceForgotten = now - new Date(forgottenAt).getTime();
        const gracePeriod = 24 * 60 * 60 * 1000; // 24 hours
        
        if (timeSinceForgotten > gracePeriod) {
          this.memoryStore.delete(data.id);
          await this.database.deleteMemoryData(data.id);
          cleaned++;
        }
      }
    }
    
    if (cleaned > 0) {
      this.logger.info(`Cleaned up ${cleaned} forgotten records`);
      this.emit('memoryCleanup', { cleaned });
    }
  }

  public async optimizeMemory(): Promise<void> {
    this.logger.info('Running memory optimization...');
    
    const stats = await this.getMemoryStats();
    this.logger.info(`Current memory stats:`, stats);
    
    // Suggest archival candidates
    const activeData = await this.getActiveData();
    const archivalCandidates = activeData.filter(data =>
      BlockchainUtils.shouldArchiveData(data, 30)
    );
    
    // Suggest deletion candidates
    const archivedData = await this.getArchivedData();
    const deletionCandidates = archivedData.filter(data =>
      BlockchainUtils.shouldForgetData(data, 10)
    );
    
    this.logger.info(`Memory optimization suggestions:`);
    this.logger.info(`- Archive ${archivalCandidates.length} low-relevance records`);
    this.logger.info(`- Delete ${deletionCandidates.length} obsolete records`);
    
    this.emit('memoryOptimization', {
      stats,
      archivalCandidates: archivalCandidates.length,
      deletionCandidates: deletionCandidates.length
    });
  }

  // Search functions
  public async searchData(query: {
    state?: DataLifecycleState;
    minRelevance?: number;
    maxAge?: number;
    owner?: string;
    contentHash?: string;
  }): Promise<MemoryData[]> {
    const allData = Array.from(this.memoryStore.values());
    
    return allData.filter(data => {
      if (query.state && data.state !== query.state) return false;
      if (query.minRelevance && data.relevanceScore < query.minRelevance) return false;
      if (query.owner && data.owner !== query.owner) return false;
      if (query.contentHash && data.hash !== query.contentHash) return false;
      
      if (query.maxAge) {
        const age = Date.now() - data.createdAt.getTime();
        const maxAgeMs = query.maxAge * 24 * 60 * 60 * 1000;
        if (age > maxAgeMs) return false;
      }
      
      return true;
    });
  }

  public getMemorySize(): number {
    return this.memoryStore.size;
  }

  public isInitialized_(): boolean {
    return this.isInitialized;
  }
}
