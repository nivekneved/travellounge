import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';
import { Ship, Plane, Users, MapPin, Hotel, Calendar, Anchor, Sun, Umbrella, Camera, Mountain, Coffee, ArrowRight } from 'lucide-react';

const iconMap = {
    'Ship': Ship,
    'Plane': Plane,
    'Users': Users,
    'MapPin': MapPin,
    'Hotel': Hotel,
    'Calendar': Calendar,
    'Anchor': Anchor,
    'Sun': Sun,
    'Umbrella': Umbrella,
    'Camera': Camera,
    'Mountain': Mountain,
    'Coffee': Coffee
};

const CategoryGrid = () => {
    const [loadedImages, setLoadedImages] = useState({});

    const { data: categories = [], isLoading } = useQuery({
        queryKey: ['categories_home'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .eq('is_active', true)
                .eq('show_on_home', true)
                .order('display_order', { ascending: true });

            if (error) throw error;
            return data;
        }
    });

    const handleImageLoad = (catId) => {
        setLoadedImages(prev => ({ ...prev, [catId]: true }));
    };

    if (isLoading) {
        return (
            <section className="py-24 bg-gray-50">
                <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-[300px] bg-white rounded-3xl animate-pulse shadow-sm" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-24 bg-gray-50 overflow-hidden">
            <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8">
                <div className="text-center mb-20">
                    <h2 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 uppercase tracking-tight leading-none">
                        Find Your <br /><span className="text-primary">Perfect Escape</span>
                    </h2>
                    <p className="text-gray-500 max-w-2xl mx-auto text-xl font-light">
                        Explore our curated collections of premium travel experiences, from tropical hideaways to world-class cities.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {categories.map((cat, index) => {
                        const IconComponent = iconMap[cat.icon] || MapPin;
                        const isRodrigues = cat.name.toLowerCase() === 'rodrigues';

                        return (
                            <div
                                key={cat.id}
                                className="group h-[350px] [perspective:1000px] rounded-[2.5rem] transform hover:-translate-y-4 transition-all duration-700"
                                style={{
                                    animation: `fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) ${index * 0.15}s both`
                                }}
                            >
                                <div className="relative h-full w-full transition-all duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                                    {/* Front Side */}
                                    <Link
                                        to={cat.link}
                                        className="absolute inset-0 h-full w-full rounded-[2.5rem] overflow-hidden shadow-2xl [backface-visibility:hidden]"
                                        aria-label={`Explore ${cat.name} travel packages`}
                                    >
                                        {!loadedImages[cat.id] && (
                                            <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
                                        )}
                                        <img
                                            src={cat.image_url}
                                            alt={cat.name}
                                            loading="lazy"
                                            onLoad={() => handleImageLoad(cat.id)}
                                            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${loadedImages[cat.id] ? 'opacity-100' : 'opacity-0'}`}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-90 transition-opacity duration-500"></div>
                                        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-700"></div>
                                        <div className="absolute inset-0 border-[1px] border-white/10 rounded-[2.5rem] m-4 pointer-events-none group-hover:border-primary/30 transition-colors duration-500"></div>

                                        <div className="absolute bottom-0 left-0 right-0 p-8">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="bg-white/10 backdrop-blur-xl p-3.5 rounded-2xl border border-white/20 group-hover:bg-primary group-hover:border-primary transition-all duration-500 shadow-lg">
                                                    <IconComponent className="text-white" size={24} />
                                                </div>
                                                <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px] bg-primary/10 px-3 py-1 rounded-full backdrop-blur-md border border-primary/20">
                                                    Discover
                                                </span>
                                            </div>
                                            <h3 className="text-white font-black text-3xl md:text-4xl uppercase tracking-tighter mb-3 leading-none">
                                                {cat.name}
                                            </h3>
                                            <p className="text-gray-300 text-sm font-light leading-relaxed max-w-[90%] line-clamp-2">
                                                {cat.description || "Discover premium hand-picked experiences and exclusive deals for your next dream holiday."}
                                            </p>
                                        </div>
                                    </Link>

                                    {/* Back Side (Flip) */}
                                    <Link
                                        to={cat.link}
                                        className="absolute inset-0 h-full w-full rounded-[2.5rem] bg-gray-900 overflow-hidden shadow-2xl [transform:rotateY(180deg)] [backface-visibility:hidden] flex flex-col p-8"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-4 mb-6">
                                                <div className="bg-primary p-3 rounded-2xl shadow-lg shadow-primary/20">
                                                    <IconComponent className="text-white" size={24} />
                                                </div>
                                                <span className="text-primary font-black uppercase tracking-[0.2em] text-xs">
                                                    Island Insight
                                                </span>
                                            </div>
                                            <h3 className="text-white font-black text-3xl uppercase tracking-tight mb-4">
                                                {isRodrigues ? "Authentic Rodrigues" : `Explore ${cat.name}`}
                                            </h3>
                                            <p className="text-gray-400 text-base leading-relaxed mb-8">
                                                {isRodrigues
                                                    ? "Experience the untouched beauty, lagoon activities, and legendary hospitality of Rodrigues Island. From charming guest houses to premium beachfront hotels."
                                                    : cat.description || "Unforgettable journeys tailored for the discerning traveler. Explore our curated selection of stays and activities."}
                                            </p>

                                            {isRodrigues && (
                                                <div className="grid grid-cols-2 gap-4 mt-auto">
                                                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                                                        <p className="text-primary font-black text-xs uppercase tracking-widest mb-1">Stay</p>
                                                        <p className="text-white text-sm">Guest Houses & Hotels</p>
                                                    </div>
                                                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                                                        <p className="text-primary font-black text-xs uppercase tracking-widest mb-1">Eat</p>
                                                        <p className="text-white text-sm">Rodriguan Flavors</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-8 mb-[25px] flex items-center justify-between group/btn">
                                            <span className="text-white font-black text-sm uppercase tracking-widest">Explore Now</span>
                                            <div className="bg-primary w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover/btn:scale-110">
                                                <ArrowRight className="text-white" size={20} />
                                            </div>
                                        </div>

                                        {/* Background Decoration */}
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
                                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 blur-[40px] rounded-full translate-y-1/2 -translate-x-1/2"></div>
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default CategoryGrid;
