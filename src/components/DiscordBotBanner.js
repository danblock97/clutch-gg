import React from "react";
import Link from "next/link";
import Image from "next/image";
import { FaDiscord, FaArrowRight } from "react-icons/fa";

export default function DiscordBotBanner() {
	return (
		<Link
			href="https://discord.com/oauth2/authorize?client_id=1088929834748616785&permissions=378944&integration_type=0&scope=bot+applications.commands"
			className="block group"
			target="_blank"
			rel="noopener noreferrer"
		>
			<div
				className="w-full max-w-md rounded-xl overflow-hidden transition-all duration-300 group-hover:shadow-xl
                    bg-gradient-to-r from-[#5865F2]/20 via-[#5865F2]/10 to-transparent
                    hover:from-[#5865F2]/30 border border-[#5865F2]/30 group-hover:border-[#5865F2]/50"
			>
				<div className="flex items-center p-3">
					{/* Logo */}
					<div className="relative w-14 h-14 mr-3 flex-shrink-0">
						<div className="absolute inset-0 bg-[#5865F2] opacity-20 rounded-full blur-md"></div>
						<Image
							src="/images/astrostats.png"
							alt="AstroStats Logo"
							width={56}
							height={56}
							className="relative z-10"
						/>
					</div>

					{/* Content */}
					<div className="flex-grow pr-2">
						<div className="flex items-center justify-between mb-1">
							<h2 className="text-base font-bold flex items-center">
								<FaDiscord className="text-[#5865F2] mr-2" />
								AstroStats Bot
							</h2>
							<div className="flex items-center text-[#5865F2] text-xs font-medium transition-transform transform group-hover:translate-x-1">
								<span>Add to Discord</span>
								<FaArrowRight className="ml-1" />
							</div>
						</div>
						<p className="text-sm text-[--text-secondary]">
							Track League stats directly in your Discord server
						</p>
					</div>
				</div>

				{/* Footer */}
				<div className="bg-[#5865F2]/10 px-3 py-1 text-xs text-[--text-secondary] flex justify-between">
					<span>600+ Servers</span>
					<span className="text-[#5865F2]">Free</span>
				</div>
			</div>
		</Link>
	);
}
