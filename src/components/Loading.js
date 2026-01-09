"use client";

import React from "react";
import PropTypes from "prop-types";
import Image from "next/image";
import Link from "next/link";

const Loading = ({
  message = "Loading data, please wait...",
  variant = "default",
}) => {
  const isProfileFirstTime = variant === "profile-first-time";
  const isProfileLoading = variant === "profile" || isProfileFirstTime;

  if (!isProfileLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        {/* App Name */}
        <h2 className="text-2xl font-bold text-[--text-primary] mb-4">
          ClutchGG
        </h2>

        {/* Indeterminate Progress Bar */}
        <div className="w-full max-w-xs bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-[--primary] to-[--secondary] h-2.5 rounded-full animate-progress-indeterminate"></div>
        </div>

        {/* Loading message */}
        <p className="text-[--text-secondary] text-lg font-medium">{message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-6">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-yellow-400/20 blur-2xl rounded-full"></div>
        <Image
          src="/images/bee-happy.png"
          alt="Happy bee"
          width={180}
          height={180}
          className="relative z-10"
          priority
        />
      </div>

      <h2 className="text-2xl font-bold text-[--text-primary] mb-3">
        ClutchGG
      </h2>

      <div className="w-full max-w-xs bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-[--primary] to-[--secondary] h-2.5 rounded-full animate-progress-indeterminate"></div>
      </div>

      <p className="text-[--text-secondary] text-lg font-medium">
        {isProfileFirstTime
          ? "We're searching your profile for the first time. This could take a minute."
          : "Loading your profile..."}
      </p>

      {isProfileFirstTime && (
        <p className="text-sm text-[--text-secondary] mt-4 max-w-md">
          Want League or TFT stats in Discord? Try the{" "}
          <Link
            href="https://astrostats.info"
            target="_blank"
            rel="noreferrer"
            className="text-[--primary] hover:text-[--secondary] underline underline-offset-2"
          >
            AstroStats bot
          </Link>
          .
        </p>
      )}
    </div>
  );
};

export default Loading;

Loading.propTypes = {
  message: PropTypes.string,
  variant: PropTypes.oneOf(["default", "profile", "profile-first-time"]),
};
