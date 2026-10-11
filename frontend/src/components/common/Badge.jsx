import React from 'react';

export default function Badge({ children, variant = 'violet', size = 'sm', className = '' }) {
  const variants = {
    violet: 'bg-[#8B5CF6]/10 text-[#A78BFA] border-[#8B5CF6]/25',
    cyan: 'bg-[#22D3EE]/10 text-[#22D3EE] border-[#22D3EE]/25',
    emerald: 'bg-[#34D399]/10 text-[#34D399] border-[#34D399]/25',
    amber: 'bg-[#FBBF24]/10 text-[#FBBF24] border-[#FBBF24]/25',
    rose: 'bg-[#FB7185]/10 text-[#FB7185] border-[#FB7185]/25',
    slate: 'bg-[#232334]/60 text-[#A1A1B5] border-[#232334]',
    success: 'bg-[#34D399]/10 text-[#34D399] border-[#34D399]/25',
    warning: 'bg-[#FBBF24]/10 text-[#FBBF24] border-[#FBBF24]/25',
    error: 'bg-[#FB7185]/10 text-[#FB7185] border-[#FB7185]/25',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-0.5',
    md: 'text-sm px-3 py-1',
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border ${variants[variant] || variants.violet} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
}
