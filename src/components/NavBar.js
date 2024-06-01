"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import SearchBar from "./SearchBar";

const NavBar = () => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const handleSearch = () => {
		setIsMenuOpen(false);
	};

	return (
		<nav className="bg-[#13151b] text-white py-4 px-6 flex items-center justify-between">
			<div className="flex items-center space-x-4">
				<button
					className="text-white inline-flex p-2 rounded md:hidden"
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
					RiftSpy.GG
				</Link>
			</div>

			<div className="hidden md:flex flex-1 justify-center mx-4">
				<SearchBar onSearch={handleSearch} />
			</div>

			<div className="hidden md:flex items-center space-x-4">
				<Link href="/leaderboard" className="hover:text-gray-300">
					Leaderboards
				</Link>
			</div>

			{/* Mobile Menu */}
			<div
				className={`fixed inset-0 bg-[#13151b] flex flex-col items-center justify-center p-4 z-50 ${
					isMenuOpen ? "flex text-center" : "hidden"
				}`}
			>
				<div className="space-y-6">
					<Link
						href="/leaderboard"
						className="text-xl hover:text-gray-300 block"
					>
						Leaderboards
					</Link>
					<SearchBar onSearch={handleSearch} />
				</div>
				<button
					className="mt-8 text-white"
					onClick={() => setIsMenuOpen(false)}
				>
					Close
				</button>
			</div>
		</nav>
	);
};

export default NavBar;
