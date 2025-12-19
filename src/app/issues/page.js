import KanbanBoard from "@/components/support/KanbanBoard";

export const metadata = {
    title: "Public Issues Board | ClutchGG",
    description: "Track the status of bugs and feature requests for ClutchGG.",
};

export default function IssuesPage() {
    return (
        <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
            {/* Header */}
            <div className="flex-shrink-0 bg-[--background]">
                <div className="px-6 py-12 max-w-[1920px] mx-auto w-full">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="max-w-3xl">
                            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[--text-primary] mb-4">
                                Public Roadmap
                            </h1>
                            <p className="text-xl text-[--text-secondary] leading-relaxed">
                                See what we're building, what's coming next, and the status of known issues.
                            </p>
                        </div>
                        <div className="flex-shrink-0">
                            <button className="px-6 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-semibold rounded-full border border-red-500/20 transition-all">
                                Report an Issue
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Board Area */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden bg-[--background]">
                <div className="h-full px-6 py-8 min-w-max">
                    <KanbanBoard type="all" />
                </div>
            </div>
        </div>
    );
}
