import React from 'react';
import { LayoutGrid, List } from 'lucide-react';

const ViewToggle = ({ view, onViewChange }) => {
    return (
        <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
                onClick={() => onViewChange('grid')}
                className={`p-2 rounded-md transition-all ${view === 'grid'
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                title="Grid View"
            >
                <LayoutGrid size={20} />
            </button>
            <button
                onClick={() => onViewChange('list')}
                className={`p-2 rounded-md transition-all ${view === 'list'
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                title="List View"
            >
                <List size={20} />
            </button>
        </div>
    );
};

export default ViewToggle;
