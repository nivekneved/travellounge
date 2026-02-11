import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, SafeAreaView, Alert } from 'react-native';
import { Package, MapPin, Calendar, Users, ArrowRight, Check } from 'lucide-react-native';
import api from '../services/api';

const STAGES = [
    { id: 'destination', label: 'Start', icon: MapPin },
    { id: 'dates', label: 'Time', icon: Calendar },
    { id: 'travelers', label: 'Who', icon: Users },
    { id: 'summary', label: 'Goal', icon: Package }
];

export default function PackageBuilderScreen({ navigation }) {
    const [stage, setStage] = useState('destination');
    const [formData, setFormData] = useState({
        destination: '',
        duration: '7 Days',
        travelers: '2 Adults',
        preferences: '',
        name: '',
        email: '',
        phone: ''
    });

    const nextStage = () => {
        const currentIndex = STAGES.findIndex(s => s.id === stage);
        if (currentIndex < STAGES.length - 1) {
            setStage(STAGES[currentIndex + 1].id);
        }
    };

    const handleSubmit = async () => {
        try {
            await api.post('/bookings/package-request', {
                customer: {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone
                },
                package_details: {
                    destination: formData.destination,
                    duration: formData.duration,
                    travelers: formData.travelers,
                    preferences: formData.preferences
                },
                consent: true
            });

            Alert.alert('Request Sent', 'Our island experts will contact you with a bespoke itinerary shortly.');
            navigation.goBack();
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to submit request. Please try again.');
        }
    };

    const currentIdx = STAGES.findIndex(s => s.id === stage);

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Custom Header */}
            <View className="px-6 py-4 flex-row justify-between items-center border-b border-gray-50">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text className="text-primary font-bold">Cancel</Text>
                </TouchableOpacity>
                <Text className="text-xl font-black italic tracking-tighter">BUILDER</Text>
                <View className="w-10" />
            </View>

            <ScrollView className="flex-1 px-6 pt-8">
                <View className="items-center mb-10">
                    <Text className="text-[10px] font-black text-primary uppercase tracking-[4px] mb-2">Tailor-Made</Text>
                    <Text className="text-3xl font-black text-center leading-tight">Your <Text className="text-primary italic">Bespoke</Text> Journey</Text>
                </View>

                {/* Progress Indicators */}
                <View className="flex-row justify-between mb-12 relative px-4">
                    <View className="absolute top-1/2 left-0 right-0 h-[2px] bg-gray-100 -translate-y-1/2" />
                    {STAGES.map((s, idx) => {
                        const Icon = s.icon;
                        const isActive = stage === s.id;
                        const isCompleted = currentIdx > idx;

                        return (
                            <View key={s.id} className="items-center">
                                <View className={`w-10 h-10 rounded-2xl items-center justify-center ${isActive ? 'bg-primary shadow-lg shadow-primary/30' :
                                    isCompleted ? 'bg-black' : 'bg-gray-50'
                                    }`}>
                                    {isCompleted ? <Check size={16} color="#fff" /> : <Icon size={16} color={isActive ? '#fff' : '#9ca3af'} />}
                                </View>
                            </View>
                        );
                    })}
                </View>

                {/* Form Content */}
                <View className="bg-gray-50 p-8 rounded-[40px] border border-gray-100 mb-10">
                    {stage === 'destination' && (
                        <View className="gap-6">
                            <Text className="text-xl font-black mb-2">Where to first?</Text>
                            {['North (Vibrant)', 'South (Wild)', 'East (Beaches)', 'West (Sunsets)'].map(dest => (
                                <TouchableOpacity
                                    key={dest}
                                    onPress={() => { setFormData({ ...formData, destination: dest }); nextStage(); }}
                                    className={`p-5 rounded-3xl border-2 ${formData.destination === dest ? 'border-primary bg-white' : 'border-white bg-white/50'}`}
                                >
                                    <Text className={`text-lg font-bold ${formData.destination === dest ? 'text-primary' : 'text-gray-900'}`}>{dest}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {stage === 'dates' && (
                        <View className="gap-6">
                            <Text className="text-xl font-black mb-2">Duration?</Text>
                            <View className="flex-row flex-wrap gap-3">
                                {['5D', '7D', '10D', '14D', '21D+'].map(dur => (
                                    <TouchableOpacity
                                        key={dur}
                                        onPress={() => { setFormData({ ...formData, duration: dur }); nextStage(); }}
                                        className={`px-8 py-4 rounded-2xl border-2 ${formData.duration === dur ? 'border-primary bg-white text-primary' : 'border-white bg-white/50'}`}
                                    >
                                        <Text className={`font-bold ${formData.duration === dur ? 'text-primary' : 'text-gray-500'}`}>{dur}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <TouchableOpacity onPress={() => setStage('destination')} className="mt-4"><Text className="text-gray-400 font-bold">← Back</Text></TouchableOpacity>
                        </View>
                    )}

                    {stage === 'travelers' && (
                        <View className="gap-6">
                            <Text className="text-xl font-black mb-2">Who's going?</Text>
                            {['Solo', 'Couple', 'Family', 'Group', 'Work Trip'].map(t => (
                                <TouchableOpacity
                                    key={t}
                                    onPress={() => { setFormData({ ...formData, travelers: t }); nextStage(); }}
                                    className={`p-5 rounded-3xl border-2 ${formData.travelers === t ? 'border-primary bg-white' : 'border-white bg-white/50'}`}
                                >
                                    <Text className={`text-lg font-bold ${formData.travelers === t ? 'text-primary' : 'text-gray-900'}`}>{t}</Text>
                                </TouchableOpacity>
                            ))}
                            <TouchableOpacity onPress={() => setStage('dates')} className="mt-4"><Text className="text-gray-400 font-bold">← Back</Text></TouchableOpacity>
                        </View>
                    )}

                    {stage === 'summary' && (
                        <View className="gap-6">
                            <Text className="text-xl font-black mb-2">Final Step</Text>
                            <View className="p-5 bg-white rounded-3xl border border-gray-100 mb-4">
                                <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Your Plan</Text>
                                <Text className="font-bold text-lg">📍 {formData.destination} • {formData.duration} • {formData.travelers}</Text>
                            </View>

                            <TextInput
                                placeholder="Full Name"
                                className="bg-white p-5 rounded-2xl border border-gray-100 font-bold"
                                value={formData.name}
                                onChangeText={(val) => setFormData({ ...formData, name: val })}
                            />
                            <TextInput
                                placeholder="Email"
                                keyboardType="email-address"
                                className="bg-white p-5 rounded-2xl border border-gray-100 font-bold"
                                value={formData.email}
                                onChangeText={(val) => setFormData({ ...formData, email: val })}
                            />
                            <TextInput
                                placeholder="Phone"
                                keyboardType="phone-pad"
                                className="bg-white p-5 rounded-2xl border border-gray-100 font-bold"
                                value={formData.phone}
                                onChangeText={(val) => setFormData({ ...formData, phone: val })}
                            />

                            <TouchableOpacity
                                onPress={handleSubmit}
                                className="bg-primary p-6 rounded-[24px] flex-row items-center justify-center gap-3 shadow-xl shadow-primary/30"
                            >
                                <Text className="text-white text-lg font-black uppercase tracking-widest">Send Request</Text>
                                <ArrowRight size={20} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setStage('travelers')} className="mt-4 items-center"><Text className="text-gray-400 font-bold">Change Details</Text></TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
