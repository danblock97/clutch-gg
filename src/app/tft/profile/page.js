import React, { Suspense } from "react";
import ProfilePageContent from "./ProfilePageContent";
import Loading from "@/components/Loading";

// Static metadata
export const metadata = {
	title: "Teamfight Tactics Profile - ClutchGG",
	description: "View detailed Teamfight Tactics profile statistics including match history, rank progression, unit performance, and trait analysis.",
	keywords: ["TFT profile", "Teamfight Tactics stats", "TFT match history", "auto chess", "TFT rank", "TFT units", "TFT traits"],
	openGraph: {
		title: "Teamfight Tactics Profile - ClutchGG",
		description: "View detailed Teamfight Tactics profile statistics including match history, rank progression, unit performance, and trait analysis.",
		type: "profile",
		images: [
			{
				url: "/images/logo.png",
				width: 1200,
				height: 630,
				alt: "Teamfight Tactics Profile",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Teamfight Tactics Profile - ClutchGG",
		description: "View detailed Teamfight Tactics profile statistics including match history, rank progression, unit performance, and trait analysis.",
		images: ["/images/logo.png"],
	},
};

// Main page component (server component)
export default function TFTProfilePage() {
	return (
		<div className="min-h-screen">
			<Suspense fallback={<Loading />}>
				<ProfilePageContent />
			</Suspense>
		</div>
	);
}
