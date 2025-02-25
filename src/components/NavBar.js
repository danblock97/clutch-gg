"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import { FaCoffee } from "react-icons/fa";

const NavBar = ({ isBannerVisible }) => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const isProfileOrMatch =
		pathname === "/league/profile" || pathname === "/match";
	const region = isProfileOrMatch ? searchParams.get("region") : null;

	useEffect(() => {
		// Load jQuery if not already loaded
		if (typeof window !== "undefined" && !window.jQuery) {
			const jqueryScript = document.createElement("script");
			jqueryScript.src =
				"https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js";
			jqueryScript.async = true;
			document.body.appendChild(jqueryScript);
			jqueryScript.onload = loadJiraCollector;
		} else {
			loadJiraCollector();
		}

		function loadJiraCollector() {
			const script = document.createElement("script");
			script.src =
				"https://danblock97.atlassian.net/s/d41d8cd98f00b204e9800998ecf8427e-T/g2slup/b/9/b0105d975e9e59f24a3230a22972a71a/_/download/batch/com.atlassian.jira.collector.plugin.jira-issue-collector-plugin:issuecollector-embededjs/com.atlassian.jira.collector.plugin.jira-issue-collector-plugin:issuecollector-embededjs.js?locale=en-GB&collectorId=6eba8a2a";
			script.async = true;
			document.body.appendChild(script);
		}

		window.ATL_JQ_PAGE_PROPS = {
			fieldValues: {
				priority: "3",
			},
			triggerFunction: function (showCollectorDialog) {
				// Use delegated binding so that both desktop and mobile "Report a Bug" buttons work.
				window.jQuery(document).on("click", "#myCustomTrigger", function (e) {
					e.preventDefault();
					showCollectorDialog();
				});
			},
		};
	}, []);

	return (
		<nav
			className={`bg-black text-white py-4 px-6 flex items-center justify-between ${
				isBannerVisible ? "pt-16" : "pt-4"
			}`}
		>
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
				{/* Search Trigger (Desktop Only) */}
				{isProfileOrMatch && (
					<button
						onClick={() => setIsSearchModalOpen(true)}
						className="hidden md:flex items-center p-2 bg-[#13151b] rounded-md hover:bg-[#2f3242] font-bold"
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
						<span className="ml-2 px-2 hidden sm:inline">Search</span>
					</button>
				)}
				{/* Desktop Links (Left Aligned) */}
				<div className="hidden md:flex items-center space-x-4">
					<Link
						href="/league/leaderboard"
						className="flex items-center px-3 py-2 text-gray-500 font-bold"
					>
						<span className="ml-2">Leaderboards</span>
					</Link>
					<Link
						href="https://buymeacoffee.com/danblock97"
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center px-3 py-1 bg-gray-800 text-white rounded-md font-bold hover:bg-gray-700"
					>
						<FaCoffee className="w-5 h-5" />
						<span className="ml-2">Support Us</span>
					</Link>
				</div>
			</div>

			{/* Report a Bug Button on the far right (Desktop Only) */}
			<div className="hidden md:flex items-center">
				<button
					id="myCustomTrigger"
					className="flex items-center px-3 py-2 text-gray-500 font-bold hover:text-gray-300"
				>
					Report a Bug
				</button>
			</div>

			{/* Mobile Hamburger */}
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
						<>
							<button
								onClick={() => setIsSearchModalOpen(true)}
								className="flex items-center justify-center p-2 bg-[#13151b] rounded-md hover:bg-[#2f3242] font-bold w-full"
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
								<span className="ml-2 px-2">Search</span>
							</button>
							<hr className="border-gray-600 w-full my-2" />
						</>
					)}

					{/* Mobile Menu Links */}
					<Link
						href="/league/leaderboard"
						className="text-xl text-gray-300 hover:text-gray-200 mb-6 font-bold w-full text-center"
						onClick={() => setIsMenuOpen(false)}
					>
						Leaderboards
					</Link>
					<hr className="border-gray-600 w-full my-2" />
					<button
						id="myCustomTrigger"
						className="text-xl text-gray-300 hover:text-gray-200 mb-6 font-bold w-full text-center"
					>
						Report a Bug
					</button>
					<hr className="border-gray-600 w-full my-2" />
					<Link
						href="https://buymeacoffee.com/danblock97"
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center justify-center px-3 py-2 bg-gray-800 text-white rounded-md font-bold hover:bg-gray-700 w-full"
						onClick={() => setIsMenuOpen(false)}
					>
						<FaCoffee className="w-5 h-5" />
						<span className="ml-2">Support Us</span>
					</Link>
				</div>
			</div>

			{/* Render the SearchBar modal if active */}
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
		</nav>
	);
};

export default NavBar;
