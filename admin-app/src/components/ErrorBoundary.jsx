import React from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

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
                    app: 'ADMIN_APP'
                })
            });
        } catch (e) {
            console.error('Failed to log error to backend:', e);
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-[#0B0F1A] p-6 font-sans">
                    <div className="relative group max-w-xl w-full">
                        {/* Glassmorphism Background Decoration */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-primary rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>

                        <div className="relative bg-[#111827] border border-white/5 p-10 rounded-3xl shadow-2xl text-center backdrop-blur-xl">
                            <div className="bg-red-500/10 w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-red-500/20 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                <AlertTriangle className="h-12 w-12 text-red-500" />
                            </div>

                            <h1 className="text-3xl font-bold text-white tracking-tight mb-4">Dashboard Interrupted</h1>
                            <p className="text-gray-400 mb-10 leading-relaxed text-lg">
                                We've encountered a runtime exception. The error has been logged for our engineering team to investigate.
                            </p>

                            <div className="grid grid-cols-1 gap-4">
                                <button
                                    onClick={() => window.location.reload()}
                                    className="flex items-center justify-center gap-3 px-8 py-4 bg-primary hover:bg-red-700 text-white rounded-2xl transition-all font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <RefreshCcw className="h-5 w-5" />
                                    Recover Application
                                </button>

                                <button
                                    onClick={() => window.location.href = '/'}
                                    className="flex items-center justify-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 text-gray-300 rounded-2xl transition-all font-semibold border border-white/10 hover:border-white/20"
                                >
                                    <Home className="h-5 w-5" />
                                    Go to Dashboard
                                </button>
                            </div>

                            {process.env.NODE_ENV === 'development' && (
                                <div className="mt-10 p-6 bg-black/40 rounded-2xl text-left border border-white/5">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Debug Information</p>
                                    <pre className="text-xs text-red-400/80 font-mono overflow-auto max-h-48 custom-scrollbar">
                                        {this.state.error?.stack || this.state.error?.toString()}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
