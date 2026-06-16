import React from 'react';
import { cn } from '@/lib/utils';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className }) => {
  return (
    <div className="overflow-x-auto">
      <table className={cn('min-w-full divide-y divide-slate-200', className)}>
        {children}
      </table>
    </div>
  );
};

interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const TableHeader: React.FC<TableHeaderProps> = ({ children, className }) => {
  return (
    <thead className={cn('bg-slate-50', className)}>
      {children}
    </thead>
  );
};

interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const TableBody: React.FC<TableBodyProps> = ({ children, className }) => {
  return (
    <tbody className={cn('bg-white divide-y divide-slate-200', className)}>
      {children}
    </tbody>
  );
};

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
}

export const TableRow: React.FC<TableRowProps> = ({ children, className, onClick, selected }) => {
  return (
    <tr
      className={cn(
        onClick && 'cursor-pointer transition-colors',
        onClick && 'hover:bg-slate-50',
        selected && 'bg-blue-50',
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
};

interface TableHeadProps {
  children: React.ReactNode;
  className?: string;
}

export const TableHead: React.FC<TableHeadProps> = ({ children, className }) => {
  return (
    <th
      className={cn(
        'px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider',
        className
      )}
    >
      {children}
    </th>
  );
};

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const TableCell: React.FC<TableCellProps> = ({ children, className, title }) => {
  return (
    <td className={cn('px-4 py-3 text-sm text-slate-700 whitespace-nowrap', className)} title={title}>
      {children}
    </td>
  );
};
