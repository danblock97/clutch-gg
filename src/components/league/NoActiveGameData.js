// NoActiveGameData.jsx
import React, { useEffect, useRef } from "react";

const NoActiveGameData = ({ summonerName, region, onClose }) => {
	const modalRef = useRef(null);

	// Close the modal when pressing the Escape key
	useEffect(() => {
		const handleEsc = (event) => {
			if (event.key === "Escape") {
				onClose();
			}
		};
		window.addEventListener("keydown", handleEsc);

		return () => {
			window.removeEventListener("keydown", handleEsc);
		};
	}, [onClose]);

	// Close the modal when clicking outside of the modal content
	const handleClickOutside = (event) => {
		if (modalRef.current && !modalRef.current.contains(event.target)) {
			onClose();
		}
	};

	useEffect(() => {
		window.addEventListener("mousedown", handleClickOutside);

		return () => {
			window.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	return (
		<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
			<div
				ref={modalRef}
				className="bg-gray-900 text-white p-8 rounded-lg shadow-lg max-w-md w-full relative"
			>
				{/* Close Button */}
				<button
					onClick={onClose}
					className="absolute top-4 right-4 text-gray-400 hover:text-white focus:outline-none"
					aria-label="Close Modal"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>

				{/* Modal Content */}
				<p className="text-lg mb-4">
					<strong>'{summonerName}'</strong> is not in an active game.
				</p>
				<p className="mb-4">
					Please try again later if the summoner is currently in game.
				</p>
				<p className="italic text-sm">
					(Live Game data for '{summonerName}' cannot be retrieved from Riot’s
					official API.)
				</p>
			</div>
		</div>
	);
};

export default NoActiveGameData;
