"use client";

import { useEffect, useMemo, useState } from "react";
import { LuSignalHigh, LuSignalMedium, LuSignalLow, LuTriangleAlert, LuMinus, LuSearch, LuFilter } from "react-icons/lu";
import IssueSideSheet from "./IssueSideSheet";

function priorityLabel(priority) {
    switch (priority) {
        case 1:
            return "Urgent";
        case 2:
            return "High";
        case 3:
            return "Medium";
        case 4:
            return "Low";
        default:
            return "None";
    }
}

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



export default function KanbanBoard({ type = "all" }) {
    // ... existing state ...

    // ... (render) ...

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [issues, setIssues] = useState([]);
    const [meta, setMeta] = useState({ team: null, label: null });
    const [groupedIssues, setGroupedIssues] = useState({});

    // New State for Search/Filter/Sheet
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState("all"); // 'all', 'bug', 'feature'
    const [selectedIssue, setSelectedIssue] = useState(null);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            setError("");
            try {
                let fetchedIssues = [];
                let fetchedTeam = null;

                if (type === "all") {
                    const [bugsRes, featuresRes] = await Promise.all([
                        fetch("/api/linear/issues?type=bug"),
                        fetch("/api/linear/issues?type=feature")
                    ]);

                    const bugsData = await bugsRes.json();
                    const featuresData = await featuresRes.json();

                    if (!bugsRes.ok) throw new Error(bugsData?.error || "Failed to load bugs");
                    if (!featuresRes.ok) throw new Error(featuresData?.error || "Failed to load features");

                    // Deduplicate if needed (though unlikely to overlap unless mislabeled)
                    const allIssues = [...(bugsData.issues || []), ...(featuresData.issues || [])];

                    // Remove duplicates by ID just in case
                    const uniqueIssues = Array.from(new Map(allIssues.map(item => [item.id, item])).values());

                    fetchedIssues = uniqueIssues;
                    fetchedTeam = bugsData.team; // Assume same team
                } else {
                    const res = await fetch(`/api/linear/issues?type=${type}`);
                    const data = await res.json();
                    if (!res.ok) throw new Error(data?.error || "Failed to load issues");
                    fetchedIssues = data.issues || [];
                    fetchedTeam = data.team;
                }

                if (cancelled) return;
                setIssues(fetchedIssues);
                setMeta({ team: fetchedTeam });

                // Group by state
                const states = fetchedTeam?.states || [];
                // Map state IDs to names and order
                // We want to preserve the order from Linear

                const groups = {};
                states.forEach(state => {
                    groups[state.id] = {
                        name: state.name,
                        type: state.type,
                        issues: []
                    };
                });

                // Also handle issues with unknown states (unlikely but safe)
                const unknownStateId = "unknown";

                fetchedIssues.forEach(issue => {
                    const sId = issue.state?.id;
                    if (groups[sId]) {
                        groups[sId].issues.push(issue);
                    } else {
                        if (!groups[unknownStateId]) {
                            groups[unknownStateId] = { name: "Unknown", type: "backlog", issues: [] };
                        }
                        groups[unknownStateId].issues.push(issue);
                    }
                });

                setGroupedIssues(groups);

            } catch (e) {
                if (cancelled) return;
                console.error(e);
                setError(e?.message || "Failed to load issues");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [type]);

    // Linear states are sorted by their valid configuration.
    // We should render them in order.
    const teamStates = useMemo(() => {
        if (!meta.team?.states) return [];

        const typeOrder = {
            "backlog": 1,
            "unstarted": 2,
            "started": 3,
            "completed": 4,
            "canceled": 5
        };

        return [...meta.team.states].sort((a, b) => {
            const orderA = typeOrder[a.type] || 99;
            const orderB = typeOrder[b.type] || 99;
            if (orderA !== orderB) return orderA - orderB;
            return (a.position || 0) - (b.position || 0);
        });
    }, [meta.team]);

    // Filter logic
    const displayedIssues = useMemo(() => {
        let filtered = Object.values(groupedIssues).reduce((acc, group) => {
            acc.push(...group.issues);
            return acc;
        }, []);

        // 1. Filter by Search
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(i =>
                (i.identifier && i.identifier.toLowerCase().includes(q)) ||
                (i.title && i.title.toLowerCase().includes(q))
            );
        }

        // 2. Filter by Type
        if (filterType !== 'all') {
            filtered = filtered.filter(i => {
                const labels = i.labels?.nodes || [];
                // Check if any label matches the filter type (case insensitive part match)
                return labels.some(l => l.name.toLowerCase().includes(filterType));
            });
        }

        return filtered;
    }, [groupedIssues, searchQuery, filterType]);

    // Re-group for display based on filtered results
    const displayedGroups = useMemo(() => {
        const groups = {};
        // Initialize groups structure from meta
        (meta.team?.states || []).forEach(state => {
            groups[state.id] = { ...state, issues: [] };
        });
        // Also ensure unknown exists if needed, though usually standard states cover it
        const unknownStateId = "unknown";
        if (!groups[unknownStateId]) groups[unknownStateId] = { name: "Unknown", id: "unknown", issues: [] };


        displayedIssues.forEach(issue => {
            const sId = issue.state?.id || "unknown";
            if (groups[sId]) {
                groups[sId].issues.push(issue);
            } else {
                // Fallback if state id not in standard list? 
                // Should have been initialized above if strictly following meta.team.states
                if (!groups[sId]) groups[sId] = { name: issue.state?.name || "Unknown", id: sId, issues: [] };
                groups[sId].issues.push(issue);
            }
        });
        return groups;
    }, [displayedIssues, meta.team]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="w-8 h-8 border-4 border-white/10 border-t-[--primary] rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
            </div>
        );
    }



    // Filter out states that have no issues if desired, or keep all to show workflow.
    // Usually Kanban boards show all columns.


    // Filter logic



    return (
        <div className="flex flex-col h-full gap-6">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
                <div className="relative max-w-sm w-full">
                    <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[--text-secondary] w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search issues..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-[--text-primary] placeholder:text-[--text-secondary]/50 focus:outline-none focus:ring-1 focus:ring-[--primary]/50 transition-all"
                    />
                </div>

                <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-1 rounded-lg self-start sm:self-auto">
                    {['all', 'bug', 'feature'].map((t) => (
                        <button
                            key={t}
                            onClick={() => setFilterType(t)}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize ${filterType === t
                                ? "bg-[--primary] text-white shadow-sm"
                                : "text-[--text-secondary] hover:text-[--text-primary] hover:bg-white/5"
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            <div className="overflow-x-auto pb-6">
                <div className="flex gap-4 min-w-max px-1">
                    {teamStates.map((state) => {
                        const group = displayedGroups[state.id];
                        const groupIssues = group?.issues || [];

                        return (
                            <div key={state.id} className="w-80 flex-shrink-0 flex flex-col gap-4">
                                {/* Column Header */}
                                <div className="flex items-center justify-between px-2">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-sm uppercase tracking-wider text-[--text-secondary]">
                                            {state.name}
                                        </span>
                                        <span className="bg-white/10 text-[--text-secondary] text-xs px-2 py-0.5 rounded-full">
                                            {groupIssues.length}
                                        </span>
                                    </div>
                                </div>

                                {/* Column Content */}
                                <div className="flex flex-col gap-3 min-h-[200px]">
                                    {groupIssues.map(issue => (
                                        <div
                                            key={issue.id}
                                            onClick={() => setSelectedIssue(issue)}
                                            className="bg-[--card-bg] border border-white/5 p-4 rounded-xl shadow-lg hover:border-white/10 transition group flex flex-col gap-3 cursor-pointer hover:bg-white/[0.02]"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-center gap-2">
                                                    <div title={priorityLabel(issue.priority)}>
                                                        <PriorityIcon priority={issue.priority} />
                                                    </div>
                                                    <span className="text-sm font-bold font-mono text-[--text-secondary] group-hover:text-[--primary] transition-colors">
                                                        {issue.identifier}
                                                    </span>
                                                </div>
                                                {/* Removed old badge */}
                                            </div>

                                            <div>
                                                <h4 className="font-semibold text-sm leading-snug mb-1 block text-balance text-[--text-primary]">
                                                    {issue.title}
                                                </h4>
                                                {issue.descriptionSnippet && (
                                                    <p className="text-xs text-[--text-secondary] line-clamp-2 leading-relaxed">
                                                        {issue.descriptionSnippet}...
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-auto">
                                                <div className="flex items-center gap-2">
                                                    {/* Assignee Avatar */}
                                                    {issue.assignee ? (
                                                        <div className="flex items-center gap-1.5" title={`Assigned to ${issue.assignee.name}`}>
                                                            {issue.assignee.avatarUrl ? (
                                                                <img
                                                                    src={issue.assignee.avatarUrl}
                                                                    alt={issue.assignee.name}
                                                                    className="w-5 h-5 rounded-full ring-1 ring-white/10"
                                                                />
                                                            ) : (
                                                                <div className="w-5 h-5 rounded-full bg-[--primary]/20 flex items-center justify-center text-[10px] font-bold text-[--primary] ring-1 ring-white/10">
                                                                    {issue.assignee.name?.[0]}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : null}

                                                    <div className="flex items-center gap-1">
                                                        {issue.labels?.nodes?.filter(l => ["ClutchGG", "Bug", "Feature"].includes(l.name)).map(l => {
                                                            let styleClass = "bg-white/5 text-[--text-secondary] border-white/5";
                                                            if (l.name.toLowerCase().includes("bug")) {
                                                                styleClass = "bg-red-500/10 text-red-200 border-red-500/20";
                                                            } else if (l.name.toLowerCase().includes("feature")) {
                                                                styleClass = "bg-blue-500/10 text-blue-200 border-blue-500/20";
                                                            } else if (l.name === "ClutchGG") {
                                                                styleClass = "bg-[--primary]/10 text-[--primary] border-[--primary]/20";
                                                            }

                                                            return (
                                                                <span key={l.id} className={`text-[10px] px-1.5 py-0.5 rounded border ${styleClass}`}>
                                                                    {l.name}
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                <div className="text-[10px] text-[--text-secondary] whitespace-nowrap ml-2">
                                                    {new Date(issue.updatedAt || issue.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {groupIssues.length === 0 && (
                                        <div className="h-24 border-2 border-dashed border-white/5 rounded-xl flex items-center justify-center text-xs text-[--text-secondary]/50">
                                            No issues
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <IssueSideSheet
                issue={selectedIssue}
                onClose={() => setSelectedIssue(null)}
            />
        </div>
    );
}
