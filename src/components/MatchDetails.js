import React from "react";

const MatchDetails = ({ matchId, matchDetails }) => {
	if (!matchDetails) {
		return <div>Loading match details...</div>;
	}

	// Assuming matchDetails contains the necessary data to display match details
	const { metadata, info } = matchDetails;

	return (
		<div>
			<h1>Match Details for Match ID: {matchId}</h1>
			{/* Render match details using metadata and info */}
			<p>{matchDetails[0].info.gameMode}</p>

			{/* Render other relevant match details */}
		</div>
	);
};

export default MatchDetails;
