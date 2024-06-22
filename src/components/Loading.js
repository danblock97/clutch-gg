import React, { useRef, useEffect } from "react";
import LoadingBar from "react-top-loading-bar";

const Loading = () => {
    const loadingBarRef = useRef(null);

    useEffect(() => {
        if (loadingBarRef.current) {
            loadingBarRef.current.continuousStart();
        }

        return () => {
            if (loadingBarRef.current) {
                loadingBarRef.current.complete();
            }
        };
    }, []);

    return (
        <div>
            <LoadingBar color="#f11946" ref={loadingBarRef} />
        </div>
    );
};

export default Loading;
