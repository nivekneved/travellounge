import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Home, MapPin, Star, ArrowLeft, CheckCircle, Wifi, Coffee, Utensils, Info, Heart } from 'lucide-react';
import Button from '../components/Button';

const guestHouses = [
    {
        id: 1,
        name: "Chez Alice Guest House",
        image: "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?q=80&w=1200&auto=format&fit=crop",
        location: "Port Mathurin",
        price: "3,200",
        rating: 4.8,
        amenities: ["Free WiFi", "Breakfast", "Garden", "Sea View"],
        rooms: 6,
        description: "A charming family-run guest house located in the heart of Port Mathurin. Alice and her family welcome you with warm Rodriguan hospitality and delicious home-cooked meals.",
        features: ["Central Location", "Walking distance to market", "Homemade Jams", "Bicycle Rental"],
        roomTypes: [
            { name: "Standard Room", description: "Cozy room with double bed and private bathroom.", price: "3,200" },
            { name: "Family Room", description: "Spacious room with one double and two single beds.", price: "5,500" }
        ]
    },
    {
        id: 2,
        name: "La Maison Creole",
        image: "https://images.unsplash.com/photo-1625244724120-1fd1d34d00f6?q=80&w=1200&auto=format&fit=crop",
        location: "Anse Aux Anglais",
        price: "2,800",
        rating: 4.7,
        amenities: ["Pool", "Restaurant", "Bike Rental", "Free Parking"],
        rooms: 8,
        description: "Experience authentic Creole architecture and lifestyle. La Maison Creole offers a peaceful retreat with a swimming pool and a restaurant serving local delicacies.",
        features: ["Swimming Pool", "Creole Cuisine", "Live Music on Weekends", "Tour Organization"],
        roomTypes: [
            { name: "Garden View Room", description: "Bright room opening onto the lush garden.", price: "2,800" },
            { name: "Pool View Suite", description: "Larger room with direct access to the pool.", price: "3,800" }
        ]
    },
    {
        id: 3,
        name: "Ocean View Lodge",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop",
        location: "Caverne Provert",
        price: "3,500",
        rating: 4.9,
        amenities: ["Beach Access", "BBQ Area", "Kitchenette", "WiFi"],
        rooms: 5,
        description: "Wake up to stunning views of the Indian Ocean. Ocean View Lodge is perfect for travelers seeking tranquility and direct access to the beach.",
        features: ["Panoramic Ocean Views", "Direct Beach Access", "Self-catering facilities", "Sunset Terrace"],
        roomTypes: [
            { name: "Sea View Studio", description: "Studio with kitchenette and balcony facing the sea.", price: "3,500" },
            { name: "Two-Bedroom Apartment", description: "Perfect for families or groups of friends.", price: "6,000" }
        ]
    },
    {
        id: 4,
        name: "Sunset Paradise",
        image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1200&auto=format&fit=crop",
        location: "Grand Baie",
        price: "3,000",
        rating: 4.6,
        amenities: ["Garden", "Free WiFi", "Breakfast", "Terrace"],
        rooms: 7,
        description: "As the name suggests, Sunset Paradise offers breathtaking sunset views. Located near hiking trails and beautiful beaches.",
        features: ["Hilltop Location", "Hiking Trails nearby", "Breakfast included", "Tranquil Garden"],
        roomTypes: [
            { name: "Standard Double", description: "Comfortable room for two.", price: "3,000" },
            { name: "Superior Room", description: "Larger room with private terrace.", price: "3,800" }
        ]
    },
    {
        id: 5,
        name: "Rodrigues Charm B&B",
        image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1200&auto=format&fit=crop",
        location: "Baie du Nord",
        price: "2,500",
        rating: 4.5,
        amenities: ["Local Cuisine", "Tours", "Fishing", "Free Parking"],
        rooms: 4,
        description: "Immerse yourself in the local way of life. Join the hosts for fishing trips or learn to cook traditional Rodriguan dishes.",
        features: ["Cultural Immersion", "Fishing Excursions", "Cooking Classes", "Quiet Location"],
        roomTypes: [
            { name: "Guest Room", description: "Simple and clean room with en-suite bathroom.", price: "2,500" }
        ]
    },
    {
        id: 6,
        name: "Island Retreat Guest House",
        image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=1200&auto=format&fit=crop",
        location: "Pointe Coton",
        price: "3,800",
        rating: 5.0,
        amenities: ["Private Beach", "Snorkeling", "WiFi", "Restaurant"],
        rooms: 6,
        description: "Located near the famous Pointe Coton beach, Island Retreat offers a secluded getaway with modern comforts and exceptional service.",
        features: ["Near Pointe Coton Beach", "Snorkeling Gear", "Seafood Restaurant", "Air Conditioning"],
        roomTypes: [
            { name: "Deluxe Room", description: "Modern room with king size bed.", price: "3,800" },
            { name: "Ocean Suite", description: "Luxurious suite with best views.", price: "4,800" }
        ]
    }
];

const RodriguesGuestHouseDetails = () => {
    const { id } = useParams();
    const guestHouse = guestHouses.find(gh => gh.id === parseInt(id)) || guestHouses[0];

    if (!guestHouse) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-32">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Guest House Not Found</h2>
                    <Link to="/rodrigues-guest-houses" className="text-primary hover:underline">← Back to Guest Houses</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pt-32 pb-20">
            {/* Header */}
            <div className="w-full px-4 md:px-8 mb-8">
                <Link to="/rodrigues-guest-houses" className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors mb-6">
                    <ArrowLeft size={20} />
                    <span>Back to Guest Houses</span>
                </Link>
            </div>

            {/* Hero Image */}
            <div className="relative h-[60vh] mb-12">
                <img
                    src={guestHouse.image}
                    alt={guestHouse.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 h-[50%] bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
                    <div className="w-full max-w-6xl mx-auto">
                        <div className="flex items-center gap-3 mb-4">
                            <Home size={32} className="text-primary" />
                            <div className="flex items-center gap-2">
                                <Star size={20} fill="currentColor" className="text-orange-500" />
                                <span className="font-bold text-xl">{guestHouse.rating}</span>
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-2">{guestHouse.name}</h1>
                        <div className="flex items-center gap-2 text-lg opacity-90">
                            <MapPin size={24} className="text-primary" />
                            <span>{guestHouse.location}</span>
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
                            <h2 className="text-3xl font-black mb-6">About</h2>
                            <p className="text-xl text-gray-700 leading-relaxed">{guestHouse.description}</p>
                        </div>

                        {/* Features */}
                        <div className="mb-12">
                            <h2 className="text-3xl font-black mb-6">Key Features</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {guestHouse.features?.map((item, index) => (
                                    <div key={index} className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
                                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                                        <span className="text-gray-700 font-medium">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Amenities */}
                        <div className="bg-gray-50 rounded-3xl p-8 mb-12">
                            <h2 className="text-3xl font-black mb-6">Amenities</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {guestHouse.amenities?.map((item, index) => (
                                    <div key={index} className="flex flex-col items-center text-center gap-2">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-primary">
                                            {index % 4 === 0 ? <Wifi size={24} /> :
                                                index % 4 === 1 ? <Coffee size={24} /> :
                                                    index % 4 === 2 ? <Utensils size={24} /> :
                                                        <CheckCircle size={24} />}
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Room Types */}
                        <div className="mb-12">
                            <h2 className="text-3xl font-black mb-6">Room Types</h2>
                            <div className="space-y-4">
                                {guestHouse.roomTypes?.map((room, index) => (
                                    <div key={index} className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div>
                                                <h3 className="text-xl font-bold mb-1">{room.name}</h3>
                                                <p className="text-gray-600">{room.description}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-black text-primary">Rs {room.price}</p>
                                                <span className="text-xs text-gray-500">per night</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Booking Sidebar */}
                    <div>
                        <div className="bg-white border-2 border-gray-200 rounded-3xl p-8 sticky top-32">
                            <div className="text-center mb-6">
                                <span className="text-gray-500 text-sm">Rooms from</span>
                                <div className="text-5xl font-black text-gray-900">Rs {guestHouse.price}</div>
                                <span className="text-gray-500">per night</span>
                            </div>

                            <Button
                                to="/contact"
                                className="w-full py-4 mb-4"
                            >
                                Book Stay
                            </Button>

                            <Button
                                variant="secondary"
                                className="w-full py-4 border-2"
                            >
                                <Heart size={20} />
                                Add to Wishlist
                            </Button>

                            <div className="mt-8 pt-8 border-t border-gray-200">
                                <div className="flex items-start gap-3">
                                    <Info className="text-primary flex-shrink-0 mt-1" size={20} />
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 mb-1">Authentic Experience</p>
                                        <p className="text-xs text-gray-600">
                                            By booking this guest house, you support the local economy and enjoy a true cultural exchange.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RodriguesGuestHouseDetails;
