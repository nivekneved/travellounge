import React from 'react';
import ViewToggle from './ViewToggle';

const ListingHeader = ({
    count,
    label = "properties",
    viewMode,
    setViewMode,
    className = ""
}) => {
    return (
        <div className={`flex flex-col md:flex-row justify-between items-center mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100 ${className}`}>
            <p className="text-gray-600 font-medium mb-4 md:mb-0">
                Showing <span className="font-bold text-gray-900">{count}</span> {label}
            </p>
            <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">View:</span>
                <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
            </div>
        </div>
    );
};

export default ListingHeader;
