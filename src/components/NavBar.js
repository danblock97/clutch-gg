"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import { useGameType } from "@/context/GameTypeContext";
import { useAuth } from "@/context/AuthContext";
import {
	FaCoffee,
	FaSearch,
	FaBars,
	FaTimes,
	FaTrophy,
	FaDiscord,
	FaBug,
	FaLightbulb,
	FaChevronDown,
	FaChevronUp,
	FaHome,
	FaGamepad,
	FaChessKnight,
	FaUser,
	FaSignOutAlt,
	FaDatabase,
} from "react-icons/fa";
import PropTypes from "prop-types";

const NavBar = ({ bannersVisible = 0 }) => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const [navbarHeight, setNavbarHeight] = useState(0);
	const [mounted, setMounted] = useState(false);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [isGameTypeDropdownOpen, setIsGameTypeDropdownOpen] = useState(false);
	const { gameType, setGameType } = useGameType();
	const { user, loginWithRiot, logout, navigateToProfile } = useAuth();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const router = useRouter();
	const gameTypeDropdownRef = useRef(null);

	// Mark component as mounted to prevent hydration mismatch
	useEffect(() => {
		setMounted(true);
	}, []);

	// Detect the current game type based on URL
	useEffect(() => {
		if (pathname?.startsWith("/tft")) {
			setGameType("tft");
		} else {
			setGameType("league");
		}
	}, [pathname, setGameType]);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				gameTypeDropdownRef.current &&
				!gameTypeDropdownRef.current.contains(event.target)
			) {
				setIsGameTypeDropdownOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const isProfileOrMatch =
		pathname?.includes("/profile") || pathname?.includes("/match");
	const region = isProfileOrMatch ? searchParams?.get("region") : null;

	// Handle scroll events to change navbar appearance
	useEffect(() => {
		const handleScroll = () => {
			const offset = window.scrollY;
			setScrolled(offset > 10);
		};

		// Get navbar height for offset
		const navbar = document.getElementById("main-navbar");
		if (navbar) {
			setNavbarHeight(navbar.offsetHeight);
		}

		window.addEventListener("scroll", handleScroll);
		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, []);

	// Handle closing mobile menu when a link is clicked
	const handleLinkClick = () => {
		setIsMenuOpen(false);
		setIsDropdownOpen(false);
		setIsGameTypeDropdownOpen(false);
	};

	// Toggle between game types
	const handleGameTypeChange = (type) => {
		setGameType(type);
		setIsGameTypeDropdownOpen(false);

		// Check if we're on a profile page
		if (pathname?.includes("/profile")) {
			// Get the current query params
			const gameName = searchParams.get("gameName");
			const tagLine = searchParams.get("tagLine");
			const region = searchParams.get("region");

			// Only redirect if we have all the necessary params
			if (gameName && tagLine && region) {
				// Construct the new path based on game type
				const basePath = type === "tft" ? "/tft" : "/league";
				router.push(
					`${basePath}/profile?gameName=${encodeURIComponent(
						gameName
					)}&tagLine=${encodeURIComponent(tagLine)}&region=${encodeURIComponent(
						region
					)}`
				);
			}
		}
		// Handle leaderboard redirect (existing logic)
		else if (pathname?.includes("/leaderboard")) {
			if (type === "tft") {
				router.push("/tft/leaderboard");
			} else {
				router.push("/league/leaderboard");
			}
		}
	};

	// Determine if current path is for TFT (needed for server-side rendering)
	const isTftPath = pathname?.startsWith("/tft");

	// Get active gradient text class based on path for initial render, then gameType after mounted
	const getGradientTextClass = () => {
		if (!mounted)
			return isTftPath ? "tft-gradient-text" : "league-gradient-text";
		return gameType === "tft" ? "tft-gradient-text" : "league-gradient-text";
	};

	// Get active color class based on path for initial render, then gameType after mounted
	const getActiveColorClass = () => {
		if (!mounted) return isTftPath ? "tft-active" : "league-active";
		return gameType === "tft" ? "tft-active" : "league-active";
	};

	// Get leaderboard link based on path for initial render, then gameType after mounted
	const getLeaderboardLink = () => {
		if (!mounted) return isTftPath ? "/tft/leaderboard" : "/league/leaderboard";
		return gameType === "tft" ? "/tft/leaderboard" : "/league/leaderboard";
	};

	// Get current game type display text and icon
	const getCurrentGameTypeDisplay = () => {
		if ((!mounted && isTftPath) || (mounted && gameType === "tft")) {
			return (
				<>
					<FaChessKnight className="text-sm mr-1" />
					<span>TFT</span>
				</>
			);
		}
		return (
			<>
				<FaGamepad className="text-sm mr-1" />
				<span>League</span>
			</>
		);
	};

	// Calculate top padding based on number of banners visible
	const getNavbarTopPadding = () => {
		if (bannersVisible === 0) return "0";
		if (bannersVisible === 1) return "2.5rem";
		return `${2.5 * bannersVisible}rem`;
	};

	return (
		<header
			style={{
				paddingTop: getNavbarTopPadding(),
			}}
		>
			<nav
				id="main-navbar"
				className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
					scrolled
						? "bg-[--background]/90 backdrop-blur-md shadow-lg"
						: "bg-transparent"
				} ${bannersVisible > 0 ? `mt-${bannersVisible * 10}` : ""}`}
			>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between h-16">
						{/* Logo & Left-side links */}
						<div className="flex items-center space-x-6">
							<Link
								href="/"
								className="flex-shrink-0 flex items-center space-x-2"
							>
								<div className="relative w-8 h-8 overflow-hidden">
									<Image
										src="/images/logo.png"
										alt="ClutchGG.LOL"
										width={32}
										height={32}
										className="object-contain"
									/>
								</div>
								<span
									className={`font-bold text-lg hidden sm:inline-block ${getGradientTextClass()}`}
								>
									ClutchGG.LOL
								</span>
							</Link>

							{/* Game Type Buttons (Desktop) */}
							<div className="hidden md:flex items-center space-x-2">
								<button
									onClick={() => handleGameTypeChange("league")}
									className={`nav-link flex items-center space-x-1 px-3 py-1 border ${
										(!mounted && !isTftPath) ||
										(mounted && gameType === "league")
											? "border-[--primary] bg-[--primary]/10 text-[--primary]"
											: "border-[--card-border] hover:bg-[--card-bg-secondary] text-[--text-primary]"
									} rounded-md transition-colors`}
								>
									<FaGamepad className="text-sm mr-1" />
									<span>League</span>
								</button>
								<button
									onClick={() => handleGameTypeChange("tft")}
									className={`nav-link flex items-center space-x-1 px-3 py-1 border ${
										(!mounted && isTftPath) || (mounted && gameType === "tft")
											? "border-[--tft-primary] bg-[--tft-primary]/10 text-[--tft-primary]"
											: "border-[--card-border] hover:bg-[--card-bg-secondary] text-[--text-primary]"
									} rounded-md transition-colors`}
								>
									<FaChessKnight className="text-sm mr-1" />
									<span>TFT</span>
								</button>
							</div>

							{/* Desktop Navigation Links */}
							<div className="hidden md:flex items-center space-x-6">
								<Link
									href={getLeaderboardLink()}
									className={`nav-link flex items-center space-x-1 ${
										pathname === getLeaderboardLink()
											? getActiveColorClass()
											: ""
									}`}
								>
									<FaTrophy className="text-sm" />
									<span>Leaderboards</span>
								</Link>
								<Link
									href="/league/featured-games"
									className={`nav-link flex items-center space-x-1 ${
										pathname === "/league/featured-games"
											? getActiveColorClass()
											: ""
									}`}
								>
									<FaGamepad className="text-sm" />
									<span>Featured Games</span>
								</Link>
								<Link
									href="/league/datastudio"
									className={`nav-link flex items-center space-x-1 ${
										pathname.startsWith("/league/datastudio")
											? getActiveColorClass()
											: ""
									}`}
								>
									<FaDatabase className="text-sm" />
									<span>Data Studio</span>
								</Link>
							</div>
						</div>

						{/* Right Side - Actions */}
						<div className="flex items-center space-x-4">
							{/* Search Button - Show on profile or match pages */}
							{isProfileOrMatch && (
								<button
									onClick={() => setIsSearchModalOpen(true)}
									className={`border border-[--card-border] bg-[--card-bg-secondary] hover:bg-[--card-bg] text-[--text-primary] py-1 px-3 hidden md:flex items-center space-x-1 rounded-md transition-colors duration-200`}
								>
									<FaSearch className="text-sm" />
									<span>Search</span>
								</button>
							)}

							{/* User Profile or Login Button */}
							{user ? (
								<div className="relative hidden md:block">
									<button
										onClick={() => setIsDropdownOpen(!isDropdownOpen)}
										className="border border-[--card-border] bg-[--card-bg-secondary] hover:bg-[--card-bg] text-[--text-primary] py-1 px-3 flex items-center space-x-1 rounded-md transition-colors duration-200"
									>
										{user.profileIconId ? (
											<div className="relative w-6 h-6 mr-2 rounded-full overflow-hidden">
												<Image
													src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${user.profileIconId}.jpg`}
													alt="Profile Icon"
													width={24}
													height={24}
													className="object-cover"
													fill
												/>
											</div>
										) : (
											<FaUser className="text-sm mr-2" />
										)}
										<span>{user.gameName}</span>
										<span className="text-[--text-secondary] text-xs ml-1">
											#{user.tagLine}
										</span>
										{isDropdownOpen ? (
											<FaChevronUp className="ml-1 text-xs" />
										) : (
											<FaChevronDown className="ml-1 text-xs" />
										)}
									</button>
									{isDropdownOpen && (
										<div className="absolute right-0 mt-2 w-48 bg-[--card-bg] rounded-md shadow-lg py-1 z-50 border border-[--card-border]">
											<button
												onClick={() => {
													navigateToProfile();
													setIsDropdownOpen(false);
												}}
												className="w-full text-left block px-4 py-2 text-sm text-[--text-primary] hover:bg-[--card-bg-secondary]"
											>
												<div className="flex items-center">
													<FaUser className="mr-2" />
													My Profile
												</div>
											</button>
											<button
												onClick={() => {
													logout();
													setIsDropdownOpen(false);
												}}
												className="w-full text-left block px-4 py-2 text-sm text-[--text-primary] hover:bg-[--card-bg-secondary]"
											>
												<div className="flex items-center">
													<FaSignOutAlt className="mr-2" />
													Sign Out
												</div>
											</button>
										</div>
									)}
								</div>
							) : (
								<button
									onClick={loginWithRiot}
									className="hidden md:flex border border-[--card-border] bg-[--card-bg-secondary] hover:bg-[--card-bg] text-[--text-primary] py-1 px-3 items-center space-x-2 rounded-md transition-colors duration-200"
								>
									<div className="relative w-5 h-5">
										<Image
											src="/images/riot-logo.png"
											alt="Riot Logo"
											width={20}
											height={20}
											className="object-contain"
										/>
									</div>
									<span>Log In With Riot</span>
								</button>
							)}

							{/* Mobile menu button */}
							<button
								onClick={() => setIsMenuOpen(!isMenuOpen)}
								className="inline-flex items-center justify-center p-2 rounded-md text-[--text-secondary] hover:text-[--text-primary] focus:outline-none md:hidden"
								aria-expanded="false"
							>
								<span className="sr-only">Open main menu</span>
								{isMenuOpen ? (
									<FaTimes className="block h-6 w-6" aria-hidden="true" />
								) : (
									<FaBars className="block h-6 w-6" aria-hidden="true" />
								)}
							</button>
						</div>
					</div>
				</div>

				{/* Mobile menu, show/hide based on menu state */}
				<div
					className={`md:hidden transition-all duration-300 ease-in-out ${
						isMenuOpen
							? "max-h-screen opacity-100 visible"
							: "max-h-0 opacity-0 invisible"
					}`}
				>
					<div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-[--card-bg] border-t border-[--card-border] shadow-lg">
						{/* Game Type Selector (Mobile) */}
						<div className="flex justify-center mb-2 pt-2">
							<div className="inline-flex rounded-md border border-[--card-border] overflow-hidden">
								<button
									className={`px-3 py-2 text-sm flex items-center ${
										(!mounted && !isTftPath) ||
										(mounted && gameType === "league")
											? "bg-[--primary] text-white"
											: "bg-[--card-bg] text-[--text-secondary] hover:bg-[--card-bg-secondary]"
									}`}
									onClick={() => handleGameTypeChange("league")}
								>
									<FaGamepad className="mr-2" /> League
								</button>
								<button
									className={`px-3 py-2 text-sm flex items-center ${
										(!mounted && isTftPath) || (mounted && gameType === "tft")
											? "bg-[--tft-primary] text-white"
											: "bg-[--card-bg] text-[--text-secondary] hover:bg-[--card-bg-secondary]"
									}`}
									onClick={() => handleGameTypeChange("tft")}
								>
									<FaChessKnight className="mr-2" /> TFT
								</button>
							</div>
						</div>

						<Link
							href={getLeaderboardLink()}
							className="nav-link block px-3 py-2 rounded-md hover:bg-[--card-bg-secondary]"
							onClick={handleLinkClick}
						>
							<div className="flex items-center space-x-3">
								<FaTrophy />
								<span>Leaderboards</span>
							</div>
						</Link>

						<Link
							href="/league/featured-games"
							onClick={handleLinkClick}
							className="mobile-nav-link"
						>
							<FaGamepad className="mr-3" />
							Live Games
						</Link>

						<Link
							href="/league/datastudio"
							onClick={handleLinkClick}
							className="nav-link block px-3 py-2 rounded-md hover:bg-[--card-bg-secondary]"
						>
							<div className="flex items-center space-x-3">
								<FaDatabase />
								<span>Data Studio</span>
							</div>
						</Link>

						{/* Mobile Search Option (only on profile/match pages) */}
						{isProfileOrMatch && (
							<button
								onClick={() => {
									setIsSearchModalOpen(true);
									setIsMenuOpen(false);
								}}
								className="w-full text-left nav-link block px-3 py-2 rounded-md hover:bg-[--card-bg-secondary]"
							>
								<div className="flex items-center space-x-3">
									<FaSearch />
									<span>Search Summoner</span>
								</div>
							</button>
						)}

						{/* User Profile or Login Button - Mobile */}
						{user ? (
							<>
								<button
									onClick={() => {
										navigateToProfile();
										setIsMenuOpen(false);
									}}
									className="w-full text-left nav-link block px-3 py-2 rounded-md hover:bg-[--card-bg-secondary]"
								>
									<div className="flex items-center space-x-3">
										{user.profileIconId ? (
											<div className="relative w-6 h-6 rounded-full overflow-hidden">
												<Image
													src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${user.profileIconId}.jpg`}
													alt="Profile Icon"
													width={24}
													height={24}
													className="object-cover"
													fill
												/>
											</div>
										) : (
											<FaUser />
										)}
										<span>
											My Profile ({user.gameName}
											<span className="text-[--text-secondary] text-xs">
												#{user.tagLine}
											</span>
											)
										</span>
									</div>
								</button>
								<button
									onClick={() => {
										logout();
										setIsMenuOpen(false);
									}}
									className="w-full text-left nav-link block px-3 py-2 rounded-md hover:bg-[--card-bg-secondary]"
								>
									<div className="flex items-center space-x-3">
										<FaSignOutAlt />
										<span>Sign Out</span>
									</div>
								</button>
							</>
						) : (
							<button
								onClick={() => {
									loginWithRiot();
									setIsMenuOpen(false);
								}}
								className="w-full text-left nav-link block px-3 py-2 rounded-md hover:bg-[--card-bg-secondary]"
							>
								<div className="flex items-center space-x-3">
									<div className="relative w-5 h-5">
										<Image
											src="/images/riot-logo.png"
											alt="Riot Logo"
											width={20}
											height={20}
											className="object-contain"
										/>
									</div>
									<span>Log In With Riot</span>
								</div>
							</button>
						)}

						<a
							href="https://discord.gg/h2tP5aAFgQ"
							target="_blank"
							rel="noopener noreferrer"
							className="mobile-nav-link"
						>
							<FaDiscord className="mr-3" />
							Discord
						</a>

						<a
							href="https://ko-fi.com/clutchgg"
							target="_blank"
							rel="noopener noreferrer"
							className="mobile-nav-link"
						>
							<FaCoffee className="mr-3" />
							Support Us
						</a>
					</div>
				</div>
			</nav>

			{/* Spacer to prevent content from being hidden under the navbar */}
			<div style={{ height: `${navbarHeight}px` }}></div>

			{/* Search Modal */}
			{isSearchModalOpen && (
				<SearchBar
					initialRegion={region}
					initialGameType={gameType}
					isModal
					onModalClose={() => {
						setIsSearchModalOpen(false);
						setIsMenuOpen(false);
					}}
				/>
			)}
		</header>
	);
};

export default NavBar;

NavBar.propTypes = {
	bannersVisible: PropTypes.number,
};
