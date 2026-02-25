import React from 'react';
import Button from './Button';

const PageHeader = ({
 title,
 subtitle,
 icon: Icon,
 actionLabel,
 onAction,
 actionIcon: ActionIcon,
 children
}) => {
 return (
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 group animate-scale-in">
 <div className="flex items-center gap-5">
 {Icon && (
 <div className="w-14 h-14 bg-white rounded-2xl shadow-premium border border-slate-200/50 flex items-center justify-center text-primary-600 group-hover:scale-110 transition-all duration-300 group-hover:rotate-3">
 <Icon size={28} strokeWidth={1.5} />
 </div>
 )}
 <div className="space-y-1">
 <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight leading-tight">
 {title}
 </h1>
 {subtitle && (
 <p className="text-slate-500 font-medium text-sm flex items-center gap-2">
 {subtitle}
 </p>
 )}
 </div>
 </div>

 <div className="flex items-center gap-3">
 {children}
 {actionLabel && (
 <Button
 onClick={onAction}
 className="shadow-premium-lg hover:shadow-premium-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
 >
 {ActionIcon && <ActionIcon size={18} />}
 <span>{actionLabel}</span>
 </Button>
 )}
 </div>
 </div>
 );
};

export default PageHeader;
