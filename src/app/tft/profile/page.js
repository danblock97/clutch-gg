import React, { Suspense } from "react";
import ProfilePageContent from "./ProfilePageContent";
import Loading from "@/components/Loading";

// Static metadata
export const metadata = {
	title: "TFT Profile | Clutch.gg",
	description: "View TFT summoner profile, match history, and stats",
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
