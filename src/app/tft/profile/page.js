import React, { Suspense } from "react";
import ProfilePageContent from "./ProfilePageContent";

// Static metadata
export const metadata = {
	title: "TFT Profile | Clutch.gg",
	description: "View TFT summoner profile, match history, and stats",
};

// Main page component (server component)
export default function TFTProfilePage() {
	return (
		<div className="min-h-screen">
			<Suspense fallback={<ProfileSkeleton />}>
				<ProfilePageContent />
			</Suspense>
		</div>
	);
}

// Skeleton loader for when the content is still loading
function ProfileSkeleton() {
	return (
		<div className="p-4 max-w-screen-xl mx-auto animate-pulse">
			<div className="h-12 bg-gray-700 rounded-lg w-1/3 mb-4"></div>
			<div className="h-64 bg-gray-700 rounded-lg mb-4"></div>
			<div className="h-96 bg-gray-700 rounded-lg"></div>
		</div>
	);
}
