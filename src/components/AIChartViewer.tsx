import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { AIChartData } from '../types';
import { BarChart3, TrendingUp, PieChart as PieIcon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface AIChartViewerProps {
  chart: AIChartData;
  forceLight?: boolean;
}

const DEFAULT_COLORS = ['#2563eb', '#0284c7', '#059669', '#7c3aed', '#d97706', '#e11d48'];

export const AIChartViewer: React.FC<AIChartViewerProps> = ({ chart, forceLight = false }) => {
  const { isDark: themeIsDark } = useTheme();
  const isDark = forceLight ? false : themeIsDark;
  const { type, title, description, xAxisLabel, yAxisLabel, data = [], series = [] } = chart;

  if (!data || data.length === 0) {
    return null;
  }

  const gridStroke = isDark ? '#334155' : '#e2e8f0';
  const axisStroke = isDark ? '#94a3b8' : '#475569';
  const tooltipBg = isDark ? '#0f172a' : '#ffffff';
  const tooltipBorder = isDark ? '#334155' : '#cbd5e1';
  const tooltipText = isDark ? '#38bdf8' : '#0284c7';

  // Derive series if not provided
  const activeSeries =
    series.length > 0
      ? series
      : Object.keys(data[0] || {})
          .filter((k) => k !== 'x' && k !== 'name' && k !== 'label')
          .slice(0, 3)
          .map((key, idx) => ({
            dataKey: key,
            name: key.toUpperCase(),
            color: DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
          }));

  const renderChartContent = () => {
    switch (type) {
      case 'bar':
        return (
          <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} opacity={0.6} />
            <XAxis
              dataKey="x"
              stroke={axisStroke}
              fontSize={11}
              label={xAxisLabel ? { value: xAxisLabel, position: 'bottom', fill: axisStroke, fontSize: 11, offset: 5 } : undefined}
            />
            <YAxis
              stroke={axisStroke}
              fontSize={11}
              label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft', fill: axisStroke, fontSize: 11 } : undefined}
            />
            <Tooltip
              contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '0.5rem', fontSize: '12px', color: tooltipText }}
              itemStyle={{ color: tooltipText }}
            />
            {activeSeries.length > 1 && <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />}
            {activeSeries.map((s, idx) => (
              <Bar
                key={s.dataKey}
                dataKey={s.dataKey}
                name={s.name || s.dataKey}
                fill={s.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length]}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        );

      case 'area':
        return (
          <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} opacity={0.6} />
            <XAxis
              dataKey="x"
              stroke={axisStroke}
              fontSize={11}
              label={xAxisLabel ? { value: xAxisLabel, position: 'bottom', fill: axisStroke, fontSize: 11, offset: 5 } : undefined}
            />
            <YAxis
              stroke={axisStroke}
              fontSize={11}
              label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft', fill: axisStroke, fontSize: 11 } : undefined}
            />
            <Tooltip
              contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '0.5rem', fontSize: '12px', color: tooltipText }}
              itemStyle={{ color: tooltipText }}
            />
            {activeSeries.length > 1 && <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />}
            {activeSeries.map((s, idx) => (
              <Area
                key={s.dataKey}
                type="monotone"
                dataKey={s.dataKey}
                name={s.name || s.dataKey}
                stroke={s.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length]}
                fillOpacity={1}
                fill="url(#areaGrad)"
              />
            ))}
          </AreaChart>
        );

      case 'scatter':
        return (
          <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} opacity={0.6} />
            <XAxis
              type="number"
              dataKey="x"
              name={xAxisLabel || 'X'}
              stroke={axisStroke}
              fontSize={11}
              label={xAxisLabel ? { value: xAxisLabel, position: 'bottom', fill: axisStroke, fontSize: 11, offset: 5 } : undefined}
            />
            <YAxis
              type="number"
              dataKey={activeSeries[0]?.dataKey || 'y'}
              name={yAxisLabel || 'Y'}
              stroke={axisStroke}
              fontSize={11}
              label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft', fill: axisStroke, fontSize: 11 } : undefined}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '0.5rem', fontSize: '12px', color: tooltipText }}
            />
            <Scatter name={title} data={data} fill="#38bdf8" />
          </ScatterChart>
        );

      case 'pie':
        return (
          <PieChart margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
            <Tooltip
              contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '0.5rem', fontSize: '12px', color: tooltipText }}
            />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Pie
              data={data}
              dataKey={activeSeries[0]?.dataKey || 'value'}
              nameKey="x"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ name, percent }: { name: string; percent: number }) =>
                `${name} (${(percent * 100).toFixed(0)}%)`
              }
              labelLine={{ stroke: axisStroke }}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={DEFAULT_COLORS[index % DEFAULT_COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        );

      case 'line':
      default:
        return (
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} opacity={0.6} />
            <XAxis
              dataKey="x"
              stroke={axisStroke}
              fontSize={11}
              label={xAxisLabel ? { value: xAxisLabel, position: 'bottom', fill: axisStroke, fontSize: 11, offset: 5 } : undefined}
            />
            <YAxis
              stroke={axisStroke}
              fontSize={11}
              label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft', fill: axisStroke, fontSize: 11 } : undefined}
            />
            <Tooltip
              contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '0.5rem', fontSize: '12px', color: tooltipText }}
              itemStyle={{ color: tooltipText }}
            />
            {activeSeries.length > 1 && <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />}
            {activeSeries.map((s, idx) => (
              <Line
                key={s.dataKey}
                type="monotone"
                dataKey={s.dataKey}
                name={s.name || s.dataKey}
                stroke={s.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length]}
                strokeWidth={2.5}
                dot={{ r: data.length <= 15 ? 3 : 0 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        );
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'bar':
        return <BarChart3 className="w-4 h-4 text-emerald-400" />;
      case 'pie':
        return <PieIcon className="w-4 h-4 text-purple-400" />;
      default:
        return <TrendingUp className="w-4 h-4 text-sky-400" />;
    }
  };

  return (
    <div
      className={`my-3 rounded-xl border p-3 sm:p-4 shadow-md transition-colors ${
        isDark
          ? 'border-sky-500/20 bg-slate-950/80'
          : 'border-slate-200 bg-white shadow-sm'
      }`}
    >
      <div className="flex items-center gap-2 mb-1.5">
        {getIcon()}
        <h4 className={`text-xs sm:text-sm font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{title}</h4>
      </div>
      {description && (
        <p className={`text-[11px] mb-3 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          {description}
        </p>
      )}
      <div className="w-full h-56 sm:h-64 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          {renderChartContent()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
