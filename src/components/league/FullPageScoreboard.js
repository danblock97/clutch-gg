"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { buildProfileUrl } from "@/lib/utils/urlHelpers";
import { FaCrown, FaSkull, FaFistRaised, FaShieldAlt } from "react-icons/fa";

// Helper to calculate KDA
const calculateKDA = (kills, deaths, assists) => {
    if (deaths === 0) return (kills + assists).toFixed(2); // Perfect KDA
    return ((kills + assists) / deaths).toFixed(2);
};

// Helper for damage bar percentage
const getDamagePct = (damage, maxDamage) => {
    return Math.max(0, Math.round((damage / maxDamage) * 100));
};

const PlayerRow = ({ p, maxDamage, region, gameMode }) => {
    const kda = calculateKDA(p.kills, p.deaths, p.assists);
    const damagePct = getDamagePct(p.totalDamageDealtToChampions, maxDamage);
    const isWinner = p.win;

    // Determine row background based on win/team
    // Blue Team (100) usually associated with Blue colors, Red (200) with Red.
    // If winner, maybe highlight slightly?
    // For specific styling:
    // Team 100 (Blue): bg-blue-900/20 border-blue-900/50
    // Team 200 (Red): bg-red-900/20 border-red-900/50
    const teamColorClass = p.teamId === 100
        ? "bg-blue-500/5 border-blue-500/20 hover:bg-blue-500/10"
        : "bg-red-500/5 border-red-500/20 hover:bg-red-500/10";

    // Items array (0-6)
    const items = [p.item0, p.item1, p.item2, p.item3, p.item4, p.item5];
    const trinket = p.item6;

    return (
        <div className={`relative flex items-center p-2 md:p-4 mb-2 rounded-lg border ${teamColorClass} transition-all`}>
            {/* Champion & Level */}
            <div className="relative mr-3 md:mr-6 shrink-0">
                <div className="w-10 h-10 md:w-16 md:h-16 relative">
                    <Image
                        src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${p.championId}.png`}
                        alt={p.championName}
                        fill
                        className="rounded-full object-cover border-2 border-[--card-border]"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-[--card-bg] text-[10px] md:text-sm w-4 h-4 md:w-6 md:h-6 flex items-center justify-center rounded-full border border-[--card-border]">
                        {p.champLevel}
                    </div>
                </div>
            </div>

            {/* Name & Rank */}
            <div className="flex-1 min-w-0 mr-2 md:mr-4">
                <Link
                    href={buildProfileUrl("league", region, p.riotIdGameName, p.riotIdTagline) || 
                        `/league/profile?gameName=${p.riotIdGameName}&tagLine=${p.riotIdTagline}&region=${region}`}
                    className="block font-bold text-sm md:text-lg text-white truncate hover:underline"
                >
                    {p.riotIdGameName}
                </Link>
                <div className="text-[10px] md:text-sm text-gray-400 truncate">
                    #{p.riotIdTagline}
                </div>
            </div>

            {/* KDA & Stats */}
            <div className="text-center mr-2 md:mr-8 min-w-[60px] md:min-w-[100px] shrink-0">
                <div className="text-xs md:text-lg font-bold text-gray-200 whitespace-nowrap">
                    {p.kills} / <span className="text-red-400">{p.deaths}</span> / {p.assists}
                </div>
                <div className="text-[10px] md:text-sm text-gray-400 font-mono hidden sm:block">{kda} KDA</div>
            </div>

            {/* Damage Bar (Visual) - Desktop Only */}
            <div className="w-32 mr-8 hidden lg:block shrink-0">
                <div className="text-sm text-gray-400 mb-1 text-right">{p.totalDamageDealtToChampions.toLocaleString()}</div>
                <div className="h-2 w-full bg-gray-700/50 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full ${p.teamId === 100 ? "bg-blue-400" : "bg-red-400"}`}
                        style={{ width: `${damagePct}%` }}
                    />
                </div>
            </div>

            {/* CS - Tablet+ Only */}
            <div className="text-center mr-8 hidden sm:block w-16 shrink-0">
                <div className="text-base text-gray-300">{p.totalMinionsKilled + p.neutralMinionsKilled}</div>
                <div className="text-sm text-gray-500">CS</div>
            </div>

            {/* Items */}
            <div className="flex gap-0.5 md:gap-1.5 flex-wrap max-w-[140px] md:max-w-none justify-end">
                {items.map((item, i) => (
                    <div key={i} className="w-6 h-6 md:w-10 md:h-10 bg-gray-800 rounded border border-gray-700 relative overflow-hidden">
                        {item > 0 && (
                            <Image
                                src={`https://ddragon.leagueoflegends.com/cdn/15.8.1/img/item/${item}.png`}
                                alt={`Item ${item}`}
                                fill
                                className="object-cover"
                            />
                        )}
                    </div>
                ))}
                {/* Trinket */}
                <div className="w-6 h-6 md:w-10 md:h-10 bg-gray-800 rounded-full border border-gray-700 relative overflow-hidden ml-1 md:ml-2">
                    {trinket > 0 && (
                        <Image
                            src={`https://ddragon.leagueoflegends.com/cdn/15.8.1/img/item/${trinket}.png`}
                            alt={`Trinket ${trinket}`}
                            fill
                            className="object-cover"
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default function FullPageScoreboard({ matchData, region }) {
    if (!matchData) return null;

    const { info } = matchData;
    const participants = info.participants;

    // Calculate global max damage for relative bars
    const maxDamage = Math.max(...participants.map(p => p.totalDamageDealtToChampions));

    // Split teams
    const team100 = participants.filter(p => p.teamId === 100);
    const team200 = participants.filter(p => p.teamId === 200);

    const team100Win = team100[0]?.win;
    const team200Win = team200[0]?.win;

    const team100Kills = team100.reduce((acc, p) => acc + p.kills, 0);
    const team200Kills = team200.reduce((acc, p) => acc + p.kills, 0);

    const team100Gold = team100.reduce((acc, p) => acc + p.goldEarned, 0);
    const team200Gold = team200.reduce((acc, p) => acc + p.goldEarned, 0);

    const TeamHeader = ({ teamId, isWin, kills, gold }) => (
        <div className={`flex justify-between items-center p-4 mb-4 rounded-lg border-l-4 shadow-lg ${teamId === 100
            ? "bg-gradient-to-r from-blue-900/40 to-transparent border-blue-500"
            : "bg-gradient-to-r from-red-900/40 to-transparent border-red-500"
            }`}>
            <div className="flex items-center gap-3">
                <span className={`text-xl font-bold ${teamId === 100 ? "text-blue-400" : "text-red-400"}`}>
                    {isWin ? "VICTORY" : "DEFEAT"}
                </span>
                <span className="text-gray-400 text-sm uppercase tracking-wider">
                    {teamId === 100 ? "Blue Team" : "Red Team"}
                </span>
            </div>
            <div className="flex gap-6 text-sm">
                <div className="flex flex-col items-end">
                    <span className="text-gray-400 text-xs">Total Kills</span>
                    <span className="font-bold text-white text-lg">{kills}</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-gray-400 text-xs">Total Gold</span>
                    <span className="font-bold text-yellow-500 text-lg">{(gold / 1000).toFixed(1)}k</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full">
            {/* Team 100 Column */}
            <div className="flex flex-col">
                <TeamHeader teamId={100} isWin={team100Win} kills={team100Kills} gold={team100Gold} />
                <div className="flex flex-col gap-1">
                    {team100.map(p => (
                        <PlayerRow
                            key={p.participantId}
                            p={p}
                            maxDamage={maxDamage}
                            region={region}
                            gameMode={info.gameMode}
                        />
                    ))}
                </div>
            </div>

            {/* Team 200 Column */}
            <div className="flex flex-col">
                <TeamHeader teamId={200} isWin={team200Win} kills={team200Kills} gold={team200Gold} />
                <div className="flex flex-col gap-1">
                    {team200.map(p => (
                        <PlayerRow
                            key={p.participantId}
                            p={p}
                            maxDamage={maxDamage}
                            region={region}
                            gameMode={info.gameMode}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
