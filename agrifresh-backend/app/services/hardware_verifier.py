import json
from eth_account import Account
from eth_account.messages import encode_defunct
from typing import Dict, Any, Tuple

def canonical_payload_string(telemetry: Dict[str, Any], batch_id: int, timestamp: int) -> str:
    """
    Produces deterministic string of sensor readings for signature recovery.
    """
    sorted_dict = {
        "batchId": batch_id,
        "timestamp": timestamp,
        "telemetry": telemetry
    }
    return json.dumps(sorted_dict, sort_keys=True, separators=(',', ':'))

def verify_hardware_signature(payload: Dict[str, Any]) -> Tuple[bool, str]:
    """
    Verifies that the telemetry payload was signed by the claimed device address.
    Payload shape:
    {
      "batchId": 1,
      "timestamp": 1773228900,
      "telemetry": {
        "temp": 9.4,
        "humidity": 82.1,
        "ethylenePpm": 18.2,
        "lat": 23.5256,
        "lng": 77.8081
      },
      "deviceAddress": "0x4b20993bc481177ec7e8f571cecae8a9e22c02db",
      "signature": "0x..."
    }
    """
    try:
        telemetry = payload.get("telemetry", {})
        batch_id = payload.get("batchId", 0)
        timestamp = payload.get("timestamp", 0)
        device_address = payload.get("deviceAddress", "").lower()
        signature_hex = payload.get("signature", "")

        msg_str = canonical_payload_string(telemetry, batch_id, timestamp)
        message = encode_defunct(text=msg_str)
        recovered_address = Account.recover_message(message, signature=signature_hex).lower()

        is_valid = recovered_address == device_address
        return is_valid, recovered_address
    except Exception as e:
        return False, str(e)

