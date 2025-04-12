"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import { usePathname } from "next/navigation";

// Create the context
const GameTypeContext = createContext();

// Custom hook to use the game type context
export const useGameType = () => {
	const context = useContext(GameTypeContext);
	if (!context) {
		throw new Error("useGameType must be used within a GameTypeProvider");
	}
	return context;
};

// Provider component
export const GameTypeProvider = ({ children }) => {
	const [gameType, setGameType] = useState("league");
	const pathname = usePathname();

	// Update game type based on URL path
	useEffect(() => {
		if (pathname?.startsWith("/tft")) {
			setGameType("tft");
		} else if (pathname?.startsWith("/league") || pathname === "/") {
			setGameType("league");
		}
	}, [pathname]);

	return (
		<GameTypeContext.Provider value={{ gameType, setGameType }}>
			{children}
		</GameTypeContext.Provider>
	);
};
