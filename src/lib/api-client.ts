// AmnesiaChain API Client - Real blockchain integration
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { io, Socket } from 'socket.io-client';

// API Response Types
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp?: string;
}

// Blockchain Types (matching backend)
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

export interface Block {
  index: number;
  hash: string;
  previousHash: string;
  timestamp: string;
  transactions: Transaction[];
  nonce: number;
  difficulty: number;
  merkleRoot: string;
  stateRoot: string;
  memoryEfficiencyScore: number;
  totalRelevanceScore: number;
  miner: string;
  size: number;
}

export interface Transaction {
  id: string;
  hash: string;
  from: string;
  to?: string;
  type: 'archive' | 'promote' | 'forget' | 'create' | 'transfer';
  data: any;
  gasPrice: number;
  gasLimit: number;
  gasUsed?: number;
  nonce: number;
  timestamp: string;
  signature: string;
  relevanceImpact?: number;
}

export interface MemoryData {
  id: string;
  hash: string;
  content: string | Buffer;
  size: number;
  state: 'active' | 'archived' | 'dead';
  relevanceScore: number;
  accessCount: number;
  lastAccessed: string;
  createdAt: string;
  owner: string;
  metadata: Record<string, any>;
}

export interface ContractInteractionResult {
  success: boolean;
  transactionHash?: string;
  gasUsed?: number;
  error?: string;
  transactionId?: string;
}

// API Client Class
export class AmnesiaChainApiClient {
  private api: AxiosInstance;
  private socket: Socket | null = null;
  private baseURL: string;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor(baseURL: string = 'http://localhost:3001') {
    this.baseURL = baseURL;
    this.api = axios.create({
      baseURL: `${baseURL}/api`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupAxiosInterceptors();
    this.connectWebSocket();
  }

  private setupAxiosInterceptors(): void {
    this.api.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        if (response.data && !response.data.success) {
          throw new Error(response.data.error || 'API request failed');
        }
        return response;
      },
      (error) => {
        console.error('API Error:', error);
        throw error;
      }
    );
  }

  private connectWebSocket(): void {
    this.socket = io(this.baseURL);

    this.socket.on('connect', () => {
      console.log('Connected to AmnesiaChain WebSocket');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from AmnesiaChain WebSocket');
    });

    // Forward all events to registered listeners
    const events = [
      'blockchain:initialized',
      'blockchain:blockAdded', 
      'blockchain:transactionAdded',
      'memory:dataArchived',
      'memory:dataPromoted',
      'memory:dataForgotten',
      'consensus:difficultyAdjusted',
      'mining:blockMined'
    ];

    events.forEach(event => {
      this.socket?.on(event, (data: any) => {
        this.emitEvent(event, data);
      });
    });
  }

  // Event handling
  public on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)?.push(callback);
  }

  public off(event: string, callback?: Function): void {
    if (!callback) {
      this.eventListeners.delete(event);
    } else {
      const listeners = this.eventListeners.get(event);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    }
  }

  private emitEvent(event: string, data: any): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(callback => callback(data));
  }

  // Health check
  public async healthCheck(): Promise<any> {
    const response = await this.api.get<ApiResponse>('/health');
    return response.data.data;
  }

  // Blockchain operations
  public async getBlockchainState(): Promise<BlockchainState> {
    const response = await this.api.get<ApiResponse<BlockchainState>>('/blockchain/state');
    return response.data.data!;
  }

  public async getBlockchainStats(): Promise<any> {
    const response = await this.api.get<ApiResponse>('/blockchain/stats');
    return response.data.data;
  }

  // Block operations
  public async getBlocks(limit: number = 50, offset: number = 0): Promise<Block[]> {
    const response = await this.api.get<ApiResponse<{blocks: Block[]}>>('/blocks', {
      params: { limit, offset }
    });
    return response.data.data!.blocks;
  }

  public async getLatestBlocks(count: number = 10): Promise<Block[]> {
    const response = await this.api.get<ApiResponse<Block[]>>('/blocks/latest', {
      params: { count }
    });
    return response.data.data!;
  }

  public async getBlock(identifier: string | number): Promise<Block> {
    const response = await this.api.get<ApiResponse<Block>>(`/blocks/${identifier}`);
    return response.data.data!;
  }

  public async mineBlock(minerAddress?: string): Promise<{block: Block; miningTime: number}> {
    const response = await this.api.post<ApiResponse>('/blocks/mine', {
      minerAddress
    });
    return response.data.data!;
  }

  // Transaction operations
  public async getTransactions(params: {
    limit?: number;
    offset?: number;
    type?: string;
  } = {}): Promise<Transaction[]> {
    const response = await this.api.get<ApiResponse<{transactions: Transaction[]}>>('/transactions', {
      params
    });
    return response.data.data!.transactions;
  }

  public async getTransaction(id: string): Promise<Transaction> {
    const response = await this.api.get<ApiResponse<Transaction>>(`/transactions/${id}`);
    return response.data.data!;
  }

  public async createTransaction(transaction: {
    from: string;
    to?: string;
    type: string;
    data?: any;
    gasPrice?: number;
    gasLimit?: number;
  }): Promise<Transaction> {
    const response = await this.api.post<ApiResponse<Transaction>>('/transactions', transaction);
    return response.data.data!;
  }

  public async getPendingTransactions(): Promise<Transaction[]> {
    const response = await this.api.get<ApiResponse<Transaction[]>>('/transactions/pending');
    return response.data.data!;
  }

  public async getTransactionsByAddress(address: string, limit: number = 50): Promise<Transaction[]> {
    const response = await this.api.get<ApiResponse<Transaction[]>>(`/transactions/address/${address}`, {
      params: { limit }
    });
    return response.data.data!;
  }

  // Memory data operations
  public async getMemoryData(params: {
    state?: string;
    owner?: string;
    limit?: number;
  } = {}): Promise<MemoryData[]> {
    const response = await this.api.get<ApiResponse<MemoryData[]>>('/memory', {
      params
    });
    return response.data.data!;
  }

  public async getMemoryStats(): Promise<any> {
    const response = await this.api.get<ApiResponse>('/memory/stats');
    return response.data.data;
  }

  public async searchMemoryData(query: {
    state?: string;
    owner?: string;
    minRelevance?: number;
    maxAge?: number;
    contentHash?: string;
  }): Promise<MemoryData[]> {
    const response = await this.api.get<ApiResponse<MemoryData[]>>('/memory/search', {
      params: query
    });
    return response.data.data!;
  }

  public async getMemoryDataById(id: string): Promise<MemoryData> {
    const response = await this.api.get<ApiResponse<MemoryData>>(`/memory/${id}`);
    return response.data.data!;
  }

  public async storeMemoryData(data: {
    content: string;
    owner: string;
    metadata?: Record<string, any>;
  }): Promise<MemoryData> {
    const response = await this.api.post<ApiResponse<MemoryData>>('/memory', data);
    return response.data.data!;
  }

  // Memory lifecycle operations (these create transactions)
  public async archiveDataOnChain(
    userWallet: string,
    dataId: string,
    dataHash: string,
    sizeBytes: number
  ): Promise<ContractInteractionResult> {
    try {
      const response = await this.api.put<ApiResponse>(`/memory/${dataId}/archive`);
      return {
        success: true,
        transactionId: response.data.data?.transactionId,
        transactionHash: response.data.data?.transactionId
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to archive data'
      };
    }
  }

  public async promoteDataOnChain(
    userWallet: string,
    dataId: string,
    dataHash: string
  ): Promise<ContractInteractionResult> {
    try {
      const response = await this.api.put<ApiResponse>(`/memory/${dataId}/promote`);
      return {
        success: true,
        transactionId: response.data.data?.transactionId,
        transactionHash: response.data.data?.transactionId
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to promote data'
      };
    }
  }

  public async forgetDataOnChain(
    userWallet: string,
    dataId: string,
    dataHash: string,
    reason: string
  ): Promise<ContractInteractionResult> {
    try {
      const response = await this.api.delete<ApiResponse>(`/memory/${dataId}`, {
        data: { reason }
      });
      return {
        success: true,
        transactionId: response.data.data?.transactionId,
        transactionHash: response.data.data?.transactionId
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to forget data'
      };
    }
  }

  // Address operations
  public async getAddressInfo(address: string): Promise<any> {
    const response = await this.api.get<ApiResponse>(`/address/${address}`);
    return response.data.data;
  }

  public async getAddressMemoryData(address: string, params: {
    state?: string;
    limit?: number;
  } = {}): Promise<MemoryData[]> {
    const response = await this.api.get<ApiResponse<MemoryData[]>>(`/address/${address}/memory`, {
      params
    });
    return response.data.data!;
  }

  // Analytics
  public async getMemoryTrends(window: number = 50): Promise<any> {
    const response = await this.api.get<ApiResponse>('/analytics/memory-trends', {
      params: { window }
    });
    return response.data.data;
  }

  public async getPerformanceMetrics(): Promise<any> {
    const response = await this.api.get<ApiResponse>('/analytics/performance');
    return response.data.data;
  }

  public async getConsensusStats(): Promise<any> {
    const response = await this.api.get<ApiResponse>('/consensus/stats');
    return response.data.data;
  }

  public async getNetworkHashRate(): Promise<any> {
    const response = await this.api.get<ApiResponse>('/network/hashrate');
    return response.data.data;
  }

  // Admin operations
  public async resetBlockchain(): Promise<any> {
    const response = await this.api.post<ApiResponse>('/admin/reset');
    return response.data.data;
  }

  // Cleanup
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.eventListeners.clear();
  }
}

// Create singleton instance
export const apiClient = new AmnesiaChainApiClient();
