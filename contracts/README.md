# AmnesiaChain Smart Contracts

This directory contains the Solidity smart contracts for the AmnesiaChain blockchain system.

## Contracts Overview

### 1. AmnesiaChain.sol
The main blockchain contract that manages:
- Block creation and validation
- Memory state management (ACTIVE, ARCHIVED, DEAD)
- Validator registration and staking
- Memory decay mechanisms
- Chain integrity verification

**Key Features:**
- Cognitive weight-based memory management
- Time-based memory decay
- Automatic archiving of low-weight memories
- Validator staking with minimum 1 ETH requirement

### 2. MemoryBlock.sol
Manages individual memory blocks with cognitive properties:
- Content hashing and deduplication
- Access count tracking
- Importance and recency scoring
- Cognitive score calculation
- Time-based decay mechanisms

**Cognitive Score Formula:**
```
Score = (importanceScore × 40%) + (recencyScore × 30%) + (accessFrequency × 30%)
```

### 3. CognitiveConsensus.sol
Implements the unique cognitive consensus mechanism:
- Validator reputation system
- Weighted voting based on reputation and stake
- Proposal-based block validation
- Dynamic reputation updates
- Reputation-gated proposal creation

**Consensus Features:**
- Voting power = (reputation × stake) / 1 ETH
- Minimum reputation threshold: 50
- Voting period: 1 hour
- Reputation range: 0-100

### 4. MemoryToken.sol
ERC20-compatible token for the AmnesiaChain ecosystem:
- AMT (AmnesiaChain Memory Token)
- Max supply: 1 billion tokens
- Validator rewards
- Memory preservation incentives
- Staking and governance

**Reward Structure:**
- Block creation: 10 AMT
- Successful validation: 5 AMT
- Memory preservation: Based on cognitive weight

## Deployment Order

1. Deploy `MemoryBlock.sol`
2. Deploy `CognitiveConsensus.sol`
3. Deploy `AmnesiaChain.sol` with addresses from steps 1 & 2
4. Deploy `MemoryToken.sol`
5. Call `setAmnesiaChainContract()` on MemoryToken

## Contract Addresses (To be filled after deployment)

- **MemoryBlock**: `0x...`
- **CognitiveConsensus**: `0x...`
- **AmnesiaChain**: `0x...`
- **MemoryToken**: `0x...`

## Usage Examples

### Becoming a Validator
```solidity
// Register with minimum 1 ETH stake
amnesiaChain.registerValidator{value: 1 ether}();
```

### Creating a Memory Block
```solidity
// Create block with cognitive weight of 500 (range: 0-1000)
uint256 blockIndex = amnesiaChain.createBlock("Memory data", 500);
```

### Voting on Proposals
```solidity
// Create proposal
uint256 proposalId = consensus.createProposal(blockIndex, blockHash, cognitiveWeight);

// Vote (weighted by reputation and stake)
consensus.vote(proposalId, true); // Vote in favor
```

### Accessing Memory
```solidity
// Access increases cognitive weight
amnesiaChain.accessBlock(blockIndex);
```

## Memory State Transitions

```
ACTIVE (cognitive weight > 100)
  ↓ (decay or manual archiving)
ARCHIVED (cognitive weight 0-100)
  ↓ (manual marking)
DEAD (cognitive weight = 0)
```

## Security Considerations

1. **Validator Staking**: Minimum 1 ETH required to prevent spam
2. **Reputation System**: Prevents malicious validators from gaining influence
3. **Voting Period**: 1-hour window prevents rushed decisions
4. **Memory Decay**: Automatic cleanup of unused data
5. **Access Control**: Role-based permissions for critical functions

## Testing

Deploy to a testnet (Sepolia, Goerli) before mainnet:

```bash
# Using Hardhat
npx hardhat run scripts/deploy.js --network sepolia

# Using Foundry
forge create --rpc-url $RPC_URL --private-key $PRIVATE_KEY AmnesiaChain
```

## Gas Optimization

- Use batch operations when possible
- Memory decay should be run periodically, not continuously
- Consider L2 solutions for high-frequency operations

## Integration with Backend

The blockchain backend (`blockchain-backend/src/`) provides Node.js interfaces to interact with these contracts. See the backend README for integration details.

## License

MIT License - See LICENSE file for details
