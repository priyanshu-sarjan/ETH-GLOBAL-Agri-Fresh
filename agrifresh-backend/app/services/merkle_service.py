import hashlib
import json
from typing import List, Dict, Any, Tuple

def sha256_hash(data: bytes) -> bytes:
    return hashlib.sha256(data).digest()

def hash_reading(reading: Dict[str, Any]) -> bytes:
    canonical = json.dumps(reading, sort_keys=True).encode('utf-8')
    return sha256_hash(canonical)

class MerkleTree:
    """
    Merkle Tree implementation for bundling IoT telemetry readings.
    """
    def __init__(self, readings: List[Dict[str, Any]]):
        self.readings = readings
        self.leaves = [hash_reading(r) for r in readings]
        if not self.leaves:
            self.root = hashlib.sha256(b"empty_agrifresh_tree").digest()
            self.layers = [[self.root]]
        else:
            self.layers = self._build_tree(self.leaves)
            self.root = self.layers[-1][0]

    def _build_tree(self, leaves: List[bytes]) -> List[List[bytes]]:
        layers = [leaves]
        current = leaves
        while len(current) > 1:
            next_layer = []
            for i in range(0, len(current), 2):
                left = current[i]
                right = current[i + 1] if i + 1 < len(current) else left
                combined = sha256_hash(left + right)
                next_layer.append(combined)
            layers.append(next_layer)
            current = next_layer
        return layers

    @property
    def root_hex(self) -> str:
        return "0x" + self.root.hex()

    def get_proof(self, index: int) -> List[str]:
        proof = []
        for layer in self.layers[:-1]:
            is_right = index % 2 == 1
            sibling_index = index - 1 if is_right else index + 1
            if sibling_index < len(layer):
                proof.append("0x" + layer[sibling_index].hex())
            else:
                proof.append("0x" + layer[index].hex())
            index //= 2
        return proof

def verify_merkle_proof(leaf_hash: bytes, proof: List[str], root_hex: str) -> bool:
    current = leaf_hash
    for p in proof:
        sibling = bytes.fromhex(p[2:] if p.startswith("0x") else p)
        # Sort pairs for commutative tree or keep orientation
        if current < sibling:
            current = sha256_hash(current + sibling)
        else:
            current = sha256_hash(sibling + current)
    return ("0x" + current.hex()) == root_hex

