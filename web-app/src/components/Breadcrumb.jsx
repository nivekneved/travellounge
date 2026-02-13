import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ChevronRight, Ship, Plane, Hotel, Users, MapPin, Calendar, FileText, Zap, Info } from 'lucide-react';

const Breadcrumb = ({ actions }) => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter(x => x);

    // Icon mapping for different routes
    const getIcon = (path) => {
        const iconMap = {
            'cruises': Ship,
            'flights': Plane,
            'hotels': Hotel,
            'group-tours': Users,
            'rodrigues': MapPin,
            'day-packages': Calendar,
            'package-builder': FileText,
            'activities': Zap,
            'about': Info,
            'team': Users,
            'contact': FileText,
        };

        for (const [key, Icon] of Object.entries(iconMap)) {
            if (path.includes(key)) return Icon;
        }
        return null;
    };

    // Format path segment to readable text
    const formatPathSegment = (segment) => {
        return segment
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    // Don't show breadcrumb on homepage
    if (pathnames.length === 0) return null;

    return (
        <nav aria-label="Breadcrumb" className="w-full max-w-[1400px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
            <ol className="flex items-center gap-2 text-sm flex-wrap">
                {/* Home */}
                <li className="flex items-center gap-2">
                    <Link
                        to="/"
                        className="flex items-center gap-1.5 text-gray-600 hover:text-primary transition-colors group"
                        aria-label="Go to homepage"
                    >
                        <Home size={16} className="group-hover:scale-110 transition-transform" />
                        <span className="font-medium">Home</span>
                    </Link>
                    <ChevronRight size={14} className="text-gray-400" />
                </li>

                {/* Dynamic path segments */}
                {pathnames.map((segment, index) => {
                    const isLast = index === pathnames.length - 1;
                    const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                    const Icon = getIcon(segment);
                    const label = formatPathSegment(segment);

                    return (
                        <li key={to} className="flex items-center gap-2">
                            {isLast ? (
                                <span className="flex items-center gap-1.5 text-primary font-extrabold" aria-current="page">
                                    {Icon && <Icon size={16} />}
                                    <span>{label}</span>
                                </span>
                            ) : (
                                <>
                                    <Link
                                        to={to}
                                        className="flex items-center gap-1.5 text-gray-600 hover:text-primary transition-colors group"
                                    >
                                        {Icon && <Icon size={16} className="group-hover:scale-110 transition-transform" />}
                                        <span className="font-medium">{label}</span>
                                    </Link>
                                    <ChevronRight size={14} className="text-gray-400" />
                                </>
                            )}
                        </li>
                    );
                })}
            </ol>

            {/* Actions (Wishlist/Share) */}
            {actions && (
                <div className="flex items-center gap-3">
                    {actions}
                </div>
            )}
        </nav>
    );
};

export default Breadcrumb;
