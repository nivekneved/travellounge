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

 const [isInitialized, setIsInitialized] = useState(false);

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
 if (seoSettings && !isInitialized && !isLoading) {
 setFormData(seoSettings);
 setIsInitialized(true);
 }

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
 {/* Header */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
 <div>
 <h1 className="text-3xl font-black text-gray-900 tracking-tight">SEO & Metadata</h1>
 <p className="text-gray-500 font-medium">Optimize search engine visibility and social sharing</p>
 </div>
 <button
 onClick={handleSave}
 disabled={updateMutation.isPending}
 className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-xl shadow-red-600/20 active:scale-95 disabled:opacity-50 group"
 >
 {updateMutation.isPending ? (
 <div className="flex items-center gap-2">
 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
 <span>Saving...</span>
 </div>
 ) : (
 <>
 <Save size={22} className="group-hover:scale-110 transition-transform" />
 <span>Save Changes</span>
 </>
 )}
 </button>
 </div>

 {/* Navigation Tabs */}
 <div className="flex gap-2 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 w-fit">
 {['global', 'social', 'analytics'].map(tab => (
 <button
 key={tab}
 onClick={() => setActiveTab(tab)}
 className={`px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-gray-900 text-white shadow-lg scale-[1.02]' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900'}`}
 >
 {tab} Settings
 </button>
 ))}
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 {/* Form Area */}
 <div className="lg:col-span-2 space-y-6">
 {activeTab === 'global' && (
 <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
 <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
 <h2 className="text-xl font-black text-gray-900 flex items-center gap-4">
 <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 shadow-sm">
 <Globe size={24} />
 </div>
 Search Engine Context
 </h2>
 </div>
 <div className="p-8 space-y-8">
 <div className="space-y-3">
 <label className="text-sm font-black text-gray-700 uppercase tracking-widest flex items-center gap-2">
 Site Title
 <span className="text-red-500 animate-pulse">*</span>
 </label>
 <div className="relative group">
 <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600 transition-colors" size={20} />
 <input
 type="text"
 value={formData.siteTitle}
 onChange={e => setFormData({ ...formData, siteTitle: e.target.value })}
 placeholder="Enter site title for SEO..."
 className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:bg-white focus:border-red-500 outline-none transition-all font-bold text-sm"
 />
 </div>
 <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest ">Displayed in search results and browser tabs</p>
 </div>

 <div className="space-y-3">
 <label className="text-sm font-black text-gray-700 uppercase tracking-widest">Meta Description</label>
 <div className="relative group">
 <textarea
 rows="4"
 value={formData.metaDescription}
 onChange={e => setFormData({ ...formData, metaDescription: e.target.value })}
 placeholder="Describe your site for search engines..."
 className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:bg-white focus:border-red-500 outline-none transition-all resize-none font-bold text-sm leading-relaxed"
 ></textarea>
 </div>
 <div className="flex justify-between items-center px-2">
 <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest ">Range: 150-160 characters</span>
 <div className={`px-3 py-1 rounded-full text-[10px] font-black ${formData.metaDescription.length > 160 ? "bg-red-50 text-red-600 border border-red-100" : "bg-green-50 text-green-600 border border-green-100"}`}>
 {formData.metaDescription.length}/160
 </div>
 </div>
 </div>

 <div className="space-y-3">
 <label className="text-sm font-black text-gray-700 uppercase tracking-widest">Target Keywords</label>
 <div className="relative group">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600 transition-colors" size={20} />
 <input
 type="text"
 value={formData.keywords}
 onChange={e => setFormData({ ...formData, keywords: e.target.value })}
 placeholder="travel, luxury, mauritius, holidays..."
 className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:bg-white focus:border-red-500 outline-none transition-all font-bold text-sm"
 />
 </div>
 </div>
 </div>
 </div>
 )}

 {activeTab === 'social' && (
 <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
 <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
 <h2 className="text-xl font-black text-gray-900 flex items-center gap-4">
 <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 shadow-sm">
 <Share2 size={24} />
 </div>
 Open Graph Protocol
 </h2>
 </div>
 <div className="p-8 space-y-8">
 <div className="space-y-4">
 <label className="text-sm font-black text-gray-700 uppercase tracking-widest">OG Image Resource</label>
 <div className="flex gap-4">
 <div className="relative flex-1 group">
 <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors" size={20} />
 <input
 type="text"
 value={formData.ogImage}
 onChange={e => setFormData({ ...formData, ogImage: e.target.value })}
 className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:bg-white focus:border-red-500 outline-none transition-all font-bold text-sm"
 placeholder="https://example.com/og-image.jpg"
 />
 </div>
 </div>
 <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest ">Displayed during social media link unfurling</p>
 </div>

 {formData.ogImage && (
 <div className="relative w-full aspect-[1.91/1] rounded-3xl overflow-hidden border border-gray-100 shadow-2xl group">
 <img src={formData.ogImage} alt="OG Preview" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
 <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/20 to-transparent p-10 flex flex-col justify-end">
 <div className="text-white font-black text-2xl tracking-tight leading-none mb-3 transform transition-transform group-hover:-translate-y-1">{formData.siteTitle}</div>
 <div className="text-white/60 text-sm font-medium line-clamp-2 transform transition-transform delay-75 group-hover:-translate-y-1">{formData.metaDescription}</div>
 </div>
 </div>
 )}
 </div>
 </div>
 )}

 {activeTab === 'analytics' && (
 <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 p-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
 <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8 text-red-600 shadow-inner">
 <CheckCircle size={48} />
 </div>
 <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">Active Analytics</h3>
 <p className="text-gray-500 max-w-sm mx-auto text-sm leading-relaxed font-medium ">
 Analytics trackers are managed via central security protocols. Global monitoring is currently active and optimized.
 </p>
 </div>
 )}
 </div>

 {/* Live Preview Pane */}
 <div className="lg:col-span-1">
 <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl p-8 sticky top-24 space-y-10">
 <div>
 <h3 className="font-black text-gray-400 uppercase text-[10px] tracking-[0.2em] mb-8 border-b border-gray-50 pb-4 ">Google Result Sandbox</h3>

 {/* Google Result Preview */}
 <div className="p-6 rounded-3xl border border-gray-50 hover:border-red-100 hover:bg-red-50/10 transition-all group cursor-default shadow-sm hover:shadow-md">
 <div className="flex items-center gap-3 mb-4">
 <div className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center p-1 border border-gray-200 group-hover:bg-white group-hover:text-red-600 transition-all shadow-sm">
 <Globe size={18} className="text-gray-400 group-hover:rotate-12 transition-transform" />
 </div>
 <div className="min-w-0">
 <div className="text-[10px] font-black text-gray-900 truncate uppercase tracking-widest ">Travel Lounge Mauritius</div>
 <div className="text-[10px] text-gray-400 truncate font-mono opacity-80 uppercase tracking-tighter">https://travellounge.mu</div>
 </div>
 </div>
 <h4 className="text-xl text-[#1a0dab] group-hover:underline font-bold tracking-tight mb-3 line-clamp-2">
 {formData.siteTitle || 'Awaiting Site Title...'}
 </h4>
 <p className="text-[13px] text-gray-600 leading-relaxed line-clamp-3 font-medium opacity-90 ">
 {formData.metaDescription || 'Provide a compelling description of your luxury travel services to see a live snippet preview...'}
 </p>
 </div>
 </div>

 <div className="space-y-6">
 <h3 className="font-black text-gray-400 uppercase text-[10px] tracking-[0.2em] border-b border-gray-50 pb-4 text-right">Optimization Pulse</h3>
 <div className="space-y-4">
 <div className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all transform hover:scale-[1.02] ${formData.siteTitle.length >= 30 && formData.siteTitle.length <= 60 ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
 <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${formData.siteTitle.length >= 30 && formData.siteTitle.length <= 60 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
 {formData.siteTitle.length >= 30 && formData.siteTitle.length <= 60 ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
 </div>
 <div className="text-xs">
 <span className="font-black block uppercase tracking-widest text-[10px] mb-0.5">Title Vector</span>
 <span className="font-bold opacity-80 ">
 {formData.siteTitle.length < 1 ? 'Null reference' : formData.siteTitle.length < 30 ? 'Insufficient data' : formData.siteTitle.length <= 60 ? 'Optimal precision' : 'Length overflow'}
 </span>
 </div>
 </div>

 <div className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all transform hover:scale-[1.02] ${formData.metaDescription.length >= 120 && formData.metaDescription.length <= 160 ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
 <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${formData.metaDescription.length >= 120 && formData.metaDescription.length <= 160 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
 {formData.metaDescription.length >= 120 && formData.metaDescription.length <= 160 ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
 </div>
 <div className="text-xs">
 <span className="font-black block uppercase tracking-widest text-[10px] mb-0.5">Snippet Integrity</span>
 <span className="font-bold opacity-80 ">
 {formData.metaDescription.length < 1 ? 'Null reference' : formData.metaDescription.length < 120 ? 'Weak engagement potential' : formData.metaDescription.length <= 160 ? 'Maximum visibility' : 'Likely truncated'}
 </span>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
};

export default SEOManager;
