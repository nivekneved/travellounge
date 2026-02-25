import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';
import { toast } from 'react-hot-toast';
import {
 Plus,
 Edit2,
 Trash2,
 Save,
 X,
 Calendar,
 Link as LinkIcon,
 Search,
 ArrowUpDown,
 TrendingUp,
 Zap,
 Tag,
 SearchX,
 Image as ImageIcon,
 Clock
} from 'lucide-react';

const PromotionManager = () => {
 const [isEditing, setIsEditing] = useState(false);
 const [editingId, setEditingId] = useState(null);
 const [searchTerm, setSearchTerm] = useState('');
 const [sortConfig, setSortConfig] = useState({ key: 'title', direction: 'asc' });
 const [formData, setFormData] = useState({
 title: '',
 description: '',
 image: '',
 link: '',
 valid_until: '',
 is_active: true
 });

 const queryClient = useQueryClient();

 // Fetch promotions
 const { data: promotions = [], isLoading, isError, error: queryError } = useQuery({
 queryKey: ['promotions'],
 queryFn: async () => {
 const { data, error } = await supabase
 .from('promotions')
 .select('*')
 .order('created_at', { ascending: false });

 if (error) throw error;
 return data;
 }
 });
 const filteredAndSortedPromotions = useMemo(() => {
 return promotions.filter(p => {
 const searchStr = (searchTerm || '').toLowerCase();
 return (
 p.title?.toLowerCase().includes(searchStr) ||
 p.description?.toLowerCase().includes(searchStr)
 );
 }).sort((a, b) => {
 const key = sortConfig.key;
 const valA = a[key]?.toString().toLowerCase() || '';
 const valB = b[key]?.toString().toLowerCase() || '';

 return sortConfig.direction === 'asc'
 ? valA.localeCompare(valB)
 : valB.localeCompare(valA);
 });
 }, [promotions, searchTerm, sortConfig]);

 const expiringSoonCount = useMemo(() => {
 const weekFromNow = new Date().getTime() + 7 * 24 * 60 * 60 * 1000;
 return promotions.filter(p => p.valid_until && new Date(p.valid_until).getTime() < weekFromNow).length;
 }, [promotions]);

 React.useEffect(() => {
 if (isError && queryError) {
 toast.error(`Failed to load promotions: ${queryError.message}`);
 }
 }, [isError, queryError]);

 // Mutations
 const createMutation = useMutation({
 mutationFn: async (newPromo) => {
 const { data, error } = await supabase.from('promotions').insert([newPromo]).select();
 if (error) throw error;
 return data;
 },
 onSuccess: () => {
 queryClient.invalidateQueries(['promotions']);
 toast.success('Promotion created successfully!');
 resetForm();
 },
 onError: (error) => toast.error(`Error: ${error.message}`)
 });

 const updateMutation = useMutation({
 mutationFn: async ({ id, updates }) => {
 const { data, error } = await supabase.from('promotions').update(updates).eq('id', id).select();
 if (error) throw error;
 return data;
 },
 onSuccess: () => {
 queryClient.invalidateQueries(['promotions']);
 toast.success('Promotion updated successfully!');
 resetForm();
 },
 onError: (error) => toast.error(`Error: ${error.message}`)
 });

 const deleteMutation = useMutation({
 mutationFn: async (id) => {
 const { error } = await supabase.from('promotions').delete().eq('id', id);
 if (error) throw error;
 },
 onSuccess: () => {
 queryClient.invalidateQueries(['promotions']);
 toast.success('Promotion deleted successfully!');
 },
 onError: (error) => toast.error(`Error: ${error.message}`)
 });

 const toggleActiveMutation = useMutation({
 mutationFn: async ({ id, is_active }) => {
 const { error } = await supabase.from('promotions').update({ is_active: !is_active }).eq('id', id);
 if (error) throw error;
 },
 onSuccess: () => {
 queryClient.invalidateQueries(['promotions']);
 toast.success('Status updated!');
 }
 });

 const handleSubmit = (e) => {
 e.preventDefault();
 if (editingId) {
 updateMutation.mutate({ id: editingId, updates: formData });
 } else {
 createMutation.mutate(formData);
 }
 };

 const handleEdit = (promo) => {
 setEditingId(promo.id);
 setFormData({
 title: promo.title,
 description: promo.description || '',
 image: promo.image || '',
 link: promo.link || '',
 valid_until: promo.valid_until ? promo.valid_until.split('T')[0] : '',
 is_active: promo.is_active
 });
 setIsEditing(true);
 };

 const handleDelete = (id) => {
 if (window.confirm('Are you sure you want to delete this promotion?')) {
 deleteMutation.mutate(id);
 }
 };

 const resetForm = () => {
 setFormData({
 title: '',
 description: '',
 image: '',
 link: '',
 valid_until: '',
 is_active: true
 });
 setEditingId(null);
 setIsEditing(false);
 };

 if (isLoading) {
 return <div className="flex items-center justify-center py-20 animate-pulse text-red-500 font-black uppercase tracking-widest text-[10px]">Synchronizing Marketing Offers...</div>;
 }

 return (
 <div className="space-y-8">
 {/* Header & Controls */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
 <div>
 <h1 className="text-3xl font-black text-gray-900 tracking-tight ">Campaign Center</h1>
 <p className="text-gray-500 font-medium">Manage seasonal offers, marketing banners and promotional links</p>
 </div>

 <div className="flex items-center gap-4">
 <button
 onClick={() => setIsEditing(!isEditing)}
 className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-xl shadow-red-600/20 active:scale-95 group"
 >
 {isEditing ? <X size={22} /> : <Plus size={22} className="group-hover:rotate-90 transition-transform" />}
 <span>{isEditing ? 'Close Campaigner' : 'New Promotion'}</span>
 </button>
 </div>
 </div>

 {!isEditing && (
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 group hover:border-red-100 transition-colors">
 <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
 <TrendingUp size={28} />
 </div>
 <div>
 <p className="text-sm font-bold text-gray-400 uppercase tracking-widest" >Live Campaigns</p>
 <h3 className="text-3xl font-black text-gray-900" >{promotions.filter(p => p.is_active).length}</h3>
 </div>
 </div>
 <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 group hover:border-red-100 transition-colors">
 <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
 <Zap size={28} />
 </div>
 <div>
 <p className="text-sm font-bold text-gray-400 uppercase tracking-widest" >Total Offers</p>
 <h3 className="text-3xl font-black text-gray-900" >{promotions.length}</h3>
 </div>
 </div>
 <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 group hover:border-red-100 transition-colors">
 <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
 <Tag size={28} />
 </div>
 <div>
 <p className="text-sm font-bold text-gray-400 uppercase tracking-widest" >Expiring Soon</p>
 <h3 className="text-3xl font-black text-gray-900" >{expiringSoonCount}</h3>
 </div>
 </div>
 </div>
 )}

 {!isEditing && (
 <div className="bg-white p-4 border border-gray-100 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
 <div className="relative flex-1 max-w-2xl w-full">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
 <input
 type="text"
 placeholder="Search campaigns by title or description..."
 className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:bg-white focus:border-red-500 outline-none transition-all font-bold text-sm"
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 />
 </div>
 <div className="flex items-center gap-4 text-gray-400 bg-gray-50 px-5 py-3 rounded-xl border border-gray-100">
 <span className="text-xs font-black uppercase tracking-widest" >Promotion Ledger</span>
 </div>
 </div>
 )}

 {/* Form Modal */}
 {isEditing && (
 <div className="space-y-8 animate-fade-in">
 <div className="max-w-6xl mx-auto w-full">
 <div className="px-8 pt-4 pb-16">
 <div className="flex items-center justify-between mb-16 px-4">
 <div className="flex items-center gap-6">
 <div className="p-4 bg-indigo-50 rounded-3xl text-indigo-600 shadow-sm border border-indigo-100">
 <Tag size={32} />
 </div>
 <div>
 <h2 className="text-4xl font-display font-bold text-slate-900 tracking-tight ">
 {editingId ? 'Edit Campaign' : 'Initiate Promotion'}
 </h2>
 <p className="text-lg text-slate-400 font-medium mt-1">Configure discount parameters and campaign reach</p>
 </div>
 </div>
 <button onClick={() => setIsEditing(false)} className="p-4 hover:bg-slate-50 rounded-2xl transition-all text-slate-400 hover:text-slate-900 shadow-sm border border-slate-100">
 <X size={24} />
 </button>
 </div>
 <div className="px-4">
 <form onSubmit={handleSubmit} className="space-y-6">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="space-y-4" >
 <div>
 <label className="block text-sm font-bold text-gray-700 mb-2">Campaign Title *</label>
 <input
 type="text" required
 value={formData.title}
 onChange={(e) => setFormData({ ...formData, title: e.target.value })}
 className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white outline-none transition-all font-bold text-sm"
 />
 </div>
 <div>
 <label className="block text-sm font-bold text-gray-700 mb-2">Campaign Brief</label>
 <textarea
 value={formData.description}
 onChange={(e) => setFormData({ ...formData, description: e.target.value })}
 rows="4"
 className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white outline-none transition-all font-bold text-sm"
 />
 </div>
 </div>

 <div className="space-y-4" >
 <div>
 <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
 <ImageIcon size={14} className="text-red-500" /> Asset URL
 </label>
 <input
 type="url"
 value={formData.image}
 onChange={(e) => setFormData({ ...formData, image: e.target.value })}
 className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white outline-none transition-all font-bold text-sm"
 placeholder="https://..."
 />
 </div>
 <div>
 <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
 <LinkIcon size={14} className="text-red-500" /> Redemption Link
 </label>
 <input
 type="text"
 value={formData.link}
 onChange={(e) => setFormData({ ...formData, link: e.target.value })}
 className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white outline-none transition-all font-bold text-sm"
 placeholder="/offers/special"
 />
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
 <Calendar size={14} className="text-red-500" /> Expiry Date
 </label>
 <input
 type="date"
 value={formData.valid_until}
 onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
 className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white outline-none transition-all font-bold text-sm"
 />
 </div>
 <div className="flex items-center pt-8">
 <button
 type="button"
 onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
 className="flex items-center gap-3 group px-4 py-2 hover:bg-gray-50 rounded-xl transition-all"
 >
 <div className={`w-12 h-6 rounded-full p-1 transition-all ${formData.is_active ? 'bg-red-500 shadow-lg shadow-red-500/30' : 'bg-gray-300'}`}>
 <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${formData.is_active ? 'translate-x-6' : 'translate-x-0'}`} />
 </div>
 <span className="text-xs font-black uppercase tracking-widest text-gray-700">Live Status</span>
 </button>
 </div>
 </div>
 </div>
 </div>

 <div className="flex gap-4 pt-8 border-t border-gray-50">
 <button
 type="submit"
 disabled={createMutation.isPending || updateMutation.isPending}
 className="flex-1 flex items-center justify-center gap-3 bg-red-600 text-white px-8 py-4 rounded-2xl hover:bg-red-700 transition-all font-black uppercase tracking-widest text-xs shadow-xl shadow-red-600/20 active:scale-95"
 >
 <Save size={18} />
 {editingId ? 'Authorize Updates' : 'Launch Campaign'}
 </button>
 <button
 type="button"
 onClick={resetForm}
 className="px-8 py-4 bg-gray-100 text-gray-500 rounded-2xl hover:bg-gray-200 transition-all font-black uppercase tracking-widest text-xs"
 >
 Cancel
 </button>
 </div>
 </form>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* Standardized Full Width Table */}
 {!isEditing && (
 <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse table-fixed">
 <colgroup>
 <col className="w-[300px]" />
 <col className="w-[350px]" />
 <col className="w-[150px]" />
 <col className="w-[150px]" />
 <col className="w-[180px]" />
 </colgroup>
 <thead>
 <tr className="border-b border-gray-100 align-middle bg-gray-50/50">
 <th
 className="py-5 px-6 text-[10px] font-black text-red-600 uppercase tracking-[0.2em] cursor-pointer hover:bg-red-50/50 transition-colors"
 onClick={() => setSortConfig({ key: 'title', direction: sortConfig.key === 'title' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
 >
 <div className="flex items-center gap-2">
 Campaign Title
 <ArrowUpDown size={12} className={sortConfig.key === 'title' ? 'opacity-100' : 'opacity-20'} />
 </div>
 </th>
 <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]" >Offer Details</th>
 <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center" >Status</th>
 <th
 className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center cursor-pointer hover:bg-gray-100/50 transition-colors"
 onClick={() => setSortConfig({ key: 'valid_until', direction: sortConfig.key === 'valid_until' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
 >
 <div className="flex items-center justify-center gap-2">
 Timeline
 <ArrowUpDown size={12} className={sortConfig.key === 'valid_until' ? 'opacity-100' : 'opacity-20'} />
 </div>
 </th>
 <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right" >Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-50">
 {filteredAndSortedPromotions.length === 0 ? (
 <tr>
 <td colSpan="5" className="py-24 text-center">
 <div className="flex flex-col items-center justify-center gap-4">
 <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-300">
 <SearchX size={40} />
 </div>
 <div className="space-y-1">
 <h3 className="text-lg font-black text-gray-900 " >No Offer Matches</h3>
 <p className="text-xs font-bold text-gray-400 uppercase tracking-widest" >Try broading your campaign search</p>
 </div>
 <button onClick={() => setSearchTerm('')} className="mt-2 text-red-600 font-black text-xs uppercase tracking-[0.2em] hover:tracking-[0.3em] transition-all" >Clear Filters</button>
 </div>
 </td>
 </tr>
 ) : (
 filteredAndSortedPromotions.map((promo) => (
 <tr key={promo.id} className="transition-all even:bg-gray-50/50 hover:bg-gray-50 align-top group transition-colors">
 <td className="py-6 px-6">
 <div className="flex items-center gap-3">
 <div className="w-16 h-10 rounded-xl bg-gray-100 overflow-hidden border border-gray-50 shadow-sm shrink-0 transition-transform group-hover:scale-105" >
 {promo.image ? <img src={promo.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={14} /></div>}
 </div>
 <div className="flex flex-col min-w-0" >
 <span className="font-black text-gray-900 truncate text-sm " >{promo.title}</span>
 <div className="flex items-center gap-1.5 text-blue-500 font-bold text-[10px]" >
 <LinkIcon size={10} />
 <span className="truncate">{promo.link || 'Internal Route'}</span>
 </div>
 </div>
 </div>
 </td>
 <td className="py-6 px-6">
 <p className="text-xs text-gray-500 font-bold leading-relaxed line-clamp-2 " title={promo.description}>{promo.description || 'No campaign brief provided for this offer.'}</p>
 </td>
 <td className="py-6 px-6 text-center">
 <button
 onClick={() => toggleActiveMutation.mutate({ id: promo.id, is_active: promo.is_active })}
 className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${promo.is_active ? 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100' : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100'
 }`}
 >
 {promo.is_active ? 'Live' : 'Draft'}
 </button>
 </td>
 <td className="py-6 px-6 text-center">
 <div className="flex flex-col items-center gap-1" >
 <div className="flex items-center gap-1.5 text-gray-500 font-black text-[11px] " >
 <Clock size={12} className="text-red-500" />
 {promo.valid_until ? new Date(promo.valid_until).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'Always'}
 </div>
 {promo.valid_until && (
 <span className={`text-[9px] font-bold uppercase tracking-tighter ${new Date(promo.valid_until) < new Date() ? 'text-red-500' : 'text-gray-400'}`}>
 {new Date(promo.valid_until) < new Date() ? 'Expired' : 'Valid Offer'}
 </span>
 )}
 </div>
 </td>
 <td className="py-6 px-6 text-right">
 <div className="flex items-center justify-end gap-1.5">
 <button
 onClick={() => handleEdit(promo)}
 className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-black"
 title="Edit"
 >
 <Edit2 size={16} />
 </button>
 <button
 onClick={() => handleDelete(promo.id)}
 className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all font-black"
 title="Delete"
 >
 <Trash2 size={16} />
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
 )}
 </div>
 );
};

export default PromotionManager;
