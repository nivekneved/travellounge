import React, { useEffect } from 'react';
import { Search, Filter, SlidersHorizontal, RefreshCcw } from 'lucide-react';
import PageHero from '../components/PageHero';
import { useSearchParams } from 'react-router-dom';
import ServiceCard from '../components/ServiceCard';
import { supabase } from '../utils/supabase';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import ListingHeader from '../components/ListingHeader';
import Pagination from '../components/Pagination';
import { MapPin, Star, Calendar, Users, Ship, Clock } from 'lucide-react';
import Button from '../components/Button';

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

    const [viewMode, setViewMode] = React.useState('grid');
    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 9;

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

    // Reset pagination when search params change
    useEffect(() => {
        setCurrentPage(1);
    }, [category, query, checkIn, checkOut]);

    const paginatedProducts = React.useMemo(() => {
        if (!products) return [];
        const startIndex = (currentPage - 1) * itemsPerPage;
        return products.slice(startIndex, startIndex + itemsPerPage);
    }, [products, currentPage]);

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
        <div className="bg-white min-h-screen pb-24">
            <PageHero
                title="Explore Mauritius"
                subtitle="Find your perfect paradise experience with our advanced search."
                image="https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1920"
                icon={Search}
            />

            <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 mt-12 pb-20 pt-12 md:pt-20">
                {/* Unified Search & Filter Header */}
                <div className="mb-12">
                    <div className="flex flex-col xl:flex-row gap-4 items-end xl:items-center bg-white p-6 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-gray-100">
                        {/* Search Input */}
                        <div className="relative flex-grow w-full">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Destination or Experience</span>
                            <div className="relative group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-primary group-focus-within:scale-110 transition-transform" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search experiences..."
                                    className="w-full pl-16 pr-6 py-4 bg-gray-50/80 rounded-2xl border-none focus:ring-2 focus:ring-primary/20 outline-none text-base font-bold placeholder:text-gray-400 transition-all"
                                    value={query}
                                    onChange={(e) => setSearchParams({ category, q: e.target.value, checkIn: searchParams.get('checkIn') || '', checkOut: searchParams.get('checkOut') || '' })}
                                />
                            </div>
                        </div>

                        {/* Date Filters */}
                        <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
                            <div className="flex flex-col group flex-grow sm:flex-grow-0">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 group-focus-within:text-primary transition-colors">Arriving</span>
                                <input
                                    type="date"
                                    className="w-full sm:w-44 px-6 py-4 bg-gray-50/80 rounded-2xl border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold cursor-pointer"
                                    value={searchParams.get('checkIn') || ''}
                                    onChange={(e) => setSearchParams({ category, q: query, checkIn: e.target.value, checkOut: searchParams.get('checkOut') || '' })}
                                />
                            </div>
                            <div className="flex flex-col group flex-grow sm:flex-grow-0">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 group-focus-within:text-primary transition-colors">Departing</span>
                                <input
                                    type="date"
                                    className="w-full sm:w-44 px-6 py-4 bg-gray-50/80 rounded-2xl border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold cursor-pointer"
                                    value={searchParams.get('checkOut') || ''}
                                    onChange={(e) => setSearchParams({ category, q: query, checkIn: searchParams.get('checkIn') || '', checkOut: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Category Dropdown */}
                        <div className="flex flex-col group w-full xl:w-64">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 group-focus-within:text-primary transition-colors">Experience Type</span>
                            <div className="relative select-wrapper">
                                <select
                                    value={category}
                                    onChange={(e) => setSearchParams({ category: e.target.value, q: query, checkIn: searchParams.get('checkIn') || '', checkOut: searchParams.get('checkOut') || '' })}
                                    className="w-full px-6 py-4 bg-gray-50/80 rounded-2xl border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-primary/20 outline-none font-bold text-gray-700 appearance-none cursor-pointer transition-all pr-12"
                                >
                                    {CATEGORIES.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.label}
                                        </option>
                                    ))}
                                </select>
                                <Filter size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Reset Button */}
                        <div className="xl:mb-0">
                            <span className="text-[10px] font-black text-transparent select-none hidden xl:block mb-2">Reset</span>
                            <button
                                onClick={() => setSearchParams({ category: 'all', q: '', checkIn: '', checkOut: '' })}
                                className="p-4 bg-gray-50/80 hover:bg-primary/10 text-gray-400 hover:text-primary rounded-2xl border-none ring-1 ring-gray-100 transition-all group"
                                title="Reset Filters"
                            >
                                <RefreshCcw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                {!isLoading && category !== 'flights' && products?.length > 0 && (
                    <ListingHeader
                        count={products.length}
                        label="experiences"
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                    />
                )}

                {/* Results Area */}
                <main>
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="h-96 bg-gray-50 animate-pulse rounded-[2.5rem]" />
                            ))}
                        </div>
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
                        <>
                            <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-8`}>
                                {paginatedProducts?.map((product, index) => (
                                    viewMode === 'grid' ? (
                                        <ServiceCard key={product._id} product={product} />
                                    ) : (
                                        <div
                                            key={product._id}
                                            style={{ animation: `fadeInUp 0.6s ease-out ${index % 9 * 0.1}s both` }}
                                            className="bg-white rounded-[2.5rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group border border-gray-100 flex flex-col md:flex-row h-full"
                                        >
                                            <div className="w-full md:w-2/5 h-64 md:h-auto relative overflow-hidden">
                                                <img
                                                    src={product.image || (product.images && product.images[0])}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                                <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border border-white/20">
                                                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">{product.category}</span>
                                                </div>
                                            </div>

                                            <div className="w-full md:w-3/5 p-8 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex justify-between items-start mb-4">
                                                        <h3 className="text-2xl font-black text-gray-900 group-hover:text-primary transition-colors">{product.name}</h3>
                                                        <div className="flex items-center gap-1.5 bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-100">
                                                            <Star size={14} className="text-orange-500" fill="currentColor" />
                                                            <span className="text-sm font-black text-orange-700">{product.rating}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
                                                        {product.location && (
                                                            <div className="flex items-center gap-2">
                                                                <MapPin size={16} className="text-primary" />
                                                                <span className="font-bold">{product.location}</span>
                                                            </div>
                                                        )}
                                                        {product.duration && (
                                                            <div className="flex items-center gap-2">
                                                                <Calendar size={16} className="text-primary" />
                                                                <span className="font-bold">{product.duration}</span>
                                                            </div>
                                                        )}
                                                        {product.time && (
                                                            <div className="flex items-center gap-2">
                                                                <Clock size={16} className="text-primary" />
                                                                <span className="font-bold">{product.time}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <p className="text-gray-500 line-clamp-2 mb-8 leading-relaxed font-medium">
                                                        {product.description}
                                                    </p>
                                                </div>

                                                <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                                                    <div>
                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Starting from</span>
                                                        <div className="flex items-baseline gap-1">
                                                            <span className="text-3xl font-black text-gray-900">Rs {product.price || (product.pricing && product.pricing.price)}</span>
                                                            <span className="text-xs font-bold text-gray-500">/ person</span>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        to={`/services/${product.id}`}
                                                        className="px-8 py-4 rounded-2xl shadow-xl shadow-primary/20"
                                                    >
                                                        View Experience
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                ))}
                            </div>

                            {products?.length > 0 && (
                                <Pagination
                                    currentPage={currentPage}
                                    totalItems={products.length}
                                    itemsPerPage={itemsPerPage}
                                    onPageChange={setCurrentPage}
                                />
                            )}

                            {products?.length === 0 && (
                                <div className="col-span-full py-24 text-center text-gray-500 bg-gray-50/50 rounded-[3rem] border border-dashed border-gray-200">
                                    <div className="text-7xl mb-6 grayscale opacity-30">🏝️</div>
                                    <h3 className="text-3xl font-black uppercase tracking-tight mb-3">No experiences found</h3>
                                    <p className="font-medium text-gray-400 max-w-md mx-auto leading-relaxed">We couldn't find any matches for your current selection. Try broadening your criteria or reset the filters.</p>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div >
        </div >
    );
};

export default SearchPage;
