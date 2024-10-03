import React from "react";

const Tag = ({ text, hoverText, color }) => {
	return (
		<div className={`relative group ml-1`}>
			{/* Tag with 3D Embossed Effect */}
			<div
				className={`px-2 py-1 text-xs rounded-full ${color} 
                shadow-md 
                before:absolute before:top-0 before:left-0 before:w-full before:h-full 
                before:rounded-full 
                before:border before:border-gray-600 
                before:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.6), inset_-2px_-2px_5px_rgba(255,255,255,0.1)] 
                relative z-10 
                transition-transform transform 
                group-hover:scale-105`}
			>
				<span className="relative z-20">{text}</span>
			</div>

			{/* Tooltip on Hover */}
			<div
				className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 
                           hidden group-hover:block 
                           bg-gray-800 text-white text-xs rounded px-2 py-1 
                           shadow-lg 
                           before:absolute before:top-full before:left-1/2 before:-translate-x-1/2 before:border-4 before:border-transparent before:border-t-gray-800
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
