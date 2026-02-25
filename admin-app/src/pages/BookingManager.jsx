import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';
import { toast } from 'react-hot-toast';
import {
    Calendar,
    Phone,
    Mail,
    CheckCircle,
    XCircle,
    Clock,
    Users,
    Eye,
    Search,
    ArrowUpDown,
    TrendingUp,
    CheckSquare,
    SearchX,
    Tag,
    Trash2,
    Plus,
    Edit2,
    Save,
    X
} from 'lucide-react';
import { format } from 'date-fns';

const initialFormState = {
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    service_id: '',
    service_type: '',
    service_name: '',
    travelers: 1,
    checkIn: '',
    checkOut: '',
    total_price: 0,
    status: 'pending',
    message: ''
};

const BookingManager = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(initialFormState);
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
    const queryClient = useQueryClient();

    const [page, setPage] = useState(0);
    const PAGE_SIZE = 50;

    // Fetch bookings
    const { data: bookings = [], isLoading, isError, error: queryError } = useQuery({
        queryKey: ['bookings', page],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('bookings')
                .select('*')
                .order('created_at', { ascending: false })
                .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

            if (error) throw error;
            return data;
        }
    });

    // Fetch products for dropdown
    const { data: products = [] } = useQuery({
        queryKey: ['activeProducts'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('services')
                .select('id, name, category')
                .eq('draft', false);
            if (error) throw error;
            return data;
        }
    });

    const filteredAndSortedBookings = bookings.filter(b => {
        const searchStr = searchTerm.toLowerCase();
        return (
            b.customer_info?.name?.toLowerCase().includes(searchStr) ||
            b.customer_info?.email?.toLowerCase().includes(searchStr) ||
            b.booking_details?.service_name?.toLowerCase().includes(searchStr)
        );
    }).sort((a, b) => {
        const key = sortConfig.key;
        let valA = a[key];
        let valB = b[key];

        if (key === 'customer_name') {
            valA = a.customer_info?.name || '';
            valB = b.customer_info?.name || '';
        }

        if (typeof valA === 'string' && typeof valB === 'string') {
            return sortConfig.direction === 'asc'
                ? valA.localeCompare(valB)
                : valB.localeCompare(valA);
        }

        return sortConfig.direction === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });

    React.useEffect(() => {
        if (isError && queryError) {
            toast.error(`Failed to load bookings: ${queryError.message}`);
        }
    }, [isError, queryError]);

    // Mutations
    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }) => {
            const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['bookings']);
            toast.success('Status updated successfully');
        },
        onError: (error) => toast.error(`Error: ${error.message}`)
    });

    const createMutation = useMutation({
        mutationFn: async (newBooking) => {
            const { error } = await supabase.from('bookings').insert([newBooking]);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['bookings']);
            toast.success('Reservation created successfully');
            closeForm();
        },
        onError: (error) => toast.error(`Error: ${error.message}`)
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, updates }) => {
            const { error } = await supabase.from('bookings').update(updates).eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['bookings']);
            toast.success('Reservation updated successfully');
            closeForm();
        },
        onError: (error) => toast.error(`Error: ${error.message}`)
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase.from('bookings').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['bookings']);
            toast.success('Booking removed');
            if (selectedBooking) closeForm();
        },
        onError: (error) => toast.error(`Error: ${error.message}`)
    });

    const getStatusStyles = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
            case 'confirmed': return 'bg-green-50 text-green-700 border-green-100';
            case 'rejected': return 'bg-red-50 text-red-700 border-red-100';
            case 'cancelled': return 'bg-gray-50 text-gray-500 border-gray-100';
            default: return 'bg-gray-50 text-gray-500 border-gray-100';
        }
    };

    const handleOpenCreate = () => {
        setSelectedBooking(null);
        setFormData(initialFormState);
        setIsEditing(true);
    };

    const handleOpenEdit = (booking) => {
        setSelectedBooking(booking);
        setFormData({
            customer_name: booking.customer_info?.name || '',
            customer_email: booking.customer_info?.email || '',
            customer_phone: booking.customer_info?.phone || '',
            service_id: booking.service_id || '',
            service_type: booking.service_type || '',
            service_name: booking.booking_details?.service_name || '',
            travelers: booking.booking_details?.travelers || 1,
            checkIn: booking.booking_details?.checkIn || '',
            checkOut: booking.booking_details?.checkOut || '',
            total_price: booking.total_price || 0,
            status: booking.status || 'pending',
            message: booking.booking_details?.message || ''
        });
        setIsEditing(true);
    };

    const closeForm = () => {
        setIsEditing(false);
        setSelectedBooking(null);
    };

    const handleSave = (e) => {
        e.preventDefault();

        const selectedProd = products.find(p => p.name === formData.service_name);

        const bookingPayload = {
            status: formData.status,
            total_price: Number(formData.total_price),
            service_id: selectedProd?.id || formData.service_id || null,
            service_type: selectedProd?.category || formData.service_type || 'custom',
            customer_info: {
                name: formData.customer_name,
                email: formData.customer_email,
                phone: formData.customer_phone
            },
            booking_details: {
                service_name: formData.service_name,
                travelers: Number(formData.travelers),
                checkIn: formData.checkIn,
                checkOut: formData.checkOut,
                message: formData.message
            }
        };

        if (selectedBooking && isEditing) {
            updateMutation.mutate({ id: selectedBooking.id, updates: bookingPayload });
        } else {
            createMutation.mutate(bookingPayload);
        }
    };

    if (isLoading) {
        return <div className="flex items-center justify-center py-20 animate-pulse text-red-500 font-black uppercase tracking-widest text-[10px]">Processing Reservation Ledger...</div>;
    }

    return (
        <div className="space-y-8">
            {!selectedBooking && !isEditing && (
                <>
                    {/* Header & Controls */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight ">Reservation Desk</h1>
                            <p className="text-gray-500 font-medium">Monitor incoming requests, verify client details, and manage trip status</p>
                        </div>

                        <div className="flex items-center gap-4 text-gray-400 bg-gray-50 px-5 py-3 rounded-xl border border-gray-100">
                            <span className="text-xs font-black uppercase tracking-widest" >Live Feed</span>
                            <button
                                onClick={handleOpenCreate}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 ml-4 font-black text-[10px] tracking-widest"
                            >
                                <Plus size={14} /> NEW RESERVATION
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 group hover:border-red-100 transition-colors">
                            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
                                <TrendingUp size={28} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest" >Active Inquiries</p>
                                <h3 className="text-3xl font-black text-gray-900" >{bookings.filter(b => b.status === 'pending').length}</h3>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 group hover:border-red-100 transition-colors">
                            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                                <CheckSquare size={28} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest" >Confirmed</p>
                                <h3 className="text-3xl font-black text-gray-900" >{bookings.filter(b => b.status === 'confirmed').length}</h3>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 group hover:border-red-100 transition-colors">
                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                <Tag size={28} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest" >Total Volume</p>
                                <h3 className="text-3xl font-black text-gray-900" >{bookings.length}</h3>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 border border-gray-100 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative flex-1 max-w-2xl w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search reservations by client name, email or trip..."
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:bg-white focus:border-red-500 outline-none transition-all font-bold text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-4 text-gray-400 bg-gray-50 px-5 py-3 rounded-xl border border-gray-100">
                            <span className="text-xs font-black uppercase tracking-widest" >Global Ledger</span>
                        </div>
                    </div>

                    {/* Standardized Full Width Table */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse table-fixed">
                                <colgroup>
                                    <col className="w-[250px]" />
                                    <col className="w-[300px]" />
                                    <col className="w-[150px]" />
                                    <col className="w-[180px]" />
                                    <col className="w-[180px]" />
                                </colgroup>
                                <thead>
                                    <tr className="border-b border-gray-100 align-middle bg-gray-50/50">
                                        <th
                                            className="py-5 px-6 text-[10px] font-black text-red-600 uppercase tracking-[0.2em] cursor-pointer hover:bg-red-50/50 transition-colors"
                                            onClick={() => setSortConfig({ key: 'customer_name', direction: sortConfig.key === 'customer_name' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
                                        >
                                            <div className="flex items-center gap-2">
                                                Client Identity
                                                <ArrowUpDown size={12} className={sortConfig.key === 'customer_name' ? 'opacity-100' : 'opacity-20'} />
                                            </div>
                                        </th>
                                        <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]" >Trip Definition</th>
                                        <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center" >Status</th>
                                        <th
                                            className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center cursor-pointer hover:bg-gray-100/50 transition-colors"
                                            onClick={() => setSortConfig({ key: 'created_at', direction: sortConfig.key === 'created_at' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
                                        >
                                            <div className="flex items-center justify-center gap-2">
                                                Request Date
                                                <ArrowUpDown size={12} className={sortConfig.key === 'created_at' ? 'opacity-100' : 'opacity-20'} />
                                            </div>
                                        </th>
                                        <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right" >Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredAndSortedBookings.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="py-24 text-center">
                                                <div className="flex flex-col items-center justify-center gap-4">
                                                    <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-300">
                                                        <SearchX size={40} />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h3 className="text-lg font-black text-gray-900 " >No Reservations Found</h3>
                                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest" >Try broading your search keywords</p>
                                                    </div>
                                                    <button onClick={() => setSearchTerm('')} className="mt-2 text-red-600 font-black text-xs uppercase tracking-[0.2em] hover:tracking-[0.3em] transition-all" >Clear Filters</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredAndSortedBookings.map((booking) => (
                                            <tr key={booking.id} className="transition-all even:bg-gray-50/50 hover:bg-gray-50 align-top group transition-colors">
                                                <td className="py-6 px-6">
                                                    <div className="flex flex-col min-w-0" >
                                                        <span className="font-black text-gray-900 truncate text-sm " >{booking.customer_info?.name || 'Anonymous User'}</span>
                                                        <div className="flex flex-col gap-0.5 mt-1" >
                                                            <span className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1.5" ><Mail size={10} /> {booking.customer_info?.email || 'N/A'}</span>
                                                            <span className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1.5" ><Phone size={10} /> {booking.customer_info?.phone || 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-6 px-6">
                                                    <div className="flex flex-col gap-1" >
                                                        <span className="text-xs font-black text-red-600 uppercase tracking-wider " >{booking.booking_details?.service_name || 'Custom Package Inquiry'}</span>
                                                        <div className="flex items-center gap-2" >
                                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded border border-gray-100 flex items-center gap-1" ><Users size={10} /> {booking.booking_details?.travelers || '1'} PAX</span>
                                                            <span className="text-[10px] font-black text-gray-900 " >Rs {booking.total_price?.toLocaleString() || 'TBD'}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-6 px-6 text-center">
                                                    <div className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${getStatusStyles(booking.status)}`}>
                                                        {booking.status}
                                                    </div>
                                                </td>
                                                <td className="py-6 px-6 text-center">
                                                    <div className="flex flex-col items-center gap-0.5" >
                                                        <span className="text-xs font-black text-gray-900 " >{format(new Date(booking.created_at), 'dd MMM yyyy')}</span>
                                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter" >{format(new Date(booking.created_at), 'HH:mm')}</span>
                                                    </div>
                                                </td>
                                                <td className="py-6 px-6 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button
                                                            onClick={() => setSelectedBooking(booking)}
                                                            className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-blue-100 active:scale-95"
                                                        >
                                                            <Eye size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleOpenEdit(booking)}
                                                            className="p-2.5 text-orange-500 hover:bg-orange-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-orange-100 active:scale-95"
                                                            title="Edit"
                                                        >
                                                            <Edit2 size={18} />
                                                        </button>
                                                        {booking.status === 'pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() => updateStatusMutation.mutate({ id: booking.id, status: 'confirmed' })}
                                                                    className="p-2.5 text-green-600 hover:bg-green-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-green-100 active:scale-95"
                                                                    title="Confirm"
                                                                >
                                                                    <CheckCircle size={18} />
                                                                </button>
                                                                <button
                                                                    onClick={() => updateStatusMutation.mutate({ id: booking.id, status: 'rejected' })}
                                                                    className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-red-100 active:scale-95"
                                                                    title="Reject"
                                                                >
                                                                    <XCircle size={18} />
                                                                </button>
                                                            </>
                                                        )}
                                                        <button
                                                            onClick={() => { if (window.confirm('Remove from ledger?')) deleteMutation.mutate(booking.id); }}
                                                            className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-red-100 active:scale-95"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-gray-100 shadow-sm mt-4">
                        <button
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="px-6 py-2 bg-gray-50 text-gray-600 font-bold rounded-xl disabled:opacity-50 hover:bg-gray-100 transition-colors"
                        >
                            Previous
                        </button>
                        <span className="text-sm font-black text-gray-400 uppercase tracking-widest">Page {page + 1}</span>
                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={bookings.length < PAGE_SIZE}
                            className="px-6 py-2 bg-gray-50 text-gray-600 font-bold rounded-xl disabled:opacity-50 hover:bg-gray-100 transition-colors"
                        >
                            Next
                        </button>
                    </div>

                </>
            )}

            {/* Read-Only Detail View */}
            {
                selectedBooking && !isEditing && (
                    <div className="space-y-8 animate-fade-in w-full pb-20">
                        <div className="bg-white w-full rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden animate-in fade-in duration-300">
                            <div className="h-24 bg-red-600 relative overflow-hidden">
                                <div className="absolute inset-0 opacity-10 flex gap-4 rotate-12 -translate-y-1/2 -translate-x-1/2">
                                    {[...Array(20)].map((_, i) => <Tag key={i} size={40} className="text-white shrink-0" />)}
                                </div>
                                <div className="absolute bottom-6 left-8">
                                    <h2 className="text-2xl font-black text-white tracking-tight">Reservation Detail</h2>
                                </div>
                                <div className="absolute top-6 right-8">
                                    <button onClick={closeForm} className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors">
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>

                            <div className="p-8">
                                <div className="flex justify-between mb-8 pb-8 border-b border-gray-100">
                                    <div className={`inline-flex items-center px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all shadow-sm ${getStatusStyles(selectedBooking.status)}`}>
                                        {selectedBooking.status}
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleOpenEdit(selectedBooking)}
                                            className="px-6 py-2 text-primary font-bold bg-primary/5 rounded-xl hover:bg-primary/10 transition-colors flex items-center gap-2"
                                        >
                                            <Edit2 size={16} /> Edit Booking
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Customer Profile</p>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-red-600"><Users size={20} /></div>
                                                    <span className="font-black text-gray-900 ">{selectedBooking.customer_info?.name}</span>
                                                </div>
                                                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-red-600"><Mail size={20} /></div>
                                                    <span className="font-bold text-gray-600 text-sm">{selectedBooking.customer_info?.email}</span>
                                                </div>
                                                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-red-600"><Phone size={20} /></div>
                                                    <span className="font-bold text-gray-600 text-sm">{selectedBooking.customer_info?.phone}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Itinerary Data</p>
                                            <div className="bg-gray-50 p-5 rounded-[2rem] border border-gray-100 space-y-4">
                                                <div>
                                                    <span className="block text-[9px] font-black text-red-600 uppercase tracking-tighter mb-1">Target Experience</span>
                                                    <span className="block font-black text-gray-900 text-sm ">{selectedBooking.booking_details?.service_name || 'Custom Build'}</span>
                                                </div>
                                                <div className="flex justify-between items-end">
                                                    <div>
                                                        <span className="block text-[9px] font-black text-red-600 uppercase tracking-tighter mb-1">Travel window</span>
                                                        <span className="block font-bold text-gray-600 text-xs ">{selectedBooking.booking_details?.checkIn} - {selectedBooking.booking_details?.checkOut}</span>
                                                    </div>
                                                    <div className="bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100 text-[10px] font-black text-gray-900 flex items-center gap-1.5" >
                                                        <Users size={12} className="text-red-600" /> {selectedBooking.booking_details?.travelers}
                                                    </div>
                                                </div>
                                                <div className="pt-3 border-t border-gray-200 flex justify-between items-center" >
                                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest" >Total Quote</span>
                                                    <span className="text-lg font-black text-gray-900 " >Rs {selectedBooking.total_price?.toLocaleString() || 'TBD'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 mb-8 relative">
                                    <Clock size={40} className="absolute top-4 right-6 text-gray-200/50" />
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Client Directive / Message</h3>
                                    <p className="text-sm font-bold text-gray-700 leading-relaxed">"{selectedBooking.booking_details?.message || 'The user has not provided additional directives for this reservation.'}"</p>
                                </div>

                                <div className="flex justify-end gap-3 p-2 bg-gray-50 rounded-3xl border border-gray-100">
                                    <button onClick={closeForm} className="px-8 py-3.5 text-gray-500 font-black uppercase tracking-widest text-[10px] hover:bg-white rounded-2xl transition-all">Close Viewer</button>
                                    {selectedBooking.status === 'pending' && (
                                        <button
                                            onClick={() => {
                                                updateStatusMutation.mutate({ id: selectedBooking.id, status: 'confirmed' });
                                                setSelectedBooking(null);
                                            }}
                                            className="px-10 py-3.5 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-red-600/20 active:scale-95 transition-all"
                                        >
                                            Authorize Confirmation
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Create/Edit Form View */}
            {
                isEditing && (
                    <div className="space-y-8 animate-fade-in w-full pb-20">
                        <div className="bg-white w-full rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden animate-in fade-in duration-300">
                            <div className="h-24 bg-slate-900 relative overflow-hidden">
                                <div className="absolute inset-0 opacity-10 flex gap-4 rotate-12 -translate-y-1/2 -translate-x-1/2">
                                    {[...Array(20)].map((_, i) => <Tag key={i} size={40} className="text-white shrink-0" />)}
                                </div>
                                <div className="absolute bottom-6 left-8">
                                    <h2 className="text-2xl font-black text-white tracking-tight">
                                        {selectedBooking ? 'Edit Reservation' : 'New Reservation'}
                                    </h2>
                                </div>
                                <div className="absolute top-6 right-8">
                                    <button onClick={closeForm} className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors">
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleSave} className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Customer Details</p>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 mb-1">Full Name</label>
                                                    <input
                                                        type="text" required
                                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                                                        value={formData.customer_name}
                                                        onChange={e => setFormData({ ...formData, customer_name: e.target.value })}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-500 mb-1">Email</label>
                                                        <input
                                                            type="email" required
                                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                                                            value={formData.customer_email}
                                                            onChange={e => setFormData({ ...formData, customer_email: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-500 mb-1">Phone</label>
                                                        <input
                                                            type="text"
                                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                                                            value={formData.customer_phone}
                                                            onChange={e => setFormData({ ...formData, customer_phone: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 mb-1">Status</label>
                                                    <select
                                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                                                        value={formData.status}
                                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="confirmed">Confirmed</option>
                                                        <option value="rejected">Rejected</option>
                                                        <option value="cancelled">Cancelled</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Trip Details</p>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 mb-1">Service / Package</label>
                                                    {/* Can be free text or dropdown if we want to enforce schema */}
                                                    <input
                                                        type="text" required
                                                        list="product-list"
                                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                                                        value={formData.service_name}
                                                        onChange={e => setFormData({ ...formData, service_name: e.target.value })}
                                                        placeholder="Type or select a package..."
                                                    />
                                                    <datalist id="product-list">
                                                        {products.map(p => (
                                                            <option key={p.id} value={p.name} />
                                                        ))}
                                                    </datalist>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-500 mb-1">Check-in</label>
                                                        <input
                                                            type="date"
                                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                                                            value={formData.checkIn}
                                                            onChange={e => setFormData({ ...formData, checkIn: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-500 mb-1">Check-out</label>
                                                        <input
                                                            type="date"
                                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                                                            value={formData.checkOut}
                                                            onChange={e => setFormData({ ...formData, checkOut: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-500 mb-1">Travelers (PAX)</label>
                                                        <input
                                                            type="number" min="1"
                                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                                                            value={formData.travelers}
                                                            onChange={e => setFormData({ ...formData, travelers: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-500 mb-1">Total Price (Override)</label>
                                                        <input
                                                            type="number" step="0.01"
                                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-black text-primary"
                                                            value={formData.total_price}
                                                            onChange={e => setFormData({ ...formData, total_price: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6 mb-8">
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Special Directives / Message</label>
                                    <textarea
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all min-h-[120px]"
                                        value={formData.message}
                                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                                        placeholder="Add any internal notes or requested directives..."
                                    />
                                </div>

                                <div className="flex justify-end gap-4 p-4 bg-gray-50 rounded-3xl border border-gray-100">
                                    <button
                                        type="button"
                                        onClick={closeForm}
                                        className="px-8 py-3.5 text-gray-500 font-black uppercase tracking-widest text-[10px] hover:bg-white rounded-2xl transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={createMutation.isLoading || updateMutation.isLoading}
                                        className="px-10 py-3.5 bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-slate-900/20 active:scale-95 transition-all flex items-center gap-2"
                                    >
                                        <Save size={14} />
                                        {createMutation.isLoading || updateMutation.isLoading ? 'Saving...' : 'Save Reservation'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div>
    );
};

export default BookingManager;
