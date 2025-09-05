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
		<div className="min-h-screen relative overflow-x-hidden">
			{/* Layered gradient background */}
			<div className="absolute inset-0 -z-10">
				<div className="absolute inset-0 bg-[--background]"></div>
				<div
					className={`absolute left-1/2 top-0 -translate-x-1/2 w-[900px] h-[900px] rounded-full blur-[160px] opacity-25 ${
						gameType === "tft"
							? "bg-[radial-gradient(circle_at_center,var(--tft-secondary),transparent_60%)]"
							: "bg-[radial-gradient(circle_at_center,var(--secondary),transparent_60%)]"
					}`}
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
