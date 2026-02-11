import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Bed, Calendar, Star, ArrowLeft, CheckCircle, Wifi, Utensils, Waves, Heart } from 'lucide-react';

const hotelStays = [
    {
        id: 1,
        name: "Weekend Getaway",
        hotel: "Beachcomber Resort",
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1200&auto=format&fit=crop",
        nights: "2 Nights",
        price: "15,000",
        rating: 4.9,
        includes: ["Breakfast", "WiFi", "Pool Access", "Beach"],
        description: "Escape the routine with a relaxing weekend at Beachcomber Resort. Enjoy stunning sunsets, refreshing cocktails by the pool, and pristine beaches.",
        features: ["Beachfront", "Spa", "Water Sports", "Kids Club"]
    },
    {
        id: 2,
        name: "Romantic Escape",
        hotel: "LUX* Belle Mare",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop",
        nights: "3 Nights",
        price: "45,000",
        rating: 5.0,
        includes: ["Half Board", "Spa Discount", "Sunset Cruise", "WiFi"],
        description: "Rekindle the romance at LUX* Belle Mare. This package includes a romantic sunset cruise, a couple's spa treatment discount, and delicious candlelit dinners.",
        features: ["Adults Only Wing", "Private Pool", "Gourmet Dining", "Romantic Setup"]
    },
    {
        id: 3,
        name: "Family Holiday Package",
        hotel: "Sugar Beach Resort",
        image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1200&auto=format&fit=crop",
        nights: "5 Nights",
        price: "75,000",
        rating: 4.8,
        includes: ["All Meals", "Kids Club", "Activities", "WiFi"],
        description: "Fun for the whole family at Sugar Beach Resort. With a dedicated kids club, daily activities, and family-friendly accommodation, everyone will have a blast.",
        features: ["Family Suites", "Water Park", "Babysitting", "Live Entertainment"]
    },
    {
        id: 4,
        name: "Luxury Week",
        hotel: "Shangri-La Le Touessrok",
        image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200&auto=format&fit=crop",
        nights: "7 Nights",
        price: "145,000",
        rating: 5.0,
        includes: ["All Inclusive", "Golf", "Spa", "Private Island"],
        description: "Experience ultimate luxury at Shangri-La Le Touessrok. Play golf on a championship course, relax on a private island, and indulge in world-class spa treatments.",
        features: ["Private Island Access", "Butler Service", "Championship Golf", "Michelin-star Dining"]
    }
];

const HotelStayDetails = () => {
    const { id } = useParams();
    const stay = hotelStays.find(s => s.id === parseInt(id)) || hotelStays[0];

    if (!stay) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-32">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Package Not Found</h2>
                    <Link to="/hotel-stays" className="text-primary hover:underline">← Back to Hotel Stays</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pt-32 pb-20">
            {/* Header */}
            <div className="w-full px-4 md:px-8 mb-8">
                <Link to="/hotel-stays" className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors mb-6">
                    <ArrowLeft size={20} />
                    <span>Back to Hotel Stays</span>
                </Link>
            </div>

            {/* Hero Image */}
            <div className="relative h-[60vh] mb-12">
                <img
                    src={stay.image}
                    alt={stay.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 h-[50%] bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
                    <div className="w-full max-w-6xl mx-auto">
                        <div className="flex items-center gap-3 mb-4">
                            <Bed size={32} className="text-primary" />
                            <div className="flex items-center gap-2">
                                <Star size={20} fill="currentColor" className="text-orange-500" />
                                <span className="font-bold text-xl">{stay.rating}</span>
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-2">{stay.name}</h1>
                        <div className="flex items-center gap-4 mt-4">
                            <h2 className="text-2xl font-bold text-white/90">{stay.hotel}</h2>
                            <div className="flex items-center gap-2 text-lg bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full">
                                <Calendar size={20} />
                                <span>{stay.nights}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="w-full px-4 md:px-8">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* Description */}
                        <div className="mb-12">
                            <h2 className="text-3xl font-black mb-6">About the Package</h2>
                            <p className="text-xl text-gray-700 leading-relaxed">{stay.description}</p>
                        </div>

                        {/* Features */}
                        <div className="mb-12">
                            <h2 className="text-3xl font-black mb-6">Resort Highlights</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {stay.features?.map((item, index) => (
                                    <div key={index} className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
                                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                                        <span className="text-gray-700 font-medium">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Inclusions */}
                        <div className="bg-gray-50 rounded-3xl p-8 mb-8">
                            <h2 className="text-3xl font-black mb-6">Package Inclusions</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {stay.includes?.map((item, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                                        <span className="text-gray-700 text-lg">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Booking Sidebar */}
                    <div>
                        <div className="bg-white border-2 border-gray-200 rounded-3xl p-8 sticky top-32">
                            <div className="text-center mb-6">
                                <span className="text-gray-500 text-sm">Total Package Price</span>
                                <div className="text-5xl font-black text-gray-900">Rs {stay.price}</div>
                                <span className="text-gray-500">for 2 adults</span>
                            </div>

                            <Link
                                to="/contact"
                                className="block w-full bg-primary text-white text-center font-bold py-4 px-8 rounded-full hover:bg-red-700 transition-all hover:scale-105 mb-4"
                            >
                                Book Now
                            </Link>

                            <button className="w-full border-2 border-primary text-primary font-bold py-4 px-8 rounded-full hover:bg-primary/5 transition-all flex items-center justify-center gap-2">
                                <Heart size={20} />
                                Add to Wishlist
                            </button>

                            <div className="mt-8 pt-8 border-t border-gray-200">
                                <h3 className="font-bold text-gray-900 mb-4">Package Terms</h3>
                                <ul className="space-y-3 text-sm text-gray-600">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle size={16} className="text-primary" />
                                        <span>Valid for residents & non-residents</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle size={16} className="text-primary" />
                                        <span>Subject to availability</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle size={16} className="text-primary" />
                                        <span>Free cancellation up to 7 days</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HotelStayDetails;
