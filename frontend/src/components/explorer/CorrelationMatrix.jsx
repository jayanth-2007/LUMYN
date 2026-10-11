import React from 'react';
import Card from '../common/Card';

export default function CorrelationMatrix({ correlations }) {
  if (!correlations || Object.keys(correlations).length === 0) return null;

  const columns = Object.keys(correlations);

  const getHeatmapColor = (val) => {
    if (val === null || val === undefined) return 'bg-[#191927] text-[#717187]';
    if (val === 1) return 'bg-[#8B5CF6] text-white font-bold';
    if (val >= 0.7) return 'bg-[#8B5CF6]/75 text-white';
    if (val >= 0.4) return 'bg-[#8B5CF6]/45 text-[#A78BFA]';
    if (val >= 0.1) return 'bg-[#8B5CF6]/15 text-[#A1A1B5]';
    if (val <= -0.7) return 'bg-[#FB7185]/75 text-white';
    if (val <= -0.4) return 'bg-[#FB7185]/45 text-[#FB7185]';
    if (val <= -0.1) return 'bg-[#FB7185]/15 text-[#A1A1B5]';
    return 'bg-[#232334]/60 text-[#717187]';
  };

  return (
    <Card className="overflow-x-auto">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-[#F4F4F8] tracking-tight">
          Numerical Pearson Correlation Heatmap
        </h3>
        <p className="text-xs text-[#717187] mt-0.5">
          Values close to +1.0 indicate strong positive correlation; values near −1.0 indicate
          inverse correlation.
        </p>
      </div>

      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            <th className="p-2 text-left text-[#717187] font-semibold border-b border-[#232334]">
              Metric
            </th>
            {columns.map((col) => (
              <th
                key={col}
                className="p-2 text-center text-[#A1A1B5] font-semibold border-b border-[#232334] truncate max-w-[100px]"
                title={col}
              >
                {col.replace('_', ' ')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {columns.map((rowCol) => (
            <tr key={rowCol} className="hover:bg-[#191927] transition-colors">
              <td className="p-2 font-medium text-[#A1A1B5] border-b border-[#232334]/60 truncate max-w-[120px]">
                {rowCol.replace('_', ' ')}
              </td>
              {columns.map((colCol) => {
                const val = correlations[rowCol]?.[colCol];
                return (
                  <td key={colCol} className="p-1 border-b border-[#232334]/60 text-center">
                    <div
                      className={`py-1.5 px-2 rounded-lg font-mono text-[11px] transition-transform hover:scale-105 ${getHeatmapColor(val)}`}
                      title={`${rowCol} vs ${colCol}: ${val ?? 'N/A'}`}
                    >
                      {val !== null && val !== undefined ? val.toFixed(2) : '—'}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
