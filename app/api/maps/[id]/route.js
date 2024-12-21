// app/api/maps/[id].js
import { NextResponse } from 'next/server';
import db from '../../../utils/db';

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const { played } = await req.json();

    if (typeof played !== 'boolean') {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    const result = await db.query(
      'UPDATE maps SET played = $1 WHERE id = $2 RETURNING *',
      [played, id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Map not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Map updated successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Error updating map:', error);
    return NextResponse.json({ error: `Failed to update map: ${error.message}` }, { status: 500 });
  }
}