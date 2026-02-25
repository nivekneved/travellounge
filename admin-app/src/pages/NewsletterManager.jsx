import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';
import { toast } from 'react-hot-toast';
import {
    Mail,
    Download,
    Send,
    Users,
    Calendar,
    Search,
    CheckCircle,
    XCircle,
    ArrowUpDown,
    ChevronRight,
    SearchX,
    Trash2,
    TrendingUp,
    Globe,
    Zap
} from 'lucide-react';
import { format } from 'date-fns';
import ManagerLayout from '../components/ManagerLayout';

const NewsletterManager = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [view, setView] = useState('list');
    const queryClient = useQueryClient();

    const { data: subscribers = [], isLoading, isError, error: queryError } = useQuery({
        queryKey: ['newsletter'],
        queryFn: async () => {
            const { data, error } = await supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false });
            if (error) {
                if (error.code === '42P01') return []; // Table doesn't exist
                throw error;
            };
            return data;
        }
    });

    const filteredSubscribers = subscribers.filter(sub => {
        const searchStr = searchTerm.toLowerCase();
        return sub.email?.toLowerCase().includes(searchStr);
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['newsletter']);
            toast.success('Subscriber removed successfully');
        },
        onError: (error) => {
            toast.error(`Failed to delete: ${error.message}`);
        }
    });

    const handleExport = () => {
        if (!subscribers || subscribers.length === 0) return toast.error('No subscribers to export');

        const csvContent = "data:text/csv;charset=utf-8,"
            + "Email,Status,Subscribed Date\n"
            + subscribers.map(s => `${s.email},${s.status || 'Active'},${s.created_at}`).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "subscribers.csv");
        document.body.appendChild(link);
        link.click();
        toast.success('Export started');
    };

    const stats = [
        { label: 'Total Audience', value: subscribers.length, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Active Leads', value: subscribers.length, icon: Zap, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Growth Vector', value: '+12%', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' }
    ];

    const columns = [
        { header: 'Subscriber Identity' },
        { header: 'Subscription Date' },
        { header: 'Channel Status', align: 'center' },
        { header: 'Actions', align: 'right' }
    ];

    return (
        <ManagerLayout
            title="Newsletter Hub"
            subtitle="Manage global subscriber base and audience engagement"
            icon={Mail}
            stats={stats}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            searchPlaceholder="Search subscribers by email..."
            onAdd={handleExport}
            addLabel="Export Database"
            view={view}
            setView={setView}
            isLoading={isLoading}
            columns={columns}
            data={filteredSubscribers}
            renderRow={(sub) => (
                <tr key={sub.id} className="transition-all hover:bg-slate-50 group align-middle">
                    <td className="py-6 px-8">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
                                <Mail size={18} />
                            </div>
                            <span className="font-black text-slate-900 text-sm lowercase tracking-tight">{sub.email}</span>
                        </div>
                    </td>
                    <td className="py-6 px-8">
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                            <Calendar size={12} />
                            {sub.created_at ? format(new Date(sub.created_at), 'MMM d, yyyy') : 'TBA'}
                        </div>
                    </td>
                    <td className="py-6 px-8 text-center">
                        <span className="inline-flex items-center px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all bg-green-50 text-green-700 border-green-100">
                            <span className="w-1 h-1 rounded-full mr-1.5 bg-green-500"></span>
                            Verified
                        </span>
                    </td>
                    <td className="py-6 px-8 text-right">
                        <button onClick={() => { if (window.confirm('Remove this subscriber?')) deleteMutation.mutate(sub.id); }}
                            className="p-2.5 bg-white text-red-600 border border-slate-100 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-premium-sm" title="Remove Subscriber">
                            <Trash2 size={16} />
                        </button>
                    </td>
                </tr>
            )}
            renderGrid={() => (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                    {filteredSubscribers.map((sub) => (
                        <div key={sub.id} className="bg-white rounded-[2.5rem] border border-gray-100 p-8 flex flex-col group relative hover:shadow-2xl hover:border-indigo-100 transition-all duration-500">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center transition-transform group-hover:scale-110 border border-indigo-100">
                                    <Mail size={20} />
                                </div>
                                <button onClick={() => { if (window.confirm('Remove this subscriber?')) deleteMutation.mutate(sub.id); }}
                                    className="p-2 text-red-300 hover:text-red-600 transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            <h3 className="font-black text-slate-900 lowercase tracking-tight text-lg mb-2 truncate">{sub.email}</h3>
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">
                                <Calendar size={12} />
                                Subscribed {sub.created_at ? format(new Date(sub.created_at), 'MMM d, yyyy') : 'TBA'}
                            </div>
                            <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                                <span className="inline-flex items-center px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest bg-green-50 text-green-700 border border-green-100">
                                    Active Subscriber
                                </span>
                                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center font-serif italic text-xs text-slate-300">
                                    TL
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        />
    );
};

export default NewsletterManager;
