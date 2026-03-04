import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Admin App ErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
                    <div className="bg-slate-900 border border-slate-800 p-10 rounded-2xl shadow-2xl max-w-xl w-full text-center">
                        <div className="bg-red-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                            <AlertTriangle className="h-10 w-10 text-red-500" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-4">Application Error</h1>
                        <p className="text-slate-400 mb-8 leading-relaxed">
                            The Admin Dashboard encountered an unexpected error. This might be due to a failed data request or an internal component crash.
                        </p>
                        <div className="space-y-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-semibold shadow-lg shadow-red-600/20"
                            >
                                <RefreshCcw className="h-5 w-5" />
                                Reload Application
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="w-full px-6 py-4 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition-all font-medium border border-slate-700"
                            >
                                Go to Dashboard
                            </button>
                        </div>
                        {process.env.NODE_ENV === 'development' && (
                            <div className="mt-8 p-4 bg-black/50 rounded-lg text-left overflow-auto max-h-40">
                                <code className="text-xs text-red-400 font-mono">
                                    {this.state.error?.toString()}
                                </code>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
