import { Line, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Users, ShoppingBag, Calendar, ArrowUpRight, Activity, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const Dashboard = () => {
    const [activities, setActivities] = useState([]);
    const [statsData, setStatsData] = useState({
        totalBookings: 0,
        totalProducts: 0,
        pendingBookings: 0
    });
    const [chartData, setChartData] = useState({
        pending: 0,
        confirmed: 0,
        cancelled: 0,
        completed: 0
    });

    useEffect(() => {
        fetchDashboardData();

        const bookingChannel = supabase
            .channel('dashboard-sync')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'bookings' },
                (payload) => {
                    const newActivity = {
                        id: Date.now(),
                        details: `NEW BOOKING: [#${payload.new.id.slice(0, 8)}] Status: ${payload.new.status}`,
                        createdAt: new Date().toISOString()
                    };
                    setActivities(prev => [newActivity, ...prev].slice(0, 10));
                    fetchDashboardData(); // Refresh stats on new booking
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(bookingChannel);
        };
    }, []);

    const fetchDashboardData = async () => {
        try {
            // 1. Fetch Counts
            const { count: bookingsCount, error: bookingsError } = await supabase.from('bookings').select('*', { count: 'exact', head: true });
            if (bookingsError) throw bookingsError;

            const { count: servicesCount, error: servicesError } = await supabase.from('services').select('*', { count: 'exact', head: true });
            if (servicesError) throw servicesError;

            const { count: pendingCount, error: pendingError } = await supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending');
            if (pendingError) throw pendingError;

            setStatsData({
                totalBookings: bookingsCount || 0,
                totalProducts: servicesCount || 0,
                pendingBookings: pendingCount || 0
            });

            // 2. Fetch Recent Activities
            const { data: recentBookings, error: recentError } = await supabase
                .from('bookings')
                .select('id, status, created_at, customer_info')
                .order('created_at', { ascending: false })
                .limit(5);

            if (recentError) throw recentError;

            if (recentBookings) {
                const mappedActivities = recentBookings.map(b => ({
                    id: b.id,
                    details: `BOOKING: ${b.customer_info?.name || 'Guest'} (${b.status})`,
                    createdAt: b.created_at
                }));
                setActivities(mappedActivities);
            }

            // 3. Fetch Data for Charts (Status Distribution)
            const { data: statusData, error: statusError } = await supabase.from('bookings').select('status');
            if (statusError) throw statusError;

            if (statusData) {
                const counts = statusData.reduce((acc, curr) => {
                    acc[curr.status] = (acc[curr.status] || 0) + 1;
                    return acc;
                }, {});
                setChartData({
                    pending: counts.pending || 0,
                    confirmed: counts.confirmed || 0,
                    cancelled: counts.cancelled || 0,
                    completed: counts.completed || 0 // Assuming 'completed' is a status
                });
            }
        } catch (error) {
            // toast.error(`Failed to load dashboard: ${error.message}`); 
            // Note: Dashboard load errors can be spammy if not careful, but useful for debugging. 
            // I'll ensure toast is imported.
        }
    };

    const stats = [
        { label: 'Total Bookings', value: statsData.totalBookings, icon: Calendar, color: 'bg-primary', trend: 'Live' },
        { label: 'Total Services', value: statsData.totalProducts, icon: ShoppingBag, color: 'bg-purple-500', trend: 'Live' },
        { label: 'Pending Actions', value: statsData.pendingBookings, icon: AlertCircle, color: 'bg-orange-500', trend: 'Needs Attention' },
    ];

    const lineData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            label: 'Booking Requests',
            data: [65, 59, 80, 81, 56, 95], // Keeping static for now as historical data aggregation needs more complex queries
            fill: false,
            borderColor: '#e60000',
            tension: 0.4
        }]
    };

    const doughnutData = {
        labels: ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
        datasets: [{
            data: [chartData.pending, chartData.confirmed, chartData.cancelled, chartData.completed],
            backgroundColor: ['#f97316', '#22c55e', '#ef4444', '#3b82f6'],
            borderWidth: 0
        }]
    };

    return (
        <div className="space-y-10 p-4">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <div className="text-sm text-gray-500">Real-time Overview</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((item, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                        <div className={`absolute top-0 right-0 w-24 h-24 ${item.color} opacity-5 -mr-8 -mt-8 rounded-full`} />
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mb-1">{item.label}</p>
                                <h3 className="text-3xl font-bold">{item.value}</h3>
                                <span className={`text-xs font-bold ${item.trend === 'Needs Attention' ? 'text-orange-500' : 'text-green-500'}`}>
                                    {item.trend}
                                </span>
                            </div>
                            <div className={`${item.color} p-3 rounded-xl text-white shadow-lg shadow-primary/20`}>
                                <item.icon size={24} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h4 className="text-xl font-bold mb-6">Booking Volume (Trend)</h4>
                    <Line data={lineData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                    <p className="text-xs text-gray-400 mt-4 text-center italic">Historical data simulation</p>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h4 className="text-xl font-bold mb-6">Booking Status Distribution</h4>
                    <div className="max-w-[300px] mx-auto">
                        <Doughnut data={doughnutData} options={{ cutout: '70%' }} />
                    </div>
                    <div className="mt-8 grid grid-cols-2 gap-4 text-center">
                        <div>
                            <p className="text-2xl font-bold text-orange-500">{chartData.pending}</p>
                            <p className="text-xs text-gray-400 uppercase font-bold">Pending</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-green-500">{chartData.confirmed}</p>
                            <p className="text-xs text-gray-400 uppercase font-bold">Confirmed</p>
                        </div>
                    </div>
                </div>
            </div>
            {/* Advanced Tables / Logs Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 italic text-gray-400 flex items-center justify-center min-h-[300px]">
                    Detailed Analytics Module (Coming Soon)
                </div>

                <div className="bg-gray-900 p-8 rounded-[2.5rem] shadow-2xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-16 translate-x-16 blur-3xl"></div>
                    <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
                        <Activity className="text-primary" size={20} /> Recent Activities
                    </h2>
                    <div className="space-y-6">
                        {activities?.map((log) => (
                            <div key={log.id} className="flex gap-4 items-start group">
                                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                                    <Clock size={16} className="text-gray-400 group-hover:text-primary" />
                                </div>
                                <div className="flex-grow">
                                    <p className="text-white text-sm font-medium tracking-tight h-10 overflow-hidden line-clamp-2">{log.details}</p>
                                    <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mt-1">
                                        {new Date(log.createdAt).toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {activities.length === 0 && <p className="text-gray-600 italic text-sm text-center py-10">No recent activities.</p>}
                    </div>
                    <button className="w-full mt-8 py-3 bg-white/5 hover:bg-white/10 text-gray-400 text-xs font-bold uppercase tracking-widest rounded-2xl transition-all">
                        View All Logs
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
