/* eslint-disable unused-imports/no-unused-vars */
import React, { useState, useMemo } from 'react';
import { useEntityManager } from '../hooks/useEntityManager';
import ManagerLayout from '../components/ManagerLayout';
import { Tag, Clock, TrendingUp, ImageIcon, Calendar, Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const PromotionManager = () => {
    const [view, setView] = useState('list'); // 'list' or 'edit'
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image: '',
        link: '',
        valid_until: '',
        is_active: true
    });

    const {
        data: promotions,
        isLoading,
        save,
        deleteMutation,
        isSaving
    } = useEntityManager('promotions', {
        orderColumn: 'created_at',
        ascending: false,
        onSaveSuccess: () => resetForm()
    });

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
        setView('list');
    };

    const handleEdit = (promo) => {
        setFormData({
            title: promo.title || '',
            description: promo.description || '',
            image: promo.image || '',
            link: promo.link || '',
            valid_until: promo.valid_until || '',
            is_active: promo.is_active !== undefined ? promo.is_active : true
        });
        setEditingId(promo.id);
        setView('edit');
    };

    const filteredPromotions = useMemo(() => {
        return promotions.filter(p =>
            p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [promotions, searchTerm]);

    const stats = [
        { label: 'Live Offers', value: promotions.filter(p => p.is_active).length, icon: Tag, color: 'text-red-600', bg: 'bg-red-50' },
        { label: 'Expiring Soon', value: promotions.filter(p => p.valid_until && new Date(p.valid_until).getTime() < new Date().getTime() + 7 * 24 * 60 * 60 * 1000).length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Impact Level', value: 'High', icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' }
    ];

    const columns = [
        { header: 'Campaign' },
        { header: 'Expiration' },
        { header: 'Status', align: 'center' },
        { header: 'Actions', align: 'right' }
    ];

    return (
        <ManagerLayout
            title="Campaign Center"
            subtitle="Marketing Configuration Hub"
            icon={Tag}
            stats={stats}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            searchPlaceholder="Search campaigns..."
            onAdd={() => { resetForm(); setView('edit'); }}
            addLabel="Launch Campaign"
            view={view}
            setView={setView}
            editingId={editingId}
            onSubmit={() => save(editingId, formData)}
            isSaving={isSaving}
            isLoading={isLoading}
            columns={columns}
            data={filteredPromotions}
            renderRow={(promo) => (
                <tr key={promo.id} className="transition-all hover:bg-slate-50 group align-middle">
                    <td className="py-8 px-8">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-3xl bg-gray-100 flex items-center justify-center text-gray-400 overflow-hidden shrink-0 border-4 border-white shadow-xl group-hover:scale-110 transition-all duration-500">
                                {promo.image ? <img src={promo.image} alt="" className="w-full h-full object-cover" /> : <TrendingUp size={24} />}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="font-black text-slate-900 truncate text-lg uppercase tracking-tight">{promo.title}</span>
                                <span className="text-[11px] text-slate-400 font-bold line-clamp-1 uppercase tracking-wider mt-1">{promo.description}</span>
                            </div>
                        </div>
                    </td>
                    <td className="py-8 px-8">
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-black uppercase tracking-widest">
                            <Calendar size={16} className="text-red-500" />
                            {promo.valid_until ? format(new Date(promo.valid_until), 'MMM d, yyyy') : 'No Expiry'}
                        </div>
                    </td>
                    <td className="py-8 px-8 text-center">
                        <span className={`inline-flex items-center px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${promo.is_active ? 'bg-green-50 text-green-700 border-green-100 shadow-sm' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-2 ${promo.is_active ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                            {promo.is_active ? 'Live' : 'Draft'}
                        </span>
                    </td>
                    <td className="py-8 px-8 text-right">
                        <div className="flex items-center justify-end gap-3 transition-all duration-300">
                            <button onClick={() => handleEdit(promo)} className="p-3 bg-white text-slate-900 border border-slate-100 hover:bg-slate-950 hover:text-white rounded-2xl transition-all shadow-premium-sm" title="Edit"><Edit2 size={18} /></button>
                            <button onClick={() => { if (window.confirm('IRREVERSIBLE: DELETE CAMPAIGN?')) deleteMutation.mutate(promo.id); }} className="p-3 bg-white text-red-600 border border-slate-100 hover:bg-red-600 hover:text-white rounded-2xl transition-all shadow-premium-sm" title="Delete"><Trash2 size={18} /></button>
                        </div>
                    </td>
                </tr>
            )}
            renderForm={() => (
                <>
                    <section className="space-y-8">
                        <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs ">01</div>
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Offer Information</h3>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Campaign Title</label>
                                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:bg-white focus:border-red-500 outline-none transition-all font-black text-gray-900" placeholder="Early Bird 2026" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Promotional Description</label>
                                <textarea rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:bg-white focus:border-red-500 outline-none transition-all font-bold text-gray-600 text-sm resize-none" placeholder="Get 15% off when you book 6 months in advance..." />
                            </div>
                        </div>
                    </section>
                    <section className="space-y-8">
                        <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs ">02</div>
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Visual & Mechanics</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2 col-span-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Hero Asset URL</label>
                                <input type="url" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:bg-white focus:border-red-500 outline-none transition-all font-bold text-sm" placeholder="https://unsplash.com/..." />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Expiry Date</label>
                                <input type="date" value={formData.valid_until} onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:bg-white focus:border-red-500 outline-none transition-all font-bold text-sm" />
                            </div>
                            <div className="space-y-2 text-right">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mr-1">Active Status</label>
                                <div className="flex justify-end p-2 px-4 bg-gray-50 rounded-2xl border border-gray-200 h-[60px] items-center">
                                    <button type="button" onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                                        className={`w-14 h-7 rounded-full relative transition-all duration-300 ${formData.is_active ? 'bg-green-500' : 'bg-gray-300'}`}>
                                        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 ${formData.is_active ? 'left-8' : 'left-1'}`}></div>
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2 col-span-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Action Destination (CTA Link)</label>
                                <input type="url" value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:bg-white focus:border-red-500 outline-none transition-all font-bold text-sm" placeholder="https://travellounge.mu/deals/..." />
                            </div>
                        </div>
                    </section>
                </>
            )}
            renderPreview={() => (
                <div className="w-full h-full bg-slate-50 relative flex flex-col items-center justify-center p-8 overflow-y-auto no-scrollbar">
                    <div className="w-full max-w-md bg-white rounded-[32px] overflow-hidden shadow-2xl border border-slate-100 group transition-all">
                        <div className="relative aspect-[16/9] overflow-hidden">
                            {formData.image ? (
                                <img src={formData.image} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-200"><ImageIcon size={64} /></div>
                            )}
                            <div className="absolute top-4 right-4 px-4 py-1.5 bg-red-600 text-white text-[8px] font-black uppercase tracking-widest rounded-full shadow-lg">Special Offer</div>
                        </div>
                        <div className="p-8 space-y-4">
                            <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-tight">{formData.title || 'Campaign Headline'}</h4>
                            <p className="text-slate-400 text-sm font-medium leading-relaxed">{formData.description || 'Campaign narrative and value proposition will be displayed here for customer engagement.'}</p>
                            <div className="pt-4 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-[10px] font-black text-red-600 uppercase">
                                    <Clock size={14} />
                                    {formData.valid_until ? (
                                        (() => {
                                            try {
                                                return format(new Date(formData.valid_until), 'MMM d, yyyy');
                                            } catch (e) {
                                                return 'Valid Date Required';
                                            }
                                        })()
                                    ) : 'Limited Time'}
                                </div>
                                <div className="px-6 py-3 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg">Claim Offer</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        />
    );
};

export default PromotionManager;
