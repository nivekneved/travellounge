import React, { useState, useMemo } from 'react';
import { useEntityManager } from '../hooks/useEntityManager';
import ManagerLayout from '../components/ManagerLayout';
import { supabase } from '../utils/supabase';
import {
    Calendar, Phone, Mail, CheckCircle, XCircle,
    Clock, Users, Eye, Search, ArrowUpDown,
    TrendingUp, CheckSquare, Tag, Trash2,
    Plus, Edit2, Save, X, Filter, MoreVertical
} from 'lucide-react';
import { format } from 'date-fns';

const BookingManager = () => {
    const [view, setView] = useState('list');
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [productImage, setProductImage] = useState(null);

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

    const [formData, setFormData] = useState(initialFormState);

    const {
        data: bookings,
        isLoading,
        save,
        deleteMutation,
        isSaving
    } = useEntityManager('bookings', {
        orderColumn: 'created_at',
        ascending: false,
        onSaveSuccess: () => resetForm()
    });

    const resetForm = () => {
        setFormData(initialFormState);
        setEditingId(null);
        setProductImage(null);
        setView('list');
    };

    const handleEdit = async (booking) => {
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
        setEditingId(booking.id);
        setView('edit');

        // Fetch Product Image
        if (booking.service_id) {
            try {
                const { data } = await supabase
                    .from('services')
                    .select('images')
                    .eq('id', booking.service_id)
                    .single();

                if (data?.images?.length > 0) {
                    setProductImage(data.images[0]);
                } else {
                    setProductImage(null);
                }
            } catch (err) {
                console.error("Error fetching service image:", err);
                setProductImage(null);
            }
        } else {
            setProductImage(null);
        }
    };

    const handleSave = () => {
        const payload = {
            status: formData.status,
            total_price: Number(formData.total_price),
            service_id: formData.service_id || null,
            service_type: formData.service_type || 'custom',
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
        save(editingId, payload);
    };

    const filteredBookings = useMemo(() => {
        return bookings.filter(b => {
            const searchStr = searchTerm.toLowerCase();
            return (
                b.customer_info?.name?.toLowerCase().includes(searchStr) ||
                b.customer_info?.email?.toLowerCase().includes(searchStr) ||
                b.booking_details?.service_name?.toLowerCase().includes(searchStr)
            );
        });
    }, [bookings, searchTerm]);

    const stats = [
        { label: 'Pending Requests', value: bookings.filter(b => b.status === 'pending').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Confirmed Trips', value: bookings.filter(b => b.status === 'confirmed').length, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Total Volume', value: bookings.length, icon: TrendingUp, color: 'text-slate-900', bg: 'bg-slate-50' }
    ];

    const getStatusStyles = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
            case 'confirmed': return 'bg-green-50 text-green-700 border-green-100';
            case 'rejected': return 'bg-red-50 text-red-700 border-red-100';
            case 'cancelled': return 'bg-gray-100 text-gray-500 border-gray-200';
            default: return 'bg-gray-50 text-gray-400 border-gray-100';
        }
    };

    const columns = [
        { header: 'Client Identity' },
        { header: 'Trip Definition' },
        { header: 'Status', align: 'center' },
        { header: 'Request Date', align: 'center' },
        { header: 'Actions', align: 'right' }
    ];

    return (
        <ManagerLayout
            title="Reservation Desk"
            subtitle="Client Inquiry & Booking Command Centre"
            icon={Calendar}
            stats={stats}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            searchPlaceholder="Search by client name, email or trip..."
            onAdd={() => { resetForm(); setView('edit'); }}
            addLabel="Manual Reservation"
            view={view}
            setView={setView}
            editingId={editingId}
            onSubmit={handleSave}
            isSaving={isSaving}
            isLoading={isLoading}
            columns={columns}
            data={filteredBookings}
            renderRow={(booking) => (
                <tr key={booking.id} className="transition-all hover:bg-slate-50 group align-middle">
                    <td className="py-6 px-8">
                        <div className="flex flex-col">
                            <span className="font-black text-slate-900 text-sm uppercase tracking-tight">{booking.customer_info?.name || 'Anonymous Client'}</span>
                            <div className="flex flex-col gap-0.5 mt-1 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                <span className="flex items-center gap-2"><Mail size={10} /> {booking.customer_info?.email || 'N/A'}</span>
                                <span className="flex items-center gap-2"><Phone size={10} /> {booking.customer_info?.phone || 'N/A'}</span>
                            </div>
                        </div>
                    </td>
                    <td className="py-6 px-8">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-black text-red-600 uppercase tracking-wider">{booking.booking_details?.service_name || 'Custom Package'}</span>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded border border-slate-100 flex items-center gap-1">
                                    <Users size={10} /> {booking.booking_details?.travelers || 1} PAX
                                </span>
                                <span className="text-[10px] font-black text-slate-900 uppercase">MUR {booking.total_price?.toLocaleString()}</span>
                            </div>
                        </div>
                    </td>
                    <td className="py-6 px-8 text-center">
                        <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${getStatusStyles(booking.status)}`}>
                            {booking.status}
                        </span>
                    </td>
                    <td className="py-6 px-8 text-center">
                        <div className="flex flex-col items-center gap-0.5">
                            <span className="text-xs font-black text-slate-900">{format(new Date(booking.created_at), 'dd MMM yyyy')}</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{format(new Date(booking.created_at), 'HH:mm')}</span>
                        </div>
                    </td>
                    <td className="py-6 px-8 text-right">
                        <div className="flex items-center justify-end gap-2 transition-all duration-300">
                            <button onClick={() => handleEdit(booking)} className="p-2.5 bg-white text-slate-900 border border-slate-100 hover:bg-slate-950 hover:text-white rounded-xl transition-all shadow-premium-sm" title="Review Inquiry"><Eye size={16} /></button>
                            <button onClick={() => { if (window.confirm('Remove this reservation from ledger?')) deleteMutation.mutate(booking.id); }} className="p-2.5 bg-white text-red-600 border border-slate-100 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-premium-sm" title="Delete"><Trash2 size={16} /></button>
                        </div>
                    </td>
                </tr>
            )}
            renderForm={() => (
                <div className="space-y-12">
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs ">01</div>
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Client Information</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2 col-span-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                                <input type="text" value={formData.customer_name} onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-slate-500/10 outline-none transition-all font-black text-gray-900 uppercase" placeholder="Client Name" />
                            </div>
                            <div className="space-y-2 col-span-2 md:col-span-1">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                                <input type="email" value={formData.customer_email} onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl outline-none font-bold text-sm" placeholder="client@example.com" />
                            </div>
                            <div className="space-y-2 col-span-2 md:col-span-1">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Phone Number</label>
                                <input type="text" value={formData.customer_phone} onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl outline-none font-bold text-sm" placeholder="+230 ..." />
                            </div>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs ">02</div>
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Booking Details</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2 col-span-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Service / Package</label>
                                <input type="text" value={formData.service_name} onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl font-black text-red-600 uppercase" placeholder="Service Name" />
                            </div>
                            <div className="space-y-2 col-span-2 md:col-span-1">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Travelers</label>
                                <input type="number" value={formData.travelers} onChange={(e) => setFormData({ ...formData, travelers: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl outline-none font-black" />
                            </div>
                            <div className="space-y-2 col-span-2 md:col-span-1">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Total Quote (MUR)</label>
                                <input type="number" value={formData.total_price} onChange={(e) => setFormData({ ...formData, total_price: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-slate-900 text-white border border-slate-900 rounded-2xl outline-none font-black" />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Status</label>
                                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl font-black uppercase text-xs tracking-widest">
                                    <option value="pending">Pending Review</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div className="space-y-2 col-span-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Client Message / Notes</label>
                                <textarea rows={4} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-3xl outline-none text-slate-600 font-medium text-sm resize-none" />
                            </div>
                        </div>
                    </section>
                </div>
            )}
            renderPreview={() => (
                <div className="bg-slate-900 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden flex items-center justify-center min-h-[500px]">
                    <div className="absolute inset-0 opacity-20">
                        <img src={productImage || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200'} className="w-full h-full object-cover blur-xl scale-110" alt="" />
                    </div>

                    <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-500">
                        {/* Image Section */}
                        <div className="relative aspect-[16/10]">
                            <img src={productImage || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800'} className="w-full h-full object-cover" alt="" />
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full shadow-premium-sm">
                                <span className={`text-[9px] font-black uppercase tracking-widest ${formData.status === 'confirmed' ? 'text-green-600' : formData.status === 'pending' ? 'text-amber-500' : 'text-slate-400'}`}>
                                    {formData.status}
                                </span>
                            </div>
                        </div>

                        <div className="p-8 space-y-6">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{formData.service_type || 'Bespoke Package'}</p>
                                <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-tight">{formData.service_name || 'Destination Inquiry'}</h4>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pb-6 border-b border-slate-100">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lead Traveler</p>
                                    <p className="text-xs font-black text-slate-900 uppercase truncate">{formData.customer_name || 'Client Name'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Party Size</p>
                                    <p className="text-xs font-black text-slate-900 uppercase">{formData.travelers} Guests</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quoted Payload</p>
                                    <p className="text-lg font-black text-slate-950 uppercase">MUR {Number(formData.total_price).toLocaleString()}</p>
                                </div>
                                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100 italic font-serif">
                                    TL
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            previewTitle="Reservation Visual Proof"
            previewDescription="Simulated boarding pass and itinerary visualization as seen by the customer and ops team."
        />
    );
};

export default BookingManager;
