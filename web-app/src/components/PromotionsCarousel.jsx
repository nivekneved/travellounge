import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ServiceCard from './ServiceCard';

const PromotionsCarousel = () => {
    const { data: promotions, isLoading } = useQuery({
        queryKey: ['promotions', 'active'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('promotions')
                .select('*')
                .eq('is_active', true)
                .gte('valid_until', new Date().toISOString())
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        }
    });

    const scrollRef = useRef(null);

    // Fallback deals if no promotions from backend
    const displayPromotions = promotions && promotions.length > 0 ? promotions : [
        {
            id: 'placeholder-1',
            title: 'Early Bird Special',
            description: 'Book your summer holiday now and save 25% on selected resorts.',
            image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=800&auto=format&fit=crop',
            link: '/search?category=hotels',
            discount: '25% OFF',
            price: 15000,
            originalPrice: 20000,
            valid_until: new Date(Date.now() + 86400000 * 5).toISOString()
        },
        {
            id: 'placeholder-2',
            title: 'Honeymoon Packages',
            description: 'Romantic getaways tailored just for two. Champagne, sunset dinners, and more.',
            image: 'https://images.unsplash.com/photo-1515238152791-8216bfdf89a7?q=80&w=800&auto=format&fit=crop',
            link: '/search?category=packages',
            discount: 'Special Rate',
            price: 25000,
            originalPrice: 32000,
            valid_until: new Date(Date.now() + 86400000 * 10).toISOString()
        },
        {
            id: 'placeholder-3',
            title: 'Adventure Escapes',
            description: 'Thrilling water sports and island exploration packages.',
            image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800&auto=format&fit=crop',
            link: '/search?category=excursions',
            discount: '30% OFF',
            price: 3500,
            originalPrice: 5000,
            valid_until: new Date(Date.now() + 86400000 * 7).toISOString()
        },
        {
            id: 'placeholder-4',
            title: 'Luxury Cruises',
            description: 'Set sail on unforgettable journeys across pristine waters.',
            image: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?q=80&w=800&auto=format&fit=crop',
            link: '/search?category=cruises',
            discount: 'Limited',
            price: 45000,
            originalPrice: 55000,
            valid_until: new Date(Date.now() + 86400000 * 3).toISOString()
        },
        {
            id: 'placeholder-5',
            title: 'Family Getaways',
            description: 'Create lasting memories with special family packages and activities.',
            image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=800&auto=format&fit=crop',
            link: '/search?category=hotels',
            discount: '20% OFF',
            price: 18000,
            originalPrice: 22500,
            valid_until: new Date(Date.now() + 86400000 * 6).toISOString()
        },
        {
            id: 'placeholder-6',
            title: 'Spa & Wellness',
            description: 'Rejuvenate your body and soul with premium spa treatments.',
            image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800&auto=format&fit=crop',
            link: '/search?category=wellness',
            discount: '35% OFF',
            price: 4500,
            originalPrice: 6900,
            valid_until: new Date(Date.now() + 86400000 * 4).toISOString()
        },
        {
            id: 'placeholder-7',
            title: 'Golf Holidays',
            description: 'Play on world-class courses with stunning ocean views.',
            image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=800&auto=format&fit=crop',
            link: '/search?category=sports',
            discount: 'Best Price',
            price: 8000,
            originalPrice: 9500,
            valid_until: new Date(Date.now() + 86400000 * 8).toISOString()
        },
        {
            id: 'placeholder-8',
            title: 'Diving Expeditions',
            description: 'Explore vibrant coral reefs and underwater wonders.',
            image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800&auto=format&fit=crop',
            link: '/search?category=activities',
            discount: '40% OFF',
            price: 2800,
            originalPrice: 4600,
            valid_until: new Date(Date.now() + 86400000 * 9).toISOString()
        }
    ];

    const [isPaused, setIsPaused] = useState(false);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = direction === 'left' ? -400 : 400;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        if (!isPaused) {
            const interval = setInterval(() => {
                if (scrollRef.current) {
                    const { current } = scrollRef;
                    const maxScrollLeft = current.scrollWidth - current.clientWidth;

                    if (current.scrollLeft >= maxScrollLeft) {
                        current.scrollTo({ left: 0, behavior: 'smooth' });
                    } else {
                        scroll('right');
                    }
                }
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [isPaused]);

    if (isLoading) return <div className="h-96 bg-gray-100 animate-pulse" />;

    return (
        <section className="py-20 bg-white">
            <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8">
                {/* ... (keep header) */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight">
                        Seasonal <span className="text-primary">Deals</span>
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">
                        Limited-time offers on premium travel experiences
                    </p>
                </div>

                <div className="relative group">
                    {/* ... (keep nav buttons) */}
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white p-3 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <ChevronLeft size={24} className="text-gray-900" />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white p-3 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <ChevronRight size={24} className="text-gray-900" />
                    </button>

                    {/* Deals Slider */}
                    <div
                        ref={scrollRef}
                        className="flex gap-8 overflow-x-auto scrollbar-hide scroll-smooth pb-12 pt-4 px-4"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        onMouseEnter={() => setIsPaused(true)}
                        onMouseLeave={() => setIsPaused(false)}
                    >
                        {displayPromotions.map((promo) => (
                            <div key={promo.id} className="flex-shrink-0 w-80 md:w-96 h-[400px]">
                                <ServiceCard
                                    product={{
                                        _id: promo.id,
                                        name: promo.title,
                                        images: [promo.image],
                                        category: 'Seasonal Deal',
                                        location: 'Mauritius',
                                        rating: 4.9,
                                        // Updated to pass price correctly to ServiceCard
                                        pricing: {
                                            price: promo.price || 0,
                                            originalPrice: promo.originalPrice
                                        }
                                    }}
                                    customLink={promo.link}
                                    discountBadge={promo.discount}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PromotionsCarousel;
