import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { ChevronLeft, MapPin, ArrowRight } from 'lucide-react-native';
import api from '../services/api';
import { theme } from '../constants/theme';

export default function CategoryListingScreen({ route, navigation }) {
    const { categoryId, title } = route.params;
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // If it's a redirect category like flights, we handled it in grid, but here if we land on listing:
                const response = await api.get('/products', {
                    params: { category: categoryId }
                });
                setProducts(response.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [categoryId]);

    const renderItem = ({ item }) => (
        <TouchableOpacity
            activeOpacity={0.9}
            className="bg-white mx-4 my-3 rounded-[24px] shadow-sm border border-gray-100 overflow-hidden"
            onPress={() => navigation.navigate('Details', {
                id: item.id,
                name: item.name,
                category: item.category,
                price: `${item.pricing?.currency} ${item.pricing?.basePrice?.toLocaleString()}`,
                image: item.images?.[0],
                location: item.location
            })}
        >
            <View className="relative">
                <Image
                    source={{ uri: item.images?.[0] || 'https://via.placeholder.com/400' }}
                    className="w-full h-48"
                />
                <View className="absolute top-3 right-3 bg-white/90 px-3 py-1 rounded-full backdrop-blur-md">
                    <Text className="text-primary font-bold text-xs">{item.pricing?.currency} {item.pricing?.basePrice?.toLocaleString()}</Text>
                </View>
            </View>

            <View className="p-5">
                <Text className="text-lg font-bold text-gray-900 mb-1" numberOfLines={1}>{item.name}</Text>
                <View className="flex-row items-center gap-1 mb-3">
                    <MapPin size={12} color="#6b7280" />
                    <Text className="text-gray-500 text-xs">{item.location}</Text>
                </View>

                <View className="flex-row justify-between items-center mt-2">
                    <Text className="text-xs font-bold text-primary uppercase tracking-wider">View Details</Text>
                    <ArrowRight size={16} color="#e60000" />
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-white">
            <SafeAreaView className="bg-white z-10">
                <View className="flex-row items-center px-4 py-4 border-b border-gray-50">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 bg-gray-50 rounded-full mr-3">
                        <ChevronLeft size={24} color="#000" />
                    </TouchableOpacity>
                    <Text className="text-2xl font-black italic text-gray-900">{title}</Text>
                </View>
            </SafeAreaView>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={products}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ paddingVertical: 10 }}
                    ListEmptyComponent={
                        <View className="items-center justify-center py-20">
                            <Text className="text-gray-400 font-medium">No packages found for this category.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}
