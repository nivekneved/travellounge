import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, Users, CheckCircle, ArrowRight, Shield, CreditCard, Info, ArrowLeft, Star, Clock, Loader2 } from 'lucide-react';
import Button from '../components/Button';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { supabase } from '../utils/supabase';

const MySwal = withReactContent(Swal);

const BookingPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Get details from URL or state
    const serviceName = searchParams.get('serviceName') || 'Premium Service';
    const serviceId = searchParams.get('serviceId');
    const basePrice = searchParams.get('price') ? parseInt(searchParams.get('price')) : 0;
    const image = searchParams.get('image') || "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1200&auto=format&fit=crop";

    // Form State
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        checkIn: '',
        checkOut: '', // simplified for single day services if needed, but keeping primarily for stays
        travelers: 2,
        adults: 2,
        children: 0,
        message: '',
        consent: false
    });

    const [status, setStatus] = useState('idle');

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleTravelerChange = (type, action) => {
        setFormData(prev => {
            const newValue = action === 'inc' ? prev[type] + 1 : Math.max(0, prev[type] - 1);
            const newTotal = type === 'adults' ? newValue + prev.children : prev.adults + newValue;
            return {
                ...prev,
                [type]: newValue,
                travelers: newTotal
            };
        });
    };

    const calculateTotal = () => {
        // Simple logic: Price * Travelers (or Nights if date range)
        // For now assuming Price per Person for simplicity as per most service cards
        return (basePrice * formData.travelers).toLocaleString();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.consent) {
            MySwal.fire({
                icon: 'warning',
                title: 'Privacy Policy',
                text: 'Please accept the privacy policy to continue.',
                confirmButtonColor: '#e60000'
            });
            return;
        }

        setStatus('loading');

        try {
            const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const response = await fetch(`${apiBase}/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer: {
                        name: formData.name,
                        email: formData.email,
                        phone: formData.phone
                    },
                    service_id: serviceId || 'custom-booking',
                    booking_details: {
                        productName: serviceName,
                        ...formData,
                        estimatedTotal: calculateTotal()
                    },
                    consent: formData.consent
                })
            });

            if (!response.ok) throw new Error('Failed to book');

            setStatus('success');

            await MySwal.fire({
                icon: 'success',
                title: 'Booking Request Sent!',
                text: 'We have received your details and will contact you shortly with a confirmation and payment link.',
                confirmButtonColor: '#e60000',
                confirmButtonText: 'Great!'
            });

            setStep(3); // Success Step
        } catch (error) {
            console.error(error);
            setStatus('error');

            MySwal.fire({
                icon: 'error',
                title: 'Booking Failed',
                text: 'Something went wrong while processing your request. Please try again or contact us directly.',
                confirmButtonColor: '#e60000'
            });
        }
    };

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-20 font-sans">
            <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8">

                {/* Header Link */}
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors mb-8 font-medium">
                    <ArrowLeft size={18} /> Back to details
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Left Column: Booking Summary (Sticky) */}
                    <div className="lg:col-span-4 order-2 lg:order-1">
                        <div className="bg-white rounded-3xl shadow-xl overflow-hidden sticky top-32 border border-gray-100">
                            <div className="relative h-48">
                                <img src={image} alt={serviceName} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute bottom-4 left-4 text-white">
                                    <p className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">You are booking</p>
                                    <h2 className="text-2xl font-black leading-tight">{serviceName}</h2>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                                        <div className="flex items-center gap-3 text-gray-600">
                                            <Calendar size={18} className="text-primary" />
                                            <span className="font-medium">Date</span>
                                        </div>
                                        <span className="font-bold text-gray-900">{formData.checkIn || 'Select Date'}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                                        <div className="flex items-center gap-3 text-gray-600">
                                            <Users size={18} className="text-primary" />
                                            <span className="font-medium">Guests</span>
                                        </div>
                                        <span className="font-bold text-gray-900">{formData.travelers} People</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-lg font-bold text-gray-900">Total Estimated</span>
                                        <span className="text-2xl font-black text-primary">Rs {calculateTotal()}</span>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-xl text-xs text-gray-500 leading-relaxed flex gap-2">
                                    <Info size={16} className="text-primary flex-shrink-0 mt-0.5" />
                                    <p>You won't be charged yet. We'll check availability and send you a payment link.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: The Form */}
                    <div className="lg:col-span-8 order-1 lg:order-2">

                        {/* Progress Steps */}
                        <div className="flex items-center gap-4 mb-8">
                            {[1, 2, 3].map(i => (
                                <div key={i} className={`flex-1 h-2 rounded-full transition-all duration-500 ${step >= i ? 'bg-primary' : 'bg-gray-200'}`} />
                            ))}
                        </div>

                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">

                            {step === 1 && (
                                <div className="animate-in slide-in-from-right duration-500">
                                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">Trip Details</h1>
                                    <p className="text-gray-500 mb-10 text-lg">Let's start with the basics of your trip.</p>

                                    <div className="space-y-10">
                                        {/* Date Selection */}
                                        <div>
                                            <label className="block text-sm font-bold uppercase text-gray-500 tracking-wider mb-4">When are you going?</label>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="relative group">
                                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                        <Calendar className="text-gray-400 group-focus-within:text-primary" size={20} />
                                                    </div>
                                                    <input
                                                        type="date"
                                                        name="checkIn"
                                                        value={formData.checkIn}
                                                        onChange={handleInputChange}
                                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-primary focus:ring-0 outline-none font-bold text-gray-900 transition-all hover:border-gray-200"
                                                    />
                                                    <span className="absolute -top-2.5 left-4 bg-white px-2 text-xs font-bold text-gray-400">Start Date</span>
                                                </div>
                                                {/* Optional End Date */}
                                                <div className="relative group">
                                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                        <Calendar className="text-gray-400 group-focus-within:text-primary" size={20} />
                                                    </div>
                                                    <input
                                                        type="date"
                                                        name="checkOut"
                                                        value={formData.checkOut}
                                                        onChange={handleInputChange}
                                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-primary focus:ring-0 outline-none font-bold text-gray-900 transition-all hover:border-gray-200"
                                                    />
                                                    <span className="absolute -top-2.5 left-4 bg-white px-2 text-xs font-bold text-gray-400">End Date (Optional)</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Travelers Selection - Visual */}
                                        <div>
                                            <label className="block text-sm font-bold uppercase text-gray-500 tracking-wider mb-4">Who is traveling?</label>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Adults */}
                                                <div className="border-2 border-primary/10 bg-primary/5 rounded-2xl p-6 flex items-center justify-between cursor-pointer hover:border-primary/30 transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <div className="bg-white p-3 rounded-full shadow-sm text-primary">
                                                            <Users size={24} />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900 text-lg">Adults</p>
                                                            <p className="text-xs text-gray-500">Age 13+</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4 bg-white rounded-xl px-2 py-1 shadow-sm">
                                                        <button onClick={() => handleTravelerChange('adults', 'dec')} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-primary font-bold text-xl">-</button>
                                                        <span className="font-black w-4 text-center">{formData.adults}</span>
                                                        <button onClick={() => handleTravelerChange('adults', 'inc')} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-primary font-bold text-xl">+</button>
                                                    </div>
                                                </div>

                                                {/* Children */}
                                                <div className="border-2 border-gray-100 bg-gray-50 rounded-2xl p-6 flex items-center justify-between cursor-pointer hover:border-gray-200 transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <div className="bg-white p-3 rounded-full shadow-sm text-gray-400">
                                                            <Star size={24} />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900 text-lg">Children</p>
                                                            <p className="text-xs text-gray-500">Age 2-12</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4 bg-white rounded-xl px-2 py-1 shadow-sm">
                                                        <button onClick={() => handleTravelerChange('children', 'dec')} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-primary font-bold text-xl">-</button>
                                                        <span className="font-black w-4 text-center">{formData.children}</span>
                                                        <button onClick={() => handleTravelerChange('children', 'inc')} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-primary font-bold text-xl">+</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <Button onClick={() => setStep(2)} className="w-full py-5 text-xl shadow-xl hover:translate-y-[-2px]">
                                            Continue to Details <ArrowRight size={20} className="ml-2" />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="animate-in slide-in-from-right duration-500">
                                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">Your Details</h1>
                                    <p className="text-gray-500 mb-10 text-lg">Where should we send the confirmation?</p>

                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-900 mb-2">Full Name</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-primary outline-none transition-all font-medium"
                                                    placeholder="e.g. John Doe"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-900 mb-2">Phone Number</label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-primary outline-none transition-all font-medium"
                                                    placeholder="+230 ..."
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-2">Email Address</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-primary outline-none transition-all font-medium"
                                                placeholder="john@example.com"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-2">Special Requests (Optional)</label>
                                            <textarea
                                                name="message"
                                                value={formData.message}
                                                onChange={handleInputChange}
                                                rows="4"
                                                className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-primary outline-none transition-all font-medium resize-none"
                                                placeholder="Dietary requirements, accessibility needs, etc."
                                            />
                                        </div>

                                        <div className="bg-blue-50 p-6 rounded-2xl flex gap-4 items-start">
                                            <Shield className="text-blue-600 flex-shrink-0" size={24} />
                                            <div>
                                                <h4 className="font-bold text-blue-900 mb-1">Your data is secure</h4>
                                                <p className="text-sm text-blue-700 leading-relaxed">
                                                    We use SSL encryption to protect your personal information. We never share your data with third parties.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                id="consent"
                                                name="consent"
                                                checked={formData.consent}
                                                onChange={handleInputChange}
                                                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                            />
                                            <label htmlFor="consent" className="text-gray-600 text-sm cursor-pointer select-none">
                                                I agree to the <Link to="/terms" className="text-primary hover:underline">Terms & Conditions</Link> and <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                                            </label>
                                        </div>

                                        <div className="flex gap-4 pt-4">
                                            <button
                                                onClick={() => setStep(1)}
                                                className="px-8 py-4 font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
                                            >
                                                Back
                                            </button>
                                            <Button onClick={handleSubmit} className="flex-1 py-4 text-xl shadow-xl hover:shadow-2xl" disabled={status === 'loading'}>
                                                {status === 'loading' ? (
                                                    <span className="flex items-center gap-2 justify-center">
                                                        <Loader2 className="animate-spin" size={24} />
                                                        Processing...
                                                    </span>
                                                ) : 'Complete Booking'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="text-center py-12 animate-in zoom-in duration-500">
                                    <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                                        <CheckCircle size={48} />
                                    </div>
                                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">Booking Requested!</h1>
                                    <p className="text-xl text-gray-600 mb-10 max-w-lg mx-auto leading-relaxed">
                                        Thank you, <span className="font-bold text-gray-900">{formData.name}</span>! We have received your request for <span className="font-bold text-primary">{serviceName}</span>.
                                    </p>
                                    <div className="bg-gray-50 p-8 rounded-3xl max-w-md mx-auto mb-10">
                                        <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-widest text-sm">What happens next?</h3>
                                        <ul className="text-left space-y-4 text-gray-600">
                                            <li className="flex gap-3">
                                                <span className="bg-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shadow-sm border border-gray-100">1</span>
                                                <span>Our team checks availability (usually within 2 hours).</span>
                                            </li>
                                            <li className="flex gap-3">
                                                <span className="bg-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shadow-sm border border-gray-100">2</span>
                                                <span>We send you a confirmation email with payment link.</span>
                                            </li>
                                            <li className="flex gap-3">
                                                <span className="bg-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shadow-sm border border-gray-100">3</span>
                                                <span>Your adventure is secured once payment is received!</span>
                                            </li>
                                        </ul>
                                    </div>
                                    <Button to="/" className="px-12 py-4 shadow-lg">
                                        Return to Home
                                    </Button>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingPage;
