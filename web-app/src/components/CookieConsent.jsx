import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const CookieConsent = () => {
    const { t } = useTranslation();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('gdpr_cookie_consent');
        if (!consent) {
            // Slightly delay the banner appearance for better UX
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('gdpr_cookie_consent', 'accepted');
        setIsVisible(false);
        // Here you would typically initialize tracking scripts (e.g. Google Analytics, Pixel)
    };

    const handleDecline = () => {
        localStorage.setItem('gdpr_cookie_consent', 'declined');
        setIsVisible(false);
        // Ensure no tracking scripts are loaded
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 animate-in slide-in-from-bottom-full duration-700 pointer-events-none">
            <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-700 text-white p-6 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-6 items-center justify-between pointer-events-auto relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 z-0"></div>
                <div className="flex items-start gap-4 relative z-10 flex-grow">
                    <div className="p-3 bg-white/5 rounded-xl text-primary shrink-0 hidden md:block">
                        <Shield size={24} />
                    </div>
                    <div>
                        <h4 className="text-sm font-black uppercase tracking-widest mb-2 text-white/90">Your Privacy Matters</h4>
                        <p className="text-xs text-white/60 leading-relaxed font-medium">
                            We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies according to the Mauritius Data Protection Act (DPA 2017) and GDPR.
                            <br className="hidden md:block" />
                            <Link to="/terms#cookies" className="text-primary hover:text-white transition-colors underline underline-offset-2 mt-1 inline-block">Read our Cookie Policy</Link>
                        </p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto relative z-10 shrink-0">
                    <button
                        onClick={handleDecline}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl border border-white/20 hover:bg-white/10 text-xs font-black uppercase tracking-widest transition-all text-white/70 hover:text-white"
                    >
                        Decline Optional
                    </button>
                    <button
                        onClick={handleAccept}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary hover:bg-red-700 text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg hover:scale-105"
                    >
                        Accept All
                    </button>
                </div>
                <button onClick={handleDecline} className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors md:hidden z-10">
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};

export default CookieConsent;
