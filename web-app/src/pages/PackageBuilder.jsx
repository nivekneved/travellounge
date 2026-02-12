import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Package, Calendar, Users, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Button from '../components/Button';

const PackageBuilder = () => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        departureDate: '',
        flexibilityDay: '',
        nights: '',
        country: 'Asia',
        adults: '',
        children: '',
        moreInfo: '',
        agreeTerms: false,
        receiveMarketing: false
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const response = await fetch(`${apiBase}/bookings/package-request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer: {
                        name: `${formData.firstName} ${formData.lastName}`.trim(),
                        email: formData.email,
                        phone: formData.phone
                    },
                    package_details: {
                        destination: formData.country,
                        duration: formData.nights,
                        travelers: (parseInt(formData.adults || 0) + parseInt(formData.children || 0)),
                        budget: 'TBD',
                        preferences: formData.moreInfo
                    },
                    consent: formData.agreeTerms
                })
            });

            if (!response.ok) throw new Error('Failed to submit');

            toast.success('Your request has been sent! Our agents will contact you shortly.');
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                departureDate: '',
                flexibilityDay: '',
                nights: '',
                country: 'Asia',
                adults: '',
                children: '',
                moreInfo: '',
                agreeTerms: false,
                receiveMarketing: false
            });
        } catch (error) {
            console.error(error);
            toast.error('Failed to submit request. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white min-h-screen pb-20">
            <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8">
                <div className="text-center mb-16">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Sparkles className="text-primary" size={24} />
                        <span className="text-xs font-black text-primary uppercase tracking-[0.3em]">Tailor-Made</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter mb-4">Build Your Dream Package</h1>
                    <p className="text-xl text-gray-400">Tell us your vision, and we'll craft the perfect Mauritius experience</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-gray-50 p-8 rounded-[32px] border border-gray-100">
                            <h3 className="text-xl font-bold mb-6">Why Tailor-Made?</h3>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="bg-primary/10 p-3 rounded-xl text-primary">
                                        <Package size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">100% Customizable</p>
                                        <p className="text-gray-500 text-sm">Every detail crafted to your preferences</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="bg-primary/10 p-3 rounded-xl text-primary">
                                        <Users size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">Expert Guidance</p>
                                        <p className="text-gray-500 text-sm">Our travel specialists design your journey</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="bg-primary/10 p-3 rounded-xl text-primary">
                                        <Calendar size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">Flexible Dates</p>
                                        <p className="text-gray-500 text-sm">Travel on your schedule, not ours</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-8 rounded-[32px] border border-gray-100">
                            <h3 className="text-xl font-bold mb-6">Contact Info</h3>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="bg-primary/10 p-3 rounded-xl text-primary">
                                        <Phone size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">Phone</p>
                                        <p className="text-gray-500">+230 212 4070</p>
                                        <p className="text-gray-500 text-xs mt-1">Mon-Fri 08:30-16:45</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="bg-primary/10 p-3 rounded-xl text-primary">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">Email</p>
                                        <p className="text-gray-500">reservation@travellounge.mu</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="bg-white p-8 md:p-12 rounded-[40px] shadow-xl border border-gray-100">
                            <h2 className="text-3xl font-black mb-8 text-primary text-center">Request for your Tailor-Made Trip</h2>

                            {/* Section 1: Personal Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">First Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Name"
                                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-primary transition-all"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Name"
                                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-primary transition-all"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Phone</label>
                                    <input
                                        type="tel"
                                        required
                                        placeholder="Enter your phone number"
                                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-primary transition-all"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="Email"
                                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-primary transition-all"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Section 2: Travel Details */}
                            <h3 className="text-2xl font-bold mb-8">When do you want to travel?</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Departure Date</label>
                                    <input
                                        type="text"
                                        placeholder="Choose Your departure date"
                                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-primary transition-all"
                                        value={formData.departureDate}
                                        onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Flexibility Day</label>
                                    <input
                                        type="text"
                                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-primary transition-all"
                                        value={formData.flexibilityDay}
                                        onChange={(e) => setFormData({ ...formData, flexibilityDay: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Number of nights</label>
                                    <input
                                        type="number"
                                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-primary transition-all"
                                        value={formData.nights}
                                        onChange={(e) => setFormData({ ...formData, nights: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Country</label>
                                    <select
                                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-primary transition-all appearance-none"
                                        value={formData.country}
                                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                    >
                                        <option value="Asia">Asia</option>
                                        <option value="Europe">Europe</option>
                                        <option value="Africa">Africa</option>
                                        <option value="America">America</option>
                                        <option value="Oceania">Oceania</option>
                                    </select>
                                </div>
                            </div>

                            {/* Section 3: Persons */}
                            <h3 className="text-2xl font-bold mb-8">Number of persons travelling?</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Number of Adults</label>
                                    <input
                                        type="number"
                                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-primary transition-all"
                                        value={formData.adults}
                                        onChange={(e) => setFormData({ ...formData, adults: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Number of Children</label>
                                    <input
                                        type="number"
                                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-primary transition-all"
                                        value={formData.children}
                                        onChange={(e) => setFormData({ ...formData, children: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Section 4: Extra Info */}
                            <div className="mb-8">
                                <label className="block text-sm font-bold text-gray-700 mb-2">More info about your trip</label>
                                <textarea
                                    className="w-full h-32 bg-white border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-primary transition-all resize-none"
                                    value={formData.moreInfo}
                                    onChange={(e) => setFormData({ ...formData, moreInfo: e.target.value })}
                                ></textarea>
                            </div>

                            {/* Section 5: Consents */}
                            <div className="space-y-4 mb-8">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        checked={formData.agreeTerms}
                                        onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                                    />
                                    <span className="text-sm text-gray-700">I agree to the terms of use & Privacy Policy</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        checked={formData.receiveMarketing}
                                        onChange={(e) => setFormData({ ...formData, receiveMarketing: e.target.checked })}
                                    />
                                    <span className="text-sm text-gray-700">I want to receive the best marketing offers from Travel Lounge by email</span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-black text-white px-8 py-3 rounded-md font-bold hover:bg-gray-800 transition-all flex items-center justify-center mx-auto"
                            >
                                {loading ? 'Sending...' : 'Submit'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PackageBuilder;
