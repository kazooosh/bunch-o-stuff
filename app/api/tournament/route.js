// app/api/tournament/route.js
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const data = await request.json();
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const fileName = `tournament_${timestamp}.json`;
    const filePath = path.join(process.cwd(), 'data', fileName);
    
    // Ensure the data directory exists
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }

    // Write the data to the new file
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    return NextResponse.json({ message: 'Tournament data saved successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error saving tournament data:', error);
    return NextResponse.json({ message: `Error saving tournament data: ${error.message}` }, { status: 500 });
  }
}
