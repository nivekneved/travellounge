import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';
import { toast } from 'react-hot-toast';
import {
    Plane,
    List as ListIcon,
    ArrowUpDown,
    Plus,
    Search,
    Calendar,
    Clock,
    Edit2,
    Trash2,
    MapPin,
    X,
    DollarSign,
    ChevronLeft,
    ChevronRight,
    TrendingUp,
    Zap,
    Loader,
    Save,
    ImageIcon
} from 'lucide-react';
import { format } from 'date-fns';
import ViewToggle from '../components/ViewToggle';

const PAGE_SIZE = 10;

const FlightManager = () => {
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [view, setView] = useState('list'); // 'list' | 'grid'
    const [sortConfig, setSortConfig] = useState({ key: 'departure_time', direction: 'asc' });
    const [page, setPage] = useState(0);

    // Form State
    const [formData, setFormData] = useState({
        airline: '',
        flight_number: '',
        departure_city: '',
        arrival_city: '',
        departure_time: '',
        arrival_time: '',
        price: '',
        status: 'active', // active, drafted, sold_out
        logo_url: ''
    });

    // Fetch Flights with Pagination
    const { data, isLoading, isError, error: queryError } = useQuery({
        queryKey: ['flights', page, sortConfig, filterStatus],
        queryFn: async () => {
            let query = supabase
                .from('flights')
                .select('*', { count: 'exact' });

            if (filterStatus !== 'all') {
                query = query.eq('status', filterStatus);
            }

            const { data, count, error } = await query
                .order(sortConfig.key, { ascending: sortConfig.direction === 'asc' })
                .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

            if (error) throw error;
            return { flights: data, count };
        }
    });

    const flights = data?.flights || [];
    const totalCount = data?.count || 0;
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    React.useEffect(() => {
        if (isError && queryError) {
            toast.error(`Failed to load flights: ${queryError.message}`);
        }
    }, [isError, queryError]);

    // Mutations
    const createMutation = useMutation({
        mutationFn: async (newFlight) => {
            const { data, error } = await supabase.from('flights').insert([newFlight]);
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['flights']);
            toast.success('Flight added successfully');
            setIsEditing(false);
            resetForm();
        },
        onError: (error) => toast.error(`Error: ${error.message}`)
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, updates }) => {
            const { data, error } = await supabase.from('flights').update(updates).eq('id', id);
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['flights']);
            toast.success('Flight updated successfully');
            setIsEditing(false);
            resetForm();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase.from('flights').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['flights']);
            toast.success('Flight deleted');
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingId) {
            updateMutation.mutate({ id: editingId, updates: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const resetForm = () => {
        setFormData({
            airline: '',
            flight_number: '',
            departure_city: '',
            arrival_city: '',
            departure_time: '',
            arrival_time: '',
            price: '',
            status: 'active',
            logo_url: ''
        });
        setEditingId(null);
    };

    const handleEdit = (flight) => {
        setFormData(flight);
        setEditingId(flight.id);
        setIsEditing(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this flight?')) {
            deleteMutation.mutate(id);
        }
    };

    const filteredAndSortedFlights = useMemo(() => {
        return flights.filter(flight => {
            const searchStr = searchTerm.toLowerCase();
            return (
                flight.airline.toLowerCase().includes(searchStr) ||
                flight.flight_number.toLowerCase().includes(searchStr) ||
                flight.departure_city.toLowerCase().includes(searchStr) ||
                flight.arrival_city.toLowerCase().includes(searchStr)
            );
        });
    }, [flights, searchTerm]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <Loader className="animate-spin text-red-600" size={40} />
                <p className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Synchronizing Schedules...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight ">Flight Hub</h1>
                    <p className="text-gray-500 font-medium">Manage global routes, airline partners, and live scheduling</p>
                </div>

                <div className="flex items-center gap-4">
                    {!isEditing && (
                        <>
                            <ViewToggle view={view} onViewChange={setView} />
                            <button
                                onClick={() => { resetForm(); setIsEditing(true); }}
                                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-xl shadow-red-600/20 active:scale-95 group"
                            >
                                <Plus size={22} className="group-hover:rotate-90 transition-transform" />
                                <span>Schedule Flight</span>
                            </button>
                        </>
                    )}
                    {isEditing && (
                        <button
                            onClick={() => setIsEditing(false)}
                            className="p-4 hover:bg-gray-100 rounded-2xl transition-all text-gray-400 hover:text-gray-900 shadow-sm border border-gray-100"
                        >
                            <X size={24} />
                        </button>
                    )}
                </div>
            </div>

            {!isEditing ? (
                <>
                    {/* Stats Bar */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 group hover:border-red-100 transition-colors">
                            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
                                <Plane size={28} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest" >Total Routes</p>
                                <h3 className="text-3xl font-black text-gray-900" >{totalCount}</h3>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 group hover:border-red-100 transition-colors">
                            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                                <Zap size={28} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest" >Active Flights</p>
                                <h3 className="text-3xl font-black text-gray-900" >{totalCount}</h3>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 group hover:border-red-100 transition-colors">
                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                <TrendingUp size={28} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest" >Live Traffic</p>
                                <h3 className="text-3xl font-black text-gray-900" >100%</h3>
                            </div>
                        </div>
                    </div>

                    {/* Filters Area */}
                    <div className="bg-white p-4 border border-gray-100 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative flex-1 max-w-2xl w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by Airline, City, or Flight Number..."
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:bg-white focus:border-red-500 outline-none transition-all font-bold text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
                                {['all', 'active', 'sold_out'].map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setFilterStatus(s)}
                                        className={`px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === s ? 'bg-white text-red-600 shadow-sm ring-1 ring-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-4 text-gray-400 bg-gray-50 px-5 py-3 rounded-xl border border-gray-100">
                                <span className="text-xs font-black uppercase tracking-widest" >Verified Ledger</span>
                            </div>
                        </div>
                    </div>

                    {/* Main List */}
                    {view === 'list' ? (
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse table-fixed">
                                    <colgroup>
                                        <col className="w-[200px]" />
                                        <col className="w-[180px]" />
                                        <col className="w-[180px]" />
                                        <col className="w-[100px]" />
                                        <col className="w-[120px]" />
                                        <col className="w-[150px]" />
                                    </colgroup>
                                    <thead>
                                        <tr className="border-b border-gray-100 align-middle bg-gray-50/50">
                                            <th className="py-5 px-6 text-[10px] font-black text-red-600 uppercase tracking-[0.2em] cursor-pointer hover:bg-red-50/50 transition-colors"
                                                onClick={() => setSortConfig({ key: 'airline', direction: sortConfig.key === 'airline' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })}>
                                                <div className="flex items-center gap-2">Airline <ArrowUpDown size={12} className={sortConfig.key === 'airline' ? 'opacity-100' : 'opacity-20'} /></div>
                                            </th>
                                            <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Route</th>
                                            <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Schedule</th>
                                            <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Tariff</th>
                                            <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Status</th>
                                            <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredAndSortedFlights.map((flight) => (
                                            <tr key={flight.id} className="transition-all even:bg-gray-50/50 hover:bg-gray-50 align-top group transition-colors">
                                                <td className="py-6 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 overflow-hidden shrink-0 border border-gray-50 group-hover:scale-110 transition-transform shadow-sm">
                                                            {flight.logo_url ? <img src={flight.logo_url} alt="" className="w-full h-full object-cover" /> : <Plane size={20} />}
                                                        </div>
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="font-black text-gray-900 truncate text-sm uppercase ">{flight.airline}</span>
                                                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{flight.flight_number}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-6 px-6">
                                                    <div className="flex items-center gap-2 text-xs font-black text-gray-700 uppercase ">
                                                        <span className="truncate">{flight.departure_city}</span>
                                                        <div className="w-3 h-[1.5px] bg-red-200"></div>
                                                        <span className="truncate">{flight.arrival_city}</span>
                                                    </div>
                                                </td>
                                                <td className="py-6 px-6">
                                                    <div className="space-y-1.5">
                                                        <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold">
                                                            <Calendar size={12} className="text-red-600" />
                                                            <span>{format(new Date(flight.departure_time), 'MMM d, yyyy')}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold">
                                                            <Clock size={12} />
                                                            <span>{format(new Date(flight.departure_time), 'HH:mm')} - {format(new Date(flight.arrival_time), 'HH:mm')}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-6 px-6">
                                                    <div className="text-gray-900 font-black tracking-tight text-sm uppercase">${flight.price}</div>
                                                </td>
                                                <td className="py-6 px-6 text-center">
                                                    <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${flight.status === 'active' ? 'bg-green-50 text-green-700 border-green-100' : flight.status === 'sold_out' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                                                        {flight.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="py-6 px-6 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button onClick={() => handleEdit(flight)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-black"><Edit2 size={16} /></button>
                                                        <button onClick={() => handleDelete(flight.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all font-black"><Trash2 size={16} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {/* Pagination Row */}
                            <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ">Showing {page * PAGE_SIZE + 1} to {Math.min((page + 1) * PAGE_SIZE, totalCount)} of {totalCount} Records</p>
                                <div className="flex gap-2">
                                    <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                                        className="p-2 text-gray-400 hover:text-red-600 disabled:opacity-30 transition-all"><ChevronLeft size={20} /></button>
                                    <div className="flex gap-1 items-center">
                                        {[...Array(totalPages)].map((_, i) => (
                                            <button key={i} onClick={() => setPage(i)} className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${page === i ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-gray-400 hover:bg-white border border-transparent hover:border-gray-100'}`}>{i + 1}</button>
                                        ))}
                                    </div>
                                    <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
                                        className="p-2 text-gray-400 hover:text-red-600 disabled:opacity-30 transition-all"><ChevronRight size={20} /></button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredAndSortedFlights.map((flight) => (
                                <div key={flight.id} className="bg-white rounded-[2rem] border border-gray-100 p-6 flex flex-col group relative hover:shadow-2xl hover:border-red-100 transition-all duration-500">
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-red-600 border border-gray-100 group-hover:scale-110 transition-transform overflow-hidden shadow-sm">
                                                {flight.logo_url ? <img src={flight.logo_url} alt="" className="w-full h-full object-cover" /> : <Plane size={24} />}
                                            </div>
                                            <div>
                                                <h3 className="font-black text-gray-900 uppercase tracking-tight ">{flight.airline}</h3>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{flight.flight_number}</p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${flight.status === 'active' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                            {flight.status.replace('_', ' ')}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between mb-8 px-2">
                                        <div className="text-center">
                                            <div className="text-2xl font-black text-gray-900 tracking-tighter ">{flight.departure_city.substring(0, 3).toUpperCase()}</div>
                                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{format(new Date(flight.departure_time), 'HH:mm')}</div>
                                        </div>
                                        <div className="flex-1 px-4 flex flex-col items-center">
                                            <div className="text-[9px] font-black text-red-600 uppercase tracking-widest mb-1">Non-Stop</div>
                                            <div className="w-full h-[2px] bg-red-100 relative">
                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-red-400 shadow-sm animate-pulse"></div>
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-black text-gray-900 tracking-tighter ">{flight.arrival_city.substring(0, 3).toUpperCase()}</div>
                                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{format(new Date(flight.arrival_time), 'HH:mm')}</div>
                                        </div>
                                    </div>

                                    <div className="mt-auto flex items-center justify-between pt-6 border-t border-gray-50">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Fare (USD)</span>
                                            <span className="text-2xl font-black text-red-600 tracking-tight ">${flight.price}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <button onClick={() => handleEdit(flight)} className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-black shadow-sm border border-gray-50"><Edit2 size={16} /></button>
                                            <button onClick={() => handleDelete(flight.id)} className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all font-black shadow-sm border border-gray-50"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <div className="space-y-8 animate-fade-in max-w-6xl mx-auto w-full px-8 pt-4 pb-16">
                    <div className="flex items-center justify-between mb-16 px-4">
                        <div className="flex items-center gap-6">
                            <div className="p-4 bg-red-50 rounded-3xl text-red-600 shadow-sm border border-red-100">
                                <Plane size={32} />
                            </div>
                            <div>
                                <h2 className="text-4xl font-display font-bold text-slate-900 tracking-tight ">
                                    {editingId ? 'Modify Flight' : 'New Flight Record'}
                                </h2>
                                <p className="text-lg text-slate-400 font-medium mt-1">Configure flight path, scheduling and airline logistics</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="px-4 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                            <div className="space-y-4">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2"><ImageIcon size={14} className="text-red-600" /> Carrier & Flight</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="text" required placeholder="Airline Name" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white outline-none transition-all font-bold text-sm"
                                        value={formData.airline} onChange={(e) => setFormData({ ...formData, airline: e.target.value })} />
                                    <input type="text" required placeholder="Flight No." className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white outline-none transition-all font-bold text-sm"
                                        value={formData.flight_number} onChange={(e) => setFormData({ ...formData, flight_number: e.target.value })} />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2"><MapPin size={14} className="text-red-600" /> Itinerary Path</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="text" required placeholder="Origin City" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white outline-none transition-all font-bold text-sm"
                                        value={formData.departure_city} onChange={(e) => setFormData({ ...formData, departure_city: e.target.value })} />
                                    <input type="text" required placeholder="Destination" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white outline-none transition-all font-bold text-sm"
                                        value={formData.arrival_city} onChange={(e) => setFormData({ ...formData, arrival_city: e.target.value })} />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Clock size={14} className="text-red-600" /> Departure Timestamp</label>
                                <input type="datetime-local" required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white outline-none transition-all font-bold text-sm"
                                    value={formData.departure_time} onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })} />
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Clock size={14} className="text-red-600" /> Arrival Timestamp</label>
                                <input type="datetime-local" required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white outline-none transition-all font-bold text-sm"
                                    value={formData.arrival_time} onChange={(e) => setFormData({ ...formData, arrival_time: e.target.value })} />
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2"><DollarSign size={14} className="text-red-600" /> Tariff Configuration</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">$</span>
                                        <input type="number" required min="0" className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white outline-none transition-all font-bold text-sm"
                                            value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
                                    </div>
                                    <select className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white outline-none transition-all font-bold text-sm"
                                        value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} >
                                        <option value="active">Active Track</option>
                                        <option value="drafted">Hold Entry</option>
                                        <option value="sold_out">No Seats</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Zap size={14} className="text-red-600" /> Media & Logistics</label>
                                <input type="url" placeholder="Airline Logo URL (https://...)" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white outline-none transition-all font-bold text-sm"
                                    value={formData.logo_url} onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })} />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-10 border-t border-gray-100 mt-12">
                            <button type="button" onClick={() => setIsEditing(false)} className="px-10 py-4 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-2xl font-black uppercase tracking-widest text-xs transition-all" >Cancel</button>
                            <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="flex-1 flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-red-600/20 active:scale-95 transition-all" >
                                {createMutation.isPending || updateMutation.isPending ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
                                {editingId ? 'Push Updates' : 'Schedule Flight'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default FlightManager;
