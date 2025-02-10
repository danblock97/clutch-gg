import React from "react";
import Image from "next/image";
import Link from "next/link";

const NoProfileFound = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <Image src="/Images/bee-sad.png" alt="Bee Sad" className="w-48 h-48 mb-4" height={48} width={48} />
            <p className="text-xl text-white text-center">
                <>
                    Unable to find a profile. Please ensure the correct region and Riot ID are entered.
                    If this keeps happening, please open an issue on{" "}
                    <Link
                        href="https://github.com/danblock97/clutch-gg/issues"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500"
                    >
                        GitHub
                    </Link>.
                </>
            </p>
        </div>
    );
};

export default NoProfileFound;