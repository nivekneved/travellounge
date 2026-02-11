import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { History, User, Terminal, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AuditLogViewer = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            // Using Bookings as the primary source of truth for system activity for now
            const { data, error } = await supabase
                .from('bookings')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;

            if (data) {
                const mappedLogs = data.map(booking => ({
                    id: booking.id,
                    created_at: booking.created_at,
                    performer: booking.customer_info?.name || 'Guest User',
                    action: 'NEW_BOOKING_REQUEST',
                    details: `Status: ${booking.status} | Total: ${booking.total_amount || 'N/A'}`
                }));
                setLogs(mappedLogs);
            }
        } catch (error) {
            console.error('Error fetching logs:', error);
            toast.error(`Failed to load audit logs: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Audit Logs</h1>
                <p className="text-gray-500">Track all administrative actions and system events (Bookings Feed).</p>
            </div>

            <div className="bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-800">
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left">
                        <thead className="bg-gray-800/50 border-b border-gray-800">
                            <tr>
                                <th className="px-6 py-4 text-xs uppercase font-bold text-gray-500">Timestamp</th>
                                <th className="px-6 py-4 text-xs uppercase font-bold text-gray-500">Performer</th>
                                <th className="px-6 py-4 text-xs uppercase font-bold text-gray-500">Action</th>
                                <th className="px-6 py-4 text-xs uppercase font-bold text-gray-500">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-20 text-center text-gray-500">
                                        <div className="flex justify-center items-center gap-2">
                                            <Loader2 size={16} className="animate-spin" /> Loading system logs...
                                        </div>
                                    </td>
                                </tr>
                            ) : logs.map((log) => (
                                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 text-xs font-mono text-gray-400 align-top">
                                        {new Date(log.created_at).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 align-top">
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <User size={14} className="text-primary" />
                                            <span className="font-bold text-sm">{log.performer}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 align-top">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${log.action.includes('NEW') ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                                            }`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 align-top">
                                        <div className="text-sm text-gray-500 font-mono">
                                            {log.details}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!loading && logs.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-20 text-center text-gray-600 italic">No logs recorded in the system.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AuditLogViewer;
