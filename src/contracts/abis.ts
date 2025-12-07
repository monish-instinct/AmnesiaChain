// Smart Contract ABIs for AmnesiaChain

export const MEMORY_BLOCK_ABI = [
  {
    "inputs": [
      {"name": "_contentHash", "type": "bytes32"},
      {"name": "_importanceScore", "type": "uint256"}
    ],
    "name": "createMemory",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "_memoryId", "type": "uint256"}],
    "name": "accessMemory",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "_memoryId", "type": "uint256"}],
    "name": "calculateCognitiveScore",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "_memoryId", "type": "uint256"}],
    "name": "applyDecay",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "_memoryId", "type": "uint256"}],
    "name": "deleteMemory",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "_memoryId", "type": "uint256"}],
    "name": "getMemory",
    "outputs": [{
      "components": [
        {"name": "contentHash", "type": "bytes32"},
        {"name": "timestamp", "type": "uint256"},
        {"name": "accessCount", "type": "uint256"},
        {"name": "lastAccessTime", "type": "uint256"},
        {"name": "importanceScore", "type": "uint256"},
        {"name": "recencyScore", "type": "uint256"},
        {"name": "creator", "type": "address"},
        {"name": "isDeleted", "type": "bool"}
      ],
      "name": "",
      "type": "tuple"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "id", "type": "uint256"},
      {"indexed": false, "name": "contentHash", "type": "bytes32"},
      {"indexed": true, "name": "creator", "type": "address"}
    ],
    "name": "MemoryCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "id", "type": "uint256"},
      {"indexed": false, "name": "accessCount", "type": "uint256"}
    ],
    "name": "MemoryAccessed",
    "type": "event"
  }
] as const;

export const AMNESIA_CHAIN_ABI = [
  {
    "inputs": [
      {"name": "_data", "type": "string"},
      {"name": "_cognitiveWeight", "type": "uint256"}
    ],
    "name": "createBlock",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "_index", "type": "uint256"}],
    "name": "accessBlock",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "_index", "type": "uint256"}],
    "name": "archiveBlock",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "_index", "type": "uint256"}],
    "name": "markBlockDead",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "verifyChain",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getActiveMemoryWeight",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "_state", "type": "uint8"}],
    "name": "getBlocksByState",
    "outputs": [{"name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "index", "type": "uint256"},
      {"indexed": false, "name": "hash", "type": "bytes32"},
      {"indexed": true, "name": "creator", "type": "address"}
    ],
    "name": "BlockCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "index", "type": "uint256"},
      {"indexed": false, "name": "newState", "type": "uint8"}
    ],
    "name": "BlockStateChanged",
    "type": "event"
  }
] as const;

export const MEMORY_TOKEN_ABI = [
  {
    "inputs": [],
    "name": "name",
    "outputs": [{"name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{"name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "_to", "type": "address"},
      {"name": "_value", "type": "uint256"}
    ],
    "name": "transfer",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "_validator", "type": "address"}
    ],
    "name": "rewardBlockCreation",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "_user", "type": "address"},
      {"name": "_cognitiveWeight", "type": "uint256"}
    ],
    "name": "rewardMemoryPreservation",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export const COGNITIVE_CONSENSUS_ABI = [
  {
    "inputs": [],
    "name": "registerValidator",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "_blockHash", "type": "bytes32"},
      {"name": "_cognitiveWeight", "type": "uint256"}
    ],
    "name": "createProposal",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "_proposalId", "type": "uint256"},
      {"name": "_support", "type": "bool"}
    ],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "_proposalId", "type": "uint256"}],
    "name": "executeProposal",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "_validator", "type": "address"}],
    "name": "getVotingPower",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getActiveValidators",
    "outputs": [{"name": "", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Mock contract addresses (for demo purposes)
export const CONTRACT_ADDRESSES = {
  MEMORY_BLOCK: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
  AMNESIA_CHAIN: '0x1234567890123456789012345678901234567890',
  MEMORY_TOKEN: '0xAbCdEf1234567890AbCdEf1234567890AbCdEf12',
  COGNITIVE_CONSENSUS: '0x9876543210987654321098765432109876543210',
} as const;
