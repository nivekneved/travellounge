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
    Loader
} from 'lucide-react';

const PageContentManager = () => {
    const queryClient = useQueryClient();
    const [selectedPageSlug, setSelectedPageSlug] = useState('about');

    // Local state for editing form
    const [editForm, setEditForm] = useState({
        title: '',
        headline: '',
        body: ''
    });

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

    // Update local form when selection changes
    useEffect(() => {
        if (selectedPage) {
            setEditForm({
                title: selectedPage.title || '',
                headline: selectedPage.content?.headline || '',
                body: selectedPage.content?.body || ''
            });
        }
    }, [selectedPage]);

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

    const handleSave = () => {
        updateMutation.mutate(editForm);
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
                <div className="p-6 border-b border-gray-100">
                    <h2 className="font-display font-bold text-lg text-gray-900">Pages</h2>
                    <p className="text-sm text-gray-500">Select a page to edit</p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center p-8"><Loader className="animate-spin text-primary" /></div>
                ) : (
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {pages?.length > 0 ? pages.map((page) => {
                            const Icon = getPageIcon(page.slug);
                            return (
                                <button
                                    key={page.id}
                                    onClick={() => setSelectedPageSlug(page.slug)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${selectedPageSlug === page.slug ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'hover:bg-gray-50 text-gray-600'}`}
                                >
                                    <Icon size={18} />
                                    <span className="font-bold text-sm capitalize">{page.title}</span>
                                    {selectedPageSlug === page.slug && <Check size={16} className="ml-auto" />}
                                </button>
                            );
                        }) : (
                            <div className="text-center p-4 text-gray-500 text-sm">No pages found. Run migration.</div>
                        )}
                    </div>
                )}
            </div>

            {/* Editor Area */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                            <FileText size={20} />
                        </div>
                        <div>
                            <h2 className="font-bold text-xl text-gray-900">
                                Editing: {selectedPage?.title || 'Loading...'}
                            </h2>
                            <p className="text-xs text-green-600 flex items-center gap-1 font-medium">
                                <span className="w-2 h-2 rounded-full bg-green-500 block"></span> Live on Website
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={updateMutation.isPending || !selectedPage}
                        className="bg-gray-900 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {updateMutation.isPending ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                        Save Changes
                    </button>
                </div>

                <div className="flex-1 p-8 overflow-y-auto bg-gray-50/50">
                    {selectedPage ? (
                        <div className="max-w-3xl mx-auto space-y-8">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Page Title (Internal)</label>
                                <input
                                    type="text"
                                    value={editForm.title}
                                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-medium"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Page Headline (H1)</label>
                                <input
                                    type="text"
                                    value={editForm.headline}
                                    onChange={(e) => setEditForm({ ...editForm, headline: e.target.value })}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-lg font-bold"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Main Content Block</label>
                                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden min-h-[400px] flex flex-col">
                                    <div className="bg-gray-50 border-b border-gray-200 p-2 flex gap-1">
                                        <button className="p-2 hover:bg-gray-200 rounded text-gray-500"><Edit3 size={16} /></button>
                                        <span className="text-xs text-gray-400 self-center px-2">Markdown Supported</span>
                                    </div>
                                    <textarea
                                        className="flex-1 w-full p-4 outline-none resize-none font-mono text-sm"
                                        value={editForm.body}
                                        onChange={(e) => setEditForm({ ...editForm, body: e.target.value })}
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            Select a page to start editing
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PageContentManager;
