import React, { Suspense } from "react";
import LeaderboardClient from "@/components/tft/LeaderboardClient";

export const metadata = {
	title: "TFT Leaderboard | Clutch.gg",
	description: "View the top ranked TFT players across different regions",
};

export default function LeaderboardPage() {
	return (
		<div className="min-h-screen pb-16">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<h1 className="text-3xl font-bold text-white mb-6">TFT Leaderboard</h1>
				<Suspense fallback={<LeaderboardSkeleton />}>
					<LeaderboardClient />
				</Suspense>
			</div>
		</div>
	);
}

function LeaderboardSkeleton() {
	return (
		<div className="animate-pulse">
			<div className="flex justify-between items-center mb-6">
				<div className="h-10 bg-gray-700 rounded w-48"></div>
				<div className="h-10 bg-gray-700 rounded w-36"></div>
			</div>
			<div className="bg-gray-800 rounded-lg overflow-hidden">
				<div className="h-12 bg-gray-700 w-full"></div>
				{[...Array(10)].map((_, i) => (
					<div key={i} className="border-t border-gray-700 h-16 w-full"></div>
				))}
			</div>
		</div>
	);
}
