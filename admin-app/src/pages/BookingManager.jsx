import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { Calendar, Phone, Mail, CheckCircle, XCircle, Clock, Users, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';

const BookingManager = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('bookings')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setBookings(data || []);
        } catch (error) {
            toast.error(`Failed to load bookings: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            const { error } = await supabase
                .from('bookings')
                .update({ status })
                .eq('id', id);

            if (error) throw error;

            toast.success(`Booking ${status}`);
            fetchBookings();
            if (selectedBooking && selectedBooking.id === id) {
                setSelectedBooking({ ...selectedBooking, status });
            }
        } catch (error) {
            toast.error(`Error updating status: ${error.message}`);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-700',
            confirmed: 'bg-green-100 text-green-700',
            rejected: 'bg-red-100 text-red-700',
            cancelled: 'bg-gray-100 text-gray-700'
        };
        return <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${styles[status] || 'bg-gray-100'}`}>{status}</span>;
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Booking Requests</h1>
                <p className="text-gray-500">Review and manage customer booking inquiries.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {bookings.map((booking) => (
                    <div key={booking.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-md transition-shadow">
                        <div className="flex-grow space-y-3">
                            <div className="flex items-center gap-3">
                                <h3 className="text-xl font-bold text-gray-900">{booking.customer_info?.name || 'Unknown'}</h3>
                                {getStatusBadge(booking.status)}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-500">
                                <div className="flex items-center gap-2"><Mail size={16} /> {booking.customer_info?.email}</div>
                                <div className="flex items-center gap-2"><Phone size={16} /> {booking.customer_info?.phone}</div>
                                <div className="flex items-center gap-2 text-primary font-medium"><Calendar size={16} /> {booking.service_details?.name || 'Custom Package'}</div>
                                <div className="flex items-center gap-2"><Clock size={16} /> Req: {new Date(booking.created_at).toLocaleDateString()}</div>
                            </div>
                        </div>

                        <div className="flex gap-2 shrink-0">
                            <button
                                onClick={() => setSelectedBooking(booking)}
                                className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                                title="View Details"
                            >
                                <Eye size={22} />
                            </button>

                            {booking.status === 'pending' && (
                                <>
                                    <button onClick={() => updateStatus(booking.id, 'confirmed')} className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors" title="Confirm">
                                        <CheckCircle size={22} />
                                    </button>
                                    <button onClick={() => updateStatus(booking.id, 'rejected')} className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors" title="Reject">
                                        <XCircle size={22} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}

                {bookings.length === 0 && !loading && (
                    <div className="p-20 text-center text-gray-400 italic">No bookings found.</div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedBooking(null)}>
                    <div className="bg-white w-full max-w-2xl rounded-3xl p-8 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setSelectedBooking(null)}
                            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
                        >
                            <XCircle size={24} className="text-gray-400" />
                        </button>

                        <div className="mb-6 border-b pb-4">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Details</h2>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-500">ID: #{selectedBooking.id}</span>
                                {getStatusBadge(selectedBooking.status)}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div>
                                <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-wider text-xs">Customer Info</h3>
                                <div className="space-y-3">
                                    <p className="flex items-center gap-3 text-gray-600"><span className="font-medium text-gray-900">Name:</span> {selectedBooking.customer_info?.name}</p>
                                    <p className="flex items-center gap-3 text-gray-600"><span className="font-medium text-gray-900">Email:</span> {selectedBooking.customer_info?.email}</p>
                                    <p className="flex items-center gap-3 text-gray-600"><span className="font-medium text-gray-900">Phone:</span> {selectedBooking.customer_info?.phone}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-wider text-xs">Trip Details</h3>
                                <div className="space-y-3">
                                    <p className="flex items-center gap-3 text-gray-600">
                                        <span className="font-medium text-gray-900">Package:</span>
                                        {selectedBooking.service_details?.name || 'Custom Request'}
                                    </p>
                                    <p className="flex items-center gap-3 text-gray-600">
                                        <span className="font-medium text-gray-900">Dates:</span>
                                        {selectedBooking.service_details?.checkIn} to {selectedBooking.service_details?.checkOut}
                                    </p>
                                    <p className="flex items-center gap-3 text-gray-600">
                                        <span className="font-medium text-gray-900">Travelers:</span>
                                        <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold text-xs">
                                            <Users size={12} /> {selectedBooking.service_details?.travelers || 'N/A'}
                                        </span>
                                    </p>
                                    <p className="flex items-center gap-3 text-gray-600">
                                        <span className="font-medium text-gray-900">Total Price:</span>
                                        {selectedBooking.total_price ? `Rs ${selectedBooking.total_price.toLocaleString()}` : 'TBD'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 mb-8">
                            <h3 className="font-bold text-gray-900 mb-3 uppercase tracking-wider text-xs">Special Requests / Message</h3>
                            <p className="text-gray-700 italic">"{selectedBooking.service_details?.message || 'No special requests'}"</p>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button onClick={() => setSelectedBooking(null)} className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors">Close</button>
                            {selectedBooking.status === 'pending' && (
                                <button
                                    onClick={() => {
                                        updateStatus(selectedBooking.id, 'confirmed');
                                        setSelectedBooking(null);
                                    }}
                                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-600/20 transition-all"
                                >
                                    Confirm Booking
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingManager;
