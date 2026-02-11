import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ message = 'Loading...', size = 'default' }) => {
    const sizeClasses = {
        small: 'h-4 w-4',
        default: 'h-8 w-8',
        large: 'h-12 w-12'
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <Loader2 className={`${sizeClasses[size]} animate-spin text-red-600 mx-auto mb-4`} />
                <p className="text-gray-600 text-lg">{message}</p>
            </div>
        </div>
    );
};

export default LoadingSpinner;
