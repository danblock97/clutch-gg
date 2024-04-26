import React from "react";
import Image from "next/image";
import Link from "next/link";
import SearchBar from "./SearchBar";

const NavBar = () => {
	return (
		<nav className="bg-[#13151b] text-white py-4 px-6 flex items-center justify-between">
			<div className="flex items-center space-x-4">
				<Image
					src="/images/logo.png"
					alt="Logo"
					className="h-8 w-8"
					width={14}
					height={14}
				/>
				<span className="text-lg font-bold">League Luminaries</span>
			</div>

			<div className="flex mx-4">
				<SearchBar />
			</div>

			<div className="flex items-center space-x-4">
				<Link href="/comingsoon" className="hover:text-gray-300">
					Leaderboards
				</Link>
				<Link href="/comingsoon" className="hover:text-gray-300">
					Live Game
				</Link>
			</div>
		</nav>
	);
};

export default NavBar;
