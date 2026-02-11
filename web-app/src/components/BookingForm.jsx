// Axios removed for Supabase Architecture
import React, { useState, useEffect } from 'react';
import Button from './Button';
import { supabase } from '../utils/supabase';
import { toast } from 'react-hot-toast';
import { AlertCircle } from 'lucide-react';

const BookingForm = ({ serviceId, productName, price, initialCheckIn, initialCheckOut, className, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        checkIn: initialCheckIn || '',
        checkOut: initialCheckOut || '',
        travelers: 1,
        message: '',
        consent: false
    });
    const [status, setStatus] = useState('idle');
    const [availabilityAlert, setAvailabilityAlert] = useState(null);
    const [minStay, setMinStay] = useState(1);

    // Scenario 105: Real-time min-stay guardrail sync
    useEffect(() => {
        if (!serviceId) return; // Skip if no serviceId (e.g. static pages)

        const fetchMinStay = async () => {
            const { data } = await supabase.from('services').select('inventory').eq('id', serviceId).single();
            if (data?.inventory?.minBookingDays) setMinStay(data.inventory.minBookingDays);
        };
        fetchMinStay();

        const productChannel = supabase
            .channel(`min-stay-${serviceId}`)
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'services', filter: `id=eq.${serviceId}` },
                (payload) => {
                    if (payload.new.inventory?.minBookingDays) {
                        const newMin = payload.new.inventory.minBookingDays;
                        setMinStay(newMin);
                        toast.success(`Minimum stay changed to ${newMin} nights!`, { icon: '⏳' });
                    }
                }
            )
            .subscribe();

        return () => supabase.removeChannel(productChannel);
    }, [serviceId]);

    // Scenario 101: Real-time availability conflict detection
    useEffect(() => {
        if (!serviceId || !formData.checkIn || !formData.checkOut) return;

        const checkAvailability = async () => {
            const { data } = await supabase
                .from('room_daily_prices')
                .select('*')
                .eq('is_blocked', true)
                .gte('date', formData.checkIn)
                .lte('date', formData.checkOut);

            if (data && data.length > 0) {
                setAvailabilityAlert('These dates just became unavailable. Please select new ones.');
                toast.error('Availability changed! Dates are now blocked.', { icon: '🚫' });
            } else {
                setAvailabilityAlert(null);
            }
        };

        const channel = supabase
            .channel('booking-conflict')
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'room_daily_prices' },
                (payload) => {
                    if (payload.new.is_blocked &&
                        payload.new.date >= formData.checkIn &&
                        payload.new.date <= formData.checkOut) {
                        setAvailabilityAlert('Wait! Someone just blocked these dates.');
                        toast.error('The property just became unavailable for your dates!', { duration: 6000 });
                    }
                }
            )
            .subscribe();

        checkAvailability();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [formData.checkIn, formData.checkOut, serviceId]);

    const calculateTotal = () => {
        if (!price || !formData.checkIn || !formData.checkOut) return null;
        const start = new Date(formData.checkIn);
        const end = new Date(formData.checkOut);
        const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        if (nights <= 0) return null;

        // Handle string price "16,000" or number 16000
        const priceVal = typeof price === 'string'
            ? parseInt(price.replace(/[,Rs ]/g, ''))
            : price;

        return (priceVal * nights).toLocaleString();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Calculate nights for minStay check
        const nights = Math.ceil((new Date(formData.checkOut) - new Date(formData.checkIn)) / (1000 * 60 * 60 * 24));
        if (nights < minStay) {
            return toast.error(`Minimum stay is ${minStay} nights. You selected ${nights}.`, { icon: '✋' });
        }

        if (!formData.consent) return toast.error('Please agree to total privacy');
        if (availabilityAlert) return toast.error('Cannot book: Dates are blocked.');

        setStatus('loading');
        try {
            // Direct Supabase Insert (Primary Architecture)
            const { error } = await supabase.from('bookings').insert([{
                customer_info: {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone
                },
                service_id: serviceId !== 'static-inquiry' ? serviceId : null,
                service_type: 'booking_request',
                status: 'pending',
                booking_details: {
                    productName: productName,
                    message: formData.message,
                    checkIn: formData.checkIn,
                    checkOut: formData.checkOut,
                    travelers: formData.travelers,
                    estimatedTotal: calculateTotal()
                },
                total_price: calculateTotal() ? parseFloat(calculateTotal().replace(/,/g, '')) : 0,
                // created_at, id handled by default
            }]).select();

            if (error) throw error;

            // Trigger Backend for Emails (Crucial Functionality)
            // We fire-and-forget this to not block the UI success state
            try {
                // Restore axios for this specific purpose as authorized
                const axios = require('axios');
                axios.post('http://localhost:5000/api/bookings/notify', {
                    booking_id: data ? data[0]?.id : null,
                    customer: { name: formData.name, email: formData.email },
                    productName,
                    totalPrice: calculateTotal()
                }).catch(err => console.error('Email trigger failed silently:', err));
            } catch (e) {
                // Ignore import errors if axios not available in scope, ensuring DB insert is respected
                console.warn('Axios not actionable for email trigger');
            }

            toast.success('Your paradise request is on its way!', { icon: '🌴' });
            setStatus('success');
        } catch (error) {
            console.error('Booking Error:', error);
            toast.error('Something went wrong. Please try again.');
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <div className="bg-green-50 border border-green-200 text-green-700 p-8 rounded-2xl text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">✓</span>
                </div>
                <h3 className="text-2xl font-bold mb-2">Request Sent!</h3>
                <p className="mb-6">We've received your booking request for <strong>{productName}</strong>. Our team will contact you shortly.</p>
                {onCancel && (
                    <button
                        onClick={onCancel}
                        className="bg-gray-900 text-white font-bold py-2 px-6 rounded-full hover:bg-gray-800 transition-all"
                    >
                        Close
                    </button>
                )}
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className={`bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-5 relative overflow-hidden ${className || ''}`}>
            {availabilityAlert && (
                <div className="absolute top-0 left-0 right-0 bg-red-500 text-white p-2 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 animate-pulse z-10">
                    <AlertCircle size={14} /> {availabilityAlert}
                </div>
            )}

            <div className="flex justify-between items-center mb-1">
                <h3 className="text-2xl font-bold text-gray-900">Request Booking</h3>
                {onCancel && (
                    <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
                        ✕
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Date</label>
                        <input
                            type="date" required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                            value={formData.checkIn}
                            onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Date</label>
                        <input
                            type="date" required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                            value={formData.checkOut}
                            onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                        type="text" required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email" required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input
                            type="tel" required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Travelers <span className="text-gray-400 text-xs font-normal ml-1">(Adults & Children)</span>
                    </label>
                    <input
                        type="number" min="1" required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        value={formData.travelers}
                        onChange={(e) => setFormData({ ...formData, travelers: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Special Requirements</label>
                    <textarea
                        rows="3"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Dietary needs, airport transfer, etc."
                    />
                </div>

                {calculateTotal() && (
                    <div className="p-4 bg-gray-50 rounded-xl flex justify-between items-center">
                        <span className="font-bold text-gray-900">Estimated Total:</span>
                        <span className="text-xl font-black text-primary">Rs {calculateTotal()}</span>
                    </div>
                )}

                <div className="flex items-start gap-3 mt-1">
                    <input
                        type="checkbox" required id="consent"
                        className="mt-1.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        checked={formData.consent}
                        onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                    />
                    <label htmlFor="consent" className="text-xs text-gray-500 leading-snug">
                        I agree to the processing of my personal data in accordance with the
                        <a href="/privacy" className="text-primary hover:underline ml-1">Privacy Policy</a>.
                    </label>
                </div>
            </div>

            <Button type="submit" className="w-full py-4 text-lg mt-2" disabled={status === 'loading'}>
                {status === 'loading' ? 'Sending Request...' : 'Confirm Booking'}
            </Button>
        </form>
    );
};

export default BookingForm;
