"use client";

import { useState } from "react";
import BugReportForm from "@/components/support/BugReportForm";
import FeatureRequestForm from "@/components/support/FeatureRequestForm";

export default function SupportPageContent() {
    const [activeTab, setActiveTab] = useState("bug");

    return (
        <div className="relative mx-auto max-w-4xl px-4 py-12 min-h-[calc(100vh-200px)] flex flex-col">
            {/* Header */}
            <header className="text-center mb-12">
                <div className="inline-flex items-center justify-center gap-3 mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl border border-red-500/20 bg-red-500/10 shadow-[0_0_15px_-3px_rgba(239,68,68,0.2)]">
                        <svg className="w-6 h-6 text-red-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-red-100 to-red-400">
                        <span>Support Center</span>
                    </h1>
                </div>
                <p className="text-lg text-[--text-secondary] max-w-2xl mx-auto leading-relaxed">
                    Need help? Report a bug or request a feature below.
                </p>
                <div className="mx-auto mt-8 h-px w-24 rounded-full bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
            </header>

            {/* Tabs */}
            <div className="flex justify-center mb-12">
                <div className="bg-black/20 p-1 rounded-xl border border-white/10 flex gap-1">
                    <button
                        onClick={() => setActiveTab("bug")}
                        className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === "bug"
                                ? "bg-red-500/10 text-red-200 shadow-[0_0_15px_-3px_rgba(239,68,68,0.3)] border border-red-500/20"
                                : "text-[--text-secondary] hover:text-white hover:bg-white/5"
                            }`}
                    >
                        Report a Bug
                    </button>
                    <button
                        onClick={() => setActiveTab("feature")}
                        className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === "feature"
                                ? "bg-blue-500/10 text-blue-200 shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)] border border-blue-500/20"
                                : "text-[--text-secondary] hover:text-white hover:bg-white/5"
                            }`}
                    >
                        Request Feature
                    </button>
                </div>
            </div>

            <div className="space-y-12">
                <section>
                    <div className="relative group">
                        <div
                            className={`absolute -inset-0.5 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000 bg-gradient-to-r ${activeTab === "bug"
                                    ? "from-red-500/20 to-pink-500/20"
                                    : "from-blue-500/20 to-cyan-500/20"
                                }`}
                        ></div>
                        <div className="relative bg-[--card-bg] border border-white/10 p-6 sm:p-8 rounded-2xl shadow-xl backdrop-blur-sm">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                {activeTab === "bug" ? (
                                    <>
                                        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        Submit a Bug Report
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        Submit a Feature Request
                                    </>
                                )}
                            </h2>

                            <div className="transition-all duration-300">
                                {activeTab === "bug" ? <BugReportForm /> : <FeatureRequestForm />}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Discord CTA */}
                <div className="neon-card p-6 text-center">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#5865F2] to-[#404EED] shadow-md">
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 127.14 96.36">
                                    <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
                                </svg>
                            </div>
                            <div className="text-left">
                                <p className="font-semibold">Need more help?</p>
                                <p className="text-sm text-[--text-secondary]">Join our Discord community for support</p>
                            </div>
                        </div>
                        <a
                            href="https://discord.gg/BeszQxTn9D"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-2.5 font-semibold text-white rounded-xl
                        bg-gradient-to-r from-[#5865F2] to-[#404EED]
                        hover:from-[#4752C4] hover:to-[#3C45C0]
                        shadow-md hover:shadow-lg transition-all duration-200"
                        >
                            Join Discord
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
