import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { User, Terminal, ShieldAlert, Activity, GitCommit } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ManagerLayout from '../components/ManagerLayout';

const AuditLogViewer = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [view, setView] = useState('list');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('bookings')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100);

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
            toast.error(`Failed to load audit logs: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter(log => {
        const searchStr = searchTerm.toLowerCase();
        return (
            log.performer?.toLowerCase().includes(searchStr) ||
            log.action?.toLowerCase().includes(searchStr) ||
            log.details?.toLowerCase().includes(searchStr)
        );
    });

    const stats = [
        { label: 'System Events', value: logs.length, icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Security Status', value: 'Nominal', icon: ShieldAlert, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Recent Anomalies', value: '0', icon: Terminal, color: 'text-amber-600', bg: 'bg-amber-50' }
    ];

    const columns = [
        { header: 'System Timestamp' },
        { header: 'Performer Identity' },
        { header: 'Action Trace', align: 'center' },
        { header: 'Payload Details' }
    ];

    return (
        <ManagerLayout
            title="System Telemetry"
            subtitle="Monitor real-time administrative actions, security events, and data mutations"
            icon={Terminal}
            stats={stats}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            searchPlaceholder="Grep logs by performer, action, or trace details..."
            view={view}
            setView={setView}
            isLoading={loading}
            columns={columns}
            data={filteredLogs}
            renderRow={(log) => (
                <tr key={log.id} className="transition-all hover:bg-slate-50 group align-middle">
                    <td className="py-6 px-8 text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-6 px-8">
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300 shrink-0">
                                <User size={14} />
                            </div>
                            <span className="font-black text-slate-900 text-sm tracking-tight truncate max-w-[150px]">{log.performer}</span>
                        </div>
                    </td>
                    <td className="py-6 px-8 text-center">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all ${log.action.includes('NEW') ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            log.action.includes('DELETE') ? 'bg-red-50 text-red-700 border-red-100' :
                                'bg-blue-50 text-blue-700 border-blue-100'
                            }`}>
                            <GitCommit size={10} className="mr-1.5 opacity-50" />
                            {log.action}
                        </span>
                    </td>
                    <td className="py-6 px-8">
                        <div className="text-xs font-mono font-bold text-slate-500 truncate hover:whitespace-normal transition-all max-w-sm cursor-help" title={log.details}>
                            {log.details}
                        </div>
                    </td>
                </tr>
            )}
            renderGrid={() => (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                    {filteredLogs.map((log) => (
                        <div key={log.id} className="bg-white rounded-[2.5rem] border border-gray-100 p-8 flex flex-col group relative hover:shadow-2xl hover:border-slate-300 transition-all duration-500">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center transition-transform group-hover:scale-110 border border-slate-100 group-hover:bg-slate-900 group-hover:text-white duration-300">
                                        <User size={16} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-black text-slate-900 uppercase tracking-tight text-xs max-w-[120px] truncate" title={log.performer}>{log.performer}</span>
                                        <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">{new Date(log.created_at).toLocaleString()}</span>
                                    </div>
                                </div>
                                <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${log.action.includes('NEW') ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                    log.action.includes('DELETE') ? 'bg-red-50 text-red-700 border-red-100' :
                                        'bg-blue-50 text-blue-700 border-blue-100'
                                    }`}>
                                    {log.action}
                                </span>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 font-mono text-[10px] text-slate-600 leading-relaxed font-bold break-all mt-auto h-24 overflow-y-auto custom-scrollbar">
                                {">"} {log.details}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            renderForm={() => null}
        />
    );
};

export default AuditLogViewer;
