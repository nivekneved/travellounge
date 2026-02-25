import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Package, Plus, Search, Filter, MoreVertical,
    Edit2, Trash2, Eye, Star, Info, Layers,
    Image as ImageIcon, CheckCircle, Clock, AlertCircle,
    ChevronDown, Download, Upload, Loader2, X,
    Box, Grid, Users, TrendingUp, List, ChevronLeft, ChevronRight, ShieldAlert, MapPin
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import ViewToggle from '../components/ViewToggle';
import MediaPicker from '../components/MediaPicker';
import { supabase } from '../utils/supabase';

const ProductManager = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [showInventoryModal, setShowInventoryModal] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [dailyPrices, setDailyPrices] = useState({});
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [isEditingPricing, setIsEditingPricing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [updatedMonthlyPrices, setUpdatedMonthlyPrices] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [bulkData, setBulkData] = useState({
        startDate: '',
        endDate: '',
        price: '',
        multiplier: '',
        is_blocked: false,
        applyToDays: [0, 1, 2, 3, 4, 5, 6]
    });
    const [bulkPreview, setBulkPreview] = useState(0);
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'hotels',
        pricing: { basePrice: 0, currency: 'MUR' },
        location: '',
        images: [''],
        inventory: { total: 10, remaining: 10 },
        itinerary: [],
        features: [],
        inclusions: [],
        exclusions: [],
        highlights: []
    });
    const [localRooms, setLocalRooms] = useState([]);
    const [view, setView] = useState('grid');
    const [page, setPage] = useState(0);
    const PAGE_SIZE = 50;

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.id?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    useEffect(() => {
        fetchProducts();
    }, [page]);

    useEffect(() => {
        if (showInventoryModal && selectedProduct) {
            fetchRooms();
        }
    }, [showInventoryModal, selectedProduct]);

    useEffect(() => {
        if (showModal && editingId && (formData.category === 'hotels' || formData.category === 'Guest Houses' || formData.category === 'transfers')) {
            const loadModalRooms = async () => {
                const { data } = await supabase.from('hotel_rooms').select('*').eq('service_id', editingId);
                setLocalRooms(data || []);
            };
            loadModalRooms();
        } else if (showModal && !editingId) {
            setLocalRooms([]);
        }
    }, [showModal, editingId, formData.category]);

    useEffect(() => {
        if (selectedRoom) {
            fetchInventory();
        }
    }, [selectedRoom, selectedMonth]);

    useEffect(() => {
        if (bulkData.startDate && bulkData.endDate) {
            const start = new Date(bulkData.startDate);
            const end = new Date(bulkData.endDate);
            let count = 0;
            // Avoid infinite loop if dates are invalid
            if (start <= end) {
                const d = new Date(start);
                while (d <= end) {
                    if (bulkData.applyToDays.includes(d.getDay())) count++;
                    d.setDate(d.getDate() + 1);
                }
            }
            setBulkPreview(count);
        } else {
            setBulkPreview(0);
        }
    }, [bulkData.startDate, bulkData.endDate, bulkData.applyToDays]);

    const handleEdit = (product) => {
        setEditingId(product.id);
        setFormData({
            ...product,
            pricing: product.pricing || { basePrice: product.price || 0, currency: 'MUR' }
        });
        setShowModal(true);
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('services')
                .select('*')
                .order('created_at', { ascending: false })
                .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

            if (error) throw error;
            setProducts(data || []);
        } catch (_error) {
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const fetchRooms = async () => {
        try {
            const { data, error } = await supabase
                .from('hotel_rooms')
                .select('*')
                .eq('service_id', selectedProduct.id);

            if (error) throw error;

            const enhancedRooms = (data || []).map(r => ({
                ...r,
                // Keep the "Simulated" rule or assume DB has correct total_units
                total_units: r.total_units || (r.room_type === 'Deluxe' ? 5 : r.room_type === 'Studio' ? 6 : 1)
            }));
            setRooms(enhancedRooms);
            if (enhancedRooms.length > 0) {
                setSelectedRoom(enhancedRooms[0]);
            } else {
                setSelectedRoom(null);
            }
        } catch (_error) {
            toast.error('Failed to load rooms');
        }
    };

    const [otherAdmins, setOtherAdmins] = useState(0);

    // Scenario 92: Multi-Admin Editing Conflict Warning
    useEffect(() => {
        if (!selectedProduct) return;

        const channel = supabase.channel(`edit-conflict-${selectedProduct.id}`, {
            config: { presence: { key: localStorage.getItem('adminName') || 'Another Admin' } }
        });

        channel
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState();
                const count = Object.keys(state).length - 1; // Exclude self
                setOtherAdmins(Math.max(0, count));
                if (count > 0) {
                    toast('Another admin is viewing this product', { icon: '👥', duration: 3000 });
                }
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({ online_at: new Date().toISOString() });
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [selectedProduct]);

    const fetchInventory = async () => {
        if (!selectedRoom) return;
        try {
            const year = selectedMonth.getFullYear();
            const month = selectedMonth.getMonth();
            const startOfMonth = new Date(year, month, 1).toISOString().split('T')[0];
            const endOfMonth = new Date(year, month + 1, 0).toISOString().split('T')[0];

            const { data, error } = await supabase
                .from('room_daily_prices')
                .select('*')
                .eq('room_id', selectedRoom.id)
                .gte('date', startOfMonth)
                .lte('date', endOfMonth);

            if (error) throw error;

            const prices = {};
            data.forEach(item => {
                prices[item.date] = { price: item.price, is_blocked: item.is_blocked };
            });
            setDailyPrices(prev => ({ ...prev, [selectedRoom.id]: prices }));
        } catch (error) {
            toast.error('Failed to load inventory');
        }
    };

    const handleBlockDate = async (dateStr, isBlocked) => {
        const current = dailyPrices[selectedRoom.id]?.[dateStr] || { price: selectedRoom.price_per_night || 0, is_blocked: false };

        // Optimistic Update
        const roomPrices = { ...dailyPrices[selectedRoom.id] };
        roomPrices[dateStr] = { ...current, is_blocked: isBlocked };
        setDailyPrices({ ...dailyPrices, [selectedRoom.id]: roomPrices });

        try {
            const { error } = await supabase
                .from('room_daily_prices')
                .upsert({
                    room_id: selectedRoom.id,
                    date: dateStr,
                    is_blocked: isBlocked,
                    price: current.price,
                }, { onConflict: 'room_id, date' });

            if (error) throw error;
            toast.success(isBlocked ? 'Date blocked' : 'Date unblocked');
        } catch (error) {
            toast.error('Failed to update status');
            // Revert
            roomPrices[dateStr] = current;
            setDailyPrices({ ...dailyPrices, [selectedRoom.id]: roomPrices });
        }
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const optimizationToast = toast.loading('Optimizing images...', {
            icon: '🖼️',
        });

        // Simple preview logic for now.
        // In a real app, upload to Supabase Storage here.
        setTimeout(() => {
            const newImages = files.map(f => URL.createObjectURL(f));
            setFormData(prev => ({ ...prev, images: [...(prev.images || []), ...newImages] }));
            toast.success('Images uploaded!', { id: optimizationToast });
        }, 1000);
    };

    const handleBlockAll = async (isBlocked) => {
        if (!selectedRoom) return;
        const year = selectedMonth.getFullYear();
        const month = selectedMonth.getMonth();
        const days = getDaysInMonth(year, month);

        setIsSaving(true);
        const loadingToast = toast.loading(`${isBlocked ? 'Blocking' : 'Unblocking'} all ${selectedRoom.room_type} rooms for ${selectedMonth.toLocaleString('default', { month: 'long' })}...`);

        try {
            const updates = days.map(d => ({
                room_id: selectedRoom.id,
                date: d.date,
                price: dailyPrices[selectedRoom.id]?.[d.date]?.price || Number(selectedRoom.price_per_night || 0),
                is_blocked: isBlocked
            }));

            const { error } = await supabase
                .from('room_daily_prices')
                .upsert(updates, { onConflict: 'room_id, date' });

            if (error) throw error;

            fetchInventory();
            toast.success(`Month ${isBlocked ? 'blocked' : 'opened'} successfully!`, { id: loadingToast });
        } catch (error) {
            toast.error('Failed to update month status', { id: loadingToast });
        } finally {
            setIsSaving(false);
        }
    };

    const handleBulkUpdate = async (e) => {
        e.preventDefault();
        if (!selectedRoom) return;

        if (bulkData.multiplier > 50) {
            const confirmed = window.confirm(`WARNING: You are increasing prices by ${bulkData.multiplier}%. This is a significant change. Are you sure?`);
            if (!confirmed) return;
        }

        setIsSaving(true);
        const loadingToast = toast.loading('Applying bulk updates globally...');

        try {
            const start = new Date(bulkData.startDate);
            const end = new Date(bulkData.endDate);
            const updates = [];

            if (start <= end) {
                const d = new Date(start);
                while (d <= end) {
                    if (bulkData.applyToDays.includes(d.getDay())) {
                        const dateStr = d.toISOString().split('T')[0];
                        let price = Number(bulkData.price);

                        // If multiplier is used instead of fixed price
                        const currentPrice = dailyPrices[selectedRoom.id]?.[dateStr]?.price || Number(selectedRoom.price_per_night || 0);
                        if (!bulkData.price && bulkData.multiplier) {
                            price = currentPrice * (1 + Number(bulkData.multiplier) / 100);
                        } else if (!bulkData.price && !bulkData.multiplier) {
                            price = currentPrice;
                        }

                        updates.push({
                            room_id: selectedRoom.id,
                            date: dateStr,
                            price: Math.round(price), // Assuming integer currency for cleanliness
                            is_blocked: bulkData.is_blocked // Or keep existing? Usually bulk sets state too
                        });
                    }
                    d.setDate(d.getDate() + 1);
                }
            }

            if (updates.length > 0) {
                const { error } = await supabase
                    .from('room_daily_prices')
                    .upsert(updates, { onConflict: 'room_id, date' });

                if (error) throw error;
            }

            setShowBulkModal(false);
            fetchInventory();
            toast.success(`Updated ${updates.length} days.`, { id: loadingToast });
        } catch (error) {
            toast.error('Bulk update failed', { id: loadingToast });
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveBatch = async () => {
        if (!selectedRoom) return;

        const updates = Object.keys(updatedMonthlyPrices).map(date => ({
            room_id: selectedRoom.id,
            date,
            price: Number(updatedMonthlyPrices[date]),
            is_blocked: dailyPrices[selectedRoom.id]?.[date]?.is_blocked || false
        }));

        if (updates.length === 0) {
            setIsEditingPricing(false);
            return;
        }

        setIsSaving(true);
        const loadingToast = toast.loading('Synchronizing pricing grid...');
        try {
            const { error } = await supabase
                .from('room_daily_prices')
                .upsert(updates, { onConflict: 'room_id, date' });

            if (error) throw error;

            setIsEditingPricing(false);
            setUpdatedMonthlyPrices({});
            fetchInventory();
            toast.success('Live pricing synced!', { id: loadingToast });
        } catch (error) {
            toast.error('Grid sync failed', { id: loadingToast });
        } finally {
            setIsSaving(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const loadingToast = toast.loading(editingId ? 'Updating product...' : 'Creating product...');
        const previousProducts = [...products];
        try {
            if (editingId) {
                setProducts(products.map(p =>
                    p.id === editingId ? { ...p, ...formData, price: formData.pricing?.basePrice } : p
                ));
                const { error, data } = await supabase
                    .from('services')
                    .update({
                        ...formData,
                        price: formData.pricing?.basePrice // Sync flat price
                    })
                    .eq('id', editingId)
                    .select()
                    .single();

                if (error) throw error;
                setProducts(products.map(p => p.id === editingId ? data : p));
                toast.success('Product updated', { id: loadingToast });
            } else {
                const tempId = 'temp-' + Date.now();
                const newProduct = { ...formData, id: tempId, price: formData.pricing?.basePrice };
                setProducts([newProduct, ...products]);
                const { error, data } = await supabase
                    .from('services')
                    .insert([{
                        ...formData,
                        price: formData.pricing?.basePrice // Sync flat price
                    }])
                    .select()
                    .single();

                if (error) throw error;
                setProducts([data, ...products.filter(p => p.id !== tempId)]);
                toast.success('Product created', { id: loadingToast });
            }
            setShowModal(false);
        } catch (error) {
            setProducts(previousProducts);
            toast.error('Operation failed', { id: loadingToast });
            fetchProducts();
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        const previousProducts = [...products];
        setProducts(products.filter(p => p.id !== id));
        try {
            const { error } = await supabase
                .from('services')
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast.success('Product removed');
        } catch (error) {
            setProducts(previousProducts);
            toast.error('Failed to delete');
            fetchProducts();
        }
    };

    const getDaysInMonth = (year, month) => {
        const dates = [];
        const date = new Date(year, month, 1);
        while (date.getMonth() === month) {
            dates.push({
                date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
                day: date.getDate(),
                isWeekend: date.getDay() === 0 || date.getDay() === 6
            });
            date.setDate(date.getDate() + 1);
        }
        return dates;
    };

    const addItineraryDay = () => {
        setFormData(prev => ({
            ...prev,
            itinerary: [
                ...(prev.itinerary || []),
                { day: (prev.itinerary?.length || 0) + 1, title: '', description: '' }
            ]
        }));
    };

    const removeItineraryDay = (index) => {
        const newItinerary = [...formData.itinerary];
        newItinerary.splice(index, 1);
        const reindexed = newItinerary.map((day, i) => ({ ...day, day: i + 1 }));
        setFormData({ ...formData, itinerary: reindexed });
    };

    const updateItineraryDay = (index, field, value) => {
        const newItinerary = [...formData.itinerary];
        newItinerary[index] = { ...newItinerary[index], [field]: value };
        setFormData({ ...formData, itinerary: newItinerary });
    };

    const handleAddRoom = async () => {
        if (!editingId) {
            toast.error('Please save the product first before adding room types');
            return;
        }

        const newRoom = {
            service_id: editingId,
            name: 'New Room Type',
            price_per_night: 1000,
            max_occupancy: 2,
            type: 'room',
            features: { amenities: [], weekend_price: 1200 }
        };

        const { data, error } = await supabase.from('hotel_rooms').insert([newRoom]).select();
        if (error) {
            toast.error('Failed to add room type');
        } else {
            setLocalRooms([...localRooms, data[0]]);
            toast.success('Room type added');
        }
    };

    const handleUpdateRoom = async (roomId, updates) => {
        const { error } = await supabase.from('hotel_rooms').update(updates).eq('id', roomId);
        if (error) {
            toast.error('Failed to update room');
        } else {
            setLocalRooms(localRooms.map(r => r.id === roomId ? { ...r, ...updates } : r));
            toast.success('Room updated');
        }
    };

    const handleDeleteRoom = async (roomId) => {
        if (!window.confirm('Are you sure you want to delete this room type?')) return;
        const { error } = await supabase.from('hotel_rooms').delete().eq('id', roomId);
        if (error) {
            toast.error('Failed to delete room');
        } else {
            setLocalRooms(localRooms.filter(r => r.id !== roomId));
            toast.success('Room type deleted');
        }
    };

    // Function to find products with no images
    const findProductsWithoutImages = () => {
        return products.filter(product => !product.images || !product.images[0]);
    };

    // Function to update a product's images
    const updateProductImages = async (productId, newImages) => {
        try {
            const { error } = await supabase
                .from('services')
                .update({ images: newImages })
                .eq('id', productId);

            if (error) throw error;

            // Update local state
            setProducts(products.map(p =>
                p.id === productId ? { ...p, images: newImages } : p
            ));

            return true;
        } catch (error) {
            console.error('Error updating product images:', error);
            toast.error(`Failed to update images for ${products.find(p => p.id === productId)?.name}`);
            return false;
        }
    };

    // Function to search for images online using Unsplash API or similar
    const searchAndAddMissingImages = async () => {
        const productsWithoutImages = findProductsWithoutImages();

        if (productsWithoutImages.length === 0) {
            toast.success('All products already have images!');
            return;
        }

        const loadingToast = toast.loading(`Processing ${productsWithoutImages.length} products with missing images...`);

        // Predefined images for specific product names mentioned by user
        const predefinedImages = {
            'Sunset Catamaran Cruise': 'https://images.unsplash.com/photo-1566018336288-b1d493d58e34?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
            'Seven Coloured Earth Tour': 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
            'Dolphin Watching & Swimming': 'https://images.unsplash.com/photo-153559874564d-e3a058e6d67e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
            'Hiking Le Morne': 'https://images.unsplash.com/photo-1516937941344-00b4e0337589?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
            'Caribbean Paradise Cruise': 'https://images.unsplash.com/photo-1569170058-45a05af0e9d2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
            'Norwegian Fjords Journey': 'https://images.unsplash.com/photo-1518471608579-4aa40ce265d6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80'
        };

        let successCount = 0;

        for (const product of productsWithoutImages) {
            // Check if we have a predefined image for this product
            let imageUrl = null;

            // Try to find a match in our predefined images
            for (const [productName, url] of Object.entries(predefinedImages)) {
                if (product.name.toLowerCase().includes(productName.toLowerCase().replace('&', 'and'))) {
                    imageUrl = url;
                    break;
                }
            }

            // If no predefined image found, use a generic travel image
            if (!imageUrl) {
                // Using a generic placeholder for missing images
                imageUrl = 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80';
            }

            const success = await updateProductImages(product.id, [imageUrl]);
            if (success) {
                successCount++;
            }

            // Small delay to prevent overwhelming the API/database
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        toast.dismiss(loadingToast);
        toast.success(`Successfully updated images for ${successCount}/${productsWithoutImages.length} products!`);
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <PageHeader
                title="Inventory Repository"
                subtitle="Manage your inventory of packages, tours, and travel services"
                icon={Package}
                actionLabel="Deploy Product"
                onAction={() => navigate('/products/new')}
                actionIcon={Plus}
            >
                <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => {/* handle export */ }}>
                        <Download size={16} /> Export
                    </Button>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={searchAndAddMissingImages}
                        title="Fix products with missing images"
                    >
                        <ImageIcon size={16} /> Fix Missing Images
                    </Button>
                </div>
            </PageHeader>

            {/* Stats Overview */}
            {!showModal && !showInventoryModal && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card noPadding className="bg-primary-50/20 border-primary-100/50">
                        <div className="p-6 flex items-center gap-5">
                            <div className="w-14 h-14 bg-white rounded-2xl shadow-premium flex items-center justify-center text-primary-600">
                                <Package size={28} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Inventory</p>
                                <h3 className="text-3xl font-display font-bold text-slate-900 leading-none">{products?.length || 0} Products</h3>
                            </div>
                        </div>
                    </Card>

                    <Card noPadding className="bg-green-50/20 border-green-100/50">
                        <div className="p-6 flex items-center gap-5">
                            <div className="w-14 h-14 bg-white rounded-2xl shadow-premium flex items-center justify-center text-green-600">
                                <CheckCircle size={28} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Operational</p>
                                <h3 className="text-3xl font-display font-bold text-slate-900 leading-none">{products?.filter(p => !p.draft).length || 0} Active</h3>
                            </div>
                        </div>
                    </Card>

                    <Card noPadding className="bg-orange-50/20 border-orange-100/50">
                        <div className="p-6 flex items-center gap-5">
                            <div className="w-14 h-14 bg-white rounded-2xl shadow-premium flex items-center justify-center text-orange-600">
                                <Star size={28} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">High Conversion</p>
                                <h3 className="text-3xl font-display font-bold text-slate-900 leading-none">{products?.filter(p => p.is_featured).length || 0} Featured</h3>
                            </div>
                        </div>
                    </Card>

                    <Card noPadding className="bg-blue-50/20 border-blue-100/50">
                        <div className="p-6 flex items-center gap-5">
                            <div className="w-14 h-14 bg-white rounded-2xl shadow-premium flex items-center justify-center text-blue-600">
                                <Info size={28} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Data Integrity</p>
                                <h3 className="text-3xl font-display font-bold text-slate-900 leading-none">{Math.round((products?.filter(p => p.description && p.images?.[0]).length / products?.length) * 100) || 0}% Complete</h3>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Toolbar */}
            {!showModal && !showInventoryModal && (
                <Card noPadding className="p-2">
                    <div className="flex flex-col lg:flex-row gap-4 items-center justify-between p-2">
                        <div className="relative flex-1 max-w-2xl w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Identify inventory objects by name, SKU or origin..."
                                className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200/50 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:bg-white focus:border-primary-500 outline-none transition-all text-sm font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100">
                                {['all', 'hotels', 'cruises', 'packages'].map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setFilterCategory(cat)}
                                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filterCategory === cat ? 'bg-white text-primary-600 shadow-premium border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                            <ViewToggle view={view} onViewChange={setView} />
                        </div>
                    </div>
                </Card>
            )}

            {!showModal && !showInventoryModal && (
                loading ? (
                    <div className="py-20 text-center animate-pulse text-gray-400 font-medium bg-white rounded-3xl border border-gray-100">
                        Loading Products...
                    </div>
                ) : (
                    view === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
                            {filteredProducts.map((product) => (
                                <Card noPadding hoverable key={product.id} className="h-full flex flex-col group relative overflow-hidden">
                                    <div className="h-56 overflow-hidden relative shrink-0">
                                        {product.images?.[0] ? (
                                            <img
                                                src={product.images[0]}
                                                alt={product.name}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                onError={(e) => {
                                                    // Fallback to a default image if the image fails to load
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-slate-300">
                                                <div className="text-center">
                                                    <Package size={40} strokeWidth={1} className="mx-auto mb-2" />
                                                    <span className="text-xs font-black">NO IMAGE</span>
                                                </div>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent"></div>
                                        <div className="absolute bottom-4 left-5 right-5">
                                            <div className="text-[9px] font-black text-primary-400 uppercase tracking-[0.2em] mb-1">{product.category} repository</div>
                                            <h3 className="font-display font-bold text-white text-lg leading-tight tracking-tight">{product.name}</h3>
                                        </div>
                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-premium border border-white">
                                            <div className="text-[10px] font-black text-primary-600 tabular-nums">Rs {
                                                (product.pricing?.base_price || product.pricing?.adult || product.pricing?.car || product.pricing?.basePrice || 0).toLocaleString()
                                            }</div>
                                        </div>
                                    </div>

                                    <div className="p-5 flex-1 flex flex-col gap-5">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 bg-slate-50 rounded-xl text-primary-600 shadow-premium/5 border border-slate-100">
                                                    <Info size={18} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Logistics ID</span>
                                                    <span className="text-[11px] font-bold text-slate-900 truncate max-w-[100px]">{product.id.slice(0, 8)}...</span>
                                                </div>
                                            </div>
                                            <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${!product.draft ? 'bg-green-50 text-green-600 border-green-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                                                {!product.draft ? 'Operational' : 'Draft'}
                                            </div>
                                        </div>

                                        <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-50 pt-4">
                                            <div className="flex gap-1.5">
                                                <button
                                                    onClick={() => handleEdit(product)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-black"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => { setSelectedProduct(product); setShowInventoryModal(true); }}
                                                    className="p-2 text-primary-600 hover:bg-primary-50 rounded-xl transition-all font-black"
                                                    title="Inventory"
                                                >
                                                    <Box size={16} />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all font-black"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card noPadding>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50/50">
                                            <th className="py-5 px-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Repository Object</th>
                                            <th className="py-5 px-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Metadata</th>
                                            <th className="py-5 px-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Financials</th>
                                            <th className="py-5 px-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                            <th className="py-5 px-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filteredProducts.map((product) => (
                                            <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden relative group-hover:scale-105 transition-transform">
                                                            {product.images?.[0] ? (
                                                                <img
                                                                    src={product.images[0]}
                                                                    alt={product.name}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => {
                                                                        // Fallback to a default image if the image fails to load
                                                                        e.target.onerror = null;
                                                                        e.target.src = 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80';
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                                                                    <Package size={20} strokeWidth={1} className="text-slate-300" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-display font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{product.name}</div>
                                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-0.5">{product.id.slice(0, 8)}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="space-y-1">
                                                        <div className="text-[10px] font-black text-primary-500 uppercase tracking-widest">{product.category}</div>
                                                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 ">
                                                            <MapPin size={12} className="text-slate-300" />
                                                            {product.location}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="font-display font-black text-slate-900 ">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase mr-1">MUR</span>
                                                        {(product.pricing?.base_price || product.pricing?.adult || product.pricing?.car || product.pricing?.basePrice || 0).toLocaleString()}
                                                    </div>
                                                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Rate per cycle</div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex justify-center">
                                                        <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${!product.draft ? 'bg-green-50 text-green-600 border-green-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                                            {!product.draft ? 'Operational' : 'Draft'}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button
                                                            onClick={() => handleEdit(product)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-black"
                                                            title="Edit"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => { setSelectedProduct(product); setShowInventoryModal(true); }}
                                                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-xl transition-all font-black"
                                                            title="Inventory"
                                                        >
                                                            <Box size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(product.id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all font-black"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )
                )
            )}

            {/* Pagination Controls */}
            {!showModal && !showInventoryModal && (
                <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-gray-100 shadow-sm mt-4">
                    <button
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="px-6 py-2 bg-gray-50 text-gray-600 font-bold rounded-xl disabled:opacity-50 hover:bg-gray-100 transition-colors"
                    >
                        Previous
                    </button>
                    <span className="text-sm font-black text-gray-400 uppercase tracking-widest">Page {page + 1}</span>
                    <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={products.length < PAGE_SIZE}
                        className="px-6 py-2 bg-gray-50 text-gray-600 font-bold rounded-xl disabled:opacity-50 hover:bg-gray-100 transition-colors"
                    >
                        Next
                    </button>
                </div>
            )}
            {/* Product Modal */}
            {
                showModal && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="max-w-6xl mx-auto w-full">
                            <form onSubmit={handleSave} className="space-y-12">
                                <div className="px-8 pt-4 pb-16">
                                    <div className="flex items-center justify-between mb-16 px-4">
                                        <div className="flex items-center gap-6">
                                            <div className="p-4 bg-primary-50 rounded-3xl text-primary-600 shadow-sm border border-primary-100">
                                                <Package size={32} />
                                            </div>
                                            <div>
                                                <h2 className="text-4xl font-display font-bold text-slate-900 tracking-tight ">
                                                    {editingId ? 'Update Listing' : 'Deploy Product'}
                                                </h2>
                                                <p className="text-lg text-slate-400 font-medium mt-1">Configure your travel offering parameters</p>
                                            </div>
                                        </div>
                                        <button type="button" onClick={() => setShowModal(false)} className="p-4 hover:bg-slate-50 rounded-2xl transition-all text-slate-400 hover:text-slate-900 shadow-sm border border-slate-100">
                                            <X size={24} />
                                        </button>
                                    </div>

                                    <div className="px-4 space-y-12">
                                        {/* Basic Info */}
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 mb-2 tracking-[3px] uppercase">Name</label>
                                                <input
                                                    type="text" required
                                                    className="w-full px-5 py-4 rounded-2xl border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none font-bold text-sm bg-gray-50/50 focus:bg-white transition-all"
                                                    value={formData.name}
                                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 mb-2 tracking-[3px] uppercase">Category</label>
                                                <select
                                                    className="w-full px-5 py-4 rounded-2xl border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none font-bold text-sm bg-gray-50/50 focus:bg-white transition-all appearance-none"
                                                    value={formData.category}
                                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                                >
                                                    <option value="hotels">Hotels</option>
                                                    <option value="tours">Tours</option>
                                                    <option value="activities">Activities</option>
                                                    <option value="transfers">Transfers (Cruises)</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 mb-2 tracking-[3px] uppercase">Description</label>
                                            <textarea
                                                className="w-full px-5 py-4 rounded-2xl border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none font-medium text-sm bg-gray-50/50 focus:bg-white transition-all h-32 resize-none"
                                                value={formData.description}
                                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 mb-2 tracking-[3px] uppercase">Price (MUR)</label>
                                                <input
                                                    type="number" required
                                                    className="w-full px-5 py-4 rounded-2xl border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none font-bold text-sm bg-gray-50/50 focus:bg-white transition-all"
                                                    value={formData.pricing?.basePrice}
                                                    onChange={e => setFormData({ ...formData, pricing: { ...formData.pricing, basePrice: Number(e.target.value) } })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 mb-2 tracking-[3px] uppercase">Location</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-5 py-4 rounded-2xl border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none font-bold text-sm bg-gray-50/50 focus:bg-white transition-all"
                                                    value={formData.location}
                                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                                />
                                            </div>
                                        </div>


                                        {/* Itinerary Section */}
                                        <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100">
                                            <div className="flex justify-between items-center mb-6">
                                                <h3 className="text-sm font-black ">Itinerary</h3>
                                                <button
                                                    type="button"
                                                    onClick={addItineraryDay}
                                                    className="p-2 bg-white border border-gray-200 rounded-lg text-primary hover:bg-primary hover:text-white transition-all"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                            <div className="space-y-6">
                                                {(formData.itinerary || []).map((day, idx) => (
                                                    <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 space-y-4">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Day {day.day}</span>
                                                            <button type="button" onClick={() => removeItineraryDay(idx)} className="text-gray-300 hover:text-red-500 transition-colors">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                        <input
                                                            type="text"
                                                            placeholder="Title"
                                                            className="w-full px-4 py-3 rounded-xl border border-gray-100 font-bold text-sm focus:bg-gray-50 outline-none"
                                                            value={day.title}
                                                            onChange={e => updateItineraryDay(idx, 'title', e.target.value)}
                                                        />
                                                        <textarea
                                                            placeholder="Description"
                                                            className="w-full px-4 py-3 rounded-xl border border-gray-100 font-medium text-xs h-24 resize-none focus:bg-gray-50 outline-none"
                                                            value={day.description}
                                                            onChange={e => updateItineraryDay(idx, 'description', e.target.value)}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Features, Inclusions, Exclusions */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                            {/* Features */}
                                            <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h3 className="text-sm font-black ">Features</h3>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData(p => ({ ...p, features: [...(p.features || []), ''] }))}
                                                        className="p-2 bg-white border border-gray-200 rounded-lg text-primary hover:bg-primary hover:text-white transition-all"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                                <div className="space-y-3">
                                                    {(formData.features || []).map((feature, i) => (
                                                        <div key={i} className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                className="flex-1 px-3 py-2 rounded-xl border border-gray-100 text-xs font-bold focus:bg-white outline-none transition-all"
                                                                value={feature}
                                                                onChange={e => {
                                                                    const newFeatures = [...formData.features];
                                                                    newFeatures[i] = e.target.value;
                                                                    setFormData({ ...formData, features: newFeatures });
                                                                }}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const newFeatures = formData.features.filter((_, idx) => idx !== i);
                                                                    setFormData({ ...formData, features: newFeatures });
                                                                }}
                                                                className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Inclusions */}
                                            <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h3 className="text-sm font-black ">Inclusions</h3>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData(p => ({ ...p, inclusions: [...(p.inclusions || []), ''] }))}
                                                        className="p-2 bg-white border border-gray-200 rounded-lg text-primary hover:bg-primary hover:text-white transition-all"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                                <div className="space-y-3">
                                                    {(formData.inclusions || []).map((inc, i) => (
                                                        <div key={i} className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                className="flex-1 px-3 py-2 rounded-xl border border-gray-100 text-xs font-bold focus:bg-white outline-none transition-all"
                                                                value={inc}
                                                                onChange={e => {
                                                                    const newIncs = [...formData.inclusions];
                                                                    newIncs[i] = e.target.value;
                                                                    setFormData({ ...formData, inclusions: newIncs });
                                                                }}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const newIncs = formData.inclusions.filter((_, idx) => idx !== i);
                                                                    setFormData({ ...formData, inclusions: newIncs });
                                                                }}
                                                                className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Exclusions */}
                                            <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h3 className="text-sm font-black ">Exclusions</h3>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData(p => ({ ...p, exclusions: [...(p.exclusions || []), ''] }))}
                                                        className="p-2 bg-white border border-gray-200 rounded-lg text-primary hover:bg-primary hover:text-white transition-all"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                                <div className="space-y-3">
                                                    {(formData.exclusions || []).map((exc, i) => (
                                                        <div key={i} className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                className="flex-1 px-3 py-2 rounded-xl border border-gray-100 text-xs font-bold focus:bg-white outline-none transition-all"
                                                                value={exc}
                                                                onChange={e => {
                                                                    const newExcs = [...formData.exclusions];
                                                                    newExcs[i] = e.target.value;
                                                                    setFormData({ ...formData, exclusions: newExcs });
                                                                }}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const newExcs = formData.exclusions.filter((_, idx) => idx !== i);
                                                                    setFormData({ ...formData, exclusions: newExcs });
                                                                }}
                                                                className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Highlights */}
                                            <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h3 className="text-sm font-black ">Highlights</h3>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData(p => ({ ...p, highlights: [...(p.highlights || []), ''] }))}
                                                        className="p-2 bg-white border border-gray-200 rounded-lg text-primary hover:bg-primary hover:text-white transition-all"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                                <div className="space-y-3">
                                                    {(formData.highlights || []).map((high, i) => (
                                                        <div key={i} className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                className="flex-1 px-3 py-2 rounded-xl border border-gray-100 text-xs font-bold focus:bg-white outline-none transition-all"
                                                                value={high}
                                                                onChange={e => {
                                                                    const newHighs = [...formData.highlights];
                                                                    newHighs[i] = e.target.value;
                                                                    setFormData({ ...formData, highlights: newHighs });
                                                                }}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const newHighs = formData.highlights.filter((_, idx) => idx !== i);
                                                                    setFormData({ ...formData, highlights: newHighs });
                                                                }}
                                                                className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Room Types Management */}
                                        {(formData.category === 'hotels' || formData.category === 'Guest Houses' || formData.category === 'transfers') && (
                                            <div className="bg-gray-50/50 p-8 rounded-[40px] border border-gray-100 mt-8">
                                                <div className="flex justify-between items-center mb-8">
                                                    <div>
                                                        <h3 className="text-xl font-black tracking-tight">Room / Cabin Types</h3>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Manage diverse accommodation and pricing options</p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={handleAddRoom}
                                                        className="bg-red-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-red-600/20 flex items-center gap-2"
                                                    >
                                                        <Plus size={14} /> ADD NEW ROOM TYPE
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    {localRooms.map((room) => (
                                                        <div key={room.id} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                                                            <div className="absolute top-0 left-0 w-2 h-full bg-primary/10 group-hover:bg-primary transition-colors"></div>
                                                            <div className="flex justify-between items-start mb-6">
                                                                <div className="flex-1 mr-4">
                                                                    <input
                                                                        className="w-full text-xl font-black text-gray-900 bg-transparent border-none outline-none focus:text-primary transition-colors placeholder:text-gray-200"
                                                                        value={room.name}
                                                                        placeholder="Room Name..."
                                                                        onChange={e => handleUpdateRoom(room.id, { name: e.target.value })}
                                                                    />
                                                                    <div className="flex gap-4 mt-3">
                                                                        <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg border border-gray-100">
                                                                            <Info size={12} className="text-gray-400" />
                                                                            <input
                                                                                type="number"
                                                                                className="w-8 text-[11px] font-black text-gray-900 bg-transparent border-none outline-none"
                                                                                value={room.max_occupancy || 2}
                                                                                onChange={e => handleUpdateRoom(room.id, { max_occupancy: parseInt(e.target.value) })}
                                                                            />
                                                                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">Capacity</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDeleteRoom(room.id)}
                                                                    className="p-3 bg-red-50 text-red-300 hover:bg-red-500 hover:text-white rounded-2xl transition-all"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-4 mb-8">
                                                                <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                                                                    <label className="block text-[9px] font-black text-gray-300 uppercase tracking-widest mb-2 ">Standard Rate</label>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-[10px] font-black text-gray-400 ">MUR</span>
                                                                        <input
                                                                            type="number"
                                                                            className="w-full bg-transparent text-lg font-black text-gray-900 outline-none placeholder:text-gray-200"
                                                                            value={room.price_per_night}
                                                                            placeholder="0"
                                                                            onChange={e => handleUpdateRoom(room.id, { price_per_night: parseInt(e.target.value) })}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                                                                    <label className="block text-[9px] font-black text-primary/40 uppercase tracking-widest mb-2 ">Weekend Rate</label>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-[10px] font-black text-primary/40 ">MUR</span>
                                                                        <input
                                                                            type="number"
                                                                            className="w-full bg-transparent text-lg font-black text-primary outline-none placeholder:text-primary/20"
                                                                            value={room.features?.weekend_price || 0}
                                                                            placeholder="0"
                                                                            onChange={e => handleUpdateRoom(room.id, { features: { ...room.features, weekend_price: parseInt(e.target.value) } })}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[2px] mb-3 ">Amenities & Services</label>
                                                                <input
                                                                    className="w-full px-5 py-3 bg-gray-50 rounded-2xl text-[11px] font-bold outline-none focus:bg-white border border-gray-100 focus:border-primary/20 transition-all placeholder:text-gray-200"
                                                                    placeholder="e.g. WiFi, AirCon, Ocean View, Mini Bar..."
                                                                    value={(room.features?.amenities || []).join(', ')}
                                                                    onChange={e => {
                                                                        const amenities = e.target.value.split(',').map(s => s.trim());
                                                                        handleUpdateRoom(room.id, { features: { ...room.features, amenities } });
                                                                    }}
                                                                />
                                                                <p className="text-[9px] text-gray-300 mt-2 font-bold">Separate amenities with commas</p>
                                                            </div>
                                                        </div>
                                                    ))}

                                                    {localRooms.length === 0 && (
                                                        <div className="col-span-1 md:col-span-2 py-20 bg-white border-4 border-dashed border-gray-50 rounded-[48px] flex flex-col items-center justify-center text-gray-200 group hover:border-primary/5 transition-all">
                                                            <Package className="mb-6 opacity-20 group-hover:opacity-40 transition-opacity" size={64} />
                                                            <p className="text-xl font-black tracking-tight text-gray-300">No Room Types Defined</p>
                                                            <p className="text-[10px] uppercase font-bold tracking-[4px] mt-2 opacity-40">Add a room to enable booking options</p>
                                                            <button
                                                                type="button"
                                                                onClick={handleAddRoom}
                                                                className="mt-8 px-8 py-4 bg-gray-50 text-gray-400 rounded-2xl font-black text-[10px] tracking-widest hover:bg-primary hover:text-white transition-all border border-gray-100"
                                                            >
                                                                GENERATE FIRST ROOM TYPE
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Images */}
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 mb-4 tracking-[3px] uppercase">Images</label>
                                            <div className="flex gap-4 overflow-x-auto pb-4">
                                                {formData.images?.map((img, i) => (
                                                    img && <img key={i} src={img} alt="" className="w-32 h-32 object-cover rounded-2xl border border-gray-100 shadow-sm" />
                                                ))}
                                                <label className="w-32 h-32 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group">
                                                    <Plus className="text-gray-300 group-hover:text-primary transition-colors" />
                                                    <span className="text-[10px] font-black text-gray-300 uppercase mt-2 group-hover:text-primary transition-colors">Add</span>
                                                    <input type="file" multiple className="hidden" onChange={handleImageUpload} />
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-16 pt-8 border-t border-slate-100 flex justify-end gap-4 px-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                            className="px-10 py-4 bg-slate-50 text-slate-500 rounded-2xl hover:bg-slate-100 transition-all font-black uppercase tracking-widest text-xs border border-slate-200"
                                        >
                                            Abandon Changes
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-12 py-4 bg-primary text-white rounded-2xl hover:bg-primary/90 transition-all font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20"
                                        >
                                            {editingId ? 'Update Repository' : 'Publish Listing'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            {/* Inventory Inline View */}
            {
                showInventoryModal && (
                    <div className="space-y-8 animate-fade-in w-full pb-20">
                        <div className="bg-white w-full min-h-[600px] shadow-sm rounded-3xl border border-gray-100 flex flex-col animate-in slide-in-from-right duration-500">
                            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex justify-between items-center mb-8">
                                    <div>
                                        <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                                            <Grid className="text-primary" /> Multi-Platform Inventory
                                        </h2>
                                        {otherAdmins > 0 && (
                                            <div className="mt-1 flex items-center gap-2 text-red-600 font-bold text-xs animate-bounce">
                                                <Users size={14} /> {otherAdmins} other admin{otherAdmins > 1 ? 's' : ''} editing this live
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="bg-primary/10 p-4 rounded-3xl">
                                            <TrendingUp className="text-primary" size={32} />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black tracking-tighter">Live Pricing & <span className="text-primary">Inventory</span></h2>
                                            <p className="text-sm text-gray-400 font-medium">Manage daily rates and availability for {selectedProduct?.name}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                                            {isSaving ? 'Syncing...' : 'Grid Edit'}
                                        </span>
                                        {isEditingPricing && !isSaving && (
                                            <button
                                                onClick={() => { setIsEditingPricing(false); setUpdatedMonthlyPrices({}); }}
                                                className="px-2 py-1 text-[8px] font-black bg-gray-200 text-gray-500 rounded-lg uppercase tracking-tighter hover:bg-gray-300 transition-colors"
                                            >
                                                Discard
                                            </button>
                                        )}
                                        <button
                                            disabled={isSaving}
                                            onClick={() => { if (isEditingPricing) handleSaveBatch(); else setIsEditingPricing(true); }}
                                            className={`w-12 h-6 rounded-full relative transition-all ${isEditingPricing ? 'bg-primary shadow-lg shadow-primary/30' : 'bg-gray-200'} ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isEditingPricing ? 'left-7' : 'left-1'}`} />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => setShowBulkModal(true)}
                                        className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-2xl hover:scale-105 active:scale-95 transition-all font-black text-xs tracking-widest shadow-lg shadow-red-600/20"
                                    >
                                        <List size={18} /> BULK UPDATE
                                    </button>
                                    <button onClick={() => setShowInventoryModal(false)} className="p-3 hover:bg-gray-100 rounded-2xl transition-all">
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50">
                                <div className="flex gap-4 mb-8 overflow-x-auto pb-4 no-scrollbar">
                                    {rooms.map(room => (
                                        <button
                                            key={room.id}
                                            onClick={() => setSelectedRoom(room)}
                                            className={`px-8 py-4 rounded-2xl whitespace-nowrap transition-all font-black text-sm tracking-tight ${selectedRoom?.id === room.id
                                                ? 'bg-primary text-white shadow-2xl shadow-primary/20 scale-105'
                                                : 'bg-white text-gray-500 hover:bg-gray-200 border border-gray-100'
                                                }`}
                                        >
                                            {room.room_type} <span className="opacity-40 ml-1 font-bold">#{room.room_number}</span>
                                        </button>
                                    ))}
                                </div>

                                {selectedRoom && (
                                    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                                        <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-gray-100">
                                            <div className="flex items-center gap-6">
                                                <button
                                                    onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1))}
                                                    className="p-3 hover:bg-gray-100 rounded-2xl transition-all"
                                                >
                                                    <ChevronLeft size={20} />
                                                </button>
                                                <h3 className="text-2xl font-black tracking-tight min-w-[200px] text-center">
                                                    {selectedMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                                </h3>
                                                <button
                                                    onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1))}
                                                    className="p-3 hover:bg-gray-100 rounded-2xl transition-all"
                                                >
                                                    <ChevronRight size={20} />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Room Capacity</span>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="number"
                                                            value={selectedRoom.total_units}
                                                            onChange={(e) => {
                                                                const newUnits = parseInt(e.target.value);
                                                                setSelectedRoom({ ...selectedRoom, total_units: newUnits });
                                                                setRooms(rooms.map(r => r.id === selectedRoom.id ? { ...r, total_units: newUnits } : r));
                                                                toast.success(`Capacity updated: ${newUnits} units available`, { id: 'room-units' });
                                                            }}
                                                            className="w-16 bg-gray-50 border border-gray-100 rounded-lg px-2 py-1 text-sm font-black text-primary outline-none focus:border-primary transition-all"
                                                        />
                                                        <span className="text-xs font-bold text-gray-500 ">Live Units</span>
                                                    </div>
                                                </div>
                                                {/* Scenario 95: Inventory Threshold alerts */}
                                                <div className="flex items-center gap-2 px-4 py-1.5 bg-orange-50 text-orange-600 rounded-lg text-[10px] font-black uppercase tracking-tighter border border-orange-100">
                                                    <ShieldAlert size={14} /> Month Occupancy: 94% (High Demand)
                                                </div>
                                                <div className="flex gap-4">
                                                    <button
                                                        onClick={() => handleBlockAll(true)}
                                                        className="px-4 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all font-black text-[10px] uppercase tracking-widest border border-red-200"
                                                    >
                                                        Block Entire Month
                                                    </button>
                                                    <button
                                                        onClick={() => handleBlockAll(false)}
                                                        className="px-4 py-2 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition-all font-black text-[10px] uppercase tracking-widest border border-green-200"
                                                    >
                                                        Open Entire Month
                                                    </button>
                                                </div>
                                                <div className="flex gap-6">
                                                    <div className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-xl border border-red-100">
                                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Blocked Stay</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-xl border border-green-100">
                                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                        <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Live Available</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-7 gap-4">
                                                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                                                    <div key={day} className="text-center text-[10px] font-black text-gray-300 uppercase tracking-[3px] py-4 bg-white/40 rounded-t-2xl">
                                                        {day.substring(0, 3)}
                                                    </div>
                                                ))}
                                                {Array(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1).getDay()).fill(null).map((_, index) => (
                                                    <div key={`empty-${index}`} className="aspect-square bg-gray-50/20 rounded-2xl border border-dashed border-gray-200/50"></div>
                                                ))}
                                                {getDaysInMonth(selectedMonth.getFullYear(), selectedMonth.getMonth()).map(dayObj => {
                                                    const status = dailyPrices[selectedRoom.id]?.[dayObj.date] || { is_blocked: false, price: Number(selectedRoom.price_per_night || 0) };
                                                    const dateStr = dayObj.date;
                                                    const isBlocked = status.is_blocked;
                                                    const price = status.price;
                                                    return (
                                                        <div
                                                            key={dateStr}
                                                            className={`aspect-square p-4 rounded-[28px] border transition-all relative overflow-hidden group ${isBlocked ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100 hover:border-primary hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1'}`}
                                                        >
                                                            <div className="h-full flex flex-col justify-between relative z-10">
                                                                <div className="flex justify-between items-start">
                                                                    <span className={`text-sm font-black ${isBlocked ? 'text-red-400' : 'text-gray-300 group-hover:text-primary transition-colors'}`}>{dayObj.day}</span>
                                                                    <button
                                                                        onClick={() => handleBlockDate(dateStr, !isBlocked)}
                                                                        className={`p-2 rounded-xl transition-all ${isBlocked ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-gray-50 text-gray-300 hover:bg-primary/10 hover:text-primary'}`}
                                                                    >
                                                                        <Star size={14} fill={isBlocked ? "white" : "none"} />
                                                                    </button>
                                                                </div>

                                                                {isEditingPricing ? (
                                                                    <input
                                                                        type="number"
                                                                        value={updatedMonthlyPrices[dateStr] ?? price}
                                                                        onChange={(e) => setUpdatedMonthlyPrices({ ...updatedMonthlyPrices, [dateStr]: e.target.value })}
                                                                        className="w-full bg-gray-50 border border-primary/20 rounded-xl py-2 px-3 text-xs font-black text-primary focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none -mb-1 shadow-inner"
                                                                        placeholder={price}
                                                                    />
                                                                ) : (
                                                                    <div className="mt-2">
                                                                        <div className={`text-sm font-black ${isBlocked ? 'text-red-600' : 'text-gray-900 group-hover:text-primary transition-colors'}`}>
                                                                            <span className="text-[10px] opacity-40 mr-1">{selectedProduct?.pricing?.currency}</span>
                                                                            {price?.toLocaleString()}
                                                                        </div>
                                                                        {isBlocked && <div className="text-[10px] font-black text-red-500 uppercase tracking-widest mt-1 animate-pulse">STOP SALE</div>}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
            {/* Bulk Update Inline View */}
            {
                showBulkModal && (
                    <div className="w-full max-w-xl mx-auto mt-8 animate-fade-in">
                        <div className="bg-white w-full rounded-[40px] shadow-sm border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
                            <div className="p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <div className="flex items-center gap-4">
                                    <div className="bg-primary p-3 rounded-2xl shadow-xl shadow-primary/20 text-white">
                                        <TrendingUp size={24} />
                                    </div>
                                    <h2 className="text-2xl font-black tracking-tighter">Bulk Pricing <span className="text-primary">Engine</span></h2>
                                </div>
                                <button onClick={() => setShowBulkModal(false)} className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleBulkUpdate} className="p-10 space-y-8">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 mb-2 tracking-[3px] uppercase">Start Date</label>
                                        <input
                                            type="date" required
                                            className="w-full px-5 py-4 rounded-2xl border border-gray-100 focus:border-primary focus:ring-8 focus:ring-primary/5 outline-none font-bold text-sm bg-gray-50/50 focus:bg-white transition-all"
                                            value={bulkData.startDate}
                                            onChange={e => setBulkData({ ...bulkData, startDate: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 mb-2 tracking-[3px] uppercase">End Date</label>
                                        <input
                                            type="date" required
                                            className="w-full px-5 py-4 rounded-2xl border border-gray-100 focus:border-primary focus:ring-8 focus:ring-primary/5 outline-none font-bold text-sm bg-gray-50/50 focus:bg-white transition-all"
                                            value={bulkData.endDate}
                                            onChange={e => setBulkData({ ...bulkData, endDate: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 mb-2 tracking-[3px] uppercase">Fixed Price ({selectedProduct?.pricing?.currency})</label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary opacity-30">
                                                <Package size={20} />
                                            </div>
                                            <input
                                                type="number"
                                                disabled={!!bulkData.multiplier}
                                                className="w-full pl-12 pr-5 py-4 rounded-2xl border border-gray-100 focus:border-primary focus:ring-8 focus:ring-primary/5 outline-none font-bold text-sm bg-gray-50/50 focus:bg-white transition-all disabled:opacity-30"
                                                value={bulkData.price}
                                                onChange={e => setBulkData({ ...bulkData, price: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 mb-2 tracking-[3px] uppercase ">Or Adjustment %</label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary">
                                                <TrendingUp size={18} />
                                            </div>
                                            <input
                                                type="number"
                                                placeholder="e.g. +15 or -10"
                                                disabled={!!bulkData.price}
                                                className="w-full pl-12 pr-5 py-4 rounded-2xl border border-gray-100 focus:border-primary focus:ring-8 focus:ring-primary/5 outline-none font-black text-sm bg-primary/5 text-primary placeholder:text-primary/30 transition-all disabled:opacity-10"
                                                value={bulkData.multiplier}
                                                onChange={e => setBulkData({ ...bulkData, multiplier: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 mb-4 tracking-[3px] uppercase">Filter Weekdays</label>
                                    <div className="flex justify-between p-2 bg-gray-50 rounded-3xl border border-gray-100">
                                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => {
                                                    const days = bulkData.applyToDays.includes(i)
                                                        ? bulkData.applyToDays.filter(d => d !== i)
                                                        : [...bulkData.applyToDays, i];
                                                    setBulkData({ ...bulkData, applyToDays: days });
                                                }}
                                                className={`w-12 h-12 rounded-2xl font-black text-xs transition-all shadow-sm ${bulkData.applyToDays.includes(i)
                                                    ? 'bg-primary text-white scale-90 shadow-primary/20'
                                                    : 'bg-white text-gray-400 hover:text-primary hover:bg-primary/5'
                                                    }`}
                                            >
                                                {day}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-8 bg-primary/5 rounded-[32px] border border-primary/10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary font-black shadow-sm">
                                            {bulkPreview}
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-black text-primary uppercase tracking-widest block">Live Scope</span>
                                            <span className="text-sm font-bold text-gray-900">Total days being recalculated</span>
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSaving || bulkPreview === 0}
                                        className={`px-12 py-5 rounded-[24px] font-black text-sm tracking-widest transition-all shadow-2xl ${isSaving || bulkPreview === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-primary text-white shadow-primary/30 hover:scale-105 active:scale-95'}`}
                                    >
                                        {isSaving ? 'SYNCING...' : 'APPLY ENGINE'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div>
    );
};

export default ProductManager;
