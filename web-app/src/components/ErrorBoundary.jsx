import React from 'react';
import { Home, AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
        this.logErrorToBackend(error, errorInfo);
    }

    async logErrorToBackend(error, errorInfo) {
        try {
            await fetch('/api/misc/logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    error: error.toString(),
                    info: errorInfo.componentStack,
                    app: 'WEB_APP'
                })
            });
        } catch (e) {
            console.error('Failed to log error to backend:', e);
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 font-sans">
                    <div className="bg-white p-10 rounded-3xl shadow-xl max-w-xl w-full text-center border border-gray-100">
                        <div className="bg-red-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8">
                            <AlertTriangle className="h-10 w-10 text-red-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Something went wrong</h1>
                        <p className="text-gray-600 mb-10 leading-relaxed text-lg">
                            We've encountered a temporary technical glitch. Our team has been notified, but you can try refreshing the page or returning home.
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl hover:bg-red-700 transition-all font-bold shadow-lg shadow-primary/20"
                            >
                                <RefreshCw className="h-5 w-5" />
                                Refresh Page
                            </button>

                            <button
                                onClick={() => window.location.href = '/'}
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-all font-semibold"
                            >
                                <Home className="h-5 w-5" />
                                Return Home
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
