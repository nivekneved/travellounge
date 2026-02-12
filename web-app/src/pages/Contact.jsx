import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import Button from '../components/Button';
import PageHero from '../components/PageHero';
import { supabase } from '../utils/supabase';
import { useQuery } from '@tanstack/react-query';

const Contact = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);

    // Fetch Site Settings
    const { data: settings = {}, isLoading: isSettingsLoading } = useQuery({
        queryKey: ['site_settings_contact'],
        queryFn: async () => {
            const { data, error } = await supabase.from('site_settings').select('*');
            if (error) throw error;
            return data.reduce((acc, item) => ({ ...acc, [item.key]: item.value }), {});
        },
        staleTime: 1000 * 60 * 5,
    });

    // Default values if settings are missing or formatted oddly
    const contactPhone = settings.contact_phone ? settings.contact_phone.replace(/"/g, '') : "+230 212 4070";
    const contactEmail = settings.contact_email ? settings.contact_email.replace(/"/g, '') : "reservation@travellounge.mu";
    const contactAddress = settings.contact_address ? settings.contact_address.replace(/"/g, '') : "Ground Floor Newton Tower, Sir William Newton St, Port Louis, Mauritius";
    const workingHours = settings.working_hours ? settings.working_hours.replace(/"/g, '') : "Mon-Fri 08:30-16:45";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.target);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            message: formData.get('message')
        };

        try {
            const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const response = await fetch(`${apiBase}/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Failed to send');
            toast.success('Message sent! We will reply shortly.');
            e.target.reset();
        } catch (error) {
            toast.error('Failed to send message. Please try again.');
            console.error('Contact form error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (isSettingsLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-white">
                <Loader2 className="animate-spin text-primary w-12 h-12" />
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen pb-20">
            <PageHero
                title={t('contact.title')}
                subtitle={t('contact.subtitle')}
                image="https://images.unsplash.com/photo-1523966211575-eb4a01e7dd51?q=80&w=1920"
                icon={Mail}
            />

            <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 mt-12">

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-gray-50 p-8 rounded-[32px] border border-gray-100">
                            <h3 className="text-xl font-bold mb-6">Contact Info</h3>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="bg-primary/10 p-3 rounded-xl text-primary">
                                        <Phone size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">Phone</p>
                                        <p className="text-gray-500">{contactPhone}</p>
                                        <p className="text-gray-500 text-xs mt-1">{workingHours}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="bg-primary/10 p-3 rounded-xl text-primary">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">Email</p>
                                        <p className="text-gray-500">{contactEmail}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="bg-primary/10 p-3 rounded-xl text-primary">
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">Head Office</p>
                                        <p className="text-gray-500 text-sm whitespace-pre-line">{contactAddress}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="bg-white p-8 md:p-12 rounded-[40px] shadow-xl border border-gray-100">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{t('contact.form.name')}</label>
                                    <input type="text" name="name" required placeholder="John Doe" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold outline-none focus:border-primary focus:bg-white transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{t('contact.form.email')}</label>
                                    <input type="email" name="email" required placeholder="john@example.com" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold outline-none focus:border-primary focus:bg-white transition-all" />
                                </div>
                            </div>
                            <div className="mb-8">
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{t('contact.form.message')}</label>
                                <textarea name="message" required placeholder="I would like to enquire about..." className="w-full h-40 bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold outline-none focus:border-primary focus:bg-white transition-all resize-none"></textarea>
                            </div>
                            <Button
                                disabled={loading}
                                className="w-full py-5 uppercase tracking-widest shadow-xl shadow-primary/20"
                            >
                                {loading ? 'Sending...' : <><Send size={18} /> {t('contact.form.send')}</>}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
