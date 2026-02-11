import React from 'react';
import { ShieldCheck, Users, Globe, Target, Compass, Heart, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../utils/supabase';
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from '../components/LoadingSpinner';
import PageHero from '../components/PageHero';
import CTASection from '../components/CTASection';
import StatsSection from '../components/StatsSection';

const AboutUs = () => {
    const { t } = useTranslation();

    const defaultContent = {
        hero: {
            title: "Crafting Memories",
            subtitle: "Est. 2010",
            image_url: "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&q=80&w=1920"
        },
        stats: [
            { label: "Years of Excellence", value: "15+" },
            { label: "Happy Travelers", value: "50k+" },
            { label: "Global Destinations", value: "100+" },
            { label: "Support", value: "24/7" }
        ],
        story: {
            title: "Redefining Travel Excellence",
            paragraphs: [
                "At Travel Lounge, we give you the freedom to either create tailor-made trips with our dedicated experts or book your next dream holiday in few clicks. Whether it's a luxury getaway or an adventurous expedition, we ensure every journey is crafted with precision and care.",
                "Enjoy safe, secure and memorable holidays with the assistance of our IATA accredited travel agents. With over 15 years of industry leadership, we have built a reputation for trust, reliability, and unparalleled local expertise in Mauritius and beyond."
            ],
            images: [
                "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800",
                "https://images.unsplash.com/photo-1506929113614-bb48ac504977?auto=format&fit=crop&w=600"
            ]
        },
        values: [
            {
                title: "IATA Accredited",
                desc: "Your safe, secure and memorable holidays are guaranteed by our internationally recognized accreditation.",
                icon: "ShieldCheck"
            },
            {
                title: "Physical Presence",
                desc: "Visit us at our branches in Port Louis (Newton Tower) and Ebene (Ebene Mews) for personalized assistance.",
                icon: "MapPin"
            },
            {
                title: "Tailor-Made Trips",
                desc: "Experience total freedom with customized itineraries designed specifically for your unique preferences.",
                icon: "Compass"
            }
        ]
    };

    const { data: pageData, isLoading } = useQuery({
        queryKey: ['page_about', 'v2'],
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

    const content = pageData ? { ...defaultContent, ...pageData } : defaultContent;
    const { stats, story, values } = content;

    const getIcon = (iconName) => {
        const icons = { ShieldCheck, Users, Target, Globe, Compass, Heart, MapPin };
        return icons[iconName] || ShieldCheck;
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-white">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen">
            {/* Hero Section - Standardized 350px */}
            <PageHero
                title="Our Story"
                subtitle="Crafting memories since 2010"
                image="https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&q=80&w=1920"
                icon={Target}
            />

            {/* Main Content Area - 2 Columns */}
            <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 py-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">

                    {/* Left Column: Vision & Narrative */}
                    <div className="lg:col-span-7">
                        <div className="flex items-center gap-4 mb-8">
                            <span className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Compass size={24} />
                            </span>
                            <span className="text-primary font-bold uppercase tracking-widest text-base">Our Philosophy</span>
                        </div>

                        <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-10 leading-[1.1] tracking-tighter">
                            {story.title}
                        </h2>

                        <div className="space-y-8 text-xl text-gray-600 font-light leading-relaxed mb-16">
                            {story.paragraphs.map((para, idx) => (
                                <p key={idx}>{para}</p>
                            ))}
                        </div>

                        {/* Stats Section Integrated */}
                        <StatsSection stats={stats} />
                    </div>

                    {/* Right Column: Imagery & Values */}
                    <div className="lg:col-span-5 space-y-12">
                        {/* Immersive Visual */}
                        <div className="relative rounded-[3rem] overflow-hidden shadow-2xl group ring-1 ring-gray-100">
                            <img
                                src={story.images[0]}
                                className="w-full h-[600px] object-cover hover:scale-105 transition-transform duration-1000"
                                alt="Travel Experience"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            <div className="absolute bottom-12 left-12 text-white">
                                <p className="text-sm font-bold uppercase tracking-widest opacity-80 mb-3">Our Mission</p>
                                <p className="text-3xl font-black leading-tight">Elevating Every <br />Journey</p>
                            </div>
                        </div>

                        {/* Values - High Impact List */}
                        <div className="space-y-6 pt-4">
                            {values.map((item, i) => {
                                const Icon = getIcon(item.icon);
                                return (
                                    <div key={i} className="flex gap-6 p-7 rounded-[2rem] bg-gray-50 border border-gray-100 items-start hover:border-primary/40 hover:bg-white hover:shadow-xl transition-all duration-500 group">
                                        <div className="w-16 h-16 rounded-2xl bg-white shadow-inner flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
                                            <Icon size={28} className="text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold mb-2 text-gray-900">{item.title}</h3>
                                            <p className="text-gray-500 text-base leading-relaxed">{item.description || item.desc}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Final CTA Section */}
            <CTASection
                title="Your Island Story Starts Here"
                description="Join thousands of travelers who have discovered the true essence of the tropics with Travel Lounge."
                buttonText="Check Availability"
                variant="dark"
                className="mt-12 mb-24"
            />
        </div>
    );
};

export default AboutUs;
