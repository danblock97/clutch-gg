import Image from "next/image";
import React from "react";

const Home = () => {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-[#0e1015] text-white p-4">
			{/* Hero Section */}
			<section className="text-center mb-12 animate-fade-in">
				<h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
					Welcome to RiftSpy.GG
				</h1>
				<p className="text-lg md:text-xl mb-6 text-gray-300">
					Your ultimate gaming companion for stats, leaderboards, and live
					action.
				</p>
			</section>

			{/* Main Content */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 w-full max-w-6xl">
				{/* Leaderboards */}
				<div className="bg-[#1c1e24] rounded-lg shadow-lg p-4 md:p-6 transform hover:scale-105 transition-transform duration-300 hover:bg-opacity-90 animate-fade-in">
					<h2 className="text-xl md:text-2xl mb-4 font-semibold text-white">
						Leaderboards
					</h2>
					<Image
						src="/images/leaderboards.png"
						alt="Leaderboards"
						className="w-full mb-4 rounded-lg"
						width={600}
						height={400}
					/>
					<p className="text-gray-400">
						Check out the latest rankings and see where you stand among the best
						players. Compete with others and climb your way to the top!
					</p>
				</div>

				{/* Profile Page */}
				<div className="bg-[#1c1e24] rounded-lg shadow-lg p-4 md:p-6 transform hover:scale-105 transition-transform duration-300 hover:bg-opacity-90 animate-fade-in delay-100">
					<h2 className="text-xl md:text-2xl mb-4 font-semibold text-white">
						Profile Page
					</h2>
					<Image
						src="/images/profile.png"
						alt="Profile Page"
						className="w-full mb-4 rounded-lg"
						width={600}
						height={400}
					/>
					<p className="text-gray-400">
						Your personal hub for stats, match history and more, track your
						progress, and showcase your gaming prowess.
					</p>
				</div>

				{/* Live Game */}
				<div className="bg-[#1c1e24] rounded-lg shadow-lg p-4 md:p-6 transform hover:scale-105 transition-transform duration-300 hover:bg-opacity-90 animate-fade-in delay-200">
					<h2 className="text-xl md:text-2xl mb-4 font-semibold text-white">
						Live Game
					</h2>
					<Image
						src="/images/live-game.png"
						alt="Live Game"
						className="w-full mb-4 rounded-lg"
						width={600}
						height={400}
					/>
					<p className="text-gray-400">
						Experience the thrill of real-time gaming action. Check live
						matches, challenge opponents, and immerse yourself in exciting
						gameplay.
					</p>
				</div>
			</div>
		</div>
	);
};

export default Home;
