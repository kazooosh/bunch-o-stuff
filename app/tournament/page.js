"use client";

import React, { useState } from 'react';

const maps = [
    "SNES Mario Circuit 3",
    "SNES Bowser Castle 3",
    "SNES Donut Plains 3",
    "SNES Rainbow Road",
    "N64 Kalimari Desert",
    "N64 Toad's Turnpike",
    "N64 Choco Mountain",
    "N64 Royal Raceway",
    "N64 Yoshi Valley",
    "N64 Rainbow Road",
    "GBA Riverside Park",
    "GBA Mario Circuit",
    "GBA Boo Lake",
    "GBA Cheese Land",
    "GBA Sky Garden",
    "GBA Sunset Wilds",
    "GBA Snow Land",
    "GBA Ribbon Road",
    "GCN Baby Park",
    "GCN Dry Dry Desert",
    "GCN Daisy Cruiser",
    "GCN Waluigi Stadium",
    "GCN Sherbet Land",
    "GCN Yoshi Circuit",
    "GCN DK Mountain",
    "DS Cheep Cheep Beach",
    "DS Waluigi Pinball",
    "DS Shroom Ridge",
    "DS Tick-Tock Clock",
    "DS Mario Circuit",
    "DS Wario Stadium",
    "DS Peach Gardens",
    "Wii Moo Moo Meadows",
    "Wii Mushroom Gorge",
    "Wii Coconut Mall",
    "Wii DK Summit",
    "Wii Wario's Gold Mine",
    "Wii Daisy Circuit",
    "Wii Koopa Cape",
    "Wii Maple Treeway",
    "Wii Grumble Volcano",
    "Wii Moonview Highway",
    "Wii Rainbow Road",
    "3DS Toad Circuit",
    "3DS Music Park",
    "3DS Rock Rock Mountain",
    "3DS Piranha Plant Slide",
    "3DS Neo Bowser City",
    "3DS DK Jungle",
    "3DS Rosalina's Ice World",
    "3DS Rainbow Road",
    "Mario Kart Stadium",
    "Water Park",
    "Sweet Sweet Canyon",
    "Twomp Ruins",
    "Mario Circuit",
    "Toad Harbor",
    "Twisted Mansion",
    "Shy Guy Falls",
    "Sunshine Airport",
    "Dolphin Shoals",
    "Electrodrome",
    "Mount Wario",
    "Cloudtop Cruise",
    "Bone-Dry Dunes",
    "Bowser's Castle",
    "Rainbow Road",
    "Excitebike Arena",
    "Dragon Driftway",
    "Mute City",
    "Ice Ice Outpost",
    "Hyrule Circuit",
    "Wild Woods",
    "Animal Crossing",
    "Super Bell Subway",
    "Big Blue",
    "Merry Mountain",
    "Ninja Hideaway",
    "Sky-High Sundae",
    "Piranha Plant Cove",
    "Yoshi's Island",
    "Squeaky Clean Sprint"
];

const Tournament = () => {
  const [selectedMaps, setSelectedMaps] = useState(maps.map(() => true));
  const [numMaps, setNumMaps] = useState(12);
  const [players, setPlayers] = useState([]);
  const [newPlayer, setNewPlayer] = useState('');
  const [playedMaps, setPlayedMaps] = useState([]);
  const [results, setResults] = useState([]);

  const toggleMap = (index) => {
    const newSelectedMaps = [...selectedMaps];
    newSelectedMaps[index] = !newSelectedMaps[index];
    setSelectedMaps(newSelectedMaps);
  };

  const addPlayer = () => {
    if (newPlayer.trim()) {
      setPlayers([...players, { name: newPlayer.trim(), results: [] }]);
      setNewPlayer('');
    }
  };

  const selectRandomMaps = () => {
    const availableMaps = maps.filter((_, i) => selectedMaps[i]);
    const shuffled = availableMaps.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, numMaps);
    setPlayedMaps(selected);

    const newSelectedMaps = [...selectedMaps];
    selected.forEach(map => {
      const index = maps.indexOf(map);
      newSelectedMaps[index] = false;
    });
    setSelectedMaps(newSelectedMaps);
  };

  const updateResult = (mapIndex, playerIndex, position) => {
    const newResults = [...results];
    if (!newResults[mapIndex]) {
      newResults[mapIndex] = Array(players.length).fill(0);
    }
    newResults[mapIndex][playerIndex] = position;
    setResults(newResults);
  };

  const calculateFinalResults = () => {
    const finalResults = players.map(player => ({
      name: player.name,
      positions: [0, 0, 0, 0]
    }));

    results.forEach(mapResult => {
      mapResult.forEach((position, playerIndex) => {
        if (position > 0) {
          finalResults[playerIndex].positions[position - 1]++;
        }
      });
    });

    finalResults.sort((a, b) => {
      for (let i = 0; i < 4; i++) {
        if (a.positions[i] !== b.positions[i]) {
          return b.positions[i] - a.positions[i];
        }
      }
      return 0;
    });

    return finalResults;
  };

  const resetTournament = () => {
    if (window.confirm('Are you sure you want to reset the tournament?')) {
      setSelectedMaps(maps.map(() => true));
      setPlayers([]);
      setPlayedMaps([]);
      setResults([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8">Mario Kart 8 Tournament</h1>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Map Selection</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {maps.map((map, index) => (
            <div key={map} className="flex items-center">
              <input
                type="checkbox"
                id={`map-${index}`}
                checked={selectedMaps[index]}
                onChange={() => toggleMap(index)}
                className="mr-2"
              />
              <label htmlFor={`map-${index}`}>{map}</label>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Number of Maps</h2>
        <input
          type="range"
          min={4}
          max={20}
          step={2}
          value={numMaps}
          onChange={(e) => setNumMaps(parseInt(e.target.value))}
          className="w-full max-w-xs"
        />
        <span className="ml-4">{numMaps} maps</span>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Players</h2>
        <div className="flex items-center mb-4">
          <input
            type="text"
            value={newPlayer}
            onChange={(e) => setNewPlayer(e.target.value)}
            placeholder="Enter player name"
            className="mr-4 p-2 bg-gray-800 text-white"
          />
          <button onClick={addPlayer} className="bg-blue-500 text-white px-4 py-2 rounded">Add Player</button>
        </div>
        <ul>
          {players.map((player, index) => (
            <li key={index}>{player.name}</li>
          ))}
        </ul>
      </div>

      <div className="mb-8">
        <button onClick={selectRandomMaps} className="bg-green-500 text-white px-4 py-2 rounded">Select Random Maps</button>
      </div>

      {playedMaps.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Played Maps</h2>
          <ul>
            {playedMaps.map((map, mapIndex) => (
              <li key={mapIndex} className="mb-4">
                <h3 className="text-xl font-semibold">{map}</h3>
                <div className="grid grid-cols-4 gap-4 mt-2">
                  {players.map((player, playerIndex) => (
                    <div key={playerIndex}>
                      <span>{player.name}: </span>
                      <select
                        value={results[mapIndex]?.[playerIndex] || 0}
                        onChange={(e) => updateResult(mapIndex, playerIndex, parseInt(e.target.value))}
                        className="bg-gray-800 text-white p-1"
                      >
                        <option value={0}>-</option>
                        <option value={1}>1st</option>
                        <option value={2}>2nd</option>
                        <option value={3}>3rd</option>
                        <option value={4}>4th</option>
                      </select>
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Final Results</h2>
        <ul>
          {calculateFinalResults().map((result, index) => (
            <li key={index} className="mb-2">
              {result.name}: 1st: {result.positions[0]}, 2nd: {result.positions[1]}, 3rd: {result.positions[2]}, 4th: {result.positions[3]}
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-8">
        <button onClick={resetTournament} className="bg-red-500 text-white px-4 py-2 rounded">Reset Tournament</button>
      </div>
    </div>
  );
};

export default Tournament;