import React from 'react';
import { Shield } from 'lucide-react';

const PrivacyPolicy = () => {
    return (
        <div className="bg-white min-h-screen pb-20 pt-32">
            <div className="w-full px-4 md:px-8 max-w-4xl">
                <div className="flex items-center gap-4 mb-8">
                    <div className="bg-primary/10 p-4 rounded-2xl">
                        <Shield className="text-primary" size={40} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter">Privacy <span className="text-primary">Policy</span></h1>
                        <p className="text-gray-400 font-medium">Last Updated: January 2026</p>
                    </div>
                </div>

                <div className="prose prose-lg prose-red max-w-none">
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4">1. Data Protection Compliance</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Travel Lounge ("we", "us") operates in full compliance with the <strong>Mauritius Data Protection Act 2017</strong> (DPA). We are committed to safeguarding the privacy and security of our clients' personal data.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>
                        <ul className="list-disc pl-6 space-y-2 text-gray-600">
                            <li>Identity Data: Name, passport details (for bookings).</li>
                            <li>Contact Data: Email address, phone number.</li>
                            <li>Travel Data: Check-in/out dates, special requests, dietary requirements.</li>
                        </ul>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4">3. How We Use Your Data</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Your data is used strictly for facilitating your travel bookings with our partners (hotels, flight operators). We do <strong>not</strong> sell your data to third parties.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4">4. Your Rights</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Under the DPA 2017, you have the right to request access to, correction of, or deletion of your personal data held by us. Please contact our Data Protection Officer at <strong>reservation@travellounge.mu</strong>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
