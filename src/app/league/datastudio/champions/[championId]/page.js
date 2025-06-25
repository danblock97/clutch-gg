import Image from "next/image";
import ChampionAbilities from "./ChampionAbilities";
import ChampionStats from "./ChampionStats";

async function getChampionData(championId) {
	const res = await fetch(
		`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champions/${championId}.json`,
		{ next: { revalidate: 3600 } }
	);
	if (!res.ok) {
		// This will activate the closest `error.js` Error Boundary
		throw new Error("Failed to fetch champion data");
	}
	const champion = await res.json();

	const versionsRes = await fetch(
		"https://ddragon.leagueoflegends.com/api/versions.json"
	);
	if (!versionsRes.ok) {
		return { champion, championDdragon: null, version: "14.12.1" };
	}
	const versions = await versionsRes.json();
	const latestVersion = versions[0];

	const ddRes = await fetch(
		`https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/champion/${champion.alias}.json`
	);
	if (!ddRes.ok) {
		return { champion, championDdragon: null, version: latestVersion };
	}

	const ddragonData = await ddRes.json();
	const championDdragon = ddragonData.data[champion.alias];

	return { champion, championDdragon, version: latestVersion };
}

export default async function ChampionPage({ params }) {
	const { championId } = await params;
	const { champion, championDdragon, version } = await getChampionData(
		championId
	);
	const splashArt = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default${champion.skins[0].splashPath
		.toLowerCase()
		.replace("/lol-game-data/assets", "")}`;

	return (
		<div className="min-h-screen">
			<div className="relative h-96 w-full">
				<Image
					src={splashArt}
					alt={`${champion.name} Splash Art`}
					layout="fill"
					objectFit="cover"
					className="opacity-30"
					style={{ objectPosition: "center 20%" }}
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
				<div className="container mx-auto px-4 relative h-full flex flex-col justify-end pb-8">
					<h1 className="text-6xl font-bold">{champion.name}</h1>
					<h2 className="text-2xl text-gray-300">{champion.title}</h2>
				</div>
			</div>

			<div className="container mx-auto px-4 py-8">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Left Column */}
					<div className="lg:col-span-1 space-y-8">
						<div className="bg-gray-800/50 p-6 rounded-lg">
							<h3 className="text-2xl font-bold mb-4">Biography</h3>
							<p
								className="text-gray-300"
								dangerouslySetInnerHTML={{
									__html: championDdragon
										? championDdragon.lore
										: champion.shortBio,
								}}
							></p>
						</div>

						{championDdragon && (
							<div className="bg-gray-800/50 p-6 rounded-lg">
								<ChampionStats stats={championDdragon.stats} />
							</div>
						)}

						<div className="bg-gray-800/50 p-6 rounded-lg">
							<h3 className="text-2xl font-bold mb-4">Playstyle Info</h3>
							<div className="space-y-4">
								<div>
									<p className="text-sm text-gray-400 mb-1">Damage</p>
									<div className="w-full bg-gray-700 rounded-full h-2.5">
										<div
											className="bg-red-500 h-2.5 rounded-full"
											style={{
												width: `${(champion.playstyleInfo.damage / 3) * 100}%`,
											}}
										></div>
									</div>
								</div>
								<div>
									<p className="text-sm text-gray-400 mb-1">Durability</p>
									<div className="w-full bg-gray-700 rounded-full h-2.5">
										<div
											className="bg-green-500 h-2.5 rounded-full"
											style={{
												width: `${
													(champion.playstyleInfo.durability / 3) * 100
												}%`,
											}}
										></div>
									</div>
								</div>
								<div>
									<p className="text-sm text-gray-400 mb-1">Crowd Control</p>
									<div className="w-full bg-gray-700 rounded-full h-2.5">
										<div
											className="bg-blue-500 h-2.5 rounded-full"
											style={{
												width: `${
													(champion.playstyleInfo.crowdControl / 3) * 100
												}%`,
											}}
										></div>
									</div>
								</div>
								<div>
									<p className="text-sm text-gray-400 mb-1">Mobility</p>
									<div className="w-full bg-gray-700 rounded-full h-2.5">
										<div
											className="bg-yellow-500 h-2.5 rounded-full"
											style={{
												width: `${
													(champion.playstyleInfo.mobility / 3) * 100
												}%`,
											}}
										></div>
									</div>
								</div>
								<div>
									<p className="text-sm text-gray-400 mb-1">Utility</p>
									<div className="w-full bg-gray-700 rounded-full h-2.5">
										<div
											className="bg-purple-500 h-2.5 rounded-full"
											style={{
												width: `${(champion.playstyleInfo.utility / 3) * 100}%`,
											}}
										></div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Right Column */}
					<div className="lg:col-span-2">
						{championDdragon && (
							<div className="mb-8">
								<ChampionAbilities
									passive={championDdragon.passive}
									spells={championDdragon.spells}
									version={version}
								/>
							</div>
						)}

						<h3 className="text-2xl font-bold mb-4">Skins</h3>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
							{champion.skins
								.filter((s) => s.isBase === false)
								.map((skin) => (
									<div
										key={skin.id}
										className="bg-transparent rounded-lg overflow-hidden group"
									>
										<div className="relative h-48">
											<Image
												src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default${skin.splashPath
													.toLowerCase()
													.replace("/lol-game-data/assets", "")}`}
												alt={skin.name}
												layout="fill"
												objectFit="cover"
												className="transition-transform duration-300 group-hover:scale-105"
											/>
										</div>
										<div className="p-4 bg-gray-800 bg-opacity-50">
											<h4 className="font-bold">{skin.name}</h4>
											{skin.description && (
												<p
													className="text-sm text-gray-400 mt-2"
													dangerouslySetInnerHTML={{ __html: skin.description }}
												></p>
											)}
										</div>
									</div>
								))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
