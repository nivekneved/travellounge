import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';
import { Star, Quote, Loader } from 'lucide-react';

const TestimonialsSection = () => {
    const { data: testimonials = [], isLoading } = useQuery({
        queryKey: ['testimonials', 'featured'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('testimonials')
                .select('*')
                .eq('is_approved', true) // Only approved
                .order('display_order', { ascending: true }) // Respect order
                .limit(3); // Grab top 3 for the section

            if (error) throw error;
            return data || [];
        }
    });

    if (isLoading) return null; // Or a skeleton if preferred
    if (testimonials.length === 0) return null; // Hide if no data

    return (
        <section className="py-24 bg-white">
            <div className="container px-4 md:px-8 max-w-[1400px] mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 uppercase tracking-tight">
                        Client <span className="text-primary">Stories</span>
                    </h2>
                    <p className="text-gray-500 max-w-2xl mx-auto text-xl font-light">
                        Real experiences from our valued travelers.
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={testimonial.id}
                            className="bg-gray-50 rounded-3xl p-8 relative group hover:shadow-lg transition-all duration-300"
                        >
                            {/* Quote Icon */}
                            <div className="absolute top-8 right-8 text-primary/10 group-hover:text-primary/20 transition-colors">
                                <Quote size={40} className="fill-current" />
                            </div>

                            {/* Stars */}
                            <div className="flex gap-1 mb-6">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={18}
                                        className={i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}
                                    />
                                ))}
                            </div>

                            {/* Content */}
                            <p className="text-gray-700 font-medium italic mb-8 leading-relaxed relative z-10">
                                "{testimonial.content}"
                            </p>

                            {/* Author */}
                            <div className="flex items-center gap-4">
                                {testimonial.avatar_url ? (
                                    <img
                                        src={testimonial.avatar_url}
                                        alt={testimonial.customer_name}
                                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-primary font-bold">
                                        {testimonial.customer_name.charAt(0)}
                                    </div>
                                )}
                                <div>
                                    <h4 className="font-bold text-gray-900">{testimonial.customer_name}</h4>
                                    {testimonial.location && (
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{testimonial.location}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;
