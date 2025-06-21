import React from "react";

const ScoreBox = ({ score, result = "win", height = 36, width = 36 }) => {
	const bgColor = result === "win" ? "#2563eb" : "#b91c1c"; // blue-600 or red-700

	return (
		<div
			className="flex items-center justify-center font-bold text-white text-md"
			style={{
				width: width,
				height: height,
				backgroundColor: bgColor,
				borderRadius: 4,
			}}
		>
			{score}
		</div>
	);
};

export default ScoreBox;
