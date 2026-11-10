import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'online',
    protocol: 'Agrovia / AgriFresh Core v1.0',
    network: 'Base Sepolia (EVM L2)',
    escrowAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    agentAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    platform: 'Vercel Serverless Edge Runtime'
  });
}
