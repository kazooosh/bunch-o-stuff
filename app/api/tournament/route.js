// app/api/tournament/route.js
import { NextResponse } from 'next/server';
import db from '../../utils/db';

export async function GET() {
  try {
    const res = await db.query('SELECT * FROM tournaments ORDER BY date DESC');
    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Error fetching tournaments data:', error);
    // Include the actual error message for more comprehensive debugging
    return NextResponse.json({ error: 'Failed to load tournaments data', details: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    // Ensure the request is correctly formatted
    const tournamentData = await req.json();
    
    // Validate the incoming data structure if needed
    if (!tournamentData.players || !tournamentData.maps || !tournamentData.results) {
      return NextResponse.json({ error: 'Invalid tournament data structure' }, { status: 400 });
    }

    const date = new Date().toISOString().split('T')[0];
    const query = `
      INSERT INTO tournaments (data, date)
      VALUES ($1, $2)
      RETURNING *
    `;
    const values = [JSON.stringify(tournamentData), date];
    const res = await db.query(query, values);

    return NextResponse.json({ message: 'Tournament data saved successfully', data: res.rows[0] });
  } catch (error) {
    console.error('Error saving tournament data:', error);
    // Include the actual error message for debugging
    return NextResponse.json({ error: 'Failed to save tournament data', details: error.message }, { status: 500 });
  }
}