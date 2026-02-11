import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../constants/theme';

const PROMOTIONS = [
    {
        id: 'promo1',
        title: 'Summer Sale',
        description: 'Up to 30% off on beachfront villas',
        image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=600&auto=format&fit=crop'
    },
    {
        id: 'promo2',
        title: 'Honeymoon Special',
        description: 'Free spa treatment for couples',
        image: 'https://images.unsplash.com/photo-1515238152791-8216bfdf89a7?q=80&w=600&auto=format&fit=crop'
    }
];

export default function PromotionsCarousel() {
    const navigation = useNavigation();

    const renderItem = ({ item }) => (
        <TouchableOpacity
            className="mr-4 w-72 h-40 rounded-2xl overflow-hidden relative shadow-sm bg-white"
            activeOpacity={0.9}
        >
            <Image
                source={{ uri: item.image }}
                className="w-full h-full"
                resizeMode="cover"
            />
            <View className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex justify-end p-4">
                <View className="bg-primary px-2 py-1 rounded-md self-start mb-1">
                    <Text className="text-white text-[10px] font-bold uppercase">Limited Offer</Text>
                </View>
                <Text className="text-white font-bold text-lg">{item.title}</Text>
                <Text className="text-white/90 text-xs">{item.description}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="py-6 pl-4">
            <Text className="text-xl font-black italic mb-4 text-gray-900 pr-4">Seasonal <Text className="text-primary">Deals</Text></Text>
            <FlatList
                data={PROMOTIONS}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingRight: 20 }}
            />
        </View>
    );
}
