import React from 'react';

export default function Card({ children, className = '', glow = false, hover = false, onClick, ...props }) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-[#11111B] border border-[#232334] rounded-2xl p-5 shadow-card-dark
        transition-all duration-200
        ${glow ? 'border-[#8B5CF6]/40 shadow-glow-violet' : ''}
        ${hover ? 'hover:border-[#8B5CF6]/35 hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
