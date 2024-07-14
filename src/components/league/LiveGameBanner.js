import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const LiveGameBanner = ({ liveGameData, gameName, tagLine }) => {
	const router = useRouter();

	const handleLiveGameClick = () => {
		router.push(`/league/live-game?gameName=${gameName}&tagLine=${tagLine}`);
	};

	const participant = liveGameData.participants.find(
		(p) => p.gameName === gameName && p.tagLine === tagLine
	);

	return (
		<div
			className="bg-[#13151b] text-white p-4 rounded-md mb-4 cursor-pointer flex items-center space-x-4 w-full"
			onClick={handleLiveGameClick}
		>
			{participant && (
				<Image
					src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${participant.championId}.png`}
					alt="Champion Icon"
					width={48}
					height={48}
					className="rounded-full"
				/>
			)}
			<div>
				<p className="font-bold">Live Game In Progress!</p>
				{participant && (
					<p className="text-sm text-gray-300">
						{gameName}#{tagLine} is playing now! Click here for details!
					</p>
				)}
			</div>
		</div>
	);
};

export default LiveGameBanner;
