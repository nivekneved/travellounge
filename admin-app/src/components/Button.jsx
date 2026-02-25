import React from 'react';

const Button = ({ children, onClick, variant = 'primary', size = 'md', className = '', ...props }) => {
 const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 outline-none focus:ring-2 focus:ring-offset-2';

 const sizes = {
 sm: 'px-3 py-1.5 text-xs',
 md: 'px-5 py-2.5 text-sm',
 lg: 'px-8 py-4 text-base',
 };

 const variants = {
 primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm shadow-primary-500/20 focus:ring-primary-500',
 secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm focus:ring-slate-500',
 ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-400',
 danger: 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-600 hover:text-white transition-all duration-300 focus:ring-red-500',
 };

 return (
 <button
 className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`}
 onClick={onClick}
 {...props}
 >
 {children}
 </button>
 );
};

export default Button;
