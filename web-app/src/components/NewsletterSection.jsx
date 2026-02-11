import React from 'react';

const NewsletterSection = ({ className = "" }) => {
    return (
        <div className={`bg-primary rounded-[3rem] p-12 md:p-16 text-center text-white relative overflow-hidden shadow-2xl ${className}`}>
            {/* Pattern Overlay */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>

            <div className="relative z-10 max-w-3xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight uppercase">Never Miss a Fare Drop</h2>
                <p className="text-xl mb-10 opacity-90 font-light">
                    Subscribe to our exclusive flight alerts and travel deals to save up to 40% on your next trip.
                </p>
                <form className="flex flex-col md:flex-row gap-4 justify-center" onSubmit={(e) => e.preventDefault()}>
                    <input
                        type="email"
                        placeholder="Enter your email address"
                        className="px-8 py-5 rounded-full text-gray-900 w-full md:w-96 focus:outline-none focus:ring-4 focus:ring-white/30 transition-all text-lg"
                        required
                    />
                    <button
                        type="submit"
                        className="bg-gray-900 text-white font-black py-5 px-12 rounded-full hover:bg-black transition-all shadow-xl hover:scale-105 active:scale-95 uppercase tracking-widest"
                    >
                        Subscribe
                    </button>
                </form>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>
        </div>
    );
};

export default NewsletterSection;
