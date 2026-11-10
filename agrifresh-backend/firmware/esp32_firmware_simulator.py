"""
ESP32 MicroPython / ESP-IDF Telemetry Firmware Simulator
Simulates hardware sensor reads (DHT22 Temp/Humidity, MQ-135 Ethylene/Gas, GPS Neo-6M)
and cryptographic on-chip secp256k1 ECDSA signing using embedded device key.
"""
import time
import json
import random
from eth_account import Account
from eth_account.messages import encode_defunct

# Hardware embedded device private key (stored in secure ESP32 NVS partition)
DEVICE_PRIVATE_KEY = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
device_account = Account.from_key(DEVICE_PRIVATE_KEY)

def read_hardware_sensors(is_anomaly: bool = False):
    """
    Simulates ADC reads from DHT22, MQ-135, and UART NMEA GPS sentences
    """
    if not is_anomaly:
        temp = round(random.uniform(3.5, 6.2), 1)       # Safe cold chain: 2°C - 8°C
        humidity = round(random.uniform(75.0, 84.5), 1)
        ethylene = round(random.uniform(5.0, 14.5), 1)   # Low ppm
    else:
        # Refrigerator failure simulation
        temp = round(random.uniform(12.8, 16.5), 1)     # Critical spike!
        humidity = round(random.uniform(91.0, 96.0), 1)
        ethylene = round(random.uniform(28.0, 42.0), 1)  # High rot-inducing ppm

    # Moving GPS route between Farm (Nashik/Pune) and Mumbai Cold Hub
    lat = round(19.9975 + random.uniform(-0.05, 0.05), 4)
    lng = round(73.7898 + random.uniform(-0.05, 0.05), 4)

    return {
        "temp": temp,
        "humidity": humidity,
        "ethylenePpm": ethylene,
        "lat": lat,
        "lng": lng
    }

def generate_signed_reading(batch_id: int = 1, is_anomaly: bool = False):
    timestamp = int(time.time())
    telemetry = read_hardware_sensors(is_anomaly)

    sorted_dict = {
        "batchId": batch_id,
        "timestamp": timestamp,
        "telemetry": telemetry
    }
    canonical_str = json.dumps(sorted_dict, sort_keys=True, separators=(',', ':'))
    message = encode_defunct(text=canonical_str)
    signed = device_account.sign_message(message)

    payload = {
        "batchId": batch_id,
        "timestamp": timestamp,
        "telemetry": telemetry,
        "deviceAddress": device_account.address,
        "signature": signed.signature.hex()
    }
    return payload

if __name__ == "__main__":
    print("=== ESP32 Telemetry Hardware Simulation ===")
    print(f"Device Node Address: {device_account.address}")
    sample = generate_signed_reading(batch_id=1, is_anomaly=False)
    print("Generated Hardware Reading:\n", json.dumps(sample, indent=2))

