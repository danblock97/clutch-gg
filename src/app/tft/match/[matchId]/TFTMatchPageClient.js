"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FaChessBoard, FaArrowLeft, FaClock, FaCalendarAlt, FaTrophy, FaChartBar } from "react-icons/fa";
import TFTFullPageScoreboard from "@/components/tft/TFTFullPageScoreboard";
import TFTAnalysis from "@/components/tft/TFTAnalysis";

const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return `${m}m ${s}s`;
};

const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
    });
};

const TFT_QUEUES = {
    1090: "Normal",
    1100: "Ranked",
    1130: "Hyper Roll",
    1160: "Double Up",
    1170: "Fortune's Favor",
    1200: "Double Up Workshop",
    // Add more as needed
};

export default function TFTMatchPageClient({ matchId, matchData, region }) {
    const [activeTab, setActiveTab] = useState("overview");
    const [playersData, setPlayersData] = useState({});

    // Fetch player names/tags for consistent display across tabs
    useEffect(() => {
        if (!matchData) return;
        const { info } = matchData;
        const players = {};
        info.participants.forEach((p) => {
            if (p.puuid) {
                players[p.puuid] = {
                    name: p.riotIdGameName || "Unknown",
                    tagLine: p.riotIdTagline || "",
                };
            }
        });
        setPlayersData(players);
    }, [matchData]);

    if (!matchData) return null;

    const { info } = matchData;
    const gameDatetime = info.game_datetime;
    const gameLength = info.game_length;
    const tftSetNumber = info.tft_set_number;

    // Determine game type from queue_id, falling back to tft_game_type or Standard
    const gameType = TFT_QUEUES[info.queue_id] || info.tft_game_type || "Standard";

    return (
        <div className="min-h-screen bg-[--background] py-8 px-4 md:px-8 flex justify-center">
            {/* Wider container for premium feel */}
            <div className="w-full max-w-[1920px]">
                {/* Back Link */}
                <Link
                    href={`/tft/profile?gameName=Unknown&tagLine=Unknown&region=${region}`}
                    className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors w-fit text-lg"
                    onClick={(e) => {
                        e.preventDefault();
                        window.history.back();
                    }}
                >
                    <FaArrowLeft className="mr-2" /> Back to History
                </Link>

                {/* Hero Header */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-900 to-purple-900 border border-[--card-border] p-6 mb-8 shadow-2xl">
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">
                                TFT Set {tftSetNumber}
                            </h1>
                            <div className="flex items-center gap-4 text-purple-200 text-sm md:text-base">
                                <span className="flex items-center capitalize"><FaTrophy className="mr-2" /> {gameType}</span>
                                <span className="flex items-center"><FaClock className="mr-2" /> {formatDuration(gameLength)}</span>
                                <span className="flex items-center"><FaCalendarAlt className="mr-2" /> {formatDate(gameDatetime)}</span>
                            </div>
                        </div>
                    </div>
                    {/* Decorative background circle */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-20 bg-purple-500"></div>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-[--card-border] mb-8 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab("overview")}
                        className={`px-6 py-4 font-bold text-lg transition-colors border-b-2 flex items-center whitespace-nowrap ${activeTab === "overview"
                            ? "border-[--accent] text-[--accent]"
                            : "border-transparent text-gray-400 hover:text-gray-200"
                            }`}
                    >
                        <FaChessBoard className="mr-3" /> Scoreboard
                    </button>
                    <button
                        onClick={() => setActiveTab("analysis")}
                        className={`px-6 py-4 font-bold text-lg transition-colors border-b-2 flex items-center whitespace-nowrap ${activeTab === "analysis"
                            ? "border-[--accent] text-[--accent]"
                            : "border-transparent text-gray-400 hover:text-gray-200"
                            }`}
                    >
                        <FaChartBar className="mr-3" /> Analysis
                    </button>
                </div>

                {/* Tab Content */}
                <div className="animate-fadeIn">
                    {activeTab === "overview" && (
                        <TFTFullPageScoreboard
                            matchDetails={[matchData]}
                            matchId={matchId}
                            summonerData={null}
                            region={region}
                            preloadedPlayers={playersData}
                        />
                    )}

                    {activeTab === "analysis" && (
                        <TFTAnalysis
                            matchDetails={[matchData]}
                            matchId={matchId}
                            playersData={playersData}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
