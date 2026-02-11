import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { Save, Shield, Globe, Mail, Smartphone, Download, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Settings = () => {
    const [settings, setSettings] = useState({
        AMADEUS_CLIENT_ID: '',
        AMADEUS_CLIENT_SECRET: '',
        TWILIO_ACCOUNT_SID: '',
        TWILIO_AUTH_TOKEN: '',
        EMAIL_USER: '',
        EMAIL_PASS: '',
        DATA_RETENTION_MONTHS: '12'
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('site_settings')
                .select('*')
                .in('key', Object.keys(settings));

            if (error) throw error;

            if (data) {
                const newSettings = { ...settings };
                data.forEach(item => {
                    // Extract value from JSONB, handling potentially double-quoted strings
                    let val = item.value;
                    if (typeof val === 'string' && val.startsWith('"') && val.endsWith('"')) {
                        val = val.slice(1, -1);
                    }
                    newSettings[item.key] = val;
                });
                setSettings(newSettings);
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
            toast.error(`Failed to load settings: ${error.message}`);
        }
    };

    const handleUpdate = async (key, value) => {
        try {
            // Save as JSON string to match schema expectation
            const { error } = await supabase
                .from('site_settings')
                .upsert({
                    key,
                    value: JSON.stringify(value),
                    category: 'system',
                    description: `System setting for ${key}`
                });

            if (error) throw error;

            setStatus(`Saved ${key}`);
            setTimeout(() => setStatus(''), 2000);
            toast.success(`${key} updated`);
        } catch (error) {
            console.error('Save error:', error);
            toast.error(`Failed to save ${key}`);
        }
    };

    const handleGdprExport = async () => {
        const email = document.getElementById('gdpr-email').value;
        if (!email) return toast.error('Please enter an email address');

        try {
            toast.loading('Exporting data...');

            // Fetch from relevant tables
            const { data: bookings } = await supabase.from('bookings').select('*').contains('customer_info', { email });
            const { data: newsletter } = await supabase.from('newsletter_subscribers').select('*').eq('email', email);
            const { data: reviews } = await supabase.from('testimonials').select('*').eq('customer_name', email); // Assuming name might be email or related

            const exportData = {
                exported_at: new Date().toISOString(),
                email,
                bookings: bookings || [],
                newsletter_subscription: newsletter || [],
                reviews: reviews || []
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `gdpr-data-${email.replace('@', '-at-')}.json`;
            a.click();

            toast.dismiss();
            toast.success('Data exported successfully');
        } catch (error) {
            console.error('GDPR Export Error:', error);
            toast.error('Failed to export data');
        }
    };

    const handleGdprDelete = async () => {
        const email = document.getElementById('gdpr-email').value;
        if (!email) return toast.error('Please enter an email address');

        if (!window.confirm('PERMANENTLY DELETE ALL DATA FOR USER? This cannot be undone.')) return;

        try {
            toast.loading('Erasing user data...');

            // Delete from all tables
            // Note: Bookings often have 'customer_info' JSONB. Deleting based on JSONB is tricky if not indexed, but doable.
            // However, RLS might prevent deletion if not admin. Login fix ensures we are admin.

            // 1. Delete Bookings (using filter on JSONB)
            // Supabase/Postgres syntax for JSONB containment: customer_info @> {"email": "..."}
            const { error: bookingError } = await supabase
                .from('bookings')
                .delete()
                .contains('customer_info', { email });

            if (bookingError) throw bookingError;

            // 2. Delete Newsletter
            const { error: newsError } = await supabase
                .from('newsletter_subscribers')
                .delete()
                .eq('email', email);

            if (newsError) throw newsError;

            toast.dismiss();
            toast.success('User data permanently erased');
        } catch (error) {
            console.error('GDPR Delete Error:', error);
            toast.error('Failed to delete data: ' + error.message);
        }
    };

    return (
        <div className="max-w-4xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">System Settings</h1>
                <p className="text-gray-500">Configure your API credentials and system behavior here.</p>
            </div>

            {status && (
                <div className="flex items-center gap-2 bg-green-50 text-green-700 p-4 rounded-xl border border-green-200 animate-fade-in">
                    <CheckCircle size={18} /> {status}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Flight API Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                    <div className="flex items-center gap-2 font-bold text-gray-900 border-b pb-2">
                        <Globe className="text-blue-500" /> Flight API Configuration
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs uppercase font-bold text-gray-400">Client ID</label>
                            <input
                                className="w-full mt-1 px-4 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                value={settings.AMADEUS_CLIENT_ID}
                                onChange={(e) => setSettings({ ...settings, AMADEUS_CLIENT_ID: e.target.value })}
                                onBlur={() => handleUpdate('AMADEUS_CLIENT_ID', settings.AMADEUS_CLIENT_ID)}
                            />
                        </div>
                        <div>
                            <label className="text-xs uppercase font-bold text-gray-400">Client Secret</label>
                            <input
                                type="password"
                                className="w-full mt-1 px-4 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                value={settings.AMADEUS_CLIENT_SECRET}
                                onChange={(e) => setSettings({ ...settings, AMADEUS_CLIENT_SECRET: e.target.value })}
                                onBlur={() => handleUpdate('AMADEUS_CLIENT_SECRET', settings.AMADEUS_CLIENT_SECRET)}
                            />
                        </div>
                    </div>
                </div>

                {/* SMS API Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                    <div className="flex items-center gap-2 font-bold text-gray-900 border-b pb-2">
                        <Smartphone className="text-green-500" /> SMS Provider (Twilio)
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs uppercase font-bold text-gray-400">Account SID</label>
                            <input
                                className="w-full mt-1 px-4 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                value={settings.TWILIO_ACCOUNT_SID}
                                onChange={(e) => setSettings({ ...settings, TWILIO_ACCOUNT_SID: e.target.value })}
                                onBlur={() => handleUpdate('TWILIO_ACCOUNT_SID', settings.TWILIO_ACCOUNT_SID)}
                            />
                        </div>
                        <div>
                            <label className="text-xs uppercase font-bold text-gray-400">Auth Token</label>
                            <input
                                type="password"
                                className="w-full mt-1 px-4 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                value={settings.TWILIO_AUTH_TOKEN}
                                onChange={(e) => setSettings({ ...settings, TWILIO_AUTH_TOKEN: e.target.value })}
                                onBlur={() => handleUpdate('TWILIO_AUTH_TOKEN', settings.TWILIO_AUTH_TOKEN)}
                            />
                        </div>
                    </div>
                </div>

                {/* GDPR Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4 md:col-span-2">
                    <div className="flex items-center gap-2 font-bold text-gray-900 border-b pb-2">
                        <Shield className="text-red-500" /> Compliance & Data Retention
                    </div>
                    <div className="flex items-center gap-8 mb-6">
                        <div className="flex-grow">
                            <label className="font-medium text-gray-700">Auto-delete booking data after (months)</label>
                            <p className="text-sm text-gray-500 italic">Mauritius DPA 2017 recommends minimal retention. Default is 12.</p>
                        </div>
                        <input
                            type="number"
                            className="w-24 px-4 py-2 bg-gray-50 border rounded-lg text-center font-bold focus:ring-2 focus:ring-primary outline-none"
                            value={settings.DATA_RETENTION_MONTHS}
                            onChange={(e) => setSettings({ ...settings, DATA_RETENTION_MONTHS: e.target.value })}
                            onBlur={() => handleUpdate('DATA_RETENTION_MONTHS', settings.DATA_RETENTION_MONTHS)}
                        />
                    </div>

                    {/* Manual Tools */}
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <h3 className="font-bold text-sm uppercase tracking-wide text-gray-400 mb-4 flex items-center gap-2">
                            <AlertTriangle size={16} /> Manual Data Request (GDPR / DPA 2017)
                        </h3>
                        <div className="flex flex-col md:flex-row gap-4">
                            <input
                                placeholder="Customer Email Address"
                                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none"
                                id="gdpr-email"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleGdprExport}
                                    className="px-4 py-2 bg-blue-100 text-blue-700 font-bold rounded-lg hover:bg-blue-200 flex items-center gap-2"
                                >
                                    <Download size={18} /> Export JSON
                                </button>
                                <button
                                    onClick={handleGdprDelete}
                                    className="px-4 py-2 bg-red-100 text-red-700 font-bold rounded-lg hover:bg-red-200 flex items-center gap-2"
                                >
                                    <Trash2 size={18} /> Delete Data
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
