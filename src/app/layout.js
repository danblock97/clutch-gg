import { Inter } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import OutageBanner from "@/components/OutageBanner"; // Import the OutageBanner component

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
	title: "RiftSpy.GG",
	description:
		"RiftSpy.GG is your ultimate destination for in-depth analytics and real-time insights into League of Legends players' performance. With our comprehensive database and intuitive interface, RiftSpy.GG allows users to search for any player and access a plethora of valuable information, including ranked stats, champion mastery levels, match history, leaderboards, and live game data. Whether you're a seasoned competitor looking to analyze your own performance or a dedicated fan eager to track your favorite players, RiftSpy.GG provides the tools you need to stay ahead of the game.",
	icons: {
		icon: "/images/logo.png",
	},
};

export default function RootLayout({ children }) {
	const outageMessage = process.env.NEXT_PUBLIC_OUTAGE_MESSAGE; // Access the environment variable

	return (
		<html lang="en">
			<body className={inter.className}>
				<OutageBanner message={outageMessage} /> {/* Render the OutageBanner */}
				<NavBar />
				{children}
			</body>
		</html>
	);
}
