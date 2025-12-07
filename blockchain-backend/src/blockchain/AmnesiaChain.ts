import { EventEmitter } from 'events';
import { 
  Block, 
  Transaction, 
  MemoryData, 
  BlockchainState, 
  DataLifecycleState, 
  TransactionType,
  BlockchainUtils,
  CognitiveConsensusData 
} from './types';
import { MemoryManager } from './MemoryManager';
import { CognitiveConsensus } from '../consensus/CognitiveConsensus';
import { Database } from '../database/Database';
import { Logger } from '../utils/Logger';

export class AmnesiaChain extends EventEmitter {
  private chain: Block[] = [];
  private pendingTransactions: Transaction[] = [];
  private memoryManager: MemoryManager;
  private consensus: CognitiveConsensus;
  private database: Database;
  private logger: Logger;
  private state: BlockchainState;
  private isInitialized = false;

  // Blockchain parameters
  private readonly BLOCK_TIME = 60000; // 1 minute target block time
  private readonly MAX_BLOCK_SIZE = 1024 * 1024; // 1MB max block size
  private readonly MEMORY_THRESHOLD = 0.8; // 80% memory usage triggers archival
  private readonly RELEVANCE_THRESHOLD = 30; // Below this score, data is archived
  private readonly FORGETTING_THRESHOLD = 10; // Below this score, data is deleted

  constructor(database: Database, logger: Logger) {
    super();
    this.database = database;
    this.logger = logger;
    this.memoryManager = new MemoryManager(database, logger);
    this.consensus = new CognitiveConsensus(logger);
    
    this.state = {
      height: 0,
      totalDifficulty: 0,
      activeMemorySize: 0,
      archivedMemorySize: 0,
      deadMemoryPurged: 0,
      averageRelevanceScore: 0,
      memoryEfficiency: 100,
      lastBlockHash: '',
      chainWork: '0'
    };

    this.initializeEventListeners();
  }

  private initializeEventListeners(): void {
    // Listen for memory events
    this.memoryManager.on('dataArchived', (data: MemoryData) => {
      this.logger.info(`Data archived: ${data.id}`);
      this.emit('dataArchived', data);
    });

    this.memoryManager.on('dataPromoted', (data: MemoryData) => {
      this.logger.info(`Data promoted: ${data.id}`);
      this.emit('dataPromoted', data);
    });

    this.memoryManager.on('dataForgotten', (data: MemoryData) => {
      this.logger.info(`Data forgotten: ${data.id}`);
      this.emit('dataForgotten', data);
    });

    // Listen for consensus events
    this.consensus.on('difficultyAdjusted', (newDifficulty: number) => {
      this.logger.info(`Difficulty adjusted to: ${newDifficulty}`);
      this.emit('difficultyAdjusted', newDifficulty);
    });
  }

  public async initialize(): Promise<void> {
    this.logger.info('Initializing AmnesiaChain...');
    
    try {
      // Load existing chain from database
      await this.loadChainFromDatabase();
      
      // If no chain exists, create genesis block
      if (this.chain.length === 0) {
        await this.createGenesisBlock();
      }

      // Initialize memory manager
      await this.memoryManager.initialize();
      
      // Update blockchain state
      await this.updateBlockchainState();
      
      // Start background processes
      this.startMemoryManagement();
      
      this.isInitialized = true;
      this.logger.info('AmnesiaChain initialized successfully');
      this.emit('initialized');
    } catch (error) {
      this.logger.error('Failed to initialize AmnesiaChain:', error);
      throw error;
    }
  }

  private async loadChainFromDatabase(): Promise<void> {
    try {
      const blocks = await this.database.getBlocks();
      this.chain = blocks.sort((a, b) => a.index - b.index);
      
      if (this.chain.length > 0) {
        const lastBlock = this.chain[this.chain.length - 1];
        this.state.height = lastBlock.index;
        this.state.lastBlockHash = lastBlock.hash;
      }
      
      this.logger.info(`Loaded ${this.chain.length} blocks from database`);
    } catch (error) {
      this.logger.warn('Could not load chain from database:', error);
    }
  }

  private async createGenesisBlock(): Promise<void> {
    const genesisBlock: Block = {
      index: 0,
      hash: '',
      previousHash: '0'.repeat(64),
      timestamp: new Date(),
      transactions: [],
      nonce: 0,
      difficulty: 4,
      merkleRoot: '0'.repeat(64),
      stateRoot: '0'.repeat(64),
      memoryEfficiencyScore: 100,
      totalRelevanceScore: 0,
      miner: 'genesis',
      size: 0
    };

    // Calculate genesis block hash
    genesisBlock.hash = this.calculateBlockHash(genesisBlock);
    
    this.chain.push(genesisBlock);
    await this.database.saveBlock(genesisBlock);
    
    this.logger.info('Genesis block created:', genesisBlock.hash);
  }

  public async addTransaction(transaction: Transaction): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error('AmnesiaChain not initialized');
    }

    try {
      // Validate transaction
      if (!this.validateTransaction(transaction)) {
        this.logger.warn('Invalid transaction rejected:', transaction.id);
        return false;
      }

      // Check if transaction already exists
      if (this.pendingTransactions.find(tx => tx.id === transaction.id)) {
        this.logger.warn('Duplicate transaction rejected:', transaction.id);
        return false;
      }

      // Add to pending transactions
      this.pendingTransactions.push(transaction);
      
      // Save to database
      await this.database.saveTransaction(transaction);
      
      this.logger.info(`Transaction added: ${transaction.id}`);
      this.emit('transactionAdded', transaction);
      
      return true;
    } catch (error) {
      this.logger.error('Error adding transaction:', error);
      return false;
    }
  }

  public async mineBlock(minerAddress: string): Promise<Block | null> {
    if (!this.isInitialized) {
      throw new Error('AmnesiaChain not initialized');
    }

    if (this.pendingTransactions.length === 0) {
      this.logger.debug('No pending transactions to mine');
      return null;
    }

    try {
      const previousBlock = this.getLatestBlock();
      const difficulty = await this.consensus.calculateDifficulty(this.chain);
      
      // Select transactions for the block (prioritize by relevance and gas)
      const selectedTransactions = this.selectTransactionsForBlock();
      
      // Create new block
      const newBlock: Block = {
        index: previousBlock.index + 1,
        hash: '',
        previousHash: previousBlock.hash,
        timestamp: new Date(),
        transactions: selectedTransactions,
        nonce: 0,
        difficulty,
        merkleRoot: BlockchainUtils.generateMerkleRoot(selectedTransactions),
        stateRoot: await this.calculateStateRoot(),
        memoryEfficiencyScore: await this.calculateMemoryEfficiency(),
        totalRelevanceScore: this.calculateTotalRelevanceScore(selectedTransactions),
        miner: minerAddress,
        size: this.calculateBlockSize(selectedTransactions)
      };

      // Mine the block (find valid nonce)
      const minedBlock = await this.mineBlockWithNonce(newBlock);
      
      if (minedBlock) {
        // Add block to chain
        await this.addBlock(minedBlock);
        
        // Remove mined transactions from pending
        this.pendingTransactions = this.pendingTransactions.filter(
          tx => !selectedTransactions.find(selected => selected.id === tx.id)
        );
        
        this.logger.info(`Block ${minedBlock.index} mined successfully: ${minedBlock.hash}`);
        return minedBlock;
      }
      
      return null;
    } catch (error) {
      this.logger.error('Error mining block:', error);
      return null;
    }
  }

  private async mineBlockWithNonce(block: Block): Promise<Block | null> {
    const target = '0'.repeat(block.difficulty);
    const maxIterations = 1000000; // Prevent infinite loops
    
    for (let nonce = 0; nonce < maxIterations; nonce++) {
      block.nonce = nonce;
      block.hash = this.calculateBlockHash(block);
      
      if (block.hash.substring(0, block.difficulty) === target) {
        return block;
      }
    }
    
    this.logger.warn('Mining failed: max iterations reached');
    return null;
  }

  private selectTransactionsForBlock(): Transaction[] {
    // Sort by relevance impact and gas price
    const sorted = [...this.pendingTransactions].sort((a, b) => {
      const scoreA = (a.relevanceImpact || 0) * 0.7 + a.gasPrice * 0.3;
      const scoreB = (b.relevanceImpact || 0) * 0.7 + b.gasPrice * 0.3;
      return scoreB - scoreA;
    });
    
    const selected: Transaction[] = [];
    let totalSize = 0;
    
    for (const tx of sorted) {
      const txSize = this.calculateTransactionSize(tx);
      if (totalSize + txSize <= this.MAX_BLOCK_SIZE) {
        selected.push(tx);
        totalSize += txSize;
      }
    }
    
    return selected;
  }

  private async addBlock(block: Block): Promise<boolean> {
    try {
      // Validate block
      if (!this.validateBlock(block)) {
        this.logger.warn('Invalid block rejected:', block.hash);
        return false;
      }
      
      // Add to chain
      this.chain.push(block);
      
      // Save to database
      await this.database.saveBlock(block);
      
      // Process transactions in the block
      await this.processBlockTransactions(block);
      
      // Update state
      await this.updateBlockchainState();
      
      this.logger.info(`Block ${block.index} added to chain`);
      this.emit('blockAdded', block);
      
      return true;
    } catch (error) {
      this.logger.error('Error adding block:', error);
      return false;
    }
  }

  private async processBlockTransactions(block: Block): Promise<void> {
    for (const transaction of block.transactions) {
      await this.processTransaction(transaction);
    }
  }

  private async processTransaction(transaction: Transaction): Promise<void> {
    try {
      switch (transaction.type) {
        case TransactionType.CREATE:
          await this.memoryManager.storeData(transaction.data as MemoryData);
          break;
        case TransactionType.ARCHIVE:
          await this.memoryManager.archiveData(transaction.data.id);
          break;
        case TransactionType.PROMOTE:
          await this.memoryManager.promoteData(transaction.data.id);
          break;
        case TransactionType.FORGET:
          await this.memoryManager.forgetData(transaction.data.id);
          break;
        default:
          this.logger.warn(`Unknown transaction type: ${transaction.type}`);
      }
    } catch (error) {
      this.logger.error(`Error processing transaction ${transaction.id}:`, error);
    }
  }

  private validateTransaction(transaction: Transaction): boolean {
    // Basic validation
    if (!transaction.id || !transaction.hash || !transaction.from) {
      return false;
    }
    
    // Validate signature (implement signature verification)
    // if (!this.verifyTransactionSignature(transaction)) {
    //   return false;
    // }
    
    return true;
  }

  private validateBlock(block: Block): boolean {
    // Basic validation
    if (!block.hash || !block.previousHash) {
      return false;
    }
    
    // Check if previous block exists
    const previousBlock = this.chain.find(b => b.hash === block.previousHash);
    if (block.index > 0 && !previousBlock) {
      return false;
    }
    
    // Validate merkle root
    const calculatedMerkleRoot = BlockchainUtils.generateMerkleRoot(block.transactions);
    if (block.merkleRoot !== calculatedMerkleRoot) {
      return false;
    }
    
    // Validate hash
    const calculatedHash = this.calculateBlockHash(block);
    if (block.hash !== calculatedHash) {
      return false;
    }
    
    // Check proof of work
    const target = '0'.repeat(block.difficulty);
    if (block.hash.substring(0, block.difficulty) !== target) {
      return false;
    }
    
    return true;
  }

  private calculateBlockHash(block: Block): string {
    const blockString = `${block.index}${block.previousHash}${block.timestamp}${block.merkleRoot}${block.nonce}${block.difficulty}`;
    return BlockchainUtils.generateHash(blockString);
  }

  private calculateTransactionSize(transaction: Transaction): number {
    return JSON.stringify(transaction).length;
  }

  private calculateBlockSize(transactions: Transaction[]): number {
    return transactions.reduce((size, tx) => size + this.calculateTransactionSize(tx), 0);
  }

  private calculateTotalRelevanceScore(transactions: Transaction[]): number {
    return transactions.reduce((total, tx) => total + (tx.relevanceImpact || 0), 0);
  }

  private async calculateStateRoot(): Promise<string> {
    // Calculate state root based on all memory data
    const allData = await this.memoryManager.getAllData();
    const stateString = allData.map(data => `${data.id}:${data.state}:${data.relevanceScore}`).join('|');
    return BlockchainUtils.generateHash(stateString);
  }

  private async calculateMemoryEfficiency(): Promise<number> {
    const stats = await this.memoryManager.getMemoryStats();
    return BlockchainUtils.calculateMemoryEfficiency(
      stats.activeSize,
      stats.totalSize,
      stats.averageRelevance
    );
  }

  private async updateBlockchainState(): Promise<void> {
    const lastBlock = this.getLatestBlock();
    const memoryStats = await this.memoryManager.getMemoryStats();
    
    this.state = {
      height: lastBlock.index,
      totalDifficulty: this.chain.reduce((sum, block) => sum + Math.pow(2, block.difficulty), 0),
      activeMemorySize: memoryStats.activeSize,
      archivedMemorySize: memoryStats.archivedSize,
      deadMemoryPurged: memoryStats.deadPurged,
      averageRelevanceScore: memoryStats.averageRelevance,
      memoryEfficiency: await this.calculateMemoryEfficiency(),
      lastBlockHash: lastBlock.hash,
      chainWork: this.calculateChainWork()
    };
  }

  private calculateChainWork(): string {
    return this.chain.reduce((work, block) => {
      return work + Math.pow(2, block.difficulty);
    }, 0).toString();
  }

  private startMemoryManagement(): void {
    // Run memory management every 5 minutes
    setInterval(async () => {
      try {
        await this.runMemoryManagement();
      } catch (error) {
        this.logger.error('Error in memory management cycle:', error);
      }
    }, 5 * 60 * 1000);
  }

  private async runMemoryManagement(): Promise<void> {
    this.logger.debug('Running memory management cycle...');
    
    // Get all active data and check for archival candidates
    const activeData = await this.memoryManager.getActiveData();
    const archivalCandidates = activeData.filter(data => 
      BlockchainUtils.shouldArchiveData(data, this.RELEVANCE_THRESHOLD)
    );
    
    // Get archived data and check for deletion candidates
    const archivedData = await this.memoryManager.getArchivedData();
    const deletionCandidates = archivedData.filter(data =>
      BlockchainUtils.shouldForgetData(data, this.FORGETTING_THRESHOLD)
    );
    
    this.logger.info(`Memory management: ${archivalCandidates.length} archival candidates, ${deletionCandidates.length} deletion candidates`);
    
    // Create transactions for memory operations
    for (const data of archivalCandidates) {
      await this.createMemoryTransaction(TransactionType.ARCHIVE, data);
    }
    
    for (const data of deletionCandidates) {
      await this.createMemoryTransaction(TransactionType.FORGET, data);
    }
  }

  private async createMemoryTransaction(type: TransactionType, data: MemoryData): Promise<void> {
    const transaction: Transaction = {
      id: `${type}_${data.id}_${Date.now()}`,
      hash: '',
      from: 'system',
      type,
      data,
      gasPrice: 1,
      gasLimit: 100000,
      nonce: Date.now(),
      timestamp: new Date(),
      signature: 'system',
      relevanceImpact: data.relevanceScore
    };
    
    transaction.hash = BlockchainUtils.generateHash(JSON.stringify(transaction));
    await this.addTransaction(transaction);
  }

  // Public getters
  public getChain(): Block[] {
    return [...this.chain];
  }

  public getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  public getBlock(index: number): Block | undefined {
    return this.chain[index];
  }

  public getBlockByHash(hash: string): Block | undefined {
    return this.chain.find(block => block.hash === hash);
  }

  public getPendingTransactions(): Transaction[] {
    return [...this.pendingTransactions];
  }

  public getBlockchainState(): BlockchainState {
    return { ...this.state };
  }

  public async getMemoryData(id: string): Promise<MemoryData | null> {
    return this.memoryManager.getData(id);
  }

  public async getAllMemoryData(): Promise<MemoryData[]> {
    return this.memoryManager.getAllData();
  }

  public isValidChain(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];
      
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
      
      if (!this.validateBlock(currentBlock)) {
        return false;
      }
    }
    return true;
  }
}
