import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';
import { MapPin, Star, Calendar, Users, Heart, Share2, ArrowLeft, Wifi, Tv, Coffee, Wind, Utensils, Waves, Car, Dumbbell, Trees, Activity, X } from 'lucide-react';
import Button from '../components/Button';
import Breadcrumb from '../components/Breadcrumb';
import { useWishlist } from '../context/WishlistContext';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const AMENITY_ICONS = {
    'wifi': Wifi,
    'free-wifi': Wifi,
    'tv': Tv,
    'breakfast': Coffee,
    'ac': Wind,
    'air-conditioning': Wind,
    'restaurant': Utensils,
    'pool': Waves,
    'swimming-pool': Waves,
    'parking': Car,
    'gym': Dumbbell,
    'garden': Trees,
    'spa': Activity,
    'beach': Trees, // Standardizing to something generic if not found
};

const ServiceDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isInWishlist, toggleWishlist } = useWishlist();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [selectedDate, setSelectedDate] = useState('');
    const [guestCount, setGuestCount] = useState(1);

    // Fetch product from API
    const { data: product, isLoading, error } = useQuery({
        queryKey: ['service', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('services')
                .select('*, hotel_rooms(*)')
                .eq('id', id)
                .single();

            if (error) throw error;

            // Map keys if necessary, but ProductDetails uses standard keys mostly.
            // Ensure _id is present for WishlistContext if it relies on it.
            return { ...data, _id: data.id };
        }
    });

    const isWishlisted = isInWishlist(product?._id);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-2xl font-medium text-gray-500">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-2xl font-medium text-red-500">Error loading product</div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-2xl font-medium text-gray-500">Product not found</div>
            </div>
        );
    }

    const {
        name,
        description,
        images = [],
        location,
        category,
        pricing,
        features = [],
        inclusions = [],
        exclusions = [],
        highlights = [],
        itinerary = []
    } = product;

    const handleBooking = () => {
        const params = new URLSearchParams({
            serviceName: product.name,
            serviceId: product.id,
            price: (product.pricing?.price || 0).toString(),
            image: product.images?.[0] || ''
        });
        navigate(`/booking?${params.toString()}`);
    };

    const handleShare = async () => {
        const shareData = {
            title: name,
            text: description,
            url: window.location.href,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.href);
                toast.success('Link copied to clipboard!');
            }
        } catch (err) {
            console.error('Error sharing:', err);
            // Don't show error if user cancelled
            if (err.name !== 'AbortError') {
                toast.error('Failed to share');
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Breadcrumb with Actions */}
            <Breadcrumb
                actions={
                    <>
                        <button
                            onClick={() => toggleWishlist(product)}
                            className={`p-2.5 rounded-full transition-all duration-300 ${isWishlisted ? 'bg-primary text-white shadow-lg' : 'bg-white text-gray-600 hover:text-primary border border-gray-100 shadow-sm'}`}
                        >
                            <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
                        </button>
                        <button
                            onClick={handleShare}
                            className="p-2.5 rounded-full bg-white text-gray-600 hover:text-primary border border-gray-100 shadow-sm transition-all duration-300"
                        >
                            <Share2 size={18} />
                        </button>
                    </>
                }
            />

            {/* Back Button - Arrow Removed */}
            <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 mb-4">
                <Link to="/" className="text-sm font-bold text-gray-500 hover:text-primary transition-colors uppercase tracking-wider">
                    Back to search
                </Link>
            </div>

            {/* Main Content */}
            <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Gallery Section */}
                    <div className="lg:col-span-2">
                        <div className="relative bg-white rounded-3xl overflow-hidden shadow-md">
                            <img
                                src={images[currentImageIndex] || '/placeholder-image.jpg'}
                                alt={name}
                                className="w-full h-96 object-cover"
                            />

                            {/* Thumbnails */}
                            <div className="absolute bottom-4 left-0 right-0 p-4 flex justify-center gap-2">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentImageIndex(idx)}
                                        className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${currentImageIndex === idx ? 'border-white' : 'border-transparent'}`}
                                    >
                                        <img src={img} alt={`${name}-${idx}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Details Section */}
                        <div className="mt-8 bg-white rounded-3xl p-6 shadow-md">
                            <div className="flex flex-wrap items-center gap-4 mb-4">
                                <h1 className="text-3xl font-bold text-gray-900">{name}</h1>
                                <div className="flex items-center gap-1 ml-auto text-orange-500">
                                    <Star size={20} fill="currentColor" />
                                    <span className="font-semibold">4.8</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-gray-600 mb-6">
                                <MapPin size={18} />
                                <span>{location}</span>
                            </div>

                            <p className="text-gray-700 leading-relaxed mb-8">{description}</p>

                            {/* Highlights Section */}
                            {highlights && highlights.length > 0 && (
                                <div className="mb-10 bg-gray-50/50 p-8 rounded-[32px] border border-gray-100">
                                    <h3 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-tight flex items-center gap-3 italic">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                            <Zap size={18} fill="currentColor" />
                                        </div>
                                        Key <span className="text-primary">Highlights</span>
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {highlights.map((high, idx) => (
                                            <div key={idx} className="flex items-center gap-3 text-gray-700 bg-white p-4 rounded-2xl shadow-sm border border-gray-50">
                                                <div className="w-2 h-2 rounded-full bg-primary" />
                                                <span className="font-bold text-sm tracking-tight">{high}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Features */}
                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Features</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {features.map((feature, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-gray-700">
                                            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                <Star size={12} fill="currentColor" />
                                            </div>
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Inclusions/Exclusions */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-3">What's Included</h3>
                                    <ul className="space-y-2">
                                        {inclusions.map((item, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-gray-700">
                                                <span className="text-green-500">✓</span>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-3">What's Not Included</h3>
                                    <ul className="space-y-2">
                                        {exclusions.map((item, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-gray-700">
                                                <span className="text-red-500">✕</span>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Itinerary Vertical Timeline */}
                            {itinerary && itinerary.length > 0 && (
                                <div className="mb-8 border-t border-gray-100 pt-8">
                                    <h3 className="text-xl font-black text-gray-900 mb-8 uppercase tracking-tight flex items-center gap-3 italic">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                            <Calendar size={18} />
                                        </div>
                                        Daily <span className="text-primary">Itinerary</span>
                                    </h3>
                                    <div className="relative pl-8 space-y-12 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-primary before:to-gray-100">
                                        {itinerary.map((day, index) => (
                                            <div key={index} className="relative">
                                                {/* Timeline Marker */}
                                                <div className="absolute -left-[31px] top-0 w-8 h-8 bg-white border-4 border-primary rounded-full z-10 shadow-sm flex items-center justify-center">
                                                    <span className="text-[10px] font-black text-primary">{day.day}</span>
                                                </div>

                                                <div className="bg-white group">
                                                    <h4 className="text-xl font-black text-gray-900 mb-2 italic group-hover:text-primary transition-colors">
                                                        {day.title}
                                                    </h4>
                                                    <p className="text-gray-500 text-sm leading-relaxed font-medium">
                                                        {day.description}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Booking Sidebar */}
                    <div>
                        <div className="bg-white rounded-3xl p-6 shadow-md sticky top-24">
                            <div className="flex items-baseline gap-2 mb-4">
                                <span className="text-3xl font-bold text-gray-900">
                                    Rs {(pricing?.price || 0).toLocaleString()}
                                </span>
                                {pricing?.originalPrice && (
                                    <span className="text-lg text-gray-500 line-through">
                                        Rs {pricing.originalPrice.toLocaleString()}
                                    </span>
                                )}
                                <span className="ml-auto text-gray-500">per person</span>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-gray-700 mb-2">Select Date</label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            value={selectedDate}
                                            onChange={(e) => setSelectedDate(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-xl pl-10 focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />
                                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-700 mb-2">Number of Guests</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="1"
                                            max="20"
                                            value={guestCount}
                                            onChange={(e) => setGuestCount(parseInt(e.target.value))}
                                            className="w-full p-3 border border-gray-300 rounded-xl pl-10 focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />
                                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    </div>
                                </div>
                            </div>

                            <Button
                                variant="primary"
                                size="lg"
                                className="w-full mb-4"
                                onClick={handleBooking}
                            >
                                Book Now
                            </Button>

                            <div className="pt-4 border-t border-gray-200">
                                <h3 className="font-bold text-gray-900 mb-2">Need Help?</h3>
                                <p className="text-gray-600 text-sm">
                                    Our support team is available 24/7 to assist you with your booking.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default ServiceDetails;
