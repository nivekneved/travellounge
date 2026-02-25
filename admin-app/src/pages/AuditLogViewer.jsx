import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { History, User, Terminal, Loader2, Search, ArrowUpDown } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AuditLogViewer = () => {
 const [logs, setLogs] = useState([]);
 const [loading, setLoading] = useState(false);
 const [searchTerm, setSearchTerm] = useState('');
 const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });

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

 const filteredAndSortedLogs = logs.filter(log => {
 const searchStr = searchTerm.toLowerCase();
 return (
 log.performer?.toLowerCase().includes(searchStr) ||
 log.action?.toLowerCase().includes(searchStr) ||
 log.details?.toLowerCase().includes(searchStr)
 );
 }).sort((a, b) => {
 const key = sortConfig.key;
 const valA = a[key];
 const valB = b[key];

 if (typeof valA === 'string' && typeof valB === 'string') {
 return sortConfig.direction === 'asc'
 ? valA.localeCompare(valB)
 : valB.localeCompare(valA);
 }

 return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
 });

 return (
 <div className="space-y-6">
 <div>
 <h1 className="text-3xl font-bold">Audit Logs</h1>
 <p className="text-gray-500">Track all administrative actions and system events (Bookings Feed).</p>
 </div>

 {/* DataTable Search */}
 <div className="bg-white p-4 border border-gray-100 rounded-2xl shadow-sm mb-6 max-w-2xl">
 <div className="relative">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
 <input
 type="text"
 placeholder="Search logs by performer, action, or details..."
 className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all font-bold text-sm"
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 />
 </div>
 </div>

 {/* Standardized Full Width Table */}
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse table-fixed">
 <colgroup>
 <col className="w-[180px]" />
 <col className="w-[200px]" />
 <col className="w-[150px]" />
 <col className="w-[400px]" />
 </colgroup>
 <thead>
 <tr className="border-b border-gray-100 align-middle">
 <th
 className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600 transition-colors"
 onClick={() => setSortConfig({ key: 'created_at', direction: sortConfig.key === 'created_at' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
 >
 <div className="flex items-center gap-2">
 Timestamp
 <ArrowUpDown size={12} className={sortConfig.key === 'created_at' ? 'text-primary' : 'opacity-20'} />
 </div>
 </th>
 <th
 className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600 transition-colors"
 onClick={() => setSortConfig({ key: 'performer', direction: sortConfig.key === 'performer' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
 >
 <div className="flex items-center gap-2">
 Performer
 <ArrowUpDown size={12} className={sortConfig.key === 'performer' ? 'text-primary' : 'opacity-20'} />
 </div>
 </th>
 <th
 className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center cursor-pointer hover:text-gray-600 transition-colors"
 onClick={() => setSortConfig({ key: 'action', direction: sortConfig.key === 'action' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
 >
 <div className="flex items-center justify-center gap-2">
 Action
 <ArrowUpDown size={12} className={sortConfig.key === 'action' ? 'text-primary' : 'opacity-20'} />
 </div>
 </th>
 <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Details</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-50">
 {loading ? (
 <tr>
 <td colSpan="4" className="py-20 text-center text-gray-400">
 <div className="flex justify-center items-center gap-2">
 <Loader2 size={16} className="animate-spin text-primary" /> Loading system logs...
 </div>
 </td>
 </tr>
 ) : (
 filteredAndSortedLogs.map((log) => (
 <tr key={log.id} className="transition-all even:bg-gray-50/50 hover:bg-gray-50 align-top group transition-colors">
 <td className="py-4 px-4 text-[10px] font-mono text-gray-400 uppercase tracking-tight">
 {new Date(log.created_at).toLocaleString()}
 </td>
 <td className="py-4 px-4">
 <div className="flex items-center gap-2 text-gray-900 font-bold ">
 <User size={14} className="text-primary shrink-0" />
 <span className="text-sm truncate">{log.performer}</span>
 </div>
 </td>
 <td className="py-4 px-4 text-center">
 <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${log.action.includes('NEW') ? 'bg-green-100 text-green-700 border-green-200' : 'bg-blue-100 text-blue-700 border-blue-200'
 }`}>
 {log.action}
 </span>
 </td>
 <td className="py-4 px-4">
 <div className="text-sm text-gray-600 font-mono truncate hover:whitespace-normal transition-all" title={log.details}>
 {log.details}
 </div>
 </td>
 </tr>
 ))
 )}
 {!loading && filteredAndSortedLogs.length === 0 && (
 <tr>
 <td colSpan="4" className="py-20 text-center text-gray-400 ">No logs found matching your criteria.</td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 );
};

export default AuditLogViewer;
