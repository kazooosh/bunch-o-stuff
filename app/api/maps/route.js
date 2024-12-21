// app/api/maps/route.js
import { NextResponse } from 'next/server';
import db from '../../utils/db';

export async function GET() {
  try {
    const result = await db.query('SELECT * FROM maps');
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error reading maps data:', error);
    return NextResponse.json({ error: 'Failed to load map data' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const mapData = await req.json();

    if (!mapData.name) {
      return NextResponse.json({ error: 'Map name is required' }, { status: 400 });
    }

    const query = `
      INSERT INTO maps (name, played)
      VALUES ($1, $2)
      RETURNING *
    `;

    const values = [mapData.name, mapData.played || false];
    const result = await db.query(query, values);

    return NextResponse.json({ message: 'Map data saved successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Error saving map data:', error);
    return NextResponse.json({ error: 'Failed to save map data' }, { status: 500 });
  }
}