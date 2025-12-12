import PublicIssuesBoard from "@/components/support/PublicIssuesBoard";

export const metadata = {
	title: "Public Issues | ClutchGG",
	description: "Public issue tracker for ClutchGG bugs (Linear).",
};

export default function PublicIssuesPage() {
	return (
		<div className="relative mx-auto max-w-6xl px-4 py-12 min-h-[calc(100vh-200px)] flex flex-col">
			<header className="text-center mb-8">
				<div className="inline-flex items-center justify-center gap-3 mb-4">
					<div className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-white/10 bg-white/5">
						<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 014-4h4m-6 6l-2 2m0 0l2 2m-2-2h8" />
						</svg>
					</div>
					<h1 className="text-4xl font-extrabold tracking-tight">
						<span>Public Issues</span>
					</h1>
				</div>
				<p className="text-lg text-[--text-secondary] max-w-3xl mx-auto">
					A public view of bugs labeled <span className="font-semibold">ClutchGG</span>.
				</p>
				<div className="mx-auto mt-6 h-px w-32 rounded bg-white/10" />
			</header>

			<div className="flex-1 mb-8">
				<div className="feature-card p-6 sm:p-8 rounded-2xl overflow-hidden">
					<div className="flex items-center justify-between gap-4 mb-6">
						<a
							href="/support"
							className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-xl border border-white/10 hover:bg-white/5 transition"
						>
							← Back to report form
						</a>
					</div>
					<PublicIssuesBoard />
				</div>
			</div>
		</div>
	);
}


