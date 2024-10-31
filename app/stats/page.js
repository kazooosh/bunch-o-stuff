// app/stats/page.js
'use client';

import { useState, useEffect } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement
);

export default function StatsPage() {
  const [tournamentsData, setTournamentsData] = useState([]);

  useEffect(() => {
    async function fetchTournamentData() {
      const response = await fetch('/api/tournaments');
      const data = await response.json();
      setTournamentsData(data);
    }
    fetchTournamentData();
  }, []);

  // Process data for visualizations
  const processData = () => {
    const mapWins = {};
    const pointsOverTime = {};
    const overallStats = { mapWins: {}, tournamentWins: {}, totalPoints: {} };
    const playerPlacementStats = {};
  
    tournamentsData.forEach((tournament) => {
      tournament.results.forEach((result) => {
        const winner = result.playerResults.find(pr => pr.position === 1);
        if (winner) {
          mapWins[winner.playerName] = (mapWins[winner.playerName] || 0) + 1;
          overallStats.mapWins[winner.playerName] = (overallStats.mapWins[winner.playerName] || 0) + 1;
        }
      });
  
      tournament.players.forEach((player) => {
        if (!pointsOverTime[player.name]) {
          pointsOverTime[player.name] = [];
        }
        pointsOverTime[player.name].push(player.totalScore);
  
        overallStats.totalPoints[player.name] = (overallStats.totalPoints[player.name] || 0) + player.totalScore;
  
        if (!playerPlacementStats[player.name]) {
          playerPlacementStats[player.name] = { 1: 0, 2: 0, 3: 0, 4: 0 };
        }
        player.positions.forEach((pos) => {
          playerPlacementStats[player.name][pos] = (playerPlacementStats[player.name][pos] || 0) + 1;
        });
      });
  
      const tournamentWinner = tournament.players.reduce((prev, current) => 
        (prev.totalScore > current.totalScore) ? prev : current
      );
      overallStats.tournamentWins[tournamentWinner.name] = (overallStats.tournamentWins[tournamentWinner.name] || 0) + 1;
    });
  
    // Convert data to Chart.js format
    const mapWinsData = {
      labels: Object.keys(mapWins),
      datasets: [{
        label: 'Map Wins',
        data: Object.values(mapWins),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      }]
    };
  
    const pointsOverTimeData = {
      labels: Array.from({ length: Math.max(...Object.values(pointsOverTime).map(arr => arr.length)) }, (_, i) => `Game ${i + 1}`),
      datasets: Object.entries(pointsOverTime).map(([player, points]) => ({
        label: player,
        data: points,
        fill: false,
        borderColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
      }))
    };
  
    const overallStatsData = {
      labels: Object.keys(overallStats.mapWins),
      datasets: [
        {
          label: 'Map Wins',
          data: Object.values(overallStats.mapWins),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        },
        {
          label: 'Tournament Wins',
          data: Object.values(overallStats.tournamentWins),
          backgroundColor: 'rgba(153, 102, 255, 0.6)',
        },
        {
          label: 'Total Points',
          data: Object.values(overallStats.totalPoints),
          backgroundColor: 'rgba(255, 159, 64, 0.6)',
        }
      ]
    };
  
    const playerPlacementStatsData = {};
    Object.entries(playerPlacementStats).forEach(([player, placements]) => {
      playerPlacementStatsData[player] = {
        labels: ['1st', '2nd', '3rd', '4th'],
        datasets: [{
          label: 'Placements',
          data: [placements[1], placements[2], placements[3], placements[4]],
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
        }]
      };
    });
  
    return {
      mapWins: mapWinsData,
      pointsOverTime: pointsOverTimeData,
      overallStats: overallStatsData,
      playerPlacementStats: playerPlacementStatsData,
    };
  };

  const { mapWins, pointsOverTime, overallStats, playerPlacementStats } = processData();

  return (
    <div>
      <h1>Tournament Statistics</h1>
      
      <h2>Map Wins per Player</h2>
      <Bar data={mapWins} />

      <h2>Points Over Time</h2>
      <Line data={pointsOverTime} />

      <h2>Overall Statistics</h2>
      <Bar data={overallStats} />

      <h2>Player Placement Statistics</h2>
      {Object.entries(playerPlacementStats).map(([player, data]) => (
        <div key={player}>
          <h3>{player}</h3>
          <Bar data={data} />
        </div>
      ))}
    </div>
  );
}
