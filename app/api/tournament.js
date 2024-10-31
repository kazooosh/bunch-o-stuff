import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method === 'POST') {
    console.log('Received POST request:', req.body);
    try {
      const data = req.body;
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

      res.status(200).json({ message: 'Tournament data saved successfully' });
    } catch (error) {
      console.error('Error saving tournament data:', error);
      res.status(500).json({ message: `Error saving tournament data: ${error.message}` });
    }
  } else if (req.method === 'GET') {
    try {
      const dataDir = path.join(process.cwd(), 'data');
      const files = fs.readdirSync(dataDir);
      const latestFile = files
        .filter(file => file.startsWith('tournament_') && file.endsWith('.json'))
        .sort()
        .pop();

      if (latestFile) {
        const filePath = path.join(dataDir, latestFile);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(fileContent);
        res.status(200).json(data);
      } else {
        res.status(200).json({ players: [] });
      }
    } catch (error) {
      console.error('Error reading tournament data:', error);
      res.status(500).json({ error: 'Failed to load tournament data' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}