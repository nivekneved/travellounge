import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, SafeAreaView, ScrollView, TextInput, Linking } from 'react-native';
import { MapPin, ArrowRight, Search, Heart, Activity, Compass } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { theme } from '../constants/theme';
import api from '../services/api';

// Components
import HeroSlider from '../components/HeroSlider';
import CategoryGrid from '../components/CategoryGrid';
import PromotionsCarousel from '../components/PromotionsCarousel';

export default function HomeScreen({ navigation }) {
    // Fetch Featured Products (e.g., just general products for now)
    const { data: featuredProducts, isLoading } = useQuery({
        queryKey: ['products', 'featured'],
        queryFn: async () => {
            const { data } = await api.get('/products');
            return data.slice(0, 5); // Limit to 5 for featured
        }
    });

    const renderFeaturedItem = ({ item }) => (
        <TouchableOpacity
            activeOpacity={0.9}
            className="bg-white mx-4 my-3 rounded-[32px] shadow-sm border border-gray-100 overflow-hidden"
            onPress={() => navigation.navigate('Details', {
                id: item.id,
                name: item.name,
                category: item.category,
                price: `${item.pricing?.currency || 'MUR'} ${item.pricing?.basePrice?.toLocaleString()}`,
                image: item.images?.[0],
                location: item.location
            })}
        >
            <View className="relative">
                <Image
                    source={{ uri: item.images?.[0] || 'https://via.placeholder.com/400' }}
                    className="w-full h-56"
                />
                <View className="absolute top-4 left-4 bg-white/90 px-4 py-1.5 rounded-full backdrop-blur-md">
                    <Text className="text-[10px] font-black text-primary uppercase tracking-widest">{item.category}</Text>
                </View>
            </View>

            <View className="p-6">
                <View className="flex-row items-center gap-1 mb-2">
                    <MapPin size={12} color={theme.colors.primary} />
                    <Text className="text-primary text-xs font-bold">{item.location}</Text>
                </View>

                <Text className="text-2xl font-bold text-gray-900 mb-4 tracking-tight leading-7">{item.name}</Text>

                <View className="flex-row justify-between items-center pt-4 border-t border-gray-50">
                    <View>
                        <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-[2px]">From</Text>
                        <Text className="text-2xl font-black text-primary italic italic">
                            {item.pricing?.currency || 'MUR'} {item.pricing?.basePrice?.toLocaleString()}
                        </Text>
                    </View>
                    <View className="bg-primary px-4 py-3 rounded-2xl">
                        <ArrowRight size={20} color="#fff" />
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="px-6 pt-4 pb-2 flex-row justify-between items-center bg-white z-10">
                <View>
                    <Text className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Bonjour Mauritius</Text>
                    <Text className="text-3xl font-black italic tracking-tighter">TRAVEL<Text className="text-primary">LOUNGE</Text></Text>
                </View>
                <Image source={{ uri: 'https://i.pravatar.cc/100?img=12' }} className="w-10 h-10 rounded-full border-2 border-primary" />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                {/* 1. Hero Slider */}
                <HeroSlider />

                {/* 2. Category Grid */}
                <CategoryGrid />

                {/* 3. Promotions */}
                <PromotionsCarousel />

                {/* 4. Tailor Made Banner */}
                <TouchableOpacity
                    onPress={() => navigation.navigate('PackageBuilder')}
                    className="mx-4 mt-4 mb-8 bg-gray-900 rounded-[32px] p-6 border border-white/10 relative overflow-hidden"
                >
                    <View className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[40px] rounded-full -translate-y-1/2 translate-x-1/2" />
                    <View className="relative z-10 flex-row items-center justify-between">
                        <View className="flex-1 pr-4">
                            <Text className="text-[10px] font-black text-primary uppercase tracking-[4px] mb-2">Build Your Own</Text>
                            <Text className="text-2xl font-black text-white italic">Tailor-Made <Text className="text-primary tracking-tighter">Packages</Text></Text>
                        </View>
                        <View className="bg-primary w-12 h-12 rounded-2xl items-center justify-center shadow-xl shadow-primary/40">
                            <Compass size={24} color="#fff" />
                        </View>
                    </View>
                </TouchableOpacity>

                {/* 5. Featured Stays */}
                <View className="px-4 mb-2">
                    <Text className="text-xl font-black italic text-gray-900">Featured <Text className="text-primary">Stays</Text></Text>
                </View>

                {isLoading ? (
                    <ActivityIndicator size="large" color={theme.colors.primary} className="py-10" />
                ) : (
                    <FlatList
                        data={featuredProducts}
                        renderItem={renderFeaturedItem}
                        keyExtractor={item => item.id}
                        scrollEnabled={false}
                    />
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
