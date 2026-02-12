import React from 'react';
import { FileCheck, Globe, ShieldCheck, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import CTASection from '../components/CTASection';
import TrustSection from '../components/TrustSection';

const VisaServices = () => {
    return (
        <div className="bg-white min-h-screen pb-20">
            {/* Hero Section */}
            <PageHero
                title="Visa Services"
                subtitle="Hassle-free visa assistance for your global travels."
                image="https://images.unsplash.com/photo-1544027993-37dbfe43562a?q=80&w=1920"
                icon={FileCheck}
            />

            {/* Content */}
            <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 pt-12 md:pt-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
                    <div>
                        <h2 className="text-4xl font-black mb-6">Simplifying Your Travel Documents</h2>
                        <p className="text-gray-600 text-lg leading-relaxed mb-6">
                            Navigating visa requirements can be complex. At Travel Lounge, we provide expert assistance to ensure your travel documents are in order, whether you're traveling for business, leisure, or study.
                        </p>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <CheckCircle className="text-primary mt-1" size={20} />
                                <p className="text-gray-700">Expert guidance on visa requirements for various destinations.</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle className="text-primary mt-1" size={20} />
                                <p className="text-gray-700">Assistance with application forms and documentation.</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle className="text-primary mt-1" size={20} />
                                <p className="text-gray-700">Appointment scheduling and submission support.</p>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-gray-50 p-8 rounded-3xl hover:bg-white hover:shadow-xl transition-all border border-gray-100 text-center group">
                            <Globe size={40} className="mx-auto mb-4 text-gray-400 group-hover:text-primary transition-colors" />
                            <h3 className="font-bold text-lg mb-2">Global Coverage</h3>
                            <p className="text-sm text-gray-500">Assistance for major destinations worldwide.</p>
                        </div>
                        <div className="bg-gray-50 p-8 rounded-3xl hover:bg-white hover:shadow-xl transition-all border border-gray-100 text-center group">
                            <ShieldCheck size={40} className="mx-auto mb-4 text-gray-400 group-hover:text-primary transition-colors" />
                            <h3 className="font-bold text-lg mb-2">Secure Process</h3>
                            <p className="text-sm text-gray-500">Your specific documents handled with care.</p>
                        </div>
                        <div className="bg-gray-50 p-8 rounded-3xl hover:bg-white hover:shadow-xl transition-all border border-gray-100 text-center group md:col-span-2">
                            <Clock size={40} className="mx-auto mb-4 text-gray-400 group-hover:text-primary transition-colors" />
                            <h3 className="font-bold text-lg mb-2">Timely Updates</h3>
                            <p className="text-sm text-gray-500">Track your application status with our team.</p>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <CTASection
                    title="Need Visa Assistance?"
                    description="Contact our specialists today to start your visa application process."
                    buttonText="Contact Us"
                    variant="dark"
                    className="mt-12"
                />

                <TrustSection />
            </div>
        </div>
    );
};

export default VisaServices;
