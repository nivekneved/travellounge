import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';
import { toast } from 'react-hot-toast';
import {
    Plane,
    Plus,
    Search,
    Edit2,
    Trash2,
    Calendar,
    Clock,
    MapPin,
    DollarSign,
    X,
    LayoutGrid,
    List as ListIcon
} from 'lucide-react';
import { format } from 'date-fns';
import ViewToggle from '../components/ViewToggle';

const FlightManager = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [view, setView] = useState('list'); // 'list' | 'grid'

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

    // Fetch Flights
    const { data: flights, isLoading, isError, error: queryError } = useQuery({
        queryKey: ['flights'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('flights')
                .select('*')
                .order('departure_time', { ascending: true });
            if (error) throw error;
            return data;
        }
    });

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
            setIsModalOpen(false);
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
            setIsModalOpen(false);
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
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this flight?')) {
            deleteMutation.mutate(id);
        }
    };

    const filteredFlights = flights?.filter(flight => {
        const matchesSearch =
            flight.airline.toLowerCase().includes(searchTerm.toLowerCase()) ||
            flight.flight_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            flight.departure_city.toLowerCase().includes(searchTerm.toLowerCase()) ||
            flight.arrival_city.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = filterStatus === 'all' || flight.status === filterStatus;

        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-gray-900">Flight Management</h1>
                    <p className="text-gray-500 mt-1">Manage schedules, pricing, and availability</p>
                </div>

                <div className="flex items-center gap-3">
                    <ViewToggle view={view} onViewChange={setView} />
                    <button
                        onClick={() => { resetForm(); setIsModalOpen(true); }}
                        className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-primary/30 active:scale-95"
                    >
                        <Plus size={20} /> Add Flight
                    </button>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 w-full md:max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search flights..."
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <button
                        onClick={() => setFilterStatus('all')}
                        className={`px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${filterStatus === 'all' ? 'bg-primary-50 text-primary-600' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        All Flights
                    </button>
                    <button
                        onClick={() => setFilterStatus('active')}
                        className={`px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${filterStatus === 'active' ? 'bg-green-50 text-green-600' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        Active
                    </button>
                    <button
                        onClick={() => setFilterStatus('sold_out')}
                        className={`px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${filterStatus === 'sold_out' ? 'bg-red-50 text-red-600' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        Sold Out
                    </button>
                </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            ) : (
                <>
                    {view === 'list' ? (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50/50 border-b border-gray-100">
                                            <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Airline & Flight</th>
                                            <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Route</th>
                                            <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Schedule</th>
                                            <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Price</th>
                                            <th className="text-center py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                            <th className="text-right py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredFlights?.map((flight) => (
                                            <tr key={flight.id} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 overflow-hidden">
                                                            {flight.logo_url ? <img src={flight.logo_url} alt="logo" className="w-full h-full object-cover" /> : <Plane size={20} />}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900">{flight.airline}</div>
                                                            <div className="text-xs text-gray-500 font-mono">{flight.flight_number}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <span className="font-medium text-gray-700">{flight.departure_city}</span>
                                                        <div className="w-4 h-[1px] bg-gray-300"></div>
                                                        <span className="font-medium text-gray-700">{flight.arrival_city}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-xs text-gray-600">
                                                            <Calendar size={12} />
                                                            {format(new Date(flight.departure_time), 'MMM d, yyyy')}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                                            <Clock size={12} />
                                                            {format(new Date(flight.departure_time), 'HH:mm')} - {format(new Date(flight.arrival_time), 'HH:mm')}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="font-bold text-gray-900">${flight.price}</div>
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                ${flight.status === 'active' ? 'bg-green-50 text-green-700' :
                                                            flight.status === 'sold_out' ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                                                        {flight.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleEdit(flight)}
                                                            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(flight.id)}
                                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredFlights?.length === 0 && (
                                            <tr>
                                                <td colSpan="6" className="py-12 text-center text-gray-500">
                                                    No flights found matching your criteria.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredFlights?.map((flight) => (
                                <div key={flight.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow overflow-hidden group">
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
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize
                                                ${flight.status === 'active' ? 'bg-green-50 text-green-700' :
                                                    flight.status === 'sold_out' ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
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
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(flight)}
                                                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(flight.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 px-6 py-3 flex items-center gap-4 text-xs text-gray-500">
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
                            {filteredFlights?.length === 0 && (
                                <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-2xl border border-dashed border-gray-200">
                                    No flights found matching your criteria.
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingId ? 'Edit Flight' : 'New Flight'}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Airline</label>
                                    <input
                                        type="text" required
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        placeholder="e.g. Emirates"
                                        value={formData.airline}
                                        onChange={(e) => setFormData({ ...formData, airline: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Flight Number</label>
                                    <input
                                        type="text" required
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        placeholder="e.g. EK702"
                                        value={formData.flight_number}
                                        onChange={(e) => setFormData({ ...formData, flight_number: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Departure City</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-3.5 text-gray-400" size={18} />
                                        <input
                                            type="text" required
                                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                            placeholder="Origin"
                                            value={formData.departure_city}
                                            onChange={(e) => setFormData({ ...formData, departure_city: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Arrival City</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-3.5 text-gray-400" size={18} />
                                        <input
                                            type="text" required
                                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                            placeholder="Destination"
                                            value={formData.arrival_city}
                                            onChange={(e) => setFormData({ ...formData, arrival_city: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Departure Time</label>
                                    <input
                                        type="datetime-local" required
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        value={formData.departure_time}
                                        onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Arrival Time</label>
                                    <input
                                        type="datetime-local" required
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        value={formData.arrival_time}
                                        onChange={(e) => setFormData({ ...formData, arrival_time: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Price (USD)</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-4 top-3.5 text-gray-400" size={18} />
                                        <input
                                            type="number" required min="0"
                                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                            placeholder="0.00"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Status</label>
                                    <select
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="active">Active</option>
                                        <option value="drafted">Drafted</option>
                                        <option value="sold_out">Sold Out</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createMutation.isPending || updateMutation.isPending}
                                    className="flex-1 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-primary/30"
                                >
                                    {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Flight'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FlightManager;
