import React from 'react';
import { Link } from 'react-router-dom';

export default function Logo({ size = 'default', showTagline = false }) {
  const isLarge = size === 'large';

  return (
    <Link to="/" className="inline-flex items-center gap-2.5 group">
      {/* Geometric Prism Icon */}
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#8B5CF6] via-[#6D28D9] to-[#22D3EE] shadow-glow-violet p-2 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_24px_rgba(139,92,246,0.5)] ${isLarge ? 'w-12 h-12' : 'w-9 h-9'}`}
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-white" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2" fill="white" fillOpacity="0.25" stroke="white" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
        {/* Live indicator dot */}
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#22D3EE] animate-ping opacity-70" />
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#22D3EE]" />
      </div>

      <div className="flex flex-col leading-none">
        <span
          className={`font-extrabold tracking-wider bg-gradient-to-r from-white via-[#F4F4F8] to-[#A78BFA] bg-clip-text text-transparent ${isLarge ? 'text-2xl' : 'text-xl'}`}
        >
          LUMYN
        </span>
        {showTagline && (
          <span className="text-[10px] uppercase tracking-widest text-[#22D3EE] font-bold mt-0.5">
            AI Analytics
          </span>
        )}
      </div>
    </Link>
  );
}
