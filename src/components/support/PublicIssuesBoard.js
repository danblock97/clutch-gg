"use client";

import { useEffect, useMemo, useState } from "react";

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

function priorityStyle(priority) {
	switch (priority) {
		case 1:
			return "border-red-500/30 bg-red-500/10 text-red-200";
		case 2:
			return "border-orange-500/30 bg-orange-500/10 text-orange-200";
		case 3:
			return "border-yellow-500/30 bg-yellow-500/10 text-yellow-200";
		case 4:
			return "border-sky-500/30 bg-sky-500/10 text-sky-200";
		default:
			return "border-white/10 bg-white/5 text-[--text-secondary]";
	}
}

export default function PublicIssuesBoard({ type = "bug" }) {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [issues, setIssues] = useState([]);
	const [meta, setMeta] = useState({ team: null, label: null });
	const [query, setQuery] = useState("");

	useEffect(() => {
		let cancelled = false;

		async function load() {
			setLoading(true);
			setError("");
			try {
				const res = await fetch(`/api/linear/issues?type=${type}`, { method: "GET" });
				const data = await res.json().catch(() => ({}));
				if (!res.ok) throw new Error(data?.error || "Failed to load issues");
				if (cancelled) return;
				setIssues(Array.isArray(data?.issues) ? data.issues : []);
				setMeta({ team: data?.team || null, label: data?.label || null });
			} catch (e) {
				if (cancelled) return;
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

	const columns = useMemo(() => {
		const q = query.trim().toLowerCase();
		const filtered = q
			? issues.filter((i) => {
				const hay = `${i?.identifier || ""} ${i?.title || ""} ${i?.state?.name || ""}`.toLowerCase();
				return hay.includes(q);
			})
			: issues;

		const sorted = [...filtered].sort((a, b) => {
			const ad = new Date(a?.updatedAt || a?.createdAt || 0).getTime();
			const bd = new Date(b?.updatedAt || b?.createdAt || 0).getTime();
			return bd - ad;
		});

		return sorted;
	}, [issues, query]);

	if (loading) {
		return <p className="text-[--text-secondary]">Loading {type === "feature" ? "feature requests" : "bugs"}…</p>;
	}

	if (error) {
		return (
			<div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm">
				{error}
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
				<p className="text-sm text-[--text-secondary]">
					Showing {type === "feature" ? "requests" : "issues"} tagged{" "}
					<span className="font-semibold">{meta?.label?.name || "ClutchGG"}</span> +{" "}
					<span className="font-semibold">{type === "feature" ? "Feature" : "Bug"}</span>{" "}
					{meta?.team?.key ? (
						<>
							in team <span className="font-semibold">{meta.team.key}</span>
						</>
					) : null}
					.
				</p>
				<div className="flex items-center gap-2">
					<input
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Search…"
						className="w-full sm:w-64 rounded-xl bg-[--card] border border-white/10 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[--primary]"
					/>
					<button
						type="button"
						onClick={() => window.location.reload()}
						className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-xl border border-white/10 hover:bg-white/5 transition"
					>
						Refresh
					</button>
				</div>
			</div>

			<div className="rounded-2xl border border-white/10 bg-black/10 overflow-hidden">
				<div className="hidden md:grid grid-cols-[140px_1fr_160px_120px_180px] gap-0 border-b border-white/10 px-4 py-3 text-xs text-[--text-secondary]">
					<div>Issue</div>
					<div>Title</div>
					<div>Status</div>
					<div>Priority</div>
					<div>Updated</div>
				</div>

				{columns.length ? (
					<ul className="divide-y divide-white/10">
						{columns.map((issue) => (
							<li key={issue.id} className="px-4 py-3">
								<div className="md:grid md:grid-cols-[140px_1fr_160px_120px_180px] md:gap-0 flex flex-col gap-2">
									<div className="text-xs text-[--text-secondary] md:text-sm md:text-[--text]">
										<span className="font-semibold">{issue.identifier}</span>
									</div>

									<div className="min-w-0">
										<p className="font-semibold leading-snug break-words">{issue.title}</p>
										{issue.descriptionSnippet ? (
											<p className="mt-1 text-sm text-[--text-secondary]">
												{issue.descriptionSnippet}
												{issue.descriptionSnippet.length >= 240 ? "…" : ""}
											</p>
										) : null}
									</div>

									<div className="text-sm text-[--text-secondary]">
										{issue?.state?.name || "Unknown"}
									</div>

									<div>
										<span
											className={`inline-flex text-xs rounded-lg border px-2 py-1 ${priorityStyle(
												issue.priority
											)}`}
											title="Priority"
										>
											{priorityLabel(issue.priority)}
										</span>
									</div>

									<div className="text-sm text-[--text-secondary]">
										{issue.updatedAt ? new Date(issue.updatedAt).toLocaleString() : ""}
									</div>
								</div>
							</li>
						))}
					</ul>
				) : (
					<div className="p-4 text-[--text-secondary]">No issues found.</div>
				)}
			</div>
		</div>
	);
}


