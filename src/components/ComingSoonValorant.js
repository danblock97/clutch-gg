import Image from "next/image";
import React from "react";

const ComingSoonValorant = () => {
    return (
        <div className="bg-[#0e1015] min-h-screen flex items-center justify-center">
            <div className="bg-[#13151b] p-8 rounded-lg shadow-md text-center transform transition duration-500 hover:scale-105">
                <h2 className="text-4xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500 animate-pulse">
                    Valorant Coming Soon!
                </h2>
                <p className="text-lg text-gray-400 mb-8">
                    We’re working hard to bring you amazing Valorant insights. Stay tuned
                    for something awesome!
                </p>
                <Image
                    src="/images/ComingsoonValorant.png"
                    alt="Valorant Coming Soon"
                    className="mx-auto mb-8 rounded-lg shadow-lg"
                    width={400}
                    height={400}
                />
                <p className="text-md text-gray-500">
                    Star & Watch The <a href="https://github.com/danblock97/lol-tracker"
                                        className="text-blue-400 hover:underline">GitHub Repository</a> for updates!
                </p>
            </div>
        </div>
    );
};

export default ComingSoonValorant;
