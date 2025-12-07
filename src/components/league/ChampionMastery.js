import React, { useState } from "react";
import Image from "next/image";
import { FaMedal, FaChevronDown, FaChevronUp } from "react-icons/fa";

const ChampionMastery = ({ championMasteryData }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const formatPoints = (points) => {
    if (points >= 1000000) {
      return (points / 1000000).toFixed(1) + "M";
    } else if (points >= 1000) {
      return (points / 1000).toFixed(1) + "K";
    }
    return points;
  };

  const getMasteryColorClass = (level) => {
    switch (level) {
      case 7:
        return "text-purple-400 border-purple-400";
      case 6:
        return "text-pink-400 border-pink-400";
      case 5:
        return "text-red-400 border-red-400";
      case 4:
        return "text-blue-400 border-blue-400";
      default:
        return "text-gray-400 border-gray-400";
    }
  };

  const getMasteryBgClass = (level) => {
    switch (level) {
      case 7:
        return "bg-purple-900/20";
      case 6:
        return "bg-pink-900/20";
      case 5:
        return "bg-red-900/20";
      case 4:
        return "bg-blue-900/20";
      default:
        return "bg-gray-900/20";
    }
  };

  if (!championMasteryData || championMasteryData.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center p-4">
          <div className="p-2 rounded-full bg-[--card-bg] mr-3 flex items-center justify-center">
            <FaMedal className="text-[--secondary] text-lg" />
          </div>
          <h2 className="text-base font-semibold">Champion Mastery</h2>
        </div>
        <div className="p-4 pt-0 text-[--text-secondary] text-center">
          No champion mastery data available.
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white/5 rounded-xl">
      <div className="flex items-center justify-between p-4 border-b border-[--card-border] bg-black/20">
        <h3 className="text-base font-bold flex items-center gap-2">
          <FaMedal className="text-[--text-secondary]" />
          <span>Champion Mastery</span>
        </h3>
        <button
          className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/5 text-[--text-secondary] hover:text-white hover:bg-white/10 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <FaChevronUp className="text-xs" /> : <FaChevronDown className="text-xs" />}
        </button>
      </div>

      {isExpanded && (
        <div className="p-4">
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {championMasteryData.map((mastery) => {
              const championIcon = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${mastery.championId}.png`;
              const masteryLevel = mastery.championLevel;
              const colorClass = getMasteryColorClass(masteryLevel).split(' ')[0]; // Extract just the text color
              const borderColorClass = getMasteryColorClass(masteryLevel).split(' ')[1]; // Extract border color class if possible, or just re-use

              return (
                <div
                  key={mastery.championId}
                  className="group flex flex-col items-center bg-white/5 rounded-xl p-3 hover:bg-[--card-bg-hover] transition-all duration-300 border border-white/5 hover:border-white/20 hover:-translate-y-1 relative overflow-hidden"
                  title={`Mastery Level: ${mastery.championLevel}`}
                >
                  {/* Top Highlight on Hover */}
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="relative mb-3">
                    <div className={`relative w-14 h-14 rounded-full overflow-hidden ring-2 ring-white/10 group-hover:ring-4 transition-all duration-300 ${masteryLevel >= 7 ? 'group-hover:ring-purple-500/30' : 'group-hover:ring-white/20'}`}>
                      <Image
                        src={championIcon}
                        alt={`${mastery.championName} Icon`}
                        fill
                        className="object-cover transform group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                    <div
                      className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[--card-bg] border border-[--card-border] flex items-center justify-center text-[10px] font-black z-10 shadow-sm ${colorClass}`}
                    >
                      {masteryLevel}
                    </div>
                  </div>

                  <h3 className="text-xs font-bold text-center line-clamp-1 text-white mb-0.5 group-hover:text-[--primary] transition-colors">
                    {mastery.championName}
                  </h3>

                  <div className="text-[10px] text-[--text-secondary] font-mono opacity-70 group-hover:opacity-100">
                    {formatPoints(mastery.championPoints)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChampionMastery;
