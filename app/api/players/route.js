import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req) {
  try {
    const { players } = await req.json();
    const filePath = path.join(process.cwd(), 'data', 'players.json');
    await fs.writeFile(filePath, JSON.stringify({ players }, null, 2));
    return NextResponse.json({ message: 'Player data updated successfully' });
  } catch (error) {
    console.error('Error updating player data:', error);
    return NextResponse.json({ error: 'Failed to update player data' }, { status: 500 });
  }
}
