import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function DiscordBotBanner() {
	return (
		<Link
			href="https://discord.com/oauth2/authorize?client_id=1088929834748616785&permissions=2147747840&scope=bot"
			className="block"
		>
			<div className="w-full max-w-md h-20 mt-12 rounded-lg overflow-hidden flex flex-row items-center">
				{/* Logo on the left */}
				<div className="flex-shrink-0 w-20 h-full flex items-center justify-center">
					<Image
						src="/images/astrostats.png"
						alt="AstroStats Logo"
						width={80}
						height={80}
					/>
				</div>
				{/* Text Section */}
				<div className="flex flex-col justify-center flex-grow pl-4">
					<h2 className="text-lg font-bold text-gray-600">
						Outsmart Your Opponents!
					</h2>
					<p className="text-sm text-gray-400">
						Track League stats directly in Discord.
					</p>
				</div>
				{/* Invite Button */}
				<div className="flex-shrink-0 pr-2">
					<div className="bg-gray-200 text-gray-800 py-2 px-3 rounded-lg font-semibold text-sm">
						Invite Now
					</div>
				</div>
			</div>
		</Link>
	);
}
