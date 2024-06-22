import React from 'react';

const Tag = ({ text, hoverText, color }) => {
    return (
        <div className={`px-2 py-0.5 text-xs rounded-full ${color} relative group ml-1`}>
            <span>{text}</span>
            <div
                className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                <span className="font-bold">{text}</span>
                <br/>
                <br/>
                <span>{hoverText}</span>
            </div>
        </div>
    );
};

export default Tag;
