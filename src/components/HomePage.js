"use client";

import React, { useEffect, useState, lazy, Suspense } from "react";
import Image from "next/image";
import SearchBar from "./SearchBar";
import Link from "next/link";
import {
	FaChartLine,
	FaUsers,
	FaTrophy,
	FaGamepad,
	FaChessKnight,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useGameType } from "@/context/GameTypeContext";
import AstroStatsPromo from "./AstroStatsPromo";

// Lazy load TypeAnimation to reduce initial bundle size
const TypeAnimation = lazy(() => import("react-type-animation").then(mod => ({ default: mod.TypeAnimation })));

const HomePage = () => {
	const { gameType, setGameType } = useGameType(); // Use the shared context
	const router = useRouter();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	// Function to handle leaderboard navigation
	const navigateToLeaderboard = (e) => {
		e.preventDefault();
		const path =
			gameType === "tft" ? "/tft/leaderboard" : "/league/leaderboard";
		router.push(path);
	};

	const features = [
		{
			icon: <FaChartLine className="text-lg" />,
			title: "Performance Analytics",
			description:
				gameType === "tft"
					? "Track your placements, compositions, and item stats"
					: "Track your win rates, KDAs, and champion-specific stats",
		},
		{
			icon: <FaUsers className="text-lg" />,
			title: gameType === "tft" ? "Composition Insights" : "Team Insights",
			description:
				gameType === "tft"
					? "See your most successful traits and units"
					: "See who you play with most and your success with them",
		},
		{
			icon: <FaTrophy className="text-lg" />,
			title: "Ranked Progress",
			description: "Historical rank data across seasons.",
		},
		{
			icon: <FaGamepad className="text-lg" />,
			title: gameType === "tft" ? "Match Details" : "Live Game Stats",
			description:
				gameType === "tft"
					? "In-depth post-game analysis with augments and compositions"
					: "Real-time data for current games with detailed player info",
		},
	];

	return (
		<div className="min-h-screen flex flex-col">
			{/* Hero Section - Adjusted for mobile */}
			<section className="pt-16 md:pt-24 pb-12 md:pb-16 px-4">
				<div className="max-w-6xl mx-auto relative">
					{/* Decorative background orbs + optimized brand watermark */}
					<div className="absolute inset-0 -z-10">
						{/* Optimized logo watermark - reduced size for performance */}
						<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none opacity-20">
							<Image 
								src="/images/logo.png" 
								alt="ClutchGG watermark" 
								width={800} 
								height={800} 
								sizes="(max-width: 640px) 400px, 800px"
								className="w-[400px] sm:w-[600px] md:w-[800px] h-auto blur-0"
								priority={false}
								loading="lazy"
							/>
						</div>
						<div
							className={`orb orb-lg ${gameType === "tft" ? "orb-tft" : "orb-league"}`}
							style={{ top: "-40px", right: "-80px" }}
						></div>
						<div
							className={`orb orb-md ${gameType === "tft" ? "orb-tft" : "orb-league"}`}
							style={{ bottom: "-60px", left: "-40px" }}
						></div>
					</div>

					{/* Content */}
					<div className="flex flex-col items-center text-center gap-6 md:gap-8">
						<h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight">
							<span
								className={`bg-clip-text text-transparent bg-gradient-to-r ${
									gameType === "tft"
										? "from-[--tft-primary] to-[--tft-secondary]"
										: "from-[--primary] to-[--secondary]"
								}`}
							>
								ClutchGG.LOL
							</span>
						</h1>

						<div className="text-lg sm:text-2xl lg:text-4xl font-bold h-10 md:h-16">
							{mounted ? (
								<Suspense fallback={<span>Match History</span>}>
									<TypeAnimation
										sequence={[
											"Match History",
											1000,
											"Match Details",
											1000,
											gameType === "tft" ? "Augments" : "Live Games",
											1000,
											"Ranked Stats",
											1000,
											"Leaderboards",
											1000,
										]}
										wrapper="span"
										speed={50}
										repeat={Infinity}
									/>
								</Suspense>
							) : (
								<span>Match History</span>
							)}
						</div>

						<p className="text-[--text-secondary] text-base lg:text-lg max-w-2xl">
							{gameType === "tft"
								? "Your ultimate destination for comprehensive Teamfight Tactics analytics, match history, and player performance insights."
								: "Your ultimate destination for in-depth League of Legends analytics and real-time insights into players' performance."}
						</p>

						<div className={`w-full max-w-2xl p-2 md:p-3 search-surface ${gameType === "tft" ? "ring-tft" : "ring-league"}`}>
							<SearchBar initialGameType={gameType} />
						</div>

						<div className="flex flex-wrap justify-center gap-4 pt-2">
							<button
								onClick={navigateToLeaderboard}
								className={
									gameType === "tft" ? "btn-primary-tft" : "btn-primary"
								}
							>
								<span>Leaderboards</span>
							</button>
							<Link
								href="https://discord.gg/BeszQxTn9D"
								target="_blank"
								className={
									gameType === "tft" ? "btn-outline-tft" : "btn-outline"
								}
							>
								Join Discord
							</Link>
						</div>
					</div>
				</div>
			</section>

			{/* Features Section - Added padding for mobile */}
			<section className="py-12 md:py-20 bg-[--card-bg]/50 mb-12 md:mb-24">
				<div className="max-w-6xl mx-auto px-4 sm:px-6">
					<div className="text-center mb-10 md:mb-16">
						<h2 className="text-2xl md:text-3xl font-bold mb-4">
							Elevate Your League Experience
						</h2>
						<p className="text-[--text-secondary] max-w-2xl mx-auto">
							ClutchGG.LOL provides powerful tools to analyze and improve your
							gameplay
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
						{features.map((feature, index) => (
							<div key={index} className="feature-card p-6">
								<div className={`icon-badge ${gameType === "tft" ? "icon-badge-tft" : "icon-badge-league"} mb-4`}>
									{feature.icon}
								</div>
								<h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
								<p className="text-[--text-secondary]">{feature.description}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* AstroStats Discord Promo */}
			<section className="pb-16 md:pb-24">
				<AstroStatsPromo />
			</section>
		</div>
	);
};

export default HomePage;
