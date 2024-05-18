import Image from "next/image";
import React from "react";

const Home = () => {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-[#0e1015] text-white p-4">
			<h1 className="text-3xl md:text-4xl mb-8 text-center">RiftSpy.GG</h1>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 w-full max-w-6xl">
				{/* Leaderboards */}
				<div className="bg-[#13151b] rounded-lg p-4 md:p-6">
					<h2 className="text-lg md:text-xl mb-4">Leaderboards</h2>
					<Image
						src="/images/leaderboards.png"
						alt="Leaderboards"
						className="w-full mb-4"
						width={600}
						height={400}
						layout="responsive"
					/>
					<p>
						Check out the latest rankings and see where you stand among the best
						players. Compete with others and climb your way to the top!
					</p>
				</div>

				{/* Profile Page */}
				<div className="bg-[#13151b] rounded-lg p-4 md:p-6">
					<h2 className="text-lg md:text-xl mb-4">Profile Page</h2>
					<Image
						src="/images/profile.png"
						alt="Profile Page"
						className="w-full mb-4"
						width={600}
						height={400}
						layout="responsive"
					/>
					<p>
						Your personal hub for stats, achievements, and more. Customize your
						profile, track your progress, and showcase your gaming prowess.
					</p>
				</div>

				{/* Live Game */}
				<div className="bg-[#13151b] rounded-lg p-4 md:p-6">
					<h2 className="text-lg md:text-xl mb-4">Live Game</h2>
					<Image
						src="/images/live-game.png"
						alt="Live Game"
						className="w-full mb-4"
						width={600}
						height={400}
						layout="responsive"
					/>
					<p>
						Experience the thrill of real-time gaming action. Join live matches,
						challenge opponents, and immerse yourself in exciting gameplay.
					</p>
				</div>
			</div>
		</div>
	);
};

export default Home;
