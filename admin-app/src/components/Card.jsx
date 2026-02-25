import React from 'react';

const Card = ({
 children,
 className = '',
 title,
 subtitle,
 headerAction,
 footer,
 noPadding = false,
 hoverable = false
}) => {
 return (
 <div className={`
 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/50 shadow-premium overflow-hidden
 transition-all duration-300
 ${hoverable ? 'hover:shadow-premium-lg hover:border-slate-300/50 hover:-translate-y-1' : ''}
 ${className}
 `}>
 {(title || headerAction) && (
 <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
 <div>
 {title && <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">{title}</h3>}
 {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
 </div>
 {headerAction && <div>{headerAction}</div>}
 </div>
 )}

 <div className={`${noPadding ? '' : 'p-6'}`}>
 {children}
 </div>

 {footer && (
 <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 ">
 {footer}
 </div>
 )}
 </div>
 );
};

export default Card;
