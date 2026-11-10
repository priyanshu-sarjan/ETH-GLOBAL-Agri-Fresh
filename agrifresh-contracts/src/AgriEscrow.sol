// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20Token {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title AgriEscrow
 * @notice Multi-party decentralized escrow protocol for perishable agricultural produce.
 * Enforces hardware IoT SLA compliance, cold-chain bounds, and autonomous AI verification.
 */
contract AgriEscrow {
    enum BatchStatus { Created, InTransit, Delivered, Slashed, Cancelled }

    struct QualityThresholds {
        int16 maxTempCelsius;     // e.g., 8°C (scaled x10 = 80)
        int16 minTempCelsius;     // e.g., 2°C (scaled x10 = 20)
        uint16 maxHumidity;       // e.g., 90% (scaled x10 = 900)
        uint16 maxEthylenePpm;    // Spoilage indicator gas (scaled x10)
        uint32 maxTransitDuration; // Seconds allowed before penalty
    }

    struct Batch {
        uint256 batchId;
        address farmer;
        address buyer;
        address transporter;
        uint256 paymentAmount;
        uint256 transporterStake;
        QualityThresholds thresholds;
        uint32 startTime;
        uint32 deliveryDeadline;
        string ipfsMetadataHash;
        BatchStatus status;
        bool anomalyFlagged;
    }

    address public owner;
    IERC20Token public immutable settlementToken;
    address public oracleVerifier;
    address public autonomousAIAgent;
    address public insurancePool;

    mapping(uint256 => Batch) public batches;
    uint256 public batchCounter;

    uint256 private _status; // Reentrancy guard
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    event BatchCreated(uint256 indexed batchId, address indexed buyer, address indexed transporter, uint256 payment);
    event BatchDispatched(uint256 indexed batchId, uint32 startTime);
    event AnomalyTriggered(uint256 indexed batchId, string reason, int16 observedValue);
    event BatchSettled(uint256 indexed batchId, BatchStatus status, uint256 buyerRefund, uint256 farmerPayout);
    event InsurancePoolUpdated(address indexed insurancePool);
    event VerifierUpdated(address indexed oracleVerifier, address indexed autonomousAIAgent);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier nonReentrant() {
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }

    modifier onlyOracleOrAgent() {
        require(msg.sender == oracleVerifier || msg.sender == autonomousAIAgent || msg.sender == owner, "Unauthorized verifier");
        _;
    }

    constructor(
        address _settlementToken,
        address _oracleVerifier,
        address _autonomousAIAgent
    ) {
        owner = msg.sender;
        settlementToken = IERC20Token(_settlementToken);
        oracleVerifier = _oracleVerifier;
        autonomousAIAgent = _autonomousAIAgent;
        _status = _NOT_ENTERED;
    }

    function setInsurancePool(address _insurancePool) external onlyOwner {
        insurancePool = _insurancePool;
        emit InsurancePoolUpdated(_insurancePool);
    }

    function setVerifiers(address _oracleVerifier, address _autonomousAIAgent) external onlyOwner {
        oracleVerifier = _oracleVerifier;
        autonomousAIAgent = _autonomousAIAgent;
        emit VerifierUpdated(_oracleVerifier, _autonomousAIAgent);
    }

    /**
     * @notice Buyer initiates a batch by locking the purchase payment into escrow
     */
    function createBatch(
        address _farmer,
        address _transporter,
        uint256 _paymentAmount,
        uint256 _transporterStake,
        QualityThresholds calldata _thresholds,
        uint32 _transitDuration,
        string calldata _ipfsMetadataHash
    ) external nonReentrant returns (uint256) {
        require(_paymentAmount > 0, "Invalid payment");
        require(_farmer != address(0), "Invalid farmer");
        require(_transporter != address(0), "Invalid transporter");

        batchCounter++;
        uint256 newBatchId = batchCounter;

        QualityThresholds memory thresholds = _thresholds;
        if (_transitDuration > 0) {
            thresholds.maxTransitDuration = _transitDuration;
        }

        batches[newBatchId] = Batch({
            batchId: newBatchId,
            farmer: _farmer,
            buyer: msg.sender,
            transporter: _transporter,
            paymentAmount: _paymentAmount,
            transporterStake: _transporterStake,
            thresholds: thresholds,
            startTime: 0,
            deliveryDeadline: 0,
            ipfsMetadataHash: _ipfsMetadataHash,
            status: BatchStatus.Created,
            anomalyFlagged: false
        });

        // Pull buyer payment into escrow
        require(settlementToken.transferFrom(msg.sender, address(this), _paymentAmount), "Buyer funding failed");

        emit BatchCreated(newBatchId, msg.sender, _transporter, _paymentAmount);
        return newBatchId;
    }

    /**
     * @notice Transporter locks collateral stake and accepts consignment for dispatch
     */
    function depositTransporterStakeAndDispatch(uint256 _batchId) external nonReentrant {
        Batch storage b = batches[_batchId];
        require(msg.sender == b.transporter || msg.sender == owner, "Not designated transporter");
        require(b.status == BatchStatus.Created, "Invalid state");

        if (b.transporterStake > 0) {
            require(settlementToken.transferFrom(msg.sender, address(this), b.transporterStake), "Transporter stake failed");
        }

        b.status = BatchStatus.InTransit;
        b.startTime = uint32(block.timestamp);
        b.deliveryDeadline = uint32(block.timestamp + b.thresholds.maxTransitDuration);

        emit BatchDispatched(_batchId, b.startTime);
    }

    /**
     * @notice Oracle or AI Agent flags cold-chain anomaly (temperature spike, gas concentration, etc.)
     */
    function reportTelemetryBreach(
        uint256 _batchId,
        string calldata _reason,
        int16 _observedValue
    ) external onlyOracleOrAgent {
        Batch storage b = batches[_batchId];
        require(b.status == BatchStatus.InTransit, "Not active");
        b.anomalyFlagged = true;
        emit AnomalyTriggered(_batchId, _reason, _observedValue);
    }

    /**
     * @notice Finalizes batch delivery using verified AI Spoilage Score and cryptographic signature
     */
    function finalizeDelivery(
        uint256 _batchId,
        uint8 _spoilageScorePercentage, // 0-100 score provided by verified AI / Oracle
        bytes calldata _signature
    ) external nonReentrant {
        Batch storage b = batches[_batchId];
        require(b.status == BatchStatus.InTransit, "Invalid state");

        // Verify that signature is signed by Oracle/AI Agent
        bytes32 messageHash = keccak256(abi.encodePacked(_batchId, _spoilageScorePercentage, address(this)));
        bytes32 ethSignedMessageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
        address signer = recoverSigner(ethSignedMessageHash, _signature);
        
        require(signer == oracleVerifier || signer == autonomousAIAgent || signer == owner, "Invalid report signature");

        if (_spoilageScorePercentage >= 50 || b.anomalyFlagged || (b.deliveryDeadline > 0 && block.timestamp > b.deliveryDeadline)) {
            // SLA BREACHED: Slash transporter stake, refund buyer, send compensation to farmer
            b.status = BatchStatus.Slashed;

            // Buyer gets 100% refund of payment amount
            require(settlementToken.transfer(b.buyer, b.paymentAmount), "Buyer refund failed");

            // Transporter loses 100% of collateral stake to distressed farmer
            if (b.transporterStake > 0) {
                require(settlementToken.transfer(b.farmer, b.transporterStake), "Distress compensation failed");
            }

            emit BatchSettled(_batchId, BatchStatus.Slashed, b.paymentAmount, b.transporterStake);
        } else {
            // NORMAL DELIVERY: Release payment to farmer + return stake to transporter
            b.status = BatchStatus.Delivered;
            require(settlementToken.transfer(b.farmer, b.paymentAmount), "Farmer payout failed");
            if (b.transporterStake > 0) {
                require(settlementToken.transfer(b.transporter, b.transporterStake), "Transporter stake return failed");
            }
            emit BatchSettled(_batchId, BatchStatus.Delivered, 0, b.paymentAmount);
        }
    }

    /**
     * @notice Recovers signer address from ECDSA signature
     */
    function recoverSigner(bytes32 _ethSignedMessageHash, bytes memory _sig) public pure returns (address) {
        if (_sig.length != 65) {
            return address(0);
        }

        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            r := mload(add(_sig, 32))
            s := mload(add(_sig, 64))
            v := byte(0, mload(add(_sig, 96)))
        }

        if (v < 27) {
            v += 27;
        }

        if (v != 27 && v != 28) {
            return address(0);
        }

        return ecrecover(_ethSignedMessageHash, v, r, s);
    }

    /**
     * @notice View function to retrieve batch thresholds easily
     */
    function getBatchThresholds(uint256 _batchId) external view returns (QualityThresholds memory) {
        return batches[_batchId].thresholds;
    }
}

