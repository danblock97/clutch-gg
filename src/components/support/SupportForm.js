"use client";

import { useState, useEffect } from "react";

const CATEGORIES = [
  "Bug Report",
  "Feature Request",
  "Account Issue",
  "Technical Support",
  "General Question",
];

const PRIORITIES = ["Low", "Medium", "High", "Critical"];

const PRIORITY_META = {
  Low:      { color: "text-emerald-400", border: "border-emerald-500/40", bg: "bg-emerald-500/10", ring: "ring-emerald-500/40", response: "5–7 business days" },
  Medium:   { color: "text-yellow-400",  border: "border-yellow-500/40",  bg: "bg-yellow-500/10",  ring: "ring-yellow-500/40",  response: "2–3 business days" },
  High:     { color: "text-orange-400",  border: "border-orange-500/40",  bg: "bg-orange-500/10",  ring: "ring-orange-500/40",  response: "1–2 business days" },
  Critical: { color: "text-red-400",     border: "border-red-500/40",     bg: "bg-red-500/10",     ring: "ring-red-500/40",     response: "Within 24 hours" },
};

const PRODUCTS = [
  "League of Legends Stats",
  "TFT (Teamfight Tactics) Stats",
  "Search & Profiles",
  "Account / Authentication",
  "General Platform",
  "Other",
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Field({ label, required, error, children, hint }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-white/90">
        {label}
        {required && <span className="ml-1 text-blue-400">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-[--text-secondary]">{hint}</p>
      )}
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-400">
          <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

function PriorityRadio({ value, selected, onChange }) {
  const meta = PRIORITY_META[value];
  return (
    <button
      type="button"
      onClick={onChange}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-150
        ${selected
          ? `${meta.bg} ${meta.border} ${meta.color} ring-1 ${meta.ring}`
          : "bg-[--card-bg-secondary] border-white/10 text-[--text-secondary] hover:border-white/20 hover:text-white"
        }`}
    >
      <span className={`w-2 h-2 rounded-full ${selected ? `bg-current` : "bg-white/20"}`} />
      {value}
    </button>
  );
}

function SuccessView({ data, onReset }) {
  const meta = PRIORITY_META[data.priority];
  return (
    <div className="flex flex-col items-center text-center py-8 gap-6">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30">
        <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Request Submitted!</h2>
        <p className="text-[--text-secondary] max-w-md">
          We&apos;ve received your support request and will get back to you shortly.
        </p>
      </div>

      <div className="w-full max-w-sm space-y-3">
        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[--card-bg-secondary] border border-white/10">
          <span className="text-sm text-[--text-secondary]">Issue ID</span>
          <a
            href={data.issueUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm font-mono font-semibold text-blue-300 hover:text-blue-200 transition-colors"
          >
            {data.issueId}
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        {data.priority && (
          <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[--card-bg-secondary] border border-white/10">
            <span className="text-sm text-[--text-secondary]">Expected response</span>
            <span className={`text-sm font-medium ${meta?.color ?? "text-blue-300"}`}>
              {meta?.response ?? "As soon as possible"}
            </span>
          </div>
        )}
      </div>

      <button
        onClick={onReset}
        className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl
          border border-white/10 text-[--text-secondary] hover:text-white hover:border-white/20
          transition-all duration-150"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Submit Another Request
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Form
// ---------------------------------------------------------------------------

const EMPTY_FORM = {
  name: "",
  email: "",
  subject: "",
  category: "",
  priority: "",
  description: "",
  stepsToReproduce: "",
  affectedProduct: "",
  browserInfo: "",
};

export default function SupportForm() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMessage, setErrorMessage] = useState("");
  const [successData, setSuccessData] = useState(null);
  const [includeBrowserInfo, setIncludeBrowserInfo] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      setForm((prev) => ({ ...prev, browserInfo: navigator.userAgent }));
    }
  }, []);

  // ---- Validation ----
  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required.";
    if (!form.email.trim()) {
      e.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      e.email = "Please enter a valid email address.";
    }
    if (!form.subject.trim()) {
      e.subject = "Subject is required.";
    } else if (form.subject.length > 100) {
      e.subject = "Subject must be 100 characters or fewer.";
    }
    if (!form.category) e.category = "Please select a category.";
    if (!form.priority) e.priority = "Please select a priority level.";
    if (!form.description.trim()) {
      e.description = "Description is required.";
    } else if (form.description.trim().length < 20) {
      e.description = "Description must be at least 20 characters.";
    }
    if (!form.affectedProduct) e.affectedProduct = "Please select an affected product.";
    return e;
  }

  // ---- Field handlers ----
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function handlePriority(value) {
    setForm((prev) => ({ ...prev, priority: value }));
    setErrors((prev) => ({ ...prev, priority: undefined }));
  }

  // ---- Submit ----
  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Scroll to top of form
      e.target.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          subject: form.subject,
          category: form.category,
          priority: form.priority,
          description: form.description,
          stepsToReproduce: form.stepsToReproduce,
          affectedProduct: form.affectedProduct,
          browserInfo: includeBrowserInfo ? form.browserInfo : null,
          timestamp: new Date().toISOString(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit. Please try again.");
      }

      setSuccessData({ ...data, priority: form.priority });
      setForm({ ...EMPTY_FORM, browserInfo: form.browserInfo });
      setErrors({});
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err.message || "Something went wrong. Please try again.");
    }
  }

  // ---- Shared style helpers ----
  const inputBase =
    "w-full px-4 py-2.5 rounded-xl bg-[--card-bg-secondary] border text-sm text-white placeholder-[--text-secondary] transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40";

  function inputCls(field) {
    return `${inputBase} ${
      errors[field]
        ? "border-red-500/50 focus:border-red-500/60"
        : "border-white/10 focus:border-blue-500/40"
    }`;
  }

  // ---- Render ----
  if (status === "success") {
    return <SuccessView data={successData} onReset={() => setStatus("idle")} />;
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">

      {/* ---- Name & Email ---- */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" required error={errors.name}>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your full name"
            className={inputCls("name")}
            autoComplete="name"
          />
        </Field>

        <Field label="Email" required error={errors.email}>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className={inputCls("email")}
            autoComplete="email"
          />
        </Field>
      </div>

      {/* ---- Subject ---- */}
      <Field label="Subject" required error={errors.subject}>
        <div className="relative">
          <input
            type="text"
            name="subject"
            value={form.subject}
            onChange={handleChange}
            placeholder="Brief summary of your issue"
            maxLength={100}
            className={`${inputCls("subject")} pr-16`}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[--text-secondary] pointer-events-none">
            {form.subject.length}/100
          </span>
        </div>
      </Field>

      {/* ---- Category & Product ---- */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Category" required error={errors.category}>
          <div className="relative">
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className={`${inputCls("category")} appearance-none cursor-pointer pr-9`}
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[--text-secondary]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </Field>

        <Field label="Affected Product / Feature" required error={errors.affectedProduct}>
          <div className="relative">
            <select
              name="affectedProduct"
              value={form.affectedProduct}
              onChange={handleChange}
              className={`${inputCls("affectedProduct")} appearance-none cursor-pointer pr-9`}
            >
              <option value="">Select a product</option>
              {PRODUCTS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[--text-secondary]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </Field>
      </div>

      {/* ---- Priority ---- */}
      <Field label="Priority" required error={errors.priority}>
        <div className="flex flex-wrap gap-2.5">
          {PRIORITIES.map((p) => (
            <PriorityRadio
              key={p}
              value={p}
              selected={form.priority === p}
              onChange={() => handlePriority(p)}
            />
          ))}
        </div>
        {form.priority && (
          <p className="mt-2 text-xs text-[--text-secondary]">
            Estimated response:{" "}
            <span className={`font-medium ${PRIORITY_META[form.priority].color}`}>
              {PRIORITY_META[form.priority].response}
            </span>
          </p>
        )}
      </Field>

      {/* ---- Description ---- */}
      <Field
        label="Description"
        required
        error={errors.description}
        hint={`${form.description.length} characters (minimum 20)`}
      >
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Please describe your issue in detail. The more context you provide, the faster we can help."
          rows={5}
          className={`${inputCls("description")} resize-y`}
        />
      </Field>

      {/* ---- Steps to Reproduce (Bug Report only) ---- */}
      {form.category === "Bug Report" && (
        <Field
          label="Steps to Reproduce"
          error={errors.stepsToReproduce}
          hint="Optional — helps us reproduce the bug faster."
        >
          <textarea
            name="stepsToReproduce"
            value={form.stepsToReproduce}
            onChange={handleChange}
            placeholder={"1. Navigate to...\n2. Click on...\n3. See error..."}
            rows={4}
            className={`${inputCls("stepsToReproduce")} resize-y`}
          />
        </Field>
      )}

      {/* ---- Browser / System Info (optional) ---- */}
      <label className="flex items-start gap-3 cursor-pointer group">
        <div className="relative mt-0.5 shrink-0">
          <input
            type="checkbox"
            checked={includeBrowserInfo}
            onChange={(e) => setIncludeBrowserInfo(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-4 h-4 rounded border border-white/20 bg-[--card-bg-secondary] peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-colors" />
          {includeBrowserInfo && (
            <svg className="absolute inset-0 w-4 h-4 text-white pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">
            Include Browser / System Info
          </p>
          <p className="text-xs text-[--text-secondary] mt-0.5">
            Optionally share your browser and OS details to help us debug faster.
          </p>
          {includeBrowserInfo && (
            <p className="mt-2 text-xs text-[--text-secondary] font-mono bg-[--card-bg-secondary]/60 border border-white/5 rounded-lg px-3 py-2 truncate">
              {form.browserInfo}
            </p>
          )}
        </div>
      </label>

      {/* ---- Error banner ---- */}
      {status === "error" && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-sm text-red-300">
          <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <div>
            <p className="font-medium mb-0.5">Submission failed</p>
            <p className="text-red-300/80">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* ---- Submit ---- */}
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 font-semibold rounded-xl
          bg-gradient-to-r from-blue-500 to-violet-600
          hover:from-blue-600 hover:to-violet-700
          disabled:opacity-60 disabled:cursor-not-allowed
          shadow-md hover:shadow-lg transition-all duration-200 text-white text-sm"
      >
        {status === "loading" ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Submitting…
          </>
        ) : (
          <>
            Submit Support Request
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </>
        )}
      </button>
    </form>
  );
}
