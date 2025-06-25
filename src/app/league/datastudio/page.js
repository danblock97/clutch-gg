import Link from "next/link";
import { FaUsers, FaArchive } from "react-icons/fa";

export default function DataStudio() {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center p-4">
			<div className="text-center mb-12">
				<h1 className="text-5xl font-bold mb-2">Data Studio</h1>
				<p className="text-lg text-gray-400">
					Your central hub for League of Legends data.
				</p>
			</div>
			<div className="flex flex-wrap justify-center gap-8">
				<Link
					href="/league/datastudio/champions"
					className="flex flex-col items-center justify-center p-8 bg-gray-800/50 backdrop-blur-sm rounded-lg hover:bg-gray-700/70 border border-gray-700 w-80 h-60 transition-all duration-300 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/10"
				>
					<FaUsers className="text-6xl mb-4 text-blue-400" />
					<h2 className="text-2xl font-bold mb-2">Champions</h2>
					<p className="text-gray-400 text-center">
						Explore all champions, view their stats, abilities, and skins.
					</p>
				</Link>
				<Link
					href="/league/datastudio/items"
					className="flex flex-col items-center justify-center p-8 bg-gray-800/50 backdrop-blur-sm rounded-lg hover:bg-gray-700/70 border border-gray-700 w-80 h-60 transition-all duration-300 hover:border-yellow-500 hover:shadow-2xl hover:shadow-yellow-500/10"
				>
					<FaArchive className="text-6xl mb-4 text-yellow-400" />
					<h2 className="text-2xl font-bold mb-2">Items</h2>
					<p className="text-gray-400 text-center">
						Discover all items, their stats, build paths, and prices.
					</p>
				</Link>
			</div>
		</div>
	);
}
