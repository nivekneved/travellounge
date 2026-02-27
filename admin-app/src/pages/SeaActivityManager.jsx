import React, { useState } from 'react';
import { useEntityManager } from '../hooks/useEntityManager';
import ManagerLayout from '../components/ManagerLayout';
import {
    Waves, Edit2, Trash2, Clock,
    TrendingUp, Globe, ArrowRight, Anchor
} from 'lucide-react';
import MediaPicker from '../components/MediaPicker';

const SeaActivityManager = () => {
    const [view, setView] = useState('list');
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    const initialFormState = {
        name: '',
        category: 'activities',
        type: 'Sea',
        description: '',
        pricing: { price: 0 },
        duration: '',
        images: [],
        location: '',
        is_active: true,
        display_order: 0
    };

    const [formData, setFormData] = useState(initialFormState);

    const {
        data: activities,
        isLoading,
        save,
        deleteMutation,
        isSaving
    } = useEntityManager('services', {
        filter: { category: 'activities' },
        orderColumn: 'display_order',
        ascending: true,
        onSaveSuccess: () => resetForm()
    });

    const seaActivities = activities.filter(a => a.type === 'Sea' || a.category === 'activities');

    const resetForm = () => {
        setFormData(initialFormState);
        setEditingId(null);
        setView('list');
    };

    const handleEdit = (activity) => {
        setFormData({
            name: activity.name || '',
            category: activity.category || 'activities',
            type: activity.type || 'Sea',
            description: activity.description || '',
            pricing: activity.pricing || { price: 0 },
            duration: activity.duration || '',
            images: activity.images || [],
            location: activity.location || '',
            is_active: activity.is_active !== false,
            display_order: activity.display_order || 0
        });
        setEditingId(activity.id);
        setView('edit');
    };

    const handleSave = () => {
        const payload = {
            ...formData,
            category: 'activities',
            type: 'Sea'
        };
        save(editingId, payload);
    };

    const filteredActivities = seaActivities.filter(activity => {
        const searchStr = searchTerm.toLowerCase();
        return (
            activity.name?.toLowerCase().includes(searchStr) ||
            activity.location?.toLowerCase().includes(searchStr) ||
            activity.description?.toLowerCase().includes(searchStr)
        );
    });

    const stats = [
        { label: 'Marine Inventory', value: seaActivities.length, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Active Channels', value: seaActivities.filter(a => a.is_active).length, icon: Globe, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Port Clusters', value: [...new Set(seaActivities.map(a => a.location))].filter(Boolean).length, icon: Anchor, color: 'text-indigo-600', bg: 'bg-indigo-50' }
    ];

    const columns = [
        { header: 'Entity Asset' },
        { header: 'Experience' },
        { header: 'Launch Point' },
        { header: 'Params' },
        { header: 'Commercial' },
        { header: 'Status', align: 'center' },
        { header: 'Matrix Actions', align: 'right' }
    ];

    return (
        <ManagerLayout
            title="Sea Experiences"
            subtitle="Marine Expedition & Aquatic Architecture"
            icon={Waves}
            stats={stats}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            searchPlaceholder="SEARCH MARINE REGISTRY..."
            onAdd={() => { resetForm(); setView('edit'); }}
            addLabel="Deploy New Experience"
            view={view}
            setView={setView}
            editingId={editingId}
            onSubmit={handleSave}
            isSaving={isSaving}
            isLoading={isLoading}
            columns={columns}
            data={filteredActivities}
            renderRow={(activity) => (
                <tr key={activity.id} className="transition-all hover:bg-slate-50/80 group align-middle">
                    <td className="py-6 px-8">
                        <div className="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 shadow-sm group-hover:scale-105 transition-transform duration-700 relative">
                            {activity.images?.[0] ? (
                                <img src={activity.images[0]} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                    <Waves size={32} strokeWidth={1.5} />
                                </div>
                            )}
                        </div>
                    </td>
                    <td className="py-6 px-4">
                        <div className="flex flex-col">
                            <span className="font-black text-slate-900 text-lg tracking-tight group-hover:text-blue-600 transition-colors uppercase leading-tight line-clamp-1">{activity.name}</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 opacity-60">ID: {activity.id.slice(0, 8)}</span>
                        </div>
                    </td>
                    <td className="py-6 px-4">
                        <div className="flex items-center gap-2">
                            <Anchor size={12} className="text-blue-600" />
                            <span className="text-xs font-black text-slate-600 uppercase tracking-widest">{activity.location || 'N/A'}</span>
                        </div>
                    </td>
                    <td className="py-6 px-4">
                        <div className="flex items-center gap-2">
                            <Clock size={12} className="text-amber-500" />
                            <span className="text-xs font-black text-slate-600 uppercase tracking-widest">{activity.duration || 'N/A'}</span>
                        </div>
                    </td>
                    <td className="py-6 px-4">
                        <div className="flex flex-col">
                            <span className="text-base font-black text-slate-900">Rs {activity.pricing?.price || '0'}</span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">PER PERSON</span>
                        </div>
                    </td>
                    <td className="py-6 px-4 text-center">
                        <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border transition-all ${activity.is_active !== false ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                            <span className={`w-2 h-2 rounded-full mr-2 ${activity.is_active !== false ? 'bg-blue-500 animate-pulse' : 'bg-slate-400'}`}></span>
                            {activity.is_active !== false ? 'Live' : 'Draft'}
                        </div>
                    </td>
                    <td className="py-6 px-8 text-right">
                        <div className="flex items-center justify-end gap-3 transition-all duration-300">
                            <button onClick={() => handleEdit(activity)} className="p-3 bg-white text-slate-600 border border-slate-100 hover:bg-slate-950 hover:text-white rounded-2xl transition-all shadow-premium-sm"><Edit2 size={16} /></button>
                            <button onClick={() => { if (window.confirm('IRREVERSIBLE: PURGE THIS EXPERIENCE?')) deleteMutation.mutate(activity.id); }} className="p-3 bg-white text-red-600 border border-slate-100 hover:bg-red-600 hover:text-white rounded-2xl transition-all shadow-premium-sm"><Trash2 size={16} /></button>
                        </div>
                    </td>
                </tr>
            )}
            renderForm={() => (
                <div className="space-y-12">
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Marine Identity</h3>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Experience Label</label>
                                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:bg-white outline-none transition-all font-black text-slate-900 placeholder:text-slate-300" placeholder="e.g. Sunset Catamaran Cruise" />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Launch Point</label>
                                    <div className="relative">
                                        <Anchor className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900" placeholder="e.g. Grand Baie" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Duration</label>
                                    <div className="relative">
                                        <Clock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input type="text" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900" placeholder="e.g. 2 Hours" />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expedition Brief</label>
                                <textarea rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-medium text-slate-600 resize-none" placeholder="Describe the marine experience parameters..." />
                            </div>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Visual & Commercial</h3>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Commercial Value (Rs)</label>
                                <input type="number" value={formData.pricing.price} onChange={(e) => setFormData({ ...formData, pricing: { ...formData.pricing, price: e.target.value } })}
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-900" placeholder="3500" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hero Asset (URL)</label>
                                <div className="flex gap-4">
                                    <input type="url" value={formData.images[0] || ''} onChange={(e) => setFormData({ ...formData, images: [e.target.value] })}
                                        className="flex-1 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs" placeholder="https://images.unsplash.com/..." />
                                    <button type="button" onClick={() => setIsPickerOpen(true)} className="px-6 bg-slate-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">Picker</button>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-lg ${formData.is_active ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-400'}`}><Waves size={18} /></div>
                                    <div>
                                        <p className="text-xs font-black text-slate-900 uppercase">Visibility Status</p>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{formData.is_active ? 'Live on Digital Marketplace' : 'Offline / Internal Draft'}</p>
                                    </div>
                                </div>
                                <button type="button" onClick={() => setFormData({ ...formData, is_active: !formData.is_active })} className={`w-14 h-8 rounded-full p-1 transition-all ${formData.is_active ? 'bg-blue-600' : 'bg-slate-300'}`}>
                                    <div className={`w-6 h-6 bg-white rounded-full transition-transform ${formData.is_active ? 'translate-x-6' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            )}
            renderPreview={() => (
                <div className="w-full max-w-[340px] bg-white rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-500 m-auto mt-20">
                    <div className="h-[200px] relative overflow-hidden">
                        <img src={formData.images[0] || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80'} className="w-full h-full object-cover" alt="" />
                        <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight">Active</div>
                        <div className="absolute bottom-4 left-4 bg-blue-600/40 backdrop-blur-md p-2 rounded-xl text-white border border-white/20"><Waves size={16} /></div>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight line-clamp-2">{formData.name || 'Untitled Expedition'}</h4>
                            <div className="flex items-center gap-3 mt-2 text-slate-400">
                                <div className="flex items-center gap-1"><Anchor size={10} /><span className="text-[9px] font-black uppercase">{formData.location || 'N/A'}</span></div>
                                <div className="flex items-center gap-1"><Clock size={10} /><span className="text-[9px] font-black uppercase">{formData.duration || 'N/A'}</span></div>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-lg font-black text-slate-900">Rs {formData.pricing.price || '0'}</span>
                            <div className="h-10 w-10 bg-blue-600 text-white rounded-full flex items-center justify-center"><ArrowRight size={18} /></div>
                        </div>
                    </div>
                </div>
            )}
            mediaPicker={<MediaPicker isOpen={isPickerOpen} onClose={() => setIsPickerOpen(false)} onSelect={(url) => setFormData({ ...formData, images: [url] })} type="image" />}
        />
    );
};

export default SeaActivityManager;
