// components/Footer.js

import Link from "next/link";
import React from "react";

const Footer = () => {
	return (
		<footer className="bg-[#13151b] text-gray-300 py-8">
			<div className="container mx-auto px-4">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					<div>
						<h3 className="text-lg font-semibold mb-4">Compliance</h3>
						<p className="text-sm">
							Clutch is not endorsed by Riot Games and does not reflect the
							views or opinions of Riot Games or anyone officially involved in
							producing or managing Riot Games properties. Riot Games and all
							associated properties are trademarks or registered trademarks of
							Riot Games. Inc.
						</p>
					</div>
					<div>
						<h3 className="text-lg font-semibold mb-4">Other Stat Trackers</h3>
						<ul>
							<li>
								<Link
									href="https://apexpulse.vercel.app"
									className="text-sm hover:underline"
								>
									Apex Pulse
								</Link>
							</li>
							<li>
								<Link
									href="https://fortifinder.vercel.app"
									className="text-sm hover:underline"
								>
									Forti Finder
								</Link>
							</li>
							<li>
								<Link
									href="https://astrostats.vercel.app"
									className="text-sm hover:underline"
								>
									AstroStats - Discord Bot
								</Link>
							</li>
						</ul>
					</div>
					<div>
						<h3 className="text-lg font-semibold mb-4">Support</h3>
						<ul>
							<li>
								<Link
									href="https://discord.gg/neeSSbRzrJ"
									className="text-sm hover:underline"
								>
									Discord
								</Link>
							</li>
							<li>
								<Link
									href="mailto:danblock1997@hotmail.co.uk"
									className="text-sm hover:underline"
								>
									Email
								</Link>
							</li>
							<li>
								<Link
									href="/legal/privacy-policy"
									className="text-sm hover:underline"
								>
									Privacy Policy
								</Link>
							</li>
							<li>
								<Link
									href="/legal/terms-of-service"
									className="text-sm hover:underline"
								>
									Terms of Service
								</Link>
							</li>
						</ul>
					</div>
				</div>
				<div className="text-center text-sm mt-8">
					<p>Clutch.GG © 2024. All rights reserved.</p>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
