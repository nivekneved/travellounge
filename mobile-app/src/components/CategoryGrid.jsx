import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../constants/theme';

const CATEGORIES = [
    { id: 'cruises', label: 'Cruises', image: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?q=80&w=400&auto=format&fit=crop' },
    { id: 'flights', label: 'Flights', image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=400&auto=format&fit=crop' },
    { id: 'group_tours', label: 'Group Tours', image: 'https://images.unsplash.com/photo-1588667635606-d71e29c6691c?q=80&w=400&auto=format&fit=crop' },
    { id: 'rodrigues', label: 'Rodrigues', image: 'https://images.unsplash.com/photo-1589330953181-e2c72251a37c?q=80&w=400&auto=format&fit=crop' },
    { id: 'hotels', label: 'Hotels', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=400&auto=format&fit=crop' },
    { id: 'day_packages', label: 'Day Packages', image: 'https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?q=80&w=400&auto=format&fit=crop' },
];

export default function CategoryGrid() {
    const navigation = useNavigation();

    const handlePress = (category) => {
        if (category.id === 'flights') {
            // Flight Search Redirect (MVP)
            // Linking.openURL or navigate to a Webview screen
            // For now, let's keep it consistent with HomeScreen logic or new plan
            navigation.navigate('CategoryListing', { categoryId: category.id, title: category.label });
        } else {
            navigation.navigate('CategoryListing', { categoryId: category.id, title: category.label });
        }
    };

    return (
        <View className="px-4 py-6">
            <Text className="text-xl font-black italic mb-4 text-gray-900">Explore <Text className="text-primary">Categories</Text></Text>
            <View className="flex-row flex-wrap justify-between">
                {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                        key={cat.id}
                        activeOpacity={0.8}
                        onPress={() => handlePress(cat)}
                        className="w-[48%] mb-4 rounded-2xl overflow-hidden shadow-sm bg-gray-100 h-32 relative"
                    >
                        <Image
                            source={{ uri: cat.image }}
                            className="w-full h-full"
                            resizeMode="cover"
                        />
                        <View className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <Text className="text-white font-bold text-lg text-center px-2">{cat.label}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}
