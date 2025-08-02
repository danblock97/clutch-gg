"use client";
import React, { useEffect } from "react";

const Support = () => {
	// Update document title for this page
	useEffect(() => {
		if (typeof document !== "undefined") {
			document.title = "ClutchGG Support";
		}
	}, []);

	const bugReportUrl = "https://danblock97.atlassian.net/jira/software/c/form/f0cb99d8-8982-4161-903f-cee6adca7be7?atlOrigin=eyJpIjoiZWM5N2I5ODVmMzdmNDQyZmFmMDI2M2Q0ZTkxY2NhMjEiLCJwIjoiaiJ9";
	const featureRequestUrl = "https://danblock97.atlassian.net/jira/software/c/form/76f695dc-127f-4326-8fe9-95820dcbf114?atlOrigin=eyJpIjoiODlmMDYwMzM1OTEwNDc0Yzg1MWQzYzhjNzY0Y2MyNzciLCJwIjoiaiJ9";

	const openExternalForm = (url) => {
		window.open(url, '_blank', 'noopener noreferrer');
	};

	return (
		<div className="w-full my-10">
			{/* Hero Section with animated background */}
			<div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-16 mb-12 rounded-xl">
				<div className="absolute top-0 left-0 w-full h-full opacity-20">
					<div className="absolute top-10 left-10 w-32 h-32 bg-purple-500 rounded-full filter blur-3xl animate-pulse"></div>
					<div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-500 rounded-full filter blur-3xl animate-pulse"></div>
					<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500 rounded-full filter blur-3xl animate-pulse"></div>
				</div>
				<div className="relative z-10 text-center px-6">
					<h1 className="text-5xl font-bold mb-6 text-white inline-block bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
						Support Center
					</h1>
					<div className="h-1 w-32 bg-gradient-to-r from-purple-500 to-blue-500 rounded mx-auto mb-6"></div>
					<p className="text-xl text-gray-200 max-w-3xl mx-auto mb-8">
						Need assistance? Report bugs, request features, or get help with any questions.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<button
							onClick={() => openExternalForm(bugReportUrl)}
							className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg text-lg group"
						>
							<svg className="w-6 h-6 mr-2 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							Report a Bug
							<svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
							</svg>
						</button>
						<button
							onClick={() => openExternalForm(featureRequestUrl)}
							className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg text-lg group"
						>
							<svg className="w-6 h-6 mr-2 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
							</svg>
							Request a Feature
							<svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
							</svg>
						</button>
					</div>
				</div>
			</div>

			{/* Feature Cards Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
				{/* Bug Report Card */}
				<button
					onClick={() => openExternalForm(bugReportUrl)}
					className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 hover:border-red-500 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl group text-left w-full"
				>
					<div className="flex items-center mb-4">
						<div className="p-3 bg-red-500 bg-opacity-20 rounded-lg mr-4 group-hover:bg-opacity-30 transition-all duration-300">
							<svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
						<h3 className="text-xl font-bold text-white">Report a Bug</h3>
					</div>
					<p className="text-gray-300 mb-4 leading-relaxed">
						Encountered an issue? Let us know about bugs, errors, or unexpected behavior.
					</p>
					<div className="flex items-center text-red-400 text-sm font-medium">
						<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
						</svg>
						Quick response
					</div>
				</button>

				{/* Feature Request Card */}
				<button
					onClick={() => openExternalForm(featureRequestUrl)}
					className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 hover:border-green-500 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl group text-left w-full"
				>
					<div className="flex items-center mb-4">
						<div className="p-3 bg-green-500 bg-opacity-20 rounded-lg mr-4 group-hover:bg-opacity-30 transition-all duration-300">
							<svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
							</svg>
						</div>
						<h3 className="text-xl font-bold text-white">Request a Feature</h3>
					</div>
					<p className="text-gray-300 mb-4 leading-relaxed">
						Have a great idea? Share your suggestions to help improve ClutchGG.
					</p>
					<div className="flex items-center text-green-400 text-sm font-medium">
						<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
						</svg>
						Community driven
					</div>
				</button>

				{/* General Support Card */}
				<div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl group">
					<div className="flex items-center mb-4">
						<div className="p-3 bg-blue-500 bg-opacity-20 rounded-lg mr-4 group-hover:bg-opacity-30 transition-all duration-300">
							<svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
						<h3 className="text-xl font-bold text-white">General Support</h3>
					</div>
					<p className="text-gray-300 mb-4 leading-relaxed">
						Need help with the platform? Ask questions or get assistance.
					</p>
					<div className="flex items-center text-blue-400 text-sm font-medium">
						<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						24/7 available
					</div>
				</div>
			</div>

			{/* Alternative Contact Methods */}
			<div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-xl shadow-lg border border-gray-700 mb-8">
				<div className="text-center mb-8">
					<h2 className="text-2xl font-bold text-white mb-4">Other Ways to Reach Us</h2>
					<p className="text-gray-300">Prefer a different approach? Connect with us through these channels.</p>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
					<a
						href="https://discord.gg/BeszQxTn9D"
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center p-6 bg-indigo-900 bg-opacity-40 hover:bg-opacity-60 rounded-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg group"
					>
						<svg className="h-8 w-8 text-indigo-400 mr-4 group-hover:text-indigo-300 transition-colors" viewBox="0 0 24 24" fill="currentColor">
							<path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
						</svg>
						<div>
							<h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">Discord Community</h3>
							<p className="text-gray-300 text-sm">Join our community for quick help</p>
						</div>
					</a>
					<a
						href="mailto:support@clutchgg.lol"
						className="flex items-center p-6 bg-blue-900 bg-opacity-40 hover:bg-opacity-60 rounded-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg group"
					>
						<svg className="h-8 w-8 text-blue-400 mr-4 group-hover:text-blue-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
						</svg>
						<div>
							<h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">Email Support</h3>
							<p className="text-gray-300 text-sm">Direct email for detailed issues</p>
						</div>
					</a>
				</div>
			</div>

		</div>
	);
};

export default Support;
