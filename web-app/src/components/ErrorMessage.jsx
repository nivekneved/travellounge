import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorMessage = ({ error, title = 'Error', onRetry }) => {
    const errorMessage = typeof error === 'string' ? error : error?.message || 'An unexpected error occurred';

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
                <p className="text-gray-600 mb-6">{errorMessage}</p>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Try Again
                    </button>
                )}
            </div>
        </div>
    );
};

export default ErrorMessage;
