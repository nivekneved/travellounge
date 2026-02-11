import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

export const SortableItem = ({ id, children, className = '' }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className={`relative ${className}`}>
            {/* Drag Handle - can be positioned absolutely or passed as prop */}
            {children(attributes, listeners)}
        </div>
    );
};

export const SortableHandle = ({ attributes, listeners, className = '' }) => {
    return (
        <button {...attributes} {...listeners} className={`cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 ${className}`}>
            <GripVertical size={20} />
        </button>
    )
}
