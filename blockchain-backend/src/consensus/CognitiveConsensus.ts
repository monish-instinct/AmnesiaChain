import { EventEmitter } from 'events';
import { Block, CognitiveConsensusData, ConsensusType } from '../blockchain/types';
import { Logger } from '../utils/Logger';

export interface ConsensusConfig {
  type: ConsensusType;
  targetBlockTime: number;
  difficultyAdjustmentInterval: number;
  maxDifficultyAdjustment: number;
  minDifficulty: number;
  maxDifficulty: number;
  memoryWeighting: number; // How much memory efficiency affects mining difficulty
  relevanceThreshold: number;
}

export interface DifficultyAdjustment {
  oldDifficulty: number;
  newDifficulty: number;
  memoryEfficiencyBonus: number;
  reason: string;
}

export class CognitiveConsensus extends EventEmitter {
  private logger: Logger;
  private config: ConsensusConfig;
  private consensusData: CognitiveConsensusData;

  constructor(logger: Logger, config?: Partial<ConsensusConfig>) {
    super();
    this.logger = logger;
    
    // Default configuration
    this.config = {
      type: ConsensusType.COGNITIVE_POW,
      targetBlockTime: 60000, // 1 minute
      difficultyAdjustmentInterval: 10, // Every 10 blocks
      maxDifficultyAdjustment: 4, // Max 4x difficulty change
      minDifficulty: 1,
      maxDifficulty: 20,
      memoryWeighting: 0.3, // 30% influence on difficulty
      relevanceThreshold: 30,
      ...config
    };

    this.consensusData = {
      relevanceThreshold: this.config.relevanceThreshold,
      memoryPressure: 0,
      archivalRate: 0,
      forgettingRate: 0,
      networkEfficiency: 100
    };
  }

  public async calculateDifficulty(chain: Block[]): Promise<number> {
    if (chain.length === 0) {
      return this.config.minDifficulty;
    }

    const latestBlock = chain[chain.length - 1];
    
    // If not enough blocks for adjustment, use current difficulty
    if (chain.length < this.config.difficultyAdjustmentInterval) {
      return latestBlock.difficulty;
    }

    // Get the adjustment interval blocks
    const adjustmentBlocks = chain.slice(-this.config.difficultyAdjustmentInterval);
    const oldestBlock = adjustmentBlocks[0];
    const newestBlock = adjustmentBlocks[adjustmentBlocks.length - 1];

    // Calculate actual time taken
    const actualTime = newestBlock.timestamp.getTime() - oldestBlock.timestamp.getTime();
    const expectedTime = this.config.targetBlockTime * (this.config.difficultyAdjustmentInterval - 1);

    // Basic difficulty adjustment based on time
    const timeRatio = actualTime / expectedTime;
    let newDifficulty = latestBlock.difficulty / timeRatio;

    // Apply cognitive factors
    const cognitiveAdjustment = this.calculateCognitiveDifficultyAdjustment(adjustmentBlocks);
    newDifficulty *= cognitiveAdjustment.multiplier;

    // Clamp difficulty to allowed range
    newDifficulty = Math.max(this.config.minDifficulty, Math.min(this.config.maxDifficulty, newDifficulty));
    
    // Limit maximum adjustment per interval
    const maxChange = latestBlock.difficulty * this.config.maxDifficultyAdjustment;
    const minChange = latestBlock.difficulty / this.config.maxDifficultyAdjustment;
    newDifficulty = Math.max(minChange, Math.min(maxChange, newDifficulty));

    // Round to reasonable precision
    newDifficulty = Math.round(newDifficulty);

    if (newDifficulty !== latestBlock.difficulty) {
      const adjustment: DifficultyAdjustment = {
        oldDifficulty: latestBlock.difficulty,
        newDifficulty,
        memoryEfficiencyBonus: cognitiveAdjustment.bonus,
        reason: cognitiveAdjustment.reason
      };

      this.logger.consensusEvent('DIFFICULTY_ADJUSTED', adjustment);
      this.emit('difficultyAdjusted', newDifficulty);
    }

    return newDifficulty;
  }

  private calculateCognitiveDifficultyAdjustment(blocks: Block[]): {
    multiplier: number;
    bonus: number;
    reason: string;
  } {
    // Calculate average memory efficiency over the adjustment period
    const avgMemoryEfficiency = blocks.reduce((sum, block) => sum + block.memoryEfficiencyScore, 0) / blocks.length;
    const avgRelevanceScore = blocks.reduce((sum, block) => sum + block.totalRelevanceScore, 0) / blocks.length;

    let multiplier = 1.0;
    let bonus = 0;
    let reason = 'Standard difficulty adjustment';

    // High memory efficiency should reduce difficulty (encourage efficient mining)
    if (avgMemoryEfficiency > 80) {
      const efficiencyBonus = (avgMemoryEfficiency - 80) / 20; // 0 to 1 scale
      multiplier *= (1 - this.config.memoryWeighting * efficiencyBonus * 0.5);
      bonus = efficiencyBonus;
      reason = `High memory efficiency (${avgMemoryEfficiency.toFixed(1)}%) reduces difficulty`;
    }

    // Low memory efficiency should increase difficulty (discourage wasteful mining)
    if (avgMemoryEfficiency < 50) {
      const inefficiencyPenalty = (50 - avgMemoryEfficiency) / 50; // 0 to 1 scale
      multiplier *= (1 + this.config.memoryWeighting * inefficiencyPenalty);
      reason = `Low memory efficiency (${avgMemoryEfficiency.toFixed(1)}%) increases difficulty`;
    }

    // High average relevance scores should be rewarded
    if (avgRelevanceScore > 70) {
      const relevanceBonus = (avgRelevanceScore - 70) / 30; // 0 to 1 scale
      multiplier *= (1 - 0.1 * relevanceBonus); // Small bonus for high relevance
      reason += ` | High relevance scores (${avgRelevanceScore.toFixed(1)}) bonus`;
    }

    // Memory pressure affects difficulty
    if (this.consensusData.memoryPressure > 0.8) {
      multiplier *= 1.2; // Increase difficulty when memory is under pressure
      reason += ' | Memory pressure increases difficulty';
    }

    return { multiplier, bonus, reason };
  }

  public updateConsensusData(data: Partial<CognitiveConsensusData>): void {
    this.consensusData = { ...this.consensusData, ...data };
    this.emit('consensusDataUpdated', this.consensusData);
  }

  public getConsensusData(): CognitiveConsensusData {
    return { ...this.consensusData };
  }

  public validateBlock(block: Block, previousBlock: Block): {
    valid: boolean;
    reason?: string;
  } {
    // Basic validation
    if (block.previousHash !== previousBlock.hash) {
      return { valid: false, reason: 'Invalid previous hash' };
    }

    if (block.index !== previousBlock.index + 1) {
      return { valid: false, reason: 'Invalid block index' };
    }

    // Difficulty validation
    const expectedDifficulty = this.calculateExpectedDifficulty(previousBlock);
    if (Math.abs(block.difficulty - expectedDifficulty) > 1) {
      return { valid: false, reason: 'Invalid difficulty' };
    }

    // Memory efficiency validation
    if (block.memoryEfficiencyScore < 0 || block.memoryEfficiencyScore > 100) {
      return { valid: false, reason: 'Invalid memory efficiency score' };
    }

    // Cognitive consensus validation
    if (!this.validateCognitiveConsensus(block)) {
      return { valid: false, reason: 'Failed cognitive consensus validation' };
    }

    return { valid: true };
  }

  private calculateExpectedDifficulty(previousBlock: Block): number {
    // This is a simplified version - in reality, we'd need more chain context
    return previousBlock.difficulty;
  }

  private validateCognitiveConsensus(block: Block): boolean {
    // Validate that transactions in the block follow cognitive principles
    
    // Check memory efficiency score is reasonable
    if (block.memoryEfficiencyScore > 100 || block.memoryEfficiencyScore < 0) {
      return false;
    }

    // Validate relevance scores in transactions
    for (const tx of block.transactions) {
      if (tx.relevanceImpact && (tx.relevanceImpact > 100 || tx.relevanceImpact < 0)) {
        return false;
      }
    }

    return true;
  }

  public calculateBlockReward(block: Block): number {
    // Base reward
    let reward = 50;

    // Memory efficiency bonus
    const efficiencyBonus = (block.memoryEfficiencyScore / 100) * 10;
    reward += efficiencyBonus;

    // Relevance score bonus
    const avgRelevance = block.totalRelevanceScore / Math.max(1, block.transactions.length);
    const relevanceBonus = (avgRelevance / 100) * 5;
    reward += relevanceBonus;

    // Difficulty adjustment
    reward *= Math.log2(block.difficulty + 1);

    return Math.round(reward * 100) / 100; // Round to 2 decimal places
  }

  public shouldReorganize(currentChain: Block[], newChain: Block[]): boolean {
    if (newChain.length <= currentChain.length) {
      return false;
    }

    // Calculate chain work (considering cognitive factors)
    const currentWork = this.calculateChainWork(currentChain);
    const newWork = this.calculateChainWork(newChain);

    return newWork > currentWork;
  }

  private calculateChainWork(chain: Block[]): number {
    return chain.reduce((work, block) => {
      let blockWork = Math.pow(2, block.difficulty);
      
      // Add cognitive work bonus
      const cognitiveBonus = (block.memoryEfficiencyScore / 100) * 0.1;
      blockWork *= (1 + cognitiveBonus);
      
      return work + blockWork;
    }, 0);
  }

  public getNetworkHashRate(chain: Block[], windowSize: number = 100): number {
    if (chain.length < 2) {
      return 0;
    }

    const recentBlocks = chain.slice(-Math.min(windowSize, chain.length));
    const oldestBlock = recentBlocks[0];
    const newestBlock = recentBlocks[recentBlocks.length - 1];

    const timeDiff = (newestBlock.timestamp.getTime() - oldestBlock.timestamp.getTime()) / 1000; // seconds
    const blocksDiff = recentBlocks.length - 1;

    if (timeDiff === 0) {
      return 0;
    }

    // Average difficulty over the window
    const avgDifficulty = recentBlocks.reduce((sum, block) => sum + block.difficulty, 0) / recentBlocks.length;
    
    // Estimated hashes per second
    const hashesPerSecond = (Math.pow(2, avgDifficulty) * blocksDiff) / timeDiff;
    
    return hashesPerSecond;
  }

  public analyzeMemoryTrends(chain: Block[], windowSize: number = 50): {
    efficiencyTrend: number;
    relevanceTrend: number;
    memoryPressure: number;
    recommendation: string;
  } {
    if (chain.length < windowSize) {
      return {
        efficiencyTrend: 0,
        relevanceTrend: 0,
        memoryPressure: 0,
        recommendation: 'Insufficient data for analysis'
      };
    }

    const recentBlocks = chain.slice(-windowSize);
    const firstHalf = recentBlocks.slice(0, windowSize / 2);
    const secondHalf = recentBlocks.slice(windowSize / 2);

    // Calculate trends
    const firstHalfEfficiency = firstHalf.reduce((sum, b) => sum + b.memoryEfficiencyScore, 0) / firstHalf.length;
    const secondHalfEfficiency = secondHalf.reduce((sum, b) => sum + b.memoryEfficiencyScore, 0) / secondHalf.length;
    const efficiencyTrend = secondHalfEfficiency - firstHalfEfficiency;

    const firstHalfRelevance = firstHalf.reduce((sum, b) => sum + b.totalRelevanceScore, 0) / firstHalf.length;
    const secondHalfRelevance = secondHalf.reduce((sum, b) => sum + b.totalRelevanceScore, 0) / secondHalf.length;
    const relevanceTrend = secondHalfRelevance - firstHalfRelevance;

    // Calculate memory pressure (inverse of efficiency)
    const currentEfficiency = recentBlocks[recentBlocks.length - 1].memoryEfficiencyScore;
    const memoryPressure = (100 - currentEfficiency) / 100;

    // Generate recommendation
    let recommendation = '';
    if (efficiencyTrend < -10) {
      recommendation = 'Memory efficiency declining - consider increasing archival rate';
    } else if (efficiencyTrend > 10) {
      recommendation = 'Memory efficiency improving - current strategy is effective';
    } else if (memoryPressure > 0.7) {
      recommendation = 'High memory pressure - immediate archival recommended';
    } else if (relevanceTrend < -20) {
      recommendation = 'Data relevance declining - review retention policies';
    } else {
      recommendation = 'Memory management is stable';
    }

    return {
      efficiencyTrend,
      relevanceTrend,
      memoryPressure,
      recommendation
    };
  }

  // Configuration methods
  public updateConfig(newConfig: Partial<ConsensusConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.logger.info('Consensus configuration updated', newConfig);
    this.emit('configUpdated', this.config);
  }

  public getConfig(): ConsensusConfig {
    return { ...this.config };
  }

  // Statistics
  public getConsensusStats(chain: Block[]): {
    averageDifficulty: number;
    averageBlockTime: number;
    averageMemoryEfficiency: number;
    averageRelevanceScore: number;
    hashRate: number;
    lastAdjustment: Date | null;
  } {
    if (chain.length === 0) {
      return {
        averageDifficulty: 0,
        averageBlockTime: 0,
        averageMemoryEfficiency: 0,
        averageRelevanceScore: 0,
        hashRate: 0,
        lastAdjustment: null
      };
    }

    const recentBlocks = chain.slice(-50); // Last 50 blocks
    
    const averageDifficulty = recentBlocks.reduce((sum, block) => sum + block.difficulty, 0) / recentBlocks.length;
    const averageMemoryEfficiency = recentBlocks.reduce((sum, block) => sum + block.memoryEfficiencyScore, 0) / recentBlocks.length;
    const averageRelevanceScore = recentBlocks.reduce((sum, block) => sum + block.totalRelevanceScore, 0) / recentBlocks.length;

    let averageBlockTime = 0;
    if (recentBlocks.length > 1) {
      const totalTime = recentBlocks[recentBlocks.length - 1].timestamp.getTime() - recentBlocks[0].timestamp.getTime();
      averageBlockTime = totalTime / (recentBlocks.length - 1);
    }

    const hashRate = this.getNetworkHashRate(chain);
    const lastAdjustment = chain.length >= this.config.difficultyAdjustmentInterval ? 
      chain[chain.length - 1].timestamp : null;

    return {
      averageDifficulty,
      averageBlockTime,
      averageMemoryEfficiency,
      averageRelevanceScore,
      hashRate,
      lastAdjustment
    };
  }
}
