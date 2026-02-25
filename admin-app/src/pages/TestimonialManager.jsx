import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';
import { toast } from 'react-hot-toast';
import { Plus, Edit2, Trash2, Save, X, Star, Search, ArrowUpDown, TrendingUp, UserCheck, MessageSquare, SearchX, Quote } from 'lucide-react';

const TestimonialManager = () => {
 const [isEditing, setIsEditing] = useState(false);
 const [editingId, setEditingId] = useState(null);
 const [searchTerm, setSearchTerm] = useState('');
 const [sortConfig, setSortConfig] = useState({ key: 'customer_name', direction: 'asc' });
 const [formData, setFormData] = useState({
 customer_name: '',
 avatar_url: '',
 rating: 5,
 content: '',
 is_featured: false,
 is_approved: true,
 display_order: 0
 });

 const queryClient = useQueryClient();

 // Fetch testimonials
 const { data: testimonials = [], isLoading, isError, error: queryError } = useQuery({
 queryKey: ['testimonials'],
 queryFn: async () => {
 const { data, error } = await supabase
 .from('testimonials')
 .select('*')
 .order('display_order', { ascending: true });

 if (error) throw error;
 return data;
 }
 });

 const filteredAndSortedTestimonials = testimonials.filter(t => {
 const searchStr = searchTerm.toLowerCase();
 return (
 t.customer_name?.toLowerCase().includes(searchStr) ||
 t.content?.toLowerCase().includes(searchStr)
 );
 }).sort((a, b) => {
 const key = sortConfig.key;
 const valA = a[key] || '';
 const valB = b[key] || '';

 if (typeof valA === 'string' && typeof valB === 'string') {
 return sortConfig.direction === 'asc'
 ? valA.localeCompare(valB)
 : valB.localeCompare(valA);
 }

 return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
 });

 React.useEffect(() => {
 if (isError && queryError) {
 toast.error(`Failed to load testimonials: ${queryError.message}`);
 }
 }, [isError, queryError]);

 // Create mutation
 const createMutation = useMutation({
 mutationFn: async (newTestimonial) => {
 const { data, error } = await supabase
 .from('testimonials')
 .insert([newTestimonial])
 .select();

 if (error) throw error;
 return data;
 },
 onSuccess: () => {
 queryClient.invalidateQueries(['testimonials']);
 toast.success('Testimonial created successfully!');
 resetForm();
 },
 onError: (error) => {
 toast.error(`Error: ${error.message}`);
 }
 });

 // Update mutation
 const updateMutation = useMutation({
 mutationFn: async ({ id, updates }) => {
 const { data, error } = await supabase
 .from('testimonials')
 .update(updates)
 .eq('id', id)
 .select();

 if (error) throw error;
 return data;
 },
 onSuccess: () => {
 queryClient.invalidateQueries(['testimonials']);
 toast.success('Testimonial updated successfully!');
 resetForm();
 },
 onError: (error) => {
 toast.error(`Error: ${error.message}`);
 }
 });

 // Delete mutation
 const deleteMutation = useMutation({
 mutationFn: async (id) => {
 const { error } = await supabase
 .from('testimonials')
 .delete()
 .eq('id', id);

 if (error) throw error;
 },
 onSuccess: () => {
 queryClient.invalidateQueries(['testimonials']);
 toast.success('Testimonial deleted successfully!');
 },
 onError: (error) => {
 toast.error(`Error: ${error.message}`);
 }
 });

 // Toggle approved status
 const toggleApprovedMutation = useMutation({
 mutationFn: async ({ id, is_approved }) => {
 const { error } = await supabase
 .from('testimonials')
 .update({ is_approved: !is_approved })
 .eq('id', id);

 if (error) throw error;
 },
 onSuccess: () => {
 queryClient.invalidateQueries(['testimonials']);
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

 const handleEdit = (testimonial) => {
 setEditingId(testimonial.id);
 setFormData({
 customer_name: testimonial.customer_name || '',
 avatar_url: testimonial.avatar_url || '',
 rating: testimonial.rating || 5,
 content: testimonial.content || '',
 is_featured: testimonial.is_featured || false,
 is_approved: testimonial.is_approved !== undefined ? testimonial.is_approved : true,
 display_order: testimonial.display_order || 0
 });
 setIsEditing(true);
 };

 const handleDelete = (id) => {
 if (window.confirm('Are you sure you want to delete this testimonial?')) {
 deleteMutation.mutate(id);
 }
 };

 const resetForm = () => {
 setFormData({
 customer_name: '',
 avatar_url: '',
 rating: 5,
 content: '',
 is_featured: false,
 is_approved: true,
 display_order: testimonials.length
 });
 setEditingId(null);
 setIsEditing(false);
 };

 if (isLoading) {
 return <div className="flex items-center justify-center h-64">Loading...</div>;
 }

 return (
 <div className="space-y-8">
 {/* Header & Controls */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
 <div>
 <h1 className="text-3xl font-black text-gray-900 tracking-tight ">Voice of Customer</h1>
 <p className="text-gray-500 font-medium">Manage client testimonials, star ratings, and publication status</p>
 </div>

 <div className="flex items-center gap-4">
 <button
 onClick={() => setIsEditing(!isEditing)}
 className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-xl shadow-red-600/20 active:scale-95 group"
 >
 {isEditing ? <X size={22} /> : <Plus size={22} className="group-hover:rotate-90 transition-transform" />}
 <span>{isEditing ? 'Cancel Edit' : 'Add New Review'}</span>
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
 <p className="text-sm font-bold text-gray-400 uppercase tracking-widest" >Total Reviews</p>
 <h3 className="text-3xl font-black text-gray-900" >{testimonials.length}</h3>
 </div>
 </div>
 <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 group hover:border-red-100 transition-colors">
 <div className="w-14 h-14 bg-yellow-50 rounded-2xl flex items-center justify-center text-yellow-600 group-hover:scale-110 transition-transform">
 <Star size={28} />
 </div>
 <div>
 <p className="text-sm font-bold text-gray-400 uppercase tracking-widest" >Featured</p>
 <h3 className="text-3xl font-black text-gray-900" >{testimonials.filter(t => t.is_featured).length}</h3>
 </div>
 </div>
 <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 group hover:border-red-100 transition-colors">
 <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
 <UserCheck size={28} />
 </div>
 <div>
 <p className="text-sm font-bold text-gray-400 uppercase tracking-widest" >Live Content</p>
 <h3 className="text-3xl font-black text-gray-900" >{testimonials.filter(t => t.is_approved).length}</h3>
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
 placeholder="Search by customer name or testimonial keywords..."
 className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:bg-white focus:border-red-500 outline-none transition-all font-bold text-sm"
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 />
 </div>
 <div className="flex items-center gap-4 text-gray-400 bg-gray-50 px-5 py-3 rounded-xl border border-gray-100">
 <span className="text-xs font-black uppercase tracking-widest" >Verified Feed</span>
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
 <div className="p-4 bg-amber-50 rounded-3xl text-amber-600 shadow-sm border border-amber-100">
 <Quote size={32} />
 </div>
 <div>
 <h2 className="text-4xl font-display font-bold text-slate-900 tracking-tight ">
 {editingId ? 'Modify Review' : 'New Testimonial'}
 </h2>
 <p className="text-lg text-slate-400 font-medium mt-1">Curate and validate customer experiences</p>
 </div>
 </div>
 <button onClick={() => setIsEditing(false)} className="p-4 hover:bg-slate-50 rounded-2xl transition-all text-slate-400 hover:text-slate-900 shadow-sm border border-slate-100">
 <X size={24} />
 </button>
 </div>
 <div className="px-4">
 <form onSubmit={handleSubmit} className="space-y-4">
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-bold text-gray-700 mb-2">
 Customer Name *
 </label>
 <input
 type="text"
 value={formData.customer_name}
 onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
 required
 />
 </div>
 <div>
 <label className="block text-sm font-bold text-gray-700 mb-2">
 Avatar URL
 </label>
 <input
 type="url"
 value={formData.avatar_url}
 onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
 placeholder="https://..."
 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
 />
 </div>
 </div>

 <div>
 <label className="block text-sm font-bold text-gray-700 mb-2">
 Rating (1-5 stars)
 </label>
 <div className="flex gap-2">
 {[1, 2, 3, 4, 5].map((star) => (
 <button
 key={star}
 type="button"
 onClick={() => setFormData({ ...formData, rating: star })}
 className="focus:outline-none"
 >
 <Star
 size={32}
 fill={star <= formData.rating ? '#DC2626' : 'none'}
 className={star <= formData.rating ? 'text-primary' : 'text-gray-300'}
 />
 </button>
 ))}
 </div>
 </div>

 <div>
 <label className="block text-sm font-bold text-gray-700 mb-2">
 Testimonial Content *
 </label>
 <textarea
 value={formData.content}
 onChange={(e) => setFormData({ ...formData, content: e.target.value })}
 rows="4"
 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
 required
 />
 </div>

 <div className="grid grid-cols-3 gap-4">
 <div>
 <label className="block text-sm font-bold text-gray-700 mb-2">
 Display Order
 </label>
 <input
 type="number"
 value={formData.display_order}
 onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
 />
 </div>
 <div className="flex items-center gap-3 pt-8">
 <input
 type="checkbox"
 id="is_featured"
 checked={formData.is_featured}
 onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
 className="w-5 h-5 text-primary rounded focus:ring-primary"
 />
 <label htmlFor="is_featured" className="text-sm font-bold text-gray-700">
 Featured
 </label>
 </div>
 <div className="flex items-center gap-3 pt-8">
 <input
 type="checkbox"
 id="is_approved"
 checked={formData.is_approved}
 onChange={(e) => setFormData({ ...formData, is_approved: e.target.checked })}
 className="w-5 h-5 text-primary rounded focus:ring-primary"
 />
 <label htmlFor="is_approved" className="text-sm font-bold text-gray-700">
 Approved
 </label>
 </div>
 </div>

 <div className="flex gap-4 pt-8 border-t border-gray-50">
 <button
 type="submit"
 className="flex-1 flex items-center justify-center gap-3 bg-red-600 text-white px-8 py-4 rounded-2xl hover:bg-red-700 transition-all font-black uppercase tracking-widest text-xs shadow-xl shadow-red-600/20 active:scale-95"
 >
 <Save size={18} />
 {editingId ? 'Commit Updates' : 'Publish Review'}
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

 {/* Testimonials List */}
 {/* Standardized Full Width Table */}
 {!isEditing && (
 <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse table-fixed">
 <colgroup>
 <col className="w-[200px]" />
 <col className="w-[350px]" />
 <col className="w-[120px]" />
 <col className="w-[120px]" />
 <col className="w-[180px]" />
 </colgroup>
 <thead>
 <tr className="border-b border-gray-100 align-middle bg-gray-50/50">
 <th
 className="py-5 px-6 text-[10px] font-black text-red-600 uppercase tracking-[0.2em] cursor-pointer hover:bg-red-50/50 transition-colors"
 onClick={() => setSortConfig({ key: 'customer_name', direction: sortConfig.key === 'customer_name' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
 >
 <div className="flex items-center gap-2">
 Client
 <ArrowUpDown size={12} className={sortConfig.key === 'customer_name' ? 'opacity-100' : 'opacity-20'} />
 </div>
 </th>
 <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]" >Sentiment</th>
 <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center" >Visibility</th>
 <th
 className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center cursor-pointer hover:bg-gray-100/50 transition-colors"
 onClick={() => setSortConfig({ key: 'is_featured', direction: sortConfig.key === 'is_featured' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
 >
 <div className="flex items-center justify-center gap-2">
 Priority
 <ArrowUpDown size={12} className={sortConfig.key === 'is_featured' ? 'opacity-100' : 'opacity-20'} />
 </div>
 </th>
 <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right" >Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-50">
 {filteredAndSortedTestimonials.length === 0 ? (
 <tr>
 <td colSpan="5" className="py-24 text-center">
 <div className="flex flex-col items-center justify-center gap-4">
 <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-300">
 <SearchX size={40} />
 </div>
 <div className="space-y-1">
 <h3 className="text-lg font-black text-gray-900 " >No Sentiment Matches</h3>
 <p className="text-xs font-bold text-gray-400 uppercase tracking-widest" >Try broading your search keywords</p>
 </div>
 <button onClick={() => setSearchTerm('')} className="mt-2 text-red-600 font-black text-xs uppercase tracking-[0.2em] hover:tracking-[0.3em] transition-all" >Clear Filters</button>
 </div>
 </td>
 </tr>
 ) : (
 filteredAndSortedTestimonials.map((testimonial) => (
 <tr key={testimonial.id} className="transition-all even:bg-gray-50/50 hover:bg-gray-50 align-top group transition-colors">
 <td className="py-6 px-6">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden border border-gray-50 shadow-sm transition-transform group-hover:scale-110" >
 {testimonial.avatar_url ? (
 <img src={testimonial.avatar_url} alt="" className="w-full h-full object-cover" />
 ) : (
 <span className="text-[10px] font-black text-gray-400 ">{testimonial.customer_name?.charAt(0) || '?'}</span>
 )}
 </div>
 <div className="flex flex-col min-w-0">
 <span className="font-black text-gray-900 truncate text-sm ">{testimonial.customer_name}</span>
 <div className="flex gap-0.5 text-yellow-500">
 {[...Array(5)].map((_, i) => (
 <Star key={i} size={8} fill={i < testimonial.rating ? 'currentColor' : 'none'} strokeWidth={i < testimonial.rating ? 0 : 2} />
 ))}
 </div>
 </div>
 </div>
 </td>
 <td className="py-6 px-6">
 <p className="text-xs text-gray-500 font-bold leading-relaxed line-clamp-2 " title={testimonial.content}>"{testimonial.content}"</p>
 </td>
 <td className="py-6 px-6 text-center">
 <button
 onClick={() => toggleApprovedMutation.mutate({ id: testimonial.id, is_approved: testimonial.is_approved })}
 className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${testimonial.is_approved ? 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100' : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100'
 }`}
 >
 {testimonial.is_approved ? 'Visible' : 'Moderated'}
 </button>
 </td>
 <td className="py-6 px-6 text-center">
 {testimonial.is_featured ? (
 <span className="bg-yellow-50 text-yellow-700 border border-yellow-100 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest " >Spotlight</span>
 ) : (
 <span className="text-gray-200 text-xs">-</span>
 )}
 </td>
 <td className="py-6 px-6 text-right">
 <div className="flex items-center justify-end gap-1.5">
 <button
 onClick={() => handleEdit(testimonial)}
 className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-black"
 title="Edit"
 >
 <Edit2 size={16} />
 </button>
 <button
 onClick={() => handleDelete(testimonial.id)}
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

export default TestimonialManager;
