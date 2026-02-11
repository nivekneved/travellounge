import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';
import { MapPin, Star, Calendar, Users, Camera, Heart, Share2, ArrowLeft, Wifi, Tv, Coffee, Wind, Utensils, Waves, Car, Dumbbell, Trees, Activity, X } from 'lucide-react';
import Button from '../components/Button';
import { useWishlist } from '../context/WishlistContext';
import { Link } from 'react-router-dom';
import BookingForm from '../components/BookingForm';

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

const ProductDetails = () => {
    const { id } = useParams();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [selectedDate, setSelectedDate] = useState('');
    const [guestCount, setGuestCount] = useState(1);
    const [showBookingForm, setShowBookingForm] = useState(false);

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
        included = [],
        excluded = []
    } = product;

    const handleBooking = () => {
        setShowBookingForm(true);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors">
                        <ArrowLeft size={20} />
                        <span>Back to search</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => toggleWishlist(product)}
                            className={`p-3 rounded-full ${isWishlisted ? 'bg-primary text-white' : 'bg-white text-gray-700'} shadow-md`}
                        >
                            <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
                        </button>
                        <button className="p-3 rounded-full bg-white text-gray-700 shadow-md">
                            <Share2 size={20} />
                        </button>
                    </div>
                </div>
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

                            {/* Features */}
                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Features</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {features.map((feature, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-gray-700">
                                            <Camera size={18} />
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
                                        {included.map((item, idx) => (
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
                                        {excluded.map((item, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-gray-700">
                                                <span className="text-red-500">✕</span>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
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

            {/* Booking Form Modal */}
            {showBookingForm && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl">
                        <button
                            onClick={() => setShowBookingForm(false)}
                            className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-all z-10"
                            aria-label="Close booking form"
                        >
                            <X size={24} />
                        </button>
                        <div className="p-8">
                            <BookingForm
                                serviceId={product._id}
                                productName={product.name}
                                initialCheckIn={selectedDate}
                                initialCheckOut={selectedDate}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetails;
