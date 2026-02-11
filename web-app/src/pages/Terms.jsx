import React from 'react';
import { FileText } from 'lucide-react';

const Terms = () => {
    return (
        <div className="bg-white min-h-screen pb-20 pt-32">
            <div className="w-full px-4 md:px-8 max-w-4xl">
                <div className="flex items-center gap-4 mb-8">
                    <div className="bg-primary/10 p-4 rounded-2xl">
                        <FileText className="text-primary" size={40} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter">Terms & <span className="text-primary">Conditions</span></h1>
                        <p className="text-gray-400 font-medium">Effective Date: January 1, 2026</p>
                    </div>
                </div>

                <div className="prose prose-lg prose-red max-w-none">
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4">1. Booking Conditions</h2>
                        <p className="text-gray-600 leading-relaxed">
                            By making a booking with Travel Lounge, you agree to these terms. All bookings are subject to availability and confirmation by our partners.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4">2. Payment Policy</h2>
                        <p className="text-gray-600 leading-relaxed">
                            No upfront payment is required on this website. Payments are processed securely via juice/bank transfer or credit card link sent by our reservation team after confirmation.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4">3. Cancellation Policy</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Cancellation fees apply based on the specific policy of the hotel or service provider. Typically:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-gray-600 mt-4">
                            <li>More than 30 days before arrival: Free Cancellation.</li>
                            <li>14-30 days before arrival: 50% fee.</li>
                            <li>Less than 14 days: 100% fee.</li>
                        </ul>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4">4. Governing Law</h2>
                        <p className="text-gray-600 leading-relaxed">
                            These terms are governed by the laws of the Republic of Mauritius.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Terms;
