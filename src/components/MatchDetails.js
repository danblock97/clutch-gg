import React from "react";

const MatchDetails = ({ matchId }) => {
	console.log("Match ID:", matchId);

	return (
		<div className="text-[#979aa0] p-4">
			<h1 className="text-lg font-bold mb-2">Match ID: {matchId}</h1>
		</div>
	);
};

export default MatchDetails;
