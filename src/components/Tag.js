import React from 'react';

const Tag = ({ text, hoverText, color }) => {
    return (
        <div className={`px-3 py-1 rounded-full ${color} relative group ml-1`}>
            <span>{text}</span>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                {hoverText}
            </div>
        </div>
    );
};

export default Tag;
