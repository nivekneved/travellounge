import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';
import { toast } from 'react-hot-toast';
import {
    FileText,
    Edit3,
    Check,
    Layout,
    HelpCircle,
    Phone,
    Info,
    Save,
    Loader,
    ChevronRight,
    Globe,
    Plus,
    Trash2,
    X,
    Bold,
    Italic,
    Heading1,
    Heading2,
    List as ListIcon,
    Link as MarkdownLink
} from 'lucide-react';

const PageContentManager = () => {
    const queryClient = useQueryClient();
    const [selectedPageSlug, setSelectedPageSlug] = useState('about');

    // Local state for editing form
    const [editForm, setEditForm] = useState({
        title: '',
        slug: '',
        headline: '',
        body: ''
    });

    const [isCreating, setIsCreating] = useState(false);

    // Fetch all pages
    const { data: pages, isLoading, isError, error: queryError } = useQuery({
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

    useEffect(() => {
        if (isError && queryError) {
            toast.error(`Failed to load pages: ${queryError.message}`);
        }
    }, [isError, queryError]);

    // Get currently selected page object
    const selectedPage = pages?.find(p => p.slug === selectedPageSlug);

    // Track the last page slug to know when to reset the form
    const [lastSlug, setLastSlug] = useState('about');

    // Update local form when selection changes (Render phase update pattern)
    if (selectedPage && selectedPageSlug !== lastSlug && !isCreating) {
        setEditForm({
            title: selectedPage.title || '',
            slug: selectedPage.slug || '',
            headline: selectedPage.content?.headline || '',
            body: selectedPage.content?.body || ''
        });
        setLastSlug(selectedPageSlug);
    }

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
                    }
                }])
                .select();
            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(['pages']);
            toast.success('New page created successfully');
            setIsCreating(false);
            if (data?.[0]) setSelectedPageSlug(data[0].slug);
        },
        onError: (err) => toast.error('Failed to create page: ' + err.message)
    });

    const updateMutation = useMutation({
        mutationFn: async (updates) => {
            const { data, error } = await supabase
                .from('pages')
                .update({
                    title: updates.title,
                    content: {
                        headline: updates.headline,
                        body: updates.body
                    }
                })
                .eq('slug', selectedPageSlug);

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['pages']);
            toast.success('Page content updated successfully');
        },
        onError: (err) => toast.error('Failed to update page: ' + err.message)
    });

    const deleteMutation = useMutation({
        mutationFn: async (slug) => {
            const { error } = await supabase
                .from('pages')
                .delete()
                .eq('slug', slug);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['pages']);
            toast.success('Page deleted successfully');
            setSelectedPageSlug('about');
        },
        onError: (err) => toast.error('Failed to delete page: ' + err.message)
    });

    const handleSave = () => {
        if (isCreating) {
            if (!editForm.slug) {
                toast.error('Slug is required');
                return;
            }
            createMutation.mutate(editForm);
        } else {
            updateMutation.mutate(editForm);
        }
    };

    const handleDeleteTrigger = () => {
        if (window.confirm(`Are you sure you want to permanently delete the "${selectedPage?.title}" page?`)) {
            deleteMutation.mutate(selectedPageSlug);
        }
    };

    const startNewPage = () => {
        setIsCreating(true);
        setSelectedPageSlug(null);
        setEditForm({
            title: '',
            slug: '',
            headline: '',
            body: ''
        });
    };

    const getPageIcon = (slug) => {
        switch (slug) {
            case 'about': return Info;
            case 'contact': return Phone;
            case 'services': return Layout;
            case 'faq': return HelpCircle;
            default: return FileText;
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[calc(100vh-140px)]">
            {/* Sidebar Page List */}
            <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                    <div>
                        <h2 className="font-display font-bold text-lg text-gray-900 ">Pages</h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Select page to edit</p>
                    </div>
                    <button
                        onClick={startNewPage}
                        className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg shadow-red-600/20 transition-all active:scale-95"
                        title="Create New Page"
                    >
                        <Plus size={18} />
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex justify-center p-12"><Loader className="animate-spin text-red-600" /></div>
                ) : (
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {pages?.length > 0 ? pages.map((page) => {
                            const Icon = getPageIcon(page.slug);
                            return (
                                <button
                                    key={page.id}
                                    onClick={() => {
                                        setSelectedPageSlug(page.slug);
                                        setIsCreating(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${selectedPageSlug === page.slug ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'hover:bg-gray-50 text-gray-600'}`}
                                >
                                    <div className={`p-1.5 rounded-lg ${selectedPageSlug === page.slug ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-white'} transition-colors`}>
                                        <Icon size={16} />
                                    </div>
                                    <span className="font-bold text-sm capitalize ">{page.title}</span>
                                    <ChevronRight size={14} className={`ml-auto transition-transform ${selectedPageSlug === page.slug ? 'translate-x-0' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`} />
                                </button>
                            );
                        }) : (
                            <div className="text-center p-4 text-gray-400 text-xs font-bold">No pages found.</div>
                        )}
                    </div>
                )}
            </div>

            {/* Editor Area */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600 shadow-inner border border-red-100/50">
                            <FileText size={24} />
                        </div>
                        <div>
                            <h2 className="font-bold text-xl text-gray-900 leading-none">
                                {isCreating ? 'Creating New Page' : (selectedPage?.title || 'Loading...')}
                            </h2>
                            <div className="flex items-center gap-2 mt-2">
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${isCreating ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-green-100 text-green-700 border-green-200'}`}>
                                    Status: {isCreating ? 'Draft' : 'Live'}
                                </span>
                                {!isCreating && <span className="text-[10px] text-gray-400 font-mono">/{selectedPage?.slug}</span>}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        {!isCreating && (
                            <button
                                onClick={handleDeleteTrigger}
                                disabled={deleteMutation.isPending}
                                className="p-3 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-xl border border-gray-100 transition-all"
                                title="Delete This Page"
                            >
                                <Trash2 size={20} />
                            </button>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={updateMutation.isPending || createMutation.isPending || (isCreating && !editForm.title)}
                            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-red-600/30 active:scale-95 disabled:opacity-50 flex items-center gap-2"
                        >
                            {(updateMutation.isPending || createMutation.isPending) ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
                            {isCreating ? 'Publish Page' : 'Save Changes'}
                        </button>
                    </div>
                </div>

                <div className="flex-1 p-8 overflow-y-auto bg-gray-50/30">
                    {(selectedPage || isCreating) ? (
                        <div className="max-w-4xl mx-auto space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Info size={14} className="text-red-500" />
                                        Page Title
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.title}
                                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none font-bold text-sm transition-all"
                                        placeholder="Internal page name..."
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Globe size={14} className="text-red-500" />
                                        URL Path (Slug)
                                    </label>
                                    {isCreating ? (
                                        <input
                                            type="text"
                                            value={editForm.slug}
                                            onChange={(e) => setEditForm({ ...editForm, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') })}
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none font-mono text-sm transition-all"
                                            placeholder="e.g. visa-requirements"
                                        />
                                    ) : (
                                        <div className="px-4 py-3 bg-gray-100 rounded-xl text-sm font-mono text-gray-500 border border-gray-200 cursor-not-allowed">
                                            /{selectedPageSlug}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Layout size={14} className="text-red-500" />
                                    Main Page Headline (H1)
                                </label>
                                <input
                                    type="text"
                                    value={editForm.headline}
                                    onChange={(e) => setEditForm({ ...editForm, headline: e.target.value })}
                                    className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none text-xl font-bold transition-all shadow-sm"
                                    placeholder="Enter eye-catching headline..."
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Edit3 size={14} className="text-red-500" />
                                    Content Editor (Markdown)
                                </label>
                                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden min-h-[500px] flex flex-col shadow-sm focus-within:ring-4 focus-within:ring-red-500/10 focus-within:border-red-500 transition-all">
                                    <div className="bg-gray-50 border-b border-gray-100 p-4 flex items-center justify-between">
                                        <div className="flex gap-2">
                                            {[
                                                { icon: Bold, label: 'Bold' },
                                                { icon: Italic, label: 'Italic' },
                                                { icon: Heading1, label: 'H1' },
                                                { icon: Heading2, label: 'H2' },
                                                { icon: MarkdownLink, label: 'Link' },
                                                { icon: ListIcon, label: 'List' }
                                            ].map(tool => (
                                                <button key={tool.label} type="button" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 text-gray-500 transition-colors">
                                                    <tool.icon size={14} />
                                                </button>
                                            ))}
                                        </div>
                                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-tighter ">Preview Mode Disabled</span>
                                    </div>
                                    <textarea
                                        className="flex-1 w-full p-8 outline-none resize-none font-mono text-sm leading-relaxed text-gray-700 bg-white"
                                        value={editForm.body}
                                        onChange={(e) => setEditForm({ ...editForm, body: e.target.value })}
                                        placeholder="Start writing your page content here..."
                                    ></textarea>
                                </div>
                                <p className="text-[10px] text-gray-400 font-medium ">Rich text is rendered as HTML on the frontend. Use Markdown syntax for formatting.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                <Layout size={32} className="text-gray-300" />
                            </div>
                            <p className="font-bold ">Select a page from the sidebar to start editing its content.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PageContentManager;
