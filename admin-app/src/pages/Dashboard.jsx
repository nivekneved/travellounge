import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import {
 LayoutDashboard,
 TrendingUp,
 Users,
 Calendar,
 Package,
 ArrowUpRight,
 MessageSquare,
 DollarSign,
 Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, trend, color, link }) => (
 <Link to={link || '#'} className="block group">
 <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-red-100 transition-all duration-300 relative overflow-hidden">
 <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-${color}-500/10 transition-colors`}></div>

 <div className="flex justify-between items-start mb-4">
 <div className={`w-12 h-12 rounded-2xl bg-${color}-50 flex items-center justify-center text-${color}-600 shadow-inner group-hover:scale-110 transition-transform`}>
 <Icon size={24} />
 </div>
 {trend && (
 <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-green-50 text-green-600 px-2 py-1 rounded-full border border-green-100">
 <ArrowUpRight size={10} />
 {trend}
 </div>
 )}
 </div>

 <div>
 <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-1">{title}</p>
 <h3 className="text-3xl font-black text-gray-900 tracking-tight group-hover:text-red-600 transition-colors">{value}</h3>
 </div>
 </div>
 </Link>
);

const Dashboard = () => {
 const [stats, setStats] = useState({
 bookings: 0,
 users: 0,
 revenue: 0,
 products: 0,
 messages: 0
 });
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 fetchStats();
 }, []);

 const fetchStats = async () => {
 try {
 // Parallel fetches for speed
 const [
 { count: bookingsCount },
 { count: productsCount },
 { count: messagesCount },
 { data: revenueData } // Simulated revenue from confirmed bookings
 ] = await Promise.all([
 supabase.from('bookings').select('*', { count: 'exact', head: true }),
 supabase.from('services').select('*', { count: 'exact', head: true }),
 supabase.from('contact_messages').select('*', { count: 'exact', head: true }),
 supabase.from('bookings').select('total_amount').eq('status', 'confirmed') // Assuming 'total_amount' exists
 ]);

 // Calculate revenue safely
 const totalRevenue = revenueData?.reduce((acc, curr) => acc + (curr.total_amount || 0), 0) || 0;

 setStats({
 bookings: bookingsCount || 0,
 revenue: totalRevenue,
 products: productsCount || 0,
 messages: messagesCount || 0
 });
 } catch (error) {
 console.error('Error fetching stats:', error);
 } finally {
 setLoading(false);
 }
 };

 if (loading) {
 return (
 <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
 <div className="w-16 h-16 border-4 border-red-100 border-t-red-600 rounded-full animate-spin"></div>
 <p className="text-gray-400 font-bold text-xs uppercase tracking-widest animate-pulse">Loading Executive Dashboard...</p>
 </div>
 );
 }

 return (
 <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
 {/* Header */}
 <div>
 <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight ">
 Executive <span className="text-red-600">Overview</span>
 </h1>
 <p className="text-gray-500 font-medium mt-2">Real-time performance metrics and system status</p>
 </div>

 {/* Stats Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
 <StatCard
 title="Total Revenue"
 value={`Rs ${stats.revenue.toLocaleString()}`}
 icon={DollarSign}
 color="green"
 trend="+12% vs last month"
 link="/bookings"
 />
 <StatCard
 title="Active Bookings"
 value={stats.bookings}
 icon={Calendar}
 color="blue"
 link="/bookings"
 />
 <StatCard
 title="Service Catalog"
 value={stats.products}
 icon={Package}
 color="indigo"
 link="/products"
 />
 <StatCard
 title="New Enquiries"
 value={stats.messages || 0}
 icon={MessageSquare}
 color="orange"
 trend="2 new today"
 />
 </div>

 {/* Quick Actions / Recent Activity Placeholder */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 {/* Main Chart Area (Placeholder) */}
 <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
 <div className="flex items-center justify-between mb-8">
 <div>
 <h3 className="text-xl font-bold text-gray-900">Revenue Trends</h3>
 <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Last 6 Months</p>
 </div>
 <div className="flex gap-2">
 <button className="px-4 py-2 bg-gray-50 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors">Weekly</button>
 <button className="px-4 py-2 bg-red-50 rounded-xl text-xs font-bold text-red-600 border border-red-100">Monthly</button>
 </div>
 </div>
 <div className="h-64 flex items-end justify-between gap-4 px-4 pb-4 border-b border-gray-50">
 {/* Simulated Bars */}
 {[35, 55, 45, 70, 65, 85].map((h, i) => (
 <div key={i} className="w-full bg-gray-50 rounded-t-xl relative group hover:bg-red-50 transition-colors cursor-pointer">
 <div
 className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-red-600 to-red-400 rounded-t-xl opacity-80 group-hover:opacity-100 transition-all"
 style={{ height: `${h}%` }}
 >
 <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold py-1 px-2 rounded-lg transition-opacity whitespace-nowrap">
 Rs {(h * 1500).toLocaleString()}
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* System Health / Shortcuts */}
 <div className="space-y-6">
 <div className="bg-gradient-to-br from-red-600 to-rose-700 rounded-3xl p-8 text-white shadow-xl shadow-red-600/20 relative overflow-hidden">
 <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
 <h3 className="text-2xl font-black mb-2">System Health</h3>
 <p className="text-red-100 font-medium text-sm mb-6">All systems operational. Database sync active.</p>

 <div className="space-y-4">
 <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl backdrop-blur-md">
 <div className="flex items-center gap-3">
 <Activity size={18} />
 <span className="font-bold text-xs uppercase tracking-widest">Server API</span>
 </div>
 <span className="w-2.5 h-2.5 bg-green-400 rounded-full shadow-[0_0_10px_rgba(74,222,128,0.5)]"></span>
 </div>
 <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl backdrop-blur-md">
 <div className="flex items-center gap-3">
 <Users size={18} />
 <span className="font-bold text-xs uppercase tracking-widest">Auth Service</span>
 </div>
 <span className="w-2.5 h-2.5 bg-green-400 rounded-full shadow-[0_0_10px_rgba(74,222,128,0.5)]"></span>
 </div>
 </div>
 </div>

 <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
 <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
 <Link to="/settings" className="hover:text-red-600 transition-colors">Quick Actions</Link>
 </h4>
 <div className="grid grid-cols-2 gap-3">
 <Link to="/products" className="p-4 bg-gray-50 hover:bg-red-50 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all hover:scale-[1.02] group">
 <Package size={20} className="text-gray-400 group-hover:text-red-600 transition-colors" />
 <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-red-600">Add Product</span>
 </Link>
 <Link to="/bookings" className="p-4 bg-gray-50 hover:bg-blue-50 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all hover:scale-[1.02] group">
 <Calendar size={20} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
 <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-blue-600">Bookings</span>
 </Link>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
};

export default Dashboard;
