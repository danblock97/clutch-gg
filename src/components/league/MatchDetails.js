// src/components/league/MatchDetails.js
import React, { useState } from "react";
import MatchStatsTab from "./MatchStatsTab";
import TeamAnalysisTab from "./TeamAnalysisTab";
import StatsTab from "./StatsTab";
import { FaUsers, FaChartBar, FaListAlt } from "react-icons/fa";

export default function MatchDetails(props) {
	const [activeTab, setActiveTab] = useState("overview");

	const tabs = [
		{
			id: "overview",
			label: "Match Stats",
			icon: <FaUsers className="mr-2" />,
			component: <MatchStatsTab {...props} />,
		},
		{
			id: "analysis",
			label: "Team Breakdown",
			icon: <FaChartBar className="mr-2" />,
			component: <TeamAnalysisTab {...props} />,
		},
		{
			id: "stats",
			label: "In Depth Stats",
			icon: <FaListAlt className="mr-2" />,
			component: <StatsTab {...props} />,
		},
	];

	// Arena games should not have the analysis and stats tabs.
	const match = props.matchDetails?.find(
		(m) => m.metadata.matchId === props.matchId
	);
	const isArena =
		match?.info?.queueId === 1700 || match?.info?.queueId === 1710;

	const visibleTabs = isArena ? tabs.filter((t) => t.id === "overview") : tabs;

	return (
		<div className="card-highlight">
			{/* Tab Navigation */}
			<div className="border-b border-[--card-border]">
				<div className="flex flex-wrap px-4">
					{visibleTabs.map((tab) => (
						<button
							key={tab.id}
							className={`flex items-center px-4 py-3 font-medium text-sm relative transition-colors duration-200 ${
								activeTab === tab.id
									? "text-[--primary]"
									: "text-[--text-secondary] hover:text-[--text-primary]"
							}`}
							onClick={() => setActiveTab(tab.id)}
						>
							{tab.icon}
							{tab.label}
							{activeTab === tab.id && (
								<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[--primary]"></div>
							)}
						</button>
					))}
				</div>
			</div>

			{/* Tab Content */}
			<div className="pt-2">
				{tabs.find((tab) => tab.id === activeTab)?.component}
			</div>
		</div>
	);
}
