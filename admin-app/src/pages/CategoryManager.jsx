import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';
import { toast } from 'react-hot-toast';
import {
 Plus,
 Edit2,
 Trash2,
 Save,
 X,
 Library,
 Search,
 ArrowUpDown,
 Eye,
 EyeOff,
 CheckSquare,
 Square,
 Layers,
 TrendingUp,
 Layout,
 SearchX,
 ImageIcon,
 Upload
} from 'lucide-react';
import MediaPicker from '../components/MediaPicker';

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, verticalListSortingStrategy } from '@dnd-kit/sortable';
import ViewToggle from '../components/ViewToggle';
import { SortableItem, SortableHandle } from '../components/SortableItem';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';

const CategoryManager = () => {
 const queryClient = useQueryClient();
 const [view, setView] = useState('list');
 const [isEditing, setIsEditing] = useState(false);
 const [editingId, setEditingId] = useState(null);
 const [selectedIds, setSelectedIds] = useState([]);
 const [isPickerOpen, setIsPickerOpen] = useState(false);
 const [searchTerm, setSearchTerm] = useState('');
 const [sortConfig, setSortConfig] = useState({ key: 'display_order', direction: 'asc' });

 const [formData, setFormData] = useState({
 name: '',
 slug: '',
 icon: '',
 image_url: '',
 link: '',
 display_order: 0,
 is_active: true,
 show_on_home: true,
 description: ''
 });

 const sensors = useSensors(
 useSensor(PointerSensor),
 useSensor(KeyboardSensor, {
 coordinateGetter: sortableKeyboardCoordinates,
 })
 );

 // Fetch categories
 const { data: categories = [], isLoading, isError, error } = useQuery({
 queryKey: ['categories'],
 queryFn: async () => {
 const { data, error } = await supabase
 .from('categories')
 .select('*')
 .order('display_order', { ascending: true });

 if (error) throw error;
 return data;
 }
 });

 // Mutations
 const createMutation = useMutation({
 mutationFn: async (newCategory) => {
 const { data: maxOrder } = await supabase.from('categories').select('display_order').order('display_order', { ascending: false }).limit(1).single();
 const nextOrder = (maxOrder?.display_order || 0) + 1;
 const { data, error } = await supabase.from('categories').insert([{ ...newCategory, display_order: nextOrder }]).select();
 if (error) throw error;
 return data;
 },
 onSuccess: () => {
 queryClient.invalidateQueries(['categories']);
 toast.success('Category created successfully!');
 resetForm();
 },
 onError: (error) => toast.error(`Error: ${error.message}`)
 });

 const updateMutation = useMutation({
 mutationFn: async ({ id, updates }) => {
 const { data, error } = await supabase.from('categories').update(updates).eq('id', id).select();
 if (error) throw error;
 return data;
 },
 onSuccess: () => {
 queryClient.invalidateQueries(['categories']);
 toast.success('Category updated successfully!');
 resetForm();
 },
 onError: (error) => toast.error(`Error: ${error.message}`)
 });

 const deleteMutation = useMutation({
 mutationFn: async (ids) => {
 const { error } = await supabase.from('categories').delete().in('id', ids);
 if (error) throw error;
 },
 onSuccess: () => {
 queryClient.invalidateQueries(['categories']);
 toast.success('Records deleted from database');
 setSelectedIds([]);
 },
 onError: (error) => toast.error(`Error: ${error.message}`)
 });

 const reorderMutation = useMutation({
 mutationFn: async (items) => {
 const updates = items.map((item, index) => ({
 id: item.id,
 display_order: index
 }));
 const { error } = await supabase.from('categories').upsert(updates);
 if (error) throw error;
 },
 onSuccess: () => queryClient.invalidateQueries(['categories'])
 });

 const handleDragEnd = (event) => {
 const { active, over } = event;
 if (active && over && active.id !== over.id) {
 const oldIndex = categories.findIndex((item) => item.id === active.id);
 const newIndex = categories.findIndex((item) => item.id === over.id);
 const newItems = arrayMove(categories, oldIndex, newIndex);
 reorderMutation.mutate(newItems);
 }
 };

 const handleSelect = (id) => {
 setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
 };

 const handleSelectAll = () => {
 if (selectedIds.length === categories.length) setSelectedIds([]);
 else setSelectedIds(categories.map(c => c.id));
 };

 const resetForm = () => {
 setFormData({ name: '', slug: '', icon: '', image_url: '', link: '', display_order: 0, is_active: true, show_on_home: true, description: '' });
 setEditingId(null);
 setIsEditing(false);
 };

 const handleEdit = (category) => {
 setFormData(category);
 setEditingId(category.id);
 setIsEditing(true);
 };

 const handleNameChange = (name) => {
 setFormData(prev => ({
 ...prev,
 name,
 slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
 }));
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 if (editingId) {
 updateMutation.mutate({ id: editingId, updates: formData });
 } else {
 createMutation.mutate(formData);
 }
 };

 if (isLoading) {
 return <div className="flex items-center justify-center py-20 animate-pulse text-red-500 font-black uppercase tracking-widest text-[10px]">Synchronizing Architecture...</div>;
 }

 return (
 <div className="space-y-8 animate-fade-in">
 <PageHeader
 title="Category Lab"
 subtitle="Engineer and organize trip classifications, pathing, and discovery grids"
 icon={Library}
 actionLabel="Deploy Category"
 onAction={() => { resetForm(); setIsEditing(true); }}
 actionIcon={Plus}
 />

 {/* Stats Overview */}
 {!isEditing && (
 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
 <Card noPadding className="bg-red-50/20 border-red-100/50">
 <div className="p-6 flex items-center gap-5">
 <div className="w-14 h-14 bg-white rounded-2xl shadow-premium flex items-center justify-center text-red-600">
 <Layers size={28} />
 </div>
 <div>
 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Total Schema</p>
 <h3 className="text-3xl font-display font-bold text-slate-900 leading-none">{categories?.length || 0}</h3>
 </div>
 </div>
 </Card>

 <Card noPadding className="bg-green-50/20 border-green-100/50">
 <div className="p-6 flex items-center gap-5">
 <div className="w-14 h-14 bg-white rounded-2xl shadow-premium flex items-center justify-center text-green-600">
 <TrendingUp size={28} />
 </div>
 <div>
 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Live Grid</p>
 <h3 className="text-3xl font-display font-bold text-slate-900 leading-none">{categories?.filter(c => c.is_active).length || 0} Active</h3>
 </div>
 </div>
 </Card>

 <Card noPadding className="bg-blue-50/20 border-blue-100/50">
 <div className="p-6 flex items-center gap-5">
 <div className="w-14 h-14 bg-white rounded-2xl shadow-premium flex items-center justify-center text-blue-600">
 <Layout size={28} />
 </div>
 <div>
 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Home Visibility</p>
 <h3 className="text-3xl font-display font-bold text-slate-900 leading-none">{categories?.filter(c => c.show_on_home).length || 0} Featured</h3>
 </div>
 </div>
 </Card>

 <Card noPadding className="bg-orange-50/20 border-orange-100/50">
 <div className="p-6 flex items-center gap-5">
 <div className="w-14 h-14 bg-white rounded-2xl shadow-premium flex items-center justify-center text-orange-600">
 <Search size={28} />
 </div>
 <div>
 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">SEO Indexed</p>
 <h3 className="text-3xl font-display font-bold text-slate-900 leading-none">{categories?.filter(c => c.slug).length || 0} Ready</h3>
 </div>
 </div>
 </Card>
 </div>
 )}

 {/* Search & Orientation Control */}
 {!isEditing && (
 <Card noPadding className="p-2">
 <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-2">
 <div className="relative flex-1 max-w-2xl w-full">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
 <input
 type="text"
 placeholder="Filter biological categories by name or signature..."
 className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200/50 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:bg-white focus:border-primary-500 outline-none transition-all text-sm font-medium"
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 />
 </div>
 <div className="flex items-center gap-3">
 <ViewToggle view={view} onViewChange={setView} />
 {selectedIds.length > 0 && (
 <Button
 variant="danger"
 size="sm"
 onClick={() => {
 if (window.confirm(`Expunge ${selectedIds.length} classification nodes?`)) {
 deleteMutation.mutate(selectedIds);
 }
 }}
 >
 <Trash2 size={16} /> Del Selected ({selectedIds.length})
 </Button>
 )}
 </div>
 </div>
 </Card>
 )}

 {/* Full Page Edit View */}
 {isEditing && (
 <div className="space-y-8 animate-fade-in">
 <div className="max-w-5xl mx-auto w-full">
 <div className="flex items-center justify-between mb-12">
 <div>
 <h2 className="text-4xl font-display font-bold text-slate-900 tracking-tight">{editingId ? 'Edit Category' : 'New Category'}</h2>
 <p className="text-lg text-slate-400 font-medium mt-2">Define parameters for your discovery classification</p>
 </div>
 <button onClick={() => setIsEditing(false)} className="p-4 hover:bg-slate-50 rounded-2xl transition-all text-slate-400 hover:text-slate-900 shadow-sm border border-slate-100">
 <X size={24} />
 </button>
 </div>

 <form onSubmit={handleSubmit} className="space-y-12">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
 <div className="space-y-3">
 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category Name</label>
 <input
 type="text"
 required
 value={formData.name}
 onChange={(e) => handleNameChange(e.target.value)}
 className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-4 py-3.5 text-slate-900 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:bg-white outline-none transition-all font-semibold text-lg"
 placeholder="e.g. Cultural Odyssey"
 />
 </div>
 <div className="space-y-3">
 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">URL Signature (Slug)</label>
 <input
 type="text"
 required
 value={formData.slug}
 onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
 className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-4 py-3.5 text-slate-500 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:bg-white outline-none transition-all font-mono font-bold"
 placeholder="cultural-odyssey"
 />
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
 <div className="space-y-3">
 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Interface Link</label>
 <input
 type="text"
 value={formData.link || ''}
 onChange={(e) => setFormData({ ...formData, link: e.target.value })}
 className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-4 py-3.5 text-slate-900 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:bg-white outline-none transition-all font-medium"
 placeholder="/destinations/cultural"
 />
 </div>
 <div className="space-y-3">
 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Display Order</label>
 <input
 type="number"
 value={formData.display_order}
 onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
 className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-4 py-3.5 text-slate-900 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:bg-white outline-none transition-all font-bold"
 />
 </div>
 </div>

 <div className="space-y-3">
 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Visual Asset (URL)</label>
 <div className="flex gap-3">
 <div className="relative flex-1">
 <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
 <input
 type="text"
 value={formData.image_url}
 onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
 className="w-full bg-slate-50 border border-slate-200/60 rounded-xl pl-11 pr-4 py-3.5 text-slate-900 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:bg-white outline-none transition-all text-sm font-medium"
 placeholder="https://images.unsplash.com/..."
 />
 </div>
 <MediaPicker
 isOpen={isPickerOpen}
 onClose={() => setIsPickerOpen(false)}
 onSelect={(asset) => setFormData({ ...formData, image_url: asset.url })}
 type="image"
 />
 <button type="button" onClick={() => setIsPickerOpen(true)} className="px-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-premium/5">
 <Upload size={18} className="text-primary-600" />
 </button>
 </div>
 </div>

 <div className="flex flex-wrap gap-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
 <label className="flex items-center gap-3 cursor-pointer group">
 <div className="relative">
 <input
 type="checkbox"
 className="sr-only peer"
 checked={formData.is_active}
 onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
 />
 <div className="w-11 h-6 bg-slate-200 rounded-full peer-checked:bg-green-500 transition-colors"></div>
 <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
 </div>
 <span className="text-xs font-black text-slate-600 uppercase tracking-widest group-hover:text-slate-900 transition-colors">Active Node</span>
 </label>

 <label className="flex items-center gap-3 cursor-pointer group">
 <div className="relative">
 <input
 type="checkbox"
 className="sr-only peer"
 checked={formData.show_on_home}
 onChange={(e) => setFormData({ ...formData, show_on_home: e.target.checked })}
 />
 <div className="w-11 h-6 bg-slate-200 rounded-full peer-checked:bg-primary-500 transition-colors"></div>
 <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
 </div>
 <span className="text-xs font-black text-slate-600 uppercase tracking-widest group-hover:text-slate-900 transition-colors">Show on Homepage</span>
 </label>
 </div>
 </form>

 <div className="mt-16 pt-8 border-t border-slate-100 flex justify-end gap-4">
 <Button variant="secondary" onClick={() => setIsEditing(false)} className="px-10 py-4 font-black uppercase tracking-widest text-xs">Abandon Changes</Button>
 <Button variant="primary" onClick={handleSubmit} isLoading={createMutation.isPending || updateMutation.isPending} className="px-12 py-4 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary-500/20">
 {editingId ? 'Update Classification' : 'Deploy Category'}
 </Button>
 </div>
 </div>
 </div>
 )}

 {!isEditing && (
 <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
 <SortableContext items={categories.map(c => c.id)} strategy={view === 'grid' ? rectSortingStrategy : verticalListSortingStrategy}>
 {categories.length === 0 ? (
 <div className="bg-white rounded-[2.5rem] border border-gray-100 p-20 flex flex-col items-center justify-center text-center group transition-all hover:border-red-200">
 <div className="w-24 h-24 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-300 mb-6 group-hover:scale-110 transition-transform duration-500 group-hover:text-red-500 group-hover:bg-red-50" >
 <SearchX size={48} />
 </div>
 <h3 className="text-2xl font-black text-gray-900 mb-2" >No Classifications</h3>
 <p className="text-gray-500 font-bold max-w-sm mx-auto uppercase tracking-widest text-[10px]" >Start building your app structure by deploying your first trip category.</p>
 <button onClick={() => { resetForm(); setIsEditing(true); }} className="mt-8 text-red-600 font-black text-xs uppercase tracking-[0.2em] hover:tracking-[0.3em] transition-all" >Deploy Category</button>
 </div>
 ) : (
 view === 'grid' ? (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
 {categories.map((category) => (
 <SortableItem key={category.id} id={category.id} className="h-full">
 {(attributes, listeners) => (
 <Card noPadding hoverable className={`h-full flex flex-col relative group overflow-hidden ${selectedIds.includes(category.id) ? 'ring-2 ring-primary-500 border-primary-500' : ''}`}>

 <div className="absolute top-3 left-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
 <SortableHandle attributes={attributes} listeners={listeners} />
 </div>
 <button onClick={() => handleSelect(category.id)} className="absolute top-3 right-3 z-20 transition-all transform group-hover:rotate-6">
 {selectedIds.includes(category.id) ? <CheckSquare size={22} className="text-primary-600 bg-white rounded-lg p-0.5 shadow-premium" /> : <Square size={22} className="text-white drop-shadow-md" />}
 </button>

 <div className="h-44 overflow-hidden relative shrink-0">
 {category.image_url ? (
 <img src={category.image_url} alt={category.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
 ) : (
 <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
 <ImageIcon size={40} strokeWidth={1} />
 </div>
 )}
 <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent"></div>
 <div className="absolute bottom-4 left-5 right-5">
 <div className="text-[9px] font-black text-primary-400 uppercase tracking-[0.2em] mb-1">Entity Index #{category.display_order}</div>
 <h3 className="font-display font-bold text-white text-lg leading-tight tracking-tight">{category.name}</h3>
 </div>
 </div>

 <div className="p-5 flex-1 flex flex-col gap-5">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="p-2.5 bg-slate-50 rounded-xl text-primary-600 shadow-premium/5 border border-slate-100">
 <Layout size={18} />
 </div>
 <div className="flex flex-col">
 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Interface Link</span>
 <span className="text-[11px] font-bold text-slate-900 truncate max-w-[100px]">{category.link || '/null'}</span>
 </div>
 </div>
 <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${category.is_active ? 'bg-green-50 text-green-600 border-green-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
 {category.is_active ? 'Live' : 'Draft'}
 </div>
 </div>

 <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-50 pt-4 w-full">
 <div className="flex gap-1.5">
 <button
 onClick={() => handleEdit(category)}
 className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-black"
 title="Edit"
 >
 <Edit2 size={16} />
 </button>
 </div>
 <button
 onClick={() => { if (window.confirm('Expunge record?')) deleteMutation.mutate([category.id]); }}
 className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all font-black"
 title="Delete"
 >
 <Trash2 size={16} />
 </button>
 </div>
 </div>
 </Card>
 )}
 </SortableItem>
 ))}
 </div>
 ) : (
 <Card noPadding>
 <table className="w-full">
 <colgroup>
 <col className="w-[60px]" />
 <col className="w-[80px]" />
 <col className="w-[350px]" />
 <col className="w-[200px]" />
 <col className="w-[150px]" />
 <col className="w-[200px]" />
 </colgroup>
 <thead>
 <tr className="border-b border-gray-100 align-middle bg-gray-50/50">
 <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center" >Stack</th>
 <th className="py-5 px-6 text-center">
 <button onClick={handleSelectAll} className="text-gray-300 hover:text-red-600 transition-colors" >
 {selectedIds.length > 0 && selectedIds.length === categories.length ? <CheckSquare size={18} className="text-red-600" /> : <Square size={18} />}
 </button>
 </th>
 <th
 className="py-5 px-6 text-[10px] font-black text-red-600 uppercase tracking-[0.2em] cursor-pointer hover:bg-red-50/50 transition-colors"
 onClick={() => setSortConfig({ key: 'name', direction: sortConfig.key === 'name' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
 >
 <div className="flex items-center gap-2" >
 Architecture
 <ArrowUpDown size={12} className={sortConfig.key === 'name' ? 'opacity-100' : 'opacity-20'} />
 </div>
 </th>
 <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Nav Path</th>
 <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Status</th>
 <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-50">
 {categories.filter(c =>
 c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
 c.slug.toLowerCase().includes(searchTerm.toLowerCase())
 ).sort((a, b) => {
 if (sortConfig.key === 'display_order') {
 return sortConfig.direction === 'asc' ? a.display_order - b.display_order : b.display_order - a.display_order;
 }
 const valA = a[sortConfig.key]?.toString().toLowerCase() || '';
 const valB = b[sortConfig.key]?.toString().toLowerCase() || '';
 return sortConfig.direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
 }).map((category) => (
 <SortableItem key={category.id} id={category.id} as="tr" className={`hover:bg-gray-50 transition-colors group align-top ${selectedIds.includes(category.id) ? 'bg-red-50/50' : ''}`}>
 {(attributes, listeners) => (
 <>
 <td className="py-6 px-6"><div className="flex justify-center"><SortableHandle attributes={attributes} listeners={listeners} /></div></td>
 <td className="py-6 px-6 text-center text-gray-400">
 <button onClick={() => handleSelect(category.id)} className="hover:text-red-600 transition-colors">
 {selectedIds.includes(category.id) ? <CheckSquare size={18} className="text-red-600" /> : <Square size={18} />}
 </button>
 </td>
 <td className="py-6 px-6">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 shadow-sm shrink-0 transition-transform group-hover:scale-110" >
 <img src={category.image_url} alt="" className="w-full h-full object-cover" />
 </div>
 <div className="flex flex-col min-w-0" >
 <span className="font-black text-gray-900 truncate text-sm " >{category.name}</span>
 <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest truncate" >Slug: {category.slug}</span>
 </div>
 </div>
 </td>
 <td className="py-6 px-6">
 <div className="inline-flex items-center px-3 py-1 bg-gray-50 rounded-lg text-[10px] font-black text-red-600 border border-red-50 tracking-wider">
 {category.link}
 </div>
 </td>
 <td className="py-6 px-6">
 <div className="flex flex-col gap-1.5 items-center">
 <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${category.is_active ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
 {category.is_active ? <Eye size={10} /> : <EyeOff size={10} />} {category.is_active ? 'Live' : 'Hidden'}
 </div>
 {category.show_on_home && <div className="px-3 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded-full text-[8px] font-black uppercase tracking-tighter">Homepage Matrix</div>}
 </div>
 </td>
 <td className="py-6 px-6 text-right">
 <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
 <button
 onClick={() => handleEdit(category)}
 className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-black"
 title="Edit"
 >
 <Edit2 size={16} />
 </button>
 <button
 onClick={() => { if (window.confirm('Del record?')) deleteMutation.mutate([category.id]); }}
 className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all font-black"
 title="Delete"
 >
 <Trash2 size={16} />
 </button>
 </div>
 </td>
 </>
 )}
 </SortableItem>
 ))}
 </tbody>
 </table>
 </Card>
 )
 )}
 </SortableContext>
 </DndContext>
 )}
 </div>
 );
};

export default CategoryManager;
