import React from "react";
import Link from "next/link";
import Image from "next/image";
import BotImage from "../../public/images/astrostats.png";

export default function DiscordBotBanner() {
	return (
		<Link
			href="https://discord.com/oauth2/authorize?client_id=1088929834748616785&permissions=2147747840&scope=bot"
			className="block"
		>
			<div className="relative w-full sm:w-[200px] h-auto sm:h-[600px] border border-[#2f2f46] bg-gradient-to-br from-[#232337] to-[#1b1b2d] rounded-lg overflow-hidden shadow-lg flex flex-col items-center justify-between p-4 text-white text-center">
				{/* AstroStats Bot Image */}
				<div className="absolute top-8 w-full flex justify-center">
					<div className="relative">
						<Image
							src={BotImage}
							alt="AstroStats Logo"
							width={120}
							height={120}
							className="drop-shadow-lg animate-pulse"
						/>
					</div>
				</div>

				{/* Headline */}
				<div className="px-4 mt-20 sm:mt-40">
					<h2 className="text-2xl font-extrabold tracking-wide">
						Outsmart Your Opponents!
					</h2>
					<p className="text-sm mt-3 opacity-90">
						Track your League stats seamlessly in Discord with AstroStats.
					</p>
				</div>

				{/* CTA Button */}
				<div className="mb-6">
					<div className="bg-white text-[#3B4CCA] py-2 px-5 rounded-full font-bold text-sm hover:scale-105 transition-transform duration-200">
						Invite Now
					</div>
				</div>
			</div>
		</Link>
	);
}
