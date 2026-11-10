// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20Insurance {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title AgriInsurancePool
 * @notice Parametric liquidity pool providing autonomous insurance underwriting
 * and instant payouts to farmers when cold-chain SLAs are critically breached.
 */
contract AgriInsurancePool {
    struct Policy {
        uint256 batchId;
        address farmer;
        uint256 coverageAmount;
        uint256 premiumPaid;
        bool active;
        bool claimed;
    }

    address public owner;
    IERC20Insurance public immutable settlementToken;
    address public escrowContract;
    address public autonomousAgent;

    uint256 public totalLiquidity;
    mapping(address => uint256) public lpShares;
    mapping(uint256 => Policy) public policies; // batchId => Policy

    event LiquidityAdded(address indexed provider, uint256 amount);
    event LiquidityWithdrawn(address indexed provider, uint256 amount);
    event PolicyUnderwritten(uint256 indexed batchId, address indexed farmer, uint256 coverageAmount, uint256 premium);
    event ParametricClaimPaid(uint256 indexed batchId, address indexed farmer, uint256 payoutAmount, string reason);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier onlyAuthorized() {
        require(msg.sender == owner || msg.sender == escrowContract || msg.sender == autonomousAgent, "Unauthorized trigger");
        _;
    }

    constructor(address _settlementToken, address _autonomousAgent) {
        owner = msg.sender;
        settlementToken = IERC20Insurance(_settlementToken);
        autonomousAgent = _autonomousAgent;
    }

    function setEscrowContract(address _escrow) external onlyOwner {
        escrowContract = _escrow;
    }

    function depositLiquidity(uint256 _amount) external {
        require(_amount > 0, "Invalid amount");
        require(settlementToken.transferFrom(msg.sender, address(this), _amount), "Deposit failed");
        
        lpShares[msg.sender] += _amount;
        totalLiquidity += _amount;
        emit LiquidityAdded(msg.sender, _amount);
    }

    function withdrawLiquidity(uint256 _amount) external {
        require(lpShares[msg.sender] >= _amount, "Insufficient shares");
        require(totalLiquidity >= _amount, "Insufficient pool liquidity");

        lpShares[msg.sender] -= _amount;
        totalLiquidity -= _amount;
        require(settlementToken.transfer(msg.sender, _amount), "Withdrawal failed");
        emit LiquidityWithdrawn(msg.sender, _amount);
    }

    function underwritePolicy(
        uint256 _batchId,
        address _farmer,
        uint256 _coverageAmount,
        uint256 _premium
    ) external {
        require(!policies[_batchId].active, "Policy already active");
        require(totalLiquidity >= _coverageAmount, "Pool capacity exceeded");

        if (_premium > 0) {
            require(settlementToken.transferFrom(msg.sender, address(this), _premium), "Premium payment failed");
            totalLiquidity += _premium;
        }

        policies[_batchId] = Policy({
            batchId: _batchId,
            farmer: _farmer,
            coverageAmount: _coverageAmount,
            premiumPaid: _premium,
            active: true,
            claimed: false
        });

        emit PolicyUnderwritten(_batchId, _farmer, _coverageAmount, _premium);
    }

    /**
     * @notice Parametric payout execution triggered autonomously upon verified cold chain failure
     */
    function triggerParametricPayout(
        uint256 _batchId,
        string calldata _reason
    ) external onlyAuthorized {
        Policy storage p = policies[_batchId];
        require(p.active, "No active policy");
        require(!p.claimed, "Already claimed");

        p.claimed = true;
        p.active = false;

        uint256 payout = p.coverageAmount;
        if (payout > totalLiquidity) {
            payout = totalLiquidity;
        }

        totalLiquidity -= payout;
        require(settlementToken.transfer(p.farmer, payout), "Payout transfer failed");

        emit ParametricClaimPaid(_batchId, p.farmer, payout, _reason);
    }
}

