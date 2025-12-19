"use client";

import { useEffect, useMemo, useState } from "react";
import { LuSignalHigh, LuSignalMedium, LuSignalLow, LuTriangleAlert, LuMinus, LuSearch, LuFilter, LuBug, LuGlobe, LuZap, LuSmartphone, LuClock } from "react-icons/lu";
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
    const [platformFilter, setPlatformFilter] = useState("all"); // 'all', 'web', 'app'
    const [issueTypeFilter, setIssueTypeFilter] = useState("all"); // 'all', 'bug', 'feature'
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

        // 2. Filter by Platform
        if (platformFilter !== 'all') {
            filtered = filtered.filter(i => {
                const labels = i.labels?.nodes || [];
                return labels.some(l => l.name.toLowerCase().includes(platformFilter));
            });
        }

        // 3. Filter by Issue Type
        if (issueTypeFilter !== 'all') {
            filtered = filtered.filter(i => {
                const labels = i.labels?.nodes || [];
                return labels.some(l => l.name.toLowerCase().includes(issueTypeFilter));
            });
        }

        return filtered;
    }, [groupedIssues, searchQuery, platformFilter, issueTypeFilter]);

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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                    <LuSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[--text-secondary] w-4.5 h-4.5" />
                    <input
                        type="text"
                        placeholder="Search issues..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-[--text-primary] placeholder:text-[--text-secondary]/50 focus:outline-none focus:ring-2 focus:ring-[--primary]/30 transition-all font-medium"
                    />
                </div>

                <div className="flex items-center gap-4">
                    {/* Device/Platform Filter */}
                    <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 p-1.5 rounded-xl">
                        {[
                            { id: 'all', label: 'All', icon: null },
                            { id: 'web', label: 'Web', icon: <div className="w-4 h-4 rounded-sm border border-current flex items-center justify-center text-[10px] font-bold">W</div> },
                            { id: 'app', label: 'App', icon: <div className="w-4 h-4 rounded-sm border border-current flex items-center justify-center text-[10px] font-bold">A</div> }
                        ].map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setPlatformFilter(t.id)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${platformFilter === t.id
                                    ? "bg-white text-black shadow-lg"
                                    : "text-[--text-secondary] hover:text-[--text-primary] hover:bg-white/5"
                                    }`}
                            >
                                {t.icon}
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Issue Type Filter */}
                    <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 p-1.5 rounded-xl">
                        {[
                            { id: 'all', label: 'All' },
                            { id: 'bug', label: 'Bug' },
                            { id: 'feature', label: 'Feat' }
                        ].map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setIssueTypeFilter(t.id)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${issueTypeFilter === t.id
                                    ? "bg-white text-black shadow-lg"
                                    : "text-[--text-secondary] hover:text-[--text-primary] hover:bg-white/5"
                                    }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
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
                                <div className="flex items-center justify-between px-2 mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${state.type === 'backlog' ? 'bg-gray-500' :
                                            state.type === 'unstarted' ? 'bg-yellow-500' :
                                                state.type === 'started' ? 'bg-blue-500' :
                                                    state.type === 'completed' ? 'bg-green-500' :
                                                        'bg-red-500'
                                            }`} />
                                        <span className="font-bold text-[13px] text-[--text-primary]">
                                            {state.name}
                                        </span>
                                        <span className="text-[--text-secondary] text-[13px] font-medium ml-1">
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
                                            className="bg-[--card-bg] border border-white/5 p-5 rounded-2xl shadow-xl hover:border-white/10 transition-all group flex flex-col gap-4 cursor-pointer hover:bg-white/[0.03] active:scale-[0.98]"
                                        >
                                            <div className="flex items-start justify-between">
                                                <span className="text-[13px] font-bold font-mono text-[--text-secondary] group-hover:text-[--primary] transition-colors">
                                                    {issue.identifier}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <PriorityIcon priority={issue.priority} />
                                                    {issue.assignee ? (
                                                        <div title={`Assigned to ${issue.assignee.name}`}>
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
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <h4 className="font-bold text-[15px] leading-tight text-[--text-primary]">
                                                    {issue.title}
                                                </h4>
                                                {issue.descriptionSnippet && (
                                                    <p className="text-[13px] text-[--text-secondary] line-clamp-3 leading-relaxed font-medium">
                                                        {issue.descriptionSnippet}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-3 mt-auto">
                                                <div className="flex flex-wrap gap-2">
                                                    {issue.labels?.nodes?.filter(l => ["ClutchGG", "Bug", "Feature", "Web", "App"].includes(l.name)).map(l => {
                                                        let styleClass = "bg-white/5 text-[--text-secondary] border-white/5";
                                                        let icon = null;

                                                        const name = l.name.toLowerCase();
                                                        if (name.includes("bug")) {
                                                            styleClass = "bg-red-500/10 text-red-400 border-red-500/20";
                                                            icon = <LuBug className="w-3 h-3" />;
                                                        } else if (name.includes("feature")) {
                                                            styleClass = "bg-green-500/10 text-green-400 border-green-500/20";
                                                            icon = <LuZap className="w-3 h-3" />;
                                                        } else if (name.includes("web")) {
                                                            styleClass = "bg-blue-500/10 text-blue-400 border-blue-500/20";
                                                            icon = <LuGlobe className="w-3 h-3" />;
                                                        } else if (name.includes("app")) {
                                                            styleClass = "bg-purple-500/10 text-purple-400 border-purple-500/20";
                                                            icon = <LuSmartphone className="w-3 h-3" />;
                                                        } else if (l.name === "ClutchGG") {
                                                            styleClass = "bg-[--primary]/10 text-[--primary] border-[--primary]/20";
                                                        }

                                                        return (
                                                            <span key={l.id} className={`text-[10px] px-2 py-1 rounded-md border font-bold flex items-center gap-1.5 uppercase tracking-wider ${styleClass}`}>
                                                                {icon}
                                                                {l.name}
                                                            </span>
                                                        );
                                                    })}
                                                </div>

                                                <div className="flex items-center gap-1.5 text-[11px] text-[--text-secondary] font-medium">
                                                    <LuClock className="w-3 h-3" />
                                                    <span>Updated {new Date(issue.updatedAt || issue.createdAt).toLocaleDateString(undefined, { month: '2-digit', day: '2-digit', year: 'numeric' })}</span>
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
