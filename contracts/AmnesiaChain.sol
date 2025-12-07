// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./MemoryBlock.sol";
import "./CognitiveConsensus.sol";

/**
 * @title AmnesiaChain
 * @dev Main contract for the AmnesiaChain blockchain with cognitive memory management
 */
contract AmnesiaChain {
    
    // State variables
    address public owner;
    MemoryBlock public memoryBlockContract;
    CognitiveConsensus public consensusContract;
    
    uint256 public blockCount;
    uint256 public totalMemoryWeight;
    
    enum MemoryState { ACTIVE, ARCHIVED, DEAD }
    
    struct Block {
        uint256 index;
        uint256 timestamp;
        bytes32 previousHash;
        bytes32 hash;
        string data;
        uint256 nonce;
        uint256 cognitiveWeight;
        MemoryState state;
        address validator;
    }
    
    // Mappings
    mapping(uint256 => Block) public blocks;
    mapping(bytes32 => bool) public hashExists;
    mapping(address => uint256) public validatorStakes;
    mapping(uint256 => uint256) public blockAccessCount;
    
    // Events
    event BlockCreated(uint256 indexed index, bytes32 hash, address indexed validator);
    event BlockStateChanged(uint256 indexed index, MemoryState oldState, MemoryState newState);
    event ValidatorRegistered(address indexed validator, uint256 stake);
    event MemoryDecayed(uint256 indexed blockIndex, uint256 newWeight);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }
    
    modifier onlyValidator() {
        require(validatorStakes[msg.sender] > 0, "Only validators can call this");
        _;
    }
    
    constructor(address _memoryBlockContract, address _consensusContract) {
        owner = msg.sender;
        memoryBlockContract = MemoryBlock(_memoryBlockContract);
        consensusContract = CognitiveConsensus(_consensusContract);
        
        // Create genesis block
        createGenesisBlock();
    }
    
    /**
     * @dev Creates the genesis block
     */
    function createGenesisBlock() private {
        Block memory genesis = Block({
            index: 0,
            timestamp: block.timestamp,
            previousHash: bytes32(0),
            hash: keccak256(abi.encodePacked(uint256(0), block.timestamp, bytes32(0), "Genesis Block", uint256(0))),
            data: "Genesis Block",
            nonce: 0,
            cognitiveWeight: 1000,
            state: MemoryState.ACTIVE,
            validator: msg.sender
        });
        
        blocks[0] = genesis;
        hashExists[genesis.hash] = true;
        blockCount = 1;
        totalMemoryWeight = 1000;
        
        emit BlockCreated(0, genesis.hash, msg.sender);
    }
    
    /**
     * @dev Register as a validator
     */
    function registerValidator() external payable {
        require(msg.value >= 1 ether, "Minimum stake is 1 ETH");
        require(validatorStakes[msg.sender] == 0, "Already registered");
        
        validatorStakes[msg.sender] = msg.value;
        emit ValidatorRegistered(msg.sender, msg.value);
    }
    
    /**
     * @dev Create a new memory block
     */
    function createBlock(string memory _data, uint256 _cognitiveWeight) external onlyValidator returns (uint256) {
        require(_cognitiveWeight > 0 && _cognitiveWeight <= 1000, "Invalid cognitive weight");
        
        Block memory lastBlock = blocks[blockCount - 1];
        
        uint256 nonce = 0;
        bytes32 hash = calculateHash(blockCount, block.timestamp, lastBlock.hash, _data, nonce);
        
        // Simple proof of work - find hash with leading zeros
        while (uint256(hash) % 1000 != 0) {
            nonce++;
            hash = calculateHash(blockCount, block.timestamp, lastBlock.hash, _data, nonce);
        }
        
        Block memory newBlock = Block({
            index: blockCount,
            timestamp: block.timestamp,
            previousHash: lastBlock.hash,
            hash: hash,
            data: _data,
            nonce: nonce,
            cognitiveWeight: _cognitiveWeight,
            state: MemoryState.ACTIVE,
            validator: msg.sender
        });
        
        blocks[blockCount] = newBlock;
        hashExists[hash] = true;
        totalMemoryWeight += _cognitiveWeight;
        
        emit BlockCreated(blockCount, hash, msg.sender);
        
        blockCount++;
        return blockCount - 1;
    }
    
    /**
     * @dev Calculate block hash
     */
    function calculateHash(
        uint256 _index,
        uint256 _timestamp,
        bytes32 _previousHash,
        string memory _data,
        uint256 _nonce
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_index, _timestamp, _previousHash, _data, _nonce));
    }
    
    /**
     * @dev Access a memory block (increases access count)
     */
    function accessBlock(uint256 _index) external {
        require(_index < blockCount, "Block does not exist");
        require(blocks[_index].state == MemoryState.ACTIVE, "Block not active");
        
        blockAccessCount[_index]++;
        
        // Increase cognitive weight based on access
        blocks[_index].cognitiveWeight += 10;
        totalMemoryWeight += 10;
    }
    
    /**
     * @dev Archive a memory block (moves from ACTIVE to ARCHIVED)
     */
    function archiveBlock(uint256 _index) external onlyValidator {
        require(_index < blockCount, "Block does not exist");
        require(blocks[_index].state == MemoryState.ACTIVE, "Block not active");
        
        MemoryState oldState = blocks[_index].state;
        blocks[_index].state = MemoryState.ARCHIVED;
        
        // Reduce cognitive weight by 50%
        uint256 weightReduction = blocks[_index].cognitiveWeight / 2;
        blocks[_index].cognitiveWeight -= weightReduction;
        totalMemoryWeight -= weightReduction;
        
        emit BlockStateChanged(_index, oldState, MemoryState.ARCHIVED);
    }
    
    /**
     * @dev Mark a memory block as dead (moves from ARCHIVED to DEAD)
     */
    function markBlockDead(uint256 _index) external onlyValidator {
        require(_index < blockCount, "Block does not exist");
        require(blocks[_index].state == MemoryState.ARCHIVED, "Block must be archived first");
        
        MemoryState oldState = blocks[_index].state;
        blocks[_index].state = MemoryState.DEAD;
        
        // Remove remaining cognitive weight
        totalMemoryWeight -= blocks[_index].cognitiveWeight;
        blocks[_index].cognitiveWeight = 0;
        
        emit BlockStateChanged(_index, oldState, MemoryState.DEAD);
    }
    
    /**
     * @dev Apply memory decay to all active blocks
     */
    function applyMemoryDecay(uint256 decayRate) external onlyOwner {
        require(decayRate > 0 && decayRate <= 100, "Invalid decay rate");
        
        for (uint256 i = 0; i < blockCount; i++) {
            if (blocks[i].state == MemoryState.ACTIVE && blocks[i].cognitiveWeight > 0) {
                uint256 decay = (blocks[i].cognitiveWeight * decayRate) / 100;
                blocks[i].cognitiveWeight -= decay;
                totalMemoryWeight -= decay;
                
                emit MemoryDecayed(i, blocks[i].cognitiveWeight);
                
                // Auto-archive if weight drops too low
                if (blocks[i].cognitiveWeight < 100) {
                    blocks[i].state = MemoryState.ARCHIVED;
                    emit BlockStateChanged(i, MemoryState.ACTIVE, MemoryState.ARCHIVED);
                }
            }
        }
    }
    
    /**
     * @dev Verify blockchain integrity
     */
    function verifyChain() external view returns (bool) {
        for (uint256 i = 1; i < blockCount; i++) {
            Block memory currentBlock = blocks[i];
            Block memory previousBlock = blocks[i - 1];
            
            // Check if previous hash matches
            if (currentBlock.previousHash != previousBlock.hash) {
                return false;
            }
            
            // Verify hash calculation
            bytes32 calculatedHash = calculateHash(
                currentBlock.index,
                currentBlock.timestamp,
                currentBlock.previousHash,
                currentBlock.data,
                currentBlock.nonce
            );
            
            if (calculatedHash != currentBlock.hash) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * @dev Get block details
     */
    function getBlock(uint256 _index) external view returns (Block memory) {
        require(_index < blockCount, "Block does not exist");
        return blocks[_index];
    }
    
    /**
     * @dev Get total active memory weight
     */
    function getActiveMemoryWeight() external view returns (uint256) {
        uint256 activeWeight = 0;
        for (uint256 i = 0; i < blockCount; i++) {
            if (blocks[i].state == MemoryState.ACTIVE) {
                activeWeight += blocks[i].cognitiveWeight;
            }
        }
        return activeWeight;
    }
    
    /**
     * @dev Get blocks by state
     */
    function getBlocksByState(MemoryState _state) external view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < blockCount; i++) {
            if (blocks[i].state == _state) {
                count++;
            }
        }
        
        uint256[] memory result = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < blockCount; i++) {
            if (blocks[i].state == _state) {
                result[index] = i;
                index++;
            }
        }
        
        return result;
    }
}
