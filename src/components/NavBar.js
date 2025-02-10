"use client";

import React, { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";

const NavBar = ({ isBannerVisible }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Show SearchBar only on /profile or /match
  const isProfileOrMatch =
    pathname === "/league/profile" || pathname === "/match";
  const region = isProfileOrMatch ? searchParams.get("region") : null;

  return (
    <nav
      className={`bg-black text-white py-4 px-6 flex items-center justify-between ${
        isBannerVisible ? "pt-16" : "pt-4"
      }`}
    >
      {/* Logo + site name */}
      <div className="flex items-center space-x-4">
        <Link href="/">
          <Image
            src="/images/logo.png"
            alt="Logo"
            width={32}
            height={32}
            className="h-8 w-8"
          />
        </Link>
        {/* Desktop-only site name */}
        <Link href="/" className="text-lg font-bold hidden md:block">
          ClutchGG.LOL
        </Link>
      </div>

      {/* Desktop Search Trigger */}
      {isProfileOrMatch && (
        <div className="hidden md:flex justify-center w-1/2 mx-auto">
          <button
            onClick={() => setIsSearchModalOpen(true)}
            className="flex items-center p-2 bg-[#13151b] rounded-md hover:bg-[#2f3242]"
          >
            <svg
              className="w-6 h-6 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
            <span className="ml-2 hidden sm:inline">Search</span>
          </button>
        </div>
      )}

      {/* Desktop Links */}
      <div className="hidden md:flex items-center space-x-6 ml-6">
        <Link
          href="/league/leaderboard"
          className="flex items-center px-3 py-2 text-gray-500"
        >
          <span className="ml-2">Leaderboards</span>
        </Link>
        <Link
          href="https://www.buymeacoffee.com/danblock97"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center px-3 py-2 text-gray-500 hover:text-yellow-400"
        >
          <Image
            src="https://img.buymeacoffee.com/button-api/?text=Buy me a pizza&emoji=🍕&slug=danblock97&button_colour=FFDD00&font_colour=000000&font_family=Comic&outline_colour=000000&coffee_colour=ffffff"
            alt="Buy me a pizza"
            width={120}
            height={40}
          />
        </Link>
      </div>

      {/* Mobile Hamburger Button */}
      <div className="md:hidden">
        <button
          className="text-white p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            ></path>
          </svg>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed top-0 left-0 w-full h-full bg-[#13151b] z-50 transform transition-transform duration-300 ${
          isMenuOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="relative w-full h-full flex flex-col items-center justify-start p-4 pt-20">
          {/* Close Button */}
          <button
            onClick={() => setIsMenuOpen(false)}
            className="text-white absolute top-4 right-4 p-1"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Mobile Search Trigger */}
          {isProfileOrMatch && (
            <div className="mb-8">
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="flex items-center justify-center w-full max-w-md p-2 bg-[#13151b] rounded-md hover:bg-[#2f3242]"
              >
                <svg
                  className="w-6 h-6 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
                <span className="ml-2">Search</span>
              </button>
            </div>
          )}

          {/* Mobile Menu Links */}
          <Link
            href="/league/leaderboard"
            className="text-xl text-gray-300 hover:text-gray-200 mb-6"
            onClick={() => setIsMenuOpen(false)}
          >
            Leaderboards
          </Link>

          <Link
            href="https://www.buymeacoffee.com/danblock97"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-gray-300 hover:text-gray-200 mb-6"
            onClick={() => setIsMenuOpen(false)}
          >
            <Image
              src="https://img.buymeacoffee.com/button-api/?text=Buy me a pizza&emoji=🍕&slug=danblock97&button_colour=FFDD00&font_colour=000000&font_family=Comic&outline_colour=000000&coffee_colour=ffffff"
              alt="Buy me a pizza"
              width={120}
              height={40}
            />
          </Link>
        </div>
      </div>

      {/* Render the SearchBar modal if active */}
      {isSearchModalOpen && (
        <SearchBar
          initialRegion={region}
          isModal
          onModalClose={() => setIsSearchModalOpen(false)}
        />
      )}
    </nav>
  );
};

export default NavBar;