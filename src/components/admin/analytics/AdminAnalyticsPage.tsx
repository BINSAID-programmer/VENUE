import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  BarChart3,
  Users,
  GraduationCap,
  UserCheck,
  Shield,
  Layers,
  Building,
  Building2,
  BookOpen,
  FileText,
  Megaphone,
  Sparkles,
  RefreshCw,
  Calendar,
  AlertCircle,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Info,
  DollarSign,
  Cpu,
  ArrowUpRight,
  Filter,
  Activity,
  Award,
} from 'lucide-react';
import { AdminStatCard } from '../AdminStatCard';
import { adminAnalyticsService } from '../../../services/adminAnalyticsService';
import {
  AdminAdvancedAnalytics,
  AnalyticsDateRange,
  AnalyticsRoleFilter,
  AnalyticsFeatureType,
  UserGrowthDataPoint,
} from '../../../types';
import { UserEngagementSection } from './UserEngagementSection';
import { FeatureUsageSection } from './FeatureUsageSection';
import { MaterialEngagementSection } from './MaterialEngagementSection';
import { UserRetentionSection } from './UserRetentionSection';
import { ExtendedAITutorSection } from './ExtendedAITutorSection';

export const AdminAnalyticsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<AnalyticsDateRange>('30d');
  const [roleFilter, setRoleFilter] = useState<AnalyticsRoleFilter>('all');
  const [featureFilter, setFeatureFilter] = useState<AnalyticsFeatureType>('all');
  const [overview, setOverview] = useState<AdminAdvancedAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<UserGrowthDataPoint | null>(null);

  const loadAnalytics = useCallback(
    async (range: AnalyticsDateRange, role: AnalyticsRoleFilter, feature: AnalyticsFeatureType, force = false) => {
      if (force) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      try {
        const data = await adminAnalyticsService.getAnalyticsOverview(range, role, feature, force);
        setOverview(data);
      } catch (err: any) {
        console.error('Failed to load admin analytics:', err);
        setError(err?.message || 'Unable to retrieve analytics data from backend. Please retry.');
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadAnalytics(dateRange, roleFilter, featureFilter);
  }, [dateRange, roleFilter, featureFilter, loadAnalytics]);

  const handleRangeChange = (range: AnalyticsDateRange) => {
    setDateRange(range);
  };

  const handleRoleChange = (role: AnalyticsRoleFilter) => {
    setRoleFilter(role);
  };

  const handleFeatureFilterChange = (feat: AnalyticsFeatureType) => {
    setFeatureFilter(feat);
  };

  const handleRefresh = () => {
    loadAnalytics(dateRange, roleFilter, featureFilter, true);
  };

  // SVG Chart calculation for User Growth
  const chartData = useMemo(() => {
    if (!overview || !overview.userGrowth.points || overview.userGrowth.points.length === 0) {
      return null;
    }
    const points = overview.userGrowth.points;
    const maxVal = Math.max(...points.map((p) => p.cumulativeUsers), 5);
    const minVal = 0;

    const width = 680;
    const height = 180;
    const paddingLeft = 36;
    const paddingRight = 24;
    const paddingTop = 20;
    const paddingBottom = 30;

    const plotWidth = width - paddingLeft - paddingRight;
    const plotHeight = height - paddingTop - paddingBottom;

    const coords = points.map((p, index) => {
      const x = paddingLeft + (index / Math.max(1, points.length - 1)) * plotWidth;
      const normalizedY = (p.cumulativeUsers - minVal) / (maxVal - minVal || 1);
      const y = paddingTop + plotHeight - normalizedY * plotHeight;
      return { x, y, point: p };
    });

    const pathD = coords.reduce((acc, curr, idx) => {
      return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
    }, '');

    const areaD =
      coords.length > 0
        ? `${pathD} L ${coords[coords.length - 1].x} ${paddingTop + plotHeight} L ${coords[0].x} ${paddingTop + plotHeight} Z`
        : '';

    return {
      width,
      height,
      coords,
      pathD,
      areaD,
      maxVal,
      plotHeight,
      paddingTop,
      paddingLeft,
      plotWidth,
    };
  }, [overview]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-12">
      {/* Page Header with Time Range Filters, Role/Feature Selectors and Refresh Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <BarChart3 className="h-4 w-4" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Platform Intelligence
            </span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Admin Analytics & Telemetry
          </h1>
          <p className="mt-1 text-sm text-slate-400 max-w-2xl">
            Real platform engagement, feature telemetry, retention cohorts, and institutional resource adoption
            queried directly from the verified database.
          </p>
        </div>

        {/* Date Filter & Refresh Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Supported Date Range Selector */}
          <div className="flex items-center rounded-xl bg-slate-900/90 border border-slate-800 p-1 shadow-inner">
            {(
              [
                { id: '7d', label: '7D' },
                { id: '30d', label: '30D' },
                { id: '90d', label: '90D' },
                { id: 'all', label: 'All' },
              ] as const
            ).map((btn) => (
              <button
                key={btn.id}
                onClick={() => handleRangeChange(btn.id)}
                className={`rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition ${
                  dateRange === btn.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* User Role Filter */}
          <div className="flex items-center rounded-xl bg-slate-900/90 border border-slate-800 px-2 py-1">
            <span className="text-[11px] text-slate-500 mr-1.5 font-medium hidden sm:inline">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => handleRoleChange(e.target.value as AnalyticsRoleFilter)}
              aria-label="Filter by user role"
              className="bg-transparent text-xs font-medium text-slate-200 outline-none cursor-pointer py-0.5"
            >
              <option value="all" className="bg-slate-900 text-white">All Roles</option>
              <option value="student" className="bg-slate-900 text-white">Students Only</option>
              <option value="lecturer" className="bg-slate-900 text-white">Lecturers Only</option>
              <option value="admin" className="bg-slate-900 text-white">Admins Only</option>
            </select>
          </div>

          {/* Feature Filter Dropdown */}
          <div className="flex items-center rounded-xl bg-slate-900/90 border border-slate-800 px-2 py-1">
            <span className="text-[11px] text-slate-500 mr-1.5 font-medium hidden sm:inline">Module:</span>
            <select
              value={featureFilter}
              onChange={(e) => handleFeatureFilterChange(e.target.value as AnalyticsFeatureType)}
              aria-label="Filter by module feature"
              className="bg-transparent text-xs font-medium text-slate-200 outline-none cursor-pointer py-0.5"
            >
              <option value="all" className="bg-slate-900 text-white">All Features</option>
              <option value="ai_tutor" className="bg-slate-900 text-white">AI Tutor</option>
              <option value="materials" className="bg-slate-900 text-white">Materials</option>
              <option value="study_planner" className="bg-slate-900 text-white">Study Planner</option>
              <option value="quizzes" className="bg-slate-900 text-white">Quizzes</option>
              <option value="courses" className="bg-slate-900 text-white">Courses</option>
              <option value="announcements" className="bg-slate-900 text-white">Announcements</option>
            </select>
          </div>

          {/* Refresh Action */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || loading}
            aria-label="Refresh analytics data"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
            <span className="hidden sm:inline">{isRefreshing ? 'Updating...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* ERROR STATE */}
      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-200 backdrop-blur-md">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-red-100">Analytics Synchronization Error</h3>
              <p className="mt-1 text-xs text-red-300/90 leading-relaxed">{error}</p>
              <button
                onClick={() => loadAnalytics(dateRange, roleFilter, featureFilter, true)}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-red-600/80 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500 transition cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Retry Loading</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOADING SKELETON */}
      {loading && !overview && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="h-32 rounded-2xl border border-slate-800 bg-slate-900/40 p-4 animate-pulse flex flex-col justify-between"
              >
                <div className="flex justify-between items-center">
                  <div className="h-4 w-24 bg-slate-800 rounded" />
                  <div className="h-8 w-8 bg-slate-800 rounded-lg" />
                </div>
                <div className="h-7 w-16 bg-slate-800 rounded" />
                <div className="h-3 w-32 bg-slate-800/60 rounded" />
              </div>
            ))}
          </div>

          <div className="h-80 rounded-3xl border border-slate-800 bg-slate-900/30 p-6 animate-pulse" />
        </div>
      )}

      {/* LOADED CONTENT */}
      {overview && (
        <div className="space-y-8">
          {/* 1. OVERVIEW METRICS: 10 Core Institutional Real Counts */}
          <div>
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <span>Institutional Overview Metrics</span>
                  <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold text-indigo-300 border border-indigo-500/30">
                    All-Time Verified
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  Exact entity counts retrieved from Firestore and audited institutional records
                </p>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                Last calculated: {new Date(overview.lastAggregatedAt).toLocaleTimeString()}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* 1. Total Registered Users */}
              <AdminStatCard
                title="Total Registered Users"
                value={overview.allTime.totalUsers}
                subtitle={`${overview.allTime.totalStudents} students • ${overview.allTime.totalLecturers} staff`}
                icon={Users}
                colorScheme="indigo"
                badge="All Accounts"
              />

              {/* 2. Total Students */}
              <AdminStatCard
                title="Total Students"
                value={overview.allTime.totalStudents}
                subtitle="Enrolled student directory"
                icon={GraduationCap}
                colorScheme="sky"
                badge="Undergrad / Postgrad"
              />

              {/* 3. Total Lecturers */}
              <AdminStatCard
                title="Total Lecturers"
                value={overview.allTime.totalLecturers}
                subtitle="Verified teaching faculty"
                icon={UserCheck}
                colorScheme="purple"
                badge="Academic Staff"
              />

              {/* 4. Total Administrators */}
              <AdminStatCard
                title="Total Administrators"
                value={overview.allTime.totalAdministrators}
                subtitle="Super & departmental admins"
                icon={Shield}
                colorScheme="emerald"
                badge="RBAC Active"
              />

              {/* 5. Academic Units */}
              <AdminStatCard
                title="Academic Units"
                value={overview.allTime.totalAcademicUnits}
                subtitle="Colleges, Schools & Institutes"
                icon={Layers}
                colorScheme="amber"
                badge="Accredited"
              />

              {/* 6. Departments */}
              <AdminStatCard
                title="Departments"
                value={overview.allTime.totalDepartments}
                subtitle="Active teaching departments"
                icon={Building}
                colorScheme="rose"
                badge="Constituent"
              />

              {/* 7. Degree Programmes */}
              <AdminStatCard
                title="Programmes"
                value={overview.allTime.totalProgrammes}
                subtitle="Bachelor, Master & Diplomas"
                icon={BookOpen}
                colorScheme="indigo"
                badge="Senate Approved"
              />

              {/* 8. Canonical Courses */}
              <AdminStatCard
                title="Canonical Courses"
                value={overview.allTime.totalCourses}
                subtitle="Master accredited courses"
                icon={BookOpen}
                colorScheme="sky"
                badge="No Duplicates"
              />

              {/* 9. Total Materials */}
              <AdminStatCard
                title="Academic Materials"
                value={overview.allTime.totalMaterials}
                subtitle="Repository documents & notes"
                icon={FileText}
                colorScheme="emerald"
                badge="Cloud Verified"
              />

              {/* 10. Published Announcements */}
              <AdminStatCard
                title="Published Notices"
                value={overview.allTime.totalPublishedAnnouncements}
                subtitle="Active broadcast notices"
                icon={Megaphone}
                colorScheme="amber"
                badge="Live Broadcast"
              />
            </div>
          </div>

          {/* 2. USER ENGAGEMENT OVERVIEW (Stage 8B: DAU, WAU, MAU, Ratios & Trend) */}
          <UserEngagementSection
            engagement={overview.engagement}
            dateRange={dateRange}
          />

          {/* 3. FEATURE USAGE BREAKDOWN (Stage 8B: 6 Core Modules & Filtering) */}
          <FeatureUsageSection
            features={overview.featureUsage.features}
            totalFeatureInteractions={overview.featureUsage.totalFeatureInteractions}
            activeFeatureFilter={featureFilter}
            onSelectFeatureFilter={handleFeatureFilterChange}
          />

          {/* 4. EXTENDED AI TUTOR TELEMETRY (Stage 8B: Daily Trends, Avg Tokens, Costs) */}
          <ExtendedAITutorSection
            aiTutor={overview.extendedAiTutor}
          />

          {/* 5. ACADEMIC MATERIAL ENGAGEMENT (Stage 8B: Most Viewed, Most Downloaded, Course Demand) */}
          <MaterialEngagementSection
            materialEngagement={overview.materialEngagement}
          />

          {/* 6. USER RETENTION COHORTS (Stage 8B: Day 1, Day 7, Day 30 Retention) */}
          <UserRetentionSection
            retention={overview.retention}
          />

          {/* 7. USER REGISTRATION GROWTH TREND (From Stage 8A) */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-5 sm:p-6 backdrop-blur-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-indigo-400" />
                  <h3 className="text-base font-bold text-white tracking-tight">
                    User Registration Growth Trend
                  </h3>
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-300 border border-slate-700">
                    {dateRange === '7d' ? '7-Day Window' : dateRange === '30d' ? '30-Day Window' : dateRange === '90d' ? '90-Day Window' : 'All-Time Window'}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Daily progression of verified accounts with registered creation timestamps.
                </p>
              </div>

              {/* Period vs All-Time Stat Chips */}
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-right">
                  <div className="text-[10px] font-medium uppercase tracking-wider text-indigo-300">
                    Period New Accounts
                  </div>
                  <div className="text-base font-bold text-white font-mono">
                    +{overview.userGrowth.periodNewUsers}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-700/60 bg-slate-800/60 px-3 py-1.5 text-right">
                  <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                    Total Account Base
                  </div>
                  <div className="text-base font-bold text-slate-100 font-mono">
                    {overview.userGrowth.totalUsers}
                  </div>
                </div>
              </div>
            </div>

            {/* Real Timestamp Limitation Disclosure */}
            {overview.userGrowth.hasTimestampLimitation && overview.userGrowth.limitationNote && (
              <div className="flex items-center gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3.5 py-2.5 text-xs text-amber-200/90">
                <Info className="h-4 w-4 text-amber-400 flex-shrink-0" />
                <span>{overview.userGrowth.limitationNote}</span>
              </div>
            )}

            {/* Trend Chart (SVG) */}
            {chartData && (
              <div className="relative pt-2">
                <div className="overflow-x-auto">
                  <svg
                    viewBox={`0 0 ${chartData.width} ${chartData.height}`}
                    className="w-full h-48 select-none"
                  >
                    <defs>
                      <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Grid lines */}
                    <line
                      x1={chartData.paddingLeft}
                      y1={chartData.paddingTop}
                      x2={chartData.width - 24}
                      y2={chartData.paddingTop}
                      stroke="#334155"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                    <line
                      x1={chartData.paddingLeft}
                      y1={chartData.paddingTop + chartData.plotHeight / 2}
                      x2={chartData.width - 24}
                      y2={chartData.paddingTop + chartData.plotHeight / 2}
                      stroke="#334155"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                    <line
                      x1={chartData.paddingLeft}
                      y1={chartData.paddingTop + chartData.plotHeight}
                      x2={chartData.width - 24}
                      y2={chartData.paddingTop + chartData.plotHeight}
                      stroke="#475569"
                      strokeWidth="1"
                    />

                    {/* Y-Axis Value Labels */}
                    <text
                      x={chartData.paddingLeft - 8}
                      y={chartData.paddingTop + 4}
                      fill="#94a3b8"
                      fontSize="10"
                      textAnchor="end"
                      fontFamily="monospace"
                    >
                      {chartData.maxVal}
                    </text>
                    <text
                      x={chartData.paddingLeft - 8}
                      y={chartData.paddingTop + chartData.plotHeight / 2 + 4}
                      fill="#94a3b8"
                      fontSize="10"
                      textAnchor="end"
                      fontFamily="monospace"
                    >
                      {Math.round(chartData.maxVal / 2)}
                    </text>
                    <text
                      x={chartData.paddingLeft - 8}
                      y={chartData.paddingTop + chartData.plotHeight + 4}
                      fill="#94a3b8"
                      fontSize="10"
                      textAnchor="end"
                      fontFamily="monospace"
                    >
                      0
                    </text>

                    {/* Area under curve */}
                    <path d={chartData.areaD} fill="url(#growthGradient)" />

                    {/* Primary trend curve */}
                    <path
                      d={chartData.pathD}
                      fill="none"
                      stroke="#818cf8"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Data point circles */}
                    {chartData.coords.map((c, i) => (
                      <g key={i}>
                        <circle
                          cx={c.x}
                          cy={c.y}
                          r={hoveredPoint?.date === c.point.date ? 5 : 3.5}
                          fill="#4f46e5"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                          className="cursor-pointer transition-all hover:scale-125"
                          onMouseEnter={() => setHoveredPoint(c.point)}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                        {/* Selected X-axis date labels */}
                        {(i === 0 || i === Math.floor(chartData.coords.length / 2) || i === chartData.coords.length - 1) && (
                          <text
                            x={c.x}
                            y={chartData.paddingTop + chartData.plotHeight + 20}
                            fill="#64748b"
                            fontSize="10"
                            textAnchor="middle"
                            fontFamily="sans-serif"
                          >
                            {c.point.label}
                          </text>
                        )}
                      </g>
                    ))}
                  </svg>
                </div>

                {/* Point Hover Tooltip */}
                {hoveredPoint && (
                  <div className="mt-2 inline-flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200">
                    <span className="font-semibold text-white">{hoveredPoint.label}:</span>
                    <span>Cumulative Users: <strong className="text-indigo-400 font-mono">{hoveredPoint.cumulativeUsers}</strong></span>
                    <span>•</span>
                    <span>New Registered: <strong className="text-emerald-400 font-mono">+{hoveredPoint.newUsers}</strong></span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 8. ACADEMIC CATALOGUE ARCHITECTURE (From Stage 8A) */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-5 sm:p-6 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-sky-400" />
                <h3 className="text-sm font-bold text-white tracking-tight uppercase">
                  Academic Catalogue Architecture
                </h3>
              </div>
              <span className="text-xs font-semibold text-sky-400">
                {overview.catalogue.universities} Institution
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Hierarchical relationships connecting institutional academic units, academic departments, degree programmes, and master courses.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
              <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-3.5">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                  Academic Units
                </div>
                <div className="text-xl font-bold text-white mt-1 font-mono">
                  {overview.catalogue.academicUnits}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Colleges & Schools</div>
              </div>

              <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-3.5">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                  Departments
                </div>
                <div className="text-xl font-bold text-white mt-1 font-mono">
                  {overview.catalogue.departments}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Academic Sections</div>
              </div>

              <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-3.5">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                  Programmes
                </div>
                <div className="text-xl font-bold text-white mt-1 font-mono">
                  {overview.catalogue.programmes}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Degrees & Diplomas</div>
              </div>

              <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-3.5">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                  Canonical Courses
                </div>
                <div className="text-xl font-bold text-white mt-1 font-mono">
                  {overview.catalogue.canonicalCourses}
                </div>
                <div className="text-[10px] text-emerald-400 mt-0.5">Distinct Master Codes</div>
              </div>

              <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-3.5">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                  Curriculum Offerings
                </div>
                <div className="text-xl font-bold text-white mt-1 font-mono">
                  {overview.catalogue.totalCurriculumOfferings}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Across syllabus mappings
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800/60 bg-slate-950/40 p-3 text-xs text-slate-400 flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-sky-400 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Deduplication Guard:</strong> Master courses are counted once by unique code (e.g. CS 174) rather than multiplying across every programme syllabus.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
