// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MemoryBlock
 * @dev Contract for managing individual memory blocks with cognitive properties
 */
contract MemoryBlock {
    
    struct MemoryData {
        bytes32 contentHash;
        uint256 timestamp;
        uint256 accessCount;
        uint256 lastAccessTime;
        uint256 importanceScore;
        uint256 recencyScore;
        address creator;
        bool isDeleted;
    }
    
    mapping(uint256 => MemoryData) public memories;
    mapping(bytes32 => uint256) public contentHashToId;
    
    uint256 public memoryCount;
    uint256 constant DECAY_INTERVAL = 1 days;
    
    event MemoryCreated(uint256 indexed id, bytes32 contentHash, address indexed creator);
    event MemoryAccessed(uint256 indexed id, uint256 accessCount);
    event MemoryDecayed(uint256 indexed id, uint256 newRecencyScore);
    event MemoryDeleted(uint256 indexed id);
    
    /**
     * @dev Create a new memory block
     */
    function createMemory(bytes32 _contentHash, uint256 _importanceScore) external returns (uint256) {
        require(contentHashToId[_contentHash] == 0, "Memory already exists");
        require(_importanceScore > 0 && _importanceScore <= 100, "Invalid importance score");
        
        uint256 memoryId = memoryCount++;
        
        memories[memoryId] = MemoryData({
            contentHash: _contentHash,
            timestamp: block.timestamp,
            accessCount: 0,
            lastAccessTime: block.timestamp,
            importanceScore: _importanceScore,
            recencyScore: 100,
            creator: msg.sender,
            isDeleted: false
        });
        
        contentHashToId[_contentHash] = memoryId;
        
        emit MemoryCreated(memoryId, _contentHash, msg.sender);
        
        return memoryId;
    }
    
    /**
     * @dev Access a memory (updates access count and recency)
     */
    function accessMemory(uint256 _memoryId) external {
        require(_memoryId < memoryCount, "Memory does not exist");
        require(!memories[_memoryId].isDeleted, "Memory is deleted");
        
        MemoryData storage memory = memories[_memoryId];
        memory.accessCount++;
        memory.lastAccessTime = block.timestamp;
        
        // Boost recency score on access
        if (memory.recencyScore < 100) {
            memory.recencyScore += 10;
            if (memory.recencyScore > 100) {
                memory.recencyScore = 100;
            }
        }
        
        emit MemoryAccessed(_memoryId, memory.accessCount);
    }
    
    /**
     * @dev Calculate cognitive score based on multiple factors
     */
    function calculateCognitiveScore(uint256 _memoryId) public view returns (uint256) {
        require(_memoryId < memoryCount, "Memory does not exist");
        
        MemoryData memory memoryData = memories[_memoryId];
        
        if (memoryData.isDeleted) {
            return 0;
        }
        
        // Score = (importanceScore * 40%) + (recencyScore * 30%) + (accessFrequency * 30%)
        uint256 accessFrequency = memoryData.accessCount > 100 ? 100 : memoryData.accessCount;
        
        uint256 score = (memoryData.importanceScore * 40) / 100 +
                       (memoryData.recencyScore * 30) / 100 +
                       (accessFrequency * 30) / 100;
        
        return score;
    }
    
    /**
     * @dev Apply time-based decay to recency score
     */
    function applyDecay(uint256 _memoryId) external {
        require(_memoryId < memoryCount, "Memory does not exist");
        
        MemoryData storage memory = memories[_memoryId];
        
        if (memory.isDeleted) {
            return;
        }
        
        uint256 timePassed = block.timestamp - memory.lastAccessTime;
        uint256 decayPeriods = timePassed / DECAY_INTERVAL;
        
        if (decayPeriods > 0 && memory.recencyScore > 0) {
            uint256 decay = decayPeriods * 5; // 5% decay per day
            
            if (decay >= memory.recencyScore) {
                memory.recencyScore = 0;
            } else {
                memory.recencyScore -= decay;
            }
            
            emit MemoryDecayed(_memoryId, memory.recencyScore);
        }
    }
    
    /**
     * @dev Delete a memory (soft delete)
     */
    function deleteMemory(uint256 _memoryId) external {
        require(_memoryId < memoryCount, "Memory does not exist");
        require(memories[_memoryId].creator == msg.sender, "Only creator can delete");
        require(!memories[_memoryId].isDeleted, "Already deleted");
        
        memories[_memoryId].isDeleted = true;
        
        emit MemoryDeleted(_memoryId);
    }
    
    /**
     * @dev Get memory details
     */
    function getMemory(uint256 _memoryId) external view returns (MemoryData memory) {
        require(_memoryId < memoryCount, "Memory does not exist");
        return memories[_memoryId];
    }
    
    /**
     * @dev Check if memory should be archived based on cognitive score
     */
    function shouldArchive(uint256 _memoryId) external view returns (bool) {
        uint256 score = calculateCognitiveScore(_memoryId);
        return score < 30; // Archive if cognitive score drops below 30%
    }
    
    /**
     * @dev Check if memory should be deleted based on cognitive score
     */
    function shouldDelete(uint256 _memoryId) external view returns (bool) {
        uint256 score = calculateCognitiveScore(_memoryId);
        return score < 10; // Delete if cognitive score drops below 10%
    }
}
