import React, { useState, useEffect } from 'react';
import {
 Plus,
 Trash2,
 Edit2,
 Link as LinkIcon,
 Image as ImageIcon,
 Layers,
 LayoutTemplate,
 GripVertical,
 Video,
 PlayCircle,
 ChevronLeft,
 Save,
 X,
 Library,
 CheckSquare,
 Square,
 Search,
 ArrowUpDown,
 TrendingUp,
 Zap,
 Play,
 Monitor,
 Smartphone,
 AlignCenter,
 AlignLeft,
 AlignRight,
 Type,
 Aperture,
 Eye,
 Settings2,
 ChevronRight,
 ArrowLeft
} from 'lucide-react';
import { supabase } from '../utils/supabase';
import { toast } from 'react-hot-toast';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, rectSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem, SortableHandle } from '../components/SortableItem';
import MediaPicker from '../components/MediaPicker';
import ViewToggle from '../components/ViewToggle';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';

const HeroManager = () => {
 const [slides, setSlides] = useState([]);
 const [view, setView] = useState('grid'); // 'grid' or 'list' or 'edit'
 const [editingId, setEditingId] = useState(null);
 const [loading, setLoading] = useState(true);
 const [isPickerOpen, setIsPickerOpen] = useState(false);
 const [pickerTarget, setPickerTarget] = useState(null); // 'image_url' or 'video_url'
 const [selectedIds, setSelectedIds] = useState([]);
 const [searchTerm, setSearchTerm] = useState('');
 const [sortConfig, setSortConfig] = useState({ key: 'order_index', direction: 'asc' });
 const [previewMode, setPreviewMode] = useState('desktop'); // 'desktop' or 'mobile'

 const [formData, setFormData] = useState({
 title: '',
 subtitle: '',
 description: '',
 image_url: '',
 video_url: '',
 media_type: 'image',
 cta_text: 'Explore',
 cta_link: '/search',
 order_index: 0,
 is_active: true,
 alignment: 'center',
 overlay_opacity: 0.4
 });

 const sensors = useSensors(
 useSensor(PointerSensor),
 useSensor(KeyboardSensor, {
 coordinateGetter: sortableKeyboardCoordinates,
 })
 );

 useEffect(() => {
 fetchSlides();
 }, []);

 const fetchSlides = async () => {
 try {
 setLoading(true);
 const { data, error } = await supabase
 .from('hero_slides')
 .select('*')
 .order('order_index', { ascending: true });

 if (error) throw error;
 setSlides(data || []);
 } catch (error) {
 toast.error(`Failed to load slides: ${error.message}`);
 } finally {
 setLoading(false);
 }
 };

 const reorderMutation = async (newSlides) => {
 try {
 setSlides(newSlides);
 const updates = newSlides.map((slide, index) => ({
 id: slide.id,
 order_index: index
 }));
 const { error } = await supabase.from('hero_slides').upsert(updates);
 if (error) throw error;
 } catch (error) {
 toast.error('Failed to save new order');
 fetchSlides();
 }
 };

 const handleDragEnd = (event) => {
 const { active, over } = event;
 if (active && over && active.id !== over.id) {
 const oldIndex = slides.findIndex((item) => item.id === active.id);
 const newIndex = slides.findIndex((item) => item.id === over.id);
 const newItems = arrayMove(slides, oldIndex, newIndex);
 reorderMutation(newItems);
 }
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 try {
 const payload = { ...formData };
 if (editingId) {
 const { error } = await supabase.from('hero_slides').update(payload).eq('id', editingId);
 if (error) throw error;
 toast.success('Slide modified successfully');
 } else {
 const maxOrder = slides.length > 0 ? Math.max(...slides.map(s => s.order_index)) : -1;
 payload.order_index = maxOrder + 1;
 const { error } = await supabase.from('hero_slides').insert([payload]);
 if (error) throw error;
 toast.success('New slide launched');
 }
 setView('grid');
 setEditingId(null);
 fetchSlides();
 } catch (error) {
 toast.error('Protocol failure: Could not save slide');
 }
 };

 const handleDelete = async (id) => {
 if (!window.confirm('Expunge this slide from the homepage rotation?')) return;
 try {
 const { error } = await supabase.from('hero_slides').delete().eq('id', id);
 if (error) throw error;
 toast.success('Slide deleted');
 fetchSlides();
 } catch (error) {
 toast.error('Error expunging record');
 }
 };

 const handleEdit = (slide) => {
 setEditingId(slide.id);
 setFormData({
 ...slide,
 alignment: slide.alignment || 'center',
 overlay_opacity: slide.overlay_opacity ?? 0.4
 });
 setView('edit');
 };

 const handleNew = () => {
 setEditingId(null);
 setFormData({
 title: '', subtitle: '', description: '', image_url: '', video_url: '',
 media_type: 'image', cta_text: 'Explore', cta_link: '/search', order_index: 0, is_active: true,
 alignment: 'center', overlay_opacity: 0.4
 });
 setView('edit');
 };

 const openPicker = (target) => {
 setPickerTarget(target);
 setIsPickerOpen(true);
 };

 const handleMediaSelect = (url) => {
 setFormData(prev => ({ ...prev, [pickerTarget]: url }));
 };

 const handleSelect = (id) => {
 setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
 };

 const handleSelectAll = () => {
 setSelectedIds(selectedIds.length === slides.length ? [] : slides.map(s => s.id));
 };

 if (loading && view !== 'edit') {
 return <div className="flex items-center justify-center py-20 animate-pulse text-red-500 font-black uppercase tracking-widest text-[10px]">Processing Visual Assets...</div>;
 }

 if (view === 'edit') {
 const previewMedia = formData.media_type === 'video' ? formData.video_url : formData.image_url;

 return (
 <div className="min-h-screen bg-white animate-in fade-in slide-in-from-bottom-4 duration-500">
 {/* Clean Header */}
 <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between border-b border-gray-100 mb-12">
 <div className="flex items-center gap-6">
 <button
 onClick={() => setView('grid')}
 className="p-3 hover:bg-gray-100 rounded-full transition-all text-gray-400 hover:text-gray-900 border border-transparent hover:border-gray-200"
 >
 <ArrowLeft size={24} />
 </button>
 <div>
 <h2 className="text-3xl font-black text-gray-900 tracking-tight ">
 {editingId ? 'Modify Slide' : 'Launch New Experience'}
 </h2>
 <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-1 flex items-center gap-2">
 <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
 Visual Configuration Hub
 </p>
 </div>
 </div>
 <div className="flex gap-4">
 <button
 onClick={() => setView('grid')}
 className="px-8 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all"
 >
 Cancel
 </button>
 <button
 onClick={handleSubmit}
 className="px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all shadow-xl shadow-red-600/20 active:scale-95 flex items-center gap-2"
 >
 <Save size={18} />
 Save Configuration
 </button>
 </div>
 </div>

 <div className="max-w-7xl mx-auto px-6 pb-20">
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
 {/* Editor Forms */}
 <div className="space-y-12">
 <section className="space-y-8">
 <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
 <div className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center font-black text-xs ">01</div>
 <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Visual Asset Foundation</h3>
 </div>

 <div className="flex p-1 bg-gray-100 rounded-2xl border border-gray-200 shadow-inner">
 <button
 type="button"
 onClick={() => setFormData({ ...formData, media_type: 'image' })}
 className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl transition-all font-black text-[11px] uppercase tracking-wider
 ${formData.media_type === 'image' ? 'bg-white text-gray-900 shadow-premium border border-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
 >
 <ImageIcon size={18} /> Static Post
 </button>
 <button
 type="button"
 onClick={() => setFormData({ ...formData, media_type: 'video' })}
 className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl transition-all font-black text-[11px] uppercase tracking-wider
 ${formData.media_type === 'video' ? 'bg-white text-gray-900 shadow-premium border border-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
 >
 <Video size={18} /> Motion Path
 </button>
 </div>

 <div className="space-y-4">
 <div className="flex gap-3">
 <div className="flex-1 space-y-2">
 <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Asset Source URL</label>
 <input
 type="url"
 required
 value={formData.media_type === 'video' ? formData.video_url : formData.image_url}
 onChange={(e) => setFormData({ ...formData, [formData.media_type === 'video' ? 'video_url' : 'image_url']: e.target.value })}
 className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:bg-white focus:border-red-500 outline-none transition-all font-bold text-sm"
 placeholder="https://..."
 />
 </div>
 <button
 type="button"
 onClick={() => openPicker(formData.media_type === 'video' ? 'video_url' : 'image_url')}
 className="self-end p-4 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all shadow-lg active:scale-95"
 >
 <Library size={20} />
 </button>
 </div>
 </div>
 </section>

 <section className="space-y-8">
 <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
 <div className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center font-black text-xs ">02</div>
 <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Narrative Structure</h3>
 </div>

 <div className="space-y-6">
 <div className="space-y-2">
 <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Headline Content</label>
 <input
 type="text"
 value={formData.title}
 onChange={(e) => setFormData({ ...formData, title: e.target.value })}
 className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:bg-white focus:border-red-500 outline-none transition-all font-black text-gray-900 "
 placeholder="Enter Marquee Title..."
 required
 />
 </div>

 <div className="space-y-2">
 <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Subtle Hook (Subheadline)</label>
 <textarea
 rows={3}
 value={formData.subtitle}
 onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
 className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:bg-white focus:border-red-500 outline-none transition-all font-bold text-gray-600 text-sm resize-none"
 placeholder="Supporting narrative layers..."
 />
 </div>

 <div className="grid grid-cols-2 gap-6">
 <div className="space-y-2">
 <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Action Label</label>
 <input
 type="text"
 value={formData.cta_text}
 onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
 className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:bg-white focus:border-red-500 outline-none transition-all font-black text-[11px] uppercase tracking-[0.2em]"
 placeholder="BUTTON TEXT"
 />
 </div>
 <div className="space-y-2">
 <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Path Destination</label>
 <input
 type="text"
 value={formData.cta_link}
 onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
 className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:bg-white focus:border-red-500 outline-none transition-all font-bold text-gray-400 text-sm"
 placeholder="/search"
 />
 </div>
 </div>
 </div>
 </section>

 <section className="space-y-8">
 <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
 <div className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center font-black text-xs ">03</div>
 <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Experience Parameters</h3>
 </div>

 <div className="grid grid-cols-2 gap-8">
 <div className="space-y-3">
 <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Type Alignment</label>
 <div className="flex p-1 bg-gray-100 rounded-2xl border border-gray-200">
 <button type="button" onClick={() => setFormData({ ...formData, alignment: 'left' })} className={`flex-1 py-3 rounded-xl flex items-center justify-center transition-all ${formData.alignment === 'left' ? 'bg-white shadow-premium text-red-600 border border-gray-200' : 'text-gray-400 hover:text-gray-600'}`}><AlignLeft size={18} /></button>
 <button type="button" onClick={() => setFormData({ ...formData, alignment: 'center' })} className={`flex-1 py-3 rounded-xl flex items-center justify-center transition-all ${formData.alignment === 'center' ? 'bg-white shadow-premium text-red-600 border border-gray-200' : 'text-gray-400 hover:text-gray-600'}`}><AlignCenter size={18} /></button>
 <button type="button" onClick={() => setFormData({ ...formData, alignment: 'right' })} className={`flex-1 py-3 rounded-xl flex items-center justify-center transition-all ${formData.alignment === 'right' ? 'bg-white shadow-premium text-red-600 border border-gray-200' : 'text-gray-400 hover:text-gray-600'}`}><AlignRight size={18} /></button>
 </div>
 </div>

 <div className="space-y-3">
 <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Atmospheric Depth (Overlay)</label>
 <div className="flex items-center gap-6 py-2 px-4 bg-gray-50 rounded-2xl border border-gray-200">
 <input
 type="range"
 min="0"
 max="0.8"
 step="0.1"
 value={formData.overlay_opacity}
 onChange={(e) => setFormData({ ...formData, overlay_opacity: parseFloat(e.target.value) })}
 className="flex-1 accent-red-600 h-1"
 />
 <span className="text-[11px] font-black text-gray-900 w-10 text-right ">{Math.round(formData.overlay_opacity * 100)}%</span>
 </div>
 </div>
 </div>

 <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl border border-gray-200 group">
 <div className="flex items-center gap-4">
 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${formData.is_active ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-gray-200 text-gray-400'}`}>
 <Zap size={22} fill={formData.is_active ? 'white' : 'none'} />
 </div>
 <div>
 <p className="text-[11px] font-black uppercase tracking-[0.2em] leading-none mb-1 text-gray-900 ">Deployment Matrix</p>
 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">{formData.is_active ? 'Active Rotation' : 'Engine Standby'}</p>
 </div>
 </div>
 <button
 type="button"
 onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
 className={`w-16 h-8 rounded-full relative transition-all duration-500 ${formData.is_active ? 'bg-red-600 shadow-lg shadow-red-600/10' : 'bg-gray-300'}`}
 >
 <div className={`absolute top-1.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] ${formData.is_active ? 'left-9' : 'left-1.5'}`}></div>
 </button>
 </div>
 </section>
 </div>

 {/* Visual Simulation Area */}
 <div className="lg:sticky lg:top-12 h-fit space-y-8">
 <div className="flex items-center justify-between mb-2">
 <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ">Visual Proof</h3>
 <div className="flex p-0.5 bg-gray-100 rounded-xl border border-gray-200">
 <button
 onClick={() => setPreviewMode('desktop')}
 className={`p-2 rounded-lg transition-all ${previewMode === 'desktop' ? 'bg-white text-red-600 shadow-sm border border-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
 >
 <Monitor size={18} />
 </button>
 <button
 onClick={() => setPreviewMode('mobile')}
 className={`p-2 rounded-lg transition-all ${previewMode === 'mobile' ? 'bg-white text-red-600 shadow-sm border border-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
 >
 <Smartphone size={18} />
 </button>
 </div>
 </div>

 <div className={`relative mx-auto bg-gray-900 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
 ${previewMode === 'desktop' ? 'w-full aspect-[16/9] rounded-3xl' : 'w-[320px] h-[640px] rounded-[48px]'}`}>

 {previewMedia ? (
 <>
 {formData.media_type === 'video' ? (
 <video src={formData.video_url} className="w-full h-full object-cover" autoPlay loop muted playsInline />
 ) : (
 <img src={formData.image_url} className="w-full h-full object-cover animate-slow-zoom" />
 )}
 <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${formData.overlay_opacity})` }}></div>

 <div className={`absolute inset-0 flex flex-col p-8 text-white
 ${formData.alignment === 'center' ? 'items-center text-center justify-center' :
 formData.alignment === 'right' ? 'items-end text-right justify-center' : 'items-start text-left justify-center'}`}>

 <div className="max-w-md animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
 <h4 className={`font-black leading-tight mb-4 tracking-tighter drop-shadow-2xl uppercase
 ${previewMode === 'desktop' ? 'text-4xl' : 'text-2xl'}`}>
 {formData.title || 'Marquee Title'}
 </h4>
 <p className={`font-bold text-white/70 line-clamp-3 mb-8
 ${previewMode === 'desktop' ? 'text-base opacity-90' : 'text-xs'}`}>
 {formData.subtitle || 'Supporting narrative hook...'}
 </p>
 {formData.cta_text && (
 <div className="inline-block px-10 py-3.5 bg-red-600 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-red-600/30">
 {formData.cta_text}
 </div>
 )}
 </div>
 </div>
 </>
 ) : (
 <div className="absolute inset-0 flex flex-col items-center justify-center text-white/5 gap-4">
 <ImageIcon size={120} strokeWidth={0.5} />
 <span className="text-[10px] font-black uppercase tracking-[0.4em]">Empty Matrix Cell</span>
 </div>
 )}
 </div>
 </div>
 </div>
 </div>

 <MediaPicker isOpen={isPickerOpen} onClose={() => setIsPickerOpen(false)} onSelect={handleMediaSelect} type={formData.media_type} />
 <style dangerouslySetInnerHTML={{
 __html: `
 @keyframes slow-zoom {
 from { transform: scale(1); }
 to { transform: scale(1.15); }
 }
 .animate-slow-zoom {
 animation: slow-zoom 20s linear infinite alternate;
 }
 `}} />
 </div>
 );
 }

 return (
 <div className="space-y-8 animate-fade-in">
 <PageHeader
 title="Hero Narrative"
 subtitle="Curate the visual pulse and promotional banners of the platform"
 icon={LayoutTemplate}
 actionLabel="Add New Slide"
 onAction={handleNew}
 actionIcon={Plus}
 />

 {/* Stats Grid */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 group hover:border-red-100 transition-colors">
 <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
 <Layers size={28} />
 </div>
 <div>
 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">Total Slides</p>
 <h3 className="text-3xl font-black text-gray-900 leading-none ">{slides.length}</h3>
 </div>
 </div>

 <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 group hover:border-red-100 transition-colors">
 <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
 <TrendingUp size={28} />
 </div>
 <div>
 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">Live Status</p>
 <h3 className="text-3xl font-black text-gray-900 leading-none ">{slides.filter(s => s.is_active).length} Active</h3>
 </div>
 </div>

 <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 group hover:border-red-100 transition-colors">
 <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
 <Video size={28} />
 </div>
 <div>
 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">Media Assets</p>
 <h3 className="text-3xl font-black text-gray-900 leading-none ">{slides.filter(s => s.media_type === 'video').length}V / {slides.filter(s => s.media_type === 'image').length}I</h3>
 </div>
 </div>
 </div>

 {/* Toolbar */}
 <div className="bg-white p-4 border border-gray-100 rounded-2xl shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
 <div className="relative flex-1 max-w-2xl w-full">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black" size={20} />
 <input
 type="text"
 placeholder="Search slides by heading or description..."
 className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:bg-white focus:border-red-500 outline-none transition-all font-bold text-sm"
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 />
 </div>
 <div className="flex items-center gap-6">
 <ViewToggle view={view} onViewChange={setView} />
 {selectedIds.length > 0 && (
 <button
 onClick={async () => {
 if (window.confirm(`Expunge ${selectedIds.length} records from rotation?`)) {
 const { error } = await supabase.from('hero_slides').delete().in('id', selectedIds);
 if (error) toast.error('Protocol failure during deletion');
 else {
 toast.success('Records expunged');
 setSelectedIds([]);
 fetchSlides();
 }
 }
 }}
 className="bg-red-50 text-red-600 px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-red-100 transition-all flex items-center gap-2 border border-red-100"
 >
 <Trash2 size={16} /> Expunge ({selectedIds.length})
 </button>
 )}
 </div>
 </div>

 <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
 <SortableContext items={slides.map(s => s.id)} strategy={view === 'grid' ? rectSortingStrategy : verticalListSortingStrategy}>
 {slides.length === 0 ? (
 <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-32 flex flex-col items-center justify-center text-center group hover:border-red-400 transition-all shadow-sm">
 <div className="w-24 h-24 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-200 mb-8 group-hover:scale-110 transition-transform duration-500 group-hover:text-red-500 group-hover:bg-red-50">
 <ImageIcon size={48} strokeWidth={1} />
 </div>
 <h3 className="text-2xl font-black text-gray-900 mb-2 ">Awaiting Media Injection</h3>
 <p className="text-gray-400 font-medium max-w-sm mx-auto">Upload and manage marquee slides for your platform entrance.</p>
 <button onClick={handleNew} className="mt-10 px-10 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-black transition-all shadow-xl active:scale-95">Launch First Slide</button>
 </div>
 ) : (
 view === 'grid' ? (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
 {slides.filter(s => s.title?.toLowerCase().includes(searchTerm.toLowerCase())).map((slide) => (
 <SortableItem key={slide.id} id={slide.id} className="h-full">
 {(attributes, listeners) => (
 <div className={`bg-white rounded-[32px] border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-gray-200 transition-all duration-500 flex flex-col relative overflow-hidden group
 ${selectedIds.includes(slide.id) ? 'ring-4 ring-red-500/20 border-red-500' : ''}`}>

 <div className="absolute top-4 left-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
 <SortableHandle attributes={attributes} listeners={listeners} />
 </div>
 <button onClick={() => handleSelect(slide.id)} className="absolute top-4 right-4 z-20 outline-none">
 {selectedIds.includes(slide.id) ? <CheckSquare size={24} className="text-red-600 bg-white rounded-xl p-0.5 shadow-xl" /> : <div className="w-6 h-6 border-2 border-white/50 rounded-xl backdrop-blur-sm group-hover:border-white transition-colors" />}
 </button>

 <div className="h-56 overflow-hidden relative shrink-0">
 {slide.media_type === 'video' ? (
 <video src={slide.video_url} className="w-full h-full object-cover" autoPlay loop muted playsInline />
 ) : (
 <img src={slide.image_url} alt={slide.title} className="w-full h-full object-cover transition-transform duration-[4000ms] group-hover:scale-110" />
 )}
 <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/20 to-transparent"></div>
 <div className="absolute bottom-6 left-6 right-6">
 <div className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mb-2 leading-none">Slide Sequence #{slide.order_index + 1}</div>
 <h3 className="font-black text-white text-xl leading-tight tracking-tight uppercase">{slide.title}</h3>
 </div>
 {!slide.is_active && (
 <div className="absolute top-4 left-14 bg-gray-900/80 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-xl backdrop-blur-md border border-white/10">Engine Standby</div>
 )}
 </div>

 <div className="p-6 flex-1 flex flex-col gap-6">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 bg-gray-50 rounded-xl text-gray-400 flex items-center justify-center border border-gray-100 font-black text-xs">
 {slide.media_type === 'video' ? <Video size={18} /> : <ImageIcon size={18} />}
 </div>
 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">{slide.media_type} MATRIX</span>
 </div>
 <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${slide.is_active ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
 {slide.is_active ? 'Deployed' : 'Draft'}
 </div>
 </div>

 <div className="mt-auto flex items-center justify-between gap-2 border-t border-gray-50 pt-4 w-full">
 <div className="flex gap-1.5">
 <button
 onClick={() => handleEdit(slide)}
 className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-black"
 title="Edit"
 >
 <Edit2 size={16} />
 </button>
 </div>
 <button
 onClick={() => handleDelete(slide.id)}
 className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all font-black"
 title="Delete"
 >
 <Trash2 size={16} />
 </button>
 </div>
 </div>
 </div>
 )}
 </SortableItem>
 ))}
 </div>
 ) : (
 <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden pb-20">
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse table-fixed">
 <colgroup>
 <col className="w-[80px]" />
 <col className="w-[60px]" />
 <col className="w-[240px]" />
 <col className="w-[300px]" />
 <col className="w-[140px]" />
 <col className="w-[160px]" />
 </colgroup>
 <thead>
 <tr className="border-b border-gray-100 bg-gray-50/50 align-middle">
 <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Rank</th>
 <th className="py-5 px-2">
 <button onClick={handleSelectAll} className="text-gray-300 hover:text-red-600 transition-colors" >
 {selectedIds.length > 0 && selectedIds.length === slides.length ? <CheckSquare size={22} className="text-red-600" /> : <Square size={22} />}
 </button>
 </th>
 <th className="py-5 px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Visual Matrix</th>
 <th className="py-5 px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Narrative Layer</th>
 <th className="py-5 px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Status</th>
 <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100">
 {slides.filter(s => s.title?.toLowerCase().includes(searchTerm.toLowerCase())).sort((a, b) => {
 if (sortConfig.key === 'order_index') return sortConfig.direction === 'asc' ? a.order_index - b.order_index : b.order_index - a.order_index;
 const valA = a[sortConfig.key]?.toString().toLowerCase() || '';
 const valB = b[sortConfig.key]?.toString().toLowerCase() || '';
 return sortConfig.direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
 }).map((slide) => (
 <SortableItem key={slide.id} id={slide.id} as="tr" className={`group transition-all hover:bg-red-50/20 ${selectedIds.includes(slide.id) ? 'bg-red-50/40' : ''}`}>
 {(attributes, listeners) => (
 <>
 <td className="py-5 px-6">
 <SortableHandle attributes={attributes} listeners={listeners} />
 </td>
 <td className="py-5 px-2">
 <button onClick={() => handleSelect(slide.id)} className="transition-transform group-hover:scale-110">
 {selectedIds.includes(slide.id) ? <CheckSquare size={22} className="text-red-600 shadow-xl" /> : <Square size={22} className="text-gray-200" />}
 </button>
 </td>
 <td className="py-5 px-4">
 <div className="flex items-center gap-5">
 <div className="w-24 h-16 rounded-2xl overflow-hidden bg-gray-100 border-2 border-white shadow-premium group-hover:scale-110 transition-transform duration-500 shrink-0">
 {slide.media_type === 'video' ? (
 <video src={slide.video_url} className="w-full h-full object-cover" autoPlay loop muted playsInline />
 ) : (
 <img src={slide.image_url} className="w-full h-full object-cover" />
 )}
 </div>
 <div className="flex flex-col">
 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">{slide.media_type} Matrix</span>
 <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Index #{slide.order_index}</span>
 </div>
 </div>
 </td>
 <td className="py-5 px-4">
 <div className="flex flex-col min-w-0">
 <span className="font-black text-gray-900 truncate tracking-tight text-base group-hover:text-red-600 transition-colors uppercase ">{slide.title}</span>
 <span className="text-[10px] text-gray-400 line-clamp-1 font-bold uppercase tracking-wider mt-0.5 opacity-60 ">{slide.subtitle || 'No narrative established'}</span>
 </div>
 </td>
 <td className="py-5 px-4 text-center">
 <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${slide.is_active
 ? 'bg-green-50 text-green-700 border border-green-100 shadow-sm shadow-green-100'
 : 'bg-gray-100 text-gray-500 border border-gray-200'
 }`}>
 <span className={`w-1.5 h-1.5 rounded-full mr-2 ${slide.is_active ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
 {slide.is_active ? 'Live' : 'Draft'}
 </span>
 </td>
 <td className="py-5 px-6 text-right">
 <div className="flex items-center justify-end gap-1.5">
 <button
 onClick={() => handleEdit(slide)}
 className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-black"
 title="Edit"
 >
 <Edit2 size={16} />
 </button>
 <button
 onClick={() => handleDelete(slide.id)}
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
 </div>
 </div>
 )
 )}
 </SortableContext>
 </DndContext>
 </div>
 );
};

export default HeroManager;
