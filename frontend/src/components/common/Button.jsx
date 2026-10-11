import React from 'react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  icon: Icon,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#08080D] disabled:opacity-40 disabled:cursor-not-allowed select-none';

  const variants = {
    primary:
      'bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#9D74FF] hover:to-[#8B5CF6] text-white shadow-[0_0_24px_rgba(139,92,246,0.35)] hover:shadow-[0_0_32px_rgba(139,92,246,0.55)] focus:ring-[#8B5CF6] active:scale-[0.98]',
    secondary:
      'bg-[#191927] hover:bg-[#202032] text-[#F4F4F8] border border-[#232334] hover:border-[#8B5CF6]/40 focus:ring-[#8B5CF6]/50 active:scale-[0.98]',
    cyan:
      'bg-gradient-to-r from-[#22D3EE] to-[#0891B2] hover:from-[#67E8F9] hover:to-[#22D3EE] text-[#08080D] font-bold shadow-lg shadow-cyan-900/30 focus:ring-[#22D3EE] active:scale-[0.98]',
    outline:
      'bg-transparent border border-[#8B5CF6]/50 hover:border-[#8B5CF6] text-[#A78BFA] hover:text-white hover:bg-[#8B5CF6]/10 focus:ring-[#8B5CF6] active:scale-[0.98]',
    danger:
      'bg-[#FB7185]/10 border border-[#FB7185]/30 hover:bg-[#FB7185]/20 text-[#FB7185] focus:ring-[#FB7185] active:scale-[0.98]',
    ghost:
      'bg-transparent hover:bg-[#191927] text-[#A1A1B5] hover:text-[#F4F4F8] focus:ring-[#8B5CF6]/50',
    success:
      'bg-[#34D399]/10 border border-[#34D399]/30 hover:bg-[#34D399]/20 text-[#34D399] focus:ring-[#34D399] active:scale-[0.98]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
      ) : Icon ? (
        <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
      ) : null}
      {children}
    </button>
  );
}
