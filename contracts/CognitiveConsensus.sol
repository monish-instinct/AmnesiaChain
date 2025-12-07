// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CognitiveConsensus
 * @dev Consensus mechanism based on cognitive importance rather than traditional PoW/PoS
 */
contract CognitiveConsensus {
    
    struct Validator {
        address validatorAddress;
        uint256 stake;
        uint256 reputationScore;
        uint256 blocksValidated;
        uint256 successfulValidations;
        uint256 failedValidations;
        bool isActive;
        uint256 registeredAt;
    }
    
    struct ValidationProposal {
        uint256 blockIndex;
        bytes32 blockHash;
        address proposer;
        uint256 cognitiveWeight;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 proposedAt;
        bool executed;
        mapping(address => bool) hasVoted;
    }
    
    mapping(address => Validator) public validators;
    mapping(uint256 => ValidationProposal) public proposals;
    
    address[] public validatorList;
    uint256 public proposalCount;
    uint256 public minimumStake = 1 ether;
    uint256 public validatorCount;
    uint256 public constant VOTING_PERIOD = 1 hours;
    uint256 public constant REPUTATION_THRESHOLD = 50;
    
    event ValidatorRegistered(address indexed validator, uint256 stake);
    event ValidatorDeactivated(address indexed validator);
    event ProposalCreated(uint256 indexed proposalId, uint256 blockIndex, address indexed proposer);
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool inFavor);
    event ProposalExecuted(uint256 indexed proposalId, bool approved);
    event ReputationUpdated(address indexed validator, uint256 newReputation);
    
    modifier onlyValidator() {
        require(validators[msg.sender].isActive, "Not an active validator");
        _;
    }
    
    modifier onlyHighReputation() {
        require(validators[msg.sender].reputationScore >= REPUTATION_THRESHOLD, "Insufficient reputation");
        _;
    }
    
    /**
     * @dev Register as a validator
     */
    function registerValidator() external payable {
        require(msg.value >= minimumStake, "Insufficient stake");
        require(!validators[msg.sender].isActive, "Already registered");
        
        validators[msg.sender] = Validator({
            validatorAddress: msg.sender,
            stake: msg.value,
            reputationScore: 50, // Start with neutral reputation
            blocksValidated: 0,
            successfulValidations: 0,
            failedValidations: 0,
            isActive: true,
            registeredAt: block.timestamp
        });
        
        validatorList.push(msg.sender);
        validatorCount++;
        
        emit ValidatorRegistered(msg.sender, msg.value);
    }
    
    /**
     * @dev Increase validator stake
     */
    function increaseStake() external payable onlyValidator {
        require(msg.value > 0, "Must send ETH");
        validators[msg.sender].stake += msg.value;
    }
    
    /**
     * @dev Deactivate validator and withdraw stake
     */
    function deactivateValidator() external onlyValidator {
        Validator storage validator = validators[msg.sender];
        require(validator.isActive, "Already inactive");
        
        uint256 stakeToReturn = validator.stake;
        validator.isActive = false;
        validator.stake = 0;
        validatorCount--;
        
        payable(msg.sender).transfer(stakeToReturn);
        
        emit ValidatorDeactivated(msg.sender);
    }
    
    /**
     * @dev Create a validation proposal for a new block
     */
    function createProposal(
        uint256 _blockIndex,
        bytes32 _blockHash,
        uint256 _cognitiveWeight
    ) external onlyValidator onlyHighReputation returns (uint256) {
        require(_cognitiveWeight > 0 && _cognitiveWeight <= 1000, "Invalid cognitive weight");
        
        uint256 proposalId = proposalCount++;
        
        ValidationProposal storage proposal = proposals[proposalId];
        proposal.blockIndex = _blockIndex;
        proposal.blockHash = _blockHash;
        proposal.proposer = msg.sender;
        proposal.cognitiveWeight = _cognitiveWeight;
        proposal.votesFor = 0;
        proposal.votesAgainst = 0;
        proposal.proposedAt = block.timestamp;
        proposal.executed = false;
        
        emit ProposalCreated(proposalId, _blockIndex, msg.sender);
        
        return proposalId;
    }
    
    /**
     * @dev Vote on a validation proposal
     */
    function vote(uint256 _proposalId, bool _inFavor) external onlyValidator {
        ValidationProposal storage proposal = proposals[_proposalId];
        
        require(!proposal.executed, "Proposal already executed");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        require(block.timestamp <= proposal.proposedAt + VOTING_PERIOD, "Voting period ended");
        
        Validator storage validator = validators[msg.sender];
        
        // Weight vote by validator's reputation and stake
        uint256 voteWeight = (validator.reputationScore * validator.stake) / 1 ether;
        
        if (_inFavor) {
            proposal.votesFor += voteWeight;
        } else {
            proposal.votesAgainst += voteWeight;
        }
        
        proposal.hasVoted[msg.sender] = true;
        
        emit VoteCast(_proposalId, msg.sender, _inFavor);
    }
    
    /**
     * @dev Execute a proposal after voting period
     */
    function executeProposal(uint256 _proposalId) external {
        ValidationProposal storage proposal = proposals[_proposalId];
        
        require(!proposal.executed, "Already executed");
        require(block.timestamp > proposal.proposedAt + VOTING_PERIOD, "Voting period not ended");
        
        proposal.executed = true;
        
        bool approved = proposal.votesFor > proposal.votesAgainst;
        
        // Update proposer's reputation
        Validator storage proposer = validators[proposal.proposer];
        if (approved) {
            proposer.successfulValidations++;
            proposer.blocksValidated++;
            
            // Increase reputation
            if (proposer.reputationScore < 100) {
                proposer.reputationScore += 2;
                if (proposer.reputationScore > 100) {
                    proposer.reputationScore = 100;
                }
            }
        } else {
            proposer.failedValidations++;
            
            // Decrease reputation
            if (proposer.reputationScore > 0) {
                proposer.reputationScore = proposer.reputationScore > 5 ? proposer.reputationScore - 5 : 0;
            }
        }
        
        emit ProposalExecuted(_proposalId, approved);
        emit ReputationUpdated(proposal.proposer, proposer.reputationScore);
    }
    
    /**
     * @dev Calculate validator's voting power
     */
    function getVotingPower(address _validator) external view returns (uint256) {
        Validator memory validator = validators[_validator];
        if (!validator.isActive) {
            return 0;
        }
        
        return (validator.reputationScore * validator.stake) / 1 ether;
    }
    
    /**
     * @dev Get validator details
     */
    function getValidator(address _validator) external view returns (Validator memory) {
        return validators[_validator];
    }
    
    /**
     * @dev Get proposal details (without mapping)
     */
    function getProposal(uint256 _proposalId) external view returns (
        uint256 blockIndex,
        bytes32 blockHash,
        address proposer,
        uint256 cognitiveWeight,
        uint256 votesFor,
        uint256 votesAgainst,
        uint256 proposedAt,
        bool executed
    ) {
        ValidationProposal storage proposal = proposals[_proposalId];
        return (
            proposal.blockIndex,
            proposal.blockHash,
            proposal.proposer,
            proposal.cognitiveWeight,
            proposal.votesFor,
            proposal.votesAgainst,
            proposal.proposedAt,
            proposal.executed
        );
    }
    
    /**
     * @dev Check if address has voted on proposal
     */
    function hasVoted(uint256 _proposalId, address _voter) external view returns (bool) {
        return proposals[_proposalId].hasVoted[_voter];
    }
    
    /**
     * @dev Get all active validators
     */
    function getActiveValidators() external view returns (address[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < validatorList.length; i++) {
            if (validators[validatorList[i]].isActive) {
                activeCount++;
            }
        }
        
        address[] memory active = new address[](activeCount);
        uint256 index = 0;
        for (uint256 i = 0; i < validatorList.length; i++) {
            if (validators[validatorList[i]].isActive) {
                active[index] = validatorList[i];
                index++;
            }
        }
        
        return active;
    }
}
