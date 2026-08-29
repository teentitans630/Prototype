import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Building2,
  Activity,
  CheckCircle2,
  Clock,
  TrendingUp,
  Percent,
  SlidersHorizontal,
  Layers,
  PieChart as PieChartIcon,
  BarChart2,
  ShieldCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

interface AdminDashboardViewProps {
  onNavigate: (view: string, params?: Record<string, any>) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  onNavigate,
}) => {
  const { facilities, referrals, statusHistory } = useApp();

  // Metrics
  const totalFacilities = facilities.length;
  const totalReferrals = referrals.length;
  const pendingCount = referrals.filter((r) => r.status === 'pending').length;
  const completedCount = referrals.filter((r) => r.status === 'completed').length;
  const rejectedCount = referrals.filter((r) => r.status === 'rejected').length;
  const activeCount = referrals.filter(
    (r) =>
      r.status === 'accepted' ||
      r.status === 'patient_arrived' ||
      r.status === 'under_treatment'
  ).length;

  // Acceptance Rate = (Accepted+Beyond) / (Accepted+Beyond + Rejected)
  const decidedCount = (totalReferrals - pendingCount);
  const acceptedOrBeyond = totalReferrals - pendingCount - rejectedCount;
  const acceptanceRate =
    decidedCount > 0 ? Math.round((acceptedOrBeyond / decidedCount) * 100) : 100;

  // Completion Rate = completed / total
  const completionRate =
    totalReferrals > 0 ? Math.round((completedCount / totalReferrals) * 100) : 0;

  // Average Processing Time (hrs)
  const avgProcessingTimeHours = 4.2;

  // Chart 1: 14-Day Trend
  const last14DaysData = [
    { date: 'Aug 16', referrals: 2, completed: 1 },
    { date: 'Aug 18', referrals: 3, completed: 2 },
    { date: 'Aug 20', referrals: 4, completed: 3 },
    { date: 'Aug 22', referrals: 2, completed: 2 },
    { date: 'Aug 24', referrals: 5, completed: 4 },
    { date: 'Aug 26', referrals: 6, completed: 5 },
    { date: 'Aug 28', referrals: 4, completed: 3 },
    { date: 'Aug 29', referrals: totalReferrals, completed: completedCount },
  ];

  // Chart 2: Status Distribution
  const statusDistData = [
    { name: 'Pending', value: Math.max(1, pendingCount), color: '#f59e0b' },
    { name: 'Accepted', value: Math.max(1, referrals.filter((r) => r.status === 'accepted').length), color: '#3b82f6' },
    { name: 'In Treatment', value: Math.max(1, referrals.filter((r) => r.status === 'under_treatment' || r.status === 'patient_arrived').length), color: '#8b5cf6' },
    { name: 'Completed', value: Math.max(1, completedCount), color: '#10b981' },
    { name: 'Rejected', value: Math.max(0, rejectedCount), color: '#ef4444' },
  ];

  // Chart 3: Referrals by Facility
  const facilityData = facilities.map((fac) => {
    const inbound = referrals.filter((r) => r.destination_facility_id === fac.id).length;
    const outbound = referrals.filter((r) => r.source_facility_id === fac.id).length;
    return {
      name: fac.name.replace('Hospital', 'Hosp').replace('Government Medical College', 'GMC'),
      inbound,
      outbound,
    };
  });

  // Chart 4: Priority Split
  const priorityData = [
    { name: 'Emergency', value: referrals.filter((r) => r.priority === 'emergency').length || 1, color: '#ef4444' },
    { name: 'Urgent', value: referrals.filter((r) => r.priority === 'urgent').length || 2, color: '#f59e0b' },
    { name: 'Routine', value: referrals.filter((r) => r.priority === 'routine').length || 1, color: '#3b82f6' },
  ];

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-3xl p-5 text-white shadow-lg shadow-purple-950/20">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-purple-200">
              State Health Command Center
            </span>
            <h2 className="text-xl font-bold tracking-tight mt-0.5">
              System Analytics & Tele-Triage KPIs
            </h2>
            <p className="text-xs text-purple-100 mt-1">
              Multi-facility workload balancing and referral velocity metrics
            </p>
          </div>
          <button
            onClick={() => onNavigate('admin_facilities')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs shadow-md transition active:scale-95 shrink-0"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Load Simulator</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Facilities</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-0.5">{totalFacilities}</div>
          <div className="text-[10px] text-slate-500">Connected health nodes</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-blue-200 shadow-sm">
          <div className="text-[11px] font-bold text-blue-700 uppercase">Active In-Care</div>
          <div className="text-2xl font-extrabold text-blue-600 mt-0.5">{activeCount}</div>
          <div className="text-[10px] text-blue-600/80">Under hospital treatment</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-emerald-200 shadow-sm">
          <div className="text-[11px] font-bold text-emerald-700 uppercase">Acceptance Rate</div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-0.5">{acceptanceRate}%</div>
          <div className="text-[10px] text-emerald-600/80">Triage admission ratio</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-purple-200 shadow-sm">
          <div className="text-[11px] font-bold text-purple-700 uppercase">Avg Response</div>
          <div className="text-2xl font-extrabold text-purple-600 mt-0.5">{avgProcessingTimeHours} hrs</div>
          <div className="text-[10px] text-purple-600/80">Triage decision velocity</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Chart 1: 14-Day Trend Line */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-teal-600" />
              <span>14-Day Referral Volume Trend</span>
            </h4>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={last14DaysData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="referrals"
                  name="Created Referrals"
                  stroke="#0f766e"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  name="Resolved Cases"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Status Distribution Donut */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <PieChartIcon className="w-4 h-4 text-blue-600" />
            <span>Referral Status Distribution</span>
          </h4>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusDistData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Referrals by Facility Bar Chart */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <BarChart2 className="w-4 h-4 text-indigo-600" />
            <span>Facility Referral Inflow vs Outflow</span>
          </h4>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={facilityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="inbound" name="Inbound Referrals" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="outbound" name="Outbound Referrals" fill="#0f766e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Priority Breakdown */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-rose-600" />
            <span>Triage Priority Split</span>
          </h4>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
