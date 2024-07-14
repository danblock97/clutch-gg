import React from "react";
import Image from "next/image";
import Link from "next/link";

const NoActiveGameData = ({ gameName, tagLine }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 lg:px-8 bg-[#0e1015]">
      <div className="mb-4">
        <Image
          src="/images/bee-sad.png"
          alt="Sad Bee Image"
          width={200}
          height={200}
        />
      </div>
      <p className="text-gray-500 text-center font-bold mb-2">
        This player is not currently in a game.
      </p>
      <p className="text-gray-500 text-center mb-4">
        For the app to recognize a game, the game needs to be in the Loading
        Screen or have started.
      </p>
      <Link
        href={`/league/profile?gameName=${gameName}&tagLine=${tagLine}`}
        className="bg-gray-900 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition duration-200"
      >
          View Profile
      </Link>
    </div>
  );
};

export default NoActiveGameData;
