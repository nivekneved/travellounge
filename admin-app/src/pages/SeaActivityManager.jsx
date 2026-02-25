import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';
import { toast } from 'react-hot-toast';
import { Plus, Edit2, Trash2, Save, X, Eye, EyeOff, Library, MapPin, Clock, Waves, Search, ArrowUpDown, TrendingUp, Anchor, Globe, SearchX } from 'lucide-react';
import MediaPicker from '../components/MediaPicker';

const SeaActivityManager = () => {
 const [isEditing, setIsEditing] = useState(false);
 const [editingId, setEditingId] = useState(null);
 const [isPickerOpen, setIsPickerOpen] = useState(false);
 const [searchTerm, setSearchTerm] = useState('');
 const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

 const [formData, setFormData] = useState({
 name: '',
 category: 'Water Activities',
 description: '',
 price: '',
 duration: '',
 image_url: '',
 location: '',
 is_active: true,
 display_order: 0
 });

 const queryClient = useQueryClient();

 // Fetch sea activities
 const { data: activities = [], isLoading, isError, error: queryError } = useQuery({
 queryKey: ['activities', 'sea'],
 queryFn: async () => {
 const { data, error } = await supabase
 .from('services')
 .select('*')
 .eq('category', 'Water Activities')
 .order('display_order', { ascending: true });

 if (error) throw error;
 return data;
 }
 });

 const filteredAndSortedActivities = activities.filter(activity => {
 const searchStr = searchTerm.toLowerCase();
 return (
 activity.name?.toLowerCase().includes(searchStr) ||
 activity.location?.toLowerCase().includes(searchStr) ||
 activity.description?.toLowerCase().includes(searchStr)
 );
 }).sort((a, b) => {
 const key = sortConfig.key;
 let valA = a[key] ?? '';
 let valB = b[key] ?? '';

 if (key === 'price') {
 valA = a.pricing?.price || 0;
 valB = b.pricing?.price || 0;
 }

 if (typeof valA === 'string' && typeof valB === 'string') {
 return sortConfig.direction === 'asc'
 ? valA.localeCompare(valB)
 : valB.localeCompare(valA);
 }

 return sortConfig.direction === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
 });

 // Mutations
 const createMutation = useMutation({
 mutationFn: async (newActivity) => {
 const { data, error } = await supabase
 .from('services')
 .insert([{
 ...newActivity,
 pricing: { price: newActivity.price },
 images: [newActivity.image_url]
 }])
 .select();
 if (error) throw error;
 return data;
 },
 onSuccess: () => {
 queryClient.invalidateQueries(['activities', 'sea']);
 toast.success('Sea Activity created successfully!');
 resetForm();
 }
 });

 const updateMutation = useMutation({
 mutationFn: async ({ id, updates }) => {
 const { data, error } = await supabase
 .from('services')
 .update({
 ...updates,
 pricing: { price: updates.price },
 images: [updates.image_url]
 })
 .eq('id', id)
 .select();
 if (error) throw error;
 return data;
 },
 onSuccess: () => {
 queryClient.invalidateQueries(['activities', 'sea']);
 toast.success('Sea Activity updated successfully!');
 resetForm();
 }
 });

 const deleteMutation = useMutation({
 mutationFn: async (id) => {
 const { error } = await supabase.from('services').delete().eq('id', id);
 if (error) throw error;
 },
 onSuccess: () => {
 queryClient.invalidateQueries(['activities', 'sea']);
 toast.success('Sea Activity deleted successfully!');
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

 const handleEdit = (activity) => {
 setEditingId(activity.id);
 setFormData({
 name: activity.name,
 category: 'Water Activities',
 description: activity.description || '',
 price: activity.pricing?.price || '',
 duration: activity.duration || '',
 image_url: activity.images?.[0] || '',
 location: activity.location || '',
 is_active: activity.is_active !== false,
 display_order: activity.display_order || 0
 });
 setIsEditing(true);
 };

 const resetForm = () => {
 setFormData({
 name: '',
 category: 'Water Activities',
 description: '',
 price: '',
 duration: '',
 image_url: '',
 location: '',
 is_active: true,
 display_order: activities.length
 });
 setEditingId(null);
 setIsEditing(false);
 };

 if (isLoading) return <div className="flex items-center justify-center py-20 animate-pulse text-red-500 font-black uppercase tracking-widest text-[10px]">Loading Sea Activities...</div>;

 return (
 <div className="space-y-8">
 {/* Header */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
 <div>
 <h1 className="text-3xl font-black text-gray-900 tracking-tight ">Sea Activities</h1>
 <p className="text-gray-500 font-medium">Manage water-based adventures, diving, and boat excursions</p>
 </div>
 <button
 onClick={() => { resetForm(); setIsEditing(true); }}
 className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-xl shadow-red-600/20 active:scale-95 group"
 >
 <Plus size={22} className="group-hover:rotate-90 transition-transform" />
 <span>Add New Activity</span>
 </button>
 </div>

 {!isEditing && (
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 group hover:border-red-100 transition-colors">
 <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
 <TrendingUp size={28} />
 </div>
 <div>
 <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Activities</p>
 <h3 className="text-3xl font-black text-gray-900">{activities.length}</h3>
 </div>
 </div>
 <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 group hover:border-red-100 transition-colors">
 <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
 <Anchor size={28} />
 </div>
 <div>
 <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Active Services</p>
 <h3 className="text-3xl font-black text-gray-900">{activities.filter(a => a.is_active !== false).length}</h3>
 </div>
 </div>
 <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 group hover:border-red-100 transition-colors">
 <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
 <Globe size={28} />
 </div>
 <div>
 <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Locations</p>
 <h3 className="text-3xl font-black text-gray-900">{[...new Set(activities.map(a => a.location))].filter(Boolean).length}</h3>
 </div>
 </div>
 </div>
 )}

 {!isEditing && (
 <div className="bg-white p-4 border border-gray-100 rounded-2xl shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
 <div className="relative flex-1 max-w-2xl w-full">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black" size={20} />
 <input
 type="text"
 placeholder="Search water activities by name, location or description..."
 className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:bg-white focus:border-red-500 outline-none transition-all font-bold text-sm"
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 />
 </div>
 <div className="flex items-center gap-2 text-gray-400 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
 <span className="text-xs font-black uppercase tracking-widest">Auto-Filtered</span>
 </div>
 </div>
 )}

 {!isEditing && (
 <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse table-fixed">
 <colgroup>
 <col className="w-[80px]" />
 <col className="w-[300px]" />
 <col className="w-[180px]" />
 <col className="w-[150px]" />
 <col className="w-[140px]" />
 <col className="w-[120px]" />
 <col className="w-[140px]" />
 </colgroup>
 <thead>
 <tr className="border-b border-gray-100 align-middle bg-gray-50/50">
 <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Image</th>
 <th
 className="py-5 px-6 text-[10px] font-black text-red-600 uppercase tracking-[0.2em] cursor-pointer hover:bg-red-50/50 transition-colors"
 onClick={() => setSortConfig({ key: 'name', direction: sortConfig.key === 'name' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
 >
 <div className="flex items-center gap-2">
 Activity
 <ArrowUpDown size={12} className={sortConfig.key === 'name' ? 'opacity-100' : 'opacity-20'} />
 </div>
 </th>
 <th
 className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] cursor-pointer hover:bg-gray-100/50 transition-colors"
 onClick={() => setSortConfig({ key: 'location', direction: sortConfig.key === 'location' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
 >
 <div className="flex items-center gap-2">
 Location
 <ArrowUpDown size={12} className={sortConfig.key === 'location' ? 'opacity-100' : 'opacity-20'} />
 </div>
 </th>
 <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Duration</th>
 <th
 className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] cursor-pointer hover:bg-gray-100/50 transition-colors"
 onClick={() => setSortConfig({ key: 'price', direction: sortConfig.key === 'price' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
 >
 <div className="flex items-center gap-2">
 Price
 <ArrowUpDown size={12} className={sortConfig.key === 'price' ? 'opacity-100' : 'opacity-20'} />
 </div>
 </th>
 <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Status</th>
 <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100">
 {filteredAndSortedActivities.length === 0 ? (
 <tr>
 <td colSpan="7" className="py-32 text-center">
 <div className="flex flex-col items-center justify-center gap-4">
 <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
 <SearchX size={40} />
 </div>
 <div>
 <p className="text-gray-900 font-black text-lg">No activities found</p>
 <p className="text-gray-400 text-sm font-medium">Try adjusting your search criteria</p>
 </div>
 </div>
 </td>
 </tr>
 ) : (
 filteredAndSortedActivities.map((activity) => (
 <tr key={activity.id} className="transition-all hover:bg-red-50/20 group animate-in fade-in slide-in-from-bottom-2 duration-300">
 <td className="py-5 px-6">
 <div className="w-14 h-14 rounded-2xl bg-gray-100 overflow-hidden border-2 border-white shadow-premium group-hover:scale-110 transition-transform duration-500">
 {activity.images?.[0] ? (
 <img src={activity.images[0]} alt="" className="w-full h-full object-cover" />
 ) : (
 <div className="w-full h-full flex items-center justify-center text-gray-300">
 <Waves size={24} />
 </div>
 )}
 </div>
 </td>
 <td className="py-5 px-6">
 <div className="flex flex-col min-w-0">
 <span className="font-black text-gray-900 truncate tracking-tight text-base group-hover:text-red-600 transition-colors uppercase ">{activity.name}</span>
 <span className="text-[10px] text-gray-400 line-clamp-1 font-bold uppercase tracking-wider mt-0.5 opacity-60 ">{activity.description}</span>
 </div>
 </td>
 <td className="py-5 px-6 text-sm font-bold text-gray-600">
 <div className="flex items-center gap-2">
 <div className="w-6 h-6 rounded-lg bg-red-50 flex items-center justify-center text-red-500 shrink-0">
 <MapPin size={12} />
 </div>
 <span className="truncate ">{activity.location || 'N/A'}</span>
 </div>
 </td>
 <td className="py-5 px-6 text-sm font-bold text-gray-600">
 <div className="flex items-center gap-2">
 <div className="w-6 h-6 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
 <Clock size={12} />
 </div>
 <span className="">{activity.duration || 'N/A'}</span>
 </div>
 </td>
 <td className="py-5 px-6">
 <div className="flex flex-col">
 <span className="text-sm font-black text-gray-900 shrink-0 ">Rs {activity.pricing?.price || '0'}</span>
 <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">per person</span>
 </div>
 </td>
 <td className="py-5 px-6 text-center">
 <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${activity.is_active !== false
 ? 'bg-green-50 text-green-700 border border-green-100 shadow-sm shadow-green-100'
 : 'bg-gray-100 text-gray-500 border border-gray-200'
 }`}>
 <span className={`w-1.5 h-1.5 rounded-full mr-2 ${activity.is_active !== false ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
 {activity.is_active !== false ? 'Active' : 'Hidden'}
 </span>
 </td>
 <td className="py-5 px-6 text-right">
 <div className="flex items-center justify-end gap-1.5">
 <button
 onClick={() => handleEdit(activity)}
 className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-black"
 title="Edit"
 >
 <Edit2 size={16} />
 </button>
 <button
 onClick={() => { if (window.confirm('Delete this activity?')) deleteMutation.mutate(activity.id); }}
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

 {/* Editing Form Modal */}
 {isEditing && (
 <div className="space-y-8 animate-fade-in">
 <div className="max-w-6xl mx-auto w-full">
 <div className="px-8 pt-4 pb-16">
 <div className="flex items-center justify-between mb-16 px-4">
 <div className="flex items-center gap-6">
 <div className="p-4 bg-red-50 rounded-3xl text-red-600 shadow-sm border border-red-100">
 <Waves size={32} />
 </div>
 <div>
 <h2 className="text-4xl font-display font-bold text-slate-900 tracking-tight ">
 {editingId ? 'Modify Expedition' : 'Deploy Sea Activity'}
 </h2>
 <p className="text-lg text-slate-400 font-medium mt-1">Configure aquatic experiences and maritime parameters</p>
 </div>
 </div>
 <button onClick={() => setIsEditing(false)} className="p-4 hover:bg-slate-50 rounded-2xl transition-all text-slate-400 hover:text-slate-900 shadow-sm border border-slate-100">
 <X size={24} />
 </button>
 </div>
 <div className="px-4">

 <form onSubmit={handleSubmit} className="space-y-6">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="space-y-2">
 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Activity Name *</label>
 <input
 type="text" required
 className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white outline-none transition-all font-bold text-sm"
 value={formData.name}
 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
 />
 </div>
 <div className="space-y-2">
 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Location</label>
 <input
 type="text"
 className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white outline-none transition-all font-bold text-sm"
 value={formData.location}
 onChange={(e) => setFormData({ ...formData, location: e.target.value })}
 />
 </div>
 <div className="space-y-2">
 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Price (Rs) *</label>
 <input
 type="number" required
 className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white outline-none transition-all font-bold text-sm"
 value={formData.price}
 onChange={(e) => setFormData({ ...formData, price: e.target.value })}
 />
 </div>
 <div className="space-y-2">
 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Duration</label>
 <input
 type="text"
 className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white outline-none transition-all font-bold text-sm"
 placeholder="e.g. 2 Hours"
 value={formData.duration}
 onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
 />
 </div>
 </div>

 <div className="space-y-2">
 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</label>
 <textarea
 rows="3"
 className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white outline-none transition-all font-bold text-sm"
 value={formData.description}
 onChange={(e) => setFormData({ ...formData, description: e.target.value })}
 />
 </div>

 <div className="space-y-2">
 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Featured Image *</label>
 <div className="flex gap-4">
 <input
 type="url" required
 className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white outline-none transition-all font-bold text-sm"
 placeholder="https://..."
 value={formData.image_url}
 onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
 />
 <button
 type="button"
 onClick={() => setIsPickerOpen(true)}
 className="px-6 bg-gray-900 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-black transition-colors"
 >
 Picker
 </button>
 </div>
 </div>

 <div className="flex items-center gap-3">
 <button
 type="button"
 onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
 className={`w-12 h-6 rounded-full p-1 transition-all ${formData.is_active ? 'bg-red-500' : 'bg-gray-300'}`}
 >
 <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${formData.is_active ? 'translate-x-6' : 'translate-x-0'}`} />
 </button>
 <span className="text-sm font-bold text-gray-700">Active and visible on website</span>
 </div>

 <div className="flex gap-4 pt-4">
 <button
 type="submit"
 disabled={createMutation.isPending || updateMutation.isPending}
 className="flex-1 bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg hover:shadow-red-600/30 flex items-center justify-center gap-2 active:scale-95"
 >
 <Save size={20} />
 {createMutation.isPending || updateMutation.isPending ? 'Processing...' : 'Save Activity Record'}
 </button>
 <button
 type="button"
 onClick={() => setIsEditing(false)}
 className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all"
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

 <MediaPicker
 isOpen={isPickerOpen}
 onClose={() => setIsPickerOpen(false)}
 onSelect={(url) => setFormData({ ...formData, image_url: url })}
 type="image"
 />
 </div>
 );
};

export default SeaActivityManager;
