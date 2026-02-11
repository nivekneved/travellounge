import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { X, Calendar, User, Mail, Phone, Users } from 'lucide-react-native';
import api from '../services/api';
import { theme } from '../constants/theme';

export default function BookingModal({ visible, onClose, product }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        checkIn: '',
        checkOut: '',
        guests: '2',
        message: ''
    });

    const handleChange = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async () => {
        // Basic Validation
        if (!formData.name || !formData.email || !formData.phone || !formData.checkIn || !formData.checkOut) {
            Alert.alert('Missing Fields', 'Please fill in all required fields.');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                customer: {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone
                },
                service_id: product.id,
                room_id: product.rooms?.[0]?.id, // Default to first room if available, or handle room selection logic
                booking_details: {
                    checkIn: formData.checkIn,
                    checkOut: formData.checkOut,
                    guests: parseInt(formData.guests),
                    message: formData.message
                },
                consent: true
            };

            const response = await api.post('/bookings', payload);

            if (response.status === 201) {
                Alert.alert('Success', 'Your booking request has been sent! Check your email for confirmation.', [
                    { text: 'OK', onPress: onClose }
                ]);
            }
        } catch (error) {
            console.error('Booking Error:', error);
            Alert.alert('Error', 'Failed to submit booking. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-end bg-black/50">
                <View className="bg-white rounded-t-[32px] h-[85%] w-full overflow-hidden">
                    {/* Header */}
                    <View className="flex-row justify-between items-center p-6 border-b border-gray-100">
                        <View>
                            <Text className="text-lg font-bold text-gray-400 uppercase tracking-wider">Book Your Stay</Text>
                            <Text className="text-xl font-black italic text-primary" numberOfLines={1}>{product?.name}</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} className="bg-gray-100 p-2 rounded-full">
                            <X size={24} color="#000" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="p-6" contentContainerStyle={{ paddingBottom: 100 }}>
                        {/* Personal Info */}
                        <Text className="font-bold text-gray-900 mb-4 text-base">Personal Details</Text>

                        <View className="space-y-4 mb-6">
                            <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                                <User size={20} color="#9ca3af" />
                                <TextInput
                                    className="flex-1 ml-3 text-gray-900 font-medium"
                                    placeholder="Full Name"
                                    value={formData.name}
                                    onChangeText={(t) => handleChange('name', t)}
                                />
                            </View>
                            <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                                <Mail size={20} color="#9ca3af" />
                                <TextInput
                                    className="flex-1 ml-3 text-gray-900 font-medium"
                                    placeholder="Email Address"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={formData.email}
                                    onChangeText={(t) => handleChange('email', t)}
                                />
                            </View>
                            <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                                <Phone size={20} color="#9ca3af" />
                                <TextInput
                                    className="flex-1 ml-3 text-gray-900 font-medium"
                                    placeholder="Phone Number"
                                    keyboardType="phone-pad"
                                    value={formData.phone}
                                    onChangeText={(t) => handleChange('phone', t)}
                                />
                            </View>
                        </View>

                        {/* Trip Details */}
                        <Text className="font-bold text-gray-900 mb-4 text-base">Trip Details</Text>

                        <View className="space-y-4 mb-8">
                            <View className="flex-row gap-4">
                                <View className="flex-1 flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                                    <Calendar size={20} color="#9ca3af" />
                                    <TextInput
                                        className="flex-1 ml-3 text-gray-900 font-medium"
                                        placeholder="YYYY-MM-DD"
                                        value={formData.checkIn}
                                        onChangeText={(t) => handleChange('checkIn', t)}
                                    />
                                </View>
                                <View className="flex-1 flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                                    <Calendar size={20} color="#9ca3af" />
                                    <TextInput
                                        className="flex-1 ml-3 text-gray-900 font-medium"
                                        placeholder="YYYY-MM-DD"
                                        value={formData.checkOut}
                                        onChangeText={(t) => handleChange('checkOut', t)}
                                    />
                                </View>
                            </View>
                            <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                                <Users size={20} color="#9ca3af" />
                                <TextInput
                                    className="flex-1 ml-3 text-gray-900 font-medium"
                                    placeholder="Number of Guests"
                                    keyboardType="numeric"
                                    value={formData.guests}
                                    onChangeText={(t) => handleChange('guests', t)}
                                />
                            </View>
                        </View>

                        {/* Submit Button */}
                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={loading}
                            className={`bg-primary py-4 rounded-2xl shadow-lg shadow-red-500/30 items-center justify-center ${loading ? 'opacity-70' : ''}`}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text className="text-white font-black text-lg tracking-widest uppercase">Confirm Booking</Text>
                            )}
                        </TouchableOpacity>

                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}
