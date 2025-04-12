import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

/**
 * Format game time in minutes and seconds
 */
function formatGameTime(ms) {
	const s = Math.floor((ms / 1000) % 60);
	const m = Math.floor((ms / 60000) % 60);
	return `${m}m ${s}s`;
}

/**
 * TFT LiveGame component
 */
export default function LiveGame({ liveGameData, region }) {
	const [time, setTime] = useState("");

	// Set game timer
	useEffect(() => {
		const updateTimer = () => {
			const now = Date.now();
			const dur = now - liveGameData.gameStartTime;
			const s = Math.floor((dur / 1000) % 60);
			const m = Math.floor((dur / 60000) % 60);
			const h = Math.floor(dur / 3600000);
			setTime(`${h > 0 ? h + "h " : ""}${m}m ${s}s`);
		};

		updateTimer();
		const interval = setInterval(updateTimer, 1000);
		return () => clearInterval(interval);
	}, [liveGameData]);

	// Format rank for display
	const formatRank = (rank) => {
		if (!rank || typeof rank !== "string") return "Unranked";
		return rank;
	};

	// Get TFT game mode name
	const getTFTGameMode = (queueId) => {
		switch (queueId) {
			case 1090:
				return "Normal TFT";
			case 1100:
				return "Ranked TFT";
			case 1110:
				return "Tutorial TFT";
			case 1130:
				return "Hyper Roll";
			case 1150:
				return "Double Up";
			default:
				return "Teamfight Tactics";
		}
	};

	const modeName = getTFTGameMode(liveGameData.gameQueueConfigId);
	const isRanked = liveGameData.gameQueueConfigId === 1100;

	// Participant card rendering
	const renderParticipantCard = (p) => {
		const rankTxt = formatRank(p.rank);
		const total = p.wins + p.losses;
		const wr = total > 0 ? ((p.wins / total) * 100).toFixed(0) : 0;

		// Extract tier for conditional display
		const shortRank =
			rankTxt !== "Unranked" ? rankTxt.split(" ")[0].toLowerCase() : null;

		return (
			<div
				key={p.summonerId}
				className="card-highlight text-[--text-primary] border-b border-[--card-border] rounded-md p-3 shadow-md text-center"
			>
				{/* Profile Icon */}
				<div className="relative w-16 h-16 mx-auto mb-2">
					<Image
						src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${
							p.profileIconId || 1
						}.jpg`}
						alt=""
						fill
						className="rounded-full object-cover"
					/>
				</div>

				{/* Summoner Name / Level */}
				<div className="mb-1 text-center text-xs">
					<Link
						href={`/tft/profile?gameName=${p.gameName}&tagLine=${p.tagLine}&region=${region}`}
						className="font-bold hover:underline block truncate max-w-[90px] mx-auto"
					>
						{p.gameName}#{p.tagLine}
					</Link>
					<div className="text-gray-400">Lvl {p.summonerLevel}</div>
				</div>

				{/* Ranked Icon / Rank Text */}
				<div className="flex items-center justify-center text-[11px] my-1">
					{shortRank && shortRank !== "unranked" && (
						<div className="relative w-5 h-5 mr-1">
							<Image
								src={`/images/league/rankedEmblems/${shortRank}.webp`}
								alt=""
								fill
								className="object-contain"
							/>
						</div>
					)}
					<span className="font-semibold">
						{rankTxt !== "Unranked" ? `${rankTxt} (${p.lp} LP)` : "Unranked"}
					</span>
				</div>

				{/* Wins / Losses / Winrate */}
				<div className="text-[11px]">
					<div className="font-bold">
						{p.wins}W / {p.losses}L
					</div>
					<div className="text-gray-400">{wr}% WR</div>
				</div>
			</div>
		);
	};

	return (
		<div className="bg-[#13151b] text-white rounded-md shadow w-full max-w-7xl mx-auto mt-4">
			{/* Header with Mode & Time */}
			<div className="py-3 px-4 text-sm font-bold bg-gray-900 rounded-t-md flex justify-between items-center">
				<span>
					{modeName}
					{isRanked ? " (Ranked)" : ""}
				</span>
				<span>{time}</span>
			</div>

			{/* Grid of participants */}
			<div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-4 gap-4">
				{liveGameData.participants.map((p) => renderParticipantCard(p))}
			</div>
		</div>
	);
}
