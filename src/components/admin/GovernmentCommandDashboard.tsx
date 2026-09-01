import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  OutbreakAlert,
  GeoCluster,
  HospitalCapacityForecast,
  InterventionPolicy,
  OutbreakSeverity,
} from '../../types/epidemiology';
import {
  DEFAULT_OUTBREAK_ALERTS,
  DEFAULT_GEO_CLUSTERS,
  DEFAULT_INTERVENTION_POLICIES,
  calculateHospitalForecasts,
  extractGeoClustersFromPatients,
  generateDiseaseTrends,
} from '../../services/predictiveEngine';
import {
  Activity,
  AlertTriangle,
  Flame,
  ShieldAlert,
  Building2,
  Bed,
  Droplets,
  Wind,
  Layers,
  MapPin,
  TrendingUp,
  Sliders,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  RefreshCw,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Radio,
  FileSpreadsheet,
  Megaphone,
  Truck,
  Syringe,
  Waves,
  ShieldCheck,
  ChevronRight,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

interface GovernmentCommandDashboardProps {
  onNavigate?: (view: string, params?: Record<string, any>) => void;
}

export const GovernmentCommandDashboard: React.FC<GovernmentCommandDashboardProps> = ({
  onNavigate,
}) => {
  const { facilities, patients } = useApp();

  // State management
  const [activeTab, setActiveTab] = useState<'gis' | 'forecast' | 'policies' | 'trends'>('gis');
  const [selectedDiseaseFilter, setSelectedDiseaseFilter] = useState<string>('all');
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>('cluster-kukatpally-01');
  const [outbreaks, setOutbreaks] = useState<OutbreakAlert[]>(DEFAULT_OUTBREAK_ALERTS);
  const [policies, setPolicies] = useState<InterventionPolicy[]>(DEFAULT_INTERVENTION_POLICIES);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Dynamic clusters aggregating patient registries
  const geoClusters = useMemo(() => {
    return extractGeoClustersFromPatients(patients, outbreaks);
  }, [patients, outbreaks]);

  // Dynamic hospital forecasts taking active policies into account
  const hospitalForecasts = useMemo(() => {
    return calculateHospitalForecasts(facilities, outbreaks, policies);
  }, [facilities, outbreaks, policies]);

  // Disease Trends
  const diseaseTrends = useMemo(() => {
    return generateDiseaseTrends();
  }, []);

  // Filtered clusters
  const filteredClusters = useMemo(() => {
    if (selectedDiseaseFilter === 'all') return geoClusters;
    return geoClusters.filter((c) =>
      c.primaryDisease.toLowerCase().includes(selectedDiseaseFilter.toLowerCase())
    );
  }, [geoClusters, selectedDiseaseFilter]);

  const activeSelectedCluster = geoClusters.find((c) => c.id === selectedClusterId) || geoClusters[0];

  // Aggregate Key Metrics
  const totalConfirmed = outbreaks.reduce((acc, o) => acc + o.confirmedCases, 0);
  const totalSuspected = outbreaks.reduce((acc, o) => acc + o.suspectedCases, 0);
  const totalHospitalized = outbreaks.reduce((acc, o) => acc + o.hospitalizedCases, 0);
  const highestR0 = Math.max(...outbreaks.map((o) => o.r0Estimated));

  // Policy toggling and deployment
  const handleDeployPolicy = (policyId: string) => {
    setPolicies((prev) =>
      prev.map((p) => {
        if (p.id === policyId) {
          const isActivating = p.status !== 'Active';
          return {
            ...p,
            status: isActivating ? 'Active' : 'Pending',
            deployedAt: isActivating ? new Date().toISOString() : undefined,
            deployedBy: isActivating ? 'State Epidemiological Commander' : undefined,
          };
        }
        return p;
      })
    );

    const targetPolicy = policies.find((p) => p.id === policyId);
    setActionSuccessMsg(
      targetPolicy?.status === 'Active'
        ? `Policy intervention stand-down initiated: ${targetPolicy.title}`
        : `Policy mobilized successfully: ${targetPolicy?.title}`
    );

    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-4">
      {/* Top Health Command Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-xl border border-indigo-800/40 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-44 h-44 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-8 -bottom-8 w-44 h-44 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                Live Epidemiological Command (EIRC)
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Surveillance District: HYD-METRO
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              Epidemiological Intelligence & Surge Command
            </h2>
            <p className="text-xs text-indigo-200/80 max-w-2xl">
              Spatial cluster analytics, mathematical R0 contagion tracking, and proactive multi-hospital surge forecasting.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setActionSuccessMsg('Epidemiological data refreshed from real-time sentinel feeds.');
                setTimeout(() => setActionSuccessMsg(null), 3000);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync Sentinels</span>
            </button>
            <button
              onClick={() => setActiveTab('policies')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition active:scale-95"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Intervention Console</span>
            </button>
          </div>
        </div>

        {/* Action Notification Toast */}
        {actionSuccessMsg && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* Quick Outbreak Metric Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confirmed Active</div>
            <div className="text-xl sm:text-2xl font-black text-rose-400 mt-0.5">{totalConfirmed}</div>
            <div className="text-[10px] text-rose-300/70">+{outbreaks[0].growthRatePct}% 7-day velocity</div>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Suspected / In Triage</div>
            <div className="text-xl sm:text-2xl font-black text-amber-400 mt-0.5">{totalSuspected}</div>
            <div className="text-[10px] text-amber-300/70">Across 4 primary clusters</div>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hospitalized / ICU</div>
            <div className="text-xl sm:text-2xl font-black text-indigo-300 mt-0.5">{totalHospitalized}</div>
            <div className="text-[10px] text-indigo-200/70">27 critical ICU admissions</div>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Peak Vector R0</div>
            <div className="text-xl sm:text-2xl font-black text-teal-300 mt-0.5">{highestR0.toFixed(2)}</div>
            <div className="text-[10px] text-teal-200/70">DEN-2 doubling in 4.8d</div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80 overflow-x-auto">
        <button
          onClick={() => setActiveTab('gis')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'gis'
              ? 'bg-white text-indigo-900 shadow-sm border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <MapPin className="w-3.5 h-3.5 text-rose-600" />
          <span>GIS Spatial Surveillance</span>
          <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-rose-100 text-rose-700 font-extrabold">
            {geoClusters.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('forecast')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'forecast'
              ? 'bg-white text-indigo-900 shadow-sm border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-indigo-600" />
          <span>Hospital Surge Forecasting</span>
          <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-indigo-100 text-indigo-700 font-extrabold">
            14-Day
          </span>
        </button>

        <button
          onClick={() => setActiveTab('policies')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'policies'
              ? 'bg-white text-indigo-900 shadow-sm border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-teal-600" />
          <span>One-Click Policy Triggers</span>
          <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-teal-100 text-teal-700 font-extrabold">
            {policies.filter((p) => p.status === 'Active').length} Active
          </span>
        </button>

        <button
          onClick={() => setActiveTab('trends')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'trends'
              ? 'bg-white text-indigo-900 shadow-sm border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
          <span>Epidemic Curves & R0</span>
        </button>
      </div>

      {/* Tab 1: GIS Spatial Surveillance */}
      {activeTab === 'gis' && (
        <div className="space-y-4">
          {/* Disease Filter Selector */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">Filter:</span>
              <button
                onClick={() => setSelectedDiseaseFilter('all')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                  selectedDiseaseFilter === 'all'
                    ? 'bg-indigo-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                All Vectors ({geoClusters.length})
              </button>
              <button
                onClick={() => setSelectedDiseaseFilter('dengue')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                  selectedDiseaseFilter === 'dengue'
                    ? 'bg-rose-700 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                🦟 Dengue DEN-2
              </button>
              <button
                onClick={() => setSelectedDiseaseFilter('cholera')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                  selectedDiseaseFilter === 'cholera'
                    ? 'bg-blue-700 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                💧 Vibrio Cholerae
              </button>
              <button
                onClick={() => setSelectedDiseaseFilter('pneumonia')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                  selectedDiseaseFilter === 'pneumonia'
                    ? 'bg-purple-700 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                🫁 Viral Pneumonia
              </button>
            </div>

            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Critical Risk
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block ml-2" /> Moderate Risk
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block ml-2" /> Low / Controlled
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Interactive SVG GIS Visualizer (2 Cols) */}
            <div className="lg:col-span-2 bg-slate-950 rounded-3xl p-4 sm:p-5 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-rose-500" />
                    <span>Regional GIS Ward Heatmap & Outbreak Centroids</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Click any epicenter cluster to inspect vector index and local telemetry.
                  </p>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-[10px] font-mono text-emerald-400">
                  GPS: 17.3850° N, 78.4867° E
                </div>
              </div>

              {/* Custom High-Fidelity SVG Map Visualization */}
              <div className="relative w-full h-80 sm:h-96 rounded-2xl bg-slate-900/90 border border-slate-800/80 overflow-hidden flex items-center justify-center">
                {/* SVG Map Grid Background */}
                <svg
                  viewBox="0 0 500 400"
                  className="w-full h-full object-contain cursor-crosshair select-none"
                >
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.75" />
                    </pattern>
                    <radialGradient id="criticalGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity="0.6" />
                      <stop offset="60%" stopColor="#ef4444" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="moderateGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.5" />
                      <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {/* Base grid */}
                  <rect width="100%" height="100%" fill="url(#grid)" />

                  {/* Ward Boundaries & District Polygons */}
                  {/* North-West Zone (Kukatpally / Miyapur) */}
                  <polygon
                    points="60,60 260,50 280,180 180,240 80,180"
                    fill="#1e1b4b"
                    fillOpacity="0.4"
                    stroke="#4338ca"
                    strokeWidth="1.5"
                    strokeDasharray="3 2"
                  />
                  <text x="110" y="85" fill="#818cf8" fontSize="9" fontWeight="bold" opacity="0.8">
                    NW ZONE (KUKATPALLY - MIYAPUR)
                  </text>

                  {/* Central Zone (Secunderabad / Begumpet) */}
                  <polygon
                    points="270,60 450,80 470,220 330,240 280,170"
                    fill="#172554"
                    fillOpacity="0.3"
                    stroke="#1d4ed8"
                    strokeWidth="1.5"
                    strokeDasharray="3 2"
                  />
                  <text x="330" y="95" fill="#60a5fa" fontSize="9" fontWeight="bold" opacity="0.8">
                    NC ZONE (SECUNDERABAD)
                  </text>

                  {/* South-Central Zone (Old City / Charminar / Afzalgunj) */}
                  <polygon
                    points="190,250 340,245 440,360 210,380 150,300"
                    fill="#3b0764"
                    fillOpacity="0.4"
                    stroke="#7e22ce"
                    strokeWidth="1.5"
                    strokeDasharray="3 2"
                  />
                  <text x="230" y="365" fill="#c084fc" fontSize="9" fontWeight="bold" opacity="0.8">
                    SC ZONE (CHARMINAR - AFZALGUNJ)
                  </text>

                  {/* Connecting Transit Vectors */}
                  <line x1="220" y1="150" x2="340" y2="330" stroke="#475569" strokeWidth="1.5" strokeDasharray="4 4" />
                  <line x1="220" y1="150" x2="400" y2="190" stroke="#475569" strokeWidth="1.5" strokeDasharray="4 4" />
                  <line x1="160" y1="230" x2="220" y2="150" stroke="#475569" strokeWidth="1.5" strokeDasharray="4 4" />

                  {/* Hospital Markers */}
                  {facilities.map((f, i) => {
                    const coords = [
                      { x: 210, y: 140, label: 'PHC Kukatpally' },
                      { x: 380, y: 195, label: 'District Hospital' },
                      { x: 335, y: 320, label: 'GMC Hospital' },
                      { x: 155, y: 220, label: 'Area Hospital' },
                    ][i % 4];

                    return (
                      <g key={f.id} transform={`translate(${coords.x}, ${coords.y})`}>
                        <rect x="-8" y="-8" width="16" height="16" rx="4" fill="#0f766e" stroke="#2dd4bf" strokeWidth="1.5" />
                        <text x="0" y="3" fill="#ffffff" fontSize="8" fontWeight="black" textAnchor="middle">
                          H
                        </text>
                        <text x="0" y="16" fill="#94a3b8" fontSize="7" textAnchor="middle">
                          {f.name.split(' ')[0]}
                        </text>
                      </g>
                    );
                  })}

                  {/* Cluster Epicenters and Heat Bubbles */}
                  {filteredClusters.map((cluster) => {
                    const coords = cluster.svgZoneCoordinates || { cx: 250, cy: 200, radius: 35 };
                    const isSelected = cluster.id === selectedClusterId;
                    const isCritical = cluster.riskLevel === 'Critical';
                    const glowId = isCritical ? 'criticalGlow' : 'moderateGlow';
                    const strokeColor = isCritical ? '#ef4444' : '#f59e0b';

                    return (
                      <g
                        key={cluster.id}
                        className="cursor-pointer transition hover:opacity-90"
                        onClick={() => setSelectedClusterId(cluster.id)}
                      >
                        {/* Heat Gradient Halo */}
                        <circle
                          cx={coords.cx}
                          cy={coords.cy}
                          r={coords.radius}
                          fill={`url(#${glowId})`}
                        />

                        {/* Pulsing Outer Ring */}
                        <circle
                          cx={coords.cx}
                          cy={coords.cy}
                          r={coords.radius * 0.75}
                          fill="none"
                          stroke={strokeColor}
                          strokeWidth={isSelected ? '2.5' : '1.5'}
                          strokeDasharray={isSelected ? '0' : '4 2'}
                          opacity={isSelected ? 1 : 0.7}
                        />

                        {/* Core Node */}
                        <circle
                          cx={coords.cx}
                          cy={coords.cy}
                          r={isSelected ? 12 : 9}
                          fill={strokeColor}
                          stroke="#ffffff"
                          strokeWidth="2"
                        />

                        {/* Cluster Label Badge */}
                        <text
                          x={coords.cx}
                          y={coords.cy + 3}
                          fill="#ffffff"
                          fontSize={isSelected ? '9' : '8'}
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {cluster.caseCount}
                        </text>

                        {/* Title Underneath */}
                        <text
                          x={coords.cx}
                          y={coords.cy + coords.radius * 0.85 + 8}
                          fill={isCritical ? '#fca5a5' : '#fde68a'}
                          fontSize="8"
                          fontWeight="bold"
                          textAnchor="middle"
                          className="drop-shadow"
                        >
                          {cluster.wardCode} ({cluster.primaryDisease.split(' ')[0]})
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Map Floating HUD Overlay */}
                <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700/80 text-[10px] text-slate-300 space-y-0.5 pointer-events-none">
                  <div className="font-bold text-white flex items-center gap-1">
                    <Flame className="w-3 h-3 text-rose-500" />
                    <span>Active Vector Epicenters ({filteredClusters.length})</span>
                  </div>
                  <div className="text-slate-400">Layer: Municipal Epidemiological Sentinel Grid</div>
                </div>
              </div>

              {/* Bottom Quick Sentinel Telemetry */}
              <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-slate-300">
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Aedes Larval Index:</span>
                  <span className="font-bold text-rose-400 font-mono">38.5% (High Risk)</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Water Coliform Contam:</span>
                  <span className="font-bold text-blue-400 font-mono">22.4 PPM (Boil Order)</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Wastewater Viral Copies:</span>
                  <span className="font-bold text-purple-400 font-mono">1,200 copies/mL</span>
                </div>
              </div>
            </div>

            {/* Cluster Detail Inspector Card (1 Col) */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Cluster Inspector
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">
                      {activeSelectedCluster.name}
                    </h3>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {activeSelectedCluster.wardCode} • {activeSelectedCluster.district}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold ${
                      activeSelectedCluster.riskLevel === 'Critical'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {activeSelectedCluster.riskLevel} Risk
                  </span>
                </div>

                {/* Primary Disease Tag */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Primary Pathogen:</span>
                    <span className="font-bold text-slate-900">{activeSelectedCluster.primaryDisease}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Transmission Vector:</span>
                    <span className="font-semibold text-slate-800">{activeSelectedCluster.transmissionMode}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Sentinel Hub:</span>
                    <span className="font-bold text-teal-700">{activeSelectedCluster.sentinelFacilityName}</span>
                  </div>
                </div>

                {/* Numbers Grid */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100">
                    <div className="text-[10px] font-bold text-rose-700 uppercase">Confirmed Cases</div>
                    <div className="text-xl font-extrabold text-rose-900 mt-0.5">{activeSelectedCluster.caseCount}</div>
                    <div className="text-[10px] text-rose-600">+{activeSelectedCluster.suspectedCount} suspected</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100">
                    <div className="text-[10px] font-bold text-indigo-700 uppercase">Positivity Rate</div>
                    <div className="text-xl font-extrabold text-indigo-900 mt-0.5">{activeSelectedCluster.positivityRate}%</div>
                    <div className="text-[10px] text-indigo-600">{activeSelectedCluster.activeCasesTrend} trajectory</div>
                  </div>
                </div>

                {/* Environmental Rationale */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Epicenter Telemetry & Root Cause
                  </span>
                  <p className="text-xs text-slate-600 bg-amber-50/70 p-2.5 rounded-xl border border-amber-100">
                    {activeSelectedCluster.epicenterDescription}
                  </p>
                </div>

                {/* Active Interventions in this Cluster */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Deployed Interventions ({activeSelectedCluster.activeInterventions.length})
                  </span>
                  <div className="space-y-1">
                    {activeSelectedCluster.activeInterventions.map((inv, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 text-xs text-slate-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100 font-medium"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{inv}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setActionSuccessMsg(`🦟 Vector-Control Fogging & Larvicide deployed to ${activeSelectedCluster.wardCode} (${activeSelectedCluster.name})`);
                      setTimeout(() => setActionSuccessMsg(null), 3500);
                    }}
                    className="py-2 px-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-black shadow-sm transition active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <Waves className="w-3.5 h-3.5" />
                    <span>Vector Fogging</span>
                  </button>

                  <button
                    onClick={() => {
                      setActionSuccessMsg(`📱 Localized Alert SMS sent to ~45,000 residents in ${activeSelectedCluster.wardCode}`);
                      setTimeout(() => setActionSuccessMsg(null), 3500);
                    }}
                    className="py-2 px-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-[11px] font-black shadow-sm transition active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <Megaphone className="w-3.5 h-3.5" />
                    <span>Broadcast SMS</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    setActiveTab('policies');
                  }}
                  className="w-full py-2.5 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-bold shadow-md transition active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Adjust Cluster Policy Orders</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Hospital Surge Forecasting */}
      {activeTab === 'forecast' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-600" />
                  <span>14-Day District Surge Intake Curve & Bed Buffer</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Mathematical forecasting projecting general admissions, ICU surge, and oxygen consumption.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  GMC & District Hospital Deficit Alert
                </span>
              </div>
            </div>

            {/* Combined 14-Day Surge Timeline Chart */}
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hospitalForecasts[0]?.forecastTimeline || []}>
                  <defs>
                    <linearGradient id="admissionGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="icuGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
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
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                  <Area
                    type="monotone"
                    dataKey="projectedAdmissions"
                    name="Projected Daily Admissions"
                    stroke="#4f46e5"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#admissionGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="projectedIcuDemand"
                    name="Critical ICU Demand"
                    stroke="#ef4444"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#icuGradient)"
                  />
                  <Line
                    type="monotone"
                    dataKey="availableBeds"
                    name="Residual Free Beds Buffer"
                    stroke="#10b981"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Facility Stress Ranking Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hospitalForecasts.map((forecast) => {
              const isCritical = forecast.surgeRiskStatus === 'Critical_Deficit';
              const isWarning = forecast.surgeRiskStatus === 'Warning';

              return (
                <div
                  key={forecast.facilityId}
                  className={`rounded-3xl p-5 border shadow-sm space-y-4 bg-white transition hover:shadow-md ${
                    isCritical
                      ? 'border-rose-300 ring-1 ring-rose-300'
                      : isWarning
                      ? 'border-amber-300'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-slate-900">{forecast.facilityName}</h4>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {forecast.facilityType} • {forecast.district}
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold ${
                        isCritical
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : isWarning
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {isCritical ? 'Critical Deficit' : isWarning ? 'Surge Warning' : 'Capacity Safe'}
                    </span>
                  </div>

                  {/* Bed & ICU Capacity Bars */}
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                        <span>General Bed Occupancy: {forecast.occupiedBeds} / {forecast.totalBeds}</span>
                        <span className="font-bold text-slate-900">{forecast.currentOccupancyRate}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            forecast.currentOccupancyRate > 85
                              ? 'bg-rose-600'
                              : forecast.currentOccupancyRate > 70
                              ? 'bg-amber-500'
                              : 'bg-teal-600'
                          }`}
                          style={{ width: `${Math.min(100, forecast.currentOccupancyRate)}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                        <span>ICU Surge Strain (Available: {forecast.availableIcuBeds} / {forecast.totalIcuBeds})</span>
                        <span className="font-bold text-rose-700">Surge: +{forecast.projectedIcuSurge}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-rose-500"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.round(((forecast.totalIcuBeds - forecast.availableIcuBeds) / forecast.totalIcuBeds) * 100)
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Critical Supplies Telemetry */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center justify-center gap-1">
                        <Wind className="w-3 h-3 text-cyan-600" />
                        <span>O2 Buffer</span>
                      </div>
                      <div className="font-bold text-slate-900 text-sm mt-0.5">
                        {forecast.oxygenBufferDays} days
                      </div>
                      <div className="text-[9px] text-slate-500">{forecast.oxygenCylindersAvailable} cyl.</div>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center justify-center gap-1">
                        <Droplets className="w-3 h-3 text-blue-600" />
                        <span>IV Stock</span>
                      </div>
                      <div className="font-bold text-slate-900 text-sm mt-0.5">
                        {forecast.ivFluidsBufferDays} days
                      </div>
                      <div className="text-[9px] text-slate-500">{forecast.ivFluidsUnitsAvailable} bags</div>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center justify-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>Limit In</span>
                      </div>
                      <div className="font-bold text-rose-700 text-sm mt-0.5">
                        {forecast.daysToCapacityLimit} days
                      </div>
                      <div className="text-[9px] text-slate-500">at current rate</div>
                    </div>
                  </div>

                  {/* Immediate Action Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        setActionSuccessMsg(`Emergency resource transfer order dispatched to ${forecast.facilityName}`);
                        setTimeout(() => setActionSuccessMsg(null), 3000);
                      }}
                      className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition active:scale-95 flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Reallocate Supplies</span>
                    </button>
                    {onNavigate && (
                      <button
                        onClick={() => onNavigate('admin_facilities')}
                        className="px-3 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition active:scale-95"
                      >
                        Adjust Cap
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: One-Click Policy Triggers */}
      {activeTab === 'policies' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-teal-900 to-emerald-950 rounded-3xl p-5 text-white shadow-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300">
                Strategic Public Health Interventions
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-800 text-teal-200">
                Instant Transmission Impact
              </span>
            </div>
            <h3 className="text-lg font-bold">One-Click Epidemiological Policy Directives</h3>
            <p className="text-xs text-teal-100/80 max-w-2xl">
              Executing these strategic interventions instantly triggers public health logistics, recalculates state transmission rates (R0), and cushions hospital ICU intake curves.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {policies.map((policy) => {
              const isActive = policy.status === 'Active' || policy.status === 'Deployed';

              return (
                <div
                  key={policy.id}
                  className={`rounded-3xl p-5 border shadow-sm transition space-y-4 bg-white ${
                    isActive ? 'border-teal-400 ring-2 ring-teal-400/30' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700">
                        {policy.category}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">{policy.title}</h4>
                      <div className="text-xs text-slate-500">
                        Target: <span className="font-semibold text-slate-700">{policy.targetRegion}</span>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold shrink-0 ${
                        isActive
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {policy.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    {policy.description}
                  </p>

                  {/* Impact Statistics */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-teal-50 border border-teal-100">
                      <span className="text-[10px] font-bold text-teal-800 uppercase block">R0 Reduction</span>
                      <span className="font-extrabold text-teal-900 font-mono">
                        {policy.r0ImpactEstimate < 0 ? `${policy.r0ImpactEstimate} pts` : 'Buffer only'}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100">
                      <span className="text-[10px] font-bold text-indigo-800 uppercase block">Hospital Relief</span>
                      <span className="font-extrabold text-indigo-900 font-mono">
                        -{policy.hospitalReliefPct}% peak
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-600 uppercase block">Est. Cost</span>
                      <span className="font-bold text-slate-900 font-mono text-[11px]">{policy.costEstimate}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleDeployPolicy(policy.id)}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-2 ${
                      isActive
                        ? 'bg-slate-800 hover:bg-slate-700 text-white'
                        : 'bg-teal-700 hover:bg-teal-800 text-white'
                    }`}
                  >
                    {isActive ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Active Directive (Click to Stand-Down)</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 text-amber-300" />
                        <span>Authorize & Mobilize Directive</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Epidemic Curves & R0 */}
      {activeTab === 'trends' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {diseaseTrends.map((trend, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {trend.category}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 mt-0.5">{trend.diseaseName}</h4>
                    <p className="text-xs text-slate-500">
                      Dominant Strain: <span className="font-semibold text-slate-800">{trend.dominantStrain}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
                      R₀ {trend.currentR0}
                    </span>
                    <div className="text-[10px] text-slate-500 mt-1">
                      Peak: <span className="font-bold text-slate-700">{trend.peakProjectedDate}</span>
                    </div>
                  </div>
                </div>

                <div className="h-56 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trend.timeSeries}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                      <Line
                        type="monotone"
                        dataKey="caseCount"
                        name="Daily Reported Cases"
                        stroke="#e11d48"
                        strokeWidth={2.5}
                        dot={{ r: 2.5 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="hospitalizations"
                        name="Tertiary Hospitalizations"
                        stroke="#4f46e5"
                        strokeWidth={2}
                        dot={{ r: 2 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="recoveryCount"
                        name="Recoveries"
                        stroke="#10b981"
                        strokeWidth={1.5}
                        strokeDasharray="3 3"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
