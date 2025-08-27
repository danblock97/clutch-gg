// Comprehensive queue mappings based on Riot's queue types
const queueMappings = {
	400: "Normal Draft",
	420: "Ranked Solo/Duo",
	430: "Normal Blind",
	440: "Ranked Flex",
	450: "ARAM",
	460: "Normal Blind (3v3)",
	470: "Ranked Flex (3v3)",
	480: "Nexus Blitz",
	490: "Normal (Quickplay)",
	700: "Clash",
	720: "ARAM Clash",
	800: "Co-op vs AI (Twisted Treeline)",
	810: "Co-op vs AI (Intro)",
	820: "Co-op vs AI (Beginner)",
	830: "Co-op vs AI (Intermediate)",
	840: "Co-op vs AI (Advanced)",
	850: "Co-op vs AI (ARAM)",
	900: "URF",
	910: "Ascension",
	920: "Legend of the Poro King",
	940: "Nexus Siege",
	950: "Doom Bots (Voting)",
	960: "Doom Bots (Standard)",
	980: "Star Guardian Invasion (Normal)",
	990: "Star Guardian Invasion (Onslaught)",
	1000: "PROJECT: Hunters",
	1010: "Snow ARURF",
	1020: "One for All",
	1030: "Odyssey Extraction (Intro)",
	1040: "Odyssey Extraction (Cadet)",
	1050: "Odyssey Extraction (Crewmember)",
	1060: "Odyssey Extraction (Captain)",
	1070: "Odyssey Extraction (Onslaught)",
	1200: "Nexus Blitz",
	1300: "Nexus Blitz",
	1400: "Ultimate Spellbook",
	1700: "Arena",
	1710: "Arena",
	1900: "URF",
	2000: "Tutorial 1",
	2010: "Tutorial 2",
	2020: "Tutorial 3"
};

// Popular/Featured queues for the dropdown (most commonly played)
export const FEATURED_QUEUES = [
	{ id: 420, name: "Ranked Solo/Duo" },
	{ id: 440, name: "Ranked Flex" },
	{ id: 400, name: "Normal Draft" },
	{ id: 430, name: "Normal Blind" },
	{ id: 490, name: "Normal (Quickplay)" },
	{ id: 450, name: "ARAM" },
	{ id: 480, name: "Nexus Blitz" },
	{ id: 1700, name: "Arena" },
	{ id: 700, name: "Clash" },
	{ id: 900, name: "URF" },
	{ id: 1020, name: "One for All" },
	{ id: 1400, name: "Ultimate Spellbook" }
];

export const getQueueName = (queueId) => {
	return queueMappings[queueId] || `Queue ID: ${queueId}`;
};
