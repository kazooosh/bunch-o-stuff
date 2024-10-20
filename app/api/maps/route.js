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
    const maps = await req.json();
    const filePath = path.join(process.cwd(), 'data', 'maps.json');
    await fs.writeFile(filePath, JSON.stringify(maps, null, 2));
    return NextResponse.json({ message: 'Maps data saved successfully' });
  } catch (error) {
    console.error('Error saving maps data:', error);
    return NextResponse.json({ error: 'Failed to save map data' }, { status: 500 });
  }
}
