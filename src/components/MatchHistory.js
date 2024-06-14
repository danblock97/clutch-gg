import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const fetchArenaAugments = async () => {
	const response = await fetch(
		"https://raw.communitydragon.org/latest/cdragon/arena/en_us.json"
	);
	const data = await response.json();
	return data.augments;
};

const MatchHistory = ({
	matchDetails,
	selectedSummonerPUUID,
	gameName,
	tagLine,
}) => {
	const [augments, setAugments] = useState([]);
	const router = useRouter();

	useEffect(() => {
		const getAugments = async () => {
			const data = await fetchArenaAugments();
			setAugments(data);
		};
		getAugments();
	}, []);

	const getAugmentIcon = (id) => {
		const augment = augments.find((aug) => aug.id === id);
		return augment && augment.iconSmall
			? `https://raw.communitydragon.org/latest/game/${augment.iconSmall}`
			: '/images/placeholder.png';  // Placeholder image URL
	};

	if (!matchDetails || matchDetails.length === 0) {
		return (
			<div className="bg-[#18141c] text-[#979aa0] p-4 rounded-md">
				No match history available
			</div>
		);
	}

	const filteredMatches = matchDetails.filter((match) =>
		match.info.participants.some(
			(participant) => participant.puuid === selectedSummonerPUUID
		)
	);

	if (filteredMatches.length === 0) {
		return (
			<div className="bg-[#18141c] text-[#979aa0] p-4 rounded-md">
				No match history available for this summoner
			</div>
		);
	}

	const handleClick = (matchId) => {
		if (window.innerWidth > 768) {
			router.push(
				`/match?gameName=${gameName}&tagLine=${tagLine}&matchId=${matchId}`
			);
		}
	};

	const getOutcomeClass = (win) => {
		return win ? "text-green-500" : "text-red-500";
	};

	const getGradientBackground = (win) => {
		return win
			? "bg-gradient-to-tl from-black via-green-900/20 to-transparent"
			: "bg-gradient-to-tl from-black via-red-900/20 to-transparent";
	};

	const truncateName = (name, maxLength) => {
		if (name.length > maxLength) {
			return name.substring(0, maxLength) + '...';
		}
		return name;
	};

	const isWard = (itemId) => {
		const wardItems = [3340, 3363, 2055, 2049, 2301, 2302, 2303];
		return wardItems.includes(itemId);
	};

	return (
		<div className="text-[#979aa0] p-4 w-full">
			{filteredMatches.map((match, index) => {
				const currentPlayer = match.info.participants.find(
					(participant) => participant.puuid === selectedSummonerPUUID
				);

				const items = Array.from({ length: 7 }, (_, i) => currentPlayer[`item${i}`]);
				const ward = items[6];

				const gameCreation = new Date(match.info.gameCreation);
				const now = new Date();
				const timeDifference = Math.abs(now - gameCreation);
				const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
				const hoursDifference = Math.floor(timeDifference / (1000 * 60 * 60));
				const minutesDifference = Math.floor(timeDifference / (1000 * 60));

				const timeAgo = daysDifference > 0 ? `${daysDifference} days ago` : hoursDifference > 0 ? `${hoursDifference} hours ago` : `${minutesDifference} minutes ago`;

				const kda = ((currentPlayer.kills + currentPlayer.assists) / Math.max(1, currentPlayer.deaths)).toFixed(1);
				const csPerMin = (currentPlayer.totalMinionsKilled / (match.info.gameDuration / 60)).toFixed(1);
				const dpm = (currentPlayer.totalDamageDealtToChampions / (match.info.gameDuration / 60)).toFixed(1);

				const augments = [
					currentPlayer.playerAugment1,
					currentPlayer.playerAugment2,
					currentPlayer.playerAugment3,
					currentPlayer.playerAugment4,
				];

				const goldEarned = currentPlayer.goldEarned.toLocaleString();

				return (
					<div
						key={index}
						onClick={() => handleClick(match.metadata.matchId)}
						className={`rounded-md shadow-md p-4 cursor-pointer flex flex-col relative ${getGradientBackground(currentPlayer.win)}`}
					>
						<div className="absolute top-4 left-4 flex items-start">
							<div className="flex items-center mr-4">
								<Image
									src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${currentPlayer.championId}.png`}
									alt="Champion Icon"
									className="w-12 h-12"
									width={48}
									height={48}
								/>
							</div>
							<div className="flex flex-col">
								<div className="flex items-center mb-4">
									<p className={`font-semibold mr-2 ${getOutcomeClass(currentPlayer.win)}`}>
										{currentPlayer.win ? "Victory" : "Defeat"}
									</p>
									<p className="text-sm mr-2">• {match.info.queueId === 420 ? "Ranked Solo" : "Ranked Flex"}</p>
									<p className="text-sm mr-2">• {match.info.gameDuration >= 300 ? `${Math.floor(match.info.gameDuration / 60)}:${match.info.gameDuration % 60}` : "Remake"}</p>
									<p className="text-sm">• {timeAgo}</p>
								</div>
								<div className="flex ">
									<div className="flex flex-col mr-8">
										<p className="text-md font-bold">{kda} KDA</p>
										<p className="text-md">{currentPlayer.kills}/{currentPlayer.deaths}/{currentPlayer.assists}</p>
									</div>
									{match.info.queueId === 1700 ? (
										<div className="flex flex-col">
											<p className="text-md font-bold">{dpm} DPM</p>
											<p className="text-md">{goldEarned} Gold</p>
										</div>
									) : (
										<div className="flex flex-col">
											<p className="text-md font-bold">{csPerMin} CS/Min</p>
											<p className="text-md">{currentPlayer.totalMinionsKilled} CS</p>
										</div>
									)}
								</div>
							</div>
						</div>
						<div className="flex justify-between mb-2 mt-24">
							<div className="flex items-start">
								{/* If I remove this, the whole design breaks? */}
							</div>
						</div>
						<div className="absolute top-16 right-64 flex items-center justify-center">
							<div className="flex flex-col items-center mr-4">
								{[currentPlayer.summoner1Id, currentPlayer.summoner2Id].map(
									(spellId, idx) => (
										<Image
											key={idx}
											src={`/images/summonerSpells/${spellId}.png`}
											alt={`Summoner Spell ${idx + 1}`}
											width={20}
											height={20}
											className="w-7 h-7"
										/>
									)
								)}
							</div>
							<div className="grid grid-cols-4 gap-1">
								{items.slice(0, 3).map((itemId, idx) => (
									<div key={idx} className="flex items-center">
										{itemId > 0 ? (
											<Image
												src={`https://ddragon.leagueoflegends.com/cdn/14.12.1/img/item/${itemId}.png`}
												alt="Item"
												width={20}
												height={20}
												className="w-7 h-7"
											/>
										) : (
											<Image
												src="/images/placeholder.png"
												alt="No item"
												width={20}
												height={20}
												className="w-5 h-5"
											/>
										)}
									</div>
								))}
								{ward && (
									<div className="flex items-center">
										<Image
											src={`https://ddragon.leagueoflegends.com/cdn/14.12.1/img/item/${ward}.png`}
											alt="Ward"
											width={20}
											height={20}
											className="w-7 h-7"
										/>
									</div>
								)}
								{items.slice(3, 6).map((itemId, idx) => (
									<div key={idx} className="flex items-center">
										{itemId > 0 ? (
											<Image
												src={`https://ddragon.leagueoflegends.com/cdn/14.12.1/img/item/${itemId}.png`}
												alt="Item"
												width={20}
												height={20}
												className="w-7 h-7"
											/>
										) : (
											<></>
										)}
										</div>
								))}
							</div>
						</div>
						{match.info.queueId === 1700 ? ( // Check if it's arena mode
							<div className="absolute top-6 right-16 flex">
								<div className="grid grid-cols-2 gap-2">
									{augments.map((augmentId, idx) => (
										<div key={idx} className="flex items-center">
											<Image
												src={getAugmentIcon(augmentId)}
												alt={`Augment ${idx + 1}`}
												className="w-10 h-10" // Increased size
												width={48}
												height={48}
											/>
										</div>
									))}
								</div>
							</div>
						) : (
							<div className="absolute top-4 right-1 flex">
								<div className="flex flex-col items-start mr-4">
									{winningTeam.map((participant, idx) => (
										<div key={idx} className="flex items-center mb-1">
											<Image
												src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${participant.championId}.png`}
												alt="Participant Champion"
												width={20}
												height={20}
												className="w-5 h-5 mr-1"
											/>
											<p className="text-sm truncate" style={{ width: '100px' }}>
												<span className={`${participant.puuid === selectedSummonerPUUID ? 'font-semibold text-white' : ''}`}>
													{truncateName(participant.riotIdGameName, 7)}
												</span>
											</p>
										</div>
									))}
								</div>
								<div className="flex flex-col items-start">
									{losingTeam.map((participant, idx) => (
										<div key={idx} className="flex items-center mb-1">
											<Image
												src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${participant.championId}.png`}
												alt="Participant Champion"
												width={20}
												height={20}
												className="w-5 h-5 mr-1"
											/>
											<p className="text-sm truncate" style={{ width: '100px' }}>
												<span className={`${participant.puuid === selectedSummonerPUUID ? 'font-semibold text-white' : ''}`}>
													{truncateName(participant.riotIdGameName, 7)}
												</span>
											</p>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
};

export default MatchHistory;
