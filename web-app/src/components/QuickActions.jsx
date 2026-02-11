import React, { useState } from 'react';
import { Phone, MessageCircle, Mail, FileText, X } from 'lucide-react';

const QuickActions = () => {
    const [isOpen, setIsOpen] = useState(false);

    const actions = [
        {
            icon: Phone,
            label: 'Call Us',
            href: 'tel:+2302089999',
            color: 'bg-blue-600 hover:bg-blue-700',
            ariaLabel: 'Call us at +230 208 9999'
        },
        {
            icon: MessageCircle,
            label: 'WhatsApp',
            href: 'https://wa.me/2302089999',
            color: 'bg-green-600 hover:bg-green-700',
            ariaLabel: 'Chat with us on WhatsApp'
        },
        {
            icon: Mail,
            label: 'Email',
            href: 'mailto:reservation@travellounge.mu',
            color: 'bg-purple-600 hover:bg-purple-700',
            ariaLabel: 'Send us an email'
        },
        {
            icon: FileText,
            label: 'Get Quote',
            href: '/package-builder',
            color: 'bg-primary hover:bg-red-700',
            ariaLabel: 'Get a custom quote'
        }
    ];

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Action Buttons - Show when open */}
            <div className={`flex flex-col gap-3 mb-3 transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                {actions.map((action, index) => (
                    <a
                        key={index}
                        href={action.href}
                        target={action.href.startsWith('http') ? '_blank' : undefined}
                        rel={action.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        aria-label={action.ariaLabel}
                        className={`${action.color} text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group flex items-center gap-3`}
                        style={{ transitionDelay: `${index * 50}ms` }}
                    >
                        <action.icon size={24} className="flex-shrink-0" />
                        <span className="text-sm font-bold whitespace-nowrap pr-2 max-w-0 group-hover:max-w-xs overflow-hidden transition-all duration-300">
                            {action.label}
                        </span>
                    </a>
                ))}
            </div>

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? 'Close quick actions' : 'Open quick actions'}
                className="bg-primary text-white p-5 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 active:scale-95 hover:rotate-90"
            >
                {isOpen ? (
                    <X size={28} className="transition-transform duration-300" />
                ) : (
                    <div className="relative">
                        <Phone size={28} className="animate-pulse" />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping" />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full" />
                    </div>
                )}
            </button>
        </div>
    );
};

export default QuickActions;
