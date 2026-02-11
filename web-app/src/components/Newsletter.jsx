import React, { useState } from 'react';
import { Mail, Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const Newsletter = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [consent, setConsent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [subscribed, setSubscribed] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!consent) {
            toast.error('Please agree to the privacy policy');
            return;
        }

        setLoading(true);
        try {
            const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const response = await fetch(`${apiBase}/newsletter`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, consent })
            });

            if (!response.ok) throw new Error('Failed to subscribe');
            setSubscribed(true);
            toast.success('Welcome to the island club!');
        } catch (error) {
            toast.error('Failed to subscribe. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (subscribed) {
        return (
            <div className="bg-primary/5 rounded-3xl p-8 border border-primary/10 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="text-primary" size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2">{t('newsletter.success')}</h3>
                <p className="text-gray-500">{t('newsletter.success_sub')}</p>
            </div>
        );
    }

    return (
        <section className="py-20 bg-white">
            <div className="container">
                <div className="bg-gray-900 rounded-3xl p-12 md:p-16 relative overflow-hidden group max-w-4xl mx-auto">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-all duration-700" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <Mail className="text-primary" size={24} />
                            <span className="text-xs font-black text-primary uppercase tracking-[0.2em]">{t('newsletter.join')}</span>
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-4 leading-tight">
                            {t('newsletter.title')}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="relative">
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-gray-600 outline-none focus:border-primary/50 transition-all"
                                />
                                <button
                                    disabled={loading}
                                    className="absolute right-2 top-2 bottom-2 bg-primary text-white px-4 rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    <Send size={20} />
                                </button>
                            </div>

                            <label className="flex items-start gap-3 cursor-pointer group/label">
                                <div className="relative mt-1">
                                    <input
                                        type="checkbox"
                                        checked={consent}
                                        onChange={(e) => setConsent(e.target.checked)}
                                        className="peer sr-only"
                                    />
                                    <div className="w-5 h-5 border-2 border-white/10 rounded flex items-center justify-center peer-checked:bg-primary peer-checked:border-primary transition-all">
                                        <CheckCircle2 size={12} className="text-white scale-0 peer-checked:scale-100 transition-all" />
                                    </div>
                                </div>
                                <span className="text-[11px] text-gray-500 leading-relaxed group-hover/label:text-gray-400 transition-colors">
                                    {t('newsletter.consent')}
                                </span>
                            </label>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Newsletter;
