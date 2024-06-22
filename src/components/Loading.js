import React, { useRef } from "react";
import LoadingBar from "react-top-loading-bar";

const Loading = () => {
	const loadingBarRef = useRef(null);

	React.useEffect(() => {
		loadingBarRef.current.continuousStart();
		return () => {
			loadingBarRef.current.complete();
		};
	}, []);

	return (
		<div>
			<LoadingBar color="#f11946" ref={loadingBarRef} />
		</div>
	);
};

export default Loading;
