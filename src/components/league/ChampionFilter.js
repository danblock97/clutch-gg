'use client';

import { useState } from 'react';

export function ChampionFilter({ championData, selectedChampion, setSelectedChampion, disabled }) {
  const [query, setQuery] = useState('');

  if (disabled) {
    return null;
  }

  const championList = championData ? Object.values(championData) : [];

  const filteredChampions = query
    ? championList.filter((champion) =>
        champion.name.toLowerCase().includes(query.toLowerCase())
      )
    : championList;

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search Champion..."
        className="p-2 rounded-md bg-neutral-800 text-white w-full"
      />
      {query && (
        <div className="absolute z-10 w-full bg-neutral-800 rounded-md mt-1 max-h-60 overflow-y-auto">
          <div
            className="p-2 cursor-pointer hover:bg-neutral-700"
            onClick={() => {
              setSelectedChampion('ALL');
              setQuery('');
            }}
          >
            All Champions
          </div>
          {filteredChampions.map((champion) => (
            <div
              key={champion.id}
              className="p-2 cursor-pointer hover:bg-neutral-700"
              onClick={() => {
                setSelectedChampion(champion.id);
                setQuery(champion.name);
              }}
            >
              {champion.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}