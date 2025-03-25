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
				className={`flex items-center space-x-1 px-3 py-1.5 rounded-full 
          text-sm font-medium shadow-sm border border-[--card-border] 
          transition-all duration-200 transform group-hover:scale-105
          ${color || "bg-[--card-bg]"}`}
			>
				{/* Optional Icon */}
				{icon && (
					<span className="flex items-center justify-center text-base mr-1">
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
            bg-[--card-bg-secondary] text-[--text-primary] text-xs rounded-lg px-4 py-3
            shadow-lg border border-[--card-border]
            before:absolute before:top-full before:left-4
            before:border-8 before:border-transparent before:border-t-[--card-border]
            z-30
            whitespace-normal break-words
            min-w-[180px] max-w-[280px]"
				>
					<div className="font-bold text-sm mb-1.5">{text}</div>
					<div className="text-[--text-secondary] leading-snug">{hoverText}</div>
				</div>
			)}
		</div>
	);
};

export default Tag;