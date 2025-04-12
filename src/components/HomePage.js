"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { TypeAnimation } from "react-type-animation";
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

const HomePage = () => {
	const { gameType, setGameType } = useGameType(); // Use the shared context
	const router = useRouter();

	// Function to handle leaderboard navigation
	const navigateToLeaderboard = (e) => {
		e.preventDefault();
		const path =
			gameType === "tft" ? "/tft/leaderboard" : "/league/leaderboard";
		router.push(path);
	};

	const features = [
		{
			icon: (
				<FaChartLine
					className={`${
						gameType === "tft" ? "text-[--tft-primary]" : "text-[--primary]"
					} text-2xl`}
				/>
			),
			title: "Performance Analytics",
			description:
				gameType === "tft"
					? "Track your placements, compositions, and item stats"
					: "Track your win rates, KDAs, and champion-specific stats",
		},
		{
			icon: (
				<FaUsers
					className={`${
						gameType === "tft" ? "text-[--tft-secondary]" : "text-[--secondary]"
					} text-2xl`}
				/>
			),
			title: gameType === "tft" ? "Composition Insights" : "Team Insights",
			description:
				gameType === "tft"
					? "See your most successful traits and units"
					: "See who you play with most and your success with them",
		},
		{
			icon: <FaTrophy className="text-[--gold] text-2xl" />,
			title: "Ranked Progress",
			description: "Historical rank data across seasons.",
		},
		{
			icon: <FaGamepad className="text-[--accent] text-2xl" />,
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
					{/* Content */}
					<div className="flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-12">
						{/* Left side - Text */}
						<div className="w-full lg:w-3/5 text-center lg:text-left space-y-4 md:space-y-6">
							<h1 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold">
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

							<div className="text-xl sm:text-2xl lg:text-4xl font-bold h-12 md:h-16">
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
							</div>

							<p className="text-[--text-secondary] text-base lg:text-lg max-w-xl mx-auto lg:mx-0">
								{gameType === "tft"
									? "Your ultimate destination for comprehensive Teamfight Tactics analytics, match history, and player performance insights."
									: "Your ultimate destination for in-depth League of Legends analytics and real-time insights into players' performance."}
							</p>

							{/* Search Bar - Properly centered on mobile */}
							<div className="flex justify-center lg:block">
								<div className="w-full max-w-xs sm:max-w-sm">
									<SearchBar initialGameType={gameType} />
								</div>
							</div>

							<div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-2">
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

						{/* Right side - Logo and glow */}
						<div className="w-full lg:w-2/5 flex justify-center lg:justify-end">
							<div className="relative w-52 h-52 sm:w-64 sm:h-64 md:w-80 md:h-80">
								<div
									className={`absolute inset-0 rounded-full bg-gradient-to-r ${
										gameType === "tft"
											? "from-[--tft-primary] to-[--tft-secondary]"
											: "from-[--primary] to-[--secondary]"
									} opacity-20 blur-xl`}
								></div>
								<Image
									src="/images/logo.png"
									alt="ClutchGG.LOL Logo"
									width={320}
									height={320}
									className="relative z-10"
									priority
								/>
							</div>
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
							<div
								key={index}
								className={`card-highlight p-6 hover:shadow-2xl transition-all duration-300 border-t-4 ${
									gameType === "tft"
										? "border-[--tft-primary]"
										: "border-[--primary]"
								}`}
							>
								<div className="mb-4">{feature.icon}</div>
								<h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
								<p className="text-[--text-secondary]">{feature.description}</p>
							</div>
						))}
					</div>
				</div>
			</section>
		</div>
	);
};

export default HomePage;
