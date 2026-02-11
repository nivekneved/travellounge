import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Activity, Clock, MapPin, Users, Camera, Star, ArrowLeft, Heart, CheckCircle, Info } from 'lucide-react';
import Button from '../components/Button';

// Import the same data from Activities page
const activities = [
    {
        id: 1,
        name: "Catamaran Cruise to Ile aux Cerfs",
        image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1200&auto=format&fit=crop",
        duration: "Full Day (8 hours)",
        price: "3,500",
        category: "Water Activities",
        description: "Sail through the crystal clear waters of the East Coast lagoon on a spacious catamaran. Enjoy a BBQ lunch on board, unlimited drinks, and leisure time on the famous Ile aux Cerfs island.",
        highlights: [
            "Visit Grand River South East Waterfall",
            "Snorkeling stop in crystal clear lagoon",
            "BBQ Lunch (Chicken, Fish, Salad) included",
            "Unlimited Drinks (Beer, Rum, Soft drinks)",
            "Free time on Ile aux Cerfs beach"
        ],
        includes: ["Lunch", "Snorkeling Gear", "Drinks", "Boat Transfer"],
        whatToBring: ["Swimsuit", "Towel", "Sunscreen", "Camera", "Sunglasses"]
    },
    {
        id: 2,
        name: "Undersea Walk",
        image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=1200&auto=format&fit=crop",
        duration: "3 Hours (Total)",
        price: "4,000",
        category: "Water Activities",
        description: "Walk on the ocean floor and feed fish by hand! This unique experience allows you to walk underwater with a helmet that supplies air, keeping your head dry. No swimming skills required.",
        highlights: [
            "Safe and easy underwater activity",
            "Feed fish in their natural habitat",
            "Platform boat transfer included",
            "Qualified guides and divers"
        ],
        includes: ["Equipment", "Safety briefing", "Boat transfer", "CD with photos (optional extra)"],
        whatToBring: ["Swimsuit", "Towel", "Change of clothes"]
    },
    // Add other activities...
    {
        id: 3,
        name: "Dolphin Watching & Swimming",
        image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=1200&auto=format&fit=crop",
        duration: "Half Day (07:30 - 12:00)",
        price: "3,000",
        category: "Wildlife",
        description: "An early morning adventure to see wild dolphins in their natural environment. Watch them play and jump, and if conditions allow, swim near these majestic creatures.",
        highlights: [
            "Speedboat trip on the West Coast",
            "Encounter Spinner and Bottlenose dolphins",
            "Snorkeling stop at the 'Aquarium'",
            "View of Crystal Rock and Le Morne mountain"
        ],
        includes: ["Speedboat", "Snorkeling gear", "Light breakfast", "Soft drinks"],
        whatToBring: ["Swimsuit", "Towel", "Sunscreen", "Snorkeling gear (optional)"]
    }
];

const ActivityDetails = () => {
    const { id } = useParams();

    // Fallback to first if not found
    const activity = activities.find(a => a.id === parseInt(id)) || activities[0];

    if (!activity) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-32">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Activity Not Found</h2>
                    <Link to="/activities" className="text-primary hover:underline">← Back to Activities</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pt-32 pb-20">
            {/* Header */}
            <div className="w-full px-4 md:px-8 mb-8">
                <Link to="/activities" className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors mb-6">
                    <ArrowLeft size={20} />
                    <span>Back to Activities</span>
                </Link>
            </div>

            {/* Hero Image */}
            <div className="relative h-[60vh] mb-12">
                <img
                    src={activity.image}
                    alt={activity.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
                    <div className="w-full max-w-6xl mx-auto">
                        <div className="flex items-center gap-3 mb-4">
                            <Activity size={32} className="text-primary" />
                            <div className="bg-primary/90 px-3 py-1 rounded-full text-sm font-bold">
                                {activity.category}
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4">{activity.name}</h1>
                        <div className="flex items-center gap-2 text-xl">
                            <Clock size={24} />
                            <span>{activity.duration}</span>
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
                            <h2 className="text-3xl font-black mb-6">About this Activity</h2>
                            <p className="text-xl text-gray-700 leading-relaxed">{activity.description}</p>
                        </div>

                        {/* Highlights */}
                        <div className="mb-12">
                            <h2 className="text-3xl font-black mb-6">Highlights</h2>
                            <ul className="space-y-4">
                                {activity.highlights?.map((item, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <Star className="text-orange-500 flex-shrink-0 mt-1" size={20} fill="currentColor" />
                                        <span className="text-gray-700 text-lg">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* What to Bring */}
                        {activity.whatToBring && (
                            <div className="mb-12">
                                <h2 className="text-3xl font-black mb-6">What to Bring</h2>
                                <div className="flex flex-wrap gap-3">
                                    {activity.whatToBring.map((item, index) => (
                                        <span key={index} className="bg-gray-100 px-4 py-2 rounded-full text-gray-700 font-medium">
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Included */}
                        <div className="bg-gray-50 rounded-3xl p-8">
                            <h2 className="text-3xl font-black mb-6">Inclusions</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {activity.includes.map((item, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                                        <span className="text-gray-700">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Booking Sidebar */}
                    <div>
                        <div className="bg-white border-2 border-gray-200 rounded-3xl p-8 sticky top-32">
                            <div className="text-center mb-6">
                                <span className="text-gray-500 text-sm">Prices start from</span>
                                <div className="text-5xl font-black text-gray-900">Rs {activity.price}</div>
                                <span className="text-gray-500">per person</span>
                            </div>

                            <Button
                                to="/contact"
                                className="w-full py-4 mb-4"
                            >
                                Book Activity
                            </Button>

                            <Button
                                variant="secondary"
                                className="w-full py-4 border-2"
                            >
                                <Heart size={20} />
                                Add to Wishlist
                            </Button>

                            <div className="mt-8 pt-8 border-t border-gray-200">
                                <h3 className="font-bold text-gray-900 mb-2">Private Transfer</h3>
                                <p className="text-gray-600 text-sm mb-4">
                                    Need a ride? We can arrange private transfers from your hotel.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActivityDetails;
