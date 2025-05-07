"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import OutageBanner from "@/components/OutageBanner";
import FeatureAnnouncementBanner from "@/components/FeatureAnnouncementBanner";
import { useState, Suspense } from "react";
import { metadata } from "./metadata";
import { GameTypeProvider } from "@/context/GameTypeContext";
import { AuthProvider } from "@/context/AuthContext";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
	// Only show banners if there's an actual message
	const outageMessage = process.env.NEXT_PUBLIC_OUTAGE_MESSAGE || "";
	const featureMessage = process.env.NEXT_PUBLIC_FEATURE_ANNOUNCEMENT || "";

	const [isOutageBannerVisible, setIsOutageBannerVisible] = useState(
		outageMessage.trim() !== ""
	);
	const [isFeatureBannerVisible, setIsFeatureBannerVisible] = useState(
		featureMessage.trim() !== ""
	);

	const handleOutageBannerClose = () => {
		setIsOutageBannerVisible(false);
	};

	const handleFeatureBannerClose = () => {
		setIsFeatureBannerVisible(false);
	};

	// Calculate banners visible for navbar positioning
	const bannersVisible =
		(isOutageBannerVisible ? 1 : 0) + (isFeatureBannerVisible ? 1 : 0);

	return (
		<html lang="en">
			<head>
				<Script
					src="https://code.jquery.com/jquery-3.7.1.min.js"
					integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo="
					crossOrigin="anonymous"
					strategy="beforeInteractive"
				/>
				<title>{metadata.title}</title>
				<meta name="description" content={metadata.description} />
				<link rel="icon" href={metadata.icons.icon} />
			</head>
			<body className={inter.className}>
				<GameTypeProvider>
					<AuthProvider>
						{isOutageBannerVisible && (
							<OutageBanner
								message={outageMessage}
								onClose={handleOutageBannerClose}
							/>
						)}
						{isFeatureBannerVisible && (
							<FeatureAnnouncementBanner
								message={featureMessage}
								onClose={handleFeatureBannerClose}
							/>
						)}
						<Suspense fallback={<div>Loading...</div>}>
							<NavBar bannersVisible={bannersVisible} />
						</Suspense>
						<div>{children}</div>
						<Footer />
					</AuthProvider>
				</GameTypeProvider>
			</body>
		</html>
	);
}
