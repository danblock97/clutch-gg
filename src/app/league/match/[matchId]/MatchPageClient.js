"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaChartBar, FaListAlt, FaArrowLeft, FaClock, FaCalendarAlt, FaTable, FaUsers, FaInfoCircle } from "react-icons/fa";
import FullPageScoreboard from "@/components/league/FullPageScoreboard";
import TimelineGraphs from "@/components/league/TimelineGraphs";
import TeamAnalysisTab from "@/components/league/TeamAnalysisTab";
import StatsTab from "@/components/league/StatsTab";

const MATCH_QUEUES = {
    0: "Custom",
    400: "Normal Draft",
    420: "Ranked Solo/Duo",
    430: "Blind Pick",
    440: "Ranked Flex",
    450: "ARAM",
    490: "Quickplay",
    700: "Clash",
    720: "ARAM Clash",
    900: "ARURF",
    1700: "Arena",
    1710: "Arena",
    1900: "URF",
    1810: "Swarm",
    1820: "Swarm",
    1830: "Swarm",
    1840: "Swarm",
    // Add more legacy if needed
};

const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
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

export default function MatchPageClient({ matchId, matchData, timeline, region }) {
    const [activeTab, setActiveTab] = useState("overview");

    if (!matchData) return null;

    const { info } = matchData;
    const gameCreation = info.gameCreation;
    const gameDuration = info.gameDuration;
    const queueId = info.queueId;
    const queueName = MATCH_QUEUES[queueId] || `Queue ${queueId}`;

    // Determining the result for the "main" player is tricky without a selected summoner.
    // For a neutral view, we can just show "Match Details" or list the winner.
    // We'll calculate who won (Team 100 or 200).
    const winningTeam = info.teams.find((t) => t.win).teamId;
    const winnerText = winningTeam === 100 ? "Blue Team Victory" : "Red Team Victory";
    const winnerColor = winningTeam === 100 ? "text-blue-400" : "text-red-400";
    const headerBorderColor = winningTeam === 100 ? "border-blue-500/30" : "border-red-500/30";

    return (
        <div className="min-h-screen bg-[--background] py-8 px-4 md:px-8 flex justify-center">
            {/* Increased max-width to allow full use of large screens */}
            <div className="w-full max-w-[1920px]">
                {/* Back Link */}
                <Link
                    href={`/league/profile?gameName=Unknown&tagLine=Unknown&region=${region}`}
                    className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors w-fit text-lg"
                    onClick={(e) => {
                        e.preventDefault();
                        window.history.back();
                    }}
                >
                    <FaArrowLeft className="mr-2" /> Back to History
                </Link>

                {/* Hero Header */}
                <div className={`relative overflow-hidden rounded-xl bg-gradient-to-r from-gray-900 to-gray-800 border ${headerBorderColor} p-6 mb-8 shadow-2xl`}>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <h1 className={`text-4xl md:text-5xl font-extrabold ${winnerColor} mb-2 tracking-tight`}>
                                {winnerText}
                            </h1>
                            <div className="flex items-center gap-4 text-gray-300 text-sm md:text-base">
                                <span className="flex items-center font-semibold text-white"><FaListAlt className="mr-2 text-gray-500" /> {queueName}</span>
                                <span className="flex items-center"><FaClock className="mr-2 text-gray-500" /> {formatDuration(gameDuration)}</span>
                                <span className="flex items-center"><FaCalendarAlt className="mr-2 text-gray-500" /> {formatDate(gameCreation)}</span>
                            </div>
                        </div>
                    </div>
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
                        <FaTable className="mr-3" /> Scoreboard
                    </button>
                    <button
                        onClick={() => setActiveTab("teams")}
                        className={`px-6 py-4 font-bold text-lg transition-colors border-b-2 flex items-center whitespace-nowrap ${activeTab === "teams"
                            ? "border-[--accent] text-[--accent]"
                            : "border-transparent text-gray-400 hover:text-gray-200"
                            }`}
                    >
                        <FaUsers className="mr-3" /> Team Breakdown
                    </button>
                    <button
                        onClick={() => setActiveTab("stats")}
                        className={`px-6 py-4 font-bold text-lg transition-colors border-b-2 flex items-center whitespace-nowrap ${activeTab === "stats"
                            ? "border-[--accent] text-[--accent]"
                            : "border-transparent text-gray-400 hover:text-gray-200"
                            }`}
                    >
                        <FaInfoCircle className="mr-3" /> In Depth Stats
                    </button>
                    <button
                        onClick={() => setActiveTab("analysis")}
                        className={`px-6 py-4 font-bold text-lg transition-colors border-b-2 flex items-center whitespace-nowrap ${activeTab === "analysis"
                            ? "border-[--accent] text-[--accent]"
                            : "border-transparent text-gray-400 hover:text-gray-200"
                            }`}
                    >
                        <FaChartBar className="mr-3" /> Timeline Analysis
                    </button>
                </div>

                {/* Tab Content */}
                <div className="animate-fadeIn">
                    {activeTab === "overview" && (
                        <FullPageScoreboard
                            matchData={matchData}
                            region={region}
                        />
                    )}

                    {activeTab === "teams" && (
                        <div className="bg-[--card-bg] rounded-lg border border-[--card-border] overflow-hidden">
                            <TeamAnalysisTab matchDetails={[matchData]} matchId={matchId} />
                        </div>
                    )}

                    {activeTab === "stats" && (
                        <StatsTab matchDetails={[matchData]} matchId={matchId} />
                    )}

                    {activeTab === "analysis" && (
                        <div className="grid grid-cols-1 gap-8">
                            <TimelineGraphs timeline={timeline} match={matchData} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
