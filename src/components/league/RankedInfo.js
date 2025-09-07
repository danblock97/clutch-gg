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
  const tierColorClass = data ? `text-[--${tier.toLowerCase()}]` : "text-gray-400";

  return (
    <div className="card group transition-all duration-300 hover:shadow-xl overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-[--primary] to-[--secondary]" />
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[--card-bg] border border-[--card-border]">
            <FaTrophy className="text-[--gold] text-lg" />
          </div>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-widest text-[--text-secondary]">Flex Ranked</p>
            <h2 className="text-lg font-extrabold">{data ? `${tier} ${rank}` : "Unranked"}</h2>
          </div>
          {rankedIcon ? (
            <div className="relative w-14 h-14">
              <Image src={rankedIcon} alt={`${tier} Emblem`} fill className="object-contain" />
            </div>
          ) : null}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-md border border-[--card-border] bg-[--card-bg] p-3">
            <p className="text-[10px] uppercase tracking-wider text-[--text-secondary]">Win Rate</p>
            <p className={`mt-1 text-xl font-bold flex items-center ${winRateColor}`}>
              {winRate}%
              {winRateIcon}
            </p>
          </div>
          <div className="rounded-md border border-[--card-border] bg-[--card-bg] p-3">
            <p className="text-[10px] uppercase tracking-wider text-[--text-secondary]">LP</p>
            <p className="mt-1 text-xl font-bold flex items-center">
              <FaChartLine className="text-[--primary] mr-1" /> {leaguePoints}
            </p>
          </div>
          <div className="rounded-md border border-[--card-border] bg-[--card-bg] p-3">
            <p className="text-[10px] uppercase tracking-wider text-[--text-secondary]">Tier</p>
            <p className={`mt-1 text-sm font-semibold ${tierColorClass}`}>{data ? tier : "Unranked"}</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-[--text-secondary] mb-1">
            <span>W/L</span>
            <span>
              <span className="text-[--success] font-semibold">{wins}W</span>
              <span className="mx-1">/</span>
              <span className="text-[--error] font-semibold">{losses}L</span>
            </span>
          </div>
          <div className="h-2 rounded bg-[--card-bg] border border-[--card-border] overflow-hidden">
            {(() => {
              const total = Math.max(1, wins + losses);
              const winPct = (wins / total) * 100;
              return (
                <div className="h-full w-full flex">
                  <div className="h-full bg-green-500/70" style={{ width: `${winPct}%` }} />
                  <div className="h-full bg-red-500/60" style={{ width: `${100 - winPct}%` }} />
                </div>
              );
            })()}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end">
          <button
            className="text-[--text-secondary] hover:text-[--primary] transition-colors text-sm inline-flex items-center gap-1"
            onClick={handleToggleExpand}
          >
            {isExpanded ? (
              <>
                Hide details <FaChevronUp />
              </>
            ) : (
              <>
                Show details <FaChevronDown />
              </>
            )}
          </button>
        </div>

        {isExpanded ? (
          <div className="mt-2 text-xs text-[--text-secondary] grid grid-cols-2 gap-2">
            <p>
              Games: <span className="text-[--text-primary] font-semibold">{wins + losses}</span>
            </p>
            <p>
              Queue: <span className="text-[--text-primary] font-semibold">Flex SR</span>
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default RankedInfo;
