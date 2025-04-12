"use client";

import React, { useState, useEffect } from "react";
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
	FaSignInAlt,
	FaSignOutAlt,
} from "react-icons/fa";

const NavBar = ({ isBannerVisible }) => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const [navbarHeight, setNavbarHeight] = useState(0);
	const [mounted, setMounted] = useState(false);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const { gameType, setGameType } = useGameType();
	const { user, loginWithRiot, logout, navigateToProfile } = useAuth();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const router = useRouter();

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
	};

	// Toggle between game types
	const handleGameTypeChange = (type) => {
		setGameType(type);
		// Navigate to corresponding section when game type changes
		if (type === "tft") {
			// If currently on leaderboard page, navigate to the corresponding leaderboard
			if (pathname?.includes("/leaderboard")) {
				router.push("/tft/leaderboard");
			}
		} else {
			// If currently on leaderboard page, navigate to the corresponding leaderboard
			if (pathname?.includes("/leaderboard")) {
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

	// Get button style class based on game type
	const getButtonClass = () => {
		return (!mounted && isTftPath) || (mounted && gameType === "tft")
			? "btn-primary-tft py-1 px-3 flex items-center space-x-1"
			: "btn-primary py-1 px-3 flex items-center space-x-1";
	};

	// If we're dealing with server-side logic for initial render
	const initialGameType = isTftPath ? "tft" : "league";

	return (
		<header
			style={{
				paddingTop: isBannerVisible ? "2.5rem" : "0",
			}}
		>
			<nav
				id="main-navbar"
				className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
					scrolled
						? "bg-[--background]/90 backdrop-blur-md shadow-lg"
						: "bg-transparent"
				} ${isBannerVisible ? "mt-10" : ""}`}
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

							{/* Game Type Selector (Desktop) */}
							<div className="hidden md:flex items-center space-x-4 pr-2 border-r border-[--card-border]">
								<button
									onClick={() => handleGameTypeChange("league")}
									className={`nav-link flex items-center space-x-1 ${
										(!mounted && !isTftPath) ||
										(mounted && gameType === "league")
											? "league-active"
											: ""
									}`}
								>
									<FaGamepad className="text-sm" />
									<span>League</span>
								</button>
								<button
									onClick={() => handleGameTypeChange("tft")}
									className={`nav-link flex items-center space-x-1 ${
										(!mounted && isTftPath) || (mounted && gameType === "tft")
											? "tft-active"
											: ""
									}`}
								>
									<FaChessKnight className="text-sm" />
									<span>TFT</span>
								</button>
							</div>

							{/* Desktop Navigation Links */}
							<div className="hidden md:flex items-center space-x-6">
								<Link
									href="/"
									className={`nav-link flex items-center space-x-1 ${
										pathname === "/" ? getActiveColorClass() : ""
									}`}
								>
									<FaHome className="text-sm" />
									<span>Home</span>
								</Link>
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
							</div>
						</div>

						{/* Right Side - Actions */}
						<div className="flex items-center space-x-4">
							{/* Search Button - Show on profile or match pages */}
							{isProfileOrMatch && (
								<button
									onClick={() => setIsSearchModalOpen(true)}
									className={`${
										(!mounted && isTftPath) || (mounted && gameType === "tft")
											? "btn-outline-tft"
											: "btn-outline"
									} py-1 px-3 hidden md:flex items-center space-x-1`}
								>
									<FaSearch className="text-sm" />
									<span>Search</span>
								</button>
							)}

							{/* Desktop Actions */}
							<div className="hidden md:flex items-center space-x-4">
								{/* Bug Report Button */}
								<button
									id="bugReportTrigger"
									className="nav-link flex items-center space-x-1"
								>
									<FaBug className="text-sm" />
									<span>Report Bug</span>
								</button>

								{/* Feature Request Button */}
								<button
									id="featureRequestTrigger"
									className="nav-link flex items-center space-x-1"
								>
									<FaLightbulb className="text-sm" />
									<span>Request Feature</span>
								</button>

								<Link
									href="https://discord.gg/BeszQxTn9D"
									target="_blank"
									rel="noopener noreferrer"
									className="nav-link flex items-center space-x-1"
								>
									<FaDiscord className="text-lg" />
									<span>Discord</span>
								</Link>

								{/* User Profile or Login Button */}
								{user ? (
									<div className="relative">
										<button
											onClick={() => setIsDropdownOpen(!isDropdownOpen)}
											className={getButtonClass()}
										>
											<FaUser className="text-sm" />
											<span>{user.gameName}</span>
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
									<button onClick={loginWithRiot} className={getButtonClass()}>
										<FaSignInAlt className="text-sm" />
										<span>Login with Riot</span>
									</button>
								)}

								<Link
									href="https://buymeacoffee.com/danblock97"
									target="_blank"
									rel="noopener noreferrer"
									className={
										(!mounted && isTftPath) || (mounted && gameType === "tft")
											? "btn-primary-tft py-1 px-3 flex items-center space-x-1"
											: "btn-primary py-1 px-3 flex items-center space-x-1"
									}
								>
									<FaCoffee className="text-sm" />
									<span>Support</span>
								</Link>
							</div>

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
							href="/"
							className="nav-link block px-3 py-2 rounded-md hover:bg-[--card-bg-secondary]"
							onClick={handleLinkClick}
						>
							<div className="flex items-center space-x-3">
								<FaHome />
								<span>Home</span>
							</div>
						</Link>

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
										<FaUser />
										<span>My Profile ({user.gameName})</span>
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
									<FaSignInAlt />
									<span>Login with Riot</span>
								</div>
							</button>
						)}

						{/* Bug Report Button - Mobile */}
						<button
							id="bugReportTrigger"
							className="w-full text-left nav-link block px-3 py-2 rounded-md hover:bg-[--card-bg-secondary]"
						>
							<div className="flex items-center space-x-3">
								<FaBug />
								<span>Report Bug</span>
							</div>
						</button>

						{/* Feature Request Button - Mobile */}
						<button
							id="featureRequestTrigger"
							className="w-full text-left nav-link block px-3 py-2 rounded-md hover:bg-[--card-bg-secondary]"
							onClick={handleLinkClick}
						>
							<div className="flex items-center space-x-3">
								<FaLightbulb />
								<span>Request Feature</span>
							</div>
						</button>

						<Link
							href="https://discord.gg/BeszQxTn9D"
							target="_blank"
							rel="noopener noreferrer"
							className="nav-link block px-3 py-2 rounded-md hover:bg-[--card-bg-secondary]"
							onClick={handleLinkClick}
						>
							<div className="flex items-center space-x-3">
								<FaDiscord />
								<span>Discord Community</span>
							</div>
						</Link>

						<Link
							href="https://buymeacoffee.com/danblock97"
							target="_blank"
							rel="noopener noreferrer"
							className={`block px-3 py-2 rounded-md text-white hover:opacity-90 ${
								(!mounted && isTftPath) || (mounted && gameType === "tft")
									? "bg-[--tft-primary]"
									: "bg-[--primary]"
							}`}
							onClick={handleLinkClick}
						>
							<div className="flex items-center space-x-3">
								<FaCoffee />
								<span>Support Us</span>
							</div>
						</Link>
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
