import { useState } from "react";
import Image from "next/image";
import { FaChevronDown, FaChevronUp, FaTrophy, FaChartLine, FaArrowUp, FaArrowDown } from "react-icons/fa";

const RankedInfo = ({ rankedData }) => {
  const flexRankedData = Array.isArray(rankedData)
    ? rankedData.find((item) => item.queueType === "RANKED_FLEX_SR")
    : null;

  const [isExpanded, setIsExpanded] = useState(false);
  const handleToggleExpand = () => setIsExpanded((p) => !p);

  const data = flexRankedData;
  const rankedIcon = data ? `/images/league/rankedEmblems/${data.tier.toLowerCase()}.webp` : null;
  const tier = data ? data.tier : "Unranked";
  const rank = data ? data.rank : "";
  const wins = data ? data.wins : 0;
  const losses = data ? data.losses : 0;
  const leaguePoints = data ? data.leaguePoints : 0;
  const winRate = data ? ((wins / Math.max(1, wins + losses)) * 100).toFixed(1) : "0.0";
  const wr = parseFloat(winRate);
  const winRateColor = wr >= 55 ? "text-green-400" : wr >= 48 ? "text-blue-400" : "text-red-400";
  const winRateIcon = wr >= 55 ? <FaArrowUp className="ml-1" /> : wr >= 48 ? null : <FaArrowDown className="ml-1" />;
  const tierColorStyle = data ? { color: `var(--${tier.toLowerCase()})` } : { color: "var(--text-secondary)" };

  return (
    <div className="overflow-hidden relative group bg-white/5 rounded-xl">
      {/* Ambient Background Glow */}
      {data && (
        <div
          className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10 blur-3xl transition-all duration-700 group-hover:opacity-20"
          style={{ backgroundColor: `var(--${tier.toLowerCase()})` }}
        />
      )}

      <div className="p-4 relative z-10">
        <div className="flex items-center gap-4 mb-4">
          {rankedIcon && (
            <div className="relative w-12 h-12 shrink-0 drop-shadow-md">
              <Image src={rankedIcon} alt={`${tier} Emblem`} fill className="object-contain" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-widest text-[--text-secondary] font-bold mb-0.5">Flex Ranked</p>
            <h2 className="text-xl font-black leading-none tracking-tight">
              <span style={tierColorStyle}>{data ? tier : "Unranked"}</span>
              {data && <span className="text-white ml-2 opacity-90">{rank}</span>}
            </h2>
            {data && <p className="text-sm font-medium text-[--text-secondary] mt-1 flex items-center gap-1">
              <span className="text-[--text-primary] font-bold">{leaguePoints}</span> <span className="text-xs uppercase opacity-70">LP</span>
            </p>}
          </div>
        </div>

        {data ? (
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-[--text-secondary] font-bold tracking-wider">Win Rate</span>
              <span className={`text-lg font-black flex items-center ${winRateColor}`}>
                {winRate}%
                {winRateIcon}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-[--text-secondary] font-bold tracking-wider">Record</span>
              <span className="text-sm font-medium text-[--text-secondary] mt-0.5">
                <span className="text-white font-bold">{wins}</span>W - <span className="text-white font-bold">{losses}</span>L
              </span>
            </div>
          </div>
        ) : (
          <div className="text-sm text-[--text-secondary] italic opacity-60">
            No games played in Flex Queue.
          </div>
        )}
      </div>
    </div>
  );
};

export default RankedInfo;
