import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';
import { Ship, Plane, Users, MapPin, Hotel, Calendar, Anchor, Sun, Umbrella, Camera, Mountain, Coffee } from 'lucide-react';

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
        queryKey: ['categories'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .eq('is_active', true)
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
            <section className="py-20 bg-gray-100">
                <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-64 md:h-80 bg-gray-200 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-20 bg-gray-100">
            <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight">
                        Find Your <span className="text-primary">Perfect Escape</span>
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">
                        Explore our curated collections of premium travel experiences.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((cat, index) => {
                        const IconComponent = iconMap[cat.icon] || MapPin;

                        return (
                            <Link
                                key={cat.id}
                                to={cat.link}
                                className="group relative h-64 md:h-80 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                                style={{
                                    animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                                }}
                                aria-label={`Explore ${cat.name} travel packages`}
                            >
                                {/* Skeleton Loader */}
                                {!loadedImages[cat.id] && (
                                    <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 animate-pulse"></div>
                                )}
                                {/* Full Height Background Image */}
                                <img
                                    src={cat.image_url}
                                    alt={cat.name}
                                    loading="lazy"
                                    onLoad={() => handleImageLoad(cat.id)}
                                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${loadedImages[cat.id] ? 'opacity-100' : 'opacity-0'}`}
                                />

                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>

                                {/* Hover Accent */}
                                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-500"></div>

                                {/* Icon Badge - Top Right */}
                                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30 group-hover:bg-primary group-hover:border-primary transition-all duration-300 group-hover:scale-110">
                                    <IconComponent className="text-white" size={24} />
                                </div>

                                {/* Content */}
                                <div className="absolute inset-0 flex items-end justify-center p-6 text-center">
                                    <h3 className="text-white font-bold text-2xl md:text-3xl uppercase tracking-wider drop-shadow-lg group-hover:text-primary-100 transition-colors duration-300">
                                        {cat.name}
                                    </h3>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default CategoryGrid;
