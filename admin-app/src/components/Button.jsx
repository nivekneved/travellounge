import React from 'react';

const Button = ({ children, onClick, variant = 'primary', className = '', ...props }) => {
    const baseStyles = 'px-6 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2';

    const variants = {
        primary: 'bg-primary text-white hover:bg-primary-dark shadow-sm',
        outline: 'bg-transparent text-gray-700 border border-gray-300 hover:border-primary hover:text-primary',
        danger: 'bg-danger text-white hover:opacity-90'
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${className}`}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
