import React from "react";

/**
 * @param {string} text - The main text of the tag (e.g. "Good Damage").
 * @param {string} hoverText - The tooltip text displayed on hover.
 * @param {string} color - Additional Tailwind classes for background/text colors (optional).
 * @param {JSX.Element} icon - An optional icon element (e.g. from react-icons).
 */
const Tag = ({ text, hoverText, color = "", icon }) => {
	return (
		<div className="relative inline-flex group items-center cursor-pointer">
			<div
				className={`flex items-center space-x-1 px-2 py-1 rounded-full 
          bg-gray-700 text-white text-sm font-medium border border-gray-600 
          hover:bg-gray-600 transition-colors duration-200
          ${color}`}
			>
				{/* Optional Icon */}
				{icon && (
					<span className="w-4 h-4 flex items-center justify-center text-base">
            {icon}
          </span>
				)}
				{/* Tag Text */}
				<span className="whitespace-nowrap">{text}</span>
			</div>

			{/* Tooltip on Hover */}
			{hoverText && (
				<div
					role="tooltip"
					className="absolute bottom-full left-0 mb-2
            opacity-0 invisible group-hover:opacity-100 group-hover:visible
            transition-all duration-200 ease-in-out
            bg-black text-white text-xs rounded-md px-4 py-3
            shadow-lg border border-gray-700
            before:absolute before:top-full before:left-4
            before:border-8 before:border-transparent before:border-t-black
            z-30
            whitespace-normal break-words
            min-w-[150px] max-w-[250px]"
				>
					<div className="font-bold text-sm mb-1.5">{text}</div>
					<div className="text-gray-300 leading-snug">{hoverText}</div>
				</div>
			)}
		</div>
	);
};

export default Tag;
