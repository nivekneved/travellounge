import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';
import { toast } from 'react-hot-toast';
import { Save, MapPin, Phone, Mail, Clock, Facebook, Instagram, Globe } from 'lucide-react';

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
        return <div className="flex items-center justify-center h-64">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-gray-900">Footer Manager</h1>
                <p className="text-gray-600 mt-1">Manage footer contact information and links</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contact Information */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Phone size={24} className="text-primary" />
                        Contact Information
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                value={formData.contact_phone}
                                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                                placeholder="+230 208 9999"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={formData.contact_email}
                                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                                placeholder="info@travellounge.mu"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Main Address
                        </label>
                        <textarea
                            value={formData.contact_address}
                            onChange={(e) => setFormData({ ...formData, contact_address: e.target.value })}
                            placeholder="123 Main Street, Port Louis, Mauritius"
                            rows="3"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Working Hours
                        </label>
                        <input
                            type="text"
                            value={formData.working_hours}
                            onChange={(e) => setFormData({ ...formData, working_hours: e.target.value })}
                            placeholder="Mon-Fri: 9:00 AM - 5:00 PM"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Social Media */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Globe size={24} className="text-primary" />
                        Social Media Links
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                <Facebook size={16} />
                                Facebook URL
                            </label>
                            <input
                                type="url"
                                value={formData.facebook_url}
                                onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                                placeholder="https://facebook.com/travellounge"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                <Instagram size={16} />
                                Instagram URL
                            </label>
                            <input
                                type="url"
                                value={formData.instagram_url}
                                onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                                placeholder="https://instagram.com/travellounge"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Website URL
                        </label>
                        <input
                            type="url"
                            value={formData.website_url}
                            onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                            placeholder="https://travellounge.mu"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Office Locations */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <MapPin size={24} className="text-primary" />
                            Office Locations
                        </h2>
                        <button
                            type="button"
                            onClick={addLocation}
                            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-bold text-sm"
                        >
                            + Add Location
                        </button>
                    </div>

                    <div className="space-y-4">
                        {formData.office_locations.map((location, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4 relative">
                                <button
                                    type="button"
                                    onClick={() => removeLocation(index)}
                                    className="absolute top-2 right-2 text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                >
                                    ✕
                                </button>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Location Name
                                        </label>
                                        <input
                                            type="text"
                                            value={location.name}
                                            onChange={(e) => handleLocationChange(index, 'name', e.target.value)}
                                            placeholder="Port Louis Office"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Phone
                                        </label>
                                        <input
                                            type="tel"
                                            value={location.phone}
                                            onChange={(e) => handleLocationChange(index, 'phone', e.target.value)}
                                            placeholder="+230 208 9999"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Address
                                    </label>
                                    <input
                                        type="text"
                                        value={location.address}
                                        onChange={(e) => handleLocationChange(index, 'address', e.target.value)}
                                        placeholder="123 Main Street, Port Louis"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>
                                <div className="mt-4">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Google Maps URL
                                    </label>
                                    <input
                                        type="url"
                                        value={location.maps_url}
                                        onChange={(e) => handleLocationChange(index, 'maps_url', e.target.value)}
                                        placeholder="https://maps.google.com/..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>
                            </div>
                        ))}

                        {formData.office_locations.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <p>No office locations added yet</p>
                                <p className="text-sm mt-1">Click "Add Location" to add your first office</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={updateMutation.isLoading}
                        className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl hover:bg-red-700 transition-colors font-bold disabled:opacity-50"
                    >
                        <Save size={20} />
                        {updateMutation.isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FooterManager;
