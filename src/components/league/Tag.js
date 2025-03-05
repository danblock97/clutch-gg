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

			{/* Enhanced Tooltip on Hover */}
			<div
				role="tooltip"
				className="absolute bottom-full left-0 mb-2
                   opacity-0 invisible group-hover:opacity-100 group-hover:visible
                   transition-all duration-200 ease-in-out
                   bg-black text-white text-xs rounded-md px-4 py-3
                   shadow-lg border border-gray-700
                   before:absolute before:top-full before:left-4
                   before:border-8 before:border-transparent before:border-t-gray-800
                   z-30
                   whitespace-normal break-words
                   min-w-[150px] max-w-[250px]"
			>
				<div className="font-bold text-sm mb-1.5">{text}</div>
				<div className="text-gray-300 leading-snug">{hoverText}</div>
			</div>
		</div>
	);
};

export default Tag;