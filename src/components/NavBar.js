"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation"; // Import usePathname to get the current route
import Image from "next/image";
import Link from "next/link";
import SearchBar from "@/components/SearchBar"; // Import the SearchBar component

const NavBar = () => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const pathname = usePathname(); // Get the current path

	// Conditionally check if we're on the /profile or /match page
	const isProfileOrMatch = pathname === "/profile" || pathname === "/match";

	return (
		<>
			<nav className="bg-black text-white py-4 px-6 flex items-center justify-between">
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
					<Link href="/" className="text-lg font-bold hidden md:block">
						ClutchGG.LOL
					</Link>
				</div>

				{/* Centered SearchBar for /profile or /match */}
				{/* Centered SearchBar for /profile or /match */}
				{isProfileOrMatch && (
					<div className="flex justify-center w-1/2 mx-auto">
						<SearchBar />
					</div>
				)}

				<div className="hidden md:flex items-center space-x-6 ml-6">
					<Link
						href="/leaderboard"
						className="flex items-center px-3 py-2 text-gray-500"
					>
						<span className="ml-2">Leaderboards</span>
					</Link>
				</div>

				{/* Mobile Menu */}
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

				{isMenuOpen && (
					<div className="fixed inset-0 bg-[#13151b] flex flex-col items-center justify-center p-4 z-50">
						<Link
							href="/leaderboard"
							className="text-xl text-gray-500 mb-6"
							onClick={() => setIsMenuOpen(false)}
						>
							Leaderboards
						</Link>
						<button
							className="mt-8 text-white"
							onClick={() => setIsMenuOpen(false)}
						>
							Close
						</button>
					</div>
				)}
			</nav>
		</>
	);
};

export default NavBar;
