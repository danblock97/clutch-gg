"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";

const Loading = ({ message = "Loading data, please wait..." }) => {
    const spinnerRef = useRef(null);

    useEffect(() => {
        if (spinnerRef.current) {
            // Start animation
            spinnerRef.current.classList.add('animate-spin-slow');

            // Apply random starting rotation
            const randomDeg = Math.floor(Math.random() * 360);
            spinnerRef.current.style.transform = `rotate(${randomDeg}deg)`;
        }
    }, []);

    return (
        <div className="flex flex-col items-center justify-center py-16">
            {/* Logo spinner with glow effect */}
            <div className="relative mb-8">
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[--primary] to-[--secondary] opacity-30 blur-xl"></div>

                {/* Main spinner with logo */}
                <div
                    ref={spinnerRef}
                    className="relative w-28 h-28 rounded-full bg-[--card-bg] p-2 shadow-xl border border-[--card-border] overflow-hidden z-10"
                >
                    <Image
                        src="/images/logo.png"
                        alt="ClutchGG Logo"
                        fill
                        className="object-contain p-4"
                    />
                </div>

                {/* Circular track */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-4 border-[--card-border] opacity-30"></div>

                {/* Animated spinning dot */}
                <div className="absolute top-1/2 left-1/2 w-4 h-4 rounded-full bg-gradient-to-r from-[--primary] to-[--secondary] transform -translate-x-1/2 -translate-y-1/2 animate-orbit"></div>
            </div>

            {/* Loading message */}
            <p className="text-[--text-secondary] text-lg font-medium animate-pulse">
                {message}
            </p>

            {/* Loading animation dots */}
            <div className="flex space-x-2 mt-2">
                <div className="w-2 h-2 rounded-full bg-[--primary] animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-2 h-2 rounded-full bg-[--primary] animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 rounded-full bg-[--primary] animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>

            {/* CSS for custom animations */}
            <style jsx global>{`
                @keyframes orbit {
                    from {
                        transform: translate(-50%, -50%) rotate(0deg) translateX(16px) rotate(0deg);
                    }
                    to {
                        transform: translate(-50%, -50%) rotate(360deg) translateX(16px) rotate(-360deg);
                    }
                }
                
                .animate-orbit {
                    animation: orbit 2s linear infinite;
                }
                
                .animate-spin-slow {
                    animation: spin 12s linear infinite;
                }
                
                @keyframes spin {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }
            `}</style>
        </div>
    );
};

export default Loading;