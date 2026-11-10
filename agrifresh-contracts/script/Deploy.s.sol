// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../src/AgriEscrow.sol";
import "../src/MockUSDC.sol";
import "../src/AgriBatchRegistry.sol";
import "../src/AgriInsurancePool.sol";

contract DeployAgriFresh {
    function run() external {
        address oracleVerifier = msg.sender;
        address autonomousAgent = msg.sender;

        MockUSDC usdc = new MockUSDC();
        AgriEscrow escrow = new AgriEscrow(address(usdc), oracleVerifier, autonomousAgent);
        AgriBatchRegistry registry = new AgriBatchRegistry(oracleVerifier, autonomousAgent);
        AgriInsurancePool insurancePool = new AgriInsurancePool(address(usdc), autonomousAgent);

        escrow.setInsurancePool(address(insurancePool));
        insurancePool.setEscrowContract(address(escrow));
    }
}

