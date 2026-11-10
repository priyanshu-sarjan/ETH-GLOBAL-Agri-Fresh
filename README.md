# 🌾 Agrovia & AgriFresh Protocol

[![Next.js 14](https://img.shields.io/badge/Next.js-14_App_Router-black?style=flat&logo=next.js)](https://nextjs.org)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636?style=flat&logo=solidity)](https://soliditylang.org)
[![Base Sepolia](https://img.shields.io/badge/Base_Sepolia-EVM_L2-0052FF?style=flat&logo=coinbase)](https://sepolia.basescan.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python_3.14-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![IPFS](https://img.shields.io/badge/Decentralized_Storage-IPFS_Pinata-65C2CB?style=flat&logo=ipfs)](https://pinata.cloud)
[![Vercel](https://img.shields.io/badge/Deploy_with-Vercel-000000?style=flat&logo=vercel)](https://vercel.com)

> **Decentralized IoT Cold-Chain Quality Verification, Merkle Tree Telemetry, and Autonomous Escrow Settlement with Parametric Insurance on Base EVM L2.**

---

## 📸 Agrovia Visual Design System
The frontend is built according to the **Agrovia** design specification:
* **Brand Identity**: Emerald leaf icon with frosted glass navigation.
* **Hero Headline**: High-impact editorial typography:
  * Sans-serif title: **"Smart Farming for"**
  * Serif italic subtitle: ***"Future Generations"*** (Playfair Display)
* **Call to Action**: Lime pill `Start Tracking ↗` and frosted glass pill `Meet the Farmers`.
* **Social Proof**: ⭐ `4.9` rating with community avatars & `10k+ Farmers & Transporters`.
* **Enterprise Bar**: `CHASE`, `JOHN DEERE`, `GREEN`, `Ohms`, `NBOK`, `LOGIX`.

---

## 🏛️ System Architecture Blueprint

```
+--------------------------------------------------------------------------------------------------+
|                                    1. EDGE & IOT INGESTION                                       |
|  [ESP32 / DHT22 / MQ-135 Gas / Neo-6M GPS]                                                       |
|        |                                                                                         |
|        | (ECDSA Signed Reading: payload + secp256k1 signature)                                   |
|        v                                                                                         |
|  [FastAPI Telemetry Gateway / Serverless Next.js API]                                            |
|        +---> Bundles readings into Merkle Trees every 15 min                                      |
|        +---> Uploads batch JSON to IPFS / Filecoin (via Pinata / Lighthouse)                      |
+--------------------------------------------------------------------------------------------------+
                                                 |
                                                 v
+--------------------------------------------------------------------------------------------------+
|                              2. VERIFICATION & AI AGENT ENGINE                                   |
|  [Custom Oracle & Hardware Signature Verifier]                                                   |
|        +---> Reads IoT IPFS hashes & verifies hardware signatures                                |
|        +---> Posts Root Hash & violation flags to `AgriBatchRegistry.sol`                        |
|                                                                                                  |
|  [Quality Evaluator Autonomous Agent (FastAPI + Web3.py + Viem)]                                 |
|        +---> Ingests Checkpoint Produce Images -> Computes Visual Spoilage Score (0-100)         |
|        +---> Ingests Cumulative Temperature & Ethylene Time-Series Data                          |
|        +---> Executes Automated Price Depreciation / Dispute Settlement via Agentic Wallet       |
+--------------------------------------------------------------------------------------------------+
                                                 |
                                                 v
+--------------------------------------------------------------------------------------------------+
|                            3. ONCHAIN CORE (EVM L2: BASE / ARBITRUM)                             |
|  [AgriBatchRegistry.sol]                                                                         |
|        +---> Stores Batch metadata, IPFS CIDs, and verified sensor anomaly events                |
|  [AgriEscrow.sol]                                                                                |
|        +---> Locked Buyer USDC/USDT + Transporter Collateral Stake                               |
|        +---> State: CREATED -> IN_TRANSIT -> COMPLETED (Normal) / SLA_BREACHED (Slashed)         |
|  [AgriInsurancePool.sol]                                                                         |
|        +---> Parametric liquidity pool triggering auto-payouts to farmers on severe loss         |
+--------------------------------------------------------------------------------------------------+
                                                 |
                                                 v
+--------------------------------------------------------------------------------------------------+
|                                    4. FRONTEND APPLICATION                                       |
|  [Next.js 14 App Router + Tailwind CSS + shadcn/ui]                                              |
|        +---> Auth: ERC-4337 Account Abstraction (Bob Buyer, Alice Farmer, Transporter, AI Agent)|
|        +---> Realtime Maps: Leaflet.js with GPS track and historical checkpoint trail            |
|        +---> Web3 Contract Interactions: Viem + Wagmi                                            |
+--------------------------------------------------------------------------------------------------+
```

---

## 📦 Project Structure

```
.
├── vercel.json                   # Vercel monorepo deployment config
├── .vercelignore                 # Production build filter
├── agrifresh-contracts/          # Foundry & Solidity smart contracts
│   ├── src/
│   │   ├── AgriEscrow.sol        # Multi-party escrow, slashing, & settlement
│   │   ├── AgriBatchRegistry.sol # Onchain batch metadata & 15-min Merkle roots
│   │   ├── AgriInsurancePool.sol # Parametric pool with autonomous claims
│   │   └── MockUSDC.sol          # Settlement token with minting
│   ├── test/                     # Foundry test suite
│   ├── script/                   # Deployment scripts
│   ├── artifacts/                # Exported contract ABIs
│   └── scripts/
│       ├── compile.js            # Solidity 0.8.24 compiler
│       └── test.js               # Ethers v6 smart contract test runner
├── agrifresh-backend/            # Python FastAPI IoT & AI Agent
│   ├── app/
│   │   ├── main.py               # REST API endpoints & CORS
│   │   ├── services/
│   │   │   ├── merkle_service.py # 15-min Merkle tree batcher & proofs
│   │   │   ├── ipfs_service.py   # Pinata / Filecoin IPFS pinning
│   │   │   └── hardware_verifier.py # secp256k1 hardware signature check
│   │   └── agent/
│   │       └── spoilage_agent.py # AI vision scoring & onchain signing
│   ├── firmware/
│   │   └── esp32_firmware_simulator.py # Hardware ESP32 ECDSA firmware
│   └── integration_test.py       # End-to-end integration test
└── agrifresh-web/                # Next.js 14 App Router Web Application
    ├── app/                      # Pages, Layout, and Serverless API Routes
    │   ├── api/                  # Native Next.js serverless API routes
    │   ├── globals.css           # Styling and font configuration
    │   ├── layout.tsx            # Optimized headers & CDN links
    │   └── page.tsx              # Main dashboard view
    ├── components/               # React UI components
    │   ├── Navbar.tsx            # Frosted glass floating pill nav
    │   ├── Hero.tsx              # Agrovia hero section
    │   ├── PartnerBanner.tsx     # Enterprise partner ticker
    │   ├── BatchDashboard.tsx    # Live Consignment Escrow Dashboard
    │   ├── GpsRouteMap.tsx       # Leaflet.js GPS tracking & checkpoints
    │   ├── AiSpoilageScanner.tsx # Computer vision produce inspector
    │   ├── IotMerkleGateway.tsx  # ESP32 live stream & Merkle bundler
    │   ├── InsurancePoolSection.tsx # Parametric liquidity pool
    │   └── WalletModal.tsx       # Web3 / Persona switcher
    └── public/agrovia-hero.jpg   # Brand hero visual asset
```

---

## ⚡ Quick Start

### 1. Run Web Application
```bash
cd agrifresh-web
npm install --legacy-peer-deps
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

### 2. Run Backend & AI Agent (Optional)
```bash
cd agrifresh-backend
uv run uvicorn app.main:app --port 8000
```

### 3. Run Smart Contract Tests
```bash
cd agrifresh-contracts
node scripts/test.js
```

---

## 🚀 Deploying to Vercel

The application is pre-configured for one-click Vercel deployment:
1. Push this repository to GitHub:
   ```bash
   git remote add origin https://github.com/priyanshu-sarjan/ETH-GLOBAL-Agri-Fresh.git
   git push -u origin main
   ```
2. Import the project into Vercel. `vercel.json` will automatically configure Next.js and the webpack build flags.

---

## 📄 License
MIT License. Built for ETH Global Hackathon.
