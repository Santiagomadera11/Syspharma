import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'purple' | 'pink';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const colorStyles = {
  blue: { bg: '#93C5FD', text: '#1E40AF' },
  green: { bg: '#A7F3D0', text: '#065F46' },
  purple: { bg: '#C4B5FD', text: '#5B21B6' },
  pink: { bg: '#FBCFE8', text: '#9F1239' },
};

export function StatCard({ title, value, icon: Icon, color, trend }: StatCardProps) {
  const styles = colorStyles[color];

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 transition-all duration-200 hover:scale-[1.02]">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-2">{title}</p>
          <p className="text-3xl text-gray-800 mb-1">{value}</p>
          {trend && (
            <p
              className="text-sm"
              style={{ color: trend.isPositive ? '#10B981' : '#EF4444' }}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: styles.bg }}
        >
          <Icon size={24} style={{ color: styles.text }} />
        </div>
      </div>
    </div>
  );
}
