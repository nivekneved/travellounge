import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    ShoppingBag,
    Calendar,
    Grid,
    Menu,
    Image as ImageIcon,
    Megaphone,
    LayoutTemplate,
    MessageSquare,
    Activity,
    Star,
    FileText,
    Package,
    PauseCircle,
    Plane,
    PlayCircle,
    Plus,
    RefreshCw,
    Search,
    Settings,
    Shield,
    ShieldAlert,
    TrendingUp,
    Trash2,
    Users,
    X,
    ChevronLeft,
    ChevronRight,
    LogOut,
    ExternalLink,
    Mail
} from 'lucide-react';
import { supabase } from '../utils/supabase';

const AdminLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/login');
    };

    const menuItems = [
        {
            section: 'Overview', items: [
                { path: '/', label: 'Dashboard', icon: LayoutDashboard },
            ]
        },
        {
            section: 'CMS', items: [
                { path: '/hero', label: 'Hero Slider', icon: LayoutTemplate },
                { path: '/categories', label: 'Categories', icon: Grid },
                { path: '/activities', label: 'Activities', icon: Activity },
                { path: '/testimonials', label: 'Testimonials', icon: Star },
                { path: '/media', label: 'Media Library', icon: ImageIcon },
                { path: '/menus', label: 'Menus', icon: Menu },
                { path: '/pages', label: 'Page Content', icon: FileText },
                { path: '/team', label: 'Team Members', icon: Users },
                { path: '/newsletter', label: 'Newsletter', icon: Mail },
                { path: '/seo', label: 'SEO Manager', icon: Search },
                { path: '/reviews', label: 'Reviews', icon: MessageSquare },
                { path: '/email-templates', label: 'Email Templates', icon: Mail },
            ]
        },
        {
            section: 'Commercial', items: [
                { path: '/products', label: 'Inventory', icon: ShoppingBag },
                { path: '/bookings', label: 'Bookings', icon: Calendar },
                { path: '/flights', label: 'Flights', icon: Plane },
                { path: '/promotions', label: 'Promotions', icon: Megaphone },
            ]
        },
        {
            section: 'System', items: [
                { path: '/logs', label: 'Audit Logs', icon: Shield },
                { path: '/settings', label: 'Settings', icon: Settings },
            ]
        }
    ];

    return (
        <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
            {/* Sidebar background with glassmorphism */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-96 bg-primary-500/5 blur-3xl opacity-50 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-full h-96 bg-blue-500/5 blur-3xl opacity-50 rounded-full translate-x-1/2 translate-y-1/2"></div>
            </div>

            {/* Sidebar */}
            <aside
                className={`relative z-10 bg-white/80 backdrop-blur-xl border-r border-gray-200 transition-all duration-300 flex flex-col ${collapsed ? 'w-20' : 'w-72'}`}
            >
                <div className="p-6 flex items-center justify-between">
                    {!collapsed && (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center text-primary-600">
                                <Shield size={24} />
                            </div>
                            <div>
                                <h1 className="font-display font-bold text-xl tracking-tight text-gray-900">Travel Lounge</h1>
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Admin Panel</p>
                            </div>
                        </div>
                    )}
                    {collapsed && (
                        <div className="mx-auto w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center text-primary-600">
                            <Shield size={24} />
                        </div>
                    )}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="absolute -right-3 top-8 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-primary-600 shadow-sm transition-colors"
                    >
                        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin scrollbar-thumb-gray-200">
                    {menuItems.map((group, idx) => (
                        <div key={idx}>
                            {!collapsed && (
                                <h3 className="px-4 mb-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    {group.section}
                                </h3>
                            )}
                            <div className="space-y-1">
                                {group.items.map((item) => {
                                    const isActive = location.pathname === item.path;
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={`
                        flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative
                        ${isActive
                                                    ? 'bg-primary-50 text-primary-600 font-semibold shadow-sm shadow-primary-500/10'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                }
                      `}
                                        >
                                            {isActive && (
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-500 rounded-r-full"></div>
                                            )}
                                            <item.icon
                                                size={20}
                                                className={`transition-colors ${isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'}`}
                                            />
                                            {!collapsed && <span>{item.label}</span>}
                                            {collapsed && (
                                                <div className="absolute left-full ml-4 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                                                    {item.label}
                                                </div>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-200 bg-gray-50/50">
                    <button
                        onClick={handleLogout}
                        className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors ${collapsed ? 'justify-center' : ''}`}
                    >
                        <LogOut size={20} />
                        {!collapsed && <span className="font-medium">Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative z-0">
                <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-200 px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-display font-bold text-gray-900">
                            {menuItems.flatMap(g => g.items).find(i => i.path === location.pathname)?.label || 'Dashboard'}
                        </h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <a
                            href="http://localhost:5173"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-white hover:text-primary-600 hover:shadow-md transition-all"
                        >
                            <ExternalLink size={16} />
                            View Website
                        </a>
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold border-2 border-white shadow-sm">
                            A
                        </div>
                    </div>
                </header>

                <div className="p-8 pb-32 max-w-[1600px] mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
