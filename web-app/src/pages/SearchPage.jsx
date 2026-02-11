import React, { useEffect } from 'react';
import { Search, Filter, SlidersHorizontal, RefreshCcw } from 'lucide-react';
import PageHero from '../components/PageHero';
import { useSearchParams } from 'react-router-dom';
import ServiceCard from '../components/ServiceCard';
import { supabase } from '../utils/supabase';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

const CATEGORIES = [
    { id: 'all', label: 'All Experiences' },
    { id: 'hotels', label: 'Hotels' },
    { id: 'cruises', label: 'Cruises' },
    { id: 'flights', label: 'Flights' },
    { id: 'group-tours', label: 'Group Tours' }
];

const CATEGORY_MAPPING = {
    hotels: ['hotels', 'Luxury Resort', 'Golf Resort', 'Luxury Villa', 'Rodrigues', 'Hotel', 'Hotels'],
    cruises: ['Mediterranean', 'Caribbean', 'Alaska', 'Asia', 'Europe', 'Pacific', 'Cruise', 'Cruises'],
    'group-tours': ['Group Tour', 'Group Tours']
};

const SearchPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const category = searchParams.get('category') || 'all';
    const query = searchParams.get('q') || '';
    const checkIn = searchParams.get('checkIn') || '';
    const checkOut = searchParams.get('checkOut') || '';

    const queryClient = useQueryClient();

    const { data: products, isLoading } = useQuery({
        queryKey: ['services', category, query, checkIn, checkOut],
        queryFn: async () => {
            let dbQuery = supabase
                .from('services')
                .select('*, hotel_rooms(id, total_units)')
                .order('created_at', { ascending: false });

            if (category !== 'all') {
                const mappedCategories = CATEGORY_MAPPING[category];
                if (mappedCategories) {
                    dbQuery = dbQuery.in('category', mappedCategories);
                } else {
                    const searchTerm = category.endsWith('s') ? category.slice(0, -1) : category;
                    dbQuery = dbQuery.ilike('category', `%${searchTerm}%`);
                }
            }

            if (query) {
                dbQuery = dbQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
            }

            const { data: services, error } = await dbQuery;

            if (error) {
                console.error('Error fetching services:', error);
                throw error;
            }

            let filteredData = services || [];

            // Client-side mapping to match ServiceCard expectation (_id)
            filteredData = filteredData.map(s => ({ ...s, _id: s.id }));

            // Date-based availability filtering (Client-side implementation of controller logic)
            if (checkIn && checkOut) {
                const start = new Date(checkIn);
                const end = new Date(checkOut);
                const oneDay = 24 * 60 * 60 * 1000;
                const requiredNights = Math.max(1, Math.round(Math.abs((end - start) / oneDay)));

                const roomIds = filteredData.flatMap(s => s.hotel_rooms?.map(r => r.id) || []);

                if (roomIds.length > 0) {
                    const { data: dailyPrices } = await supabase
                        .from('room_daily_prices')
                        .select('room_id, date, is_blocked, available_units')
                        .in('room_id', roomIds)
                        .gte('date', checkIn)
                        .lt('date', checkOut);

                    const pricesMap = {};
                    dailyPrices?.forEach(dp => {
                        if (!pricesMap[dp.room_id]) pricesMap[dp.room_id] = [];
                        pricesMap[dp.room_id].push(dp);
                    });

                    filteredData = filteredData.filter(service => {
                        if (!service.hotel_rooms || service.hotel_rooms.length === 0) return false;

                        return service.hotel_rooms.some(room => {
                            const roomPrices = pricesMap[room.id] || [];
                            // Logic: If explicitly blocked or no units, it's unavailable.
                            // Note: If no price record exists, current logic assumes unavailable (strict).
                            if (roomPrices.length < requiredNights) return false;

                            return roomPrices.every(dp => !dp.is_blocked && (dp.available_units === undefined || dp.available_units > 0));
                        });
                    });
                } else {
                    // No rooms found for these services, so if dates are required, they can't be booked
                    filteredData = [];
                }
            }

            return filteredData;
        }
    });

    useEffect(() => {
        const channel = supabase
            .channel('search-sync')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'room_daily_prices' },
                () => {
                    queryClient.invalidateQueries(['services']);
                    toast.success('Live inventory updated!', {
                        position: 'bottom-center',
                        icon: '🔄',
                        style: { background: '#111827', color: '#fff', fontSize: '10px', fontWeight: 'bold' }
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [queryClient]);

    return (
        <div className="bg-white min-h-screen pt-32 pb-24">
            <PageHero
                title="Explore Mauritius"
                subtitle="Find your perfect paradise experience with our advanced search."
                image="https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1920"
                icon={Search}
            />

            <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 mt-12">
                {/* Search Header */}
                <div className="mb-12">
                    <div className="flex flex-col lg:flex-row gap-4 items-center bg-white p-4 rounded-3xl shadow-sm">
                        <div className="relative flex-grow w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search experiences..."
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-primary outline-none"
                                value={query}
                                onChange={(e) => setSearchParams({ category, q: e.target.value, checkIn: searchParams.get('checkIn') || '', checkOut: searchParams.get('checkOut') || '' })}
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1">Check In</span>
                                <input
                                    type="date"
                                    className="px-4 py-2 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-primary outline-none text-sm font-bold"
                                    value={searchParams.get('checkIn') || ''}
                                    onChange={(e) => setSearchParams({ category, q: query, checkIn: e.target.value, checkOut: searchParams.get('checkOut') || '' })}
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1">Check Out</span>
                                <input
                                    type="date"
                                    className="px-4 py-2 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-primary outline-none text-sm font-bold"
                                    value={searchParams.get('checkOut') || ''}
                                    onChange={(e) => setSearchParams({ category, q: query, checkIn: searchParams.get('checkIn') || '', checkOut: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSearchParams({ category: cat.id, q: query, checkIn: searchParams.get('checkIn') || '', checkOut: searchParams.get('checkOut') || '' })}
                                    className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${category === cat.id
                                        ? 'bg-primary text-white shadow-lg shadow-primary/25 translate-y-[-2px]'
                                        : 'bg-gray-50 text-gray-600 hover:text-primary hover:bg-primary/5'
                                        }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Results Grid */}
                {isLoading ? (
                    <div className="text-center py-20 text-gray-400 animate-pulse">Searching the islands...</div>
                ) : category === 'flights' ? (
                    <div className="max-w-2xl mx-auto py-12">
                        <div className="bg-[#1a1a1a] rounded-[2.5rem] p-12 text-center border border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-all duration-1000" />
                            <div className="relative z-10 flex flex-col items-center">
                                <span className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-4">Island Connect</span>
                                <h3 className="text-3xl font-black text-white mb-6">Explore the world with <span className="text-primary">Travel Lounge Flights</span></h3>
                                <p className="text-gray-400 mb-10 leading-relaxed font-bold">We've partnered with <span className="text-white">Golibe</span> to bring you the best rates on international and local flights. Click below to use our official flight booking engine.</p>
                                <a
                                    href="https://travellounge.golibe.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-10 py-5 bg-primary text-white rounded-2xl font-black shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all text-lg flex items-center gap-3"
                                >
                                    Open Flight Engine
                                    <RefreshCcw size={20} className="group-hover:rotate-180 transition-all duration-700" />
                                </a>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {products?.map((product) => (
                            <ServiceCard key={product._id} product={product} />
                        ))}
                        {products?.length === 0 && (
                            <div className="col-span-full py-20 text-center text-gray-500">
                                <div className="text-6xl mb-4">🏝️</div>
                                <h3 className="text-2xl font-bold">No hidden gems found here</h3>
                                <p>Try adjusting your search or category filters.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchPage;
