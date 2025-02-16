// MatchDetails.js

import React, { useState } from "react";
import MatchStatsTab from "./MatchStatsTab";
import TeamAnalysisTab from "./TeamAnalysisTab";

export default function MatchDetails(props) {
	const [activeTab, setActiveTab] = useState("stats");

	return (
		<div className="pb-3 flex flex-col">
			{/* Tab bar */}
			<div className="flex flex-wrap space-x-2 mt-4 mb-4">
				<button
					className={`
        px-4 py-2 rounded-lg 
        transition-colors
        ${
					activeTab === "stats"
						? "bg-[#2e2e2e] text-white"
						: "bg-transparent text-gray-400 hover:text-gray-200"
				}
      `}
					onClick={() => setActiveTab("stats")}
				>
					Overview
				</button>

				<button
					className={`
        px-4 py-2 rounded-lg
        transition-colors
        ${
					activeTab === "analysis"
						? "bg-[#2e2e2e] text-white"
						: "bg-transparent text-gray-400 hover:text-gray-200"
				}
      `}
					onClick={() => setActiveTab("analysis")}
				>
					Team analysis
					<span className="ml-2 bg-blue-500 text-white text-xs px-1 py-0.5 rounded">
						New*
					</span>
				</button>
			</div>

			{/* Render the correct tab */}
			{activeTab === "stats" && <MatchStatsTab {...props} />}
			{activeTab === "analysis" && <TeamAnalysisTab {...props} />}
		</div>
	);
}
