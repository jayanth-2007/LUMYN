import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import Button from '../common/Button';

export default function FilterBar({ filters, activeFilters, onFilterChange, onReset }) {
  if (!filters || filters.length === 0) return null;

  const hasActiveFilters = Object.values(activeFilters).some(
    (v) => v !== '' && v !== 'all' && v !== null && v !== undefined
  );

  return (
    <div className="bg-[#11111B] border border-[#232334] rounded-2xl p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#717187]">
          <Filter className="w-3.5 h-3.5 text-[#8B5CF6]" />
          <span>Filters</span>
        </div>

        {filters.map((f) => (
          <div key={f.column} className="flex items-center gap-1.5 text-xs">
            <span className="text-[#717187] font-medium">{f.label}:</span>
            <select
              value={activeFilters[f.column] || 'all'}
              onChange={(e) => onFilterChange(f.column, e.target.value)}
              className="bg-[#191927] border border-[#232334] rounded-lg px-2.5 py-1.5 text-[#F4F4F8] text-xs focus:outline-none focus:border-[#8B5CF6]/50 focus:ring-1 focus:ring-[#8B5CF6]/25 font-medium transition-colors cursor-pointer"
            >
              <option value="all">All</option>
              {f.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        ))}

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            icon={RotateCcw}
            className="ml-auto text-[#FB7185] hover:text-[#FB7185]"
          >
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
}
