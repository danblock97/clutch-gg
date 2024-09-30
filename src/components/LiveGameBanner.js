import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const LiveGameBanner = ({ liveGameData, gameName, tagLine }) => {
	const router = useRouter();

	console.log("Live game data received:", liveGameData);
	console.log(
		"Searching for participant with gameName and tagLine:",
		gameName,
		tagLine
	);

	// Combine gameName and tagLine to match riotid
	const riotId = `${gameName}#${tagLine}`.toLowerCase(); // Normalize to lowercase

	// Find the participant using riotid property
	const participant = liveGameData?.participants?.find(
		(p) => p.riotId?.toLowerCase() === riotId // Compare in lowercase for case insensitivity
	);

	console.log("Found participant:", participant);

	if (!participant) {
		return null;
	}

	const team100 = liveGameData.participants.filter((p) => p.teamId === 100);
	const team200 = liveGameData.participants.filter((p) => p.teamId === 200);

	return (
		<div
			className="bg-[#13151b] text-white p-4 rounded-md mb-4 cursor-pointer flex flex-col w-full hover:bg-[#1c1e24] transition-all duration-200"
			onClick={() =>
				router.push(`/live-game?gameName=${gameName}&tagLine=${tagLine}`)
			}
			role="button"
			aria-label={`Live game in progress`}
		>
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-4">
					<Image
						src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${participant.championId}.png`}
						alt={`${participant.championId} Icon`}
						width={48}
						height={48}
						className="rounded-full"
					/>
					<div>
						<p className="font-bold">Live Game In Progress!</p>
						<p className="text-sm text-gray-300">Click here for details!</p>
					</div>
				</div>
				<div className="flex flex-col space-y-1">
					<div className="flex space-x-2">
						{team100.map((p, index) => (
							<Image
								key={index}
								src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${p.championId}.png`}
								alt={`${p.championId} Icon`}
								width={24}
								height={24}
								className="rounded-full border-2 border-blue-500"
							/>
						))}
					</div>
					<div className="flex space-x-2 mt-1">
						{team200.map((p, index) => (
							<Image
								key={index}
								src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${p.championId}.png`}
								alt={`${p.championId} Icon`}
								width={24}
								height={24}
								className="rounded-full border-2 border-red-500"
							/>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

export default LiveGameBanner;
