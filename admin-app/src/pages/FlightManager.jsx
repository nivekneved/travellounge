/* eslint-disable unused-imports/no-unused-vars */
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';
import { toast } from 'react-hot-toast';
import {
    Plane,
    Calendar,
    Clock,
    Edit2,
    Trash2,
    ChevronLeft,
    ChevronRight,
    TrendingUp,
    Zap,
    Monitor,
    Smartphone
} from 'lucide-react';
import { format } from 'date-fns';
import ManagerLayout from '../components/ManagerLayout';

const PAGE_SIZE = 10;

const FlightManager = () => {
    const queryClient = useQueryClient();
    const [view, setView] = useState('list'); // 'list' | 'grid' | 'edit'
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [previewMode, setPreviewMode] = useState('desktop');
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
    const { data: queryData, isLoading, isError } = useQuery({
        queryKey: ['flights', page, sortConfig, filterStatus, searchTerm],
        queryFn: async () => {
            let query = supabase
                .from('flights')
                .select('*', { count: 'exact' });

            if (filterStatus !== 'all') {
                query = query.eq('status', filterStatus);
            }

            if (searchTerm) {
                query = query.or(`airline.ilike.%${searchTerm}%,flight_number.ilike.%${searchTerm}%,departure_city.ilike.%${searchTerm}%,arrival_city.ilike.%${searchTerm}%`);
            }

            const { data, count, error } = await query
                .order(sortConfig.key, { ascending: sortConfig.direction === 'asc' })
                .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

            if (error) throw error;
            return { flights: data, count };
        }
    });

    const flights = queryData?.flights || [];
    const totalCount = queryData?.count || 0;
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    // Mutations
    const createMutation = useMutation({
        mutationFn: async (newFlight) => {
            const { data, error } = await supabase.from('flights').insert([newFlight]).select();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['flights']);
            toast.success('Flight added successfully');
            resetForm();
        },
        onError: (error) => toast.error(`Error: ${error.message}`)
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, updates }) => {
            const { data, error } = await supabase.from('flights').update(updates).eq('id', id).select();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['flights']);
            toast.success('Flight updated successfully');
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
        setView('list');
    };

    const handleEdit = (flight) => {
        setFormData(flight);
        setEditingId(flight.id);
        setView('edit');
    };

    const stats = [
        { label: 'Total Routes', value: totalCount, icon: Plane, color: 'text-red-600', bg: 'bg-red-50' },
        { label: 'Active Flights', value: totalCount, icon: Zap, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Service Level', value: '100%', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' }
    ];

    const columns = [
        { header: 'Carrier Partner' },
        { header: 'Route Path' },
        { header: 'Departure Time' },
        { header: 'Standard Tariff' },
        { header: 'Availability', align: 'center' },
        { header: 'Management', align: 'right' }
    ];

    return (
        <ManagerLayout
            title="Flight Hub"
            subtitle="Manage global routes, airline partners, and live scheduling"
            icon={Plane}
            stats={stats}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            searchPlaceholder="Search by Airline, City, or Flight Number..."
            onAdd={() => { resetForm(); setView('edit'); }}
            addLabel="Schedule Flight"
            view={view}
            setView={setView}
            editingId={editingId}
            onSubmit={() => editingId ? updateMutation.mutate({ id: editingId, updates: formData }) : createMutation.mutate(formData)}
            isSaving={createMutation.isLoading || updateMutation.isLoading}
            isLoading={isLoading}
            columns={columns}
            data={flights}
            renderRow={(flight) => (
                <tr key={flight.id} className="transition-all hover:bg-slate-50 group align-middle">
                    <td className="py-8 px-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 overflow-hidden shrink-0 border border-slate-100 group-hover:scale-110 transition-all duration-500 shadow-sm">
                                {flight.logo_url ? <img src={flight.logo_url} alt="" className="w-full h-full object-cover" /> : <Plane size={20} />}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="font-black text-slate-900 truncate text-base uppercase tracking-tight">{flight.airline}</span>
                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mt-1">{flight.flight_number}</span>
                            </div>
                        </div>
                    </td>
                    <td className="py-8 px-8">
                        <div className="flex items-center gap-3 text-[11px] font-black text-slate-600 uppercase tracking-tight">
                            <span className="truncate">{flight.departure_city}</span>
                            <div className="w-4 h-[1.5px] bg-red-200 shrink-0"></div>
                            <span className="truncate">{flight.arrival_city}</span>
                        </div>
                    </td>
                    <td className="py-8 px-8">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-[10px] text-slate-900 font-black uppercase tracking-widest">
                                <Calendar size={14} className="text-red-500" />
                                <span>{flight.departure_time ? format(new Date(flight.departure_time), 'MMM d, yyyy') : 'TBA'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold tracking-tight">
                                <Clock size={14} />
                                <span>{flight.departure_time ? format(new Date(flight.departure_time), 'HH:mm') : 'TBA'} Departure</span>
                            </div>
                        </div>
                    </td>
                    <td className="py-8 px-8">
                        <div className="text-red-600 font-black tracking-tighter text-lg uppercase">${flight.price}</div>
                    </td>
                    <td className="py-8 px-8 text-center">
                        <span className={`inline-flex items-center px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${flight.status === 'active' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                            <span className={`w-1 h-1 rounded-full mr-1.5 ${flight.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            {flight.status.replace('_', ' ')}
                        </span>
                    </td>
                    <td className="py-8 px-8 text-right">
                        <div className="flex items-center justify-end gap-2 transition-all duration-300">
                            <button onClick={() => handleEdit(flight)} className="p-3 bg-white text-blue-600 hover:bg-blue-600 hover:text-white rounded-2xl transition-all shadow-premium border border-blue-50" title="Edit Flight"><Edit2 size={16} /></button>
                            <button onClick={() => { if (window.confirm('Delete this flight?')) deleteMutation.mutate(flight.id); }} className="p-3 bg-white text-red-600 hover:bg-red-600 hover:text-white rounded-2xl transition-all shadow-premium border border-red-50" title="Delete"><Trash2 size={16} /></button>
                        </div>
                    </td>
                </tr>
            )}
            renderGrid={() => (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                    {flights.map((flight) => (
                        <div key={flight.id} className="bg-white rounded-[2.5rem] border border-gray-100 p-8 flex flex-col group relative hover:shadow-2xl hover:border-red-100 transition-all duration-500">
                            <div className="flex justify-between items-start mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-[2rem] bg-slate-50 flex items-center justify-center text-red-600 border border-slate-100 group-hover:scale-110 transition-transform overflow-hidden shadow-xl shadow-slate-100">
                                        {flight.logo_url ? <img src={flight.logo_url} alt="" className="w-full h-full object-cover" /> : <Plane size={24} />}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-900 uppercase tracking-tight text-lg leading-tight">{flight.airline}</h3>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{flight.flight_number}</p>
                                    </div>
                                </div>
                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${flight.status === 'active' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                    {flight.status.replace('_', ' ')}
                                </span>
                            </div>

                            <div className="flex items-center justify-between mb-8 px-4">
                                <div className="text-center">
                                    <div className="text-3xl font-black text-slate-900 tracking-tighter ">{flight.departure_city.substring(0, 3).toUpperCase()}</div>
                                    <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1">{flight.departure_time ? format(new Date(flight.departure_time), 'HH:mm') : '--:--'}</div>
                                </div>
                                <div className="flex-1 px-6 flex flex-col items-center">
                                    <Plane size={18} className="text-red-600 mb-2 rotate-90" />
                                    <div className="w-full h-[1.5px] bg-red-100 relative">
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-red-400 shadow-sm animate-pulse"></div>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-black text-slate-900 tracking-tighter ">{flight.arrival_city.substring(0, 3).toUpperCase()}</div>
                                    <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1">{flight.arrival_time ? format(new Date(flight.arrival_time), 'HH:mm') : '--:--'}</div>
                                </div>
                            </div>

                            <div className="mt-auto flex items-center justify-between pt-8 border-t border-slate-50">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Standard Fare</span>
                                    <span className="text-3xl font-black text-red-600 tracking-tighter ">${flight.price}</span>
                                </div>
                                <div className="flex items-center gap-2 transition-all duration-300">
                                    <button onClick={() => handleEdit(flight)} className="p-3 bg-white text-blue-600 hover:bg-blue-600 hover:text-white rounded-2xl transition-all shadow-premium border border-blue-50" title="Edit Flight"><Edit2 size={16} /></button>
                                    <button onClick={() => { if (window.confirm('Delete this flight?')) deleteMutation.mutate(flight.id); }} className="p-3 bg-white text-red-600 hover:bg-red-600 hover:text-white rounded-2xl transition-all shadow-premium border border-red-50" title="Delete"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            renderForm={() => (
                <div className="space-y-12">
                    <section className="space-y-8">
                        <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs ">01</div>
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Carrier Logistics</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Airline Partner</label>
                                <input type="text" value={formData.airline} onChange={(e) => setFormData({ ...formData, airline: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-black text-gray-900" placeholder="Air Mauritius" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Flight Identifier</label>
                                <input type="text" value={formData.flight_number} onChange={(e) => setFormData({ ...formData, flight_number: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-black text-gray-900" placeholder="MK 702" />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Carrier Brand Asset (Logo URL)</label>
                                <input type="url" value={formData.logo_url} onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-sm" placeholder="https://..." />
                            </div>
                        </div>
                    </section>
                    <section className="space-y-8">
                        <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs ">02</div>
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Flight Path & Scheduling</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Origin City</label>
                                <input type="text" value={formData.departure_city} onChange={(e) => setFormData({ ...formData, departure_city: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-gray-900 text-sm" placeholder="Mauritius (MRU)" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Arrival Destination</label>
                                <input type="text" value={formData.arrival_city} onChange={(e) => setFormData({ ...formData, arrival_city: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-gray-900 text-sm" placeholder="Paris (CDG)" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 text-red-600">Departure Timestamp</label>
                                <input type="datetime-local" value={formData.departure_time} onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-sm" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 text-green-600">Arrival Timestamp</label>
                                <input type="datetime-local" value={formData.arrival_time} onChange={(e) => setFormData({ ...formData, arrival_time: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-sm" />
                            </div>
                        </div>
                    </section>
                    <section className="space-y-8">
                        <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs ">03</div>
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Tariff & Availability</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Standard Fare (USD)</label>
                                <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-black text-gray-900 text-base" placeholder="890" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Availability Status</label>
                                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-black text-sm" >
                                    <option value="active">Active Sequence</option>
                                    <option value="drafted">Hold Entry</option>
                                    <option value="sold_out">No Inventory</option>
                                </select>
                            </div>
                        </div>
                    </section>
                </div>
            )}
            renderPreview={() => (
                <div className="lg:sticky lg:top-12 h-fit space-y-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ">Visual Proof</h3>
                        <div className="flex p-1 bg-gray-100 rounded-2xl border border-gray-200">
                            <button onClick={() => setPreviewMode('desktop')} className={`px-4 py-2 rounded-xl transition-all ${previewMode === 'desktop' ? 'bg-white text-red-600 shadow-premium border border-gray-200' : 'text-gray-400 hover:text-gray-600'}`}><Monitor size={18} /></button>
                            <button onClick={() => setPreviewMode('mobile')} className={`px-4 py-2 rounded-xl transition-all ${previewMode === 'mobile' ? 'bg-white text-red-600 shadow-premium border border-gray-200' : 'text-gray-400 hover:text-gray-600'}`}><Smartphone size={18} /></button>
                        </div>
                    </div>

                    <div className={`relative mx-auto bg-slate-900 shadow-[0_48px_96px_-12px_rgba(0,0,0,0.3)] overflow-hidden transition-all duration-700 border-8 border-slate-900 flex items-center justify-center p-12
                        ${previewMode === 'desktop' ? 'w-full aspect-[4/3] rounded-[48px]' : 'w-[320px] h-[640px] rounded-[64px]'}`}>

                        <div className="w-full max-w-sm bg-white rounded-[40px] overflow-hidden shadow-2xl relative">
                            <div className="bg-red-600 p-8 text-white">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-red-600">
                                        {formData.logo_url ? <img src={formData.logo_url} className="w-full h-full object-cover rounded-xl" /> : <Plane size={24} />}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[8px] font-black uppercase tracking-widest opacity-60">Flight Ticket</p>
                                        <h4 className="text-sm font-black uppercase tracking-tight">{formData.flight_number || 'MK ---'}</h4>
                                    </div>
                                </div>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <h3 className="text-4xl font-black tracking-tighter">{formData.departure_city?.substring(0, 3).toUpperCase() || 'MRU'}</h3>
                                        <p className="text-[10px] font-bold opacity-80">{formData.departure_time ? format(new Date(formData.departure_time), 'HH:mm') : '--:--'}</p>
                                    </div>
                                    <div className="flex-1 px-4 flex flex-col items-center pb-2">
                                        <Plane size={16} className="mb-2 rotate-90" />
                                        <div className="w-full h-[1.5px] bg-white/20 relative">
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-sm"></div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <h3 className="text-4xl font-black tracking-tighter">{formData.arrival_city?.substring(0, 3).toUpperCase() || 'CDG'}</h3>
                                        <p className="text-[10px] font-bold opacity-80">{formData.arrival_time ? format(new Date(formData.arrival_time), 'HH:mm') : '--:--'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-8 border-t border-dashed border-slate-100 relative">
                                <div className="absolute -top-3 -left-3 w-6 h-6 bg-slate-900 rounded-full"></div>
                                <div className="absolute -top-3 -right-3 w-6 h-6 bg-slate-900 rounded-full"></div>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Reservation Status</p>
                                        <p className={`text-[10px] font-black uppercase ${formData.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>● {formData.status.replace('_', ' ')}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Fare (USD)</p>
                                        <p className="text-2xl font-black text-slate-900 tracking-tight">${formData.price || '0'}</p>
                                    </div>
                                </div>
                                <div className="mt-8 flex gap-2">
                                    {[...Array(20)].map((_, i) => <div key={i} className="flex-1 h-8 bg-slate-50 rounded-sm"></div>)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            paginationRow={
                <div className="p-8 bg-slate-50/50 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ">Synchronized Registry: {page * PAGE_SIZE + 1} - {Math.min((page + 1) * PAGE_SIZE, totalCount)} of {totalCount} Lines</p>
                    <div className="flex gap-3">
                        <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                            className="p-3 bg-white border border-gray-100 rounded-2xl text-slate-400 hover:text-red-600 disabled:opacity-20 transition-all shadow-sm"><ChevronLeft size={20} /></button>
                        <div className="flex gap-2 items-center">
                            {[...Array(totalPages)].map((_, i) => (
                                <button key={i} onClick={() => setPage(i)} className={`w-10 h-10 rounded-2xl text-[10px] font-black transition-all ${page === i ? 'bg-red-600 text-white shadow-xl shadow-red-600/20' : 'bg-white text-slate-400 hover:bg-slate-50 border border-gray-100'}`}>{i + 1}</button>
                            ))}
                        </div>
                        <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
                            className="p-3 bg-white border border-gray-100 rounded-2xl text-slate-400 hover:text-red-600 disabled:opacity-20 transition-all shadow-sm"><ChevronRight size={20} /></button>
                    </div>
                </div>
            }
        />
    );
};

export default FlightManager;
