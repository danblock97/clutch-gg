"use client";

import React from "react";
import Image from "next/image";
import { TypeAnimation } from "react-type-animation";
import Link from "next/link";

const HomePage = () => {
	return (
		<div className="flex items-center justify-center min-h-screen">
			<section>
				<div className="grid grid-cols-1 sm:grid-cols-12">
					<div className="col-span-8 place-self-center text-center sm:text-left justify-self-start">
						<h1 className="text-white mb-4 text-4xl sm:text-5xl lg:text-8xl lg:leading-normal font-extrabold">
							<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-pink-500">
								Welcome to Clutch.GG{" "}
							</span>
							<br />
							<TypeAnimation
								sequence={["League of Legends", 1000]}
								wrapper="span"
								speed={50}
								repeat={Infinity}
							/>
						</h1>
						<p className="text-[#adb7be] text-base sm:text-lg mb-6 lg:text-xl">
							Clutch.GG is your ultimate destination for in-depth analytics and
							real-time insights into players' performance.
						</p>
					</div>
					<div className="col-span-4 place-self-center mt-4 lg:mt-0">
						<div className="rounded-full bg-[#181818] w-[250px] h-[250px] lg:w-[300px] lg:h-[300px] relative">
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
