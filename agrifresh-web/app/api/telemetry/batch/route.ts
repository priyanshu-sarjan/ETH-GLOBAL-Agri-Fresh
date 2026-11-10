import { NextResponse } from 'next/server';
import { keccak256, toHex } from 'viem';

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const batchId = url.searchParams.get('batch_id') || '1';

    // Simulated 15-minute readings bundled into Merkle Root
    const readings = [
      { temp: 4.8, humidity: 82.1, ethylene: 14.2, timestamp: Date.now() - 900000 },
      { temp: 4.9, humidity: 81.8, ethylene: 14.4, timestamp: Date.now() - 600000 },
      { temp: 5.1, humidity: 82.5, ethylene: 14.6, timestamp: Date.now() - 300000 },
      { temp: 4.8, humidity: 82.0, ethylene: 14.3, timestamp: Date.now() }
    ];

    const leafHashes = readings.map(r => keccak256(toHex(JSON.stringify(r))));
    const merkleRoot = keccak256(toHex(leafHashes.join('')));
    const ipfsCid = `QmAgriFresh${merkleRoot.slice(2, 34)}`;

    return NextResponse.json({
      batchId: Number(batchId),
      merkleRoot,
      ipfsCid,
      ipfsUrl: `https://gateway.pinata.cloud/ipfs/${ipfsCid}`,
      readingsBundled: readings.length,
      timestamp: Date.now()
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
