import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const DonutGraph = ({ score }) => {
	return (
		<div style={{ width: 50, height: 50 }}>
			<CircularProgressbar
				value={score}
				text={`${score}`}
				strokeWidth={15}
				styles={buildStyles({
					pathColor: "#4caf50",
					trailColor: "#e0e0e0",
					textColor: "white",
					textSize: "26px",
				})}
			/>
		</div>
	);
};

export default DonutGraph;
