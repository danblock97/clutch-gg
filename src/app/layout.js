"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import OutageBanner from "@/components/OutageBanner";
import { useState } from "react";
import { metadata } from "./metadata"; // Import metadata

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
	const [isBannerVisible, setIsBannerVisible] = useState(!!process.env.NEXT_PUBLIC_OUTAGE_MESSAGE);

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
		<OutageBanner message={isBannerVisible ? process.env.NEXT_PUBLIC_OUTAGE_MESSAGE : ''} onClose={handleBannerClose} />
		<NavBar isBannerVisible={isBannerVisible} />
		<div>{children}</div>
		<SpeedInsights />
		<Analytics />
		<Footer />
		</body>
		</html>
	);
}
