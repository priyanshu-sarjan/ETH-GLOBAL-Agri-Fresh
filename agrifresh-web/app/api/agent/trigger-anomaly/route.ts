import { NextResponse } from 'next/server';
import { encodePacked, keccak256 } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

const TEST_AGENT_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const DEFAULT_ESCROW = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const batchId = BigInt(body.batchId || 1);
    const observedTemp = body.observedTemp || 14.8;
    const reason = body.reason || 'Refrigeration Compressor Circuit Breaker Trip';
    const escrowAddress = (body.escrowAddress || DEFAULT_ESCROW) as `0x${string}`;

    // Spoilage calculation: 14.8°C spike triggers severe rot
    const finalSpoilageScorePercentage = 95;

    const account = privateKeyToAccount(TEST_AGENT_KEY);

    // keccak256(abi.encodePacked(batchId, spoilageScorePercentage, contractAddress))
    const packedData = encodePacked(
      ['uint256', 'uint8', 'address'],
      [batchId, finalSpoilageScorePercentage, escrowAddress]
    );
    const packedHash = keccak256(packedData);

    const signature = await account.signMessage({
      message: { raw: packedHash }
    });

    return NextResponse.json({
      batchId: Number(batchId),
      anomalyFlagged: true,
      observedTemp,
      reason,
      aiVerdict: {
        visualScore: 68.0,
        cumulativeSpikeHours: 4.8,
        ethyleneAvgPpm: 24.5,
        finalSpoilageScorePercentage,
        verdict: 'SLA_BREACH_SPOILED',
        recommendation: 'Slash transporter collateral, refund buyer, distress pay farmer.'
      },
      onchainSignature: {
        batchId: Number(batchId),
        spoilageScore: finalSpoilageScorePercentage,
        contractAddress: escrowAddress,
        packedDataHash: packedHash,
        signerAddress: account.address,
        signature
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
