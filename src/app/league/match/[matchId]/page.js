import React, { Suspense } from "react";
import { fetchMatchDetail, fetchMatchTimeline } from "@/lib/league/leagueApi";
import Loading from "@/components/Loading";
import MatchPageClient from "./MatchPageClient";

// Helper to extract platform from matchId (e.g. "NA1_12345" -> "NA1")
const getPlatformFromMatchId = (matchId) => {
    if (!matchId || typeof matchId !== "string") return "NA1";
    const parts = matchId.split("_");
    return parts.length > 0 ? parts[0] : "NA1";
};

const MatchPageContent = async ({ params }) => {
    const matchId = params.matchId;
    const platform = getPlatformFromMatchId(matchId);

    const normalizedPlatform = platform.toUpperCase();
    const regionMapping = {
        "BR1": "americas",
        "EUN1": "europe",
        "EUW1": "europe",
        "JP1": "asia",
        "KR": "asia",
        "LA1": "americas",
        "LA2": "americas",
        "ME1": "europe",
        "NA1": "americas",
        "OC1": "sea",
        "PH2": "sea",
        "RU": "europe",
        "SG2": "sea",
        "TH2": "sea",
        "TR1": "europe",
        "TW2": "sea",
        "VN2": "sea",
    };
    const routingRegion = regionMapping[normalizedPlatform] || "americas";

    try {
        // Fetch both match details and timeline in parallel
        const [matchData, timeline] = await Promise.all([
            fetchMatchDetail(matchId, routingRegion),
            fetchMatchTimeline(matchId, routingRegion)
        ]);

        if (!matchData) {
            return (
                <div className="min-h-screen flex items-center justify-center text-white">
                    Match not found or API error.
                </div>
            );
        }

        return (
            <MatchPageClient
                matchId={matchId}
                matchData={matchData}
                timeline={timeline}
                region={platform}
            />
        );

    } catch (error) {
        console.error("Error loading match page:", error);
        return (
            <div className="min-h-screen flex items-center justify-center text-white">
                Error loading match data.
            </div>
        );
    }
};

export default async function MatchPage({ params }) {
    const resolvedParams = await params;
    return (
        <Suspense fallback={<Loading />}>
            <MatchPageContent params={resolvedParams} />
        </Suspense>
    );
}
