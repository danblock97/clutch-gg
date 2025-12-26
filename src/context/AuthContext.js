"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { useGameType } from "@/context/GameTypeContext";

// Create the auth context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};

// Provider component
export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();
	const { gameType } = useGameType();

	// Function to handle login with Riot
	const loginWithRiot = async () => {
		try {
			// Redirect to Riot OAuth endpoint - we'll define this in our API route
			window.location.href = "/api/auth/login";
		} catch (error) {
			// Silent error handling
		}
	};

	// Function to handle logout
	const logout = async () => {
		try {
			// Clear user session from localStorage/sessionStorage
			localStorage.removeItem("rso_user");
			sessionStorage.removeItem("rso_user");

			// Clear user state
			setUser(null);

			// Redirect to logout endpoint
			window.location.href = "/api/auth/logout";
		} catch (error) {
			// Silent error handling
		}
	};

	// Navigate to profile based on game type
	const navigateToProfile = () => {
		if (!user) return;

		// Ensure region is in uppercase format for API compatibility
		const normalizedRegion = user.region ? user.region.toUpperCase() : "EUW1";
		
		// Use clean URL format
		const profileUrl = buildProfileUrl(gameType, normalizedRegion, user.gameName, user.tagLine);
		
		if (profileUrl) {
			router.push(profileUrl);
		} else {
			// Fallback to old format
			const basePath = gameType === "tft" ? "/tft" : "/league";
			router.push(
				`${basePath}/profile?gameName=${encodeURIComponent(
					user.gameName
				)}&tagLine=${encodeURIComponent(user.tagLine)}&region=${normalizedRegion}`
			);
		}
	};

	// Check if user is authenticated on mount
	useEffect(() => {
		const checkAuth = async () => {
			try {
				// Try to get user from localStorage/sessionStorage
				const storedUser =
					localStorage.getItem("rso_user") ||
					sessionStorage.getItem("rso_user");

				if (storedUser) {
					setUser(JSON.parse(storedUser));
				}
			} catch (error) {
				console.error("Error checking authentication:", error);
			} finally {
				setIsLoading(false);
			}
		};

		checkAuth();
	}, []);

	// Store authenticated user in Supabase for future reference
	useEffect(() => {
		const storeUserInSupabase = async () => {
			if (!user || !user.puuid) return;

			try {
				// Check if user already exists in the database
				const { data: existingUser, error: selectError } = await supabase
					.from("riot_accounts")
					.select("*")
					.eq("puuid", user.puuid)
					.maybeSingle();

				if (selectError) throw selectError;

				// If user doesn't exist, insert them using supabaseAdmin
				if (!existingUser) {
					const { error: insertError } = await supabaseAdmin
						.from("riot_accounts")
						.insert([
							{
								gamename: user.gameName,
								tagline: user.tagLine,
								region: user.region || "euw1",
								puuid: user.puuid,
							},
						]);

					if (insertError) throw insertError;
				}
			} catch (error) {
				console.error("Error storing user in Supabase:", error);
			}
		};

		if (user) {
			storeUserInSupabase();
		}
	}, [user]);

	return (
		<AuthContext.Provider
			value={{
				user,
				setUser,
				isLoading,
				loginWithRiot,
				logout,
				navigateToProfile,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};
