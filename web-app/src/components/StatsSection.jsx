import React from 'react';

const StatsSection = ({ stats, className = "" }) => {
    if (!stats || stats.length === 0) return null;

    return (
        <div className={`grid grid-cols-2 sm:grid-cols-4 gap-8 border-t border-gray-100 pt-16 mt-16 ${className}`}>
            {stats.map((stat, i) => (
                <div key={i} className="group cursor-default">
                    <p className="text-4xl md:text-5xl font-black text-gray-900 group-hover:text-primary transition-colors duration-500 mb-2 font-serif">
                        {stat.value}
                    </p>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
                </div>
            ))}
        </div>
    );
};

export default StatsSection;
