"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import SearchBar from "@/components/SearchBar";
import { TypeAnimation } from "react-type-animation";

const LeagueHomePage = () => {
    return (
        <div className="relative min-h-screen bg-[#13151b] text-white">
            <div className="relative w-full h-[50vh]">
                <Image
                    src="/images/leagueBanner.jpg" // Ensure this image exists in the public/images directory
                    alt="League of Legends Banner"
                    layout="fill"
                    objectFit="cover"
                    objectPosition="top"
                    className="opacity-70"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <div className="flex items-center mb-4">
                        <Image
                            src="/images/league.png"
                            alt="League of Legends Icon"
                            width={60}
                            height={60}
                            className="mr-2"
                        />
                        <h1 className="text-3xl font-extrabold text-white">
                            League of Legends
                        </h1>
                    </div>
                    <SearchBar className="w-full max-w-2xl mx-auto mb-4" />
                    <Link href="/league/leaderboard">
                        <button className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-pink-500 text-white rounded-full transition duration-300">
                            View Leaderboards
                        </button>
                    </Link>
                    <div className="mt-4">
                        <p className="text-sm text-gray-300">
                            League of Legends Player Stat Tracker
                        </p>
                    </div>
                </div>
            </div>
            <div className="flex flex-col items-start justify-center mt-12 ml-6 sm:ml-12 lg:ml-24">
                <h1 className="text-white mb-4 text-4xl sm:text-5xl lg:text-8xl lg:leading-normal font-extrabold">
							<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-pink-500">
								Clutch.GG - League of Legends
							</span>
                    <br/>
                    <TypeAnimation
                        sequence={[
                            "Profiles",
                            1000,
                            "Match History",
                            1000,
                            "Match Details",
                            1000,
                            "Live Games",
                            1000,
                            "LeaderBoards",
                            1000,
                        ]}
                        wrapper="span"
                        speed={50}
                        repeat={Infinity}
                    />
                </h1>
            </div>
        </div>
    );
};

export default LeagueHomePage;
