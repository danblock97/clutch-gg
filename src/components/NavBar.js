"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const NavBar = () => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	return (
		<nav className="bg-[#13151b] text-white py-4 px-6 flex items-center justify-between">
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
					Clutch.GG
				</Link>
			</div>

			<div className="hidden md:flex items-center space-x-6 ml-6">
				<Link href="/league" className="flex items-center px-3 py-2 hover:text-gray-300 border-b-2 border-transparent hover:border-gray-300">
					<Image
						src="/images/league.png" // Update with correct path
						alt="League of Legends"
						width={24}
						height={24}
					/>
					<span className="ml-2">League of Legends</span>
				</Link>
				<Link href="/tft" className="flex items-center px-3 py-2 hover:text-gray-300 border-b-2 border-transparent hover:border-gray-300">
					<Image
						src="/images/tft.png" // Update with correct path
						alt="Teamfight Tactics"
						width={24}
						height={24}
					/>
					<span className="ml-2">Teamfight Tactics</span>
				</Link>
				<Link href="/valorant" className="flex items-center px-3 py-2 hover:text-gray-300 border-b-2 border-transparent hover:border-gray-300">
					<Image
						src="/images/valorant.png" // Update with correct path
						alt="Valorant"
						width={24}
						height={24}
					/>
					<span className="ml-2">Valorant</span>
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
						href="/league"
						className="text-xl hover:text-gray-300 mb-6"
						onClick={() => setIsMenuOpen(false)}
					>
						League of Legends
					</Link>
					<Link
						href="/tft"
						className="text-xl hover:text-gray-300 mb-6"
						onClick={() => setIsMenuOpen(false)}
					>
						Teamfight Tactics
					</Link>
					<Link
						href="/valorant"
						className="text-xl hover:text-gray-300 mb-6"
						onClick={() => setIsMenuOpen(false)}
					>
						Valorant
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
	);
};

export default NavBar;
