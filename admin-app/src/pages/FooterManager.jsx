/* eslint-disable unused-imports/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';
import { toast } from 'react-hot-toast';
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Globe, XCircle, Zap, TrendingUp, Eye } from 'lucide-react';
import ManagerLayout from '../components/ManagerLayout';

const FooterManager = () => {
    const queryClient = useQueryClient();
    const [view, setView] = useState('edit');

    // Fetch site settings
    const { data: settings = {}, isLoading, isError, error } = useQuery({
        queryKey: ['site-settings'],
        queryFn: async () => {
            const { data, error } = await supabase.from('site_settings').select('*');
            if (error) throw error;
            const settingsObj = {};
            data.forEach(setting => {
                settingsObj[setting.key] = setting.value;
            });
            return settingsObj;
        }
    });

    const [formData, setFormData] = useState({
        contact_phone: '',
        contact_email: '',
        contact_address: '',
        working_hours: '',
        facebook_url: '',
        instagram_url: '',
        website_url: '',
        office_locations: []
    });

    useEffect(() => {
        if (settings && Object.keys(settings).length > 0) {
            // Disable warning as we intentionally map initial API load to local state
             
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFormData({
                contact_phone: settings.contact_phone || '',
                contact_email: settings.contact_email || '',
                contact_address: settings.contact_address || '',
                working_hours: settings.working_hours || '',
                facebook_url: settings.facebook_url || '',
                instagram_url: settings.instagram_url || '',
                website_url: settings.website_url || '',
                office_locations: settings.office_locations || []
            });
        }
    }, [settings]);

    const updateMutation = useMutation({
        mutationFn: async (updates) => {
            const promises = Object.entries(updates).map(([key, value]) =>
                supabase.from('site_settings').upsert({
                    key,
                    value,
                    category: 'footer',
                    updated_at: new Date().toISOString()
                }, { onConflict: 'key' })
            );
            await Promise.all(promises);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['site-settings']);
            toast.success('Footer settings updated successfully!');
        },
        onError: (error) => toast.error(`Error: ${error.message}`)
    });

    const handleSave = () => {
        updateMutation.mutate(formData);
    };

    const handleLocationChange = (index, field, value) => {
        const newLocations = [...formData.office_locations];
        newLocations[index] = { ...newLocations[index], [field]: value };
        setFormData({ ...formData, office_locations: newLocations });
    };

    const addLocation = () => {
        setFormData({
            ...formData,
            office_locations: [...formData.office_locations, { name: '', address: '', phone: '', maps_url: '' }]
        });
    };

    const removeLocation = (index) => {
        const newLocations = formData.office_locations.filter((_, i) => i !== index);
        setFormData({ ...formData, office_locations: newLocations });
    };

    const stats = [
        { label: 'Active Branches', value: formData.office_locations.length, icon: MapPin, color: 'text-red-600', bg: 'bg-red-50' },
        { label: 'Social Velocity', value: 'High', icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Network status', value: 'Online', icon: Globe, color: 'text-emerald-600', bg: 'bg-emerald-50' }
    ];

    return (
        <ManagerLayout
            title="Global Footer Engine"
            subtitle="Configure contact foundations, branch networks, and social connectivity"
            icon={Globe}
            stats={stats}
            view={view}
            setView={setView}
            editingId="footer_config"
            onSubmit={handleSave}
            isSaving={updateMutation.isLoading}
            isLoading={isLoading}
            renderForm={() => (
                <div className="space-y-12">
                    <section className="space-y-8">
                        <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs ">01</div>
                            <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Primary Contact Payload</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Universal Hotline (Phone)</label>
                                <input type="tel" value={formData.contact_phone} onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-black text-slate-900 text-sm tracking-tight" placeholder="+230 208 9999" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Official Courier (Email)</label>
                                <input type="email" value={formData.contact_email} onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-black text-slate-900 text-sm tracking-tight" placeholder="info@travellounge.mu" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Global Headquarters Address</label>
                                <textarea rows="3" value={formData.contact_address} onChange={(e) => setFormData({ ...formData, contact_address: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-slate-800 text-sm leading-relaxed" placeholder="123 Main Street, Port Louis, Mauritius" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Operational Windows (Hours)</label>
                                <textarea rows="3" value={formData.working_hours} onChange={(e) => setFormData({ ...formData, working_hours: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-slate-800 text-sm leading-relaxed" placeholder="Mon-Fri: 9:00 AM - 5:00 PM" />
                            </div>
                        </div>
                    </section>

                    <section className="space-y-8">
                        <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs ">02</div>
                            <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Social Signal Matrix</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2"><Facebook size={12} className="text-red-500" /> Facebook Resource</label>
                                <input type="url" value={formData.facebook_url} onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-mono text-xs text-blue-600" placeholder="https://facebook.com/..." />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2"><Instagram size={12} className="text-red-500" /> Instagram Resource</label>
                                <input type="url" value={formData.instagram_url} onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-mono text-xs text-orange-600" placeholder="https://instagram.com/..." />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2"><Globe size={12} className="text-red-500" /> Website Protocol</label>
                                <input type="url" value={formData.website_url} onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-mono text-xs text-slate-600" placeholder="https://travellounge.mu" />
                            </div>
                        </div>
                    </section>

                    <section className="space-y-8">
                        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs ">03</div>
                                <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Branch Network Nodes</h2>
                            </div>
                            <button type="button" onClick={addLocation} className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-600/20 active:scale-95">
                                <MapPin size={14} /> Add Location Node
                            </button>
                        </div>
                        <div className="space-y-6">
                            {formData.office_locations.map((location, index) => (
                                <div key={index} className="bg-gray-50/50 border border-gray-100 rounded-3xl p-8 relative group transition-all hover:bg-white hover:shadow-premium-xl">
                                    <button type="button" onClick={() => removeLocation(index)} className="absolute top-6 right-6 text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-xl transition-all"><XCircle size={18} /></button>
                                    <div className="space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Branch Identity Name</label>
                                                <input type="text" value={location.name} onChange={(e) => handleLocationChange(index, 'name', e.target.value)}
                                                    className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl outline-none font-black text-slate-900 text-sm shadow-premium-sm" placeholder="Main Branch" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Branch Hotline</label>
                                                <input type="tel" value={location.phone} onChange={(e) => handleLocationChange(index, 'phone', e.target.value)}
                                                    className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl outline-none font-black text-slate-900 text-sm shadow-premium-sm" placeholder="+230..." />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Physical Infrastructure Address</label>
                                            <input type="text" value={location.address} onChange={(e) => handleLocationChange(index, 'address', e.target.value)}
                                                className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl outline-none font-bold text-slate-800 text-sm shadow-premium-sm" placeholder="Full Address..." />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Geo-Location Resource (Maps URL)</label>
                                            <input type="url" value={location.maps_url} onChange={(e) => handleLocationChange(index, 'maps_url', e.target.value)}
                                                className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl outline-none font-mono text-xs text-red-500 shadow-premium-sm" placeholder="https://maps.google.com/..." />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            )}
            renderPreview={() => (
                <div className="lg:sticky lg:top-12 h-fit space-y-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ">Base Layout Preview</h3>
                        <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white shadow-xl">
                            <Eye size={18} />
                        </div>
                    </div>

                    <div className="bg-slate-950 rounded-[3rem] border border-slate-900 shadow-[0_48px_96px_-12px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col">
                        <div className="p-12 space-y-12">
                            <div className="flex flex-col md:flex-row justify-between items-start gap-12">
                                <div className="space-y-6 max-w-xs">
                                    <div className="text-white font-black text-xl tracking-tighter uppercase font-display">TRAVEL LOUNGE</div>
                                    <p className="text-white/40 text-[11px] font-medium leading-relaxed">Pioneering luxury travel experiences from the heart of Mauritius since 2026.</p>
                                    <div className="flex gap-4">
                                        {[Facebook, Instagram, Globe].map((Icon, idx) => (
                                            <div key={idx} className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-red-600 transition-all cursor-pointer">
                                                <Icon size={14} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-12">
                                    <div className="space-y-4">
                                        <p className="text-white text-[10px] font-black uppercase tracking-widest">Connect</p>
                                        <div className="space-y-2 text-[10px] font-medium text-white/40">
                                            <p className="hover:text-white cursor-pointer transition-colors flex items-center gap-2"><Phone size={10} className="text-red-500" /> {formData.contact_phone || '---'}</p>
                                            <p className="hover:text-white cursor-pointer transition-colors flex items-center gap-2"><Mail size={10} className="text-red-500" /> {formData.contact_email || '---'}</p>
                                            <p className="flex items-center gap-2"><Clock size={10} className="text-red-500" /> {formData.working_hours || '---'}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <p className="text-white text-[10px] font-black uppercase tracking-widest">Global HQ</p>
                                        <p className="text-[10px] font-medium text-white/40 leading-relaxed max-w-[120px]">{formData.contact_address || '---'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/5 p-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="text-white/20 text-[8px] font-black uppercase tracking-[0.4em]">© 2026 TRAVEL LOUNGE PROTOCOL</div>
                            <div className="flex gap-8">
                                <div className="text-white/20 text-[8px] font-black uppercase tracking-widest hover:text-white/60 transition-colors cursor-pointer">Security</div>
                                <div className="text-white/20 text-[8px] font-black uppercase tracking-widest hover:text-white/60 transition-colors cursor-pointer">Privacy</div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 flex gap-6 text-emerald-600">
                        <Zap size={28} className="shrink-0 mt-1" />
                        <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-900">Optimization Matrix Active</p>
                            <p className="text-[11px] font-medium leading-relaxed">Footer configurations are dynamically cached and distributed across the global CDN infrastructure for sub-millisecond transmission.</p>
                        </div>
                    </div>
                </div>
            )}
        />
    );
};

export default FooterManager;
