import React, { useEffect, useRef } from 'react';

const partners = [
    { name: 'Air Austral', logo: '/partners/Air-austral.png' },
    { name: 'Air France', logo: '/partners/airfrance.png' },
    { name: 'Air Mauritius', logo: '/partners/airmauritius.png' },
    { name: 'Turkish Airlines', logo: '/partners/Turkishairline.png' },
    { name: 'Kenya Airways', logo: '/partners/KenyaAirways.png' },
    { name: 'HOLY', logo: '/partners/HOLY-NEW.png' },
    { name: 'SWAN', logo: '/partners/SWAN-NEW.png' },
    { name: 'Expat', logo: '/partners/Expat-logo-e1717409708420.jpg' },
    { name: 'Partner 1', logo: '/partners/prt3.webp' },
    { name: 'Partner 2', logo: '/partners/prt-5-300x225-1.webp' },
    { name: 'Partner 3', logo: '/partners/prt-7-300x225-1.webp' }
];

const PartnersSlider = () => {
    const scrollRef = useRef(null);

    useEffect(() => {
        const scrollContainer = scrollRef.current;
        if (!scrollContainer) return;

        let scrollPosition = 0;
        const scroll = () => {
            scrollPosition += 1;
            if (scrollPosition >= scrollContainer.scrollWidth / 2) {
                scrollPosition = 0;
            }
            scrollContainer.scrollLeft = scrollPosition;
        };

        const interval = setInterval(scroll, 30);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="py-20 bg-white overflow-hidden">
            <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight">
                        Our Trusted <span className="text-primary">Partners</span>
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">
                        Collaborating with the world's leading airlines and service providers.
                    </p>
                </div>

                <div
                    ref={scrollRef}
                    className="flex gap-12 overflow-hidden"
                    style={{ scrollBehavior: 'auto' }}
                >
                    {/* Duplicate the logos twice for seamless infinite scroll */}
                    {[...partners, ...partners, ...partners].map((partner, index) => (
                        <div
                            key={`${partner.name}-${index}`}
                            className="flex-shrink-0 w-48 h-32 flex items-center justify-center bg-white rounded-2xl p-6 grayscale hover:grayscale-0 transition-all duration-500 opacity-70 hover:opacity-100"
                        >
                            <img
                                src={partner.logo}
                                alt={partner.name}
                                className="max-w-full max-h-full object-contain"
                                loading="lazy"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PartnersSlider;
