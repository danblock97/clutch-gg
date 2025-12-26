import { Inter } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import OutageBanner from "@/components/OutageBanner";
import FeatureAnnouncementBanner from "@/components/FeatureAnnouncementBanner";
import { GameTypeProvider } from "@/context/GameTypeContext";
import { AuthProvider } from "@/context/AuthContext";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import StructuredData from "@/components/StructuredData";
import PropTypes from "prop-types";
import RootLayoutContent from "./RootLayoutContent";
import { metadata as baseMetadata } from "./metadata";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
	...baseMetadata,
	metadataBase: new URL("https://clutchgg.lol"),
};

export default function RootLayout({ children }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={inter.className}>
				<StructuredData type="WebSite" />
				<RootLayoutContent>{children}</RootLayoutContent>
				<Analytics />
				<SpeedInsights />
			</body>
		</html>
	);
}

RootLayout.propTypes = {
	children: PropTypes.node.isRequired,
};
