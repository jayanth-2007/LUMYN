import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { ChevronLeft, ChevronRight, ArrowUpDown, Download } from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';

export default function DataPreviewTable({
  columns = [],
  data = [],
  page = 1,
  totalPages = 1,
  totalRows = 0,
  pageSize = 25,
  onPageChange,
  onSort,
  sortBy,
  sortDir,
}) {
  const handleExportTable = () => {
    if (!data.length) return;
    exportToCSV(data, 'lumyn_data_preview.csv');
  };

  return (
    <Card className="flex flex-col overflow-hidden p-0">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-5 border-b border-[#232334]">
        <div>
          <h3 className="text-sm font-bold text-[#F4F4F8] tracking-tight">Dataset Record Preview</h3>
          <p className="text-xs text-[#717187] mt-0.5 font-mono">
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalRows)} of{' '}
            {totalRows.toLocaleString()} rows
          </p>
        </div>

        <Button variant="secondary" size="sm" onClick={handleExportTable} icon={Download}>
          Export CSV
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left text-[#A1A1B5]">
          <thead className="bg-[#191927] text-[#717187] uppercase text-[10px] tracking-widest border-b border-[#232334]">
            <tr>
              <th className="px-4 py-3 font-semibold w-12 text-center text-[#717187]">#</th>
              {columns.map((col) => (
                <th
                  key={col}
                  onClick={() => onSort && onSort(col)}
                  className="px-4 py-3 font-semibold cursor-pointer hover:text-[#F4F4F8] transition-colors select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col}</span>
                    <ArrowUpDown className={`w-3 h-3 ${sortBy === col ? 'text-[#8B5CF6]' : 'text-[#717187]'}`} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row, idx) => (
                <tr
                  key={idx}
                  className={`border-b border-[#232334]/50 hover:bg-[#191927] transition-colors ${
                    idx % 2 === 0 ? 'bg-[#11111B]' : 'bg-[#141421]'
                  }`}
                >
                  <td className="px-4 py-2.5 text-center font-mono text-[#717187] text-[10px]">
                    {(page - 1) * pageSize + idx + 1}
                  </td>
                  {columns.map((col) => {
                    const val = row[col];
                    const isNull = val === null || val === undefined;
                    return (
                      <td
                        key={col}
                        className={`px-4 py-2.5 truncate max-w-[220px] font-mono text-[11px] ${
                          isNull ? 'text-[#717187] italic' : 'text-[#F4F4F8]'
                        }`}
                      >
                        {isNull ? 'null' : String(val)}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="p-8 text-center text-[#717187]">
                  No records to display.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-between p-4 border-t border-[#232334] text-xs text-[#717187]">
        <span className="font-mono">
          Page {page} of {totalPages || 1}
        </span>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            icon={ChevronLeft}
          >
            Previous
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            icon={ChevronRight}
          >
            Next
          </Button>
        </div>
      </div>
    </Card>
  );
}
