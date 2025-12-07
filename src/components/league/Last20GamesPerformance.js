import React, { useMemo } from "react";
import Image from "next/image";
import {
  FaArrowUp,
  FaArrowDown,
  FaChartLine,
  FaChevronUp,
  FaLeaf,
  FaDotCircle,
  FaCrosshairs,
  FaHandsHelping,
  FaMinus,
  FaTrophy,
} from "react-icons/fa";

const Last20GamesPerformance = ({
  matchDetails,
  selectedSummonerPUUID,
  onChampionClick,
  selectedChampionId,
}) => {
  // Filter to get the last 20 matches of the selected player
  const last20Matches = useMemo(() => {
    return matchDetails
      .filter(
        (match) =>
          match &&
          match.info &&
          match.info.participants &&
          match.info.participants.some(
            (participant) => participant.puuid === selectedSummonerPUUID
          )
      )
      .slice(0, 20);
  }, [matchDetails, selectedSummonerPUUID]);

  // Calculate performance stats for the last 20 games
  const performanceStats = useMemo(() => {
    let totalWins = 0;
    let totalKills = 0;
    let totalDeaths = 0;
    let totalAssists = 0;
    let totalGold = 0;
    let totalDamageDealt = 0;
    let totalVisionScore = 0;
    let totalCS = 0;
    let totalGameDuration = 0; // minutes

    // New aggregations
    let totalKP = 0; // sum of per-game KP ratios
    let totalDPM = 0; // damage per minute
    let totalVSPM = 0; // vision score per minute
    let totalGPM = 0; // gold per minute
    let totalDMGShare = 0; // sum of team damage percentage
    let firstBloodCount = 0;
    let tripleKills = 0;
    let quadraKills = 0;
    let pentaKills = 0;

    const trend = []; // latest -> oldest W/L

    // Series for Sparklines (latest -> oldest, need to reverse for display usually or handle in chart)
    const dpmSeries = [];
    const gpmSeries = [];
    const cspmSeries = []; // CS per minute
    const vspmSeries = []; // Vision per minute
    const kdaSeries = []; // (K+A)/D per game

    const roleCounts = { TOP: 0, JUNGLE: 0, MIDDLE: 0, BOTTOM: 0, UTILITY: 0 };

    const championPerformance = {};

    last20Matches.forEach((match) => {
      if (!match || !match.info || !match.info.participants) return;

      const currentPlayer = match.info.participants.find(
        (participant) => participant.puuid === selectedSummonerPUUID
      );
      if (!currentPlayer) return;

      const gameDurationMinutes = (match.info.gameDuration ?? 0) / 60;
      const safeMinutes = Math.max(1, gameDurationMinutes);
      totalGameDuration += safeMinutes;

      // Win/Loss + trend
      if (currentPlayer.win) totalWins++;
      trend.push(Boolean(currentPlayer.win));

      // Basic Stats
      totalKills += currentPlayer.kills ?? 0;
      totalDeaths += currentPlayer.deaths ?? 0;
      totalAssists += currentPlayer.assists ?? 0;
      totalGold += currentPlayer.goldEarned ?? 0;
      totalDamageDealt += currentPlayer.totalDamageDealtToChampions ?? 0;
      totalVisionScore += currentPlayer.visionScore ?? 0;
      const cs =
        (currentPlayer.totalMinionsKilled ?? 0) +
        (currentPlayer.neutralMinionsKilled ?? 0);
      totalCS += cs;

      // Per-game calculations
      const teamId = currentPlayer.teamId;
      const teamKills = match.info.participants
        .filter((p) => p.teamId === teamId)
        .reduce((sum, p) => sum + (p.kills ?? 0), 0);
      const kp = teamKills > 0 ? (currentPlayer.kills + currentPlayer.assists) / teamKills : 0;
      totalKP += kp;

      const dpm = (currentPlayer.totalDamageDealtToChampions ?? 0) / safeMinutes;
      totalDPM += dpm;
      dpmSeries.push(dpm);

      const gpm = (currentPlayer.goldEarned ?? 0) / safeMinutes;
      totalGPM += gpm;
      gpmSeries.push(gpm);

      const vspm = (currentPlayer.visionScore ?? 0) / safeMinutes;
      totalVSPM += vspm;
      vspmSeries.push(vspm);

      const cspm = cs / safeMinutes;
      cspmSeries.push(cspm);

      const kdaVal = (currentPlayer.kills + currentPlayer.assists) / Math.max(1, currentPlayer.deaths);
      kdaSeries.push(kdaVal);

      const dmgShare = currentPlayer.challenges?.teamDamagePercentage ?? null;
      if (typeof dmgShare === "number") totalDMGShare += dmgShare; // value in [0,1]
      if (currentPlayer.firstBloodKill) firstBloodCount++;
      tripleKills += currentPlayer.tripleKills ?? 0;
      quadraKills += currentPlayer.quadraKills ?? 0;
      pentaKills += currentPlayer.pentaKills ?? 0;

      // Role distribution
      const pos = currentPlayer.teamPosition || currentPlayer.individualPosition || "";
      if (roleCounts[pos] !== undefined) roleCounts[pos]++;

      // Champion Performance
      const championId = currentPlayer.championId;
      if (!championPerformance[championId]) {
        championPerformance[championId] = {
          wins: 0,
          losses: 0,
          kills: 0,
          deaths: 0,
          assists: 0,
          games: 0,
          kda: 0,
          damageDealt: 0,
        };
      }
      championPerformance[championId].games++;
      championPerformance[championId].kills += currentPlayer.kills ?? 0;
      championPerformance[championId].deaths += currentPlayer.deaths ?? 0;
      championPerformance[championId].assists += currentPlayer.assists ?? 0;
      championPerformance[championId].damageDealt +=
        currentPlayer.totalDamageDealtToChampions ?? 0;
      if (currentPlayer.win) {
        championPerformance[championId].wins++;
      } else {
        championPerformance[championId].losses++;
      }
      championPerformance[championId].kda =
        (championPerformance[championId].kills +
          championPerformance[championId].assists) /
        Math.max(1, championPerformance[championId].deaths);
    });

    const gamesCount = Math.max(1, last20Matches.length);
    const winRate = ((totalWins / gamesCount) * 100).toFixed(0);
    const avgKills = (totalKills / gamesCount).toFixed(1);
    const avgDeaths = (totalDeaths / gamesCount).toFixed(1);
    const avgAssists = (totalAssists / gamesCount).toFixed(1);
    const avgKDA = ((totalKills + totalAssists) / Math.max(1, totalDeaths)).toFixed(2);
    const avgCS = (totalCS / gamesCount).toFixed(1);
    const avgCSPerMin = (totalCS / Math.max(1, totalGameDuration)).toFixed(1);
    const avgDamageDealt = (totalDamageDealt / gamesCount).toFixed(0);

    // New averages
    const avgKP = ((totalKP / gamesCount) * 100).toFixed(0);
    const avgDPM = (totalDPM / gamesCount).toFixed(0);
    const avgVSPM = (totalVSPM / gamesCount).toFixed(2);
    const avgGPM = (totalGPM / gamesCount).toFixed(0);
    const avgDMGShare = ((totalDMGShare / gamesCount) * 100).toFixed(1); // %
    const firstBloodRate = ((firstBloodCount / gamesCount) * 100).toFixed(0);
    const avgGameLength = (totalGameDuration / gamesCount).toFixed(0); // minutes

    // Tuned thresholds
    const isGoodKDA = parseFloat(avgKDA) >= 3.0;
    const isGoodWinRate = parseFloat(winRate) >= 50;

    return {
      winRate,
      avgKills,
      avgDeaths,
      avgAssists,
      avgKDA,
      avgCS,
      avgCSPerMin,
      avgDamageDealt,
      totalWins,
      totalLosses: gamesCount - totalWins,
      championPerformance,
      // aggregates
      avgKP,
      avgDPM,
      avgVSPM,
      avgGPM,
      avgDMGShare,
      firstBloodRate,
      avgGameLength,
      // Series (reverse for chronological left-to-right if index 0 is latest)
      series: {
        dpm: dpmSeries.reverse(), // Now oldest -> latest
        gpm: gpmSeries.reverse(),
        cspm: cspmSeries.reverse(),
        vspm: vspmSeries.reverse(),
        kda: kdaSeries.reverse(),
        trend: trend.reverse(), // W/L chronological
      },
      multiKills: { tripleKills, quadraKills, pentaKills },
      roles: roleCounts,
      isGoodKDA,
      isGoodWinRate,
    };
  }, [last20Matches, selectedSummonerPUUID]);

  // Sort champions by games played
  const topChampions = useMemo(() => {
    return Object.entries(performanceStats.championPerformance)
      .map(([championId, stats]) => ({
        championId: Number(championId),
        ...stats,
        winRate: ((stats.wins / Math.max(1, stats.games)) * 100).toFixed(0),
      }))
      .sort((a, b) => b.games - a.games)
      .slice(0, 3);
  }, [performanceStats.championPerformance]);

  return (
    <div className="w-full rounded-xl overflow-hidden bg-white/5">
      {/* Header Section */}
      <div className="px-6 py-4 border-b border-[--card-border] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[--primary]/10 text-[--primary]">
            <FaChartLine />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[--text-primary]">Recent Performance</h2>
            <p className="text-xs text-[--text-secondary]">Last 20 Games Analysis</p>
          </div>
        </div>

        {/* Big Win Rate */}
        <div className="flex flex-col items-end">
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-black ${performanceStats.isGoodWinRate ? 'text-[--primary]' : 'text-[--text-secondary]'}`}>
              {performanceStats.winRate}%
            </span>
            <span className="text-sm font-medium text-[--text-secondary]">Win Rate</span>
          </div>
          <div className="text-xs text-[--text-secondary] flex gap-2">
            <span className="text-green-400 font-semibold">{performanceStats.totalWins}W</span>
            <span className="text-[--card-border]">|</span>
            <span className="text-red-400 font-semibold">{performanceStats.totalLosses}L</span>
          </div>
        </div>
      </div>

      {/* Main Analytical Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x border-b border-[--card-border] divide-[--card-border]">

        {/* KDA & Combat */}
        <AnalyticalGroup
          label="Combat"
          primaryValue={performanceStats.avgKDA}
          primaryUnit="KDA"
          subValue={`${performanceStats.avgKills} / ${performanceStats.avgDeaths} / ${performanceStats.avgAssists}`}
          graphData={performanceStats.series.kda}
          color="text-blue-400"
        />

        {/* Damage */}
        <AnalyticalGroup
          label="Damage"
          primaryValue={Number(performanceStats.avgDPM).toLocaleString()}
          primaryUnit="DPM"
          subValue={`${performanceStats.avgDMGShare}% Share`}
          graphData={performanceStats.series.dpm}
          color="text-red-400"
        />

        {/* Economy */}
        <AnalyticalGroup
          label="Gold"
          primaryValue={Number(performanceStats.avgGPM).toLocaleString()}
          primaryUnit="GPM"
          subValue={`${performanceStats.avgCSPerMin} CS/M`}
          graphData={performanceStats.series.gpm}
          color="text-yellow-400"
        />

        {/* Vision */}
        <AnalyticalGroup
          label="Vision"
          primaryValue={performanceStats.avgVSPM}
          primaryUnit="VS/M"
          subValue={`${performanceStats.avgKP}% KP`}
          graphData={performanceStats.series.vspm}
          color="text-purple-400"
        />
      </div>

      {/* Bottom Section: Champions & Roles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-[--card-border]">

        {/* Most Played Champions */}
        <div className="col-span-1 lg:col-span-2 p-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[--text-secondary] mb-3">Most Played</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {topChampions.map(champ => (
              <div
                key={champ.championId}
                onClick={() => onChampionClick(champ.championId)}
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors hover:bg-[--card-bg-secondary] border ${selectedChampionId === champ.championId ? 'border-[--primary] bg-[--primary]/5' : 'border-transparent'}`}
              >
                <div className="relative w-10 h-10 shrink-0">
                  <Image
                    src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${champ.championId}.png`}
                    alt="Champ"
                    fill
                    className="rounded-full object-cover border border-[--card-border]"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${parseFloat(champ.winRate) >= 50 ? 'text-green-400' : 'text-[--text-secondary]'}`}>
                      {champ.winRate}%
                    </span>
                    <span className="text-xs text-[--text-secondary]">{champ.games} G</span>
                  </div>
                  <span className="text-xs text-[--text-secondary] truncate">
                    {champ.kda.toFixed(2)} KDA
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Role Distribution & Misc */}
        <div className="p-4 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[--text-secondary]">Roles</span>
            <div className="flex gap-1">
              {Object.entries(performanceStats.roles)
                .filter(([, c]) => c > 0)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 2)
                .map(([role, count]) => {
                  const roleIconMap = {
                    TOP: <FaChevronUp className="text-xs" />,
                    JUNGLE: <FaLeaf className="text-xs" />,
                    MIDDLE: <FaDotCircle className="text-xs" />,
                    BOTTOM: <FaCrosshairs className="text-xs" />,
                    UTILITY: <FaHandsHelping className="text-xs" />,
                  };
                  return (
                    <div key={role} className="flex items-center gap-1 bg-[--card-bg-secondary] px-2 py-1 rounded text-xs text-[--text-secondary]">
                      {roleIconMap[role]} <span className="font-semibold">{count}</span>
                    </div>
                  )
                })
              }
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[--text-secondary]">Avg Game Length</span>
              <span className="font-medium text-[--text-primary]">{performanceStats.avgGameLength}m</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[--text-secondary]">First Blood</span>
              <span className="font-medium text-[--text-primary]">{performanceStats.firstBloodRate}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-component for each analytical column
const AnalyticalGroup = ({ label, primaryValue, primaryUnit, subValue, graphData, color }) => (
  <div className="p-4 flex flex-col justify-between h-32 relative group">
    <div className="relative z-10">
      <p className="text-xs uppercase tracking-wider text-[--text-secondary] font-semibold mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className={`text-xl font-bold text-[--text-primary]`}>{primaryValue}</span>
        <span className="text-[10px] text-[--text-secondary] font-medium">{primaryUnit}</span>
      </div>
      <p className="text-xs text-[--text-secondary] mt-0.5 opacity-80">{subValue}</p>
    </div>

    {/* Graph Container */}
    <div className="absolute bottom-2 left-0 right-0 h-12 w-full px-2 opacity-60 group-hover:opacity-100 transition-opacity">
      <Sparkline data={graphData} color={color} />
    </div>
  </div>
);

// Smooth SVG Sparkline
const Sparkline = ({ data, color }) => {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data) || 1;
  const min = Math.min(...data) || 0;
  const range = Math.max(0.1, max - min);
  const width = 100;
  const height = 40;

  // Padding to avoid clipping tops/bottoms
  const pY = 4;
  const drawHeight = height - pY * 2;

  const step = width / (data.length - 1);
  const points = data.map((v, i) => {
    const x = i * step;
    // Invert Y because SVG y=0 is top
    const normalizedY = ((v - min) / range);
    const y = (drawHeight - (normalizedY * drawHeight)) + pY;
    return `${x},${y}`;
  }).join(" ");

  // Create fill area
  const firstX = 0;
  const lastX = width; // should match last point x
  const maxY = height;
  const fillPoints = `${firstX},${maxY} ${points} ${lastX},${maxY}`;

  // Extract color class to hex or reliable currentColor usage
  // For simplicity, we assume the parent passes a valid Tailwind text color class, 
  // but SVG specific styles might need direct color values. 
  // Let's rely on 'currentColor' and setting the className on the SVG.

  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className={`w-full h-full ${color}`}>
      <defs>
        <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`M ${points}`} fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
      <polygon points={fillPoints} fill={`url(#grad-${color})`} stroke="none" />
    </svg>
  );
};

export default Last20GamesPerformance;

