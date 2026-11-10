import { NextResponse } from 'next/server';
import { encodePacked, keccak256 } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

const TEST_AGENT_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const DEFAULT_ESCROW = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const batchId = BigInt(body.batchId || 1);
    const imageName = (body.imageName || '').toLowerCase();
    const cumulativeSpikeHours = parseFloat(body.cumulativeTempSpikeHours || 0);
    const ethyleneAvgPpm = parseFloat(body.ethyleneAvgPpm || 14.0);
    const escrowAddress = (body.escrowAddress || DEFAULT_ESCROW) as `0x${string}`;

    let visualScore = 18.5;
    if (imageName.includes('rot') || imageName.includes('spoil')) {
      visualScore = 68.0;
    } else if (imageName.includes('fresh')) {
      visualScore = 8.0;
    }

    const tempPenalty = Math.min(cumulativeSpikeHours * 6.5, 30.0);
    const ethylenePenalty = ethyleneAvgPpm > 15.0 ? (ethyleneAvgPpm - 15.0) * 1.8 : 0.0;
    const combinedScore = Math.min(100, Math.round(visualScore + tempPenalty + ethylenePenalty));

    let verdict = 'PASSED_GRADE_A';
    if (combinedScore >= 50) {
      verdict = 'SLA_BREACH_SPOILED';
    } else if (combinedScore >= 30) {
      verdict = 'MARKET_DISCOUNT_GRADE_B';
    }

    const account = privateKeyToAccount(TEST_AGENT_KEY);

    const packedData = encodePacked(
      ['uint256', 'uint8', 'address'],
      [batchId, combinedScore, escrowAddress]
    );
    const packedHash = keccak256(packedData);

    const signature = await account.signMessage({
      message: { raw: packedHash }
    });

    return NextResponse.json({
      batchId: Number(batchId),
      evaluation: {
        visualScore,
        cumulativeSpikeHours,
        ethyleneAvgPpm,
        finalSpoilageScorePercentage: combinedScore,
        verdict,
        recommendation: combinedScore < 50 ? 'Release full payment' : 'Slash transporter collateral, refund buyer, distress pay farmer.'
      },
      cryptographicProof: {
        batchId: Number(batchId),
        spoilageScore: combinedScore,
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
