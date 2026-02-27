import React, { useState } from 'react';
import { useEntityManager } from '../hooks/useEntityManager';
import ManagerLayout from '../components/ManagerLayout';
import {
    Layers, Edit2, Trash2, Layout,
    TrendingUp, Globe, ArrowRight, ImageIcon
} from 'lucide-react';
import MediaPicker from '../components/MediaPicker';

const CategoryManager = () => {
    const [view, setView] = useState('list');
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    const initialFormState = {
        name: '',
        slug: '',
        description: '',
        image_url: '',
        is_active: true,
        display_order: 0
    };

    const [formData, setFormData] = useState(initialFormState);

    const {
        data: categories,
        isLoading,
        save,
        deleteMutation,
        isSaving
    } = useEntityManager('categories', {
        orderColumn: 'display_order',
        ascending: true,
        onSaveSuccess: () => resetForm()
    });

    const resetForm = () => {
        setFormData(initialFormState);
        setEditingId(null);
        setView('list');
    };

    const handleEdit = (category) => {
        setFormData({
            name: category.name || '',
            slug: category.slug || '',
            description: category.description || '',
            image_url: category.image_url || '',
            is_active: category.is_active !== false,
            display_order: category.display_order || 0
        });
        setEditingId(category.id);
        setView('edit');
    };

    const handleSave = () => {
        const payload = {
            ...formData,
            slug: formData.slug || formData.name.toLowerCase().replace(/ /g, '-')
        };
        save(editingId, payload);
    };

    const filteredCategories = categories.filter(category => {
        const searchStr = searchTerm.toLowerCase();
        return (
            category.name?.toLowerCase().includes(searchStr) ||
            category.slug?.toLowerCase().includes(searchStr) ||
            category.description?.toLowerCase().includes(searchStr)
        );
    });

    const stats = [
        { label: 'Market Segments', value: categories.length, icon: Layout, color: 'text-slate-900', bg: 'bg-slate-50' },
        { label: 'Active Channels', value: categories.filter(c => c.is_active).length, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Index Coverage', value: '100%', icon: Globe, color: 'text-blue-600', bg: 'bg-blue-50' }
    ];

    const columns = [
        { header: 'Teaser Asset' },
        { header: 'Segment' },
        { header: 'Slug Handle' },
        { header: 'Priority' },
        { header: 'Visibility', align: 'center' },
        { header: 'Matrix Actions', align: 'right' }
    ];

    return (
        <ManagerLayout
            title="Ecosystem Taxonomy"
            subtitle="Market Segment & Inventory Classification Architecture"
            icon={Layers}
            stats={stats}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            searchPlaceholder="SEARCH TAXONOMY REGISTRY..."
            onAdd={() => { resetForm(); setView('edit'); }}
            addLabel="Define New Segment"
            view={view}
            setView={setView}
            editingId={editingId}
            onSubmit={handleSave}
            isSaving={isSaving}
            isLoading={isLoading}
            columns={columns}
            data={filteredCategories}
            renderRow={(category) => (
                <tr key={category.id} className="transition-all hover:bg-slate-50/80 group align-middle">
                    <td className="py-6 px-8">
                        <div className="w-20 h-24 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 shadow-sm group-hover:scale-105 transition-transform duration-700 relative">
                            {category.image_url ? (
                                <img src={category.image_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                    <ImageIcon size={24} strokeWidth={1.5} />
                                </div>
                            )}
                        </div>
                    </td>
                    <td className="py-6 px-4">
                        <div className="flex flex-col">
                            <span className="font-black text-slate-900 text-lg tracking-tight group-hover:text-indigo-600 transition-colors uppercase">{category.name}</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 opacity-60">ID: {category.id.slice(0, 8)}</span>
                        </div>
                    </td>
                    <td className="py-6 px-4">
                        <span className="px-3 py-1 bg-slate-100 text-[10px] font-black text-slate-500 rounded-lg uppercase tracking-widest border border-slate-200">{category.slug}</span>
                    </td>
                    <td className="py-6 px-4 text-center">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 text-slate-900 font-black text-xs">
                            {category.display_order}
                        </div>
                    </td>
                    <td className="py-6 px-4 text-center">
                        <div className={`inline-flex items-center px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border transition-all ${category.is_active !== false ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                            <span className={`w-2 h-2 rounded-full mr-2.5 ${category.is_active !== false ? 'bg-indigo-500 animate-pulse' : 'bg-slate-400'}`}></span>
                            {category.is_active !== false ? 'Indexed' : 'Draft'}
                        </div>
                    </td>
                    <td className="py-6 px-8 text-right">
                        <div className="flex items-center justify-end gap-3 transition-all duration-300">
                            <button onClick={() => handleEdit(category)} className="p-3 bg-white text-slate-600 border border-slate-100 hover:bg-slate-950 hover:text-white rounded-2xl transition-all shadow-premium-sm"><Edit2 size={16} /></button>
                            <button onClick={() => { if (window.confirm('IRREVERSIBLE: PURGE THIS TAXONOMY ELEMENT?')) deleteMutation.mutate(category.id); }} className="p-3 bg-white text-red-600 border border-slate-100 hover:bg-red-600 hover:text-white rounded-2xl transition-all shadow-premium-sm"><Trash2 size={16} /></button>
                        </div>
                    </td>
                </tr>
            )}
            renderForm={() => (
                <div className="space-y-12">
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-1 h-6 bg-slate-900 rounded-full"></div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Taxonomy Identity</h3>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category Label</label>
                                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-slate-900/10 focus:bg-white outline-none transition-all font-black text-slate-900 uppercase" placeholder="e.g. Luxury Cruises" />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Slug Handle</label>
                                    <input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-900" placeholder="luxury-cruises" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Display Priority</label>
                                    <input type="number" value={formData.display_order} onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-900" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description Brief</label>
                                <textarea rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-medium text-slate-600 resize-none" placeholder="Describe the category parameters..." />
                            </div>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-1 h-6 bg-slate-900 rounded-full"></div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Visual Assets</h3>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Teaser Asset (URL)</label>
                                <div className="flex gap-4">
                                    <input type="url" value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                        className="flex-1 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-xs" />
                                    <button type="button" onClick={() => setIsPickerOpen(true)} className="px-6 bg-slate-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">Picker</button>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-lg ${formData.is_active ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-400'}`}><TrendingUp size={18} /></div>
                                    <div>
                                        <p className="text-xs font-black text-slate-900 uppercase">Indexing Status</p>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{formData.is_active ? 'Indexed in Global Navigation' : 'Hidden from Exploration'}</p>
                                    </div>
                                </div>
                                <button type="button" onClick={() => setFormData({ ...formData, is_active: !formData.is_active })} className={`w-14 h-8 rounded-full p-1 transition-all ${formData.is_active ? 'bg-slate-900' : 'bg-slate-300'}`}>
                                    <div className={`w-6 h-6 bg-white rounded-full transition-transform ${formData.is_active ? 'translate-x-6' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            )}
            renderPreview={() => (
                <div className="w-full max-w-[340px] group cursor-pointer animate-in fade-in zoom-in duration-500">
                    <div className="relative aspect-[4/5] rounded-[32px] overflow-hidden shadow-2xl">
                        <img src={formData.image_url || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80'} className="w-full h-full object-cover" alt="" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                        <div className="absolute inset-0 p-8 flex flex-col justify-end">
                            <div className="space-y-2">
                                <h4 className="text-3xl font-black text-white uppercase tracking-tight leading-[1.1]">{formData.name || 'Untitled Segment'}</h4>
                                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest line-clamp-2">{formData.description || 'Define your category architecture here.'}</p>
                                <div className="pt-4 flex items-center gap-3">
                                    <div className="h-10 w-10 bg-white text-slate-950 rounded-full flex items-center justify-center"><ArrowRight size={18} /></div>
                                    <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Discover more</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            mediaPicker={<MediaPicker isOpen={isPickerOpen} onClose={() => setIsPickerOpen(false)} onSelect={(url) => setFormData({ ...formData, image_url: url })} type="image" />}
        />
    );
};

export default CategoryManager;
