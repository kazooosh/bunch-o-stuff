import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req) {
  try {
    const tournamentData = await req.json();
    const filePath = path.join(process.cwd(), 'data', 'lastTournament.json');
    await fs.writeFile(filePath, JSON.stringify(tournamentData, null, 2));
    return NextResponse.json({ message: 'Tournament data saved successfully' });
  } catch (error) {
    console.error('Error saving tournament data:', error);
    return NextResponse.json({ error: 'Failed to save tournament data' }, { status: 500 });
  }
}
