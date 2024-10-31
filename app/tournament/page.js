"use client";

import React, { useState, useEffect } from 'react';

const MedalIcon = ({ place }) => {
  const colors = {
    1: 'text-yellow-400',
    2: 'text-gray-400',
    3: 'text-yellow-600',
  };
  return (
    <svg className={`w-5 h-5 ${colors[place] || 'text-gray-600'} inline-block mr-1`} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
  );
};

const Tournament = () => {
  const [mapData, setMapData] = useState([]);
  const [selectedMaps, setSelectedMaps] = useState([]);
  const [numMaps, setNumMaps] = useState(12);
  const [players, setPlayers] = useState([]);
  const [playedMaps, setPlayedMaps] = useState([]);
  const [results, setResults] = useState([]);
  const [isMapSelectionOpen, setIsMapSelectionOpen] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPlayers() {
      try {
        const response = await fetch('/api/tournament');
        if (!response.ok) {
          throw new Error('Failed to fetch players');
        }
        const data = await response.json();
        setPlayers(Array.isArray(data.players) ? data.players : []);
      } catch (error) {
        console.error('Error fetching players:', error);
        setPlayers([]);
      } finally {
        setIsLoading(false);
      }
    }
  
    fetchPlayers();

    loadMapData();
    loadPlayers();
  }, []);

  const loadMapData = async () => {
    try {
      const response = await fetch('/api/maps');
      const data = await response.json();
      setMapData(data);
      setSelectedMaps(data.map(map => !map.played));
    } catch (error) {
      console.error('Failed to load map data:', error);
    }
  };

  const loadPlayers = async () => {
    try {
      const response = await fetch('/api/tournament');
      const data = await response.json();
      setPlayers(data.players);
    } catch (error) {
      console.error('Failed to load player data:', error);
    }
  };

  const toggleMap = async (index) => {
    const newMapData = [...mapData];
    newMapData[index].played = !selectedMaps[index];
    setMapData(newMapData);

    const newSelectedMaps = [...selectedMaps];
    newSelectedMaps[index] = !newSelectedMaps[index];
    setSelectedMaps(newSelectedMaps);

    try {
      const response = await fetch('/api/maps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMapData),
      });

      if (!response.ok) {
        throw new Error('Failed to update map data');
      }
    } catch (error) {
      console.error('Error updating map data:', error);
      alert('Failed to update map data');
    }

    saveTournamentData();
  };

  const resetMaps = async (played) => {
    const newMapData = mapData.map(map => ({ ...map, played }));
    setMapData(newMapData);
    setSelectedMaps(newMapData.map(map => !map.played));

    try {
      const response = await fetch('/api/maps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMapData),
      });

      if (response.ok) {
        alert(played ? 'All maps set as played' : 'All maps reset');
      } else {
        throw new Error('Failed to update map data');
      }
    } catch (error) {
      console.error('Error updating map data:', error);
      alert('Failed to update map data');
    }
  };
  
  function addPlayer(event) {
    console.log('addPlayer function called');
    event.preventDefault();
    
    // Get the player name from the input field
    const playerNameInput = event.target.elements.playerName;
    const playerName = playerNameInput.value.trim();
    console.log('Player name:', playerName);
  
    if (playerName) {
      const currentPlayers = Array.isArray(players) ? players : [];
      const newPlayers = [...currentPlayers, { name: playerName, score: 0 }];
      setPlayers(newPlayers);
      
      // Clear the input field
      playerNameInput.value = '';
      
      console.log('New players after adding:', newPlayers);
      console.log('Player added locally. Use Save Tournament Data to persist changes.');
    } else {
      console.log('Player name is empty');
    }
  }

  async function saveTournamentData() {
    try {
      const response = await fetch('/api/tournament', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ players, playedMaps, results }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to save tournament data');
      }
  
      const result = await response.json();
      console.log(result.message);
    } catch (error) {
      console.error('Error saving tournament data:', error);
    }
  }

  const selectRandomMaps = () => {
    if (window.confirm('Are you sure you want to generate new maps? This will clear current player stats.')) {
      const availableMaps = mapData.filter((_, i) => selectedMaps[i]);
      const shuffled = availableMaps.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, numMaps);
      setPlayedMaps(selected);
      setResults([]);

      const newMapData = [...mapData];
      newMapData.forEach(map => {
        map.played = selected.some(selectedMap => selectedMap.name === map.name);
      });
      setMapData(newMapData);
      setSelectedMaps(newMapData.map(map => !map.played));
    }
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
    const scoreSystem = [15, 12, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

    const finalResults = players && players.length > 0
      ? players.map(player => ({
          name: player.name,
          positions: Array(players.length).fill(0),
          totalScore: 0
        }))
      : [];
  
    results.forEach(mapResult => {
      mapResult.forEach((position, playerIndex) => {
        if (position > 0) {
          finalResults[playerIndex].positions[position - 1]++;
          finalResults[playerIndex].totalScore += scoreSystem[position - 1] || 0;
        }
      });
    });
  
    finalResults.sort((a, b) => b.totalScore - a.totalScore);
  
    return finalResults;
  };

  const resetTournament = () => {
    if (window.confirm('Are you sure you want to reset the tournament?')) {
      setSelectedMaps(mapData.map(() => true));
      setPlayers([]);
      setPlayedMaps([]);
      setResults([]);
    }
  };

  const getPlayedMapsOutput = () => {
    return playedMaps.map((map, index) => `${index + 1}\t${map.name}`).join('\n');
  };

  const getDetailedResultsOutput = () => {
    let output = "Map\t" + players.map(p => p.name).join('\t') + '\n';
    output += playedMaps.map((map, mapIndex) => {
      const mapResults = results[mapIndex] || [];
      const playerResults = players.map((_, playerIndex) => mapResults[playerIndex] || '');
      return `${map.name}\t${playerResults.join('\t')}`;
    }).join('\n');
    return output;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 text-white p-4 sm:p-6 md:p-8">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8 md:mb-10 text-center">Mario Kart 8 Tournaments</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white bg-opacity-10 rounded-lg p-4 sm:p-6">
            <button 
              onClick={() => setIsMapSelectionOpen(!isMapSelectionOpen)}
              className="w-full sm:w-auto bg-indigo-600 text-white px-4 py-2 rounded-full mb-4 hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {isMapSelectionOpen ? 'Hide Map Selection' : 'Show Map Selection'}
            </button>
            {isMapSelectionOpen && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                  {mapData.map((map, index) => (
                    <div key={map.name} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`map-${index}`}
                        checked={selectedMaps[index]}
                        onChange={() => toggleMap(index)}
                        className="mr-2 form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                      />
                      <label 
                        htmlFor={`map-${index}`}
                        className={`text-sm ${selectedMaps[index] ? 'text-white' : 'text-gray-400'}`}
                      >
                        {map.name}
                      </label>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button 
                    onClick={() => resetMaps(false)}
                    className="bg-green-600 text-white px-3 py-1 text-sm rounded-full hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    Reset All Maps
                  </button>
                  <button 
                    onClick={() => resetMaps(true)}
                    className="bg-yellow-600 text-white px-3 py-1 text-sm rounded-full hover:bg-yellow-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                  >
                    Set All Maps Played
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="bg-white bg-opacity-10 rounded-lg p-4 sm:p-6">
            <h2 className="text-xl font-semibold mb-4">Number of Maps</h2>
            <input
              type="range"
              min={4}
              max={20}
              step={2}
              value={numMaps}
              onChange={(e) => setNumMaps(parseInt(e.target.value))}
              className="w-full max-w-xs accent-indigo-600"
            />
            <span className="ml-4">{numMaps} maps</span>
          </div>

          <div className="bg-white bg-opacity-10 rounded-lg p-4 sm:p-6">
            <h2 className="text-xl font-semibold mb-4">Players</h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4">
              <form onSubmit={addPlayer}>
                <input
                  type="text"
                  name="playerName"
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter player name"
                  className="mb-2 sm:mb-0 sm:mr-4 p-2 bg-white bg-opacity-20 text-white w-full sm:w-auto rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                <button 
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-full w-full sm:w-auto hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                    Add Player
                </button>
              </form>
            </div>
            {isLoading ? (
              <p>Loading tournament data...</p>
            ) : players && players.length > 0 ? (
              <ul className="list-disc list-inside">
                {players.map((player, index) => (
                  <li key={index}>{player.name}</li>
                ))}
              </ul>
            ) : (
              <p>No players found in the latest tournament.</p>
            )}
          </div>

          <button 
            onClick={selectRandomMaps}
            className="w-full bg-indigo-600 text-white px-6 py-3 rounded-full text-lg hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Select Random Maps
          </button>
        </div>

        <div className="space-y-6">
          {playedMaps.length > 0 && (
            <div className="bg-white bg-opacity-10 rounded-lg p-4 sm:p-6">
              <h2 className="text-xl font-semibold mb-4">Played Maps</h2>
              <ul className="space-y-4 overflow-y-auto">
                {playedMaps.map((map, mapIndex) => (
                  <li key={mapIndex} className="bg-white bg-opacity-5 p-3 rounded-lg">
                    <h3 className="text-lg font-semibold">{mapIndex + 1}. {map.name}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      {players.map((player, playerIndex) => (
                        <div key={playerIndex} className="flex items-center">
                          <span className="mr-2 text-sm">{player.name}:</span>
                          <select
                            value={results[mapIndex]?.[playerIndex] || 0}
                            onChange={(e) => updateResult(mapIndex, playerIndex, parseInt(e.target.value))}
                            className="bg-white bg-opacity-20 text-white p-1 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value={0}>-</option>
                            {Array.from({length: players.length}, (_, i) => i + 1)
                              .filter(place => !results[mapIndex] || !results[mapIndex].includes(place) || results[mapIndex][playerIndex] === place)
                              .map(place => (
                                <option key={place} value={place}>
                                  {place}{place === 1 ? 'st' : place === 2 ? 'nd' : place === 3 ? 'rd' : 'th'}
                                </option>
                              ))
                            }
                          </select>
                        </div>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-white bg-opacity-10 rounded-lg p-4 sm:p-6">
            <h2 className="text-xl font-semibold mb-4">Final Results</h2>
            <ul className="space-y-2">
              {calculateFinalResults().map((result, index) => (
                <li key={index} className="flex flex-wrap items-center">
                  <span className="mr-4 font-semibold">{result.name}:</span>
                  {result.positions.map((count, place) => (
                    <span key={place} className="mr-4 flex items-center">
                      <MedalIcon place={place + 1} />
                      {count}
                    </span>
                  ))}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white bg-opacity-10 rounded-lg p-4 sm:p-6">
            <h2 className="text-xl font-semibold mb-4">Output</h2>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => copyToClipboard(getPlayedMapsOutput())}
                className="bg-indigo-600 text-white px-3 py-1 text-sm rounded-full hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Copy Played Maps
              </button>
              <button 
                onClick={() => copyToClipboard(getDetailedResultsOutput())}
                className="bg-indigo-600 text-white px-3 py-1 text-sm rounded-full hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Copy Detailed Results
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button 
              onClick={saveTournamentData}
              className="bg-green-600 text-white px-4 py-2 rounded-full text-sm hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Save Tournament Data
            </button>
            <button 
              onClick={resetTournament}
              className="bg-red-600 text-white px-4 py-2 rounded-full text-sm hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Reset Tournament
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tournament;