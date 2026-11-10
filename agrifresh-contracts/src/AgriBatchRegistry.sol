// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title AgriBatchRegistry
 * @notice Onchain immutable registry for Agricultural Batch metadata,
 * IPFS CIDs, 15-minute sensor Merkle tree roots, and cryptographic anomaly logs.
 */
contract AgriBatchRegistry {
    struct SensorReadingLog {
        uint256 timestamp;
        bytes32 merkleRoot;
        string ipfsCid;
        int16 avgTemp;
        uint16 avgHumidity;
        uint16 avgEthylene;
        bool anomalyPresent;
    }

    struct BatchMetadata {
        uint256 batchId;
        string produceName;
        string originFarm;
        string destinationFacility;
        uint32 harvestTimestamp;
        address deviceSigner;
        string primaryIpfsCid;
    }

    address public owner;
    address public oracleVerifier;
    address public autonomousAgent;

    // batchId => BatchMetadata
    mapping(uint256 => BatchMetadata) public batchMetadata;
    // batchId => array of 15-min Merkle telemetry chunks
    mapping(uint256 => SensorReadingLog[]) public batchTelemetryLogs;

    event BatchMetadataRegistered(uint256 indexed batchId, string produceName, string originFarm, string primaryIpfsCid);
    event TelemetryMerkleRootPosted(uint256 indexed batchId, bytes32 indexed merkleRoot, string ipfsCid, bool anomaly);

    modifier onlyAuthorized() {
        require(msg.sender == owner || msg.sender == oracleVerifier || msg.sender == autonomousAgent, "Unauthorized");
        _;
    }

    constructor(address _oracleVerifier, address _autonomousAgent) {
        owner = msg.sender;
        oracleVerifier = _oracleVerifier;
        autonomousAgent = _autonomousAgent;
    }

    function setAuthorized(address _oracleVerifier, address _autonomousAgent) external {
        require(msg.sender == owner, "Only owner");
        oracleVerifier = _oracleVerifier;
        autonomousAgent = _autonomousAgent;
    }

    function registerBatchMetadata(
        uint256 _batchId,
        string calldata _produceName,
        string calldata _originFarm,
        string calldata _destinationFacility,
        uint32 _harvestTimestamp,
        address _deviceSigner,
        string calldata _primaryIpfsCid
    ) external onlyAuthorized {
        batchMetadata[_batchId] = BatchMetadata({
            batchId: _batchId,
            produceName: _produceName,
            originFarm: _originFarm,
            destinationFacility: _destinationFacility,
            harvestTimestamp: _harvestTimestamp,
            deviceSigner: _deviceSigner,
            primaryIpfsCid: _primaryIpfsCid
        });

        emit BatchMetadataRegistered(_batchId, _produceName, _originFarm, _primaryIpfsCid);
    }

    function postTelemetryMerkleChunk(
        uint256 _batchId,
        bytes32 _merkleRoot,
        string calldata _ipfsCid,
        int16 _avgTemp,
        uint16 _avgHumidity,
        uint16 _avgEthylene,
        bool _anomalyPresent
    ) external onlyAuthorized {
        batchTelemetryLogs[_batchId].push(SensorReadingLog({
            timestamp: block.timestamp,
            merkleRoot: _merkleRoot,
            ipfsCid: _ipfsCid,
            avgTemp: _avgTemp,
            avgHumidity: _avgHumidity,
            avgEthylene: _avgEthylene,
            anomalyPresent: _anomalyPresent
        }));

        emit TelemetryMerkleRootPosted(_batchId, _merkleRoot, _ipfsCid, _anomalyPresent);
    }

    function getTelemetryLogsCount(uint256 _batchId) external view returns (uint256) {
        return batchTelemetryLogs[_batchId].length;
    }

    function getTelemetryLog(uint256 _batchId, uint256 index) external view returns (SensorReadingLog memory) {
        return batchTelemetryLogs[_batchId][index];
    }
}

