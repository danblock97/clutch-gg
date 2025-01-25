"use client";

import React from "react";

const OutageBanner = ({ message, onClose }) => {
	if (!message) return null;

	return (
		<div className="fixed top-0 w-full z-50">
			<div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-2 flex items-center justify-center">
				{/* Warning Symbol */}
				<span className="mr-2 text-xl">⚠️</span>

				{/* Your Outage Message */}
				<span className="mr-2 font-semibold">{message}</span>

				{/* Warning Symbol */}
				<span className="mr-2 text-xl">⚠️</span>

				{/* Dismiss Button with a border */}
				<button
					onClick={onClose}
					className="ml-4 border border-yellow-700 text-yellow-700 font-bold rounded px-3 py-1 hover:text-yellow-900 hover:border-yellow-900 focus:outline-none"
					aria-label="Close Alert"
				>
					Dismiss
				</button>
			</div>
		</div>
	);
};

export default OutageBanner;
