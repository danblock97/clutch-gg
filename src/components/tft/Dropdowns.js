import { useState, useRef, useEffect } from "react";

export function Dropdown({ label, options, value, onChange }) {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef(null);

	// Find the selected option label
	const selectedOption = options.find((option) => option.value === value);
	const displayText = selectedOption ? selectedOption.label : "Select...";

	useEffect(() => {
		function handleClickOutside(event) {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setIsOpen(false);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	return (
		<div className="relative" ref={dropdownRef}>
			<label className="block text-sm font-medium mb-1">{label}</label>
			<button
				type="button"
				className="flex justify-between items-center w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md focus:outline-none"
				onClick={() => setIsOpen(!isOpen)}
			>
				<span>{displayText}</span>
				<svg
					className={`w-4 h-4 transition-transform duration-200 ${
						isOpen ? "transform rotate-180" : ""
					}`}
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						d="M19 9l-7 7-7-7"
					></path>
				</svg>
			</button>

			{isOpen && (
				<div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg">
					<ul className="py-1 max-h-60 overflow-auto">
						{options.map((option) => (
							<li key={option.value}>
								<button
									type="button"
									className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-700 ${
										value === option.value ? "bg-blue-600" : ""
									}`}
									onClick={() => {
										onChange(option.value);
										setIsOpen(false);
									}}
								>
									{option.label}
								</button>
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}
