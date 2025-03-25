"use client";

import React, { useState, useEffect } from "react";
import { FaExclamationTriangle, FaTimesCircle, FaBell } from "react-icons/fa";

const OutageBanner = ({ message, onClose }) => {
	const [isVisible, setIsVisible] = useState(true);
	const [isMinimized, setIsMinimized] = useState(false);

	useEffect(() => {
		// Reset states when a new message comes in
		if (message) {
			setIsVisible(true);
			setIsMinimized(false);
		}
	}, [message]);

	if (!message || !isVisible) return null;

	const handleMinimize = (e) => {
		e.stopPropagation();
		setIsMinimized(!isMinimized);
	};

	const handleClose = () => {
		// Animate out
		setIsVisible(false);
		// Call the parent close function
		setTimeout(onClose, 300);
	};

	return (
		<div className="fixed top-0 left-0 w-full z-50 flex justify-center pointer-events-none">
			<div
				className={`transform transition-all duration-300 ease-in-out pointer-events-auto
          ${isMinimized ? 'translate-y-[-90%]' : 'translate-y-0'}
          ${isVisible ? 'opacity-100' : 'opacity-0 translate-y-[-100%]'}`}
			>
				{/* Minimized tab that remains visible when banner is minimized */}
				<div
					className="absolute bottom-0 left-1/2 transform translate-y-full -translate-x-1/2
                    bg-gradient-to-r from-yellow-600 to-amber-500
                    px-4 py-2 rounded-b-lg cursor-pointer shadow-lg
                    flex items-center gap-2 text-white font-medium"
					onClick={handleMinimize}
				>
					<FaBell className="animate-pulse" />
					<span className="text-sm">Service alert</span>
				</div>

				{/* Main banner */}
				<div className="bg-gradient-to-r from-[#1e1e2e] via-[#2a2a3a] to-[#1e1e2e] border border-[--card-border] rounded-lg shadow-xl
                    max-w-3xl w-full mx-2 mt-3 overflow-hidden">
					<div className="p-0.5 bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-500"></div>

					<div className="p-4 flex items-center">
						<div className="bg-gradient-to-br from-yellow-500 to-amber-600 p-2.5 rounded-full mr-4 flex-shrink-0 shadow-inner">
							<FaExclamationTriangle className="text-white text-xl" />
						</div>

						<div className="flex-grow">
							<h3 className="font-bold text-base sm:text-lg bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-amber-200 mb-1">
								Service Alert
							</h3>
							<p className="text-sm sm:text-base text-[--text-primary]">{message}</p>
						</div>

						<div className="flex space-x-2 ml-2">
							<button
								onClick={handleMinimize}
								className="relative p-2 text-[--text-secondary] hover:text-[--text-primary] transition-colors duration-200 focus:outline-none"
								aria-label="Minimize Alert"
							>
								<div className="w-5 h-1 bg-current rounded-full"></div>
							</button>

							<button
								onClick={handleClose}
								className="relative p-2 text-[--text-secondary] hover:text-[--error] transition-colors duration-200 focus:outline-none"
								aria-label="Close Alert"
							>
								<FaTimesCircle className="text-lg" />
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default OutageBanner;