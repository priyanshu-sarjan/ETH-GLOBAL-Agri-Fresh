import time
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.services.merkle_service import MerkleTree
from app.services.ipfs_service import pin_telemetry_manifest
from app.services.hardware_verifier import verify_hardware_signature
from app.agent.spoilage_agent import run_spoilage_inference, sign_and_submit_verdict, agent_account, ESCROW_CONTRACT_ADDRESS

app = FastAPI(
    title="Agrovia / AgriFresh IoT Gateway & AI Agent Service",
    description="Decentralized agricultural cold-chain telemetry gateway, Merkle tree batcher, and autonomous dispute settlement agent.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory batch store and telemetry cache for demonstration
BATCHES_DB: Dict[int, Dict[str, Any]] = {
    1: {
        "batchId": 1,
        "produceName": "Alphonso Mangoes (GI Tagged)",
        "originFarm": "Ratnagiri Organic Orchards, Maharashtra",
        "destinationFacility": "Cold-Hub Distribution Terminal, Mumbai Port",
        "farmer": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "buyer": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "transporter": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        "paymentAmountUsdc": 2500,
        "transporterStakeUsdc": 500,
        "thresholds": {
            "maxTempCelsius": 8.0,
            "minTempCelsius": 2.0,
            "maxHumidity": 90.0,
            "maxEthylenePpm": 20.0,
            "maxTransitDuration": 86400
        },
        "startTime": int(time.time()) - 21600,
        "deliveryDeadline": int(time.time()) + 64800,
        "status": "InTransit",
        "anomalyFlagged": False,
        "anomalyReason": "",
        "currentTemp": 4.8,
        "currentHumidity": 82.1,
        "currentEthylene": 14.2,
        "lastLat": 19.0760,
        "lastLng": 72.8777,
        "readings": [],
        "merkleRoots": []
    }
}

class TelemetryPayload(BaseModel):
    batchId: int
    timestamp: int
    telemetry: Dict[str, float]
    deviceAddress: str
    signature: str

class AnomalyTriggerRequest(BaseModel):
    batchId: int
    observedTemp: float
    reason: str

class SpoilageEvaluationRequest(BaseModel):
    batchId: int
    imageName: Optional[str] = "alphonso_mango_checkpoint_3.jpg"
    cumulativeTempSpikeHours: Optional[float] = 0.0
    ethyleneAvgPpm: Optional[float] = 14.2
    baseSpoilageOverride: Optional[float] = None
    escrowAddress: Optional[str] = None

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "protocol": "Agrovia / AgriFresh Core v1.0",
        "network": "Base Sepolia (EVM L2)",
        "escrowAddress": ESCROW_CONTRACT_ADDRESS,
        "agentAddress": agent_account.address
    }

@app.get("/api/agent/info")
def get_agent_info():
    return {
        "agentAddress": agent_account.address,
        "escrowAddress": ESCROW_CONTRACT_ADDRESS,
        "status": "Autonomous Daemon Active",
        "supportedSensors": ["DHT22", "MQ-135", "GPS-Neo6M", "Vision-Cam"],
        "signingAlgorithm": "secp256k1-ECDSA-keccak256"
    }

@app.get("/api/batches")
def list_batches():
    return list(BATCHES_DB.values())

@app.get("/api/batches/{batch_id}")
def get_batch(batch_id: int):
    if batch_id not in BATCHES_DB:
        raise HTTPException(status_code=404, detail="Batch not found")
    return BATCHES_DB[batch_id]

@app.post("/api/telemetry/ingest")
def ingest_telemetry(payload: TelemetryPayload):
    data = payload.dict()
    is_valid, recovered_signer = verify_hardware_signature(data)
    if not is_valid:
        raise HTTPException(status_code=400, detail=f"Invalid hardware signature. Recovered: {recovered_signer}")

    batch_id = payload.batchId
    if batch_id not in BATCHES_DB:
        BATCHES_DB[batch_id] = {
            "batchId": batch_id,
            "status": "InTransit",
            "anomalyFlagged": False,
            "readings": [],
            "merkleRoots": []
        }

    batch = BATCHES_DB[batch_id]
    reading_entry = {
        "timestamp": payload.timestamp,
        "telemetry": payload.telemetry,
        "deviceAddress": payload.deviceAddress,
        "signature": payload.signature,
        "verified": True
    }
    batch["readings"].append(reading_entry)
    
    # Update current readings
    batch["currentTemp"] = payload.telemetry.get("temp", batch.get("currentTemp", 4.8))
    batch["currentHumidity"] = payload.telemetry.get("humidity", batch.get("currentHumidity", 82.0))
    batch["currentEthylene"] = payload.telemetry.get("ethylenePpm", batch.get("currentEthylene", 12.0))
    batch["lastLat"] = payload.telemetry.get("lat", batch.get("lastLat", 19.07))
    batch["lastLng"] = payload.telemetry.get("lng", batch.get("lastLng", 72.87))

    # Threshold checks
    max_temp = batch.get("thresholds", {}).get("maxTempCelsius", 8.0)
    if batch["currentTemp"] > max_temp:
        batch["anomalyFlagged"] = True
        batch["anomalyReason"] = f"Temperature breach: {batch['currentTemp']}°C exceeds {max_temp}°C"

    return {
        "success": True,
        "batchId": batch_id,
        "deviceAddress": recovered_signer,
        "verified": True,
        "anomalyFlagged": batch["anomalyFlagged"],
        "readingsCount": len(batch["readings"])
    }

@app.post("/api/telemetry/batch")
async def batch_and_pin_telemetry(batch_id: int):
    if batch_id not in BATCHES_DB:
        raise HTTPException(status_code=404, detail="Batch not found")

    batch = BATCHES_DB[batch_id]
    readings = batch.get("readings", [])
    if not readings:
        # Generate baseline readings if empty
        readings = [{
            "timestamp": int(time.time()) - 300 * i,
            "temp": round(4.5 + (0.2 * i), 2),
            "humidity": 82.0,
            "ethylene": 14.0
        } for i in range(5)]

    merkle_tree = MerkleTree(readings)
    root_hex = merkle_tree.root_hex

    ipfs_res = await pin_telemetry_manifest(batch_id, readings)
    chunk_record = {
        "batchId": batch_id,
        "merkleRoot": root_hex,
        "ipfsCid": ipfs_res["cid"],
        "readingsCount": len(readings),
        "timestamp": int(time.time())
    }
    batch.setdefault("merkleRoots", []).append(chunk_record)

    return {
        "batchId": batch_id,
        "merkleRoot": root_hex,
        "ipfsCid": ipfs_res["cid"],
        "ipfsUrl": f"https://gateway.pinata.cloud/ipfs/{ipfs_res['cid']}",
        "readingsBundled": len(readings)
    }

@app.post("/api/agent/trigger-anomaly")
def trigger_anomaly(req: AnomalyTriggerRequest):
    batch_id = req.batchId
    if batch_id not in BATCHES_DB:
        raise HTTPException(status_code=404, detail="Batch not found")

    batch = BATCHES_DB[batch_id]
    batch["anomalyFlagged"] = True
    batch["anomalyReason"] = req.reason
    batch["currentTemp"] = req.observedTemp

    # Generate Oracle / Agent report
    verdict = run_spoilage_inference(
        image_name="spoilage_heat_spike.jpg",
        cumulative_temp_spike_hours=4.5,
        ethylene_avg_ppm=28.4,
        base_spoilage_override=65.0
    )
    sig_data = sign_and_submit_verdict(batch_id, verdict["finalSpoilageScorePercentage"])

    return {
        "batchId": batch_id,
        "anomalyFlagged": True,
        "observedTemp": req.observedTemp,
        "reason": req.reason,
        "aiVerdict": verdict,
        "onchainSignature": sig_data
    }

@app.post("/api/agent/evaluate-spoilage")
def evaluate_spoilage(req: SpoilageEvaluationRequest):
    batch_id = req.batchId
    verdict = run_spoilage_inference(
        image_name=req.imageName or "",
        cumulative_temp_spike_hours=req.cumulativeTempSpikeHours or 0.0,
        ethylene_avg_ppm=req.ethyleneAvgPpm or 14.0,
        base_spoilage_override=req.baseSpoilageOverride
    )

    sig_data = sign_and_submit_verdict(
        batch_id=batch_id,
        spoilage_score=verdict["finalSpoilageScorePercentage"],
        escrow_address=req.escrowAddress
    )

    return {
        "batchId": batch_id,
        "evaluation": verdict,
        "cryptographicProof": sig_data
    }
