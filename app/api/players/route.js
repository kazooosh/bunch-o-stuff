// app/api/players/route.js
import { NextResponse } from 'next/server';
import db from '../../utils/db';

export async function GET() {
  try {
    const res = await db.query('SELECT * FROM players');
    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Error fetching players data:', error);
    return NextResponse.json({ error: 'Failed to load players data' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const player = await req.json();
    console.log('Received player data:', player);
    if (!player.name) {
      throw new Error('Player name is missing');
    }
    await db.query('INSERT INTO players (name, score) VALUES ($1, $2)', [player.name, player.score]);
    
    return NextResponse.json({ message: 'Player data saved successfully' });
  } catch (error) {
    console.error('Error saving player data:', error);
    return NextResponse.json({ error: 'Failed to save player data' }, { status: 500 });
  }
}