import React, { useState, useMemo } from 'react';
import { useEntityManager } from '../hooks/useEntityManager';
import ManagerLayout from '../components/ManagerLayout';
import {
    MessageSquare, User, MapPin, Star, ThumbsUp,
    Edit2, Trash2, Plus, Save, Search, Filter,
    CheckCircle, XCircle, Clock, Quote
} from 'lucide-react';

const TestimonialManager = () => {
    const [view, setView] = useState('grid');
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const initialFormState = {
        customer_name: '',
        avatar_url: '',
        content: '',
        rating: 5,
        is_featured: false,
        is_approved: true
    };

    const [formData, setFormData] = useState(initialFormState);

    const {
        data: testimonials,
        isLoading,
        save,
        deleteMutation,
        isSaving
    } = useEntityManager('testimonials', {
        orderColumn: 'created_at',
        ascending: false,
        onSaveSuccess: () => resetForm()
    });

    const resetForm = () => {
        setFormData(initialFormState);
        setEditingId(null);
        setView('grid');
    };

    const handleEdit = (testimonial) => {
        setFormData(testimonial);
        setEditingId(testimonial.id);
        setView('edit');
    };

    const filteredTestimonials = useMemo(() => {
        return testimonials.filter(t => {
            const searchStr = searchTerm.toLowerCase();
            const matchesSearch = (
                t.customer_name?.toLowerCase().includes(searchStr) ||
                t.content?.toLowerCase().includes(searchStr)
            );

            const matchesStatus = filterStatus === 'all' ||
                (filterStatus === 'featured' && t.is_featured) ||
                (filterStatus === 'approved' && t.is_approved) ||
                (filterStatus === 'pending' && !t.is_approved);

            return matchesSearch && matchesStatus;
        });
    }, [testimonials, searchTerm, filterStatus]);

    const stats = [
        { label: 'Total Stories', value: testimonials.length, icon: MessageSquare, color: 'text-red-600', bg: 'bg-red-50' },
        { label: 'Featured', value: testimonials.filter(t => t.is_featured).length, icon: ThumbsUp, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Approved', value: testimonials.filter(t => t.is_approved).length, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' }
    ];

    const columns = [
        { header: 'Traveler Narrative' },
        { header: 'Satisfaction Index' },
        { header: 'Status', align: 'center' },
        { header: 'Actions', align: 'right' }
    ];

    return (
        <ManagerLayout
            title="Voice of the Traveler"
            subtitle="Curate and Showcase Authentic Client Stories"
            icon={MessageSquare}
            stats={stats}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            searchPlaceholder="Search testimonials..."
            onAdd={() => { resetForm(); setView('edit'); }}
            addLabel="Collect Story"
            view={view}
            setView={setView}
            editingId={editingId}
            onSubmit={() => save(editingId, formData)}
            isSaving={isSaving}
            isLoading={isLoading}
            columns={columns}
            data={filteredTestimonials}
            renderRow={(testimonial) => (
                <tr key={testimonial.id} className="transition-all hover:bg-slate-50 group align-middle">
                    <td className="py-6 px-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center font-black text-lg shadow-lg shrink-0">
                                {testimonial.avatar_url ? <img src={testimonial.avatar_url} className="w-full h-full object-cover rounded-2xl" /> : testimonial.customer_name?.charAt(0)}
                            </div>
                            <div className="flex flex-col max-w-md">
                                <span className="font-black text-slate-900 text-sm uppercase tracking-tight">{testimonial.customer_name}</span>
                                <span className="text-[10px] text-slate-400 font-medium italic line-clamp-1 mt-0.5 opacity-80">"{testimonial.content}"</span>
                            </div>
                        </div>
                    </td>
                    <td className="py-6 px-8">
                        <div className="flex items-center gap-1 text-amber-500">
                            {[...Array(testimonial.rating)].map((_, i) => <Star key={i} size={14} fill="currentColor" strokeWidth={1} />)}
                        </div>
                    </td>
                    <td className="py-6 px-8 text-center text-[10px] font-black uppercase tracking-widest">
                        <div className="flex flex-col gap-1.5 items-center">
                            <span className={`px-4 py-1.5 rounded-xl border transition-all ${testimonial.is_approved ? 'bg-green-50 text-green-700 border-green-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                                {testimonial.is_approved ? 'Approved' : 'Pending'}
                            </span>
                            {testimonial.is_featured && <span className="bg-red-50 text-red-600 px-3 py-1 rounded-lg border border-red-100 scale-75">Featured</span>}
                        </div>
                    </td>
                    <td className="py-6 px-8 text-right">
                        <div className="flex items-center justify-end gap-2 transition-all duration-300">
                            <button onClick={() => handleEdit(testimonial)} className="p-2.5 bg-white text-slate-900 border border-slate-100 hover:bg-slate-950 hover:text-white rounded-xl transition-all shadow-premium-sm" title="Edit Narrative Layer"><Edit2 size={16} /></button>
                            <button onClick={() => { if (window.confirm('Expunge this story?')) deleteMutation.mutate(testimonial.id); }} className="p-2.5 bg-white text-red-600 border border-slate-100 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-premium-sm" title="Delete"><Trash2 size={16} /></button>
                        </div>
                    </td>
                </tr>
            )}
            renderForm={() => (
                <div className="space-y-12">
                    <section className="space-y-8">
                        <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs ">01</div>
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Traveler Profile</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2 col-span-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Traveler Full Name</label>
                                <input type="text" value={formData.customer_name} onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-black text-gray-900 text-lg" placeholder="Jean-Pierre" />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Avatar / Social Photo URL</label>
                                <input type="url" value={formData.avatar_url} onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-sm" placeholder="https://..." />
                            </div>
                        </div>
                    </section>

                    <section className="space-y-8">
                        <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs ">02</div>
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">The Experience Narrative</h3>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Authentic Traveler Story</label>
                            <textarea rows={5} value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-medium text-sm resize-none leading-relaxed" placeholder="Describe the incredible journey..." />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Satisfaction Rating</label>
                                <div className="flex p-1 bg-gray-100 rounded-2xl border border-gray-200 shadow-inner">
                                    {[1, 2, 3, 4, 5].map(r => (
                                        <button key={r} onClick={() => setFormData({ ...formData, rating: r })}
                                            className={`flex-1 py-3 rounded-xl flex items-center justify-center transition-all ${formData.rating === r ? 'bg-white shadow-premium-sm text-amber-500 border border-slate-100' : 'text-gray-400 hover:text-gray-600'}`}>
                                            <Star size={16} fill={formData.rating >= r ? "currentColor" : "none"} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Featured</label>
                                    <button onClick={() => setFormData({ ...formData, is_featured: !formData.is_featured })}
                                        className={`w-full py-3 rounded-xl font-black text-[9px] uppercase tracking-widest border transition-all ${formData.is_featured ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                                        {formData.is_featured ? 'Highlight' : 'Normal'}
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Approved</label>
                                    <button onClick={() => setFormData({ ...formData, is_approved: !formData.is_approved })}
                                        className={`w-full py-3 rounded-xl font-black text-[9px] uppercase tracking-widest border transition-all ${formData.is_approved ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                        {formData.is_approved ? 'Live' : 'Hidden'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            )}
            renderPreview={() => (
                <div className="bg-slate-900 p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden flex items-center justify-center min-h-[500px]">
                    <Quote className="absolute -top-10 -right-10 w-48 h-48 text-white opacity-5" />
                    <div className="w-full max-w-sm bg-white rounded-[2.5rem] p-10 shadow-2xl border border-slate-50 relative group transition-all">
                        <div className="space-y-8">
                            <div className="flex items-center gap-1 text-amber-500">
                                {[...Array(5)].map((_, i) => <Star key={i} size={18} fill={formData.rating > i ? "currentColor" : "none"} strokeWidth={1} />)}
                            </div>
                            <p className="text-slate-800 font-medium italic text-lg leading-relaxed">
                                "{formData.content || 'Your client story will be displayed here, showcasing the authentic traveler experience.'}"
                            </p>
                            <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-red-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg">
                                        {formData.avatar_url ? <img src={formData.avatar_url} className="w-full h-full object-cover rounded-2xl" /> : (formData.customer_name?.charAt(0) || '?')}
                                    </div>
                                    <div>
                                        <h5 className="font-black text-slate-900 uppercase tracking-tight leading-tight">{formData.customer_name || 'Anonymous Traveler'}</h5>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Verified Experience</p>
                                    </div>
                                </div>
                                {formData.is_featured && <ThumbsUp className="text-amber-500" size={24} fill="currentColor" />}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        />
    );
};

export default TestimonialManager;
