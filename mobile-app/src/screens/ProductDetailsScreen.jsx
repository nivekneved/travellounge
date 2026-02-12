import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, SafeAreaView, Linking, Share, ActivityIndicator } from 'react-native';
import { ShieldCheck, Info, MapPin, Star, Share2, ChevronLeft, Heart } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/theme';
import api from '../services/api';

import BookingModal from '../components/BookingModal';

export default function ProductDetailsScreen({ route, navigation }) {
    const { id } = route.params;
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showBooking, setShowBooking] = useState(false);

    const fetchProduct = async () => {
        try {
            const { data } = await api.get(`/products/${id}`);
            setProduct(data);
        } catch (error) {
            console.error('Error fetching product:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProduct();

        // Supabase Realtime Subscription (Optional for mobile MVP, but keeping structure)
        // Ignoring for now to focus on core API

    }, [id]);

    const name = product?.name || route.params.name;
    const category = product?.category || route.params.category;
    const price = product?.pricing?.basePrice
        ? `${product.pricing.currency || 'MUR'} ${product.pricing.basePrice.toLocaleString()}`
        : route.params.price;
    const image = product?.images?.[0] || route.params.image;
    const location = product?.location || route.params.location;

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out ${name} on Travel Lounge Mauritius! ${price}`,
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    return (
        <View className="flex-1 bg-white">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="relative">
                    <Image source={{ uri: image }} className="w-full h-[450px]" />
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                        className="absolute inset-0"
                    />

                    {/* Top Actions */}
                    <SafeAreaView className="absolute top-0 left-0 right-0 flex-row justify-between px-6 pt-4">
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            className="bg-white/20 p-3 rounded-2xl backdrop-blur-md"
                        >
                            <ChevronLeft size={24} color="#fff" />
                        </TouchableOpacity>
                        <View className="flex-row gap-3">
                            <TouchableOpacity className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                                <Heart size={24} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleShare}
                                className="bg-white/20 p-3 rounded-2xl backdrop-blur-md"
                            >
                                <Share2 size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>

                    <View className="absolute bottom-10 left-6 right-6">
                        <View className="bg-primary px-3 py-1 rounded-full w-fit mb-3 self-start">
                            <Text className="text-white text-[10px] font-black uppercase tracking-widest">{category}</Text>
                        </View>
                        <Text className="text-4xl font-black text-white italic tracking-tighter leading-[42px] mb-2">{name}</Text>
                        <View className="flex-row items-center gap-1">
                            <MapPin size={14} color="#fff" opacity={0.8} />
                            <Text className="text-white font-bold opacity-80">{location}, Mauritius</Text>
                        </View>
                    </View>
                </View>

                <View className="p-8 -mt-6 bg-white rounded-t-[40px]">
                    <View className="flex-row justify-between items-center mb-8">
                        <View className="flex-row items-center gap-1.5">
                            <View className="flex-row">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <Star key={i} size={16} fill="#fbbf24" color="#fbbf24" />
                                ))}
                            </View>
                            <Text className="text-gray-400 font-bold ml-1">4.9 (128 Reviews)</Text>
                        </View>
                        <View className="flex-row items-center gap-2 px-3 py-1 bg-green-50 rounded-full">
                            <View className="w-2 h-2 bg-green-500 rounded-full" />
                            <Text className="text-green-600 text-[10px] font-black uppercase">Live</Text>
                        </View>
                    </View>

                    <View className="mb-10">
                        <Text className="text-2xl font-black italic mb-4">The <Text className="text-primary">Experience</Text></Text>
                        <Text className="text-gray-500 leading-[26px] text-lg font-medium">
                            Escape to an island sanctuary where the turquoise lagoon meets retro-chic design. This premium stay offers world-class dining, bespoke concierge service, and unforgettable Mauritian memories.
                        </Text>
                    </View>

                    {product?.itinerary && product.itinerary.length > 0 && (
                        <View className="mb-10">
                            <Text className="text-2xl font-black italic mb-6">Daily <Text className="text-primary">Itinerary</Text></Text>
                            <View className="relative border-l-2 border-gray-200 ml-4 pl-8 space-y-8">
                                {product.itinerary.map((day, index) => (
                                    <View key={index} className="relative">
                                        <View className="absolute -left-[45px] top-0 bg-primary w-8 h-8 rounded-full items-center justify-center border-4 border-white shadow-sm">
                                            <Text className="text-white font-black text-xs">{day.day}</Text>
                                        </View>
                                        <View className="bg-gray-50 p-5 rounded-3xl border border-gray-100">
                                            <Text className="text-lg font-bold text-gray-900 mb-2">{day.title}</Text>
                                            <Text className="text-gray-500 leading-6 mb-4">{day.description}</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    <View className="bg-gray-50 p-8 rounded-[32px] border border-gray-100 mb-24">
                        <View className="flex-row items-center gap-2 mb-4">
                            <ShieldCheck size={20} color="#e60000" />
                            <Text className="font-black text-primary italic text-lg uppercase tracking-tight">Concierge Trust</Text>
                        </View>
                        <Text className="text-gray-500 leading-6 font-medium">
                            Your inquiry is managed directly by our local experts. No upfront payment required. We adhere to the Mauritius Data Protection Act 2017.
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Premium Price Bar */}
            <SafeAreaView className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-2xl">
                <View className="flex-row justify-between items-center px-8 py-6 pb-10">
                    <View>
                        <Text className="text-gray-400 text-[10px] font-black uppercase tracking-[3px] mb-1">Starting from</Text>
                        <Text className="text-3xl font-black text-primary italic leading-8">{price}</Text>
                    </View>
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => setShowBooking(true)}
                        className="bg-primary px-10 py-5 rounded-3xl shadow-xl shadow-red-500/30"
                    >
                        <View className="flex-row items-center gap-2">
                            <Text className="text-white font-black text-lg">BOOK NOW</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {/* Booking Modal */}
            <BookingModal
                visible={showBooking}
                onClose={() => setShowBooking(false)}
                product={{ id: id || product?._id, name, pricing: product?.pricing }}
            />
        </View>
    );
}

