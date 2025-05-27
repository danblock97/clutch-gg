"use client";

import React from "react";
import PropTypes from "prop-types";

const Loading = ({ message = "Loading data, please wait..." }) => {
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
};

export default Loading;

Loading.propTypes = {
  message: PropTypes.string,
};
