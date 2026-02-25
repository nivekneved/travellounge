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
                { path: '/hero', label: 'Hero Slides', icon: LayoutTemplate },
                { path: '/categories', label: 'Categories', icon: Grid },
                {
                    label: 'Activities',
                    icon: Activity,
                    subItems: [
                        { path: '/activities/land', label: 'Land Activities' },
                        { path: '/activities/sea', label: 'Sea Activities' },
                    ]
                },
                { path: '/testimonials', label: 'Testimonials', icon: Star },
                { path: '/media', label: 'Media Library', icon: ImageIcon },
                { path: '/menus', label: 'Menus', icon: Menu },
                { path: '/pages', label: 'Page Content', icon: FileText },
                { path: '/team', label: 'Team', icon: Users },
                { path: '/newsletter', label: 'Newsletter', icon: Mail },
                { path: '/seo', label: 'SEO', icon: Search },
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
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden antialiased">
            {/* Ambient Background Accents */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-primary-500/10 blur-[130px] rounded-full animate-scale-in"></div>
                <div className="absolute top-[40%] -right-32 w-80 h-80 bg-blue-500/5 blur-[120px] rounded-full"></div>
                <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary-500/5 blur-[100px] rounded-full"></div>
            </div>

            {/* Sidebar */}
            <aside
                className={`
 relative z-30 h-full bg-white/70 backdrop-blur-xl border-r border-slate-200/50 
 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) flex flex-col shadow-premium
 ${collapsed ? 'w-20' : 'w-72'}
 `}
            >
                <div className="h-24 flex items-center px-6 mb-2">
                    {!collapsed && (
                        <div className="flex items-center gap-4 animate-fade-in">
                            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-glow rotate-[-3deg] hover:rotate-0 transition-transform duration-300">
                                <Shield size={22} strokeWidth={2.5} />
                            </div>
                            <div className="flex flex-col">
                                <h1 className="font-display font-bold text-xl tracking-tight text-slate-900 leading-none">Travel Lounge</h1>
                                <p className="text-[10px] text-primary-600 font-black uppercase tracking-[0.2em] mt-1.5 opacity-80">Admin Core</p>
                            </div>
                        </div>
                    )}
                    {collapsed && (
                        <div className="mx-auto w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-glow hover:rotate-12 transition-transform duration-300">
                            <Shield size={22} strokeWidth={2.5} />
                        </div>
                    )}
                </div>

                <nav className="flex-1 overflow-y-auto px-4 space-y-6 scrollbar-hide pb-8">
                    {menuItems.map((group, idx) => (
                        <div key={idx} className="space-y-2">
                            {!collapsed && (
                                <h3 className="px-4 pb-1 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] opacity-60">
                                    {group.section}
                                </h3>
                            )}
                            <div className="space-y-1">
                                {group.items.map((item, itemIdx) => {
                                    const isActive = item.path ? location.pathname === item.path : item.subItems?.some(sub => location.pathname === sub.path);

                                    if (item.subItems) {
                                        return (
                                            <div key={itemIdx} className="space-y-1">
                                                <div
                                                    className={`
 flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative
 ${isActive ? 'bg-primary-50/50 text-primary-600' : 'text-slate-500 hover:bg-slate-100/50 hover:text-slate-900'}
 `}
                                                >
                                                    <item.icon
                                                        size={19}
                                                        strokeWidth={isActive ? 2.5 : 2}
                                                        className={`transition-all duration-300 ${isActive ? 'text-primary-600 scale-110' : 'text-slate-400 group-hover:text-slate-600'}`}
                                                    />
                                                    {!collapsed && <span className={`text-sm tracking-wide transition-all ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>}
                                                </div>
                                                {!collapsed && (
                                                    <div className="ml-6 border-l-2 border-slate-100 pl-5 space-y-1 mt-1">
                                                        {item.subItems.map((sub) => {
                                                            const isSubActive = location.pathname === sub.path;
                                                            return (
                                                                <Link
                                                                    key={sub.path}
                                                                    to={sub.path}
                                                                    className={`
 block py-2 text-[13px] transition-all duration-300 relative
 ${isSubActive ? 'text-primary-600 font-bold' : 'text-slate-400 hover:text-slate-900 hover:translate-x-1'}
 `}
                                                                >
                                                                    {isSubActive && <div className="absolute -left-[21px] top-1/2 -translate-y-1/2 w-[2px] h-4 bg-primary-600 rounded-full"></div>}
                                                                    {sub.label}
                                                                </Link>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    }

                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={`
 flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-500 group relative
 ${isActive
                                                    ? 'bg-primary-600 text-white shadow-premium-lg shadow-primary-600/20 translate-x-1'
                                                    : 'text-slate-500 hover:bg-slate-100/50 hover:text-slate-900'
                                                }
 `}
                                        >
                                            <item.icon
                                                size={19}
                                                strokeWidth={isActive ? 2.5 : 2}
                                                className={`transition-all duration-400 ${isActive ? 'text-white scale-110' : 'text-slate-400 group-hover:text-slate-600'}`}
                                            />
                                            {!collapsed && <span className={`text-sm tracking-wide transition-all ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>}
                                            {collapsed && (
                                                <div className="fixed left-24 px-4 py-2 bg-slate-900/95 backdrop-blur-md text-white text-[11px] font-bold rounded-xl opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 whitespace-nowrap z-50 pointer-events-none shadow-premium-xl border border-white/10 uppercase tracking-widest">
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

                <div className="p-4 mt-auto">
                    <button
                        onClick={handleLogout}
                        className={`
 flex items-center gap-3 w-full px-5 py-3.5 rounded-xl 
 text-slate-400 hover:text-red-600 hover:bg-red-50 
 transition-all duration-300 group ${collapsed ? 'justify-center' : ''}
 border border-transparent hover:border-red-100/50
 `}
                    >
                        <LogOut size={19} strokeWidth={2} className="group-hover:translate-x-1 transition-transform" />
                        {!collapsed && <span className="text-sm font-bold tracking-tight">System Sign Out</span>}
                    </button>
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className={`
 mt-2 flex items-center justify-center w-8 h-8 mx-auto bg-white border border-slate-200 rounded-full 
 text-slate-400 hover:text-primary-600 hover:border-primary-200 shadow-sm transition-all duration-300 hover:scale-110
 ${collapsed ? 'rotate-0' : 'rotate-180'}
 `}
                    >
                        <ChevronRight size={14} strokeWidth={3} />
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 relative z-10">
                {/* Header Navbar */}
                <header className="h-20 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 px-8 flex items-center justify-between sticky top-0 z-20 shadow-premium/5">
                    <div className="flex items-center gap-6">
                        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-slate-100/80 rounded-lg border border-slate-200/50">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Platform Online</span>
                        </div>
                        <h2 className="text-xl font-display font-bold text-slate-900 tracking-tight">
                            {menuItems.flatMap(g => g.items).find(i => i.path === location.pathname)?.label ||
                                menuItems.flatMap(g => g.items).flatMap(i => i.subItems || []).find(s => s.path === location.pathname)?.label ||
                                'Dashboard'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-6">
                        <a
                            href="/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden sm:flex items-center gap-2.5 px-5 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-xl transition-all shadow-premium/5 hover:shadow-premium-lg"
                        >
                            <ExternalLink size={14} />
                            Preview Site
                        </a>

                        <div className="flex items-center gap-4 pl-6 border-l-2 border-slate-100">
                            <div className="text-right hidden sm:block">
                                <p className="text-[13px] font-bold text-slate-900 leading-none">Super Administrator</p>
                                <p className="text-[10px] text-primary-600 font-black uppercase tracking-widest mt-1.5 opacity-70">Security Level 10</p>
                            </div>
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-700 font-black border-2 border-white shadow-premium relative group cursor-pointer transition-transform duration-300 hover:scale-105">
                                <span className="text-sm">AD</span>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Container */}
                <main className="flex-1 overflow-y-auto">
                    <div className="p-8 pb-32 w-full page-transition-up">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
