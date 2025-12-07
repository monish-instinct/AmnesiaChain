import { createHash } from 'crypto';

// Data lifecycle states in AmnesiaChain
export enum DataLifecycleState {
  ACTIVE = 'active',
  ARCHIVED = 'archived', 
  DEAD = 'dead'
}

// Transaction types for memory management
export enum TransactionType {
  ARCHIVE = 'archive',
  PROMOTE = 'promote', 
  FORGET = 'forget',
  CREATE = 'create',
  TRANSFER = 'transfer'
}

// Consensus mechanism types
export enum ConsensusType {
  COGNITIVE_POW = 'cognitive_pow', // Proof of Work with relevance scoring
  RELEVANCE_POS = 'relevance_pos'  // Proof of Stake with memory efficiency
}

// Core interfaces for AmnesiaChain
export interface MemoryData {
  id: string;
  hash: string;
  content: Buffer | string;
  size: number;
  state: DataLifecycleState;
  relevanceScore: number;
  accessCount: number;
  lastAccessed: Date;
  createdAt: Date;
  owner: string;
  metadata: Record<string, any>;
}

export interface Transaction {
  id: string;
  hash: string;
  from: string;
  to?: string;
  type: TransactionType;
  data: MemoryData | any;
  gasPrice: number;
  gasLimit: number;
  gasUsed?: number;
  nonce: number;
  timestamp: Date;
  signature: string;
  relevanceImpact?: number; // How this transaction affects memory relevance
}

export interface Block {
  index: number;
  hash: string;
  previousHash: string;
  timestamp: Date;
  transactions: Transaction[];
  nonce: number;
  difficulty: number;
  merkleRoot: string;
  stateRoot: string;
  memoryEfficiencyScore: number; // Unique to AmnesiaChain
  totalRelevanceScore: number;   // Sum of all data relevance in block
  miner: string;
  size: number;
}

export interface BlockchainState {
  height: number;
  totalDifficulty: number;
  activeMemorySize: number;
  archivedMemorySize: number;
  deadMemoryPurged: number;
  averageRelevanceScore: number;
  memoryEfficiency: number;
  lastBlockHash: string;
  chainWork: string;
}

export interface CognitiveConsensusData {
  relevanceThreshold: number;
  memoryPressure: number; // How full the active memory is
  archivalRate: number;   // Rate of data being archived
  forgettingRate: number; // Rate of data being deleted
  networkEfficiency: number;
}

export interface Peer {
  id: string;
  host: string;
  port: number;
  version: string;
  lastSeen: Date;
  isConnected: boolean;
  reputation: number;
  memoryEfficiency?: number;
}

export interface MiningJob {
  blockTemplate: Partial<Block>;
  difficulty: number;
  target: string;
  relevanceBonus: number; // Bonus for including high-relevance transactions
}

export interface WalletKeyPair {
  privateKey: string;
  publicKey: string;
  address: string;
}

// Utility functions for blockchain operations
export class BlockchainUtils {
  static generateHash(data: string): string {
    return createHash('sha256').update(data).digest('hex');
  }

  static generateMerkleRoot(transactions: Transaction[]): string {
    if (transactions.length === 0) return '0'.repeat(64);
    
    let hashes = transactions.map(tx => tx.hash);
    
    while (hashes.length > 1) {
      const newHashes: string[] = [];
      for (let i = 0; i < hashes.length; i += 2) {
        const left = hashes[i];
        const right = hashes[i + 1] || left;
        const combined = this.generateHash(left + right);
        newHashes.push(combined);
      }
      hashes = newHashes;
    }
    
    return hashes[0];
  }

  static calculateRelevanceScore(data: MemoryData): number {
    const now = Date.now();
    const age = now - data.createdAt.getTime();
    const lastAccessAge = now - data.lastAccessed.getTime();
    
    // Base score from access patterns
    let score = Math.log(data.accessCount + 1) / Math.log(2);
    
    // Decay based on age (older = less relevant)
    const ageDecay = Math.exp(-age / (1000 * 60 * 60 * 24 * 30)); // 30 day half-life
    
    // Decay based on last access (recently accessed = more relevant)
    const accessDecay = Math.exp(-lastAccessAge / (1000 * 60 * 60 * 24 * 7)); // 7 day half-life
    
    score *= (ageDecay * 0.3 + accessDecay * 0.7);
    
    // Normalize to 0-100 range
    return Math.min(100, Math.max(0, score * 10));
  }

  static shouldArchiveData(data: MemoryData, threshold: number = 30): boolean {
    return data.relevanceScore < threshold && data.state === DataLifecycleState.ACTIVE;
  }

  static shouldForgetData(data: MemoryData, threshold: number = 10, maxAge: number = 90): boolean {
    const age = Date.now() - data.createdAt.getTime();
    const ageInDays = age / (1000 * 60 * 60 * 24);
    
    return (data.relevanceScore < threshold || ageInDays > maxAge) && 
           data.state === DataLifecycleState.ARCHIVED;
  }

  static calculateMemoryEfficiency(activeSize: number, totalSize: number, relevanceScore: number): number {
    if (totalSize === 0) return 100;
    
    const sizeEfficiency = 1 - (activeSize / totalSize);
    const relevanceEfficiency = relevanceScore / 100;
    
    return (sizeEfficiency * 0.6 + relevanceEfficiency * 0.4) * 100;
  }

  static isValidAddress(address: string): boolean {
    return /^[a-fA-F0-9]{40}$/.test(address);
  }

  static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export default {
  DataLifecycleState,
  TransactionType,
  ConsensusType,
  BlockchainUtils
};
