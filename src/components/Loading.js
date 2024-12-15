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
        <div className="min-h-screen bg-[#0e1015] flex items-center justify-center relative">
            {/* Top Loading Bar */}
            <LoadingBar color="#f11946" ref={loadingBarRef} />

            {/* Centered Spinner */}
            <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gray-200"></div>
                <h2 className="text-white text-lg mt-4">Loading...</h2>
            </div>
        </div>
    );
};

export default Loading;
