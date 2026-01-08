"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import TurnstileWidget from "./TurnstileWidget";

const PRIORITY_OPTIONS = [
    { value: "none", label: "No priority" },
    { value: "urgent", label: "Urgent" },
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" },
];

export default function FeatureRequestForm() {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    const turnstileDisabled = process.env.NEXT_PUBLIC_TURNSTILE_DISABLED === "true";

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("none");
    const [honeypot, setHoneypot] = useState("");
    const [turnstileToken, setTurnstileToken] = useState("");

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [submissionCount, setSubmissionCount] = useState(0);

    useEffect(() => {
        if (!success) return;
        const t = setTimeout(() => setSuccess(false), 6000);
        return () => clearTimeout(t);
    }, [success]);

    const canSubmit = useMemo(() => {
        return (
            title.trim().length >= 3 &&
            description.trim().length >= 10 &&
            (turnstileDisabled || !!turnstileToken) &&
            !submitting &&
            !success
        );
    }, [description, submitting, success, title, turnstileDisabled, turnstileToken]);

    async function onSubmit(e) {
        e.preventDefault();
        setError("");
        setSuccess(false);

        if (!turnstileDisabled && !siteKey) {
            setError("Verification is not configured (missing Turnstile site key).");
            return;
        }
        if (!canSubmit) return;

        setSubmitting(true);
        try {
            const res = await fetch("/api/linear/bugs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: title.trim(),
                    description: description.trim(),
                    priority,
                    turnstileToken: turnstileDisabled ? "" : turnstileToken,
                    honeypot,
                    type: "feature",
                }),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setError(data?.error || "Failed to submit feature request.");
                return;
            }

            setSuccess(true);
            setSubmissionCount(prev => prev + 1);

            setTitle("");
            setDescription("");
            setPriority("none");
            setHoneypot("");
            setTurnstileToken("");
        } catch (err) {
            setError(err?.message || "Failed to submit feature request.");
        } finally {
            setSubmitting(false);
        }
    }

    if (success) {
        return (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-8 text-center animate-fadeIn">
                <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10">
                    <svg
                        className="h-7 w-7 text-emerald-300 animate-pulse"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold">Thanks — request received</h3>
                <p className="mt-2 text-sm text-[--text-secondary] max-w-xl mx-auto">
                    We’ll review your suggestion as soon as possible.
                </p>
                <p className="mt-4 text-xs text-[--text-secondary]">You can submit another request in a moment…</p>
            </div>
        );
    }

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid gap-4">
                <label className="grid gap-2">
                    <span className="text-sm font-semibold">Feature title</span>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="What would you like to see?"
                        className="w-full rounded-xl bg-[--card-bg] border border-[--card-border] px-4 py-3 outline-none focus:ring-2 focus:ring-[--primary] text-[--text-primary] font-sans"
                        minLength={3}
                        maxLength={120}
                        required
                    />
                </label>

                <label className="grid gap-2">
                    <span className="text-sm font-semibold">Description</span>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="How should it work? Why is it useful?"
                        className="w-full min-h-[180px] rounded-xl bg-[--card-bg] border border-[--card-border] px-4 py-3 outline-none focus:ring-2 focus:ring-[--primary] resize-y text-[--text-primary] font-sans"
                        minLength={10}
                        maxLength={5000}
                        required
                    />
                </label>

                <label className="grid gap-2">
                    <span className="text-sm font-semibold">Priority</span>
                    <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="w-full rounded-xl bg-[--card-bg] border border-[--card-border] px-4 py-3 outline-none focus:ring-2 focus:ring-[--primary] text-[--text-primary] font-sans"
                    >
                        {PRIORITY_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-[--card-bg-secondary] text-[--text-primary]">
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </label>

                {/* Honeypot (anti-bot) */}
                <label className="hidden">
                    <span>Website</span>
                    <input
                        value={honeypot}
                        onChange={(e) => setHoneypot(e.target.value)}
                        autoComplete="off"
                        tabIndex={-1}
                    />
                </label>
            </div>

            <div className="rounded-xl border border-white/10 p-4 bg-black/10">
                {turnstileDisabled ? (
                    <p className="text-sm text-[--text-secondary]">
                        Verification is disabled for local development.
                    </p>
                ) : (
                    <>
                        <p className="text-sm text-[--text-secondary] mb-3">
                            To prevent spam, please complete the verification challenge.
                        </p>
                        {siteKey ? (
                            <TurnstileWidget
                                key={submissionCount}
                                siteKey={siteKey}
                                onToken={useCallback((token) => setTurnstileToken(token || ""), [])}
                                onError={useCallback((e) => setError(e?.message || "Verification failed"), [])}
                            />
                        ) : (
                            <p className="text-sm text-[--text-secondary]">
                                Turnstile is not configured.
                            </p>
                        )}
                    </>
                )}
            </div>

            {error ? (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm">
                    {error}
                </div>
            ) : null}

            {success ? (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm">
                    Submitted!
                </div>
            ) : null}

            <div className="flex items-center justify-between gap-4">
                <button
                    type="submit"
                    disabled={!canSubmit}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-xl
						bg-gradient-to-r from-[--primary] to-[--secondary] text-white
						disabled:opacity-50 disabled:cursor-not-allowed
						shadow-md hover:shadow-lg transition-all duration-200"
                >
                    {submitting ? "Submitting…" : "Submit Feature Request"}
                </button>

                <p className="text-sm text-[--text-secondary]">
                    Label: <span className="font-semibold">ClutchGG</span>
                </p>
            </div>
        </form>
    );
}
