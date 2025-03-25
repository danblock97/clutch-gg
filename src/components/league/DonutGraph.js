import React from "react";

const DonutGraph = ({ score }) => {
	// Determine color based on score
	const getColor = (value) => {
		if (value < 50) return "#ef4444";   // Red - poor score
		if (value < 70) return "#f59e0b";   // Amber - average score
		if (value < 85) return "#3b82f6";   // Blue - good score
		if (value < 95) return "#10b981";   // Green - great score
		return "#8b5cf6";                   // Purple - excellent score
	};

	// Calculate the SVG circle parameters
	const size = 50;
	const strokeWidth = 6;
	const radius = (size - strokeWidth) / 2;
	const circumference = radius * 2 * Math.PI;
	const strokeDasharray = circumference;
	const strokeDashoffset = circumference - (score / 100) * circumference;

	const trackColor = "#1e1e2e"; // A dark background color that matches our design
	const scoreColor = getColor(score);

	return (
		<div className="relative inline-flex items-center justify-center">
			<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
				{/* Background track */}
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					stroke={trackColor}
					strokeWidth={strokeWidth}
				/>

				{/* Foreground track (the actual score) */}
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					stroke={scoreColor}
					strokeWidth={strokeWidth}
					strokeDasharray={strokeDasharray}
					strokeDashoffset={strokeDashoffset}
					strokeLinecap="round"
					className="transition-all duration-1000 ease-out"
				/>
			</svg>

			{/* Score text in the middle */}
			<div className="absolute inset-0 flex items-center justify-center">
        <span
			className="text-base font-bold"
			style={{ color: scoreColor }}
		>
          {score}
        </span>
			</div>
		</div>
	);
};

export default DonutGraph;