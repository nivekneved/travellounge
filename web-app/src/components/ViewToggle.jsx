import React from 'react';
import { Grid, List } from 'lucide-react';

const ViewToggle = ({ viewMode, setViewMode }) => {
    return (
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
            <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-900'}`}
                title="Grid View"
            >
                <Grid size={20} />
            </button>
            <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-900'}`}
                title="List View"
            >
                <List size={20} />
            </button>
        </div>
    );
};

export default ViewToggle;
