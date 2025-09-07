import React, { useMemo } from "react";
import Image from "next/image";
import {
  FaArrowUp,
  FaArrowDown,
  FaSkull,
  FaShieldAlt,
  FaStar,
  FaChartLine,
  FaChevronUp,
  FaLeaf,
  FaDotCircle,
  FaCrosshairs,
  FaHandsHelping,
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
    const dpmSeries = []; // latest -> oldest per-game DPM
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
      totalCS +=
        (currentPlayer.totalMinionsKilled ?? 0) +
        (currentPlayer.neutralMinionsKilled ?? 0);

      // New per-game metrics
      const teamId = currentPlayer.teamId;
      const teamKills = match.info.participants
        .filter((p) => p.teamId === teamId)
        .reduce((sum, p) => sum + (p.kills ?? 0), 0);
      const kp = teamKills > 0 ? (currentPlayer.kills + currentPlayer.assists) / teamKills : 0;
      totalKP += kp;
      const dpm = (currentPlayer.totalDamageDealtToChampions ?? 0) / safeMinutes;
      totalDPM += dpm;
      dpmSeries.push(dpm);
      const vspm = (currentPlayer.visionScore ?? 0) / safeMinutes;
      totalVSPM += vspm;
      const gpm = (currentPlayer.goldEarned ?? 0) / safeMinutes;
      totalGPM += gpm;
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
    const winRate = ((totalWins / gamesCount) * 100).toFixed(1);
    const avgKills = (totalKills / gamesCount).toFixed(1);
    const avgDeaths = (totalDeaths / gamesCount).toFixed(1);
    const avgAssists = (totalAssists / gamesCount).toFixed(1);
    const avgKDA = ((totalKills + totalAssists) / Math.max(1, totalDeaths)).toFixed(1);
    const avgCS = (totalCS / gamesCount).toFixed(1);
    const avgCSPerMin = (totalCS / Math.max(1, totalGameDuration)).toFixed(1);
    const avgDamageDealt = (totalDamageDealt / gamesCount).toFixed(0);

    // New averages
    const avgKP = ((totalKP / gamesCount) * 100).toFixed(1);
    const avgDPM = (totalDPM / gamesCount).toFixed(0);
    const avgVSPM = (totalVSPM / gamesCount).toFixed(1);
    const avgGPM = (totalGPM / gamesCount).toFixed(0);
    const avgDMGShare = ((totalDMGShare / gamesCount) * 100).toFixed(1); // %
    const firstBloodRate = ((firstBloodCount / gamesCount) * 100).toFixed(1);
    const avgGameLength = (totalGameDuration / gamesCount).toFixed(1); // minutes

    // Current streak from latest to oldest
    let currentStreak = 0;
    let streakType = null; // "W" | "L"
    for (let i = 0; i < trend.length; i++) {
      const isWin = trend[i];
      if (i === 0) {
        streakType = isWin ? "W" : "L";
        currentStreak = 1;
      } else if ((isWin && streakType === "W") || (!isWin && streakType === "L")) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Tuned thresholds (League-leaning)
    const kdaComparison =
      parseFloat(avgKDA) >= 4.0 ? "good" : parseFloat(avgKDA) >= 2.5 ? "average" : "bad";
    const winRateComparison =
      parseFloat(winRate) >= 58
        ? "good"
        : parseFloat(winRate) >= 48
        ? "average"
        : "bad";
    const csPerMinComparison =
      parseFloat(avgCSPerMin) >= 7.5
        ? "good"
        : parseFloat(avgCSPerMin) >= 5.5
        ? "average"
        : "bad";

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
      // new aggregates
      avgKP,
      avgDPM,
      avgVSPM,
      avgGPM,
      avgDMGShare,
      firstBloodRate,
      avgGameLength,
      dpmSeries,
      multiKills: { tripleKills, quadraKills, pentaKills },
      trend,
      currentStreak,
      streakType,
      roles: roleCounts,
      comparisons: {
        kda: kdaComparison,
        winRate: winRateComparison,
        csPerMin: csPerMinComparison,
      },
    };
  }, [last20Matches, selectedSummonerPUUID]);

	// Sort champions by most played and best winrate (top 4)
  const topChampions = useMemo(() => {
    return Object.entries(performanceStats.championPerformance)
      .map(([championId, stats]) => ({
        championId: Number(championId),
        ...stats,
        winRate: ((stats.wins / Math.max(1, stats.games)) * 100).toFixed(1),
      }))
      .sort((a, b) => b.games - a.games)
      .slice(0, 4);
  }, [performanceStats.championPerformance]);

	// Helper to get status indicator icon and color
  const getStatusIndicator = (status) => {
    switch (status) {
      case "good":
        return { icon: <FaArrowUp />, color: "text-green-500" };
      case "average":
        return { icon: <FaStar />, color: "text-yellow-500" };
      case "bad":
        return { icon: <FaArrowDown />, color: "text-red-500" };
      default:
        return { icon: null, color: "text-gray-500" };
    }
  };

	const kdaStatus = getStatusIndicator(performanceStats.comparisons.kda);
	const winRateStatus = getStatusIndicator(
		performanceStats.comparisons.winRate
	);
	const csStatus = getStatusIndicator(performanceStats.comparisons.csPerMin);

  return (
    <div className="card season-history-card p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center">
          <FaChartLine className="text-[--primary] mr-2" />
          Recent Performance
          <span className="text-[--text-secondary] text-sm font-normal ml-2">
            (Last 20 Games)
          </span>
        </h2>
      </div>

      {/* Trend strip */}
      <TrendDots trend={performanceStats.trend} />

      {/* Stat grid - primary metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {/* Win Rate */}
        <StatTile label="Win Rate" value={`${performanceStats.winRate}%`} status={winRateStatus} />
        {/* KDA */}
        <StatTile
          label="KDA"
          value={performanceStats.avgKDA}
          hint={`${performanceStats.avgKills}/${performanceStats.avgDeaths}/${performanceStats.avgAssists}`}
          status={kdaStatus}
        />
        {/* Kill Participation */}
        <StatTile
          label="Kill Part."
          value={`${performanceStats.avgKP}%`}
          hint="Avg KP"
          status={getStatusByThreshold(performanceStats.avgKP, 45, 60)}
        />
        {/* CS per Min */}
        <StatTile
          label="CS / Min"
          value={performanceStats.avgCSPerMin}
          hint={`${performanceStats.avgCS} avg CS`}
          status={csStatus}
        />
        {/* Damage per Min */}
        <StatTile
          label="Dmg / Min"
          value={Number(performanceStats.avgDPM).toLocaleString()}
          hint="Avg DPM"
          status={getStatusByThreshold(performanceStats.avgDPM, 400, 550)}
          sparkline={performanceStats.dpmSeries}
        />
        {/* Vision per Min */}
        <StatTile
          label="Vision / Min"
          value={performanceStats.avgVSPM}
          hint="Avg VSPM"
          status={getStatusByThreshold(performanceStats.avgVSPM, 0.8, 1.2)}
        />
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mt-3">
        <MiniTile
          label="First Blood"
          value={`${performanceStats.firstBloodRate}%`}
          status={getStatusByThreshold(performanceStats.firstBloodRate, 10, 20)}
        />
        <MiniTile
          label="Gold / Min"
          value={Number(performanceStats.avgGPM).toLocaleString()}
          status={getStatusByThreshold(performanceStats.avgGPM, 320, 380)}
        />
        <MiniTile label="Avg Game" value={`${performanceStats.avgGameLength}m`} />
        <MiniTile
          label="Dmg Share"
          value={`${performanceStats.avgDMGShare}%`}
          status={getStatusByThreshold(performanceStats.avgDMGShare, 22, 28)}
        />
        <MiniTile label="Multi-kills" value={`${performanceStats.multiKills.tripleKills} Triple, ${performanceStats.multiKills.quadraKills} Quadra, ${performanceStats.multiKills.pentaKills} Penta`} />
        <MiniTile label="Streak" value={`${performanceStats.currentStreak ? performanceStats.currentStreak : 0}${performanceStats.streakType ? performanceStats.streakType : ""}`} />
      </div>

      {/* Divider */}
      <div className="my-4 h-px bg-[--card-border]" />

      {/* Role distribution */}
      <div className="mb-3">
        <p className="text-xs uppercase tracking-wider text-[--text-secondary] mb-1">Role Mix</p>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(performanceStats.roles)
            .filter(([, v]) => v > 0)
            .map(([role, count]) => {
              const map = { TOP: "TOP", JUNGLE: "JG", MIDDLE: "MID", BOTTOM: "BOT", UTILITY: "SUP" };
              const label = map[role] || role;
              const pct = Math.round((count / Math.max(1, performanceStats.trend.length)) * 100);
              const roleIconMap = {
                TOP: <FaChevronUp className="text-[--primary] mr-1" />,
                JUNGLE: <FaLeaf className="text-[--primary] mr-1" />,
                MIDDLE: <FaDotCircle className="text-[--primary] mr-1" />,
                BOTTOM: <FaCrosshairs className="text-[--primary] mr-1" />,
                UTILITY: <FaHandsHelping className="text-[--primary] mr-1" />,
              };
              return (
                <span
                  key={role}
                  className="px-2 py-1 rounded-md text-xs border border-[--card-border] bg-[--card-bg] text-[--text-secondary]"
                >
                  <span className="inline-flex items-center">
                    {roleIconMap[role]}
                    <span className="text-[--text-primary] font-semibold mr-1">{label}</span>
                  </span>
                  {count} • {pct}%
                </span>
              );
            })}
        </div>
      </div>

      {/* Top Champions */}
      <div>
        <p className="text-base font-semibold mb-2">Top Champions</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {topChampions.map((champion) => {
            const winRateValue = parseFloat(champion.winRate);
            let winRateColorClass = "text-red-500";
            if (winRateValue >= 60) winRateColorClass = "text-green-500";
            else if (winRateValue >= 50) winRateColorClass = "text-blue-500";
            else if (winRateValue >= 40) winRateColorClass = "text-yellow-500";

            const selected = selectedChampionId === champion.championId;
            return (
              <div
                key={champion.championId}
                className={`relative overflow-hidden rounded-lg p-2 cursor-pointer transition-all duration-200 border ${
                  selected
                    ? "border-[--primary] bg-[--primary]/10 shadow-[0_0_0_2px_rgba(0,0,0,0.2)]"
                    : "border-[--card-border] bg-[--card-bg] hover:bg-[--card-bg-secondary]"
                }`}
                onClick={() => onChampionClick(champion.championId)}
              >
                <div className="flex items-center gap-2">
                  <div className="relative w-12 h-12">
                    <Image
                      src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${champion.championId}.png`}
                      alt="Champion Icon"
                      fill
                      className="rounded-full object-cover border-2 border-[--card-border]"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-[--card-bg] rounded-full w-5 h-5 flex items-center justify-center text-xs border border-[--card-border]">
                      {champion.games}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-bold ${winRateColorClass}`}>{champion.winRate}%</p>
                      <p className="text-[11px] text-[--text-secondary]">KDA {champion.kda.toFixed(1)}</p>
                    </div>
                    <p className="text-xs text-[--text-secondary] mt-0.5">
                      <span className="text-green-500">{champion.wins}W</span>
                      <span className="mx-1">/</span>
                      <span className="text-red-500">{champion.losses}L</span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Small presentational tiles
const StatTile = ({ label, value, hint, status, sparkline }) => (
  <div className="rounded-lg border border-[--card-border] bg-[--card-bg] p-3">
    <div className="flex items-center justify-between">
      <p className="text-xs uppercase tracking-wider text-[--text-secondary]">{label}</p>
      {status?.icon ? <span className={`${status.color} text-xs`}>{status.icon}</span> : null}
    </div>
    <p className="mt-1 text-lg font-semibold">{value}</p>
    {hint ? <p className="text-[10px] text-[--text-secondary] mt-0.5">{hint}</p> : null}
    {sparkline && sparkline.length > 1 ? (
      <div className="mt-2">
        <Sparkline data={sparkline} />
      </div>
    ) : null}
  </div>
);

const MiniTile = ({ label, value }) => (
  <div className="rounded-lg bg-[--card-bg] border border-[--card-border] p-2">
    <p className="text-[10px] uppercase tracking-wider text-[--text-secondary]">{label}</p>
    <p className="text-sm font-semibold mt-0.5">{value}</p>
  </div>
);

// Tidy last-20 trend dots
const TrendDots = ({ trend }) => {
  const total = trend.length;
  const wins = trend.filter(Boolean).length;
  const losses = total - wins;
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs uppercase tracking-wider text-[--text-secondary]">Last 20</p>
        <p className="text-xs text-[--text-secondary]">
          <span className="text-green-500 font-semibold">{wins}W</span>
          <span className="mx-1">/</span>
          <span className="text-red-500 font-semibold">{losses}L</span>
          <span className="mx-1">•</span>
          <span>{total > 0 ? Math.round((wins / total) * 100) : 0}%</span>
        </p>
      </div>
      <div className="flex flex-wrap gap-1">
        {trend.map((isWin, idx) => (
          <span
            key={idx}
            title={isWin ? "Win" : "Loss"}
            className={`h-2.5 w-2.5 rounded-full ${
              isWin ? "bg-[--primary]" : "bg-[--card-bg-secondary]"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// Helpers for thresholds
const getStatusByThreshold = (numericStrOrNum, avgThreshold, goodThreshold) => {
  const v = typeof numericStrOrNum === "string" ? parseFloat(numericStrOrNum) : numericStrOrNum;
  const status = v >= goodThreshold ? "good" : v >= avgThreshold ? "average" : "bad";
  switch (status) {
    case "good":
      return { icon: <FaArrowUp />, color: "text-green-500" };
    case "average":
      return { icon: <FaStar />, color: "text-yellow-500" };
    case "bad":
    default:
      return { icon: <FaArrowDown />, color: "text-red-500" };
  }
};

// Simple inline sparkline using normalized data
const Sparkline = ({ data }) => {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = Math.max(1, max - min);
  const width = 100;
  const height = 30;
  const step = width / (data.length - 1);
  const points = data.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  });
  const d = `M ${points[0]} L ${points.slice(1).join(" ")}`;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="w-full h-8">
      <defs>
        <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={d} fill="none" stroke="var(--primary)" strokeWidth="1.5" />
      <polyline
        points={`0,${height} ${points.join(" ")} ${width},${height}`}
        fill="url(#spark)"
        stroke="none"
      />
    </svg>
  );
};


export default Last20GamesPerformance;
