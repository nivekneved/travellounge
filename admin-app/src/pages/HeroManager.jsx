import React, { useState, useMemo } from 'react';
import { useEntityManager } from '../hooks/useEntityManager';
import ManagerLayout from '../components/ManagerLayout';
import {
    LayoutTemplate, Image as ImageIcon, Video, AlignCenter, AlignLeft, AlignRight, Zap, Trash2, Edit2
} from 'lucide-react';
import MediaPicker from '../components/MediaPicker';

const HeroManager = () => {
    const [view, setView] = useState('grid');
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [pickerTarget, setPickerTarget] = useState('image_url');

    const initialFormState = {
        title: '',
        subtitle: '',
        description: '',
        image_url: '',
        video_url: '',
        media_type: 'image',
        cta_text: 'Explore',
        cta_link: '/search',
        is_active: true,
        alignment: 'center',
        overlay_opacity: 0.4
    };

    const [formData, setFormData] = useState(initialFormState);

    const {
        data: slides,
        isLoading,
        save,
        deleteMutation,
        isSaving
    } = useEntityManager('hero_slides', {
        orderColumn: 'created_at',
        ascending: false,
        onSaveSuccess: () => resetForm()
    });

    const resetForm = () => {
        setFormData(initialFormState);
        setEditingId(null);
        setView('grid');
    };

    const handleEdit = (slide) => {
        setFormData(slide);
        setEditingId(slide.id);
        setView('edit');
    };

    const openPicker = (target) => {
        setPickerTarget(target);
        setIsPickerOpen(true);
    };

    const filteredSlides = useMemo(() => {
        return slides.filter(s => {
            const searchStr = searchTerm.toLowerCase();
            return (
                s.title?.toLowerCase().includes(searchStr) ||
                s.subtitle?.toLowerCase().includes(searchStr)
            );
        });
    }, [slides, searchTerm]);

    const stats = [
        { label: 'Active Sequences', value: slides.filter(s => s.is_active).length, icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Video Assets', value: slides.filter(s => s.media_type === 'video').length, icon: Video, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Total Banners', value: slides.length, icon: ImageIcon, color: 'text-purple-600', bg: 'bg-purple-50' }
    ];

    const columns = [
        { header: 'Visual Matrix' },
        { header: 'Narrative Structure' },
        { header: 'Status', align: 'center' },
        { header: 'Actions', align: 'right' }
    ];

    return (
        <>
            <ManagerLayout
                title="Hero Narrative"
                subtitle="Visual Pulse & Promotional Banners"
                icon={LayoutTemplate}
                stats={stats}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                searchPlaceholder="Search banners..."
                onAdd={() => { resetForm(); setView('edit'); }}
                addLabel="Launch Experience"
                view={view}
                setView={setView}
                editingId={editingId}
                onSubmit={() => save(editingId, formData)}
                isSaving={isSaving}
                isLoading={isLoading}
                columns={columns}
                data={filteredSlides}
                renderRow={(slide) => (
                    <tr key={slide.id} className="transition-all hover:bg-slate-50 group align-middle">
                        <td className="py-6 px-8">
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shadow-sm relative shrink-0">
                                    {slide.media_type === 'video' ? <video src={slide.video_url} className="w-full h-full object-cover" /> : <img src={slide.image_url} className="w-full h-full object-cover" />}
                                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                                        {slide.media_type === 'video' ? <Video size={12} className="text-white" /> : <ImageIcon size={12} className="text-white" />}
                                    </div>
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{slide.media_type} Matrix</span>
                            </div>
                        </td>
                        <td className="py-6 px-8">
                            <div className="flex flex-col">
                                <span className="font-black text-slate-900 text-sm uppercase tracking-tight">{slide.title}</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 line-clamp-1">{slide.subtitle || 'No narrative établi'}</span>
                            </div>
                        </td>
                        <td className="py-6 px-8 text-center">
                            <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${slide.is_active ? 'bg-green-50 text-green-700 border-green-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                {slide.is_active ? 'Deployed' : 'Draft'}
                            </span>
                        </td>
                        <td className="py-6 px-8 text-right">
                            <div className="flex items-center justify-end gap-2 transition-all duration-300">
                                <button onClick={() => handleEdit(slide)} className="p-2.5 bg-white text-slate-900 border border-slate-100 hover:bg-slate-950 hover:text-white rounded-xl transition-all shadow-premium-sm" title="Edit Narrative Layer"><Edit2 size={16} /></button>
                                <button onClick={() => { if (window.confirm('Expunge this slide from sequence?')) deleteMutation.mutate(slide.id); }} className="p-2.5 bg-white text-red-600 border border-slate-100 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-premium-sm" title="Delete"><Trash2 size={16} /></button>
                            </div>
                        </td>
                    </tr>
                )}
                renderForm={() => (
                    <div className="space-y-12">
                        <section className="space-y-8">
                            <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs ">01</div>
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Visual Matrix</h3>
                            </div>
                            <div className="flex p-1 bg-gray-100 rounded-2xl border border-gray-200">
                                <button onClick={() => setFormData({ ...formData, media_type: 'image' })} className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl transition-all font-black text-[11px] uppercase tracking-wider ${formData.media_type === 'image' ? 'bg-white text-slate-900 shadow-premium border border-gray-200' : 'text-gray-400 hover:text-gray-600'}`}>
                                    <ImageIcon size={18} /> Static Post
                                </button>
                                <button onClick={() => setFormData({ ...formData, media_type: 'video' })} className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl transition-all font-black text-[11px] uppercase tracking-wider ${formData.media_type === 'video' ? 'bg-white text-slate-900 shadow-premium border border-gray-200' : 'text-gray-400 hover:text-gray-600'}`}>
                                    <Video size={18} /> Motion Path
                                </button>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Asset Source URL</label>
                                <div className="flex gap-3">
                                    <input type="url" value={formData.media_type === 'video' ? formData.video_url : formData.image_url} onChange={(e) => setFormData({ ...formData, [formData.media_type === 'video' ? 'video_url' : 'image_url']: e.target.value })}
                                        className="flex-1 px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-sm" placeholder="https://..." />
                                    <button onClick={() => openPicker(formData.media_type === 'video' ? 'video_url' : 'image_url')} className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all">
                                        <ImageIcon size={20} />
                                    </button>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-8">
                            <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs ">02</div>
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Narrative Layer</h3>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Headline Content</label>
                                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-black text-gray-900 text-lg" placeholder="Enter Marquee Title..." />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Subheadline / Supporting Story</label>
                                <textarea rows={3} value={formData.subtitle} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-gray-600 text-sm resize-none" placeholder="Supporting narrative layers..." />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Action Label</label>
                                    <input type="text" value={formData.cta_text} onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-black text-[11px] uppercase tracking-[0.2em]" placeholder="BUTTON TEXT" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Path Destination</label>
                                    <input type="text" value={formData.cta_link} onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-gray-400 text-sm" placeholder="/search" />
                                </div>
                            </div>
                        </section>

                        <section className="space-y-8">
                            <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs ">03</div>
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Dynamics & Deployment</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Type Alignment</label>
                                    <div className="flex p-1 bg-gray-100 rounded-2xl border border-gray-200">
                                        <button onClick={() => setFormData({ ...formData, alignment: 'left' })} className={`flex-1 py-3 rounded-xl flex items-center justify-center transition-all ${formData.alignment === 'left' ? 'bg-white shadow-premium text-red-600 border border-gray-200' : 'text-gray-400 hover:text-gray-600'}`}><AlignLeft size={18} /></button>
                                        <button onClick={() => setFormData({ ...formData, alignment: 'center' })} className={`flex-1 py-3 rounded-xl flex items-center justify-center transition-all ${formData.alignment === 'center' ? 'bg-white shadow-premium text-red-600 border border-gray-200' : 'text-gray-400 hover:text-gray-600'}`}><AlignCenter size={18} /></button>
                                        <button onClick={() => setFormData({ ...formData, alignment: 'right' })} className={`flex-1 py-3 rounded-xl flex items-center justify-center transition-all ${formData.alignment === 'right' ? 'bg-white shadow-premium text-red-600 border border-gray-200' : 'text-gray-400 hover:text-gray-600'}`}><AlignRight size={18} /></button>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Deployment status</label>
                                    <button onClick={() => setFormData({ ...formData, is_active: !formData.is_active })} className={`w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest border transition-all ${formData.is_active ? 'bg-red-600 text-white border-red-700 shadow-xl shadow-red-600/20' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                                        {formData.is_active ? 'Active Rotation' : 'Engine Standby'}
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>
                )}
                renderPreview={() => (
                    formData.media_type === 'video' && formData.video_url ? (
                        <video src={formData.video_url} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                    ) : formData.image_url ? (
                        <img src={formData.image_url} className="w-full h-full object-cover animate-slow-zoom" />
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-800 gap-4">
                            <ImageIcon size={120} strokeWidth={0.5} />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Empty Matrix Cell</span>
                        </div>
                    )
                )}

            />
            <MediaPicker isOpen={isPickerOpen} onClose={() => setIsPickerOpen(false)} onSelect={(url) => setFormData(prev => ({ ...prev, [pickerTarget]: url }))} type={formData.media_type} />
            <style dangerouslySetInnerHTML={{ __html: `@keyframes slow-zoom { from { transform: scale(1); } to { transform: scale(1.1); } } .animate-slow-zoom { animation: slow-zoom 20s linear infinite alternate; }` }} />
        </>
    );
};

export default HeroManager;
