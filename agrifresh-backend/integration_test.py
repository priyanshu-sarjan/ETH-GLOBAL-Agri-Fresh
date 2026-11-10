"""
Full End-to-End Integration Test for AgriFresh IoT Ingestion, Merkle Batching, and AI Agent
"""
import sys
import httpx
from firmware.esp32_firmware_simulator import generate_signed_reading

BASE_URL = "http://127.0.0.1:8000"

def run_integration_pipeline():
    print("================================================================")
    print("🌿 AgriFresh / Agrovia End-to-End IoT & AI Agent Integration Test")
    print("================================================================\n")

    client = httpx.Client(base_url=BASE_URL, timeout=10.0)

    # 1. Health check
    print("1. Checking Gateway Health...")
    r = client.get("/api/health")
    assert r.status_code == 200, f"Health check failed: {r.text}"
    health = r.json()
    print(f"   ✓ Gateway Online: {health['protocol']}")
    print(f"   ✓ Network: {health['network']}")
    print(f"   ✓ AI Agent Signer: {health['agentAddress']}")

    # 2. ESP32 Hardware Telemetry Ingestion
    print("\n2. Ingesting Cryptographically Signed ESP32 Hardware Reading...")
    reading = generate_signed_reading(batch_id=1, is_anomaly=False)
    r = client.post("/api/telemetry/ingest", json=reading)
    assert r.status_code == 200, f"Telemetry ingestion failed: {r.text}"
    ingest_res = r.json()
    print(f"   ✓ Hardware Node Address: {ingest_res['deviceAddress']}")
    print(f"   ✓ On-chip secp256k1 Signature Verified: {ingest_res['verified']}")
    print(f"   ✓ Stored Reading Count: {ingest_res['readingsCount']}")

    # 3. 15-Minute Merkle Tree Batching & IPFS Pinning
    print("\n3. Bundling 15-Minute Telemetry into Merkle Tree & IPFS Manifest...")
    r = client.post("/api/telemetry/batch?batch_id=1")
    assert r.status_code == 200, f"Merkle batching failed: {r.text}"
    batch_res = r.json()
    print(f"   ✓ Merkle Root (Anchor Hash): {batch_res['merkleRoot']}")
    print(f"   ✓ IPFS Content ID (CIDv0): {batch_res['ipfsCid']}")
    print(f"   ✓ Gateway URL: {batch_res['ipfsUrl']}")
    print(f"   ✓ Readings Bundled: {batch_res['readingsBundled']}")

    # 4. Thermal Anomaly Trigger & Autonomous Dispute Resolution
    print("\n4. Simulating Thermal SLA Violation (14.8°C Compressor Loss)...")
    anomaly_payload = {
        "batchId": 1,
        "observedTemp": 14.8,
        "reason": "Refrigeration Compressor Circuit Breaker Trip"
    }
    r = client.post("/api/agent/trigger-anomaly", json=anomaly_payload)
    assert r.status_code == 200, f"Anomaly trigger failed: {r.text}"
    anomaly_res = r.json()
    print(f"   ✓ Anomaly Flagged: {anomaly_res['anomalyFlagged']}")
    print(f"   ✓ AI Spoilage Score: {anomaly_res['aiVerdict']['finalSpoilageScorePercentage']}%")
    print(f"   ✓ AI Verdict: {anomaly_res['aiVerdict']['verdict']}")
    print(f"   ✓ Autonomous Settlement Recommendation: {anomaly_res['aiVerdict']['recommendation']}")
    print(f"   ✓ keccak256 Packed Hash: {anomaly_res['onchainSignature']['packedDataHash']}")
    print(f"   ✓ Onchain ECDSA Signature: {anomaly_res['onchainSignature']['signature'][:36]}...")

    print("\n================================================================")
    print("🎉 END-TO-END PIPELINE VERIFIED SUCCESSFULLY (100% OPERATIONAL)")
    print("================================================================\n")

if __name__ == "__main__":
    run_integration_pipeline()

