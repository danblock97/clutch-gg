import { Inter } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
	title: "Clutch.GG",
	description:
		"Clutch.GG is your ultimate destination for in-depth analytics and real-time insights into League of Legends players' performance. With our comprehensive database and intuitive interface, Clutch.GG allows users to search for any player and access a plethora of valuable information, including ranked stats, champion mastery levels, match history, leaderboards, and live game data. Whether you're a seasoned competitor looking to analyze your own performance or a dedicated fan eager to track your favorite players, RiftSpy.GG provides the tools you need to stay ahead of the game.",
	icons: {
		icon: "/images/logo.png",
	},
};

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<NavBar />
				{children}
				<SpeedInsights />
				<Footer />
			</body>
		</html>
	);
}
