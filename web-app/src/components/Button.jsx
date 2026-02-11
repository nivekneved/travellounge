import React from 'react';
import { Link } from 'react-router-dom';

const Button = ({
    children,
    onClick,
    variant = 'primary',
    size = 'md',
    className = '',
    to,
    href,
    icon: Icon,
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center font-bold transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 gap-2 cursor-pointer ';

    const variants = {
        primary: 'bg-primary text-white hover:bg-red-700 shadow-lg hover:shadow-xl',
        secondary: 'bg-white text-primary border-2 border-primary hover:bg-primary/5 shadow-md hover:shadow-lg',
        outline: 'bg-transparent text-white border-2 border-white hover:bg-white/10',
        ghost: 'text-gray-600 hover:text-primary hover:bg-primary/5'
    };

    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-sm tracking-wider uppercase',
        lg: 'px-8 py-4 text-base tracking-widest uppercase'
    };

    const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

    const content = (
        <>
            {children}
            {Icon && <Icon size={size === 'sm' ? 16 : 20} />}
        </>
    );

    if (to) {
        return (
            <Link to={to} className={classes} {...props}>
                {content}
            </Link>
        );
    }

    if (href) {
        return (
            <a href={href} className={classes} {...props}>
                {content}
            </a>
        );
    }

    return (
        <button
            className={classes}
            onClick={onClick}
            {...props}
        >
            {content}
        </button>
    );
};

export default Button;
