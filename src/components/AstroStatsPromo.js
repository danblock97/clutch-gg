"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const AstroStatsPromo = () => {
	const [tab, setTab] = useState("profile");

	return (
		<div className="max-w-6xl mx-auto px-4 sm:px-6">
			<div className="rounded-2xl border border-[--card-border] bg-[--card-bg] overflow-hidden">
				<div className="p-5 sm:p-7">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
						{/* Left: Copy + CTAs */}
						<div>
							<div className="flex items-center gap-3 mb-3">
								<div className="relative w-9 h-9 rounded-md overflow-hidden ring-2 ring-[#5865F2]/20">
									<Image src="/images/astrostats.png" alt="AstroStats" fill className="object-cover" />
								</div>
								<div>
									<h3 className="text-xl font-semibold">AstroStats Discord Bot</h3>
									<p className="text-sm text-[--text-secondary]">League profiles, live games, and champion mastery—right in Discord.</p>
								</div>
							</div>

							<ul className="text-sm text-[--text-secondary] space-y-2 mb-5 list-disc list-inside">
								<li>Instant profile and live game lookups</li>
								<li>Champion mastery levels and insights</li>
								<li>Fast, privacy-first, and free</li>
							</ul>

							<div className="flex flex-wrap gap-3">
								<Link href="https://discord.gg/BeszQxTn9D" target="_blank" className="px-4 py-2 rounded-md bg-[#5865F2]/25 text-[#C8D0FF] hover:bg-[#5865F2]/35 transition-colors text-sm">Invite to Discord</Link>
								<Link href="https://astrostats.info" target="_blank" className="px-4 py-2 rounded-md border border-white/10 hover:bg-white/5 transition-colors text-sm">Learn more</Link>
							</div>
						</div>

						{/* Right: Compact screenshot with tabs */}
						<div>
							<div className="flex items-center gap-2 mb-3">
								<button
									className={`px-2.5 py-1 text-xs rounded-md border ${tab === "profile" ? "border-[--primary] text-[--primary] bg-[--primary]/10" : "border-white/10 text-[--text-secondary] hover:bg-white/5"}`}
									onClick={() => setTab("profile")}
								>
									Profile
								</button>
								<button
									className={`px-2.5 py-1 text-xs rounded-md border ${tab === "mastery" ? "border-[--primary] text-[--primary] bg-[--primary]/10" : "border-white/10 text-[--text-secondary] hover:bg-white/5"}`}
									onClick={() => setTab("mastery")}
								>
									Champion Mastery
								</button>
							</div>

							<div className="rounded-lg border border-white/10 bg-black/20 p-2 max-w-md mx-auto shadow-md">
								<div className="flex items-center gap-1 pb-2 px-2">
									<span className="w-2.5 h-2.5 rounded-full bg-red-400/70"></span>
									<span className="w-2.5 h-2.5 rounded-full bg-yellow-300/70"></span>
									<span className="w-2.5 h-2.5 rounded-full bg-green-400/70"></span>
									<span className="ml-2 text-[10px] text-[--text-secondary]">Discord • AstroStats</span>
								</div>
								<div className="relative rounded-md overflow-hidden border border-white/10">
									<Image
										src={tab === "profile" ? "/images/league-profile.png" : "/images/league-championMastery.png"}
										alt={tab === "profile" ? "AstroStats League Profile command" : "AstroStats Champion Mastery command"}
										width={1280}
										height={720}
										className="w-full h-auto object-contain"
										priority
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AstroStatsPromo;


