"use client";

import React from "react";
import Image from "next/image";
import { TypeAnimation } from "react-type-animation";
import SearchBar from "./SearchBar";

const HomePage = () => {
	return (
		<div className="flex items-center justify-center min-h-screen">
			<section>
				<div className="grid grid-cols-1 sm:grid-cols-12">
					<div className="col-span-8 place-self-center text-center justify-self-center">
						<h1 className="text-white mb-4 text-4xl sm:text-3xl lg:text-5xl lg:leading-normal font-extrabold">
							<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-pink-500">
								ClutchGG.LOL{" "}
							</span>
						</h1>
						<div className="w-full max-w-2xl mx-auto mb-4">
							<SearchBar />
						</div>
						<div className="text-white text-4xl sm:text-3xl lg:text-5xl lg:leading-normal font-extrabold mb-4">
							<TypeAnimation
								sequence={[
									"Match History",
									1000,
									"Match Details",
									1000,
									"Live Games",
									1000,
									"Ranked Stats",
									1000,
									"Leaderboards",
									1000,
								]}
								wrapper="span"
								speed={50}
								repeat={Infinity}
							/>
						</div>
						<p className="text-[#adb7be] text-base sm:text-md mb-6 lg:text-lg">
							Clutch.GG is your ultimate destination for in-depth analytics and
							real-time insights into players' performance.
						</p>
					</div>
					<div className="col-span-4 place-self-center mt-4 lg:mt-0">
						<div className="rounded-full w-[250px] h-[250px] lg:w-[300px] lg:h-[300px] relative">
							<Image
								src="/images/logo.png"
								alt="hero image"
								className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 bg-transparent"
								width={300}
								height={300}
							/>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
};

export default HomePage;
