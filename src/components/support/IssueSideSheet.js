"use client";

import { useEffect, useRef } from "react";
import { LuX, LuCalendar, LuSignalHigh, LuSignalMedium, LuSignalLow, LuTriangleAlert, LuMinus } from "react-icons/lu";

function PriorityIcon({ priority }) {
    switch (priority) {
        case 1: // Urgent
            return <LuTriangleAlert className="text-red-500 w-5 h-5" />;
        case 2: // High
            return <LuSignalHigh className="text-orange-500 w-5 h-5" />;
        case 3: // Medium
            return <LuSignalMedium className="text-yellow-500 w-5 h-5" />;
        case 4: // Low
            return <LuSignalLow className="text-[--text-secondary] w-5 h-5" />;
        default: // None
            return <LuMinus className="text-[--text-secondary] w-5 h-5" />;
    }
}

function priorityLabel(priority) {
    switch (priority) {
        case 1: return "Urgent";
        case 2: return "High";
        case 3: return "Medium";
        case 4: return "Low";
        default: return "None";
    }
}

export default function IssueSideSheet({ issue, onClose }) {
    const sheetRef = useRef(null);

    // Close on escape key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    // Close on click outside
    const handleClickOutside = (e) => {
        if (sheetRef.current && !sheetRef.current.contains(e.target)) {
            onClose();
        }
    };

    if (!issue) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm transition-opacity" onClick={handleClickOutside}>
            <div
                ref={sheetRef}
                className="w-full max-w-2xl bg-[#0f0f11] shadow-2xl border-l border-white/10 flex flex-col h-full transform transition-transform duration-300 ease-in-out"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
                    <div className="flex items-center gap-3">
                        <span className="font-mono text-sm text-[--text-secondary] font-bold">
                            {issue.identifier}
                        </span>
                        <div className="h-4 w-px bg-white/10"></div>
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border ${issue.state?.type === "backlog" ? "border-white/10 bg-white/5 text-[--text-secondary]" :
                            issue.state?.type === "unstarted" ? "border-white/10 bg-white/5 text-[--text-secondary]" :
                                issue.state?.type === "started" ? "border-blue-500/30 bg-blue-500/10 text-blue-200" :
                                    issue.state?.type === "completed" ? "border-green-500/30 bg-green-500/10 text-green-200" :
                                        "border-white/10 bg-white/5 text-[--text-secondary]"
                            }`}>
                            {issue.state?.name}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-lg text-[--text-secondary] hover:text-white transition-colors"
                    >
                        <LuX className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-8">
                    <h2 className="text-2xl font-bold text-[--text-primary] mb-6 leading-tight">
                        {issue.title}
                    </h2>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-6 mb-8 p-4 rounded-xl bg-white/5 border border-white/5">
                        {/* Assignee */}
                        <div className="space-y-1">
                            <label className="text-xs text-[--text-secondary] uppercase tracking-wider font-semibold">
                                Assignee
                            </label>
                            <div className="flex items-center gap-2">
                                {issue.assignee ? (
                                    <>
                                        {issue.assignee.avatarUrl ? (
                                            <img src={issue.assignee.avatarUrl} alt="" className="w-5 h-5 rounded-full ring-1 ring-white/10" />
                                        ) : (
                                            <div className="w-5 h-5 rounded-full bg-[--primary]/20 flex items-center justify-center text-[10px] font-bold text-[--primary] ring-1 ring-white/10">
                                                {issue.assignee.name?.[0]}
                                            </div>
                                        )}
                                        <span className="text-sm text-[--text-primary]">{issue.assignee.name}</span>
                                    </>
                                ) : (
                                    <span className="text-sm text-[--text-secondary]">Unassigned</span>
                                )}
                            </div>
                        </div>

                        {/* Priority */}
                        <div className="space-y-1">
                            <label className="text-xs text-[--text-secondary] uppercase tracking-wider font-semibold">
                                Priority
                            </label>
                            <div className="flex items-center gap-2">
                                <PriorityIcon priority={issue.priority} />
                                <span className="text-sm text-[--text-primary]">{priorityLabel(issue.priority)}</span>
                            </div>
                        </div>

                        {/* Labels */}
                        {issue.labels?.nodes?.length > 0 && (
                            <div className="col-span-2 space-y-1 pt-2 border-t border-white/5">
                                <label className="text-xs text-[--text-secondary] uppercase tracking-wider font-semibold">
                                    Tags
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {issue.labels.nodes.filter(label => ["ClutchGG", "Bug", "Feature"].includes(label.name)).map(label => {
                                        let styleClass = "border-white/10 bg-white/5 text-[--text-secondary]";
                                        if (label.name.toLowerCase().includes("bug")) {
                                            styleClass = "bg-red-500/10 text-red-200 border-red-500/20";
                                        } else if (label.name.toLowerCase().includes("feature")) {
                                            styleClass = "bg-blue-500/10 text-blue-200 border-blue-500/20";
                                        } else if (label.name === "ClutchGG") {
                                            styleClass = "bg-[--primary]/10 text-[--primary] border-[--primary]/20";
                                        }
                                        return (
                                            <span
                                                key={label.id}
                                                className={`px-2 py-1 text-xs rounded-md border ${styleClass}`}
                                            >
                                                {label.name}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div className="prose prose-invert prose-sm max-w-none text-[--text-secondary]">
                        <div className="whitespace-pre-wrap font-sans">
                            {issue.description || "No description provided."}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 text-xs text-[--text-secondary] flex items-center justify-between bg-[#0f0f11]">
                    <div className="flex items-center gap-2">
                        <LuCalendar className="w-4 h-4" />
                        Created {new Date(issue.createdAt).toLocaleDateString()}
                    </div>
                    {issue.updatedAt && (
                        <span>
                            Updated {new Date(issue.updatedAt).toLocaleDateString()}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
