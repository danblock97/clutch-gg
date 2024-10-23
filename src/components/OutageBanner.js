"use client";

import React from "react";

const OutageBanner = ({ message, onClose }) => {
	if (!message) {
		return null;
	}

	return (
		<div className="bg-[#f8d7da] text-[#721c24] p-4 text-center fixed w-full top-0 z-50 flex justify-center items-center">
			<span>{message}</span>
			<button onClick={onClose} className="text-dark-red font-bold ml-4">
				✖
			</button>
		</div>
	);
};

export default OutageBanner;
