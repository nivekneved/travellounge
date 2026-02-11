import React from 'react';
import { ShieldCheck, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const TrustSection = ({ className = "" }) => {
    return (
        <section className={`py-24 bg-white ${className}`}>
            <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
                    <div className="lg:col-span-1">
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight uppercase">
                            Why Trust <br /><span className="text-primary">Travel Lounge?</span>
                        </h2>
                        <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                            Experience safe, secure, and memorable holidays with the assistance of our IATA accredited travel agents.
                        </p>
                        <Link to="/about" className="inline-flex items-center gap-2 text-primary font-bold hover:gap-4 transition-all uppercase tracking-widest text-sm">
                            Learn More About Us <ArrowRight size={18} />
                        </Link>
                    </div>
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-10 rounded-[2rem] bg-gray-50 border border-gray-100 hover:shadow-xl transition-all duration-500 group">
                            <div className="w-16 h-16 rounded-2xl bg-white shadow-inner flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <ShieldCheck size={32} className="text-primary" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-gray-900">IATA Accredited</h3>
                            <p className="text-gray-500 leading-relaxed">Internationally recognized and bonded for your complete peace of mind and financial security.</p>
                        </div>
                        <div className="p-10 rounded-[2rem] bg-gray-50 border border-gray-100 hover:shadow-xl transition-all duration-500 group">
                            <div className="w-16 h-16 rounded-2xl bg-white shadow-inner flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Users size={32} className="text-primary" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-gray-900">Expert Assistance</h3>
                            <p className="text-gray-500 leading-relaxed">Create tailor-made trips with our agents or book your next hotel online in just a few clicks.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TrustSection;
