import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
    XCircle
} from 'lucide-react';
import { format } from 'date-fns';

const NewsletterManager = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const { data: subscribers, isLoading, isError, error: queryError } = useQuery({
        queryKey: ['newsletter'],
        queryFn: async () => {
            const { data, error } = await supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false });
            if (error) {
                if (error.code === '42P01') return [];
                throw error;
            };
            return data;
        }
    });

    React.useEffect(() => {
        if (isError && queryError) {
            toast.error(`Failed to load subscribers: ${queryError.message}`);
        }
    }, [isError, queryError]);

    const handleExport = () => {
        if (!subscribers || subscribers.length === 0) return toast.error('No subscribers to export');

        const csvContent = "data:text/csv;charset=utf-8,"
            + "Email,Status,Subscribed Date\n"
            + subscribers.map(s => `${s.email},${s.status},${s.created_at}`).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "subscribers.csv");
        document.body.appendChild(link);
        link.click();
        toast.success('Export started');
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-gray-900">Newsletter</h1>
                    <p className="text-gray-500 mt-1">Manage detailed subscriber lists and campaigns</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold transition-all shadow-sm"
                    >
                        <Download size={20} /> Export CSV
                    </button>
                    <button
                        className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-primary/30 active:scale-95"
                    >
                        <Send size={20} /> New Campaign
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <Users size={24} />
                        </div>
                        <span className="text-xs font-bold uppercase text-gray-400">Total</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{subscribers?.length || 0}</div>
                    <div className="text-sm text-gray-500 mt-1">Active Subscribers</div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                            <CheckCircle size={24} />
                        </div>
                        <span className="text-xs font-bold uppercase text-gray-400">Rate</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">24%</div>
                    <div className="text-sm text-gray-500 mt-1">Avg. Warning Rate</div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                            <Send size={24} />
                        </div>
                        <span className="text-xs font-bold uppercase text-gray-400">Sent</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">12</div>
                    <div className="text-sm text-gray-500 mt-1">Campaigns this month</div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search subscribers..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</th>
                                <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Joined Date</th>
                                <th className="text-right py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {subscribers?.length > 0 ? subscribers.map((sub) => (
                                <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="py-4 px-6 font-medium text-gray-900">{sub.email}</td>
                                    <td className="py-4 px-6">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 capitalize">
                                            {sub.status || 'Active'}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-sm text-gray-500">
                                        {format(new Date(sub.created_at || Date.now()), 'MMM d, yyyy')}
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <button className="text-gray-400 hover:text-red-600 transition-colors">Unsubscribe</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="py-12 text-center text-gray-500">
                                        No subscribers found in database.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default NewsletterManager;
