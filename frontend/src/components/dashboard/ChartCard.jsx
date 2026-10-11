import React from 'react';
import Card from '../common/Card';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Download } from 'lucide-react';
import { exportChartAsPNG } from '../../utils/exportUtils';

// LUMYN premium chart color palette
const COLOR_PALETTE = [
  '#8B5CF6', // Electric violet
  '#22D3EE', // Cyan
  '#34D399', // Success green
  '#FBBF24', // Warning amber
  '#818CF8', // Indigo
  '#F472B6', // Pink
  '#A78BFA', // Violet light
];

const GRID_COLOR = '#232334';
const AXIS_COLOR = '#717187';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#191927] border border-[#232334] p-3 rounded-xl shadow-2xl backdrop-blur-md text-xs min-w-[120px]">
        {label && <p className="font-semibold text-[#F4F4F8] mb-1.5 pb-1.5 border-b border-[#232334]">{label}</p>}
        {payload.map((entry, index) => (
          <p key={`item-${index}`} className="flex items-center gap-2 text-[#A1A1B5] mt-1">
            <span
              className="w-2 h-2 rounded-full inline-block shrink-0"
              style={{ backgroundColor: entry.color || entry.fill || '#8B5CF6' }}
            />
            <span className="capitalize">{entry.name || 'Value'}:</span>
            <span className="font-mono font-bold text-[#F4F4F8]">
              {typeof entry.value === 'number'
                ? entry.value.toLocaleString(undefined, { maximumFractionDigits: 2 })
                : entry.value}
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ChartCard({ chart }) {
  const containerId = `chart-container-${chart.id || Math.random().toString(36).substr(2, 9)}`;

  const handleExportPNG = () => {
    try {
      exportChartAsPNG(containerId, `${chart.title.toLowerCase().replace(/\s+/g, '_')}.png`);
    } catch (e) {
      alert('Could not export chart. Please try standard browser print.');
    }
  };

  const renderChart = () => {
    const data = chart.data || [];

    switch (chart.type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id={`grad-${chart.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
              <XAxis dataKey={chart.x_key || 'label'} stroke={AXIS_COLOR} tick={{ fontSize: 11, fill: AXIS_COLOR }} />
              <YAxis stroke={AXIS_COLOR} tick={{ fontSize: 11, fill: AXIS_COLOR }} />
              <Tooltip content={<CustomTooltip />} />
              {(chart.y_keys || ['value']).map((key, i) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={COLOR_PALETTE[i % COLOR_PALETTE.length]}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: COLOR_PALETTE[i % COLOR_PALETTE.length], strokeWidth: 0 }}
                  activeDot={{ r: 6, stroke: '#F4F4F8', strokeWidth: 2 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
      case 'histogram':
        return (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
              <XAxis dataKey={chart.x_key || 'label'} stroke={AXIS_COLOR} tick={{ fontSize: 11, fill: AXIS_COLOR }} />
              <YAxis stroke={AXIS_COLOR} tick={{ fontSize: 11, fill: AXIS_COLOR }} />
              <Tooltip content={<CustomTooltip />} />
              {(chart.y_keys || ['value']).map((key, i) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={chart.type === 'histogram' ? '#22D3EE' : COLOR_PALETTE[i % COLOR_PALETTE.length]}
                  radius={[6, 6, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => <span style={{ color: '#A1A1B5', fontSize: '11px' }}>{value}</span>}
              />
              <Pie
                data={data}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="46%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLOR_PALETTE[index % COLOR_PALETTE.length]}
                    stroke="#11111B"
                    strokeWidth={3}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={280}>
            <ScatterChart margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
              <XAxis
                dataKey="x"
                name={chart.x_label || 'X'}
                stroke={AXIS_COLOR}
                tick={{ fontSize: 11, fill: AXIS_COLOR }}
              />
              <YAxis
                dataKey="y"
                name={chart.y_label || 'Y'}
                stroke={AXIS_COLOR}
                tick={{ fontSize: 11, fill: AXIS_COLOR }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name={chart.title} data={data} fill="#8B5CF6" />
            </ScatterChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <div className="text-[#717187] text-xs p-6 text-center">
            Chart format not supported.
          </div>
        );
    }
  };

  return (
    <Card className="flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-[#F4F4F8] tracking-tight">{chart.title}</h3>
          {chart.description && (
            <p className="text-xs text-[#717187] mt-0.5 line-clamp-1">{chart.description}</p>
          )}
        </div>

        <button
          onClick={handleExportPNG}
          title="Export Chart as PNG"
          className="p-1.5 text-[#717187] hover:text-[#F4F4F8] rounded-lg hover:bg-[#191927] transition-colors ml-2"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>

      {/* Visualization Canvas */}
      <div id={containerId} className="flex-1 w-full min-h-[280px] pt-1">
        {renderChart()}
      </div>
    </Card>
  );
}
