import React from 'react';

const PageHero = ({ title, subtitle, image, icon: Icon }) => {
    return (
        <div className="relative h-[350px] overflow-hidden">
            <img
                src={image}
                alt={title}
                className="w-full h-full object-cover"
            />
            {/* 50% Height Overlay - Gradient for readability */}
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            <div className="absolute inset-0 flex items-center justify-center pt-24">
                <div className="text-center text-white max-w-4xl px-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    {Icon && (
                        <div className="bg-primary/20 backdrop-blur-sm p-3 rounded-full w-fit mx-auto mb-6 border border-primary/30">
                            <Icon className="text-primary" size={32} />
                        </div>
                    )}
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-4 uppercase drop-shadow-lg">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-lg md:text-xl font-medium opacity-90 max-w-2xl mx-auto drop-shadow-md">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PageHero;
