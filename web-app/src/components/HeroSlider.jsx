import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

const STATIC_SLIDES = [
    {
        id: 1,
        image_url: "https://images.unsplash.com/photo-1563492063799-9ae2816d1b33?q=80&w=1920&auto=format&fit=crop",
        subtitle: "YOUR TRUSTED HOLIDAY PARTNER",
        title: "Visit Bangkok",
        description: "Experience the vibrant energy, stunning nightlife, and world-class street food of Thailand's capital.",
        cta_text: "Explore Bangkok",
        cta_link: "/search?search=Bangkok"
    },
    {
        id: 2,
        image_url: "https://images.unsplash.com/photo-1544918877-460635b6d13e?q=80&w=1920",
        subtitle: "IATA ACCREDITED AGENCY",
        title: "Beautiful Malaysia",
        description: "From the skyscrapers of KL to the pristine beaches of Langkawi, discover the magic of Malaysia.",
        cta_text: "View Malaysia",
        cta_link: "/search?search=Malaysia"
    },
    {
        id: 3,
        image_url: "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1920&auto=format&fit=crop",
        subtitle: "SAFE & SECURE BOOKING",
        title: "Explore Vietnam",
        description: "Journey through breathtaking landscapes, rich history, and the soulful culture of Vietnam.",
        cta_text: "Discover Vietnam",
        cta_link: "/search?search=Vietnam"
    },
    {
        id: 4,
        image_url: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1920&auto=format&fit=crop",
        subtitle: "PREMIUM TRAVEL EXPERIENCES",
        title: "Experience Dubai",
        description: "Witness the pinnacle of modern luxury and adventure in the heart of the Emirates.",
        cta_text: "Dubai Deals",
        cta_link: "/search?search=Dubai"
    }
];

const HeroSlider = () => {
    const { data: slides, isLoading } = useQuery({
        queryKey: ['hero_slides'],
        queryFn: async () => {
            try {
                const { data, error } = await supabase
                    .from('hero_slides')
                    .select('*')
                    .eq('is_active', true)
                    .order('order_index', { ascending: true });

                if (error) throw error;
                return data && data.length > 0 ? data : STATIC_SLIDES;
            } catch (err) {
                console.warn('Failed to fetch hero slides, using static content.', err);
                return STATIC_SLIDES;
            }
        },
        initialData: STATIC_SLIDES
    });

    const [current, setCurrent] = useState(0);

    // Autoplay
    useEffect(() => {
        if (!slides || slides.length === 0) return;
        const interval = setInterval(() => {
            setCurrent(curr => (curr + 1) % slides.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [slides]);

    const nextSlide = () => setCurrent(curr => (curr + 1) % slides.length);
    const prevSlide = () => setCurrent(curr => (curr === 0 ? slides.length - 1 : curr - 1));

    if (isLoading) return <div className="h-[85vh] bg-gray-900 animate-pulse" />;
    if (!slides || slides.length === 0) return null;

    return (
        <div className="relative h-[85vh] w-full overflow-hidden bg-gray-900 group">
            {slides.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === current ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                        }`}
                >
                    {/* Media: Video or Image */}
                    {slide.media_type === 'video' || slide.video_url ? (
                        <video
                            src={slide.video_url}
                            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-[10000ms] ease-linear ${index === current ? 'scale-110' : 'scale-100'}`}
                            autoPlay
                            muted
                            loop
                            playsInline
                        />
                    ) : (
                        <div
                            className={`absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] ease-linear ${index === current ? 'scale-110' : 'scale-100'}`}
                            style={{ backgroundImage: `url('${slide.image_url || slide.image}')` }}
                        />
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 h-[50%] bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                    {/* Content - Centered */}
                    <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 pointer-events-none">
                            <div className={`max-w-4xl mx-auto text-center transform transition-all duration-1000 delay-300 pointer-events-auto ${index === current ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                                <h3 className="text-primary font-bold tracking-[0.2em] uppercase mb-4 text-sm md:text-base">
                                    {slide.subtitle}
                                </h3>
                                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-tight drop-shadow-2xl">
                                    {slide.title}
                                </h1>
                                <p className="text-lg md:text-2xl text-gray-200 mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
                                    {slide.description}
                                </p>
                                <div className="pointer-events-auto relative z-50">
                                    <Button
                                        to={slide.cta_link || slide.link || '#'}
                                        className="py-4 px-10 text-sm uppercase tracking-widest relative z-50"
                                    >
                                        {slide.cta_text || slide.cta}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Navigation Arrows */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <ChevronLeft size={32} />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <ChevronRight size={32} />
            </button>

            {/* Indicators */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-3">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrent(index)}
                        className={`h-1.5 rounded-full transition-all duration-500 ${index === current ? 'w-12 bg-primary' : 'w-3 bg-white/50 hover:bg-white'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default HeroSlider;
