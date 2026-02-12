import React, { useState, useEffect } from 'react';
import {
    Menu, X, Phone, Mail, Zap, Clock, ChevronDown, ChevronRight, Heart, Palmtree, Ship,
    Plane, Hotel, Users, MapPin, Calendar, FileText, Info, UsersRound,
    Facebook, Instagram, Globe, Home, Mountain, Anchor, ArrowRight
} from 'lucide-react';
import Button from './Button';
import QuickActions from './QuickActions';
import Breadcrumb from './Breadcrumb';
import { useWishlist } from '../context/WishlistContext';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { useQuery } from '@tanstack/react-query';

const Layout = ({ children }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { wishlist } = useWishlist();
    const { i18n, t } = useTranslation();
    const [flashSale, setFlashSale] = useState(null);
    const location = useLocation();
    const isHomePage = location.pathname === '/';

    const toggleLanguage = () => {
        i18n.changeLanguage(i18n.language === 'en' ? 'fr' : 'en');
    };

    // --- DATA FETCHING ---

    // 1. Fetch Site Settings (Footer, Contact Info)
    const { data: settings = {} } = useQuery({
        queryKey: ['site_settings'],
        queryFn: async () => {
            const { data, error } = await supabase.from('site_settings').select('*');
            if (error) throw error;
            // Convert to object for easy access: { key: value }
            return data.reduce((acc, item) => ({ ...acc, [item.key]: item.value }), {});
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // 2. Fetch Menus
    const { data: menus = [] } = useQuery({
        queryKey: ['menus'],
        queryFn: async () => {
            const { data, error } = await supabase.from('menus').select('*');
            if (error) throw error;
            return data;
        },
        staleTime: 1000 * 60 * 5,
    });

    const headerMenu = menus.find(m => m.location === 'header')?.items || [];

    // Fallback menu if database is empty - preserving the exact original structure
    const defaultMenu = [
        { label: "HOME", link: "/", icon: "Home" },
        {
            label: "TRAVEL ABROAD", link: "#", icon: "MapPin",
            children: [
                { label: "BOOK A FLIGHT", link: "/flights", icon: "Plane" },
                { label: "TAILOR MADE PACKAGES", link: "/package-builder", icon: "FileText" },
                { label: "CRUISE VACATIONS", link: "/cruises", icon: "Ship" },
                { label: "GUIDED GROUP TOURS", link: "/group-tours", icon: "Users" },
                {
                    label: "RODRIGUES", link: "#", icon: "MapPin", children: [
                        { label: "GUEST HOUSES", link: "/rodrigues-guest-houses", icon: "Hotel" },
                        { label: "HOTELS", link: "/rodrigues-hotels", icon: "Hotel" }
                    ]
                },
                { label: "VISA SERVICES", link: "/visa-services", icon: "FileText" }
            ]
        },
        { label: "HOTELS", link: "/hotels", icon: "Hotel" },
        { label: "FLIGHT", link: "/flights", icon: "Plane" },
        {
            label: "LOCAL DEALS", link: "#", icon: "Zap",
            children: [
                { label: "LAND ACTIVITIES", link: "/activities?category=Land Activities", icon: "Mountain" },
                { label: "SEA ACTIVITIES", link: "/activities?category=Sea Activities", icon: "Anchor" },
                { label: "HOTEL DAY PACKAGES", link: "/day-packages", icon: "Calendar" }
            ]
        },
        {
            label: "ABOUT", link: "#", icon: "Info",
            children: [
                { label: "ABOUT US", link: "/about", icon: "Info" },
                { label: "TEAM", link: "/team", icon: "UsersRound" }
            ]
        }
    ];

    const activeMenu = headerMenu.length > 0 ? headerMenu : defaultMenu;

    // --- EFFECT HOOKS ---

    useEffect(() => {
        const channel = supabase
            .channel('flash-sale-monitor')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'bookings' },
                () => { }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'services' },
                (payload) => {
                    if (payload.new?.category === 'flash-deal' || payload.new?.is_flash_sale) {
                        setFlashSale(payload.new);
                    }
                }
            )
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);


    // --- HELPER COMPONENTS ---

    // Icon mapper for dynamic menus
    const getIcon = (iconName) => {
        if (!iconName) return null;
        // Case-insensitive matching and trimming
        const icons = { Plane, FileText, Ship, Users, Hotel, Calendar, UsersRound, Info, Heart, Zap, Palmtree, Home, MapPin, Mountain, Anchor };
        const key = Object.keys(icons).find(k => k.toLowerCase() === iconName.trim().toLowerCase());
        return icons[key] || null;
    };

    const renderMenuItem = (item, index, isMobile = false) => {
        const hasChildren = item.children && item.children.length > 0;
        const Icon = item.icon ? getIcon(item.icon) : null;

        if (isMobile) {
            return (
                <div key={index} className="flex flex-col gap-2">
                    {hasChildren ? (
                        <>
                            <span className="text-primary text-sm font-black uppercase tracking-[0.2em] mt-4 flex items-center gap-2">
                                {Icon && <Icon size={14} className="text-primary/60" />}
                                {item.label.toUpperCase()}
                            </span>
                            {item.children.map((child, cIdx) => {
                                const ChildIcon = child.icon ? getIcon(child.icon) : null;
                                return (
                                    <Link
                                        key={cIdx}
                                        to={child.link}
                                        className="text-lg pl-6 block py-2 flex items-center gap-3 text-gray-700 active:text-primary transition-colors border-l-2 border-gray-100"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        {ChildIcon && <ChildIcon size={18} className="text-gray-400" />}
                                        {child.label.toUpperCase()}
                                    </Link>
                                );
                            })}
                        </>
                    ) : (
                        <Link
                            to={item.link}
                            onClick={() => setIsMenuOpen(false)}
                            className="block py-3 text-2xl font-black flex items-center gap-4 hover:text-primary transition-colors border-b border-gray-50 last:border-none"
                        >
                            {Icon && <Icon size={24} className="text-primary/80" />}
                            {item.label.toUpperCase()}
                        </Link>
                    )}
                </div>
            );
        }

        // DESKTOP RENDERING
        if (hasChildren) {
            return (
                <div key={index} className="relative group/menu py-4">
                    <button className="flex items-center gap-2 hover:text-primary transition-colors uppercase">
                        {Icon && <Icon size={18} />} {item.label.toUpperCase()} <ChevronDown size={14} />
                    </button>
                    <div className="absolute top-full left-0 w-64 bg-white shadow-xl rounded-b-xl border-t-2 border-primary opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-200 transform translate-y-2 group-hover/menu:translate-y-0 text-transform-none text-gray-900 z-50">
                        {item.children.map((child, childIndex) => {
                            const ChildIcon = child.icon ? getIcon(child.icon) : null;

                            // Handle nested children (e.g. Rodrigues)
                            if (child.children && child.children.length > 0) {
                                return (
                                    <div key={childIndex} className="relative group/submenu">
                                        <button className="w-full text-left px-6 py-3 hover:bg-gray-50 text-gray-700 hover:text-primary transition-colors flex justify-between items-center group/btn">
                                            <span className="flex items-center gap-3">{ChildIcon && <ChildIcon size={16} className="text-gray-400 group-hover/btn:text-primary transition-colors" />}{child.label.toUpperCase()}</span>
                                            <ChevronDown size={12} className="-rotate-90" />
                                        </button>
                                        <div className="absolute top-0 left-full w-48 bg-white shadow-xl rounded-xl border-l-2 border-primary opacity-0 invisible group-hover/submenu:opacity-100 group-hover/submenu:visible transition-all duration-200 ml-2">
                                            {child.children.map((grandChild, gIdx) => {
                                                const GrandIcon = grandChild.icon ? getIcon(grandChild.icon) : null;
                                                return (
                                                    <Link key={gIdx} to={grandChild.link} className="block px-6 py-3 hover:bg-gray-50 text-gray-700 hover:text-primary transition-colors flex items-center gap-3">
                                                        {GrandIcon && <GrandIcon size={14} className="text-gray-400 group-hover/submenu:text-primary transition-colors" />} {grandChild.label.toUpperCase()}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <Link
                                    key={childIndex}
                                    to={child.link}
                                    className="block px-6 py-3 hover:bg-gray-50 text-gray-700 hover:text-primary transition-colors flex items-center gap-3"
                                >
                                    {ChildIcon && <ChildIcon size={16} className="text-gray-400 group-hover/menu:text-primary transition-colors" />} {child.label.toUpperCase()}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            );
        }

        return (
            <Link key={index} to={item.link} className="hover:text-primary transition-colors flex items-center gap-2">
                {Icon && <Icon size={18} />} {item.label.toUpperCase()}
            </Link>
        );
    };

    return (
        <div className="min-h-screen flex flex-col font-sans">
            {/* Flash Sale Banner */}
            {flashSale && (
                <div className="bg-primary text-white py-3 animate-in slide-in-from-top-full duration-700 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                    <div className="w-full px-4 md:px-8 flex flex-col md:flex-row items-center justify-between relative z-10 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-white text-primary p-1.5 rounded-lg animate-pulse">
                                <Zap size={18} fill="currentColor" />
                            </div>
                            <div>
                                <span className="font-black tracking-tight text-sm uppercase">FLASH SALE ACTIVE!</span>
                                <p className="text-[10px] font-bold opacity-80 leading-none">Limited time offer on {flashSale?.name || 'Selected Item'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <Clock size={16} />
                                <span className="font-black font-mono text-lg">02:14:55</span>
                            </div>
                            <Link
                                to={`/services/${flashSale?._id}`}
                                onClick={() => setFlashSale(null)}
                                className="bg-white text-primary px-6 py-1.5 rounded-full font-black text-xs uppercase hover:scale-105 transition-all shadow-xl"
                            >
                                Get Deal
                            </Link>
                            <button onClick={() => setFlashSale(null)} className="opacity-50 hover:opacity-100">
                                <X size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header with Top Bar */}
            <header className="fixed top-0 left-0 right-0 z-50 flex flex-col font-sans">
                {/* Top Bar */}
                <div className="bg-gray-900 text-white py-2 text-xs font-medium hidden md:block relative z-50">
                    <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 flex justify-between items-center">
                        <div className="flex gap-6">
                            <span className="flex items-center gap-2">
                                <Phone size={14} className="text-primary" />
                                {settings.contact_phone || '+230 123 4567'}
                            </span>
                            <span className="flex items-center gap-2">
                                <Mail size={14} className="text-primary" />
                                {settings.contact_email || 'reservation@travellounge.mu'}
                            </span>
                        </div>
                        <div className="flex gap-4 items-center">
                            <button onClick={toggleLanguage} className="hover:text-primary transition-colors uppercase font-bold tracking-widest px-2 py-1 border border-white/20 rounded">
                                {i18n.language}
                            </button>
                            <Link to="/search" className="flex items-center gap-1 hover:text-primary transition-colors">
                                <Heart size={14} fill={wishlist.length > 0 ? "currentColor" : "none"} />
                                {wishlist.length > 0 && <span>({wishlist.length})</span>}
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Main Navbar */}
                <div className={`w-full transition-all duration-300 ${!isHomePage || isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-6'}`}>
                    <nav className="w-full max-w-[1400px] mx-auto flex items-center justify-between pr-4 md:pr-8 pl-4 lg:pl-0">
                        <Link to="/" className="cursor-pointer hover:opacity-80 transition-opacity">
                            <img
                                src={!isHomePage || isScrolled ? "/logo.png" : "/logo-white.png"}
                                alt="Travel Lounge"
                                className="h-12 md:h-16"
                                onError={(e) => { e.target.src = "/logo.png" }}
                            />
                        </Link>

                        {/* DESKTOP MENU */}
                        <div className={`hidden lg:flex items-center gap-6 text-sm font-bold uppercase tracking-tight ${!isHomePage || isScrolled ? 'text-gray-900' : 'text-white'}`}>
                            {activeMenu.map((item, index) => renderMenuItem(item, index))}

                            <Link to="/contact" className="bg-red-600 text-white px-5 py-2 rounded-full hover:bg-red-700 transition-all hover:scale-105 shadow-lg hover:shadow-xl ml-2">
                                Contact Us
                            </Link>
                        </div>

                        <button className={`lg:hidden ${isScrolled ? 'text-gray-900' : 'text-white'}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </nav>
                </div>
            </header>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-40 bg-white lg:hidden pt-24 px-6 overflow-y-auto">
                    <div className="flex flex-col gap-6 text-2xl font-bold pb-10">
                        {activeMenu.map((item, index) => renderMenuItem(item, index, true))}

                        <Button className="w-full text-xl py-4 mt-4" onClick={() => setIsMenuOpen(false)}>
                            Book Now
                        </Button>
                    </div>
                </div>
            )}

            <main className={`flex-grow ${!isHomePage ? 'pt-24 md:pt-32' : ''}`}>
                {/* Breadcrumb Navigation */}
                <Breadcrumb />

                {children}
            </main>

            {/* Quick Actions Floating Buttons */}
            <QuickActions />


            {/* Footer - WHITE BACKGROUND */}
            <footer className="mt-auto border-t border-gray-200 bg-white pt-20 pb-10">

                <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
                    {/* Column 1: Brand */}
                    <div>
                        <img src="/logo.png" alt="Travel Lounge" className="h-16 mb-6 -ml-3" />
                        <p className="text-gray-600 leading-relaxed mb-6">
                            Your premium gateway to the paradise island of Mauritius. Bespoke travel experiences crafted with passion.
                        </p>
                        {/* Social Media Icons */}
                        <div className="flex gap-3">
                            {settings.facebook_url && (
                                <a
                                    href={settings.facebook_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Follow us on Facebook"
                                    className="bg-gray-100 hover:bg-primary text-gray-600 hover:text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
                                >
                                    <Facebook size={20} />
                                </a>
                            )}
                            {settings.instagram_url && (
                                <a
                                    href={settings.instagram_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Follow us on Instagram"
                                    className="bg-gray-100 hover:bg-primary text-gray-600 hover:text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
                                >
                                    <Instagram size={20} />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Column 2: Port Louis Location */}
                    <div>
                        <h4 className="text-xl font-bold mb-6 border-b-2 border-primary/30 pb-2 inline-block text-gray-900">Port Louis Office</h4>
                        <div className="text-gray-600 flex flex-col gap-5">
                            <p className="text-sm leading-relaxed">
                                Ground Floor Newton Tower,<br />
                                Corner Sir William Newton &<br />
                                Remy Ollier Street,<br />
                                Port Louis, Mauritius
                            </p>
                            <div className="flex flex-col gap-1">
                                <p className="flex items-center gap-2 text-sm font-bold"><Phone size={14} className="text-primary" /> (+230) 212 4070</p>
                                <p className="flex items-center gap-2 text-sm font-bold"><Phone size={14} className="text-primary" /> (+230) 212 4073</p>
                            </div>
                            <a
                                href="https://maps.google.com/?q=Travel+Lounge+Port+Louis"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-xs font-black text-primary hover:text-red-700 transition-colors uppercase tracking-widest"
                            >
                                <MapPin size={12} /> Get Directions
                            </a>
                        </div>
                    </div>

                    {/* Column 3: Ebene Location */}
                    <div>
                        <h4 className="text-xl font-bold mb-6 border-b-2 border-primary/30 pb-2 inline-block text-gray-900">Ebene Office</h4>
                        <div className="text-gray-600 flex flex-col gap-5">
                            <p className="text-sm leading-relaxed">
                                Ground Floor, 57 Ebene Mews,<br />
                                Rue Du Savoir,<br />
                                Ebene Cybercity,<br />
                                Mauritius
                            </p>
                            <div className="flex flex-col gap-1">
                                <p className="flex items-center gap-2 text-sm font-bold"><Phone size={14} className="text-primary" /> (+230) 5940 7711</p>
                                <p className="flex items-center gap-2 text-sm font-bold"><Phone size={14} className="text-primary" /> (+230) 5940 7701</p>
                            </div>
                            <a
                                href="https://maps.google.com/?q=Travel+Lounge+Ebene"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-xs font-black text-primary hover:text-red-700 transition-colors uppercase tracking-widest"
                            >
                                <MapPin size={12} /> Get Directions
                            </a>
                        </div>
                    </div>

                    {/* Column 4: Links */}
                    <div>
                        <h4 className="text-xl font-bold mb-6 border-b-2 border-primary/30 pb-2 inline-block text-gray-900">Quick Links</h4>
                        <div className="flex flex-col gap-3 text-sm font-bold text-gray-600">
                            <Link to="/hotels" className="hover:text-primary transition-colors flex items-center gap-3"><Hotel size={18} className="text-gray-400 group-hover:text-primary" />Hotels</Link>
                            <Link to="/cruises" className="hover:text-primary transition-colors flex items-center gap-3"><Ship size={18} className="text-gray-400 group-hover:text-primary" />Cruises</Link>
                            <Link to="/flights" className="hover:text-primary transition-colors flex items-center gap-3"><Plane size={18} className="text-gray-400 group-hover:text-primary" />Flights</Link>
                            <Link to="/package-builder" className="hover:text-primary transition-colors flex items-center gap-3"><FileText size={18} className="text-gray-400 group-hover:text-primary" />Tailor Made</Link>
                            <Link to="/group-tours" className="hover:text-primary transition-colors flex items-center gap-3"><Users size={18} className="text-gray-400 group-hover:text-primary" />Group Tours</Link>
                            <Link to="/activities" className="hover:text-primary transition-colors flex items-center gap-3"><Palmtree size={18} className="text-gray-400 group-hover:text-primary" />Activities</Link>
                            <Link to="/visa-services" className="hover:text-primary transition-colors flex items-center gap-3"><Globe size={18} className="text-gray-400 group-hover:text-primary" />Visa Services</Link>
                        </div>
                    </div>

                    {/* Column 5: Subscribe & Legal */}
                    <div className="flex flex-col">
                        <div className="mb-10">
                            <h4 className="text-xl font-bold mb-6 border-b-2 border-primary/30 pb-2 inline-block text-gray-900">Subscribe</h4>
                            <form className="relative group">
                                <input
                                    type="email"
                                    placeholder="Your email"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all pr-12"
                                    required
                                />
                                <button
                                    type="submit"
                                    className="absolute right-2 top-1.5 bg-primary text-white p-2 rounded-lg hover:bg-red-700 transition-all"
                                >
                                    <ArrowRight size={18} />
                                </button>
                            </form>
                        </div>

                        <div>
                            <h4 className="text-xl font-bold mb-6 border-b-2 border-primary/30 pb-2 inline-block text-gray-900">Legal</h4>
                            <div className="flex flex-col gap-3 text-sm font-bold text-gray-600">
                                <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
                                <Link to="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link>
                                <Link to="/terms#cookies" className="hover:text-primary transition-colors">Cookie Policy</Link>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 mt-20 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
                    &copy; 2026 Travel Lounge Mauritius. {t('footer.rights')} Developed by EBOX.
                </div>
            </footer>
        </div>
    );
};

export default Layout;
