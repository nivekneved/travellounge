import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { toast } from 'react-hot-toast';
import { Star, CheckCircle, XCircle, User, MessageSquare, Loader2, Search, ArrowUpDown, Trash2 } from 'lucide-react';

const ReviewModerator = () => {
 const [reviews, setReviews] = useState([]);
 const [loading, setLoading] = useState(false);
 const [searchTerm, setSearchTerm] = useState('');
 const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });

 useEffect(() => {
 fetchReviews();
 }, []);

 const fetchReviews = async () => {
 setLoading(true);
 try {
 const { data, error } = await supabase
 .from('reviews')
 .select('*')
 .order('created_at', { ascending: false });

 if (error) throw error;
 setReviews(data || []);
 } catch (error) {
 toast.error(`Error fetching reviews: ${error.message}`);
 } finally {
 setLoading(false);
 }
 };

 const deleteReview = async (id) => {
 if (!window.confirm('Are you sure you want to delete this review?')) return;
 try {
 const { error } = await supabase.from('reviews').delete().eq('id', id);
 if (error) throw error;
 toast.success('Review deleted');
 fetchReviews();
 } catch (error) {
 toast.error(`Error deleting review: ${error.message}`);
 }
 };

 const filteredAndSortedReviews = reviews.filter(r => {
 const searchStr = searchTerm.toLowerCase();
 return (
 r.customer_name?.toLowerCase().includes(searchStr) ||
 r.comment?.toLowerCase().includes(searchStr) ||
 r.status?.toLowerCase().includes(searchStr)
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

 const moderateReview = async (id, status) => {
 try {
 const { error } = await supabase
 .from('reviews')
 .update({ status })
 .eq('id', id);

 if (error) throw error;

 toast.success(`Review ${status}`);
 fetchReviews();
 } catch (error) {
 toast.error(`Error updating review: ${error.message}`);
 }
 };

 return (
 <div className="space-y-6">
 <div>
 <h1 className="text-3xl font-bold">Review Moderation</h1>
 <p className="text-gray-500">Approve or reject customer feedback for public display.</p>
 </div>

 {/* DataTable Search */}
 <div className="bg-white p-4 border border-gray-100 rounded-2xl shadow-sm mb-6 max-w-2xl">
 <div className="relative">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
 <input
 type="text"
 placeholder="Search reviews by customer, comment, or status..."
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
 <col className="w-[120px]" />
 <col className="w-[350px]" />
 <col className="w-[120px]" />
 <col className="w-[200px]" />
 </colgroup>
 <thead>
 <tr className="border-b border-gray-100 align-middle">
 <th
 className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600 transition-colors"
 onClick={() => setSortConfig({ key: 'customer_name', direction: sortConfig.key === 'customer_name' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
 >
 <div className="flex items-center gap-2">
 Customer
 <ArrowUpDown size={12} className={sortConfig.key === 'customer_name' ? 'text-primary' : 'opacity-20'} />
 </div>
 </th>
 <th
 className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center cursor-pointer hover:text-gray-600 transition-colors"
 onClick={() => setSortConfig({ key: 'rating', direction: sortConfig.key === 'rating' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
 >
 <div className="flex items-center justify-center gap-2">
 Rating
 <ArrowUpDown size={12} className={sortConfig.key === 'rating' ? 'text-primary' : 'opacity-20'} />
 </div>
 </th>
 <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Comment</th>
 <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Status</th>
 <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-50">
 {loading ? (
 <tr>
 <td colSpan="5" className="py-20 text-center text-gray-400">
 <div className="flex justify-center items-center gap-2">
 <Loader2 size={16} className="animate-spin text-primary" /> Loading reviews...
 </div>
 </td>
 </tr>
 ) : reviews.length === 0 ? (
 <tr>
 <td colSpan="5" className="py-20 text-center text-gray-400 ">
 <div className="flex flex-col items-center gap-2">
 <MessageSquare size={32} className="text-gray-200" />
 <span>No reviews found in the system.</span>
 </div>
 </td>
 </tr>
 ) : (
 filteredAndSortedReviews.map((review) => (
 <tr key={review.id} className="transition-all even:bg-gray-50/50 hover:bg-gray-50 align-top group transition-colors">
 <td className="py-4 px-4">
 <div className="flex items-center gap-3">
 <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
 <User size={14} className="text-gray-400" />
 </div>
 <div className="flex flex-col min-w-0">
 <span className="font-bold text-gray-900 truncate ">{review.customer_name || 'Anonymous'}</span>
 <span className="text-[10px] text-gray-400 font-mono uppercase tracking-tight">{new Date(review.created_at).toLocaleDateString()}</span>
 </div>
 </div>
 </td>
 <td className="py-4 px-4">
 <div className="flex justify-center gap-0.5 text-yellow-500">
 {[...Array(5)].map((_, i) => (
 <Star key={i} size={10} fill={i < (review.rating || 0) ? 'currentColor' : 'none'} strokeWidth={i < (review.rating || 0) ? 0 : 2} />
 ))}
 </div>
 </td>
 <td className="py-4 px-4">
 <p className="text-sm text-gray-600 truncate" title={review.comment}>"{review.comment}"</p>
 </td>
 <td className="py-4 px-4 text-center">
 <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${review.status === 'approved' ? 'bg-green-100 text-green-700 border-green-200' :
 review.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-200' :
 'bg-yellow-100 text-yellow-700 border-yellow-200'
 }`}>
 {review.status}
 </span>
 </td>
 <td className="py-4 px-4 text-right">
 <div className="flex items-center justify-end gap-1.5">
 {review.status !== 'approved' && (
 <button
 onClick={() => moderateReview(review.id, 'approved')}
 className="flex items-center gap-1.5 px-3 py-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-all font-bold text-xs"
 >
 <CheckCircle size={14} /> Approve
 </button>
 )}
 {review.status !== 'rejected' && (
 <button
 onClick={() => moderateReview(review.id, 'rejected')}
 className="flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all font-bold text-xs"
 >
 <XCircle size={14} /> Reject
 </button>
 )}
 <button
 onClick={() => deleteReview(review.id)}
 className="flex items-center gap-1.5 px-3 py-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all font-bold text-xs"
 title="Delete Review"
 >
 <Trash2 size={14} />
 </button>
 </div>
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 </div>
 );
};

export default ReviewModerator;
