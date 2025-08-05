export const metadata = {
    title: {
        default: "ClutchGG - League of Legends & TFT Stats",
        template: "%s | ClutchGG"
    },
    description: "ClutchGG is your ultimate destination for League of Legends and Teamfight Tactics analytics. Track your performance, view detailed match history, analyze champion statistics, and climb the leaderboards.",
    keywords: ["League of Legends", "TFT", "Teamfight Tactics", "LoL stats", "gaming analytics", "match history", "leaderboard", "champion stats", "Riot Games", "esports"],
    authors: [{ name: "ClutchGG Team" }],
    creator: "ClutchGG",
    publisher: "ClutchGG",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    metadataBase: new URL("https://clutchgg.lol"),
    alternates: {
        canonical: "https://clutchgg.lol",
    },
    openGraph: {
        type: "website",
        locale: "en_US",
        url: "https://clutchgg.lol",
        title: "ClutchGG - League of Legends & TFT Stats",
        description: "ClutchGG is your ultimate destination for League of Legends and Teamfight Tactics analytics. Track your performance, view detailed match history, analyze champion statistics, and climb the leaderboards.",
        siteName: "ClutchGG",
        images: [
            {
                url: "/images/og-image.png",
                width: 1200,
                height: 630,
                alt: "ClutchGG - League of Legends & TFT Stats",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "ClutchGG - League of Legends & TFT Stats",
        description: "ClutchGG is your ultimate destination for League of Legends and Teamfight Tactics analytics. Track your performance, view detailed match history, analyze champion statistics, and climb the leaderboards.",
        images: ["/images/og-image.png"],
        creator: "@ClutchGG",
        site: "@ClutchGG",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    icons: {
        icon: [
            { url: "/images/logo-16x16.png", sizes: "16x16", type: "image/png" },
            { url: "/images/logo-32x32.png", sizes: "32x32", type: "image/png" },
            { url: "/images/logo-48x48.png", sizes: "48x48", type: "image/png" },
        ],
        shortcut: "/favicon.ico",
        apple: [
            { url: "/images/logo-180x180.png", sizes: "180x180", type: "image/png" },
        ],
        other: [
            { rel: "icon", url: "/images/logo-192x192.png", sizes: "192x192", type: "image/png" },
            { rel: "icon", url: "/images/logo-512x512.png", sizes: "512x512", type: "image/png" },
        ],
    },
    manifest: "/manifest.webmanifest",
    category: "gaming",
};
