import Image from "next/image";
import React from "react";

const ComingSoonTFT = () => {
    return (
        <div className="bg-[#0e1015] min-h-screen flex items-center justify-center">
            <div className="bg-[#13151b] p-8 rounded-lg shadow-md text-center transform transition duration-500 hover:scale-105">
                <h2 className="text-4xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 animate-pulse">
                    TFT Coming Soon!
                </h2>
                <p className="text-lg text-gray-400 mb-8">
                    We’re working hard to bring you amazing TFT insights. Stay tuned for
                    something awesome!
                </p>
                <Image
                    src="/images/ComingsoonTFT.webp"
                    alt="TFT Coming Soon"
                    className="mx-auto mb-8 rounded-lg shadow-lg"
                    width={400}
                    height={400}
                />
                <p className="text-md text-gray-500">
                    Star & Watch The <a href="https://github.com/danblock97/clutch-gg" className="text-blue-400 hover:underline">GitHub Repository</a> for updates!
                </p>
            </div>
        </div>
    );
};

export default ComingSoonTFT;
