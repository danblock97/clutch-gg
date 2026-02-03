"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import { useGameType } from "@/context/GameTypeContext";
import { useAuth } from "@/context/AuthContext";
import { buildProfileUrl, parseProfileUrl } from "@/lib/utils/urlHelpers";
import {
  FaCoffee,
  FaSearch,
  FaBars,
  FaTimes,
  FaTrophy,
  FaDiscord,
  FaHeadset,
  FaChevronDown,
  FaChevronUp,
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

  // Avoid hydration mismatch: only show user UI after mount
  const showUser = mounted && !!user;

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
      let gameName, tagLine, region;

      // First, try to parse the new URL format (path segments)
      const parsedUrl = parseProfileUrl(pathname);
      if (parsedUrl) {
        gameName = parsedUrl.gameName;
        tagLine = parsedUrl.tagLine;
        region = parsedUrl.region;
      } else {
        // Fallback to query params (old URL format)
        gameName = searchParams.get("gameName");
        tagLine = searchParams.get("tagLine");
        region = searchParams.get("region");
      }

      // Only redirect if we have all the necessary params
      if (gameName && tagLine && region) {
        // Construct the new clean URL for the selected game type
        const profileUrl = buildProfileUrl(type, region, gameName, tagLine);
        if (profileUrl) {
          router.push(profileUrl);
        } else {
          // Fallback to old format if URL building fails
          const basePath = type === "tft" ? "/tft" : "/league";
          router.push(
            `${basePath}/profile?gameName=${encodeURIComponent(
              gameName,
            )}&tagLine=${encodeURIComponent(tagLine)}&region=${encodeURIComponent(
              region,
            )}`,
          );
        }
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
        className={`fixed top-0 left-0 right-0 z-40 transition-[background,backdrop-filter] duration-300 ${
          scrolled
            ? "bg-[--background]/85 backdrop-blur-xl border-b border-white/10"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-3 sm:px-5">
          <div className="flex items-center justify-between h-14">
            {/* Logo & Left-side links */}
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex-shrink-0 flex items-center space-x-2"
              >
                <div className="relative w-7 h-7 overflow-hidden rounded-md ring-1 ring-white/10 bg-white/5">
                  <Image
                    src="/images/logo.png"
                    alt="ClutchGG.LOL"
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                </div>
                <span
                  className={`font-semibold text-base hidden sm:inline-block ${getGradientTextClass()}`}
                >
                  ClutchGG.LOL
                </span>
              </Link>

              {/* Game Type Buttons (Desktop) */}
              <div className="hidden md:flex items-center">
                <div className="inline-flex rounded-lg border border-white/10 bg-white/5 p-0.5">
                  <button
                    onClick={() => handleGameTypeChange("league")}
                    className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm ${
                      (!mounted && !isTftPath) ||
                      (mounted && gameType === "league")
                        ? "bg-[--primary]/15 text-[--primary]"
                        : "text-[--text-secondary] hover:text-[--text-primary]"
                    } transition-colors`}
                  >
                    <FaGamepad className="text-[13px]" />
                    <span>League</span>
                  </button>
                  <button
                    onClick={() => handleGameTypeChange("tft")}
                    className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm ${
                      (!mounted && isTftPath) || (mounted && gameType === "tft")
                        ? "bg-[--tft-primary]/15 text-[--tft-primary]"
                        : "text-[--text-secondary] hover:text-[--text-primary]"
                    } transition-colors`}
                  >
                    <FaChessKnight className="text-[13px]" />
                    <span>TFT</span>
                  </button>
                </div>
              </div>

              {/* Desktop Navigation Links */}
              <div className="hidden md:flex items-center space-x-5">
                <Link
                  href={getLeaderboardLink()}
                  className={`flex items-center gap-1 text-sm px-2.5 py-1.5 rounded-md ${
                    pathname === getLeaderboardLink()
                      ? getActiveColorClass()
                      : "text-[--text-secondary] hover:text-[--text-primary] hover:bg-white/5"
                  }`}
                >
                  <FaTrophy className="text-[13px]" />
                  <span>Leaderboards</span>
                </Link>
                <Link
                  href="/league/datastudio"
                  className={`flex items-center gap-1 text-sm px-2.5 py-1.5 rounded-md ${
                    pathname.startsWith("/league/datastudio")
                      ? getActiveColorClass()
                      : "text-[--text-secondary] hover:text-[--text-primary] hover:bg-white/5"
                  }`}
                >
                  <FaDatabase className="text-[13px]" />
                  <span>Data Studio</span>
                </Link>
                <Link
                  href="/support"
                  className={`flex items-center gap-1 text-sm px-2.5 py-1.5 rounded-md ${
                    pathname.startsWith("/support")
                      ? getActiveColorClass()
                      : "text-[--text-secondary] hover:text-[--text-primary] hover:bg-white/5"
                  }`}
                >
                  <FaHeadset className="text-[13px]" />
                  <span>Support</span>
                </Link>
              </div>
            </div>

            {/* Right Side - Actions */}
            <div className="flex items-center space-x-3">
              <Link
                href="/support-this-app"
                className={`hidden md:inline-flex items-center gap-2 rounded-full text-white h-8 px-3 shadow-sm transition-colors ${
                  gameType === "tft"
                    ? "bg-gradient-to-r from-[--tft-primary] to-[--tft-secondary] hover:from-[--tft-primary-dark] hover:to-[--tft-secondary]"
                    : "bg-gradient-to-r from-[--primary] to-[--secondary] hover:from-[--primary-dark] hover:to-[--secondary]"
                }`}
              >
                <FaCoffee className="text-sm" />
                <span className="text-sm font-semibold">Support This App</span>
              </Link>

              {/* Search Button - Show on profile or match pages */}
              {isProfileOrMatch && (
                <button
                  onClick={() => setIsSearchModalOpen(true)}
                  className={`hidden md:inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-[--text-primary] h-8 px-3 transition-colors`}
                >
                  <FaSearch className="text-[13px]" />
                  <span className="text-sm">Search</span>
                </button>
              )}

              {/* User Profile or Login Button */}
              {showUser ? (
                <div className="relative hidden md:block">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="h-8 px-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-[--text-primary] transition-colors"
                  >
                    {user.profileIconId ? (
                      <div className="relative w-6 h-6 rounded-full overflow-hidden">
                        <Image
                          src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${user.profileIconId}.jpg`}
                          alt="Profile Icon"
                          width={24}
                          height={24}
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <FaUser className="text-sm" />
                    )}
                    <span className="truncate max-w-[120px]">
                      {user.gameName}
                    </span>
                    <span className="text-[--text-secondary] text-xs">
                      #{user.tagLine}
                    </span>
                    {isDropdownOpen ? (
                      <FaChevronUp className="text-xs" />
                    ) : (
                      <FaChevronDown className="text-xs" />
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
                  className="hidden md:inline-flex h-8 px-3 items-center gap-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-[--text-primary] transition-colors"
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
          <div className="px-3 pt-2 pb-3 space-y-2 sm:px-3 bg-[--card-bg] border-t border-[--card-border] shadow-lg">
            {/* Game Type Selector (Mobile) */}
            <div className="flex justify-center mb-2 pt-1">
              <div className="inline-flex rounded-lg border border-[--card-border] overflow-hidden">
                <button
                  className={`px-4 py-2 text-sm font-medium flex items-center transition-colors ${
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
                  className={`px-4 py-2 text-sm font-medium flex items-center transition-colors ${
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
              className="block px-4 py-2.5 rounded-md hover:bg-[--card-bg-secondary] transition-colors"
              onClick={handleLinkClick}
            >
              <div className="flex items-center">
                <FaTrophy className="mr-3 text-lg" />
                <span>Leaderboards</span>
              </div>
            </Link>

            <Link
              href="/league/datastudio"
              onClick={handleLinkClick}
              className="block px-4 py-2.5 rounded-md hover:bg-[--card-bg-secondary] transition-colors"
            >
              <div className="flex items-center">
                <FaDatabase className="mr-3 text-lg" />
                <span>Data Studio</span>
              </div>
            </Link>

            <Link
              href="/support"
              onClick={handleLinkClick}
              className="block px-4 py-2.5 rounded-md hover:bg-[--card-bg-secondary] transition-colors"
            >
              <div className="flex items-center">
                <FaHeadset className="mr-3 text-lg" />
                <span>Support</span>
              </div>
            </Link>

            {/* Mobile Search Option (only on profile/match pages) */}
            {isProfileOrMatch && (
              <button
                onClick={() => {
                  setIsSearchModalOpen(true);
                  setIsMenuOpen(false);
                }}
                className="w-full text-left block px-4 py-2.5 rounded-md hover:bg-[--card-bg-secondary] transition-colors"
              >
                <div className="flex items-center">
                  <FaSearch className="mr-3 text-lg" />
                  <span>Search Summoner</span>
                </div>
              </button>
            )}

            {/* User Profile or Login Button - Mobile */}
            {showUser ? (
              <>
                <button
                  onClick={() => {
                    navigateToProfile();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left block px-4 py-2.5 rounded-md hover:bg-[--card-bg-secondary] transition-colors"
                >
                  <div className="flex items-center">
                    {user.profileIconId ? (
                      <div className="relative w-6 h-6 rounded-full overflow-hidden mr-3">
                        <Image
                          src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${user.profileIconId}.jpg`}
                          alt="Profile Icon"
                          width={24}
                          height={24}
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <FaUser className="mr-3 text-lg" />
                    )}
                    <span>
                      My Profile ({user.gameName}
                      <span className="text-[--text-secondary] text-xs ml-1">
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
                  className="w-full text-left block px-4 py-2.5 rounded-md hover:bg-[--card-bg-secondary] transition-colors"
                >
                  <div className="flex items-center">
                    <FaSignOutAlt className="mr-3 text-lg" />
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
                className="w-full text-left block px-4 py-2.5 rounded-md hover:bg-[--card-bg-secondary] transition-colors"
              >
                <div className="flex items-center">
                  <div className="relative w-5 h-5 mr-3">
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
              className="block px-4 py-2.5 rounded-md hover:bg-[--card-bg-secondary] transition-colors"
            >
              <div className="flex items-center">
                <FaDiscord className="mr-3 text-lg" />
                <span>Discord</span>
              </div>
            </a>

            <Link
              href="/support-this-app"
              onClick={handleLinkClick}
              className="block px-4 py-2.5 rounded-md hover:bg-[--card-bg-secondary] transition-colors"
            >
              <div className="flex items-center">
                <FaCoffee className="mr-3 text-lg" />
                <span>Support This App</span>
              </div>
            </Link>
          </div>
        </div>
      </nav>

      {/* Spacer to prevent content from being hidden under the navbar */}
      <div style={{ height: `${navbarHeight - 4}px` }}></div>

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
