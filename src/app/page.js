import React from "react";
import HomePage from "@/components/HomePage";

const page = () => {
	return (
		<div className="bg-[#0e1015] h-screen flex items-center justify-center relative">
			{/* Center Glow */}
			<div className="absolute inset-0 flex items-center justify-center">
				<div className="w-[600px] h-[600px] bg-gradient-to-r from-purple-600 via-blue-500 to-yellow-400 opacity-25 rounded-full blur-[150px] transform -translate-x-16"></div>
			</div>

			{/* Content */}
			<div className="relative z-10">
				<HomePage />
			</div>
		</div>
	);
};

export default page;
