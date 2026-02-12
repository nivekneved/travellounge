import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plane, Calendar, MapPin, Star, ArrowLeft, CheckCircle, AlertCircle, Heart } from 'lucide-react';
import Button from '../components/Button';

const destinations = [
    {
        id: 1,
        name: "Dubai Luxury Package",
        image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200&auto=format&fit=crop",
        duration: "5 Days / 4 Nights",
        price: "85,000",
        rating: 4.9,
        includes: ["Flights", "5-Star Hotel", "City Tour", "Desert Safari"],
        description: "Experience the glitz and glamour of Dubai with this all-inclusive luxury package. From the top of the Burj Khalifa to the golden sands of the desert, discover the magic of the Emirates.",
        itinerary: [
            { day: 1, title: "Arrival in Dubai", desc: "Private transfer to your 5-star hotel. Evening Dhow Cruise dinner." },
            { day: 2, title: "City Tour & Burj Khalifa", desc: "Half-day city tour followed by a visit to the 124th floor of Burj Khalifa." },
            { day: 3, title: "Desert Safari", desc: "Afternoon desert safari with BBQ dinner and belly dancing show." },
            { day: 4, title: "Shopping & Leisure", desc: "Free day for shopping at Dubai Mall or relaxing at the beach." },
            { day: 5, title: "Departure", desc: "Transfer to the airport for your flight back home." }
        ]
    },
    {
        id: 2,
        name: "Bangkok Adventure",
        image: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?q=80&w=1200&auto=format&fit=crop",
        duration: "6 Days / 5 Nights",
        price: "68,000",
        rating: 4.8,
        includes: ["Flights", "Hotel", "Tours", "Transfers"],
        description: "Immerse yourself in the vibrant culture of Bangkok. Explore ancient temples, bustling markets, and enjoy world-renowned street food.",
        itinerary: [
            { day: 1, title: "Arrival in Bangkok", desc: "Transfer to hotel. Evening free to explore Sukhumvit." },
            { day: 2, title: "Grand Palace & Temples", desc: "Visit Wat Arun, Wat Phra Kaew, and the Grand Palace." },
            { day: 3, title: "Floating Market", desc: "Day trip to Damnoen Saduak Floating Market." },
            { day: 4, title: "Shopping Day", desc: "Visit MBK Center and Siam Paragon." },
            { day: 5, title: "Chao Phraya Dinner Cruise", desc: "Evening dinner cruise on the river." },
            { day: 6, title: "Departure", desc: "Transfer to airport." }
        ]
    },
    {
        id: 3,
        name: "Malaysia Discovery",
        image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=1200&auto=format&fit=crop",
        duration: "7 Days / 6 Nights",
        price: "76,000",
        rating: 4.7,
        includes: ["Flights", "Accommodation", "Island Hopping", "Meals"],
        description: "Discover the best of Malaysia, from the twin towers of Kuala Lumpur to the pristine beaches of Langkawi.",
        itinerary: [
            { day: 1, title: "Arrival in Kuala Lumpur", desc: "Transfer to hotel. View Petronas Towers by night." },
            { day: 2, title: "KL City Tour", desc: "Visit Batu Caves, King's Palace, and Independence Square." },
            { day: 3, title: "Genting Highlands", desc: "Day trip to Genting Highlands with cable car ride." },
            { day: 4, title: "Flight to Langkawi", desc: "Fly to Langkawi. Transfer to beach resort." },
            { day: 5, title: "Island Hopping", desc: "Boat tour around Langkawi archipelago." },
            { day: 6, title: "Free Day", desc: "Relax on the beach or try water sports." },
            { day: 7, title: "Departure", desc: "Flight back to KL and connection home." }
        ]
    },
    {
        id: 4,
        name: "Maldives Paradise",
        image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=1200&auto=format&fit=crop",
        duration: "5 Days / 4 Nights",
        price: "135,000",
        rating: 5.0,
        includes: ["Flights", "Water Villa", "All Inclusive", "Spa"],
        description: "The ultimate romantic getaway. Stay in a luxurious water villa and enjoy crystal clear waters, white sandy beaches, and world-class service.",
        itinerary: [
            { day: 1, title: "Arrival in Male", desc: "Speedboat transfer to your private island resort." },
            { day: 2, title: "Relaxation", desc: "Enjoy the pristine beach and resort facilities." },
            { day: 3, title: "Snorkeling Trip", desc: "Guided snorkeling tour to see coral reefs and marine life." },
            { day: 4, title: "Sunset Cruise", desc: "Romantic sunset cruise with champagne." },
            { day: 5, title: "Departure", desc: "Speedboat transfer to airport." }
        ]
    },
    {
        id: 5,
        name: "Seychelles Escape",
        image: "https://images.unsplash.com/photo-1535916707205-153cd3e42997?q=80&w=1200&auto=format&fit=crop",
        duration: "6 Days / 5 Nights",
        price: "115,000",
        rating: 4.9,
        includes: ["Flights", "Beach Resort", "Excursions", "Breakfast"],
        description: "Explore the granite boulders and turquoise waters of Seychelles. A nature lover's paradise with unique flora and fauna.",
        itinerary: [
            { day: 1, title: "Arrival in Mahe", desc: "Transfer to your beachfront hotel." },
            { day: 2, title: "Mahe Island Tour", desc: "Full day tour exploring Victoria, markets, and beaches." },
            { day: 3, title: "Praslin & La Digue", desc: "Day trip by ferry to visit Vallee de Mai and Anse Source d'Argent." },
            { day: 4, title: "Free Day", desc: "Relax or choose an optional excursion." },
            { day: 5, title: "Marine Park", desc: "Boat trip to St Anne Marine Park for snorkeling." },
            { day: 6, title: "Departure", desc: "Transfer to airport." }
        ]
    },
    {
        id: 6,
        name: "South Africa Explorer",
        image: "https://images.unsplash.com/photo-1484318571209-661cf29a69c3?q=80&w=1200&auto=format&fit=crop",
        duration: "8 Days / 7 Nights",
        price: "125,000",
        rating: 4.8,
        includes: ["Flights", "Hotels", "Safari", "Cape Town Tour"],
        description: "A diverse journey through South Africa. Experience the cosmopolitan vibe of Cape Town and the thrill of a Big Five safari.",
        itinerary: [
            { day: 1, title: "Arrival in Cape Town", desc: "Transfer to hotel near V&A Waterfront." },
            { day: 2, title: "Cape Peninsula", desc: "Tour to Cape Point, penguins at Boulders Beach." },
            { day: 3, title: "Table Mountain & City", desc: "Cable car up Table Mountain and city tour." },
            { day: 4, title: "Winelands", desc: "Wine tasting tour in Stellenbosch and Franschhoek." },
            { day: 5, title: "Fly to Johannesburg", desc: "Flight to JNB, transfer to Pilanesberg." },
            { day: 6, title: "Safari Game Drive", desc: "Morning and afternoon game drives to spot the Big Five." },
            { day: 7, title: "Morning Safari", desc: "Final morning game drive. Transfer back to JNB hotel." },
            { day: 8, title: "Departure", desc: "Transfer to O.R. Tambo airport." }
        ]
    }
];

const DestinationDetails = () => {
    const { id } = useParams();
    const destination = destinations.find(d => d.id === parseInt(id)) || destinations[0];

    if (!destination) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-32">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Destination Not Found</h2>
                    <Link to="/destinations" className="text-primary hover:underline">← Back to Destinations</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pb-20">
            {/* Header */}
            <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 mb-8">
                <Link to="/destinations" className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors mb-6">
                    <ArrowLeft size={20} />
                    <span>Back to Destinations</span>
                </Link>
            </div>

            {/* Hero Image */}
            <div className="relative h-[60vh] mb-12">
                <img
                    src={destination.image}
                    alt={destination.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 h-[50%] bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
                    <div className="w-full max-w-[1400px] mx-auto">
                        <div className="flex items-center gap-3 mb-4">
                            <Plane size={32} className="text-primary" />
                            <div className="flex items-center gap-2">
                                <Star size={20} fill="currentColor" className="text-orange-500" />
                                <span className="font-bold text-xl">{destination.rating}</span>
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-2">{destination.name}</h1>
                        <div className="flex items-center gap-4 mt-4">
                            <div className="flex items-center gap-2 text-lg bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full">
                                <Calendar size={20} />
                                <span>{destination.duration}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* Description */}
                        <div className="mb-12">
                            <h2 className="text-3xl font-black mb-6">Overview</h2>
                            <p className="text-xl text-gray-700 leading-relaxed">{destination.description}</p>
                        </div>

                        {/* Itinerary */}
                        <div className="mb-12">
                            <h2 className="text-3xl font-black mb-8">Itinerary Highlights</h2>
                            <div className="space-y-6">
                                {destination.itinerary?.map((item, index) => (
                                    <div key={index} className="flex gap-6">
                                        <div className="flex flex-col items-center">
                                            <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                                                {item.day}
                                            </div>
                                            {index !== destination.itinerary.length - 1 && (
                                                <div className="w-0.5 flex-1 bg-gray-200 mt-2"></div>
                                            )}
                                        </div>
                                        <div className="bg-gray-50 rounded-2xl p-6 flex-1 hover:bg-gray-100 transition-colors">
                                            <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                                            <p className="text-gray-600">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Inclusions */}
                        <div className="bg-gray-50 rounded-3xl p-8 mb-8">
                            <h2 className="text-3xl font-black mb-6">Package Inclusions</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {destination.includes?.map((item, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                                        <span className="text-gray-700 text-lg">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Important Info */}
                        <div className="p-6 border-l-4 border-yellow-400 bg-yellow-50 rounded-r-xl">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="text-yellow-600 flex-shrink-0" size={24} />
                                <div>
                                    <h4 className="font-bold text-yellow-800 mb-2">Travel Requirements</h4>
                                    <p className="text-yellow-700">Passport must be valid for at least 6 months. Visa requirements vary by citizenship. Please consult with our travel experts.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Booking Sidebar */}
                    <div>
                        <div className="bg-white border-2 border-gray-200 rounded-3xl p-8 sticky top-32">
                            <div className="text-center mb-6">
                                <span className="text-gray-500 text-sm">Package from</span>
                                <div className="text-5xl font-black text-gray-900">Rs {destination.price}</div>
                                <span className="text-gray-500">per person sharing</span>
                            </div>

                            <Button
                                to="/contact"
                                className="w-full py-4 mb-4"
                            >
                                Request Quote
                            </Button>

                            <Button
                                variant="secondary"
                                className="w-full py-4 border-2"
                            >
                                <Heart size={20} />
                                Add to Wishlist
                            </Button>

                            <div className="mt-8 pt-8 border-t border-gray-200">
                                <h3 className="font-bold text-gray-900 mb-4">Why Book With Us?</h3>
                                <ul className="space-y-3 text-sm text-gray-600">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle size={16} className="text-primary" />
                                        <span>Expert destination knowledge</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle size={16} className="text-primary" />
                                        <span>24/7 Support during your trip</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle size={16} className="text-primary" />
                                        <span>Secure booking process</span>
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

export default DestinationDetails;
