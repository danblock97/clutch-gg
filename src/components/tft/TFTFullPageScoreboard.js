"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    FaStar,
    FaCoins,
    FaBolt,
    FaCrown,
    FaSkull,
    FaQuestionCircle,
    FaGem,
} from "react-icons/fa";
import {
    fetchTFTCompanions,
    getCompanionIconUrl,
} from "@/lib/tft/companionsApi";

// --- Helper Functions ---

// Map Community Dragon paths to CDN URLs
function mapCDragonAssetPath(jsonPath) {
    if (!jsonPath) return null;
    const lower = jsonPath.toLowerCase().replace("/lol-game-data/assets", "");
    return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default${lower}`;
}

// Get Champion Image URL using the /game/ path with primary/fallback
function getTFTChampionImageUrl(characterId, championName) {
    if (!characterId) return null;

    // Skip loading images for special units like "summon"
    if (characterId.toLowerCase().includes("_summon")) {
        return null;
    }

    let setNumber = null;
    const match = characterId.match(/TFT(\d+)/i);
    if (match && match[1]) {
        setNumber = parseInt(match[1]);
    } else {
        // Cannot determine set number from characterId, return null or a placeholder
        return null;
    }

    let championBaseName = characterId.split("_")[1];
    if (!championBaseName) return null; // Cannot determine base name
    championBaseName = championBaseName.toLowerCase();

    // Use the consistent /game/ path
    const basePath = `https://raw.communitydragon.org/latest/game/assets/characters/tft${setNumber}_${championBaseName}/hud/tft${setNumber}_${championBaseName}_square`;

    // Return primary (.tft_setX.png) and fallback (.png) URLs
    return {
        primary: `${basePath}.tft_set${setNumber}.png`,
        fallback: `${basePath}.png`,
    };
}

// Get border color based on champion cost
function getBorderColorForCost(cost) {
    switch (cost) {
        case 1:
            return "border-gray-500";
        case 2:
            return "border-green-500";
        case 3:
            return "border-blue-500";
        case 4:
            return "border-purple-500";
        case 5:
            return "border-amber-400"; // Gold/Amber for 5 cost
        default:
            return "border-gray-700";
    }
}

// Format stage string for display
function formatStage(round) {
    if (!round || round <= 0) return "-";
    const stage = Math.max(1, Math.floor(round / 7) + 1);
    const subStage = Math.max(1, (round % 7) + 1);
    if (stage < 2) return "-";
    return `${stage}-${subStage}`;
}

// Get trait chip style based on trait tier
function getTraitChipStyle(style) {
    switch (style) {
        case 4:
            return "bg-gradient-to-br from-purple-500 via-fuchsia-500 to-amber-400 text-white shadow-lg border border-purple-300/50"; // Prismatic
        case 3:
            return "bg-amber-500 text-amber-50 border border-amber-400 font-bold shadow-md"; // Gold
        case 2:
            return "bg-gray-400 text-gray-900 border border-gray-300 font-bold"; // Silver
        case 1:
            return "bg-[#cd7f32] text-[#3e240b] border border-[#a86626] font-bold"; // Bronze
        default:
            return "bg-gray-800 text-gray-400 border border-gray-700"; // Inactive
    }
}

// Get placement text styling
function getPlacementClass(placement) {
    if (placement === 1) return "text-amber-400 font-extrabold text-3xl drop-shadow-md";
    if (placement === 2) return "text-gray-300 font-bold text-2xl";
    if (placement === 3) return "text-amber-700 font-bold text-2xl";
    if (placement <= 4) return "text-blue-400 font-bold text-lg";
    return "text-gray-500 font-medium text-lg";
}

// Format placement with ordinal suffix
function formatPlacement(placement) {
    if (placement === 1) return "1st";
    if (placement === 2) return "2nd";
    if (placement === 3) return "3rd";
    return `${placement}th`;
}

// Get text description for trait tiers
function getTierText(style) {
    switch (style) {
        case 4:
            return "Prismatic Tier";
        case 3:
            return "Gold Tier";
        case 2:
            return "Silver Tier";
        case 1:
            return "Bronze Tier";
        default:
            return "";
    }
}

// Handle item image URL with proper path handling
function getItemImageUrl(item) {
    if (!item || !item.iconPath) return null;
    if (item.iconPath.startsWith("http")) return item.iconPath;
    return mapCDragonAssetPath(item.iconPath);
}

// --- Main Component ---

export default function TFTFullPageScoreboard({
    matchDetails,
    matchId,
    summonerData, // Contains puuid of the viewing player
    companionsData: propCompanionsData, // Accept companions data as a prop
    preloadedPlayers, // Accept preloaded player data
}) {
    // State
    const [traitsData, setTraitsData] = useState({});
    const [itemsData, setItemsData] = useState({});
    const [championsData, setChampionsData] = useState({}); // Community Dragon data
    const [augmentsData, setAugmentsData] = useState({}); // Augment data
    const [dataDragonChampions, setDataDragonChampions] = useState({}); // Data Dragon data (for cost)
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [playersData, setPlayersData] = useState(preloadedPlayers || {}); // Summoner names/tags
    const [companionsData, setCompanionsData] = useState(
        propCompanionsData || {}
    ); // Use prop data or initialize empty

    // Effect to Fetch Core TFT Data (Traits, Items, Champions, Augments)
    useEffect(() => {
        async function fetchTFTData() {
            try {
                // Fetch traits
                const traitsResponse = await fetch(
                    "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/tfttraits.json"
                );
                const traitsJson = await traitsResponse.json();
                const traitsMap = {};
                traitsJson.forEach((trait) => {
                    if (trait?.trait_id) {
                        const key = trait.trait_id.toLowerCase();
                        traitsMap[key] = {
                            name: trait.name,
                            description: trait.desc,
                            iconPath: trait.icon_path,
                            effects: trait.effects || [],
                        };
                    }
                });
                setTraitsData(traitsMap);

                // Fetch items
                const itemsResponse = await fetch(
                    "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/tftitems.json"
                );
                const itemsJson = await itemsResponse.json();
                const itemsMap = {};
                itemsJson.forEach((item) => {
                    // Store by numeric ID - use squareIconPath for consistency with MatchHistory
                    if (item.id !== undefined) {
                        itemsMap[item.id] = {
                            name: item.name,
                            description: item.desc,
                            iconPath: item.squareIconPath,
                        };
                    }

                    // Also store by nameId (for TFT_Item_X format)
                    if (item.nameId) {
                        itemsMap[item.nameId.toLowerCase()] = {
                            name: item.name,
                            description: item.desc,
                            iconPath: item.squareIconPath,
                        };
                    }
                });
                setItemsData(itemsMap);

                // Fetch Community Dragon champions (Fallback source for name/traits)
                const championsResponse = await fetch(
                    "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/tftchampions.json"
                );
                const championsJson = await championsResponse.json();
                const championsMap = {};
                championsJson.forEach((champion) => {
                    if (champion?.character_id) {
                        const key = champion.character_id.toLowerCase();
                        championsMap[key] = {
                            name: champion.name,
                            cost: champion.cost,
                            traits: champion.traits || [],
                            iconPath: champion.squareIconPath,
                        };
                    }
                });
                setChampionsData(championsMap);

                // Fetch Data Dragon (Champions for Cost, Augments)
                try {
                    const versionsResponse = await fetch(
                        "https://ddragon.leagueoflegends.com/api/versions.json"
                    );
                    const versions = await versionsResponse.json();
                    const latestVersion = versions[0]; // Get latest LoL patch version

                    // Fetch DDragon Champions (mainly for accurate tier/cost)
                    const dataDragonResponse = await fetch(
                        `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/tft-champion.json`
                    );
                    const ddJson = await dataDragonResponse.json();
                    setDataDragonChampions(ddJson.data || {});

                    // Fetch DDragon Augments
                    const augmentResponse = await fetch(
                        `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/tft-augments.json`
                    );
                    const augJson = await augmentResponse.json();
                    const augMap = {};
                    Object.values(augJson.data || {}).forEach((aug) => {
                        if (aug?.id)
                            augMap[aug.id.toLowerCase()] = {
                                name: aug.name,
                                desc: aug.desc,
                                iconPath: aug.icon,
                            };
                    });
                    setAugmentsData(augMap);
                } catch (error) {
                    console.error("Error fetching Data Dragon data:", error);
                }

                // Fetch companions data if not provided as prop
                if (
                    !propCompanionsData ||
                    Object.keys(propCompanionsData).length === 0
                ) {
                    const companions = await fetchTFTCompanions();
                    setCompanionsData(companions);
                }

                setIsDataLoaded(true);
            } catch (error) {
                console.error("Error fetching base TFT data:", error);
                setIsDataLoaded(true); // Still set loaded to show error or partial data
            }
        }
        fetchTFTData();
    }, [propCompanionsData]);

    // Update companionsData if prop changes
    useEffect(() => {
        if (propCompanionsData && Object.keys(propCompanionsData).length > 0) {
            setCompanionsData(propCompanionsData);
        }
    }, [propCompanionsData]);

    // Effect to Fetch Player Names/Tags
    useEffect(() => {
        if (!matchDetails || !matchId) return;
        const match = matchDetails.find((m) => m.metadata.match_id === matchId);
        if (!match || !match.info?.participants) return;

        const players = {};
        match.info.participants.forEach((p) => {
            if (p.puuid) {
                players[p.puuid] = {
                    name: p.riotIdGameName || p.name || "Unknown",
                    tagLine: p.riotIdTagline || "",
                };
            }
        });
        setPlayersData(players);
    }, [matchDetails, matchId]);

    // Helper to get Champion Cost (Uses Data Dragon first)
    const getChampionCostFromDD = (characterId) => {
        if (!characterId || !dataDragonChampions) return 0;
        const lowerCaseId = characterId.toLowerCase();

        if (dataDragonChampions[lowerCaseId]) {
            return dataDragonChampions[lowerCaseId].tier || 0;
        }

        const nameMatch = lowerCaseId.match(/tft\d+_(.+)/);
        const championKeyPart = nameMatch ? nameMatch[1] : null;

        if (championKeyPart) {
            for (const key in dataDragonChampions) {
                if (key.toLowerCase().endsWith(championKeyPart)) {
                    return dataDragonChampions[key].tier || 0;
                }
            }
        }

        return championsData[lowerCaseId]?.cost || 0;
    };

    // --- Render Logic ---
    if (!matchDetails || !matchId) {
        return (
            <div className="card-highlight p-6 text-center text-[--text-secondary]">
                Loading...
            </div>
        );
    }
    const match = matchDetails.find((m) => m.metadata.match_id === matchId);

    if (!match || !isDataLoaded) {
        return (
            <div className="card-highlight p-6 text-center">
                <p className="text-[--text-secondary]">
                    {isDataLoaded ? "Match data not found." : "Loading match data..."}
                </p>
            </div>
        );
    }

    const participants = match.info.participants || [];
    participants.sort((a, b) => a.placement - b.placement); // Sort by placement

    return (
        <div className="flex flex-col gap-4 w-full">
            {/* Legend/Header - Optional for this view, maybe just distinct cards is better */}

            {participants.map((p, index) => (
                <ParticipantCard
                    key={p.puuid || index}
                    participant={p}
                    traitsData={traitsData}
                    itemsData={itemsData}
                    championsData={championsData}
                    augmentsData={augmentsData}
                    getChampionCostFromDD={getChampionCostFromDD}
                    isCurrentPlayer={p.puuid === summonerData?.puuid}
                    playerData={playersData[p.puuid]}
                    getTFTChampionImageUrl={getTFTChampionImageUrl}
                    mapCDragonAssetPath={mapCDragonAssetPath}
                    companionsData={companionsData}
                    getCompanionIconUrl={getCompanionIconUrl}
                    isFirstPlace={p.placement === 1}
                />
            ))}
        </div>
    );
}

// --- Participant Card Component ---

function ParticipantCard({
    participant,
    traitsData,
    itemsData,
    championsData,
    augmentsData,
    getChampionCostFromDD,
    isCurrentPlayer,
    playerData,
    getTFTChampionImageUrl,
    mapCDragonAssetPath,
    companionsData,
    getCompanionIconUrl,
    isFirstPlace
}) {
    const companion = participant.companion
        ? companionsData[participant.companion.content_ID]
        : null;
    const companionIconUrl = companion
        ? getCompanionIconUrl(companion.iconPath)
        : null;

    // Sort units
    const sortedUnits = [...(participant.units || [])].sort((a, b) => {
        const costA = getChampionCostFromDD(a.character_id);
        const costB = getChampionCostFromDD(b.character_id);
        if (costB !== costA) return costB - costA;
        return (b.tier || 0) - (a.tier || 0);
    });

    // Active traits
    const activeTraits = (participant.traits || [])
        .filter((trait) => trait.style > 0 && traitsData[trait.name?.toLowerCase()])
        .sort(
            (a, b) =>
                (b.style || 0) - (a.style || 0) ||
                (b.num_units || 0) - (a.num_units || 0)
        );

    const participantAugments = participant.augments || [];

    const borderClass = isFirstPlace
        ? "border-amber-400/50 bg-gradient-to-r from-amber-900/10 to-transparent"
        : "border-[--card-border] bg-[--card-bg]";

    const shadowClass = isFirstPlace ? "shadow-2xl shadow-amber-900/20" : "shadow-md";

    return (
        <div className={`relative rounded-xl border ${borderClass} ${shadowClass} transition-all p-4 flex flex-col md:flex-row gap-4 md:items-center`}>
            {/* Left Section: Placement & Player */}
            <div className="flex items-center gap-4 md:w-[25%] shrink-0 border-b md:border-b-0 md:border-r border-gray-700/30 pb-3 md:pb-0 pr-0 md:pr-4">
                <div className="flex flex-col items-center justify-center w-12 shrink-0">
                    <span className={getPlacementClass(participant.placement)}>
                        {formatPlacement(participant.placement)}
                    </span>
                    {isFirstPlace && <FaCrown className="text-amber-400 mt-1 animate-pulse" />}
                </div>

                <div className="flex items-center gap-3 overflow-hidden">
                    {companionIconUrl ? (
                        <div className={`relative w-12 h-12 shrink-0 overflow-hidden rounded-lg border-2 ${isFirstPlace ? "border-amber-400" : "border-gray-600"}`}>
                            <Image
                                src={companionIconUrl}
                                alt="Avatar"
                                width={48}
                                height={48}
                                className="object-cover w-full h-full"
                                unoptimized
                            />
                        </div>
                    ) : (
                        <div className="w-12 h-12 shrink-0 bg-gray-800 rounded-lg"></div>
                    )}

                    <div className="flex flex-col min-w-0">
                        <span className="font-bold text-lg text-white truncate">
                            {playerData?.name || "Unknown"}
                        </span>
                        <span className="text-sm text-gray-400 truncate">
                            Lvl {participant.level} • <span className="text-gray-500">#{playerData?.tagLine}</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Middle Section: Augments & Traits */}
            <div className="flex flex-col gap-3 md:w-[30%] shrink-0">
                {/* Augments */}
                <div className="flex gap-2">
                    {participantAugments.map((aug, idx) => {
                        const augmentInfo = augmentsData[aug.toLowerCase()] || { name: aug };
                        const augUrl = augmentInfo.iconPath ? mapCDragonAssetPath(augmentInfo.iconPath) : null;

                        return (
                            <div key={idx} className="relative w-8 h-8 rounded border border-gray-600 bg-black/40 overflow-hidden group" title={augmentInfo.name}>
                                {augUrl ? (
                                    <Image
                                        src={augUrl}
                                        alt={augmentInfo.name}
                                        width={32}
                                        height={32}
                                        className="object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[10px]"><FaGem /></div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Traits */}
                <div className="flex flex-wrap gap-1">
                    {activeTraits.map((trait) => {
                        const traitInfo = traitsData[trait.name?.toLowerCase()];
                        if (!traitInfo) return null;
                        const styleClass = getTraitChipStyle(trait.style);
                        const iconUrl = traitInfo.iconPath ? mapCDragonAssetPath(traitInfo.iconPath) : null;

                        return (
                            <div key={trait.name} className={`flex items-center px-1.5 py-0.5 rounded-md border ${styleClass} text-xs shadow-sm`} title={`${traitInfo.name}: ${trait.num_units}`}>
                                {iconUrl && (
                                    <Image
                                        src={iconUrl}
                                        alt=""
                                        width={12}
                                        height={12}
                                        className="mr-1 filter drop-shadow hover:brightness-110"
                                        unoptimized
                                    />
                                )}
                                <span className="font-bold">{trait.num_units}</span>
                                <span className="ml-1 opacity-90 hidden xl:inline">{traitInfo.name}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Right Section: Units */}
            <div className="flex flex-wrap gap-1.5 md:w-[45%] grow content-start">
                {sortedUnits.map((unit, idx) => {
                    const championCost = getChampionCostFromDD(unit.character_id);
                    const borderColor = getBorderColorForCost(championCost);
                    const champName = championsData[unit.character_id?.toLowerCase()]?.name || "Unit";
                    const cdnUrl = getTFTChampionImageUrl(unit.character_id, champName);

                    return (
                        <div key={idx} className="flex flex-col items-center group relative">
                            {/* Stars Overlay */}
                            <div className="absolute -top-1.5 z-20 flex w-full justify-center">
                                {Array.from({ length: unit.tier }).map((_, s) => (
                                    <FaStar key={s} className="w-2.5 h-2.5 text-amber-300 drop-shadow-md stroke-black" />
                                ))}
                            </div>

                            {/* Unit Image */}
                            <div className={`relative w-10 h-10 md:w-12 md:h-12 rounded-lg border-2 ${borderColor} overflow-hidden bg-gray-900 shadow-md`}>
                                {cdnUrl ? (
                                    <Image
                                        src={typeof cdnUrl === "object" ? cdnUrl.primary : cdnUrl}
                                        alt={champName}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                        onError={(e) => {
                                            if (typeof cdnUrl === "object" && cdnUrl.fallback) {
                                                e.currentTarget.src = cdnUrl.fallback;
                                            }
                                        }}
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-xs">?</div>
                                )}
                            </div>

                            {/* Items */}
                            <div className="flex gap-0.5 mt-0.5 absolute -bottom-2 z-20">
                                {unit.itemNames?.slice(0, 3).map((itemName, i) => {
                                    const item = itemsData[itemName.toLowerCase()] || itemsData[itemName];
                                    const itemUrl = getItemImageUrl(item);
                                    if (!itemUrl) return null;
                                    return (
                                        <div key={i} className="w-3 h-3 md:w-4 md:h-4 rounded border border-gray-500 bg-black overflow-hidden" title={item?.name}>
                                            <Image src={itemUrl} alt="" width={16} height={16} className="object-cover" unoptimized />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
