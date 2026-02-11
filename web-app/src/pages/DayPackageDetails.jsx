import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Sun, Clock, MapPin, Beer, Utensils, Waves, Star, ArrowLeft, Heart, CheckCircle, Car, AlertCircle } from 'lucide-react';
import Button from '../components/Button';

// Import the same data from HotelDayPackages page
const dayPackages = [
    {
        id: 1,
        name: "Beachcomber Spa & Pool Day",
        hotel: "Beachcomber Resort",
        image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1200&auto=format&fit=crop",
        time: "9 AM - 6 PM",
        price: "3,500",
        rating: 4.9,
        includes: ["Pool Access", "Beach Access", "Lunch", "Spa Credit"],
        description: "Treat yourself to a day of pure relaxation at the prestigious Beachcomber Resort. Lounge by the infinity pool, enjoy a gourmet lunch with ocean views, and pamper yourself with a spa treatment.",
        schedule: [
            { time: "09:00", activity: "Arrival & Welcome Drink" },
            { time: "09:30", activity: "Access to Pool & Beach Facilities" },
            { time: "12:30", activity: "A la Carte Lunch at The Blue Marlin" },
            { time: "14:00", activity: "45-min Massage at The Spa" },
            { time: "16:00", activity: "Afternoon Tea & Pancakes" },
            { time: "18:00", activity: "Departure" }
        ],
        highlights: [
            "Access to main swimming pool and beach",
            "3-course lunch included (drinks excluded)",
            "Use of spa facilities (sauna, hammam)",
            "Complimentary water activities (kayaking, pedal boat)",
            "Kids club access included"
        ]
    },
    {
        id: 2,
        name: "Tropical Paradise Day Pass",
        hotel: "Paradise Cove",
        image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=1200&auto=format&fit=crop",
        time: "10 AM - 7 PM",
        price: "4,000",
        rating: 4.8,
        includes: ["All Facilities", "Buffet Lunch", "Drinks", "Towels"],
        description: "Experience the adults-only serenity of Paradise Cove. This all-inclusive day pass gives you access to the 'you & me' moments that make this hotel unique.",
        schedule: [
            { time: "10:00", activity: "Check-in & Welcome Cocktail" },
            { time: "10:30", activity: "Leisure time at the Peninsula infinity pool" },
            { time: "12:30", activity: "Buffet Lunch at The Dining Room" },
            { time: "15:00", activity: "Snorkeling or Glass Bottom Boat Trip" },
            { time: "17:00", activity: "Sunset Cocktails at The Rum Gallery" },
            { time: "19:00", activity: "Departure" }
        ],
        highlights: [
            "Adults-only peaceful environment",
            "Unlimited locally bottled drinks",
            "Buffet lunch",
            "Afternoon tea/coffee and pancakes",
            "Free Wi-Fi in public areas"
        ]
    },
    {
        id: 3,
        name: "Luxury Beach Club Experience",
        hotel: "LUX* Grand Gaube",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop",
        time: "9 AM - 6 PM",
        price: "4,500",
        rating: 5.0,
        includes: ["Private Cabana", "Lunch & Drinks", "Water Sports", "Spa Discount"],
        description: "A retro-chic tropical retreat. Spend the day at LUX* Grand Gaube enjoying the Beach Club vibe, exceptional dining, and world-class service.",
        schedule: [
            { time: "09:00", activity: "Welcome at Beach Rouge" },
            { time: "10:00", activity: "Private Cabana setup" },
            { time: "12:30", activity: "Lunch at Beach Rouge (Credit of Rs 1500)" },
            { time: "15:00", activity: "Ice Cream from ICI Parlour" },
            { time: "18:00", activity: "End of Day Package" }
        ],
        highlights: [
            "Access to Beach Rouge & pools",
            "Food & Beverage credit included",
            "ICI Ice Cream tasting",
            "Discount at LUX* Me Spa",
            "Towel service"
        ]
    }
];

const DayPackageDetails = () => {
    const { id } = useParams();

    const pkg = dayPackages.find(p => p.id === parseInt(id)) || dayPackages[0];

    if (!pkg) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-32">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Package Not Found</h2>
                    <Link to="/day-packages" className="text-primary hover:underline">← Back to Day Packages</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pt-32 pb-20">
            {/* Header */}
            <div className="w-full px-4 md:px-8 mb-8">
                <Link to="/day-packages" className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors mb-6">
                    <ArrowLeft size={20} />
                    <span>Back to Day Packages</span>
                </Link>
            </div>

            {/* Hero Image */}
            <div className="relative h-[60vh] mb-12">
                <img
                    src={pkg.image}
                    alt={pkg.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
                    <div className="w-full max-w-6xl mx-auto">
                        <div className="flex items-center gap-3 mb-4">
                            <Sun size={32} className="text-primary" />
                            <div className="flex items-center gap-2">
                                <Star size={20} fill="currentColor" className="text-orange-500" />
                                <span className="font-bold text-xl">{pkg.rating}</span>
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-2">{pkg.name}</h1>
                        <p className="text-2xl opacity-90 mb-4">{pkg.hotel}</p>
                        <div className="flex items-center gap-2 text-lg bg-black/30 backdrop-blur-sm inline-block px-4 py-2 rounded-full">
                            <Clock size={20} />
                            <span>{pkg.time}</span>
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
                            <h2 className="text-3xl font-black mb-6">Experience Overview</h2>
                            <p className="text-xl text-gray-700 leading-relaxed">{pkg.description}</p>
                        </div>

                        {/* Schedule */}
                        <div className="mb-12">
                            <h2 className="text-3xl font-black mb-8">Typical Schedule</h2>
                            <div className="space-y-4">
                                {pkg.schedule?.map((item, index) => (
                                    <div key={index} className="flex items-center gap-6 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                                        <div className="w-20 text-right font-bold text-primary text-lg">
                                            {item.time}
                                        </div>
                                        <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                                        <div className="text-gray-800 font-medium text-lg">
                                            {item.activity}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Highlights & Inclusions */}
                        <div className="bg-gray-50 rounded-3xl p-8">
                            <h2 className="text-3xl font-black mb-6">Package Highlights</h2>
                            <ul className="space-y-4">
                                {pkg.highlights?.map((item, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <CheckCircle className="text-green-500 flex-shrink-0 mt-1" size={20} />
                                        <span className="text-gray-700 text-lg">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Important Info */}
                        <div className="mt-8 p-6 border-l-4 border-yellow-400 bg-yellow-50 rounded-r-xl">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="text-yellow-600 flex-shrink-0" size={24} />
                                <div>
                                    <h4 className="font-bold text-yellow-800 mb-2">Important Information</h4>
                                    <p className="text-yellow-700">Valid ID card or passport required upon check-in. The hotel reserves the right to refuse access if the dress code is not respected (Smart casual for lunch).</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Booking Sidebar */}
                    <div>
                        <div className="bg-white border-2 border-gray-200 rounded-3xl p-8 sticky top-32">
                            <div className="text-center mb-6">
                                <span className="text-gray-500 text-sm">Packages from</span>
                                <div className="text-5xl font-black text-gray-900">Rs {pkg.price}</div>
                                <span className="text-gray-500">per person</span>
                            </div>

                            <Button
                                to="/contact"
                                className="w-full py-4 mb-4"
                            >
                                Book Now
                            </Button>

                            <Button
                                variant="secondary"
                                className="w-full py-4 border-2"
                            >
                                <Heart size={20} />
                                Add to Wishlist
                            </Button>

                            <div className="mt-8 pt-8 border-t border-gray-200">
                                <h3 className="font-bold text-gray-900 mb-4">Need Help?</h3>
                                <p className="text-gray-600 text-sm mb-4">
                                    Not sure which package to choose? We can help!
                                </p>
                                <Link
                                    to="/contact"
                                    className="text-primary hover:underline font-semibold"
                                >
                                    Contact Support →
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DayPackageDetails;
