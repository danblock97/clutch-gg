"use client";
import React, { useMemo } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    BarChart,
    Bar,
    Legend
} from "recharts";

const TimelineGraphs = ({ timeline, match }) => {
    // Process timeline data for Gold Advantage
    const goldData = useMemo(() => {
        if (!timeline || !timeline.info || !timeline.info.frames) return [];

        return timeline.info.frames.map((frame, index) => {
            let blueTeamGold = 0;
            let redTeamGold = 0;

            // Participants 1-5 are usually Blue, 6-10 are Red
            Object.values(frame.participantFrames).forEach((pFrame) => {
                if (pFrame.participantId <= 5) {
                    blueTeamGold += pFrame.totalGold;
                } else {
                    redTeamGold += pFrame.totalGold;
                }
            });

            return {
                time: `${index}m`,
                goldDifference: blueTeamGold - redTeamGold, // Positive = Blue Lead, Negative = Red Lead
            };
        });
    }, [timeline]);

    // Process match data for Damage Distribution
    const damageData = useMemo(() => {
        if (!match || !match.info || !match.info.participants) return [];

        return match.info.participants.map((p) => ({
            name: p.championName,
            damage: p.totalDamageDealtToChampions,
            team: p.teamId === 100 ? "Blue" : "Red",
            color: p.teamId === 100 ? "#3b82f6" : "#ef4444", // Blue vs Red colors
        })).sort((a, b) => b.damage - a.damage); // Sort by highest damage
    }, [match]);

    if (!timeline) {
        return <div className="text-gray-400 p-4">Detailed timeline data not available.</div>;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
            {/* Gold Advantage Graph */}
            <div className="bg-[--card-bg] p-4 rounded-lg border border-[--card-border] shadow-lg">
                <h3 className="text-lg font-bold text-white mb-4">Gold Advantage</h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={goldData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="time" stroke="#888" interval={5} />
                            <YAxis stroke="#888" />
                            <Tooltip
                                contentStyle={{ backgroundColor: "#1f2937", border: "none" }}
                                formatter={(value) => [
                                    Math.abs(value),
                                    value > 0 ? "Blue Lead" : "Red Lead",
                                ]}
                            />
                            <ReferenceLine y={0} stroke="#666" />
                            <Line
                                type="monotone"
                                dataKey="goldDifference"
                                stroke="#fbbf24"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="text-center text-xs text-gray-400 mt-2">
                    <span className="text-blue-400">Positive = Blue Team Lead</span> |{" "}
                    <span className="text-red-400">Negative = Red Team Lead</span>
                </div>
            </div>

            {/* Damage Distribution Graph */}
            <div className="bg-[--card-bg] p-4 rounded-lg border border-[--card-border] shadow-lg">
                <h3 className="text-lg font-bold text-white mb-4">Damage to Champions</h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={damageData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis type="number" stroke="#888" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                width={80}
                                stroke="#ccc"
                                tick={{ fontSize: 10 }}
                            />
                            <Tooltip
                                cursor={{ fill: "transparent" }}
                                contentStyle={{ backgroundColor: "#1f2937", border: "none" }}
                            />
                            <Bar dataKey="damage" fill="#8884d8" radius={[0, 4, 4, 0]}>
                                {damageData.map((entry, index) => (
                                    <cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default TimelineGraphs;
