/* eslint-disable unused-imports/no-unused-vars */
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';
import { toast } from 'react-hot-toast';
import {
    FileText,
    Edit3,
    Globe,
    Trash2,
    Monitor,
    Smartphone,
    Zap
} from 'lucide-react';
import ManagerLayout from '../components/ManagerLayout';

const PageContentManager = () => {
    const queryClient = useQueryClient();
    const [view, setView] = useState('list');
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [previewMode, setPreviewMode] = useState('desktop');

    const initialFormState = {
        title: '',
        slug: '',
        headline: '',
        body: '',
        metadata: {}
    };

    const [formData, setFormData] = useState(initialFormState);

    // Fetch all pages
    const { data: pages = [], isLoading, isError, error: queryError } = useQuery({
        queryKey: ['pages'],
        queryFn: async () => {
            const { data, error } = await supabase.from('pages').select('*').order('slug');
            if (error) {
                if (error.code === '42P01') return [];
                throw error;
            }
            return data;
        }
    });

    const createMutation = useMutation({
        mutationFn: async (newPage) => {
            const { data, error } = await supabase
                .from('pages')
                .insert([{
                    title: newPage.title,
                    slug: newPage.slug,
                    content: {
                        headline: newPage.headline,
                        body: newPage.body
                    },
                    metadata: newPage.metadata || {}
                }])
                .select();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['pages']);
            toast.success('Page created successfully');
            resetForm();
        }
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, updates }) => {
            const { data, error } = await supabase
                .from('pages')
                .update({
                    title: updates.title,
                    slug: updates.slug,
                    content: {
                        headline: updates.headline,
                        body: updates.body
                    },
                    metadata: updates.metadata || {}
                })
                .eq('id', id);
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['pages']);
            toast.success('Page content updated');
            resetForm();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase.from('pages').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['pages']);
            toast.success('Page deleted');
        }
    });

    const resetForm = () => {
        setFormData(initialFormState);
        setEditingId(null);
        setView('list');
    };

    const handleEdit = (page) => {
        setFormData({
            title: page.title || '',
            slug: page.slug || '',
            headline: page.content?.headline || '',
            body: page.content?.body || '',
            metadata: page.metadata || {}
        });
        setEditingId(page.id);
        setView('edit');
    };

    const handleSave = () => {
        if (editingId) {
            updateMutation.mutate({ id: editingId, updates: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const filteredPages = pages.filter(p =>
        p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.slug?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = [
        { label: 'Published Pages', value: pages.length, icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Content Health', value: '100%', icon: Zap, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Active Routes', value: pages.length, icon: Globe, color: 'text-blue-600', bg: 'bg-blue-50' }
    ];

    const columns = [
        { header: 'Narrative Identity' },
        { header: 'Resource Path' },
        { header: 'Status', align: 'center' },
        { header: 'Last Modified', align: 'center' },
        { header: 'Actions', align: 'right' }
    ];

    return (
        <ManagerLayout
            title="Narrative Architect"
            subtitle="Compose and manage landing experiences and global content layers"
            icon={FileText}
            stats={stats}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            searchPlaceholder="Search pages by title or slug..."
            onAdd={() => { resetForm(); setView('edit'); }}
            addLabel="Create Page"
            view={view}
            setView={setView}
            editingId={editingId}
            onSubmit={handleSave}
            isSaving={createMutation.isLoading || updateMutation.isLoading}
            isLoading={isLoading}
            columns={columns}
            data={filteredPages}
            renderRow={(page) => (
                <tr key={page.id} className="transition-all hover:bg-slate-50 group align-middle">
                    <td className="py-6 px-8">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
                                <FileText size={18} />
                            </div>
                            <span className="font-black text-slate-900 text-sm uppercase tracking-tight">{page.title}</span>
                        </div>
                    </td>
                    <td className="py-6 px-8">
                        <code className="text-[10px] font-black text-red-500 uppercase bg-red-50 px-2 py-1 rounded-lg">/{page.slug}</code>
                    </td>
                    <td className="py-6 px-8 text-center">
                        <span className="inline-flex items-center px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border bg-emerald-50 text-emerald-700 border-emerald-100">
                            Live
                        </span>
                    </td>
                    <td className="py-6 px-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {page.updated_at ? new Date(page.updated_at).toLocaleDateString() : 'TBA'}
                    </td>
                    <td className="py-6 px-8 text-right">
                        <div className="flex items-center justify-end gap-2 transition-all duration-300">
                            <button onClick={() => handleEdit(page)} className="p-2.5 bg-white text-slate-900 border border-slate-100 hover:bg-slate-950 hover:text-white rounded-xl transition-all shadow-premium-sm" title="Edit Page"><Edit3 size={16} /></button>
                            <button onClick={() => { if (window.confirm('Delete this page?')) deleteMutation.mutate(page.id); }}
                                className="p-2.5 bg-white text-red-600 border border-slate-100 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-premium-sm" title="Delete"><Trash2 size={16} /></button>
                        </div>
                    </td>
                </tr>
            )}
            renderGrid={() => (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                    {filteredPages.map((page) => (
                        <div key={page.id} className="bg-white rounded-[2.5rem] border border-gray-100 p-8 flex flex-col group relative hover:shadow-2xl hover:border-indigo-100 transition-all duration-500">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center transition-transform group-hover:scale-110 border border-indigo-100">
                                    <FileText size={20} />
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEdit(page)} className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><Edit3 size={18} /></button>
                                    <button onClick={() => { if (window.confirm('Delete this page?')) deleteMutation.mutate(page.id); }} className="p-2 text-red-300 hover:text-red-600 transition-colors"><Trash2 size={18} /></button>
                                </div>
                            </div>
                            <h3 className="font-black text-slate-900 uppercase tracking-tight text-lg mb-1">{page.title}</h3>
                            <code className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-6">/{page.slug}</code>

                            <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                                <span className={`px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-100`}>
                                    Published
                                </span>
                                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center font-serif italic text-xs text-slate-300">
                                    TL
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            renderForm={() => (
                <div className="space-y-12">
                    <section className="space-y-8">
                        <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs ">01</div>
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Contextual Framework</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2 col-span-2 md:col-span-1">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Page Authority Title</label>
                                <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-black text-slate-900 text-sm tracking-tight" placeholder="e.g. About Our Journey" />
                            </div>
                            <div className="space-y-2 col-span-2 md:col-span-1">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Universal Resource slug</label>
                                <div className="relative">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 font-black text-sm">/</span>
                                    <input type="text" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                        className="w-full pl-8 pr-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-black text-red-500 text-sm tracking-tighter" placeholder="about-us" />
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-8">
                        <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs ">02</div>
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Narrative Payload</h3>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Primary Headline</label>
                                <input type="text" value={formData.headline} onChange={e => setFormData({ ...formData, headline: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-black text-slate-900 text-lg tracking-tight" placeholder="A compelling header..." />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Contextual Body (Markdown/HTML Support)</label>
                                <textarea rows={12} value={formData.body} onChange={e => setFormData({ ...formData, body: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-slate-800 text-sm leading-relaxed resize-none" placeholder="Draft the master narrative here..." />
                            </div>
                        </div>
                    </section>
                </div>
            )}
            renderPreview={() => (
                <div className="lg:sticky lg:top-12 h-fit space-y-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ">Experience Simulation</h3>
                        <div className="flex p-1 bg-gray-100 rounded-2xl border border-gray-200">
                            <button onClick={() => setPreviewMode('desktop')} className={`px-4 py-2 rounded-xl transition-all ${previewMode === 'desktop' ? 'bg-white text-red-600 shadow-premium border border-gray-200' : 'text-gray-400 hover:text-gray-600'}`}><Monitor size={18} /></button>
                            <button onClick={() => setPreviewMode('mobile')} className={`px-4 py-2 rounded-xl transition-all ${previewMode === 'mobile' ? 'bg-white text-red-600 shadow-premium border border-gray-200' : 'text-gray-400 hover:text-gray-600'}`}><Smartphone size={18} /></button>
                        </div>
                    </div>

                    <div className={`relative mx-auto bg-slate-900 shadow-[0_48px_96px_-12px_rgba(0,0,0,0.3)] overflow-hidden transition-all duration-700 border-8 border-slate-900 flex items-center justify-center p-12
                        ${previewMode === 'desktop' ? 'w-full aspect-[4/3] rounded-[48px]' : 'w-[320px] h-[640px] rounded-[64px]'}`}>

                        <div className="w-full h-full bg-white rounded-[24px] overflow-auto flex flex-col no-scrollbar">
                            {/* Simulator Navbar */}
                            <div className="shrink-0 h-16 border-b border-slate-50 flex items-center justify-between px-8">
                                <div className="text-[10px] font-black tracking-tighter">TRAVEL LOUNGE</div>
                                <div className="flex gap-4">
                                    <div className="w-4 h-[1px] bg-slate-200"></div>
                                    <div className="w-4 h-[1px] bg-slate-200"></div>
                                </div>
                            </div>

                            {/* Simulator Hero */}
                            <div className="bg-slate-50 p-12 text-center space-y-4">
                                <p className="text-[8px] font-black text-red-500 uppercase tracking-[0.4em]">{formData.title || 'PAGE CATEGORY'}</p>
                                <h1 className="text-2xl font-black text-slate-950 tracking-tight leading-tight uppercase font-display">{formData.headline || 'Awaiting Narrative Headline'}</h1>
                                <div className="w-12 h-1 bg-slate-950 mx-auto rounded-full mt-6"></div>
                            </div>

                            {/* Simulator Content */}
                            <div className="p-12 prose prose-slate max-w-none">
                                {formData.body ? (
                                    <div className="text-[13px] text-slate-600 leading-relaxed font-medium space-y-4 whitespace-pre-wrap">
                                        {formData.body}
                                    </div>
                                ) : (
                                    <div className="space-y-4 opacity-10">
                                        {[...Array(6)].map((_, i) => (
                                            <div key={i} className={`h-2 bg-slate-900 rounded-full ${i % 3 === 0 ? 'w-full' : i % 3 === 1 ? 'w-4/5' : 'w-2/3'}`}></div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Simulator Footer */}
                            <div className="mt-auto p-12 bg-slate-950 text-white text-[8px] font-black uppercase tracking-widest text-center opacity-40">
                                © 2026 TRAVEL LOUNGE PROTOCOL
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex gap-4 text-slate-400">
                        <Zap size={24} className="shrink-0 mt-1" />
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 mb-1">Architecture Note</p>
                            <p className="text-[11px] font-medium leading-relaxed">This simulation renders the core narrative payload. Advanced layout modules will be applied dynamically during live environment transmission.</p>
                        </div>
                    </div>
                </div>
            )}
        />
    );
};

export default PageContentManager;
