import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Link as LinkIcon, Image as ImageIcon, Layers, GripVertical, Video, PlayCircle } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { toast } from 'react-hot-toast';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem, SortableHandle } from '../components/SortableItem';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const HeroManager = () => {
    const [slides, setSlides] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);

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
        is_active: true
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
            // Optimistic update
            setSlides(newSlides);

            const updates = newSlides.map((slide, index) => ({
                id: slide.id,
                order_index: index,
                title: slide.title // Required for upsert if not partially updating, but here we just need ID and order_index if RLS allows
            }));

            // Supabase upsert doesn't support partial updates for multiple rows easily without all required fields.
            // A better way for reordering is to map and update.
            // For simplicity and reliability in this specific context:
            const { error } = await supabase.from('hero_slides').upsert(
                newSlides.map((slide, index) => ({
                    ...slide,
                    order_index: index
                }))
            );

            if (error) throw error;
        } catch (error) {
            toast.error('Failed to save new order');
            fetchSlides(); // Revert on error
        }
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setSlides((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                const newItems = arrayMove(items, oldIndex, newIndex);
                reorderMutation(newItems);
                return newItems;
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData };

            if (editingId) {
                const { error } = await supabase
                    .from('hero_slides')
                    .update(payload)
                    .eq('id', editingId);

                if (error) throw error;
                toast.success('Slide updated');
            } else {
                // Determine order_index for new slide (append to end)
                const maxOrder = slides.length > 0 ? Math.max(...slides.map(s => s.order_index)) : -1;
                payload.order_index = maxOrder + 1;

                const { error } = await supabase
                    .from('hero_slides')
                    .insert([payload]);

                if (error) throw error;
                toast.success('Slide created');
            }

            closeModal();
            fetchSlides();
        } catch (error) {
            toast.error('Error saving slide');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this slide?')) return;

        try {
            const { error } = await supabase
                .from('hero_slides')
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast.success('Slide deleted');
            fetchSlides();
        } catch (error) {
            toast.error('Error deleting slide');
        }
    };

    const openModal = (slide = null) => {
        if (slide) {
            setEditingId(slide.id);
            setFormData({
                title: slide.title,
                subtitle: slide.subtitle || '',
                description: slide.description || '',
                image_url: slide.image_url || '',
                video_url: slide.video_url || '',
                media_type: slide.media_type || 'image',
                cta_text: slide.cta_text || 'Explore',
                cta_link: slide.cta_link || '/search',
                order_index: slide.order_index || 0,
                is_active: slide.is_active
            });
        } else {
            setEditingId(null);
            setFormData({
                title: '',
                subtitle: '',
                description: '',
                image_url: '',
                video_url: '',
                media_type: 'image',
                cta_text: 'Explore',
                cta_link: '/search',
                order_index: 0,
                is_active: true
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
    };

    if (loading) return <div className="p-8 text-white flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Hero Slider Manager</h1>
                    <p className="text-white/60">Manage the homepage main visual slider. Drag to reorder.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 bg-primary hover:bg-red-700 text-white px-6 py-3 rounded-xl transition-all font-bold shadow-lg shadow-primary/30"
                >
                    <Plus size={20} />
                    New Slide
                </button>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={slides.map(s => s.id)} strategy={verticalListSortingStrategy}>
                    <div className="grid grid-cols-1 gap-6">
                        {slides.map((slide) => (
                            <SortableItem key={slide.id} id={slide.id}>
                                {(attributes, listeners) => (
                                    <div className="group bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden hover:border-primary/50 transition-all flex flex-col md:flex-row h-auto md:h-48 relative">

                                        {/* Drag Handle Overlay */}
                                        <div className="absolute left-0 top-0 bottom-0 w-8 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 hover:bg-black/40 cursor-grab active:cursor-grabbing">
                                            <SortableHandle attributes={attributes} listeners={listeners} />
                                        </div>

                                        <div className="w-full md:w-64 bg-gray-800 relative h-48 md:h-full">
                                            {slide.media_type === 'video' ? (
                                                <video src={slide.video_url} className="w-full h-full object-cover" muted loop autoPlay playsInline />
                                            ) : slide.image_url ? (
                                                <img src={slide.image_url} alt={slide.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-white/20">No Media</div>
                                            )}
                                            <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded-md text-xs font-mono">
                                                #{slide.order_index + 1}
                                            </div>
                                        </div>

                                        <div className="p-6 flex-grow flex flex-col justify-between pl-8"> {/* Added padding-left for drag handle */}
                                            <div>
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <span className="text-primary text-xs font-bold tracking-widest uppercase mb-1 block">{slide.subtitle}</span>
                                                        <h3 className="text-xl font-bold text-white mb-2">{slide.title}</h3>
                                                    </div>
                                                    <div className={`px-3 py-1 rounded-full text-xs font-black uppercase ${slide.is_active ? 'bg-green-500 text-white' : 'bg-gray-500 text-gray-200'}`}>
                                                        {slide.is_active ? 'Active' : 'Inactive'}
                                                    </div>
                                                </div>
                                                <p className="text-white/60 text-sm mb-4 line-clamp-2">{slide.description}</p>
                                            </div>

                                            <div className="flex justify-between items-end">
                                                <div className="flex items-center gap-4">
                                                    {slide.cta_link && (
                                                        <div className="flex items-center gap-1 text-white/40 text-xs text-blue-400 bg-blue-400/10 px-2 py-1 rounded">
                                                            <LinkIcon size={12} />
                                                            <span className="truncate max-w-[150px]">{slide.cta_text} ({slide.cta_link})</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => openModal(slide)}
                                                        className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(slide.id)}
                                                        className="bg-red-500/10 hover:bg-red-500/20 text-red-500 p-2 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </SortableItem>
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-[#121212] w-full max-w-2xl rounded-3xl border border-white/10 p-8 my-8">
                        <h2 className="text-2xl font-bold text-white mb-6">{editingId ? 'Edit Slide' : 'New Slide'}</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-white/60 text-xs font-bold uppercase tracking-wider mb-2">Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-white/60 text-xs font-bold uppercase tracking-wider mb-2">Subtitle</label>
                                    <input
                                        type="text"
                                        value={formData.subtitle}
                                        onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-white/60 text-xs font-bold uppercase tracking-wider mb-2">Description</label>
                                <textarea
                                    rows="2"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none resize-none"
                                />
                            </div>

                            <div className="flex gap-4 mb-4">
                                <label className={`flex-1 cursor-pointer border ${formData.media_type === 'image' ? 'border-primary bg-primary/10' : 'border-white/10 bg-white/5'} rounded-xl p-3 flex items-center justify-center gap-2 transition-all`}>
                                    <input type="radio" name="media_type" value="image" checked={formData.media_type === 'image'} onChange={() => setFormData({ ...formData, media_type: 'image' })} className="hidden" />
                                    <ImageIcon size={16} className={formData.media_type === 'image' ? 'text-primary' : 'text-white/60'} />
                                    <span className={`text-xs font-bold uppercase ${formData.media_type === 'image' ? 'text-white' : 'text-white/60'}`}>Image</span>
                                </label>
                                <label className={`flex-1 cursor-pointer border ${formData.media_type === 'video' ? 'border-primary bg-primary/10' : 'border-white/10 bg-white/5'} rounded-xl p-3 flex items-center justify-center gap-2 transition-all`}>
                                    <input type="radio" name="media_type" value="video" checked={formData.media_type === 'video'} onChange={() => setFormData({ ...formData, media_type: 'video' })} className="hidden" />
                                    <Video size={16} className={formData.media_type === 'video' ? 'text-primary' : 'text-white/60'} />
                                    <span className={`text-xs font-bold uppercase ${formData.media_type === 'video' ? 'text-white' : 'text-white/60'}`}>Video</span>
                                </label>
                            </div>

                            {formData.media_type === 'image' ? (
                                <div>
                                    <label className="block text-white/60 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                                        <ImageIcon size={12} /> Image URL
                                    </label>
                                    <input
                                        type="text"
                                        required={formData.media_type === 'image'}
                                        value={formData.image_url}
                                        onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none"
                                        placeholder="https://..."
                                    />
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-white/60 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                                        <Video size={12} /> Video URL (MP4/WebM)
                                    </label>
                                    <input
                                        type="text"
                                        required={formData.media_type === 'video'}
                                        value={formData.video_url}
                                        onChange={e => setFormData({ ...formData, video_url: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none"
                                        placeholder="https://... (Direct link to video file)"
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-white/60 text-xs font-bold uppercase tracking-wider mb-2">CTA Text</label>
                                    <input
                                        type="text"
                                        value={formData.cta_text}
                                        onChange={e => setFormData({ ...formData, cta_text: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-white/60 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                                        <LinkIcon size={12} /> CTA Link
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.cta_link}
                                        onChange={e => setFormData({ ...formData, cta_link: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 items-center">
                                {/* Order Index is now managed via drag and drop, but kept in state/DB */}
                                <div>
                                    <label className="flex items-center gap-3 cursor-pointer mt-6">
                                        <div className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.is_active ? 'bg-green-500' : 'bg-gray-600'}`}>
                                            <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform ${formData.is_active ? 'translate-x-6' : ''}`} />
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={formData.is_active}
                                            onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                            className="hidden"
                                        />
                                        <span className="text-white font-bold">Active</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={closeModal} className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl">Cancel</button>
                                <button type="submit" className="flex-1 bg-primary hover:bg-red-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/30">
                                    {editingId ? 'Update Slide' : 'Create Slide'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HeroManager;
