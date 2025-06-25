"use client";

import React, { useState, useRef, useEffect } from "react";
import { FaList, FaChevronDown, FaChevronUp } from "react-icons/fa";

export const QueueFilterDropdown = ({
	queues,
	selectedQueue,
	setSelectedQueue,
	disabled = false,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const selectRef = useRef(null);
	const buttonRef = useRef(null);
	const [dropdownWidth, setDropdownWidth] = useState(0);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (selectRef.current && !selectRef.current.contains(event.target)) {
				setIsOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	useEffect(() => {
		if (buttonRef.current) {
			setDropdownWidth(buttonRef.current.offsetWidth);
		}
	}, [selectedQueue, queues]);

	const handleSelect = (optionValue) => {
		setSelectedQueue(optionValue);
		setIsOpen(false);
	};

	const displayValue =
		selectedQueue === "ALL"
			? "All Queues"
			: queues.find((q) => q.id === parseInt(selectedQueue))?.name ||
			  "Select Queue";

	return (
		<div className="relative w-full sm:w-48" ref={selectRef}>
			<button
				ref={buttonRef}
				onClick={() => setIsOpen(!isOpen)}
				disabled={disabled}
				className={`flex items-center justify-between w-full px-3 py-2 text-sm rounded-md border border-[--card-border] bg-[--card-bg] hover:bg-[--card-bg-secondary] focus:outline-none focus:ring-1 focus:ring-[--primary] transition-colors duration-150 ${
					disabled ? "opacity-50 cursor-not-allowed" : ""
				}`}
			>
				<div className="flex items-center gap-2">
					<FaList className="text-[--text-secondary]" />
					<span className="font-medium">{displayValue}</span>
				</div>
				{isOpen ? <FaChevronUp /> : <FaChevronDown />}
			</button>
			{isOpen && !disabled && (
				<ul
					className="absolute z-20 mt-1 bg-[--card-bg-secondary] border border-[--card-border] rounded-md shadow-lg overflow-hidden custom-scrollbar max-h-60 overflow-y-auto"
					style={{ width: `${dropdownWidth}px` }}
				>
					<li
						className="px-3 py-2 cursor-pointer hover:bg-[--primary]/10 text-[--text-primary]"
						onClick={() => handleSelect("ALL")}
					>
						All Queues
					</li>
					{queues.map((queue) => (
						<li
							key={queue.id}
							className="px-3 py-2 cursor-pointer hover:bg-[--primary]/10 text-[--text-primary]"
							onClick={() => handleSelect(queue.id.toString())}
						>
							{queue.name}
						</li>
					))}
				</ul>
			)}
		</div>
	);
};
