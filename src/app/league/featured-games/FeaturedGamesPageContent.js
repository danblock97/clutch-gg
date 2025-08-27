"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RegionDropdown } from "@/components/league/RegionDropdown";
import { QueueFilterDropdown } from "@/components/league/QueueFilterDropdown";
import { RankFilterDropdown } from "@/components/league/RankFilterDropdown";
import { ChampionFilter } from "@/components/league/ChampionFilter";
import Loading from "@/components/Loading";
import ErrorPage from "@/components/ErrorPage";
import FeaturedGameCard from "@/components/league/FeaturedGameCard";
import { getQueueName, FEATURED_QUEUES } from "@/lib/league/utils";

export default function FeaturedGamesPageContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	
	const [region, setRegion] = useState("ALL");
	const [games, setGames] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [championData, setChampionData] = useState(null);
	const [summonerSpellData, setSummonerSpellData] = useState(null);
	const [latestVersion, setLatestVersion] = useState(null);
	const [selectedQueue, setSelectedQueue] = useState("ALL");
	const [isInitialized, setIsInitialized] = useState(false);
	
	const [availableQueues, setAvailableQueues] = useState(FEATURED_QUEUES);

	// Function to update URL with current filter states
	const updateURL = useCallback((newRegion, newQueue) => {
		const params = new URLSearchParams();
		
		// Add region parameter - support multiple regions separated by comma
		if (newRegion && newRegion !== "ALL") {
			params.set('region', newRegion);
		}
		
		// Add queue parameter - support multiple queues separated by comma
		if (newQueue && newQueue !== "ALL") {
			params.set('queue', newQueue);
		}
		
		const query = params.toString();
		const url = query ? `/league/featured-games?${query}` : '/league/featured-games';
		
		// Update URL without triggering a page refresh
		router.replace(url, { shallow: true });
	}, [router]);

	// Parse URL parameters on component mount
	useEffect(() => {
		if (searchParams && !isInitialized) {
			const regionParam = searchParams.get('region');
			const queueParam = searchParams.get('queue');
			
			// Set region from URL parameter
			if (regionParam) {
				setRegion(regionParam);
			}
			
			// Set queue from URL parameter
			if (queueParam) {
				setSelectedQueue(queueParam);
			}
			
			setIsInitialized(true);
		}
	}, [searchParams, isInitialized]);

	useEffect(() => {
		const fetchDDragonData = async () => {
			try {
				const versionResponse = await fetch(
					"https://ddragon.leagueoflegends.com/api/versions.json"
				);
				const versions = await versionResponse.json();
				const latest = versions[0];
				setLatestVersion(latest);

				const championResponse = await fetch(
					`https://ddragon.leagueoflegends.com/cdn/${latest}/data/en_US/champion.json`
				);
				const championJson = await championResponse.json();
				const champions = {};
				for (const champName in championJson.data) {
					const champ = championJson.data[champName];
					champions[champ.key] = champ;
				}
				setChampionData(champions);

				const summonerSpellsResponse = await fetch(
					`https://ddragon.leagueoflegends.com/cdn/${latest}/data/en_US/summoner.json`
				);
				const summonerSpellsJson = await summonerSpellsResponse.json();
				const spells = {};
				for (const spellName in summonerSpellsJson.data) {
					const spell = summonerSpellsJson.data[spellName];
					spells[spell.key] = spell;
				}
				setSummonerSpellData(spells);
			} catch (err) {
				console.error("Failed to fetch ddragon data", err);
			}
		};
		fetchDDragonData();
	}, []);

	// Update URL when filters change (but only after initialization)
	useEffect(() => {
		if (isInitialized) {
			updateURL(region, selectedQueue);
		}
	}, [region, selectedQueue, isInitialized, updateURL]);

	useEffect(() => {
		// Only fetch games after URL parameters have been parsed
		if (!isInitialized) return;
		
		const fetchGames = async () => {
			setLoading(true);
			setError(null);
			try {
				const allRegions = [
					"BR1", "EUN1", "EUW1", "JP1", "KR", "LA1", "LA2", "ME1", "NA1", "OC1", "RU", "SG2", "TR1", "TW2", "VN2"
				];
				let allGames = [];

				// Handle multiple regions (comma-separated) or "ALL"
				let regionsToFetch = [];
				if (region === "ALL") {
					regionsToFetch = allRegions;
				} else if (region.includes(",")) {
					// Handle comma-separated regions like "EUW1,NA1"
					regionsToFetch = region.split(",").map(r => r.trim().toUpperCase());
				} else {
					// Single region
					regionsToFetch = [region.toUpperCase()];
				}

				const fetchPromises = regionsToFetch.map(async (r) => {
					try {
						// If multiple queues are selected, fetch all games and filter client-side
						const queueParam = selectedQueue.includes(",") ? "ALL" : selectedQueue;
						const params = new URLSearchParams({
							region: r,
							queue: queueParam,
						});
						const response = await fetch(
							`/api/league/featured-games?${params.toString()}`
						);
						if (!response.ok) {
							throw new Error(`Failed to fetch games for region ${r}: ${response.statusText}`);
						}
						const data = await response.json();
						return data.gameList || [];
					} catch (err) {
						return [];
					}
				});
				const results = await Promise.all(fetchPromises);
				allGames = results.flat();

				// Filter games by selected queues if not "ALL"
				if (selectedQueue !== "ALL") {
					const selectedQueueIds = selectedQueue.split(",").map(q => parseInt(q.trim()));
					allGames = allGames.filter(game => selectedQueueIds.includes(game.gameQueueConfigId));
				}

				setGames(allGames);

				// No need to update availableQueues since we use the static FEATURED_QUEUES list

			} catch (err) {
				console.error("Error in fetchGames: ", String(err));
				setError(String(err.message));
			} finally {
				setLoading(false);
			}
		};

		fetchGames();
	}, [region, selectedQueue, isInitialized]);

	return (
		<div className="container mx-auto p-4 min-h-screen pb-20">
			<div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
				<h1 className="text-3xl font-bold text-[--text-primary] shrink-0">
					Featured Live Games
				</h1>
				<div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
					<RegionDropdown
						region={region}
						setRegion={setRegion}
						disabled={loading}
					/>
					<QueueFilterDropdown
						queues={availableQueues}
						selectedQueue={selectedQueue}
						setSelectedQueue={setSelectedQueue}
						disabled={loading}
					/>
					
				</div>
			</div>

			{loading && <Loading />}
			{error && <ErrorPage error={error} />}

			{!loading && !error && (
				<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
					{games.length > 0 ? (
						games.map((game) => (
							<FeaturedGameCard
								key={game.gameId}
								game={game}
								championData={championData}
								summonerSpellData={summonerSpellData}
								ddragonVersion={latestVersion}
								region={game.platformId} // Pass the actual region of the game
							/>
						))
					) : (
						<div className="text-center py-10 col-span-full">
							<p className="text-lg text-[--text-secondary]">
								No featured games available with the selected filters.
							</p>
						</div>
					)}
				</div>
			)}
		</div>
	);
}