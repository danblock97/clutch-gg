"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaDiscord, FaRocket, FaChartBar, FaShieldAlt, FaExternalLinkAlt } from "react-icons/fa";

const AstroStatsPromo = () => {
	const [tab, setTab] = useState("profile");
	const [isHovered, setIsHovered] = useState(false);

	const features = [
		{ icon: <FaChartBar />, text: "Instant profile lookups" },
		{ icon: <FaRocket />, text: "Live game tracking" },
		{ icon: <FaShieldAlt />, text: "Privacy-first & free" },
	];

	return (
		<div className="max-w-6xl mx-auto px-4 sm:px-6">
			<div 
				className="relative rounded-2xl overflow-hidden"
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
			>
				{/* Layered background */}
				<div className="absolute inset-0">
					{/* Base gradient */}
					<div className="absolute inset-0 bg-gradient-to-br from-[#1e1f2e] via-[#1a1b28] to-[#13141c]" />
					
					{/* Grid pattern overlay */}
					<div 
						className="absolute inset-0 opacity-[0.03]"
						style={{
							backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
								linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
							backgroundSize: '32px 32px',
						}}
					/>
					
					{/* Discord-colored glow orbs */}
					<div 
						className={`absolute -top-20 -right-20 w-80 h-80 rounded-full transition-all duration-700 ${isHovered ? 'opacity-40 scale-110' : 'opacity-25'}`}
						style={{
							background: 'radial-gradient(circle, #5865F2 0%, transparent 70%)',
							filter: 'blur(60px)',
						}}
					/>
					<div 
						className={`absolute -bottom-32 -left-20 w-96 h-96 rounded-full transition-all duration-700 ${isHovered ? 'opacity-30 scale-105' : 'opacity-15'}`}
						style={{
							background: 'radial-gradient(circle, #7289DA 0%, transparent 70%)',
							filter: 'blur(80px)',
						}}
					/>
					
					{/* Subtle noise texture */}
					<div 
						className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
						style={{
							backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
						}}
					/>
				</div>

				{/* Border glow effect */}
				<div className="absolute inset-0 rounded-2xl border border-[#5865F2]/20" />
				<div 
					className={`absolute inset-0 rounded-2xl transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
					style={{
						background: 'linear-gradient(135deg, rgba(88,101,242,0.1) 0%, transparent 50%, rgba(114,137,218,0.1) 100%)',
					}}
				/>

				{/* Content */}
				<div className="relative p-6 sm:p-8 lg:p-10">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
						{/* Left: Copy + CTAs */}
						<div className="space-y-6">
							{/* Header with Discord branding */}
							<div className="flex items-start gap-4">
								<div className="relative">
									<div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#5865F2] to-[#4752C4] flex items-center justify-center shadow-lg shadow-[#5865F2]/25">
										<Image 
											src="/images/astrostats.png" 
											alt="AstroStats" 
											width={40} 
											height={40} 
											className="rounded-lg"
										/>
									</div>
									{/* Online indicator */}
									<div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#3ba55c] rounded-full border-2 border-[#1a1b28]" />
								</div>
								<div>
									<div className="flex items-center gap-2 mb-1">
										<h3 className="text-2xl font-bold text-white">AstroStats</h3>
										<span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-[#5865F2]/20 text-[#8b9aff] rounded-full border border-[#5865F2]/30">
											Bot
										</span>
									</div>
									<p className="text-[#8b9aff] text-sm font-medium">
										League stats delivered to Discord
									</p>
								</div>
							</div>

							{/* Feature pills */}
							<div className="flex flex-wrap gap-2">
								{features.map((feature, i) => (
									<div 
										key={i}
										className="group flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-[#5865F2]/40 hover:bg-[#5865F2]/10 transition-all duration-300"
									>
										<span className="text-[#5865F2] text-sm group-hover:scale-110 transition-transform">
											{feature.icon}
										</span>
										<span className="text-sm text-gray-300 group-hover:text-white transition-colors">
											{feature.text}
										</span>
									</div>
								))}
							</div>

							{/* Description */}
							<p className="text-gray-400 leading-relaxed">
								Get instant access to League profiles, live game tracking, and champion mastery stats—all without leaving Discord. Trusted by thousands of players.
							</p>

							{/* CTAs */}
							<div className="flex flex-wrap gap-3 pt-2">
								<Link 
									href="https://discord.com/oauth2/authorize?client_id=1088929834054369280" 
									target="_blank" 
									className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold text-sm transition-all duration-300 shadow-lg shadow-[#5865F2]/25 hover:shadow-[#5865F2]/40 hover:scale-[1.02]"
								>
									<FaDiscord className="text-lg" />
									<span>Add to Server</span>
									<div className="absolute inset-0 rounded-lg bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />
								</Link>
								<Link 
									href="https://astrostats.info" 
									target="_blank" 
									className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/20 hover:border-white/40 text-gray-300 hover:text-white font-medium text-sm transition-all duration-300 hover:bg-white/5"
								>
									<span>Learn more</span>
									<FaExternalLinkAlt className="text-xs opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
								</Link>
							</div>
						</div>

						{/* Right: Interactive preview */}
						<div className="relative">
							{/* Tab buttons */}
							<div className="flex items-center gap-2 mb-4">
								{[
									{ id: "profile", label: "Profile" },
									{ id: "mastery", label: "Champion Mastery" },
								].map((t) => (
									<button
										key={t.id}
										className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
											tab === t.id 
												? "text-white" 
												: "text-gray-400 hover:text-gray-200 hover:bg-white/5"
										}`}
										onClick={() => setTab(t.id)}
									>
										{tab === t.id && (
											<div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#5865F2]/30 to-[#7289DA]/30 border border-[#5865F2]/40" />
										)}
										<span className="relative">{t.label}</span>
									</button>
								))}
							</div>

							{/* Discord-style preview window */}
							<div className="relative rounded-xl overflow-hidden border border-white/10 bg-[#2f3136] shadow-2xl">
								{/* Window header */}
								<div className="flex items-center gap-3 px-4 py-3 bg-[#202225] border-b border-black/20">
									<div className="flex items-center gap-1.5">
										<span className="w-3 h-3 rounded-full bg-[#ed6a5e]" />
										<span className="w-3 h-3 rounded-full bg-[#f4bf4f]" />
										<span className="w-3 h-3 rounded-full bg-[#61c554]" />
									</div>
									<div className="flex items-center gap-2 ml-2">
										<FaDiscord className="text-[#5865F2] text-sm" />
										<span className="text-xs text-gray-400 font-medium">Discord</span>
										<span className="text-xs text-gray-600">•</span>
										<span className="text-xs text-gray-500">#league-stats</span>
									</div>
								</div>
								
								{/* Screenshot container */}
								<div className="relative bg-[#36393f] p-3">
									{/* Message bubble effect */}
									<div className="absolute top-3 left-3 flex items-start gap-2">
										<div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5865F2] to-[#4752C4] flex items-center justify-center flex-shrink-0 opacity-80">
											<span className="text-white text-xs font-bold">A</span>
										</div>
									</div>
									
									<div 
										className={`transition-all duration-500 ${
											tab === "profile" ? "opacity-100 translate-y-0" : "opacity-0 absolute translate-y-2"
										}`}
									>
										{tab === "profile" && (
											<Image
												src="/images/league-profile.png"
												alt="AstroStats League Profile command"
												width={1280}
												height={720}
												sizes="(max-width: 768px) 100vw, 50vw"
												className="w-full h-auto rounded-lg shadow-lg"
												loading="lazy"
											/>
										)}
									</div>
									<div 
										className={`transition-all duration-500 ${
											tab === "mastery" ? "opacity-100 translate-y-0" : "opacity-0 absolute translate-y-2"
										}`}
									>
										{tab === "mastery" && (
											<Image
												src="/images/league-championMastery.png"
												alt="AstroStats Champion Mastery command"
												width={1280}
												height={720}
												sizes="(max-width: 768px) 100vw, 50vw"
												className="w-full h-auto rounded-lg shadow-lg"
												loading="lazy"
											/>
										)}
									</div>
								</div>
								
								{/* Reflection effect at bottom */}
								<div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-[#2f3136] to-transparent pointer-events-none" />
							</div>

							{/* Floating decorative elements */}
							<div className="absolute -top-3 -right-3 w-20 h-20 rounded-full bg-[#5865F2]/10 blur-2xl" />
							<div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-[#7289DA]/10 blur-3xl" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AstroStatsPromo;
