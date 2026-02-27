import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import {
    TrendingUp,
    Calendar,
    Package,
    MessageSquare,
    Clock,
    CheckCircle,
    AlertCircle,
    Plus,
    ChevronRight,
    Loader2,
    ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';

const StatCard = ({ title, value, icon: Icon, color, link, subtitle }) => (
    <Link to={link || '#'} className="block group">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-primary-100 transition-all duration-300 relative overflow-hidden h-full">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-${color}-500/10 transition-colors`}></div>

            <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-2xl bg-${color}-50 flex items-center justify-center text-${color}-600 shadow-inner group-hover:scale-110 transition-transform`}>
                    <Icon size={24} />
                </div>
                <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400 opacity-60">
                    Active
                </div>
            </div>

            <div>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">{title}</p>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight group-hover:text-primary-600 transition-colors uppercase">{value}</h3>
                {subtitle && <p className="text-[10px] font-medium text-slate-500 mt-1">{subtitle}</p>}
            </div>
        </div>
    </Link>
);

const Dashboard = () => {
    const [stats, setStats] = useState({
        pendingBookings: [],
        recentMessages: [],
        counts: {
            bookings: 0,
            products: 0,
            messages: 0,
            featured: 0
        }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [
                { data: pendingBookings },
                { data: recentMessages },
                { count: productCount },
                { count: bookingCount },
                { count: featuredCount }
            ] = await Promise.all([
                supabase.from('bookings').select('*, services(name)').eq('status', 'pending').order('created_at', { ascending: false }).limit(5),
                supabase.from('contact_messages').select('*').order('created_at', { ascending: false }).limit(5),
                supabase.from('services').select('*', { count: 'exact', head: true }),
                supabase.from('bookings').select('*', { count: 'exact', head: true }),
                supabase.from('services').select('*', { count: 'exact', head: true }).eq('is_featured', true)
            ]);

            setStats({
                pendingBookings: pendingBookings || [],
                recentMessages: recentMessages || [],
                counts: {
                    bookings: bookingCount || 0,
                    products: productCount || 0,
                    messages: recentMessages?.length || 0,
                    featured: featuredCount || 0
                }
            });
        } catch (error) {
            console.error('Dashboard Data Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-primary-600" size={40} />
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest animate-pulse">Syncing Operational Core...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Action-Oriented Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                        Operational <span className="text-primary-600 uppercase">Center</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-2">Active business metrics and immediate tasks</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link to="/bookings">
                        <Button variant="secondary" size="sm" className="bg-white">
                            View All Bookings
                        </Button>
                    </Link>
                    <Link to="/products/new">
                        <Button size="sm" className="bg-primary-600 shadow-glow">
                            <Plus size={16} /> Deploy Product
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Core Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Active Inventory"
                    value={stats.counts.products}
                    icon={Package}
                    color="primary"
                    link="/products"
                    subtitle={`${stats.counts.featured} Featured items`}
                />
                <StatCard
                    title="Volume"
                    value={stats.counts.bookings}
                    icon={Calendar}
                    color="blue"
                    link="/bookings"
                    subtitle="Lifetime bookings"
                />
                <StatCard
                    title="Pending Needs"
                    value={stats.pendingBookings.length}
                    icon={AlertCircle}
                    color="orange"
                    link="/bookings"
                    subtitle="Requires attention"
                />
                <StatCard
                    title="Enquiries"
                    value={stats.counts.messages}
                    icon={MessageSquare}
                    color="indigo"
                    link="/messages"
                    subtitle="Last 5 messages"
                />
            </div>

            {/* Two-Column Action Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Priority Bookings Terminal */}
                <div className="lg:col-span-2 space-y-6">
                    <Card noPadding className="p-8 h-full">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Pending Confirmations</h3>
                                <p className="text-primary-600 text-[10px] font-black uppercase tracking-widest mt-1">Awaiting Agent Action</p>
                            </div>
                            <span className="px-3 py-1 bg-primary-50 text-primary-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-primary-100">
                                Priority High
                            </span>
                        </div>

                        <div className="space-y-4">
                            {stats.pendingBookings.map((booking) => (
                                <Link
                                    to={`/bookings`}
                                    key={booking.id}
                                    className="flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 rounded-2xl border border-slate-100 transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary-600 shadow-premium group-hover:scale-110 transition-transform">
                                            <Clock size={18} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 leading-none mb-1">{booking.customer_info?.name}</h4>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{booking.services?.name || 'Custom Package'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex items-center gap-6">
                                        <div className="hidden sm:block">
                                            <p className="text-xs font-bold text-slate-900">Rs {booking.total_price?.toLocaleString()}</p>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Est. Revenue</p>
                                        </div>
                                        <ChevronRight size={18} className="text-slate-300 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </Link>
                            ))}

                            {stats.pendingBookings.length === 0 && (
                                <div className="py-20 text-center flex flex-col items-center justify-center gap-4 opacity-40">
                                    <CheckCircle size={40} />
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">All queues clear</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* System Control & Shortcuts */}
                <div className="space-y-6">
                    {/* Market Insight Shortcut */}
                    <Link to="/analytics" className="block group">
                        <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-premium-xl relative overflow-hidden transition-all hover:scale-[1.02]">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary-500/20 transition-all"></div>
                            <div className="relative z-10">
                                <TrendingUp className="text-primary-500 mb-6" size={32} />
                                <h3 className="text-2xl font-black leading-tight mb-2 uppercase">Deep Analytics</h3>
                                <p className="text-slate-400 text-sm font-medium mb-6">Explore revenue trends, sector mix, and customer growth.</p>
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary-500">
                                    Launch Hub <ChevronRight size={12} strokeWidth={3} />
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* Quick Access Block */}
                    <Card noPadding className="p-6">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 px-2">System Anchors</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <Link to="/hero" className="p-4 bg-slate-50/50 hover:bg-white rounded-2xl border border-slate-100 hover:border-primary-100 hover:shadow-premium transition-all flex flex-col items-center gap-3 group text-center">
                                <ShieldCheck size={20} className="text-slate-400 group-hover:text-primary-600" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-900">CMS Core</span>
                            </Link>
                            <Link to="/settings" className="p-4 bg-slate-50/50 hover:bg-white rounded-2xl border border-slate-100 hover:border-primary-100 hover:shadow-premium transition-all flex flex-col items-center gap-3 group text-center">
                                <Package size={20} className="text-slate-400 group-hover:text-primary-600" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-900">Config</span>
                            </Link>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
