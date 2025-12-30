import { Inter } from "next/font/google";
import "./globals.css";
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
			</body>
		</html>
	);
}

RootLayout.propTypes = {
	children: PropTypes.node.isRequired,
};
