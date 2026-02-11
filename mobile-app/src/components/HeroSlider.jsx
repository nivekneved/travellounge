import React, { useState, useEffect, useRef } from 'react';
import { View, Image, Dimensions, FlatList, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // Ensure expo-linear-gradient is available or use View overlay
import { theme } from '../constants/theme';

const { width } = Dimensions.get('window');
const HEIGHT = 250;

const HERO_SLIDES = [
    {
        id: 1,
        image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800&auto=format&fit=crop',
        title: 'Discover Mauritius',
        subtitle: 'Paradise awaits you'
    },
    {
        id: 2,
        image: 'https://images.unsplash.com/photo-1589553416260-f586c8f1514f?q=80&w=800&auto=format&fit=crop',
        title: 'Luxury Stays',
        subtitle: 'Experience world-class comfort'
    },
    {
        id: 3,
        image: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?q=80&w=800&auto=format&fit=crop',
        title: 'Unforgettable Tours',
        subtitle: 'Explore the hidden gems'
    }
];

export default function HeroSlider() {
    const [activeIndex, setActiveIndex] = useState(0);
    const flatListRef = useRef(null);

    const onMomentumScrollEnd = (event) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / width);
        setActiveIndex(index);
    };

    // Auto-scroll
    useEffect(() => {
        const interval = setInterval(() => {
            if (flatListRef.current) {
                let nextIndex = activeIndex + 1;
                if (nextIndex >= HERO_SLIDES.length) {
                    nextIndex = 0;
                }
                flatListRef.current.scrollToIndex({ index: nextIndex, animated: true });
                setActiveIndex(nextIndex);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [activeIndex]);

    const renderItem = ({ item }) => (
        <View style={{ width, height: HEIGHT }}>
            <Image
                source={{ uri: item.image }}
                style={{ width, height: HEIGHT }}
                resizeMode="cover"
            />
            <View style={StyleSheet.absoluteFill} className="bg-black/30 justify-end p-6">
                <Text className="text-white text-3xl font-bold italic tracking-tighter">{item.title}</Text>
                <Text className="text-white text-base font-medium opacity-90">{item.subtitle}</Text>
            </View>
        </View>
    );

    return (
        <View style={{ height: HEIGHT }} className="relative">
            <FlatList
                ref={flatListRef}
                data={HERO_SLIDES}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={item => item.id.toString()}
                renderItem={renderItem}
                onMomentumScrollEnd={onMomentumScrollEnd}
                scrollEventThrottle={16}
            />
            {/* Pagination Dots */}
            <View className="absolute bottom-4 left-0 right-0 flex-row justify-center space-x-2">
                {HERO_SLIDES.map((_, index) => (
                    <View
                        key={index}
                        className={`h-2 rounded-full ${index === activeIndex ? 'w-6 bg-primary' : 'w-2 bg-white/50'}`}
                    />
                ))}
            </View>
        </View>
    );
}
