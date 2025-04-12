"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import OutageBanner from "@/components/OutageBanner";
import JiraCollectors from "@/components/JiraCollectors";
import { useState, Suspense } from "react";
import { metadata } from "./metadata";
import { GameTypeProvider } from "@/context/GameTypeContext";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
	// Only show banner if there's an actual message
	const outageMessage = process.env.NEXT_PUBLIC_OUTAGE_MESSAGE || "";
	const [isBannerVisible, setIsBannerVisible] = useState(
		outageMessage.trim() !== ""
	);

	const handleBannerClose = () => {
		setIsBannerVisible(false);
	};

	return (
		<html lang="en">
			<head>
				<title>{metadata.title}</title>
				<meta name="description" content={metadata.description} />
				<link rel="icon" href={metadata.icons.icon} />
			</head>
			<body className={inter.className}>
				<GameTypeProvider>
					<JiraCollectors />
					{isBannerVisible && (
						<OutageBanner message={outageMessage} onClose={handleBannerClose} />
					)}
					<Suspense fallback={<div>Loading...</div>}>
						<NavBar isBannerVisible={isBannerVisible} />
					</Suspense>
					<div>{children}</div>
					<SpeedInsights />
					<Analytics />
					<Footer />
				</GameTypeProvider>
			</body>
		</html>
	);
}
