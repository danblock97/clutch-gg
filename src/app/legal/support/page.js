"use client";
import React from "react";

const Support = () => {
	return (
		<div className="w-full my-10">
			{/* Hero Section with animated background */}
			<div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-16 mb-12 rounded-xl">
				<div className="absolute top-0 left-0 w-full h-full opacity-20">
					<div className="absolute top-10 left-10 w-32 h-32 bg-purple-500 rounded-full filter blur-3xl"></div>
					<div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-500 rounded-full filter blur-3xl"></div>
					<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500 rounded-full filter blur-3xl"></div>
				</div>
				<div className="relative z-10 text-center px-6">
					<h1 className="text-5xl font-bold mb-4 text-white inline-block bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
						Support Center
					</h1>
					<div className="h-1 w-32 bg-gradient-to-r from-purple-500 to-blue-500 rounded mx-auto mb-6"></div>
					<p className="text-xl text-gray-200 max-w-3xl mx-auto">
						Need assistance? Report a bug, request a new feature, or find
						answers to common questions below.
					</p>
				</div>
			</div>

			{/* Main Content Grid for Bug/Feature Reports */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
				{/* Report a Bug Section */}
				<div className="col-span-1">
					<div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-xl shadow-lg border-l-4 border-red-500 h-full transform transition-all hover:-translate-y-1 duration-300 flex flex-col justify-between">
						<div>
							<div className="flex items-center mb-4">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-8 w-8 text-red-400 mr-3"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									{/* Alert Icon for Bugs */}
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
								<h2 className="text-2xl font-bold text-white">Report a Bug</h2>
							</div>
							<p className="mb-6 text-gray-300 leading-relaxed">
								Encountered an issue or something not working as expected?
								Please let us know by reporting a bug. Your detailed feedback
								helps us improve AstroStats for everyone.
							</p>
						</div>
						<a
							href="mailto:bugs@clutchgg.lol"
							target="_blank"
							rel="noopener noreferrer"
							className="w-full mt-auto text-center px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold rounded-md transition-colors duration-300 text-lg block"
						>
							Report Bug
						</a>
					</div>
				</div>

				{/* Request a Feature Section */}
				<div className="col-span-1">
					<div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-xl shadow-lg border-l-4 border-green-500 h-full transform transition-all hover:-translate-y-1 duration-300 flex flex-col justify-between">
						<div>
							<div className="flex items-center mb-4">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-8 w-8 text-green-400 mr-3"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									{/* Lightbulb/Idea Icon for Features */}
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9.663 17h4.673M21 12a9 9 0 11-18 0 9 9 0 0118 0zM12 6V3m0 18v-3m0-12h.01M6.343 6.343l2.122 2.122m9.192 9.192l2.122 2.122M3 12h3m15 0h-3m-9.657-5.657l2.122-2.122m9.192 9.192l2.122-2.122"
									/>
								</svg>
								<h2 className="text-2xl font-bold text-white">
									Request a Feature
								</h2>
							</div>
							<p className="mb-6 text-gray-300 leading-relaxed">
								Have a great idea for a new feature or an improvement to an
								existing one? We&apos;d love to hear it! Submit your feature
								requests here to help shape the future of AstroStats.
							</p>
						</div>
						<a
							href="mailto:features@clutchgg.lol"
							target="_blank"
							rel="noopener noreferrer"
							className="w-full mt-auto text-center px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold rounded-md transition-colors duration-300 text-lg block"
						>
							Request Feature
						</a>
					</div>
				</div>
			</div>

			{/* Grid for FAQs and Alternative Contact Methods */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
				{/* Middle Section - FAQs */}
				<div className="md:col-span-2">
					<div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-xl shadow-lg border-l-4 border-blue-500 transform transition-all hover:-translate-y-1 duration-300 h-full">
						<div className="flex items-center mb-6">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-8 w-8 text-blue-400 mr-3"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<h2 className="text-2xl font-bold text-white">
								Frequently Asked Questions
							</h2>
						</div>

						<div className="space-y-5">
							<div className="p-4 bg-gray-800 bg-opacity-70 rounded-lg hover:bg-opacity-90 transition-all duration-300 border-l-2 border-blue-400">
								<h3 className="text-xl font-semibold mb-2 text-white">
									How do I search for a player?
								</h3>
								<p className="text-gray-300 leading-relaxed">
									Enter the player's Riot ID (Name#Tag) in the search bar at the
									top of the page and select the appropriate region.
								</p>
							</div>

							<div className="p-4 bg-gray-800 bg-opacity-70 rounded-lg hover:bg-opacity-90 transition-all duration-300 border-l-2 border-blue-400">
								<h3 className="text-xl font-semibold mb-2 text-white">
									Why can't I see my most recent matches?
								</h3>
								<p className="text-gray-300 leading-relaxed">
									Match data is provided by the Riot API, which may have a
									slight delay in updating. Your most recent matches should
									appear within 5-10 minutes after completion.
								</p>
							</div>

							<div className="p-4 bg-gray-800 bg-opacity-70 rounded-lg hover:bg-opacity-90 transition-all duration-300 border-l-2 border-blue-400">
								<h3 className="text-xl font-semibold mb-2 text-white">
									How often is the leaderboard updated?
								</h3>
								<p className="text-gray-300 leading-relaxed">
									Our leaderboards are updated every 24 hours to reflect the
									most current rankings.
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Alternative Contact Methods Section */}
				<div className="md:col-span-2">
					<div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-xl shadow-lg border-r-4 border-indigo-500 h-full transform transition-all hover:-translate-y-1 duration-300">
						<div className="flex items-center mb-4">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-8 w-8 text-indigo-400 mr-3"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
								/>
							</svg>
							<h2 className="text-2xl font-bold text-white">
								Alternative Contact Methods
							</h2>
						</div>
						<p className="mb-6 text-gray-300 leading-relaxed">
							If you prefer not to use the forms above, or have other general
							inquiries, you can also reach out to us directly:
						</p>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<a
								href="https://discord.gg/BeszQxTn9D"
								target="_blank"
								rel="noopener noreferrer"
								className="group flex items-center p-3 bg-indigo-900 bg-opacity-40 hover:bg-opacity-60 rounded-lg transition-colors"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-6 w-6 text-indigo-400 mr-3 group-hover:text-indigo-300"
									viewBox="0 0 24 24"
									fill="currentColor"
								>
									<path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
								</svg>
								<span className="text-white font-medium">Discord Server</span>
							</a>
							<a
								href="mailto:support@astrostats.io"
								className="group flex items-center p-3 bg-blue-900 bg-opacity-40 hover:bg-opacity-60 rounded-lg transition-colors"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-6 w-6 text-blue-400 mr-3 group-hover:text-blue-300"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
									/>
								</svg>
								<span className="text-white font-medium">Email Support</span>
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Support;
