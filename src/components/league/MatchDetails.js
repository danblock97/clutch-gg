import React, { useState } from "react";
import MatchStatsTab from "./MatchStatsTab"; // Your existing "Overview" tab component
import TeamAnalysisTab from "./TeamAnalysisTab";
import StatsTab from "./StatsTab"; // The new stats component

export default function MatchDetails(props) {
	// We assume you want three tabs: "Overview", "Team analysis", and "Stats".
	const [activeTab, setActiveTab] = useState("overview");

	return (
		<div className="pb-3 flex flex-col">
			{/* ---- Tab Buttons ---- */}
			<div className="flex flex-wrap space-x-2 mt-4 mb-4">
				{/* Overview tab */}
				<button
					className={`
            px-4 py-2 rounded-lg 
            transition-colors
            ${
							activeTab === "overview"
								? "bg-[#2e2e2e] text-white"
								: "bg-transparent text-gray-400 hover:text-gray-200"
						}
          `}
					onClick={() => setActiveTab("overview")}
				>
					Match Stats
				</button>

				{/* Team Analysis tab */}
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
					Team Breakdown
					<span className="ml-2 bg-blue-500 text-white text-xs px-1 py-0.5 rounded">
						New*
					</span>
				</button>

				{/* Stats tab (new) */}
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
					In Depth Stats
					<span className="ml-2 bg-blue-500 text-white text-xs px-1 py-0.5 rounded">
						New*
					</span>
				</button>
			</div>

			{/* ---- Tab Content ---- */}
			{activeTab === "overview" && <MatchStatsTab {...props} />}
			{activeTab === "analysis" && <TeamAnalysisTab {...props} />}
			{activeTab === "stats" && <StatsTab {...props} />}
		</div>
	);
}
