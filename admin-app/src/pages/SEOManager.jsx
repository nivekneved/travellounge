import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';
import { toast } from 'react-hot-toast';
import {
    Globe,
    CheckCircle,
    AlertCircle,
    Eye,
    TrendingUp,
    Zap
} from 'lucide-react';
import ManagerLayout from '../components/ManagerLayout';

const SEOManager = () => {
    const queryClient = useQueryClient();
    const [view, setView] = useState('edit');
    const [activeTab, setActiveTab] = useState('global');
    const [isInitialized, setIsInitialized] = useState(false);

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

            if (error && error.code !== 'PGRST116') throw error;
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

    // Initialize form data when settings are loaded
    useEffect(() => {
        if (seoSettings && !isInitialized) {
            // Disable warning as we intentionally map initial API load to local state
             
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFormData(seoSettings);
            setIsInitialized(true);
        }
    }, [seoSettings, isInitialized]);

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

    const handleSave = () => {
        updateMutation.mutate(formData);
    };

    const stats = [
        { label: 'SEO Health', value: '98%', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Index Coverage', value: 'All Pages', icon: Globe, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Search Visibility', value: '+24%', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' }
    ];

    return (
        <ManagerLayout
            title="SEO Command Center"
            subtitle="Optimize global search signals and social metadata"
            icon={Globe}
            stats={stats}
            view={view}
            setView={setView}
            editingId="seo_global" // Fixed ID for SEO
            onSubmit={handleSave}
            isSaving={updateMutation.isLoading}
            isLoading={isLoading}
            renderForm={() => (
                <div className="space-y-12">
                    {/* Navigation Tabs */}
                    <div className="flex gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100 w-fit">
                        {['global', 'social', 'analytics'].map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)}
                                className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${activeTab === tab ? 'bg-slate-900 text-white shadow-xl scale-[1.02]' : 'text-slate-400 hover:bg-white hover:text-slate-900'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'global' && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <section className="space-y-8">
                                <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                                    <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs ">01</div>
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Search Signals</h3>
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Site Authority Title</label>
                                        <input type="text" value={formData.siteTitle} onChange={e => setFormData({ ...formData, siteTitle: e.target.value })}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-black text-slate-900 text-sm tracking-tight" placeholder="Enter site title..." />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Meta Narrative (Description)</label>
                                        <textarea rows={4} value={formData.metaDescription} onChange={e => setFormData({ ...formData, metaDescription: e.target.value })}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-slate-800 text-sm leading-relaxed resize-none" placeholder="Describe the site..." />
                                        <div className="flex justify-between items-center px-1">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Target: 155 Characters</span>
                                            <span className={`text-[9px] font-black uppercase ${formData.metaDescription.length > 160 ? 'text-red-500' : 'text-emerald-500'}`}>{formData.metaDescription.length}/160</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Target Keyword Matrix</label>
                                        <input type="text" value={formData.keywords} onChange={e => setFormData({ ...formData, keywords: e.target.value })}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-slate-800 text-sm" placeholder="keyword1, keyword2, keyword3..." />
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'social' && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <section className="space-y-8">
                                <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                                    <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs ">02</div>
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Open Graph Identity</h3>
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Social Image Resource (URL)</label>
                                        <div className="flex gap-4">
                                            <input type="text" className="flex-1 px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-mono text-xs text-red-500"
                                                value={formData.ogImage} onChange={e => setFormData({ ...formData, ogImage: e.target.value })} placeholder="https://..." />
                                        </div>
                                    </div>
                                    {formData.ogImage && (
                                        <div className="relative aspect-[1.91/1] rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-premium group">
                                            <img src={formData.ogImage} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent p-10 flex flex-col justify-end">
                                                <p className="text-white font-black text-xl tracking-tight mb-2 line-clamp-1">{formData.siteTitle}</p>
                                                <p className="text-white/60 text-xs font-medium line-clamp-2">{formData.metaDescription}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'analytics' && (
                        <div className="py-20 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 shadow-inner">
                                <CheckCircle size={32} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Analytics Active</h3>
                                <p className="text-xs font-medium text-slate-400 max-w-sm mt-2 leading-relaxed">External tracking scripts are managed via global environment variables for maximum performance and security.</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
            renderPreview={() => (
                <div className="lg:sticky lg:top-12 h-fit space-y-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ">Transmission Preview</h3>
                        <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white shadow-xl">
                            <Eye size={18} />
                        </div>
                    </div>

                    <div className="bg-white rounded-[3rem] border border-slate-200 shadow-[0_48px_96px_-12px_rgba(0,0,0,0.12)] p-10 space-y-10">
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-6">Search Result Snippet</p>
                            <div className="space-y-3 cursor-default group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-red-600 group-hover:bg-white transition-all shadow-sm">
                                        <Globe size={14} />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-[9px] font-black text-slate-900 truncate uppercase tracking-widest">Travel Lounge</div>
                                        <div className="text-[9px] text-slate-400 truncate tracking-tight">https://travellounge.mu</div>
                                    </div>
                                </div>
                                <h4 className="text-xl text-[#1a0dab] font-bold tracking-tight hover:underline cursor-pointer line-clamp-2">
                                    {formData.siteTitle || 'Awaiting Protocol Input...'}
                                </h4>
                                <p className="text-[13px] text-slate-600 leading-relaxed line-clamp-3 font-medium opacity-90">
                                    {formData.metaDescription || 'Detailed site narrative will be displayed here for optimal search engine performance estimation.'}
                                </p>
                            </div>
                        </div>

                        <div className="pt-10 border-t border-slate-50 space-y-6">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ">Optimization Pulse</p>
                            <div className="grid grid-cols-1 gap-4">
                                <div className={`p-5 rounded-[2rem] border-2 transition-all flex items-center gap-4 ${formData.siteTitle.length >= 30 && formData.siteTitle.length <= 60 ? 'bg-emerald-50/50 border-emerald-100 text-emerald-700' : 'bg-red-50/50 border-red-100 text-red-700'}`}>
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${formData.siteTitle.length >= 30 && formData.siteTitle.length <= 60 ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                                        {formData.siteTitle.length >= 30 && formData.siteTitle.length <= 60 ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                    </div>
                                    <div className="text-[10px] font-black uppercase tracking-widest">{formData.siteTitle.length <= 60 ? 'Title Precision Optimal' : 'Title Length Excessive'}</div>
                                </div>
                                <div className={`p-5 rounded-[2rem] border-2 transition-all flex items-center gap-4 ${formData.metaDescription.length >= 120 && formData.metaDescription.length <= 160 ? 'bg-emerald-50/50 border-emerald-100 text-emerald-700' : 'bg-red-50/50 border-red-100 text-red-700'}`}>
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${formData.metaDescription.length >= 120 && formData.metaDescription.length <= 160 ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                                        {formData.metaDescription.length >= 120 && formData.metaDescription.length <= 160 ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                    </div>
                                    <div className="text-[10px] font-black uppercase tracking-widest">{formData.metaDescription.length <= 160 ? 'Narrative Density Optimal' : 'Narrative Likely Truncated'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        />
    );
};

export default SEOManager;
