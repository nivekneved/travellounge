import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';
import { toast } from 'react-hot-toast';
import { Save, MapPin, Phone, Mail, Clock, Facebook, Instagram, Globe, XCircle } from 'lucide-react';

const FooterManager = () => {
 const queryClient = useQueryClient();

 // Fetch site settings
 const { data: settings = {}, isLoading, isError, error } = useQuery({
 queryKey: ['site-settings'],
 queryFn: async () => {
 const { data, error } = await supabase
 .from('site_settings')
 .select('*');

 if (error) throw error;

 // Convert array to object for easier access
 const settingsObj = {};
 data.forEach(setting => {
 settingsObj[setting.key] = setting.value;
 });
 return settingsObj;
 }
 });

 React.useEffect(() => {
 if (isError && error) {
 toast.error(`Failed to load footer settings: ${error.message}`);
 }
 }, [isError, error]);

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

 // Update form data when settings load
 React.useEffect(() => {
 if (settings && Object.keys(settings).length > 0) {
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

 // Update settings mutation
 const updateMutation = useMutation({
 mutationFn: async (updates) => {
 const promises = Object.entries(updates).map(([key, value]) =>
 supabase
 .from('site_settings')
 .upsert({
 key,
 value,
 category: 'footer',
 updated_at: new Date().toISOString()
 }, {
 onConflict: 'key'
 })
 );

 await Promise.all(promises);
 },
 onSuccess: () => {
 queryClient.invalidateQueries(['site-settings']);
 toast.success('Footer settings updated successfully!');
 },
 onError: (error) => {
 toast.error(`Error: ${error.message}`);
 }
 });

 const handleSubmit = (e) => {
 e.preventDefault();
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
 office_locations: [
 ...formData.office_locations,
 { name: '', address: '', phone: '', maps_url: '' }
 ]
 });
 };

 const removeLocation = (index) => {
 const newLocations = formData.office_locations.filter((_, i) => i !== index);
 setFormData({ ...formData, office_locations: newLocations });
 };

 if (isLoading) {
 return (
 <div className="flex flex-col items-center justify-center h-64 gap-4">
 <div className="w-12 h-12 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin"></div>
 <p className="text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">Loading settings...</p>
 </div>
 );
 }

 return (
 <div className="space-y-6">
 {/* Header */}
 <div>
 <h1 className="text-3xl font-display font-bold text-gray-900 ">Footer Manager</h1>
 <p className="text-gray-500 mt-1">Manage footer contact information, social links, and office locations</p>
 </div>

 {/* Form */}
 <form onSubmit={handleSubmit} className="space-y-6">
 {/* Contact Information */}
 <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600 shadow-inner border border-red-100/50">
 <Phone size={24} />
 </div>
 <div>
 <h2 className="text-xl font-bold text-gray-900 leading-none">Contact Information</h2>
 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">Primary contact details</p>
 </div>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
 <div className="space-y-3">
 <label className="text-xs font-black text-gray-400 uppercase tracking-widest ">
 Phone Number
 </label>
 <input
 type="tel"
 value={formData.contact_phone}
 onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
 placeholder="+230 208 9999"
 className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none font-bold text-sm transition-all"
 />
 </div>
 <div className="space-y-3">
 <label className="text-xs font-black text-gray-400 uppercase tracking-widest ">
 Email Address
 </label>
 <input
 type="email"
 value={formData.contact_email}
 onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
 placeholder="info@travellounge.mu"
 className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none font-bold text-sm transition-all"
 />
 </div>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
 <div className="space-y-3">
 <label className="text-xs font-black text-gray-400 uppercase tracking-widest ">
 Main Address
 </label>
 <textarea
 value={formData.contact_address}
 onChange={(e) => setFormData({ ...formData, contact_address: e.target.value })}
 placeholder="123 Main Street, Port Louis, Mauritius"
 rows="3"
 className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none font-bold text-sm transition-all"
 />
 </div>
 <div className="space-y-3">
 <label className="text-xs font-black text-gray-400 uppercase tracking-widest ">
 Working Hours
 </label>
 <textarea
 value={formData.working_hours}
 onChange={(e) => setFormData({ ...formData, working_hours: e.target.value })}
 placeholder="Mon-Fri: 9:00 AM - 5:00 PM"
 rows="3"
 className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none font-bold text-sm transition-all"
 />
 </div>
 </div>
 </div>

 {/* Social Media */}
 <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600 shadow-inner border border-red-100/50">
 <Globe size={24} />
 </div>
 <div>
 <h2 className="text-xl font-bold text-gray-900 leading-none">Social Media & Web</h2>
 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">Connect with your audience</p>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
 <div className="space-y-3">
 <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
 <Facebook size={14} className="text-red-500" />
 Facebook URL
 </label>
 <input
 type="url"
 value={formData.facebook_url}
 onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
 placeholder="https://facebook.com/travellounge"
 className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none font-bold text-sm transition-all"
 />
 </div>
 <div className="space-y-3">
 <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
 <Instagram size={14} className="text-red-500" />
 Instagram URL
 </label>
 <input
 type="url"
 value={formData.instagram_url}
 onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
 placeholder="https://instagram.com/travellounge"
 className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none font-bold text-sm transition-all"
 />
 </div>
 <div className="space-y-3">
 <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
 <Globe size={14} className="text-red-500" />
 Website URL
 </label>
 <input
 type="url"
 value={formData.website_url}
 onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
 placeholder="https://travellounge.mu"
 className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none font-bold text-sm transition-all"
 />
 </div>
 </div>
 </div>

 {/* Office Locations */}
 <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600 shadow-inner border border-red-100/50">
 <MapPin size={24} />
 </div>
 <div>
 <h2 className="text-xl font-bold text-gray-900 leading-none">Office Locations</h2>
 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">Physical branches & maps</p>
 </div>
 </div>
 <button
 type="button"
 onClick={addLocation}
 className="bg-gray-900 hover:bg-black text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg active:scale-95 text-xs flex items-center gap-2"
 >
 <MapPin size={16} className="text-red-500" />
 Add Location
 </button>
 </div>

 <div className="space-y-4">
 {formData.office_locations.map((location, index) => (
 <div key={index} className="bg-gray-50/50 border border-gray-100 rounded-2xl p-6 relative group transition-all hover:bg-white hover:shadow-md">
 <button
 type="button"
 onClick={() => removeLocation(index)}
 className="absolute top-4 right-4 text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-all"
 >
 <XCircle size={18} />
 </button>

 <div className="space-y-6">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="space-y-2">
 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ">Location Name</label>
 <input
 type="text"
 value={location.name}
 onChange={(e) => handleLocationChange(index, 'name', e.target.value)}
 placeholder="Port Louis Office"
 className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none font-bold text-sm transition-all shadow-sm"
 />
 </div>
 <div className="space-y-2">
 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ">Phone Number</label>
 <input
 type="tel"
 value={location.phone}
 onChange={(e) => handleLocationChange(index, 'phone', e.target.value)}
 placeholder="+230 208 9999"
 className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none font-bold text-sm transition-all shadow-sm"
 />
 </div>
 </div>

 <div className="space-y-2">
 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ">Physical Address</label>
 <input
 type="text"
 value={location.address}
 onChange={(e) => handleLocationChange(index, 'address', e.target.value)}
 placeholder="123 Main Street, Port Louis"
 className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none font-bold text-sm transition-all shadow-sm"
 />
 </div>

 <div className="space-y-2">
 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ">Google Maps URL</label>
 <input
 type="url"
 value={location.maps_url}
 onChange={(e) => handleLocationChange(index, 'maps_url', e.target.value)}
 placeholder="https://maps.google.com/..."
 className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none font-mono text-[11px] transition-all shadow-sm"
 />
 </div>
 </div>
 </div>
 ))}

 {formData.office_locations.length === 0 && (
 <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
 <MapPin size={40} className="mx-auto text-gray-200 mb-3" />
 <p className="text-gray-400 font-bold ">No office locations added yet</p>
 <p className="text-[10px] text-gray-300 uppercase tracking-widest mt-1">Click "Add Location" to start</p>
 </div>
 )}
 </div>
 </div>

 {/* Submit Button */}
 <div className="flex justify-end pt-6">
 <button
 type="submit"
 disabled={updateMutation.isPending}
 className="bg-red-600 hover:bg-red-700 text-white px-12 py-4 rounded-xl font-bold transition-all shadow-lg shadow-red-600/30 active:scale-95 disabled:opacity-50 flex items-center gap-3 text-lg"
 >
 {updateMutation.isPending ? <MapPin size={20} className="animate-bounce" /> : <Save size={20} />}
 {updateMutation.isPending ? 'Saving Settings...' : 'Save Footer Settings'}
 </button>
 </div>
 </form>
 </div>
 );
};

export default FooterManager;
