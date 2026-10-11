import React from 'react';
import Card from '../common/Card';
import { Layers, TrendingUp, Activity, Gauge, Star, BarChart3, AlertTriangle, Calendar } from 'lucide-react';

const iconMap = {
  Layers,
  TrendingUp,
  Activity,
  Gauge,
  Star,
  BarChart3,
  AlertTriangle,
  Calendar,
  PieChart: BarChart3,
};

export default function KPICard({ title, value, subtitle, icon, trend }) {
  const IconComponent = (icon && iconMap[icon]) || Activity;

  return (
    <Card hover className="relative overflow-hidden group">
      {/* Ambient glow behind icon */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#8B5CF6]/8 rounded-full blur-3xl group-hover:bg-[#8B5CF6]/15 transition-all duration-500 pointer-events-none" />

      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-bold text-[#717187] uppercase tracking-widest block mb-1.5">
            {title}
          </span>
          <div className="text-2xl font-extrabold text-[#F4F4F8] tracking-tight truncate">
            {value}
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 text-[#8B5CF6] group-hover:text-[#22D3EE] group-hover:border-[#22D3EE]/25 group-hover:bg-[#22D3EE]/10 transition-all duration-300 shrink-0 ml-3">
          <IconComponent className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-[#717187] truncate flex-1">{subtitle}</span>
        {trend && (
          <span className="text-[#34D399] font-semibold bg-[#34D399]/10 px-2 py-0.5 rounded-lg border border-[#34D399]/20 ml-2 shrink-0">
            {trend}
          </span>
        )}
      </div>
    </Card>
  );
}
