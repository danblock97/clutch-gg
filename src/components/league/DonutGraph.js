import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const getRingColor = (score) => {
	if (score < 50) return "#ff3b30";   // Red
	if (score < 70) return "#ff9500";   // Orange
	if (score < 85) return "#ffcc00";   // Yellow
	if (score < 95) return "#5ac8fa";   // Light Blue
	return "#4cd964";                   // Green
};

const DonutGraph = ({ score }) => {
	return (
		<div style={{ width: 50, height: 50 }}>
			<CircularProgressbar
				value={score}
				text={`${score}`}
				strokeWidth={20}
				styles={buildStyles({
					// Dynamically set the ring color based on the score
					pathColor: getRingColor(score),
					// A darker trail color to contrast the ring
					trailColor: "#2c2c2c",
					// Text styling
					textColor: "#fff",
					textSize: "32px",
					// Make the ends of the ring squared off
					strokeLinecap: "butt",
				})}
			/>
		</div>
	);
};

export default DonutGraph;
