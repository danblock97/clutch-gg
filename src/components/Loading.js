"use client";

import React, { useRef, useEffect } from "react";
import LoadingBar from "react-top-loading-bar";

const Loading = () => {
    const loadingBarRef = useRef(null);

    useEffect(() => {
        if (loadingBarRef.current) {
            loadingBarRef.current.continuousStart();
        }

        return () => {
            if (loadingBarRef.current) {
                loadingBarRef.current.complete();
            }
        };
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="relative w-48 h-48">
                <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-rotate"></div>
                <div className="absolute inset-2 rounded-full bg-[#0e1015]"></div>
            </div>
            <p className="mt-4 text-white text-xl animate-pulse">
                Loading, please wait...
            </p>
            <style>{`
        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-rotate {
          animation: rotate 2s linear infinite;
        }
      `}</style>
        </div>
    );
};

export default Loading;