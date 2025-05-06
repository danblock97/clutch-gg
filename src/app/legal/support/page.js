"use client";
import React, { useEffect, useRef } from "react";

const Support = () => {
  const formContainerRef = useRef(null);

  useEffect(() => {
    // Store the current value of the ref in a variable
    const formContainer = formContainerRef.current;

    if (formContainer) {
      // Create script element
      const script = document.createElement("script");
      script.id = "b12c2458-1d62-4699-8a44-8936de520fc6";
      script.src =
        "https://solodev-initiatives.youtrack.cloud/static/simplified/form/form-entry.js";
      script.setAttribute(
        "data-yt-url",
        "https://solodev-initiatives.youtrack.cloud",
      );
      script.setAttribute("data-theme", "dark");
      script.setAttribute("data-lang", "en");

      // Append script to the container
      formContainer.appendChild(script);
    }

    // Cleanup function to remove script when component unmounts
    return () => {
      // Use the stored variable instead of accessing the ref again
      const script = document.getElementById(
        "b12c2458-1d62-4699-8a44-8936de520fc6",
      );
      if (script) {
        script.remove();
      }
    };
  }, []);
  return (
    <div className="p-6 my-10">
      <h1 className="text-4xl font-bold mb-8 text-white text-center bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
        Support Center
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column - Information */}
        <div className="lg:w-1/2 space-y-8">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-lg shadow-lg border-l-4 border-purple-600 transform transition-all hover:scale-[1.01]">
            <h2 className="text-2xl font-semibold mb-4 text-white">
              How Can We Help?
            </h2>
            <p className="mb-4 text-gray-300">
              Welcome to the ClutchGG.LOL Support Center. We're here to help you
              with any questions or issues you might have with our service.
            </p>
            <p className="text-gray-300">
              Our team is dedicated to providing you with the best support
              possible. Feel free to browse through our FAQs or submit a support
              request using the form.
            </p>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-lg shadow-lg border-l-4 border-blue-500 transform transition-all hover:scale-[1.01]">
            <h2 className="text-2xl font-semibold mb-4 text-white">
              Frequently Asked Questions
            </h2>

            <div className="space-y-6">
              <div className="p-4 bg-gray-800 bg-opacity-50 rounded-lg">
                <h3 className="text-xl font-medium mb-2 text-white">
                  How do I search for a player?
                </h3>
                <p className="text-gray-300">
                  Enter the player's Riot ID (Name#Tag) in the search bar at the
                  top of the page and select the appropriate region.
                </p>
              </div>

              <div className="p-4 bg-gray-800 bg-opacity-50 rounded-lg">
                <h3 className="text-xl font-medium mb-2 text-white">
                  Why can't I see my most recent matches?
                </h3>
                <p className="text-gray-300">
                  Match data is provided by the Riot API, which may have a
                  slight delay in updating. Your most recent matches should
                  appear within 5-10 minutes after completion.
                </p>
              </div>

              <div className="p-4 bg-gray-800 bg-opacity-50 rounded-lg">
                <h3 className="text-xl font-medium mb-2 text-white">
                  How often is the leaderboard updated?
                </h3>
                <p className="text-gray-300">
                  Our leaderboards are updated every 24 hours to reflect the
                  most current rankings.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-lg shadow-lg border-l-4 border-yellow-500 transform transition-all hover:scale-[1.01]">
            <h2 className="text-2xl font-semibold mb-4 text-white">
              Development Roadmap
            </h2>
            <p className="mb-4 text-gray-300">
              Interested in what we're working on? Check out our public issue
              tracker to see our current development roadmap, planned features,
              and bug fixes.
            </p>
            <a
              href="https://solodev-initiatives.youtrack.cloud/agiles/183-19/current"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-md transition-colors duration-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              View Issue Tracker
            </a>
          </div>
        </div>

        {/* Right Column - Contact Form */}
        <div className="lg:w-1/2">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-lg shadow-lg border-r-4 border-green-500 h-full transform transition-all hover:scale-[1.01]">
            <h2 className="text-2xl font-semibold mb-4 text-white">
              Contact Support
            </h2>
            <p className="mb-6 text-gray-300">
              If you couldn't find the answer to your question in our FAQ,
              please use the form below to contact our support team. We'll get
              back to you as soon as possible.
            </p>

            <div className="bg-[#1e1e1e] p-6 rounded-lg shadow-inner">
              {/* YouTrack helpdesk form container */}
              <div
                ref={formContainerRef}
                className="youtrack-form-container"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
