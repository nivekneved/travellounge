import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';
import { toast } from 'react-hot-toast';
import {
    Search,
    Globe,
    Share2,
    ImageIcon,
    Save,
    CheckCircle,
    AlertCircle,
    Loader
} from 'lucide-react';

const SEOManager = () => {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('global');

    const [formData, setFormData] = useState({
        siteTitle: '',
        metaDescription: '',
        keywords: '',
        ogImage: ''
    });

    // Fetch SEO Settings
    const { data: seoSettings, isLoading, isError, error: queryError } = useQuery({
        queryKey: ['site_settings', 'seo_global'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('site_settings')
                .select('*')
                .eq('key', 'seo_global')
                .single();

            if (error && error.code !== 'PGRST116') throw error; // Ignor not found
            return data?.value || {
                siteTitle: 'Travel Lounge | Luxury Travel Agency Mauritius',
                metaDescription: 'Discover exclusive holiday packages, cruises, and custom travel experiences with Travel Lounge Mauritius.',
                keywords: 'travel agency, mauritius, luxury, holidays',
                ogImage: 'https://travellounge.mu/og-image.jpg'
            };
        }
    });

    useEffect(() => {
        if (isError && queryError) {
            toast.error(`Failed to load SEO settings: ${queryError.message}`);
        }
    }, [isError, queryError]);

    useEffect(() => {
        if (seoSettings) {
            setFormData(seoSettings);
        }
    }, [seoSettings]);

    const updateMutation = useMutation({
        mutationFn: async (newSettings) => {
            const { data, error } = await supabase
                .from('site_settings')
                .upsert({
                    key: 'seo_global',
                    value: newSettings,
                    category: 'seo',
                    description: 'Global SEO configuration'
                });

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['site_settings']);
            toast.success('SEO Settings Updated Successfully');
        },
        onError: (err) => toast.error('Failed to update SEO: ' + err.message)
    });

    const handleSave = (e) => {
        e.preventDefault();
        updateMutation.mutate(formData);
    };

    if (isLoading) return <div className="flex justify-center p-20"><Loader className="animate-spin text-primary" /></div>;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-gray-900">SEO & Metadata</h1>
                    <p className="text-gray-500 mt-1">Optimize search engine visibility and social sharing</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                    className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-primary/30 active:scale-95 disabled:opacity-50"
                >
                    {updateMutation.isPending ? 'Saving...' : <><Save size={20} /> Save Changes</>}
                </button>
            </div>

            <div className="flex gap-1 bg-white p-1 rounded-xl shadow-sm border border-gray-100 w-fit">
                {['global', 'social', 'analytics'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2.5 rounded-lg font-bold text-sm capitalize transition-all ${activeTab === tab ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                    >
                        {tab} Settings
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Area */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                        <form className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Site Title</label>
                                <div className="relative">
                                    <Globe className="absolute left-4 top-3.5 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        value={formData.siteTitle}
                                        onChange={e => setFormData({ ...formData, siteTitle: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                                    />
                                </div>
                                <p className="text-xs text-gray-400 pl-1">Appears in browser tabs and search results.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Meta Description</label>
                                <textarea
                                    rows="4"
                                    value={formData.metaDescription}
                                    onChange={e => setFormData({ ...formData, metaDescription: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                                ></textarea>
                                <div className="flex justify-between text-xs text-gray-400 pl-1">
                                    <span>Recommended length: 150-160 characters</span>
                                    <span className={formData.metaDescription.length > 160 ? "text-red-500 font-bold" : "text-green-600 font-bold"}>
                                        {formData.metaDescription.length}/160
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Keywords (Comma separated)</label>
                                <div className="relative">
                                    <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        value={formData.keywords}
                                        onChange={e => setFormData({ ...formData, keywords: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Share2 size={18} /> Social Media Preview (OG Tags)
                                </h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">OG Image URL</label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <ImageIcon className="absolute left-4 top-3.5 text-gray-400" size={18} />
                                                <input
                                                    type="text"
                                                    value={formData.ogImage}
                                                    onChange={e => setFormData({ ...formData, ogImage: e.target.value })}
                                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                                />
                                            </div>
                                            <button type="button" className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-gray-700 transition-colors">
                                                Browse
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Live Preview */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
                        <h3 className="font-bold text-gray-500 uppercase text-xs tracking-wider mb-6">Search Preview</h3>

                        {/* Google Result Preview */}
                        <div className="space-y-1 mb-6">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center p-1">
                                    <Globe size={14} className="text-gray-500" />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-800">Travel Lounge</div>
                                    <div className="text-[10px] text-gray-500">https://www.travellounge.mu</div>
                                </div>
                            </div>
                            <h4 className="text-xl text-[#1a0dab] hover:underline cursor-pointer font-medium leading-tight">
                                {formData.siteTitle || 'Site Title'}
                            </h4>
                            <p className="text-sm text-gray-600 leading-snug line-clamp-2">
                                {formData.metaDescription || 'Meta description goes here...'}
                            </p>
                        </div>

                        <div className="border-t border-gray-100 my-6"></div>

                        <h3 className="font-bold text-gray-500 uppercase text-xs tracking-wider mb-4">Analysis</h3>
                        <div className="space-y-3">
                            <div className={`flex items-start gap-3 p-3 rounded-xl ${formData.siteTitle.length > 0 && formData.siteTitle.length < 60 ? 'bg-green-50' : 'bg-yellow-50'}`}>
                                <CheckCircle className={formData.siteTitle.length > 0 && formData.siteTitle.length < 60 ? "text-green-600" : "text-yellow-600"} size={16} />
                                <div className="text-sm">
                                    <span className="font-bold block">Title Length</span>
                                    <span className="opacity-80">
                                        {formData.siteTitle.length < 1 ? 'Missing title' : formData.siteTitle.length < 60 ? 'Good length' : 'Too long'}
                                    </span>
                                </div>
                            </div>
                            {/* Add more analysis items */}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default SEOManager;
