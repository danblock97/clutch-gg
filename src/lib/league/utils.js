export const getQueueName = (queueId) => {
	const queueMappings = {
		400: "Normal Draft",
		420: "Ranked Solo/Duo",
		430: "Normal Blind",
		440: "Ranked Flex",
		450: "ARAM",
		700: "Clash",
		1700: "Arena",
		1710: "Arena",
	};
	return queueMappings[queueId] || `Queue ID: ${queueId}`;
};
