import React from "react";

const Loading = () => {
	return (
		<div className="">
			<div className="bg-[#0e1015] flex items-center justify-center h-screen">
				<div className="w-20 h-20 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
			</div>
		</div>
	);
};

export default Loading;
