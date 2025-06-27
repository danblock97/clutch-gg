'use client';

const ranks = [
  'ALL',
  'IRON',
  'BRONZE',
  'SILVER',
  'GOLD',
  'PLATINUM',
  'EMERALD',
  'DIAMOND',
  'MASTER',
  'GRANDMASTER',
  'CHALLENGER',
];

export function RankFilterDropdown({ selectedRank, setSelectedRank, disabled }) {
  return (
    <select
      value={selectedRank}
      onChange={(e) => setSelectedRank(e.target.value)}
      disabled={disabled}
      className="p-2 rounded-md bg-neutral-800 text-white"
    >
      {ranks.map((rank) => (
        <option key={rank} value={rank}>
          {rank.charAt(0) + rank.slice(1).toLowerCase()}
        </option>
      ))}
    </select>
  );
}