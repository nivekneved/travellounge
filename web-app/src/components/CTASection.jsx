import React from 'react';
import Button from './Button';

const CTASection = ({
    title,
    description,
    buttonText = "Contact an Expert",
    buttonLink = "/contact",
    variant = "primary", // "primary" (red gradient) or "dark" (gray-900)
    className = ""
}) => {
    const isDark = variant === "dark";

    return (
        <div className={`w-full max-w-[1400px] mx-auto px-4 md:px-8 mt-20 mb-20 ${className}`}>
            <div className={`rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden group transition-all duration-500 shadow-2xl ${isDark
                    ? 'bg-gray-900 text-white'
                    : 'bg-gradient-to-br from-primary to-red-700 text-white'
                }`}>
                {/* Decorative Blobs */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] -z-0 group-hover:bg-white/10 transition-all duration-1000" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-black/5 rounded-full blur-[100px] -z-0" />

                <div className="relative z-10 max-w-4xl mx-auto">
                    <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tighter uppercase leading-tight">
                        {title}
                    </h2>
                    <p className={`text-xl md:text-2xl mb-12 font-light leading-relaxed ${isDark ? 'text-gray-400' : 'text-white/90'
                        }`}>
                        {description}
                    </p>
                    <div className="flex justify-center">
                        <Button
                            to={buttonLink}
                            className={`${isDark
                                    ? 'bg-primary hover:bg-red-700 text-white'
                                    : 'bg-white text-primary hover:bg-gray-100 shadow-xl'
                                } py-5 px-12 rounded-full text-xl font-black transition-all duration-300 hover:scale-105 uppercase tracking-widest`}
                        >
                            {buttonText}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CTASection;
