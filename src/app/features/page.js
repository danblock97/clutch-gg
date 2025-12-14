import FeatureRequestForm from "@/components/support/FeatureRequestForm";
import PublicIssuesBoard from "@/components/support/PublicIssuesBoard";

export const metadata = {
    title: "Request a Feature | ClutchGG",
    description: "Have an idea? Let us know! Submit a feature request.",
};

export default function FeaturesPage() {
    return (
        <div className="relative mx-auto max-w-4xl px-4 py-12 min-h-[calc(100vh-200px)] flex flex-col">
            {/* Header */}
            <header className="text-center mb-12">
                <div className="inline-flex items-center justify-center gap-3 mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 shadow-[0_0_15px_-3px_rgba(234,179,8,0.2)]">
                        <svg className="w-6 h-6 text-yellow-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-yellow-100 to-yellow-400">
                        <span>Feature Requests</span>
                    </h1>
                </div>
                <p className="text-lg text-[--text-secondary] max-w-2xl mx-auto leading-relaxed">
                    Help shape the future of ClutchGG. Submit your ideas below or vote on existing requests.
                </p>
                <div className="mx-auto mt-8 h-px w-24 rounded-full bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent" />
            </header>

            <div className="space-y-12">
                {/* Request Form */}
                <section>
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
                        <div className="relative bg-[--card-bg] border border-white/10 p-6 sm:p-8 rounded-2xl shadow-xl backdrop-blur-sm">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Submit a new idea
                            </h2>
                            <FeatureRequestForm />
                        </div>
                    </div>
                </section>

                {/* Public Board */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold">Community Requests</h2>
                        <span className="text-sm text-[--text-secondary] hidden sm:inline-block">
                            Vote and comment on ideas
                        </span>
                    </div>
                    <div className="bg-black/20 rounded-2xl border border-white/5 p-1">
                        <PublicIssuesBoard type="feature" />
                    </div>
                </section>
            </div>
        </div>
    );
}
