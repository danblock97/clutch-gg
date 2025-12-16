import KanbanBoard from "@/components/support/KanbanBoard";

export const metadata = {
    title: "Public Issues Board | ClutchGG",
    description: "Track the status of bugs and feature requests for ClutchGG.",
};

export default function IssuesPage() {
    return (
        <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
            {/* Header */}
            <div className="flex-shrink-0 border-b border-white/10 bg-[--background]">
                <div className="px-6 py-6 max-w-[1920px] mx-auto w-full">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-3">
                                <div className="w-2 h-8 bg-gradient-to-b from-[--primary] to-[--secondary] rounded-full"></div>
                                Issues Board
                            </h1>
                            <p className="text-[--text-secondary] mt-1 ml-5 text-sm">
                                Track development progress, known bugs, and feature requests live from our Linear workspace.
                            </p>
                        </div>
                        <div>
                            {/* Could add filters here later */}
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
