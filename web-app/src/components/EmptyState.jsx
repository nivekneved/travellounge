import React from 'react';
import { Package } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmptyState = ({
    icon: Icon = Package,
    title = 'No items found',
    message = 'There are no items to display at the moment.',
    actionText,
    actionLink
}) => {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                <Icon className="h-24 w-24 text-gray-400 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
                <p className="text-gray-600 mb-6">{message}</p>
                {actionText && actionLink && (
                    <Link
                        to={actionLink}
                        className="inline-block px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        {actionText}
                    </Link>
                )}
            </div>
        </div>
    );
};

export default EmptyState;
