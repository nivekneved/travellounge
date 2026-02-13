import React from 'react';
import { ShieldCheck, Users, Globe, Target, Compass, Heart, MapPin, Zap, Award, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../utils/supabase';
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from '../components/LoadingSpinner';
import PageHero from '../components/PageHero';
import CTASection from '../components/CTASection';

const AboutUs = () => {
    const { t } = useTranslation();

    const { data: pageData, isLoading } = useQuery({
        queryKey: ['page_about', 'v3'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('pages')
                .select('content')
                .eq('slug', 'about')
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            return data?.content;
        },
        staleTime: 1000 * 60 * 5,
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-white">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen">
            {/* Hero Section */}
            <PageHero
                title="Our Legacy"
                subtitle="Redefining Travel Excellence Since 2014"
                image="https://images.unsplash.com/photo-1544918877-460635b6d13e?q=80&w=1920&auto=format&fit=crop"
                icon={Award}
            />

            {/* Story Section - Introduction */}
            <section className="py-24 bg-white">
                <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-black uppercase tracking-widest">
                                <Zap size={16} /> Our Story
                            </div>
                            <h2 className="text-4xl md:text-6xl font-black text-gray-900 leading-[1.1] tracking-tighter">
                                Travel Lounge & <br />Leisure LTD
                            </h2>
                            <div className="space-y-6 text-xl text-gray-600 font-light leading-relaxed">
                                <p>
                                    Located in the heart of the city center of Port Louis, since 2014 TRAVEL LOUNGE LTD is an IATA accredited travel agency specializing in corporate business and personalized holiday leisure travel deals to Mauritian and international travelers.
                                </p>
                                <p>
                                    We ensure you a hassle-free stay. Your peace of mind is our business. Whether you are looking for local hotels, activities, or spa deals, we have curated the best of the island for you.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-gray-100">
                                <div>
                                    <p className="text-4xl font-black text-primary mb-1">10+</p>
                                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Years of Trust</p>
                                </div>
                                <div>
                                    <p className="text-4xl font-black text-primary mb-1">IATA</p>
                                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Accredited</p>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl relative group">
                                <img
                                    src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200&auto=format&fit=crop"
                                    alt="Luxury Travel"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                <div className="absolute bottom-10 left-10 text-white">
                                    <p className="text-2xl font-black">Crafting Perfection</p>
                                    <p className="opacity-80">Since inception</p>
                                </div>
                            </div>
                            {/* Floating Card */}
                            <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-3xl shadow-2xl max-w-[250px] hidden md:block border border-gray-50">
                                <Star className="text-yellow-400 mb-4" fill="currentColor" size={32} />
                                <p className="text-lg font-bold text-gray-900 mb-2">Customer Delight</p>
                                <p className="text-sm text-gray-500 leading-relaxed">Putting our customers first is not just a policy, it's our mission.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Vision & Mission - Light Grey Background */}
            <section className="py-24 bg-gray-50">
                <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Vision Card */}
                        <div className="bg-white p-12 rounded-[2.5rem] shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 group">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-transform">
                                <Target size={32} />
                            </div>
                            <h3 className="text-3xl font-black text-gray-900 mb-6">Our Vision</h3>
                            <p className="text-lg text-gray-600 leading-relaxed font-light">
                                Travel Lounge Ltd is a one stop travel solutions provider which aims to continuously grow across borders, in products and services, and always putting the customer’s delight at first place.
                            </p>
                        </div>
                        {/* Mission Card */}
                        <div className="bg-white p-12 rounded-[2.5rem] shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 group">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-transform">
                                <Compass size={32} />
                            </div>
                            <h3 className="text-3xl font-black text-gray-900 mb-6">Our Mission</h3>
                            <p className="text-lg text-gray-600 leading-relaxed font-light">
                                Our dedicated corporate team members focus on personal advice, support and communication throughout your trip abroad and also provide related solutions to individual customers.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us - White Background */}
            <section className="py-24 bg-white">
                <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <p className="text-primary font-black uppercase tracking-[0.2em] text-sm mb-4">The Travel Lounge Difference</p>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900">Why Choose Us?</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <div className="text-center group p-8 rounded-3xl hover:bg-gray-50 transition-colors">
                            <div className="w-20 h-20 bg-gray-900 text-white rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:bg-primary transition-colors duration-500 shadow-xl">
                                <Users size={36} />
                            </div>
                            <h4 className="text-2xl font-black mb-4">Tailor-made Specialists</h4>
                            <p className="text-gray-500 leading-relaxed">Customize your trips including accommodation, transport, activities, or places of interest of your choice.</p>
                        </div>
                        <div className="text-center group p-8 rounded-3xl hover:bg-gray-50 transition-colors">
                            <div className="w-20 h-20 bg-gray-900 text-white rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:bg-primary transition-colors duration-500 shadow-xl">
                                <Star size={36} />
                            </div>
                            <h4 className="text-2xl font-black mb-4">Guaranteed Quality</h4>
                            <p className="text-gray-500 leading-relaxed">We have a dedicated team to secure the best hotel rates in the most popular destinations.</p>
                        </div>
                        <div className="text-center group p-8 rounded-3xl hover:bg-gray-50 transition-colors">
                            <div className="w-20 h-20 bg-gray-900 text-white rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:bg-primary transition-colors duration-500 shadow-xl">
                                <ShieldCheck size={36} />
                            </div>
                            <h4 className="text-2xl font-black mb-4">IATA Accredited</h4>
                            <p className="text-gray-500 leading-relaxed">Our agents are genuine travel and holiday specialists. Enjoy peace of mind while we assist you.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <CTASection
                title="Ready to Start Your Journey?"
                description="Our specialists are ready to help you craft the perfect itinerary."
                buttonText="Plan Your Trip"
                variant="dark"
                className="mb-24"
            />
        </div>
    );
};

export default AboutUs;
