import React from "react";

const Tag = ({ text, hoverText, color, icon }) => {
	return (
		<div className="relative group">
			<div
				className={`px-1 py-1 text-xs font-semibold rounded-md bg-opacity-80 ${color}
                  shadow-md
                  relative z-10
                  transition-transform transform
                  group-hover:scale-105
                  flex items-center space-x-1
                  max-w-[100px] truncate`}
			>
				{icon && <span className="relative z-20 text-xs">{icon}</span>}
				<span className="relative z-20 truncate min-w-0">{text}</span>
			</div>

			{/* Tooltip on Hover - Adjusted positioning */}
			<div
				className="absolute bottom-full left-0 mb-2
                           hidden group-hover:block
                           bg-gray-800 text-white text-xs rounded px-3 py-2
                           shadow-lg
                           before:absolute before:top-full before:left-4 before:border-4 before:border-transparent before:border-t-gray-800
                           z-30
                           whitespace-nowrap
                           min-w-[150px] max-w-[250px]"
			>
				<span className="font-bold">{text}</span>
				<br />
				<br />
				<span>{hoverText}</span>
			</div>
		</div>
	);
};

export default Tag;