import React, { Suspense } from "react";
import { fetchTFTMatchDetail } from "@/lib/tft/tftApi";
import Loading from "@/components/Loading";
import TFTMatchPageClient from "./TFTMatchPageClient";

export async function generateMetadata({ params }) {
	const resolvedParams = await params;
	const matchId = resolvedParams.matchId;
	const platform = matchId?.split("_")[0] || "NA1";
	
	return {
		title: `TFT Match ${matchId} | ClutchGG`,
		description: `View detailed Teamfight Tactics match statistics, player placements, compositions, and augments for match ${matchId}.`,
		alternates: {
			canonical: `https://clutchgg.lol/tft/match/${matchId}`,
		},
		openGraph: {
			title: `TFT Match ${matchId} | ClutchGG`,
			description: `View detailed Teamfight Tactics match statistics, compositions, and player performance.`,
			type: "website",
			url: `https://clutchgg.lol/tft/match/${matchId}`,
			images: [
				{
					url: "/images/og-image.png",
					width: 1200,
					height: 630,
					alt: "Teamfight Tactics Match",
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title: `TFT Match ${matchId} | ClutchGG`,
			description: `View detailed Teamfight Tactics match statistics, compositions, and player performance.`,
			images: ["/images/og-image.png"],
		},
	};
}

const getPlatformFromMatchId = (matchId) => {
    if (!matchId || typeof matchId !== "string") return "NA1";
    const parts = matchId.split("_");
    return parts.length > 0 ? parts[0] : "NA1";
};

const TFTMatchPageContent = async ({ params }) => {
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
        const matchData = await fetchTFTMatchDetail(matchId, routingRegion);

        if (!matchData) {
            return (
                <div className="min-h-screen flex items-center justify-center text-white">
                    Match not found or API error.
                </div>
            );
        }

        return (
            <TFTMatchPageClient
                matchId={matchId}
                matchData={matchData}
                region={platform}
            />
        );
    } catch (error) {
        console.error("Error loading TFT match page:", error);
        return (
            <div className="min-h-screen flex items-center justify-center text-white">
                Error loading match data.
            </div>
        );
    }
};

export default async function TFTMatchPage({ params }) {
    const resolvedParams = await params;
    return (
        <Suspense fallback={<Loading />}>
            <TFTMatchPageContent params={resolvedParams} />
        </Suspense>
    );
}
