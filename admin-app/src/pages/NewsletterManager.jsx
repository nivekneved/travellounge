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
 Trash2
} from 'lucide-react';
import { format } from 'date-fns';

const NewsletterManager = () => {
 const [searchTerm, setSearchTerm] = useState('');
 const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
 const queryClient = useQueryClient();

 const { data: subscribers = [], isLoading, isError, error: queryError } = useQuery({
 queryKey: ['newsletter'],
 queryFn: async () => {
 const { data, error } = await supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false });
 if (error) {
 if (error.code === '42P01') return []; // Table doesn't exist
 if (error.code === '42703') { // Column doesn't exist
 const { data: fallbackData, error: fallbackError } = await supabase.from('newsletter_subscribers').select('*');
 if (fallbackError) throw fallbackError;
 return fallbackData;
 }
 throw error;
 };
 return data;
 }
 });

 const filteredAndSortedSubscribers = subscribers.filter(sub => {
 const searchStr = searchTerm.toLowerCase();
 return sub.email?.toLowerCase().includes(searchStr);
 }).sort((a, b) => {
 const key = sortConfig.key;
 let valA = a[key] ?? '';
 let valB = b[key] ?? '';

 if (typeof valA === 'string' && typeof valB === 'string') {
 return sortConfig.direction === 'asc'
 ? valA.localeCompare(valB)
 : valB.localeCompare(valA);
 }

 return sortConfig.direction === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
 });

 React.useEffect(() => {
 if (isError && queryError) {
 toast.error(`Failed to load subscribers: ${queryError.message}`);
 }
 }, [isError, queryError]);

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

 const handleDelete = (id) => {
 if (window.confirm('Are you sure you want to remove this subscriber?')) {
 deleteMutation.mutate(id);
 }
 };

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

 return (
 <div className="space-y-8">
 {/* Header */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
 <div>
 <h1 className="text-3xl font-black text-gray-900 tracking-tight ">Newsletter</h1>
 <p className="text-gray-500 font-medium">Manage detailed subscriber lists and campaigns</p>
 </div>
 <div className="flex gap-3">
 <button
 onClick={handleExport}
 className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-6 py-4 rounded-2xl font-black transition-all border border-gray-100 shadow-sm active:scale-95 group text-xs uppercase tracking-widest"
 >
 <Download size={16} className="group-hover:translate-y-0.5 transition-transform" />
 <span>Export CSV</span>
 </button>
 <button
 className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-xl shadow-red-600/20 active:scale-95 group text-xs uppercase tracking-widest"
 >
 <Send size={16} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
 <span>New Campaign</span>
 </button>
 </div>
 </div>

 {/* Stats Cards */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 group hover:border-red-100 transition-colors">
 <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
 <Users size={28} />
 </div>
 <div>
 <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Audience</p>
 <h3 className="text-3xl font-black text-gray-900">{subscribers?.length || 0}</h3>
 </div>
 </div>

 <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 group hover:border-red-100 transition-colors">
 <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
 <CheckCircle size={28} />
 </div>
 <div>
 <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Open Rate</p>
 <h3 className="text-3xl font-black text-gray-900">24%</h3>
 </div>
 </div>

 <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 group hover:border-red-100 transition-colors">
 <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
 <Send size={28} />
 </div>
 <div>
 <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Campaigns</p>
 <h3 className="text-3xl font-black text-gray-900">12</h3>
 </div>
 </div>
 </div>

 {/* DataTable Search */}
 <div className="bg-white p-4 border border-gray-100 rounded-2xl shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
 <div className="relative flex-1 max-w-2xl w-full">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
 <input
 type="text"
 placeholder="Search subscribers by email address..."
 className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:bg-white focus:border-red-500 outline-none transition-all font-bold text-sm"
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 />
 </div>
 <div className="flex items-center gap-2 text-gray-400 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
 <span className="text-xs font-black uppercase tracking-widest">Live Updates</span>
 </div>
 </div>

 {/* DataTable */}
 <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse table-fixed">
 <colgroup>
 <col className="w-[450px]" />
 <col className="w-[180px]" />
 <col className="w-[200px]" />
 <col className="w-[170px]" />
 </colgroup>
 <thead>
 <tr className="border-b border-gray-100 align-middle bg-gray-50/50">
 <th
 className="py-5 px-6 text-[10px] font-black text-red-600 uppercase tracking-[0.2em] cursor-pointer hover:bg-red-50/50 transition-colors"
 onClick={() => setSortConfig({ key: 'email', direction: sortConfig.key === 'email' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
 >
 <div className="flex items-center gap-2">
 Email Address
 <ArrowUpDown size={12} className={sortConfig.key === 'email' ? 'opacity-100' : 'opacity-20'} />
 </div>
 </th>
 <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Status</th>
 <th
 className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] cursor-pointer hover:bg-gray-100/50 transition-colors"
 onClick={() => setSortConfig({ key: 'created_at', direction: sortConfig.key === 'created_at' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
 >
 <div className="flex items-center gap-2">
 Joined Date
 <ArrowUpDown size={12} className={sortConfig.key === 'created_at' ? 'opacity-100' : 'opacity-20'} />
 </div>
 </th>
 <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100">
 {isLoading ? (
 <tr>
 <td colSpan="4" className="py-24 text-center">
 <div className="flex flex-col items-center gap-4">
 <div className="w-12 h-12 border-4 border-red-100 border-t-red-600 rounded-full animate-spin"></div>
 <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Loading Audience...</p>
 </div>
 </td>
 </tr>
 ) : filteredAndSortedSubscribers.length === 0 ? (
 <tr>
 <td colSpan="4" className="py-32 text-center">
 <div className="flex flex-col items-center justify-center gap-4">
 <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
 <SearchX size={40} />
 </div>
 <div>
 <p className="text-gray-900 font-black text-lg">No subscribers found</p>
 <p className="text-gray-400 text-sm font-medium">Try adjusting your search criteria</p>
 </div>
 </div>
 </td>
 </tr>
 ) : (
 filteredAndSortedSubscribers.map((sub) => (
 <tr key={sub.id} className="transition-all hover:bg-red-50/20 group animate-in fade-in slide-in-from-bottom-2 duration-300">
 <td className="py-6 px-6">
 <div className="flex items-center gap-4">
 <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-red-50 group-hover:text-red-500 transition-colors font-black">
 {sub.email.charAt(0).toUpperCase()}
 </div>
 <span className="font-black text-gray-900 truncate tracking-tight text-base group-hover:text-red-600 transition-colors uppercase">{sub.email}</span>
 </div>
 </td>
 <td className="py-6 px-4 text-center">
 <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${sub.status === 'Unsubscribed'
 ? 'bg-gray-100 text-gray-500 border-gray-200'
 : 'bg-green-50 text-green-700 border-green-100'
 }`}>
 {sub.status !== 'Unsubscribed' && <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2 animate-pulse"></span>}
 {sub.status || 'Active'}
 </span>
 </td>
 <td className="py-6 px-4">
 <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
 <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
 <Calendar size={14} />
 </div>
 <span>{sub.created_at ? format(new Date(sub.created_at), 'MMM d, yyyy') : 'N/A'}</span>
 </div>
 </td>
 <td className="py-6 px-6 text-right">
 <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
 <button
 className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 hover:bg-red-50 rounded-xl transition-all font-black text-[10px] uppercase tracking-wider border border-red-100 shadow-sm"
 onClick={() => handleDelete(sub.id)}
 >
 <Trash2 size={14} /> Del
 </button>
 <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
 <ChevronRight size={16} />
 </div>
 </div>
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 );
};

export default NewsletterManager;
