"use client";
import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    LineChart,
    Line,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[--card-bg] border border-[--card-border] p-3 rounded shadow-xl">
                <p className="font-bold text-white mb-1">{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} style={{ color: entry.color }} className="text-sm font-medium">
                        {entry.name}: {entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function TFTAnalysis({ matchDetails, matchId, playersData }) {
    if (!matchDetails) return null;
    const match = matchDetails.find((m) => m.metadata.match_id === matchId);
    if (!match) return null;

    const participants = match.info.participants || [];

    // Sort by placement (1st to 8th) for consistent viewing
    const sortedParticipants = [...participants].sort((a, b) => a.placement - b.placement);

    const formatData = sortedParticipants.map(p => {
        const puuid = p.puuid;
        const name = playersData[puuid]?.name || "Unknown";
        return {
            name: name,
            placement: p.placement,
            damage: p.total_damage_to_players,
            eliminated: p.players_eliminated,
            goldLeft: p.gold_left,
            lastRound: p.last_round,
            level: p.level,
        };
    });

    const COLORS = [
        "#FFD700", // 1st - Gold
        "#C0C0C0", // 2nd - Silver
        "#CD7F32", // 3rd - Bronze
        "#60A5FA", // 4th - Blue
        "#9CA3AF", // 5th - Gray
        "#6B7280", // 6th
        "#4B5563", // 7th
        "#374151"  // 8th
    ];

    return (
        <div className="flex flex-col gap-8 w-full animate-fadeIn">

            {/* Damage Dealt Chart */}
            <div className="bg-[--card-bg] border border-[--card-border] rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                    <span className="w-1 h-6 bg-red-500 rounded-full mr-3"></span>
                    Damage Dealt to Players
                </h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={formatData}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={true} vertical={false} />
                            <XAxis type="number" stroke="#9CA3AF" fontSize={12} tickFormatter={(val) => `${val}`} />
                            <YAxis
                                dataKey="name"
                                type="category"
                                stroke="#E5E7EB"
                                fontSize={12}
                                width={100}
                                tickFormatter={(val) => val.length > 10 ? `${val.substring(0, 10)}...` : val}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
                            <Bar dataKey="damage" name="Damage" radius={[0, 4, 4, 0]} barSize={20}>
                                {formatData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Survival & Eliminations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Rounds Survived */}
                <div className="bg-[--card-bg] border border-[--card-border] rounded-xl p-6 shadow-lg">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                        <span className="w-1 h-6 bg-green-500 rounded-full mr-3"></span>
                        Rounds Survived
                    </h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={formatData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#9CA3AF"
                                    fontSize={10}
                                    interval={0}
                                    tickFormatter={(val) => val.length > 8 ? `${val.substring(0, 6)}..` : val}
                                />
                                <YAxis stroke="#9CA3AF" fontSize={12} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
                                <Bar dataKey="lastRound" name="Last Round" fill="#10B981" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Players Eliminated */}
                <div className="bg-[--card-bg] border border-[--card-border] rounded-xl p-6 shadow-lg">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                        <span className="w-1 h-6 bg-purple-500 rounded-full mr-3"></span>
                        Players Eliminated
                    </h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={formatData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#9CA3AF"
                                    fontSize={10}
                                    interval={0}
                                    tickFormatter={(val) => val.length > 8 ? `${val.substring(0, 6)}..` : val}
                                />
                                <YAxis stroke="#9CA3AF" fontSize={12} allowDecimals={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
                                <Bar dataKey="eliminated" name="Kills" fill="#8B5CF6" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Economy (Gold Left) - Maybe less useful but available */}
            <div className="bg-[--card-bg] border border-[--card-border] rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                    <span className="w-1 h-6 bg-yellow-500 rounded-full mr-3"></span>
                    Gold Unspent
                </h3>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={formatData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={true} vertical={false} />
                            <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                            <YAxis
                                dataKey="name"
                                type="category"
                                stroke="#E5E7EB"
                                fontSize={12}
                                width={120}
                                tickFormatter={(val) => val.length > 12 ? `${val.substring(0, 12)}...` : val}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
                            <Bar dataKey="goldLeft" name="Gold Left" fill="#F59E0B" radius={[0, 4, 4, 0]} barSize={24} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <p className="text-gray-400 text-sm mt-4 italic text-center">
                    *TFT API currently provides limited economy data (Gold Left only).
                </p>
            </div>
        </div>
    );
}
