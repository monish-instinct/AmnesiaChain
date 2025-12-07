// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MemoryToken
 * @dev ERC20-like token for rewarding validators and incentivizing memory preservation
 */
contract MemoryToken {
    
    string public constant name = "AmnesiaChain Memory Token";
    string public constant symbol = "AMT";
    uint8 public constant decimals = 18;
    
    uint256 public totalSupply;
    uint256 public constant MAX_SUPPLY = 1000000000 * 10**18; // 1 billion tokens
    
    address public owner;
    address public amnesiaChainContract;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Mint(address indexed to, uint256 amount);
    event Burn(address indexed from, uint256 amount);
    event RewardDistributed(address indexed validator, uint256 amount, string reason);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    modifier onlyAmnesiaChain() {
        require(msg.sender == amnesiaChainContract, "Only AmnesiaChain contract");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        // Mint initial supply to contract owner
        _mint(msg.sender, 100000000 * 10**18); // 100 million initial tokens
    }
    
    /**
     * @dev Set the AmnesiaChain contract address
     */
    function setAmnesiaChainContract(address _contract) external onlyOwner {
        require(_contract != address(0), "Invalid address");
        amnesiaChainContract = _contract;
    }
    
    /**
     * @dev Transfer tokens
     */
    function transfer(address _to, uint256 _value) external returns (bool) {
        require(_to != address(0), "Invalid address");
        require(balanceOf[msg.sender] >= _value, "Insufficient balance");
        
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        
        emit Transfer(msg.sender, _to, _value);
        return true;
    }
    
    /**
     * @dev Approve spender
     */
    function approve(address _spender, uint256 _value) external returns (bool) {
        require(_spender != address(0), "Invalid address");
        
        allowance[msg.sender][_spender] = _value;
        
        emit Approval(msg.sender, _spender, _value);
        return true;
    }
    
    /**
     * @dev Transfer from
     */
    function transferFrom(address _from, address _to, uint256 _value) external returns (bool) {
        require(_to != address(0), "Invalid address");
        require(balanceOf[_from] >= _value, "Insufficient balance");
        require(allowance[_from][msg.sender] >= _value, "Insufficient allowance");
        
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value;
        
        emit Transfer(_from, _to, _value);
        return true;
    }
    
    /**
     * @dev Mint new tokens (only owner or AmnesiaChain contract)
     */
    function mint(address _to, uint256 _amount) external {
        require(msg.sender == owner || msg.sender == amnesiaChainContract, "Not authorized");
        _mint(_to, _amount);
    }
    
    /**
     * @dev Internal mint function
     */
    function _mint(address _to, uint256 _amount) internal {
        require(_to != address(0), "Invalid address");
        require(totalSupply + _amount <= MAX_SUPPLY, "Exceeds max supply");
        
        totalSupply += _amount;
        balanceOf[_to] += _amount;
        
        emit Mint(_to, _amount);
        emit Transfer(address(0), _to, _amount);
    }
    
    /**
     * @dev Burn tokens
     */
    function burn(uint256 _amount) external {
        require(balanceOf[msg.sender] >= _amount, "Insufficient balance");
        
        balanceOf[msg.sender] -= _amount;
        totalSupply -= _amount;
        
        emit Burn(msg.sender, _amount);
        emit Transfer(msg.sender, address(0), _amount);
    }
    
    /**
     * @dev Reward validator for block creation
     */
    function rewardBlockCreation(address _validator) external onlyAmnesiaChain {
        uint256 reward = 10 * 10**18; // 10 tokens per block
        _mint(_validator, reward);
        emit RewardDistributed(_validator, reward, "Block Creation");
    }
    
    /**
     * @dev Reward validator for successful validation
     */
    function rewardValidation(address _validator) external onlyAmnesiaChain {
        uint256 reward = 5 * 10**18; // 5 tokens per validation
        _mint(_validator, reward);
        emit RewardDistributed(_validator, reward, "Successful Validation");
    }
    
    /**
     * @dev Reward for memory preservation (keeping important memories active)
     */
    function rewardMemoryPreservation(address _user, uint256 _cognitiveWeight) external onlyAmnesiaChain {
        // Reward based on cognitive weight preserved
        uint256 reward = (_cognitiveWeight * 10**18) / 100; // Scale reward
        _mint(_user, reward);
        emit RewardDistributed(_user, reward, "Memory Preservation");
    }
    
    /**
     * @dev Batch transfer for airdrops
     */
    function batchTransfer(address[] memory _recipients, uint256[] memory _amounts) external onlyOwner {
        require(_recipients.length == _amounts.length, "Array length mismatch");
        
        for (uint256 i = 0; i < _recipients.length; i++) {
            require(balanceOf[msg.sender] >= _amounts[i], "Insufficient balance");
            
            balanceOf[msg.sender] -= _amounts[i];
            balanceOf[_recipients[i]] += _amounts[i];
            
            emit Transfer(msg.sender, _recipients[i], _amounts[i]);
        }
    }
}
