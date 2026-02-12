import React, { useState } from 'react';
import { Plane, Calendar, MapPin, Search, ArrowRight, Shield, Clock, CreditCard, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';
import { format } from 'date-fns';
import PageHero from '../components/PageHero';
import TrustSection from '../components/TrustSection';
import NewsletterSection from '../components/NewsletterSection';

const Flights = () => {
    const [searchData, setSearchData] = useState({
        from: '',
        to: '',
        departureDate: '',
        returnDate: '',
        passengers: 1,
        class: 'Economy'
    });

    // Fetch Flights from Supabase
    const { data: flights, isLoading } = useQuery({
        queryKey: ['public_flights'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('flights')
                .select('*')
                .eq('status', 'active')
                .order('departure_time', { ascending: true })
                .limit(6); // Show top 6 upcoming flights
            if (error) throw error;
            return data;
        }
    });

    const handleSearch = (e) => {
        e.preventDefault();
        // For now, redirect to contact or show modal
        window.location.href = `/contact?subject=Flight Inquiry: ${searchData.from} to ${searchData.to}`;
    };

    const popularDestinations = [
        {
            id: 1,
            city: "Dubai",
            country: "UAE",
            price: "28,500",
            image: "https://images.unsplash.com/photo-1512453979798-5ea932a23644?q=80&w=800&auto=format&fit=crop"
        },
        {
            id: 2,
            city: "Paris",
            country: "France",
            price: "35,000",
            image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop"
        },
        {
            id: 3,
            city: "London",
            country: "UK",
            price: "38,000",
            image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=800&auto=format&fit=crop"
        },
        {
            id: 4,
            city: "Rodrigues",
            country: "Mauritius",
            price: "5,200",
            image: "https://images.unsplash.com/photo-1589553416260-f586c8f1514f?q=80&w=800&auto=format&fit=crop"
        }
    ];

    return (
        <div className="bg-white min-h-screen pb-20">
            {/* Hero Section */}
            <PageHero
                title="Search Flights"
                subtitle="Book your next journey with our exclusive flight offers and worldwide coverage."
                image="https://images.unsplash.com/photo-1436491865332-7a61a109c0f3?q=80&w=1920"
                icon={Plane}
            />

            {/* Content Container */}
            <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 pt-12 md:pt-20 relative z-10">
                {/* Search Box */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 mb-20 animate-in slide-in-from-bottom-16 duration-700">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Search className="text-primary" size={24} />
                        Search Best Fares
                    </h2>

                    <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                        <div className="relative">
                            <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">From</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Origin City"
                                    className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    value={searchData.from}
                                    onChange={(e) => setSearchData({ ...searchData, from: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="relative">
                            <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">To</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Destination City"
                                    className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    value={searchData.to}
                                    onChange={(e) => setSearchData({ ...searchData, to: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="relative">
                            <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Departure</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="date"
                                    className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    value={searchData.departureDate}
                                    onChange={(e) => setSearchData({ ...searchData, departureDate: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="relative">
                            <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Return</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="date"
                                    className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    value={searchData.returnDate}
                                    onChange={(e) => setSearchData({ ...searchData, returnDate: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="relative">
                            <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Class</label>
                            <select
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all appearance-none"
                                value={searchData.class}
                                onChange={(e) => setSearchData({ ...searchData, class: e.target.value })}
                            >
                                <option>Economy</option>
                                <option>Premium Economy</option>
                                <option>Business</option>
                                <option>First Class</option>
                            </select>
                        </div>

                        <div className="flex items-end">
                            <Button variant="primary" size="lg" className="w-full h-[50px] justify-center">
                                Search Flights
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 text-center">
                    <div className="bg-gray-50 p-8 rounded-3xl hover:shadow-lg transition-all duration-300">
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6 text-primary">
                            <Shield size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Best Rate Guarantee</h3>
                        <p className="text-gray-600">We match any competitor's price for the same flight itinerary.</p>
                    </div>
                    <div className="bg-gray-50 p-8 rounded-3xl hover:shadow-lg transition-all duration-300">
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6 text-primary">
                            <Clock size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">24/7 Support</h3>
                        <p className="text-gray-600">Round-the-clock assistance for urgent flight changes or cancellations.</p>
                    </div>
                    <div className="bg-gray-50 p-8 rounded-3xl hover:shadow-lg transition-all duration-300">
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6 text-primary">
                            <CreditCard size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Flexible Payment</h3>
                        <p className="text-gray-600">Book now and pay later with our 0% interest installment plans.</p>
                    </div>
                </div>

                {/* Dynamic Flight Offers (From Admin) */}
                <div className="mb-20">
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <h2 className="text-4xl font-black text-gray-900 mb-4">Latest Flight Offers</h2>
                            <p className="text-xl text-gray-600">Exclusive deals managed by our travel experts</p>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader className="animate-spin text-primary" size={48} />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {flights?.map((flight) => (
                                <div key={flight.id} className="bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group">
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-primary-500 overflow-hidden border border-gray-100">
                                                    {flight.logo_url ? <img src={flight.logo_url} alt="logo" className="w-full h-full object-cover" /> : <Plane size={24} />}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900">{flight.airline}</h3>
                                                    <p className="text-xs text-gray-500 font-mono">{flight.flight_number}</p>
                                                </div>
                                            </div>
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 capitalize">
                                                {flight.status.replace('_', ' ')}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between mb-6">
                                            <div className="text-center">
                                                <div className="text-2xl font-black text-gray-900">{flight.departure_city.substring(0, 3).toUpperCase()}</div>
                                                <div className="text-xs text-gray-500">{format(new Date(flight.departure_time), 'HH:mm')}</div>
                                            </div>
                                            <div className="flex-1 px-4 flex flex-col items-center">
                                                <div className="text-xs text-gray-400 mb-1">Direct</div>
                                                <div className="w-full h-[2px] bg-gray-200 relative">
                                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gray-300"></div>
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-black text-gray-900">{flight.arrival_city.substring(0, 3).toUpperCase()}</div>
                                                <div className="text-xs text-gray-500">{format(new Date(flight.arrival_time), 'HH:mm')}</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-gray-400">Price per person</span>
                                                <span className="text-xl font-black text-primary">${flight.price}</span>
                                            </div>
                                            <Button to={`/contact?subject=Booking Flight ${flight.flight_number}`} variant="outline" size="sm">
                                                Book Now
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 px-6 py-3 flex items-center gap-4 text-xs text-gray-500 justify-between">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar size={14} />
                                            {format(new Date(flight.departure_time), 'MMM d, yyyy')}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <MapPin size={14} />
                                            {flight.departure_city} - {flight.arrival_city}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {flights?.length === 0 && (
                                <div className="col-span-full py-8 text-center text-gray-500">
                                    No flights currently available. Check back soon.
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Popular Destinations (Static Marketing) */}
                <div className="mb-20">
                    <div className="flex items-end justify-between mb-12">
                        <div>
                            <h2 className="text-4xl font-black text-gray-900 mb-4">Popular Destinations</h2>
                            <p className="text-xl text-gray-600">Trending flight deals from Mauritius</p>
                        </div>
                        <Link to="/contact">
                            <Button variant="outline" icon={ArrowRight}>View All Routes</Button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {popularDestinations.map((dest) => (
                            <div key={dest.id} className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                                <div className="h-80 overflow-hidden relative">
                                    <img
                                        src={dest.image}
                                        alt={dest.city}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />

                                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                        <div className="flex items-center gap-2 mb-2 opacity-80 text-sm">
                                            <Plane size={14} /> Direct Flight
                                        </div>
                                        <h3 className="text-2xl font-bold mb-1">{dest.city}</h3>
                                        <p className="text-gray-300 text-sm mb-4">{dest.country}</p>

                                        <div className="flex items-center justify-between border-t border-white/20 pt-4">
                                            <div>
                                                <span className="text-xs uppercase opacity-70">From</span>
                                                <p className="font-bold text-xl">Rs {dest.price}</p>
                                            </div>
                                            <button className="bg-white text-gray-900 p-2 rounded-full hover:bg-primary hover:text-white transition-colors">
                                                <ArrowRight size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <TrustSection className="bg-transparent" />
                <NewsletterSection className="mt-12" />
            </div>
        </div>
    );
};

export default Flights;
