"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import {
  FaCoffee,
  FaSearch,
  FaBars,
  FaTimes,
  FaTrophy,
  FaDiscord,
  FaBug,
  FaChevronDown,
  FaChevronUp,
  FaHome,
} from "react-icons/fa";

const NavBar = ({ isBannerVisible }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [navbarHeight, setNavbarHeight] = useState(0);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isProfileOrMatch =
    pathname === "/league/profile" || pathname === "/match";
  const region = isProfileOrMatch ? searchParams.get("region") : null;

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
  };

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
                <span className="font-bold text-lg hidden sm:inline-block bg-clip-text text-transparent bg-gradient-to-r from-[--primary] to-[--secondary]">
                  ClutchGG.LOL
                </span>
              </Link>

              {/* Desktop Navigation Links */}
              <div className="hidden md:flex items-center space-x-6">
                <Link
                  href="/"
                  className={`nav-link flex items-center space-x-1 ${
                    pathname === "/" ? "text-[--primary]" : ""
                  }`}
                >
                  <FaHome className="text-sm" />
                  <span>Home</span>
                </Link>
                <Link
                  href="/league/leaderboard"
                  className={`nav-link flex items-center space-x-1 ${
                    pathname === "/league/leaderboard" ? "text-[--primary]" : ""
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
                  className="btn-outline py-1 px-3 hidden md:flex items-center space-x-1"
                >
                  <FaSearch className="text-sm" />
                  <span>Search</span>
                </button>
              )}

              {/* Desktop Actions */}
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  href="https://discord.gg/BeszQxTn9D"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nav-link flex items-center space-x-1"
                >
                  <FaDiscord className="text-lg" />
                  <span>Discord</span>
                </Link>

                <Link
                  href="https://buymeacoffee.com/danblock97"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary py-1 px-3 flex items-center space-x-1"
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
              href="/league/leaderboard"
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

            <button
              id="myCustomTrigger"
              className="w-full text-left nav-link block px-3 py-2 rounded-md hover:bg-[--card-bg-secondary]"
              onClick={handleLinkClick}
            ></button>

            <Link
              href="https://buymeacoffee.com/danblock97"
              target="_blank"
              rel="noopener noreferrer"
              className="block px-3 py-2 rounded-md bg-[--primary] text-white hover:bg-[--primary-dark]"
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
