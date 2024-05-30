import React from "react";

const OutageBanner = ({ message }) => {
	if (!message) {
		return null;
	}

	return (
		<div className="bg-[#f8d7da] text-[#721c24] p-4 text-center fixed w-full top-0">
			{message}
		</div>
	);
};

export default OutageBanner;
