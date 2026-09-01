export type PathogenType = 'viral' | 'bacterial' | 'parasitic' | 'fungal' | 'unknown';

export type OutbreakSeverity = 'Low' | 'Moderate' | 'High' | 'Critical';

export type OutbreakStatus = 'Active' | 'Contained' | 'Monitoring' | 'Resolved';

export type TransmissionVector =
  | 'Vector-Borne'
  | 'Waterborne'
  | 'Airborne/Droplet'
  | 'Foodborne'
  | 'Direct Contact'
  | 'Zoonotic';

export type ClusterTrend = 'Surging' | 'Stable' | 'Declining' | 'Under Control' | 'Monitoring';

export type SurgeRiskStatus = 'Safe' | 'Warning' | 'Critical_Deficit';

export type AdvisoryUrgency = 'Low' | 'Moderate' | 'Severe' | 'Urgent';

export interface OutbreakAlert {
  id: string;
  diseaseName: string;
  icdCode?: string;
  pathogenType: PathogenType;
  severity: OutbreakSeverity;
  status: OutbreakStatus;
  primaryTransmission: TransmissionVector;
  affectedRegions: string[];
  confirmedCases: number;
  suspectedCases: number;
  hospitalizedCases: number;
  criticalCases: number;
  deaths: number;
  growthRatePct: number; // percentage weekly change e.g. +34.5%
  r0Estimated: number; // Basic reproduction number e.g. 2.4
  doublingTimeDays: number; // e.g. 4.2 days
  firstDetectedAt: string;
  lastUpdatedAt: string;
  syndromicProfile: {
    keySymptoms: string[];
    cardinalSigns: string[];
    incubationPeriodDays: string;
    targetAgeGroups: string[];
  };
  recommendedClinicalActions: {
    statutoryNotificationRequired: boolean;
    recommendedLabs: string[];
    confirmatoryTests: string[];
    firstLineInterventions: string[];
    isolationRequirements: string;
    warningSigns: string[];
  };
  advisoryPublicSummary: string;
  vectorIndex?: {
    metricName: string;
    currentValue: number;
    thresholdValue: number;
    status: 'Normal' | 'Elevated' | 'Alarming';
  };
}

export interface GeoCluster {
  id: string;
  clusterCode: string;
  name: string;
  regionName: string;
  district: string;
  wardCode: string;
  centerCoordinates: {
    lat: number;
    lng: number;
  };
  svgZoneCoordinates?: {
    cx: number;
    cy: number;
    radius: number;
  };
  radiusKm: number;
  primaryDisease: string;
  riskLevel: OutbreakSeverity;
  caseCount: number;
  suspectedCount: number;
  positivityRate: number; // e.g. 18.5%
  activeCasesTrend: ClusterTrend;
  transmissionMode: TransmissionVector;
  vectorMetrics?: {
    larvalIndexPct?: number;
    waterContamPpm?: number;
    airQualityIndex?: number;
    reproductiveRate?: number;
  };
  epicenterDescription: string;
  sentinelFacilityId?: string;
  sentinelFacilityName?: string;
  lastUpdated: string;
  activeInterventions: string[];
}

export interface HospitalCapacityForecast {
  facilityId: string;
  facilityName: string;
  facilityType: string;
  district: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  currentOccupancyRate: number; // 0 - 100%
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  totalIcuBeds: number;
  occupiedIcuBeds: number;
  availableIcuBeds: number;
  oxygenCylindersAvailable: number;
  oxygenDailyConsumptionLitres: number;
  oxygenBufferDays: number;
  ivFluidsUnitsAvailable: number;
  ivFluidsBufferDays: number;
  ventilatorsAvailable: number;
  projected14DayIntake: number;
  projectedIcuSurge: number;
  daysToCapacityLimit: number;
  surgeRiskStatus: SurgeRiskStatus;
  projectedShortages: {
    generalBeds: number;
    icuBeds: number;
    oxygenCylinders: number;
    ivFluids: number;
    isolationWards: number;
  };
  forecastTimeline: Array<{
    dayOffset: number;
    date: string;
    projectedAdmissions: number;
    projectedIcuDemand: number;
    oxygenDemandLitres: number;
    availableBeds: number;
    occupancyPct: number;
  }>;
}

export interface PublicAdvisory {
  id: string;
  title: string;
  region: string;
  targetDisease: string;
  severity: AdvisoryUrgency;
  effectiveDate: string;
  expiryDate?: string;
  summary: string;
  preventiveMeasures: string[];
  symptomChecklist: string[];
  affectedWards: string[];
  emergencyContacts: Array<{
    name: string;
    phone: string;
    service: string;
    availableHours: string;
  }>;
  safeZones: string[];
  highRiskActivitiesToAvoid: string[];
  issuedBy: string;
  status: 'Active' | 'Updated' | 'Archived';
  broadcastChannels: string[];
}

export interface DiseaseTrend {
  diseaseName: string;
  category: string;
  timeSeries: Array<{
    date: string;
    caseCount: number;
    hospitalizations: number;
    mortalityCount: number;
    recoveryCount: number;
    r0: number;
  }>;
  peakProjectedDate: string;
  peakProjectedDailyCases: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  currentR0: number;
  seasonalBaselineComparisonPct: number;
  dominantStrain?: string;
}

export interface InterventionPolicy {
  id: string;
  title: string;
  description: string;
  targetDisease: string;
  targetRegion: string;
  category: 'Vector Control' | 'Sanitation' | 'Logistics & Supplies' | 'Clinical Triage' | 'Public Advisory';
  status: 'Pending' | 'Active' | 'Deployed' | 'Completed';
  r0ImpactEstimate: number; // e.g. -0.45 reduction in R0
  hospitalReliefPct: number; // e.g. 18% reduction in peak admissions
  costEstimate: string;
  deployedAt?: string;
  deployedBy?: string;
  leadTimeHours: number;
}

export interface SyndromicMatchResult {
  hasMatch: boolean;
  alertSeverity?: OutbreakSeverity;
  outbreakAlert?: OutbreakAlert;
  matchedCluster?: GeoCluster;
  matchScore: number; // 0 - 100
  matchedSymptoms: string[];
  unmatchedSymptoms: string[];
  riskRationale: string;
  recommendedLabOrders: string[];
  clinicalGuidanceNotes: string;
  isolationProtocol: string;
  statutoryReportRecommended: boolean;
}
