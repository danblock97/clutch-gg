import Image from "next/image";
import Link from "next/link";
import React from "react";

const ComingSoon = () => {
	return (
		<div className="bg-[#0e1015] min-h-screen flex items-center justify-center">
			<div className="bg-[#13151b] p-8 rounded-lg shadow-md text-center">
				<h2 className="text-3xl font-bold mb-4 text-white">Coming Soon!</h2>
				<p className="text-lg text-gray-700 mb-8">
					We're working hard to bring you something amazing. Stay tuned!
				</p>
				<Image
					src="/images/Comingsoon.png" // Replace with your image
					alt="Coming Soon"
					className="mx-auto mb-8"
					width={400}
					height={400}
				/>
				<p className="text-gray-600">Follow us on social media for updates:</p>
				<div className="flex justify-center space-x-4 mt-4">
					<Link href="#" className="text-blue-500 hover:text-blue-700">
						Twitter
					</Link>
					<Link href="#" className="text-blue-500 hover:text-blue-700">
						Facebook
					</Link>
					<Link href="#" className="text-blue-500 hover:text-blue-700">
						Instagram
					</Link>
				</div>
			</div>
		</div>
	);
};

export default ComingSoon;
