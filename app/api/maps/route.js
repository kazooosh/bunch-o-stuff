// app/api/tournament/route.js
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'maps.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const maps = JSON.parse(fileContent);
    return NextResponse.json(maps);
  } catch (error) {
    console.error('Error reading maps data:', error);
    return NextResponse.json({ error: 'Failed to load map data' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const tournamentData = await req.json();
    const date = new Date().toISOString().split('T')[0];
    const fileName = `tournament_${date}.json`;
    const filePath = path.join(process.cwd(), 'data', fileName);
    
    // Save the tournament data with the date included
    await fs.writeFile(filePath, JSON.stringify({ ...tournamentData, date }, null, 2));
    
    // Also update the lastTournament.json file
    const lastTournamentPath = path.join(process.cwd(), 'data', 'lastTournament.json');
    await fs.writeFile(lastTournamentPath, JSON.stringify({ ...tournamentData, date }, null, 2));
    return NextResponse.json({ message: 'Tournament data saved successfully', fileName });
  } catch (error) {
    console.error('Error saving tournament data:', error);
    return NextResponse.json({ error: 'Failed to save tournament data' }, { status: 500 });
  }
}
