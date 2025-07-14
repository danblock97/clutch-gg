"use client";

import React, { useState, useEffect } from "react";
import HomePage from "@/components/HomePage";
import { usePathname } from "next/navigation";


const Page = () => {
	const pathname = usePathname();
	const [gameType, setGameType] = useState("league");

	// Detect game type from URL path
	useEffect(() => {
		if (pathname.startsWith("/tft")) {
			setGameType("tft");
		} else {
			setGameType("league");
		}
	}, [pathname]);

	return (
		<div className="bg-[#0e1015] min-h-screen relative overflow-x-hidden">
			{/* Center Glow */}
			<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
				<div
					className={`w-[600px] h-[600px] ${
						gameType === "tft"
							? "bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-400"
							: "bg-gradient-to-r from-purple-600 via-blue-500 to-yellow-400"
					} opacity-25 rounded-full blur-[150px] transform -translate-x-16`}
				></div>
			</div>

			{/* Content */}
			<div className="relative z-10">
				<HomePage initialGameType={gameType} />
			</div>
		</div>
	);
};

export default Page;
