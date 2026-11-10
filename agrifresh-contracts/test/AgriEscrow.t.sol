// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../src/AgriEscrow.sol";
import "../src/MockUSDC.sol";
import "../src/AgriBatchRegistry.sol";
import "../src/AgriInsurancePool.sol";

contract AgriEscrowTest {
    AgriEscrow public escrow;
    MockUSDC public usdc;
    AgriBatchRegistry public registry;
    AgriInsurancePool public pool;

    address public owner = address(this);
    address public farmer = address(0x1111);
    address public buyer = address(0x2222);
    address public transporter = address(0x3333);
    address public agent = address(0x4444);
    address public oracle = address(0x5555);

    function setUp() public {
        usdc = new MockUSDC();
        escrow = new AgriEscrow(address(usdc), oracle, agent);
        registry = new AgriBatchRegistry(oracle, agent);
        pool = new AgriInsurancePool(address(usdc), agent);
        pool.setEscrowContract(address(escrow));
        escrow.setInsurancePool(address(pool));

        // Fund accounts
        usdc.mint(buyer, 100_000 * 10 ** 6);
        usdc.mint(transporter, 100_000 * 10 ** 6);
        usdc.mint(owner, 500_000 * 10 ** 6);
    }
}

