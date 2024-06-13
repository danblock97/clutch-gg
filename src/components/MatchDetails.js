import React, { useEffect, useState } from "react";
import Image from "next/image";
import Loading from "./Loading";
import Link from "next/link";

const fetchArenaAugments = async () => {
    const response = await fetch(
        "https://raw.communitydragon.org/latest/cdragon/arena/en_us.json"
    );
    const data = await response.json();
    return data.augments;
};

const fetchLatestVersion = async () => {
    const response = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
    const versions = await response.json();
    return versions[0]; // The latest version is the first one in the list
};

const MatchDetails = ({ matchDetails, matchId }) => {
    const [augments, setAugments] = useState([]);
    const [latestVersion, setLatestVersion] = useState("");

    useEffect(() => {
        const getAugments = async () => {
            const data = await fetchArenaAugments();
            setAugments(data);
        };

        const getVersion = async () => {
            const version = await fetchLatestVersion();
            setLatestVersion(version);
        };

        getAugments();
        getVersion();
    }, []);

    const getAugmentIcon = (id) => {
        const augment = augments.find((aug) => aug.id === id);
        return augment
            ? `https://raw.communitydragon.org/latest/game/${augment.iconSmall}`
            : null;
    };

    if (!matchDetails) {
        return (
            <div className="text-center text-white">
                <Loading />
            </div>
        );
    }

    const match = matchDetails.find((m) => m.metadata.matchId === matchId);
    if (!match) {
        return (
            <div className="text-center text-white">Match details not found.</div>
        );
    }

    const isArena = match.info.queueId === 1700;

    if (isArena) {
        let participants = match.info.participants;
        let teams = {};

        // Extract playerScore0 and sort
        participants = participants.map((participant) => ({
            ...participant,
            playerScore0: participant.missions.playerScore0,
        }));

        // Sort participants by playerScore0
        participants.sort((a, b) => a.playerScore0 - b.playerScore0);

        // Group participants into pairs
        participants.forEach((participant, index) => {
            const teamId = Math.floor(index / 2); // Creates 8 teams of 2 participants each
            if (!teams[teamId]) {
                teams[teamId] = [];
            }
            teams[teamId].push(participant);
        });

        // Function to convert number to ordinal
        function getOrdinal(n) {
            const s = ["th", "st", "nd", "rd"];
            const v = n % 100;
            return n + (s[(v - 20) % 10] || s[v] || s[0]);
        }

        const getPlacementColor = (placement) => {
            switch (placement) {
                case 1:
                    return "text-yellow-500";
                case 2:
                    return "text-pink-500";
                case 3:
                    return "text-orange-500";
                case 4:
                    return "text-blue-500";
                case 5:
                    return "text-red-500";
                case 6:
                    return "text-green-500";
                case 7:
                    return "text-purple-500";
                case 8:
                    return "text-indigo-500";
                default:
                    return "text-white";
            }
        };

        // Render sorted teams
        const teamComponents = Object.values(teams).map((team, index) => {
            const placement = team[0].playerScore0; // Assuming playerScore0 starts from 0
            const colorClass = getPlacementColor(placement);

            return (
                <div
                    key={index}
                    className="bg-[#13151b] text-white p-4 mb-4 rounded-lg"
                >
                    <h3 className={`text-lg font-bold ${colorClass}`}>
                        {getOrdinal(team[0].playerScore0)} Place
                    </h3>
                    {team.map((participant) => (
                        <ParticipantDetails
                            key={participant.participantId}
                            participant={participant}
                            isArena={true}
                            getAugmentIcon={getAugmentIcon}
                            latestVersion={latestVersion}
                        />
                    ))}
                </div>
            );
        });

        return (
            <div className="bg-[#13151b] min-h-screen flex flex-col items-center justify-center px-4 py-2">
                <div className="max-w-6xl w-full">{teamComponents}</div>
            </div>
        );
    }

    // Regular match logic
    const calculateTeamStats = (participants) => {
        return participants.reduce(
            (acc, participant) => {
                acc.kills += participant.kills;
                acc.deaths += participant.deaths;
                acc.assists += participant.assists;
                return acc;
            },
            {
                kills: 0,
                deaths: 0,
                assists: 0,
            }
        );
    };
    const team1 = match.info.participants.filter((p) => p.teamId === 100);
    const team2 = match.info.participants.filter((p) => p.teamId === 200);
    const team1Stats = calculateTeamStats(team1);
    const team2Stats = calculateTeamStats(team2);
    const bans = {
        team1: match.info.teams.find((t) => t.teamId === 100).bans,
        team2: match.info.teams.find((t) => t.teamId === 200).bans,
    };
    return (
        <div className="bg-[#13151b] min-h-screen flex items-center justify-center px-4 py-2">
            <div className="bg-[#13151b] text-white max-w-6xl w-full">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex-1">
                        <span className="text-xs font-semibold text-[#3182CE]">Team 1</span>
                    </div>
                    <div className="flex-1 flex justify-center">
                        <span className="text-xs font-semibold text-[#3182CE]">
                            {`${team1Stats.kills} / ${team1Stats.deaths} / ${team1Stats.assists}`}
                        </span>
                    </div>
                    <div className="flex-1 flex justify-end">
                        <span className="text-xs font-semibold text-[#3182CE] mr-2">
                            Bans:
                        </span>
                        {bans.team1.map((ban, idx) => (
                            <Image
                                key={idx}
                                src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${ban.championId}.png`}
                                alt="Champion Ban"
                                width={20}
                                height={20}
                            />
                        ))}
                    </div>
                </div>
                {team1.map((participant, index) => (
                    <ParticipantDetails key={index} participant={participant} latestVersion={latestVersion} />
                ))}
                <div className="flex justify-between items-center">
                    <div className="flex-1">
                        <span className="text-xs font-semibold text-[#C53030]">Team 2</span>
                    </div>
                    <div className="flex-1 flex justify-center">
                        <span className="text-xs font-semibold text-[#C53030]">
                            {`${team2Stats.kills} / ${team2Stats.deaths} / ${team2Stats.assists}`}
                        </span>
                    </div>
                    <div className="flex-1 flex justify-end">
                        <span className="text-xs font-semibold text-[#C53030] mr-2">
                            Bans:
                        </span>
                        {bans.team2.map((ban, idx) => (
                            <Image
                                key={idx}
                                src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${ban.championId}.png`}
                                alt="Champion Ban"
                                width={20}
                                height={20}
                            />
                        ))}
                    </div>
                </div>

                {team2.map((participant, index) => (
                    <ParticipantDetails key={index} participant={participant} latestVersion={latestVersion} />
                ))}
            </div>
        </div>
    );
};

const ParticipantDetails = ({ participant, isArena, getAugmentIcon, latestVersion }) => {
    const kda =
        participant.deaths === 0
            ? (participant.kills + participant.assists).toFixed(1)
            : (
                    (participant.kills + participant.assists) /
                    participant.deaths
              ).toFixed(1);

    return (
        <Link
            href={`/profile?gameName=${participant.riotIdGameName}&tagLine=${participant.riotIdTagline}`}
        >
            <div className="grid grid-cols-9 gap-x-2 p-2 my-2 rounded-lg bg-[#13151b]">
                {/* Lane Icon */}

                {/* Champion Icon & Player Name */}
                <div className="col-span-2 flex items-center space-x-1">
                    {!isArena && (
                        <div className="col-span-1 flex items-center">
                            <Image
                                src={`https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champ-select/global/default/svg/position-${participant.teamPosition.toLowerCase()}.svg`}
                                alt={`${participant.teamPosition} Position Icon`}
                                width={28}
                                height={28}
                                className="w-8 h-8"
                            />
                        </div>
                    )}
                    <Image
                        src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${participant.championId}.png`}
                        alt="Champion"
                        width={28}
                        height={28}
                        className="w-8 h-8"
                    />
                    <span className="text-sm font-semibold">
                        {participant.riotIdGameName}#{participant.riotIdTagline}
                    </span>
                </div>

                {/* Rune Icon */}
                {!isArena && (
                    <div className="col-span-1 flex items-center">
                        <Image
                            src={`/images/runeIcons/${participant.perks.styles[0].selections[0].perk}.png`}
                            alt="Rune Icon"
                            width={28}
                            height={28}
                            className="w-8 h-8"
                        />
                    </div>
                )}

                {/* Summoner Icons */}
                <div className="col-span-1 flex items-center space-x-1">
                    {[participant.summoner1Id, participant.summoner2Id].map(
                        (spellId, idx) => (
                            <div key={idx} className="flex items-center">
                                <Image
                                    src={`/images/summonerSpells/${spellId}.png`}
                                    alt={`Summoner Spell ${idx + 1}`}
                                    width={28}
                                    height={28}
                                />
                            </div>
                        )
                    )}
                </div>

                {/* Items */}
                <div className="col-span-2 flex items-center space-x-1">
                    {isArena ? (
                        <div className="flex items-center">
                            {[
                                participant.playerAugment1,
                                participant.playerAugment2,
                                participant.playerAugment3,
                                participant.playerAugment4,
                            ].map((augmentId, index) => {
                                const augmentIcon = getAugmentIcon(augmentId);
                                return augmentIcon ? (
                                    <Image
                                        key={index}
                                        src={augmentIcon}
                                        alt={`Augment ${index + 1}`}
                                        className="w-8 h-8 mr-1"
                                        width={28}
                                        height={28}
                                    />
                                ) : null;
                            })}
                        </div>
                    ) : (
                        Array.from({ length: 7 }, (_, i) => participant[`item${i}`]).map(
                            (itemId, idx) => (
                                <div key={idx} className="flex items-center">
                                    {itemId > 0 ? (
                                        <Image
                                            src={`https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/item/${itemId}.png`}
                                            alt="Item"
                                            width={28}
                                            height={28}
                                            className="w-8 h-8"
                                        />
                                    ) : (
                                        <Image
                                            src="/images/placeholder.png"
                                            alt="No item"
                                            width={32}
                                            height={32}
                                            className="w-8 h-8"
                                        />
                                    )}
                                </div>
                            )
                        )
                    )}
                </div>

                {/* KDA & K/D/A */}
                <div className="col-span-1 flex items-center space-x-4">
                    <div>
                        <span className="text-sm font-semibold">{`${participant.kills} / ${participant.deaths} / ${participant.assists}`}</span>
                        <br />
                        <span className="text-xs text-gray-400">{`${kda} KDA`}</span>
                    </div>
                </div>

                {/* CS & KP */}
                {!isArena && (
                    <div className="col-span-1 flex items-center space-x-4">
                        <div>
                            <span className="text-sm font-semibold">{`${
                                participant.totalMinionsKilled +
                                participant.totalAllyJungleMinionsKilled +
                                participant.totalEnemyJungleMinionsKilled
                            } CS`}</span>
                            <br />
                            <span className="text-xs text-gray-400">
                                {(participant.challenges.killParticipation * 100).toFixed(0)}%
                                KP
                            </span>
                        </div>
                    </div>
                )}

                {/* Damage & Gold */}
                <div className="col-span-1 flex items-center space-x-4">
                    <div>
                        <span className="text-sm font-semibold">{`${participant.totalDamageDealtToChampions.toLocaleString()} DMG`}</span>
                        <br />
                        <span className="text-xs text-gray-400">{`${participant.goldEarned.toLocaleString()} Gold`}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};
export default MatchDetails;
