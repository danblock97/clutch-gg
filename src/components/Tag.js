import React from "react";

const Tag = ({ text, hoverText, color, icon }) => {
	return (
		<div className={`relative group`}>
			<div
				className={`px-1 py-1 text-xs font-semibold rounded-md bg-opacity-80 ${color} 
                shadow-md 
                relative z-10 
                transition-transform transform 
                group-hover:scale-105 flex items-center space-x-2`}
			>
				{icon && <span className="relative z-20 text-xs">{icon}</span>}
				<span className="relative z-20">{text}</span>
			</div>

			{/* Tooltip on Hover */}
			<div
				className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
                           hidden group-hover:block
                           bg-gray-800 text-white text-xs rounded px-3 py-2
                           shadow-lg
                           before:absolute before:top-full before:left-1/2 before:-translate-x-1/2 before:border-4 before:border-transparent before:border-t-black
                           z-30
                           whitespace-nowrap"
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
