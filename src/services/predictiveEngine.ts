import {
  OutbreakAlert,
  GeoCluster,
  HospitalCapacityForecast,
  PublicAdvisory,
  DiseaseTrend,
  InterventionPolicy,
  SyndromicMatchResult,
  OutbreakSeverity,
} from '../types/epidemiology';
import { Facility, Patient } from '../types';

// Baseline Outbreak Datasets for State Health Surveillance
export const DEFAULT_OUTBREAK_ALERTS: OutbreakAlert[] = [
  {
    id: 'outbreak-dengue-01',
    diseaseName: 'Dengue Hemorrhagic Fever (DEN-2)',
    icdCode: 'A91',
    pathogenType: 'viral',
    severity: 'Critical',
    status: 'Active',
    primaryTransmission: 'Vector-Borne',
    affectedRegions: ['Kukatpally Ward 4', 'Miyapur Sector 2', 'Balanagar Industrial Zone'],
    confirmedCases: 142,
    suspectedCases: 310,
    hospitalizedCases: 68,
    criticalCases: 14,
    deaths: 2,
    growthRatePct: 28.4,
    r0Estimated: 2.15,
    doublingTimeDays: 4.8,
    firstDetectedAt: '2026-08-12T08:00:00Z',
    lastUpdatedAt: new Date().toISOString(),
    syndromicProfile: {
      keySymptoms: [
        'high fever',
        'retro-orbital pain',
        'severe headache',
        'myalgia',
        'arthralgia',
        'petechiae',
        'thrombocytopenia',
        'leukopenia',
        'abdominal pain',
        'persistent vomiting',
      ],
      cardinalSigns: ['Tourniquet Test Positive', 'Platelet Count < 50,000/μL', 'Hematocrit Rise > 20%'],
      incubationPeriodDays: '4 to 7 days',
      targetAgeGroups: ['All Age Groups', 'Children 5-14 at heightened shock risk'],
    },
    recommendedClinicalActions: {
      statutoryNotificationRequired: true,
      recommendedLabs: ['NS1 Antigen Test (Day 1-4)', 'IgM/IgG Elisa (Day 5+)', 'Serial Complete Blood Count (CBC) with Hematocrit every 8h'],
      confirmatoryTests: ['RT-PCR for Dengue Virus Serotyping'],
      firstLineInterventions: [
        'Isotonic crystalloid fluid resuscitation (Normal Saline / Ringer Lactate 5-7 ml/kg/h)',
        'Strict Paracetamol only (Avoid NSAIDs/Aspirin due to hemorrhage risk)',
        'Maintain hematocrit baseline monitoring',
      ],
      isolationRequirements: 'Mosquito net protection in hospital wards to prevent nosocomial transmission vectors.',
      warningSigns: ['Fluid accumulation (pleural/ascites)', 'Mucosal bleeding', 'Lethargy/restlessness', 'Liver enlargement > 2cm'],
    },
    advisoryPublicSummary: 'Rapid surge in vector breeding detected following unseasonal heavy monsoon stagnation. Immediate domestic water inspection & vector elimination recommended.',
    vectorIndex: {
      metricName: 'Aedes Breteau Index',
      currentValue: 34.2,
      thresholdValue: 20.0,
      status: 'Alarming',
    },
  },
  {
    id: 'outbreak-cholera-02',
    diseaseName: 'Vibrio Cholerae (O1 El Tor)',
    icdCode: 'A00.0',
    pathogenType: 'bacterial',
    severity: 'High',
    status: 'Active',
    primaryTransmission: 'Waterborne',
    affectedRegions: ['Old City Charminar Ward 8', 'Afzalgunj Riverbank Strip'],
    confirmedCases: 64,
    suspectedCases: 148,
    hospitalizedCases: 42,
    criticalCases: 8,
    deaths: 1,
    growthRatePct: 18.2,
    r0Estimated: 1.85,
    doublingTimeDays: 5.4,
    firstDetectedAt: '2026-08-18T10:00:00Z',
    lastUpdatedAt: new Date().toISOString(),
    syndromicProfile: {
      keySymptoms: [
        'profuse rice-water diarrhea',
        'painless watery stools',
        'severe dehydration',
        'sunken eyes',
        'loss of skin turgor',
        'muscle cramps',
        'hypotension',
        'anuria',
      ],
      cardinalSigns: ['Skin pinch retraction > 2s', 'Severe base deficit / metabolic acidosis'],
      incubationPeriodDays: '12 hours to 5 days',
      targetAgeGroups: ['Infants, Elderly, and Malnourished individuals'],
    },
    recommendedClinicalActions: {
      statutoryNotificationRequired: true,
      recommendedLabs: ['Stool Hanging Drop Examination', 'Serum Electrolytes (Na+, K+, HCO3-)', 'Renal Function (Urea/Creatinine)'],
      confirmatoryTests: ['TCBS Agar Stool Culture & Agglutination'],
      firstLineInterventions: [
        'Immediate Oral Rehydration Salts (ORS) solution for mild/moderate cases',
        'Rapid IV Ringer Lactate fluid infusion for severe dehydration (100ml/kg over 3-4h)',
        'Oral Doxycycline or Azithromycin single dose once vomiting controlled',
      ],
      isolationRequirements: 'Enteric barrier precautions and dedicated chlorine-based decontamination sanitation.',
      warningSigns: ['Unresponsive / stupor', 'Hypovolemic shock', 'Radial pulse impalpable'],
    },
    advisoryPublicSummary: 'Municipal pipeline seepage contamination identified in Old City distribution lines. Boil all drinking water for minimum 3 minutes.',
    vectorIndex: {
      metricName: 'Water Fecal Coliform PPM',
      currentValue: 18.4,
      thresholdValue: 0.0,
      status: 'Alarming',
    },
  },
  {
    id: 'outbreak-covid-03',
    diseaseName: 'Viral Pneumonia / SARS-CoV-2 Sub-variant',
    icdCode: 'U07.1',
    pathogenType: 'viral',
    severity: 'Moderate',
    status: 'Monitoring',
    primaryTransmission: 'Airborne/Droplet',
    affectedRegions: ['Secunderabad Transit Hub', 'Begumpet Commercial Corridor'],
    confirmedCases: 89,
    suspectedCases: 195,
    hospitalizedCases: 28,
    criticalCases: 5,
    deaths: 0,
    growthRatePct: 9.5,
    r0Estimated: 1.35,
    doublingTimeDays: 9.2,
    firstDetectedAt: '2026-08-05T14:00:00Z',
    lastUpdatedAt: new Date().toISOString(),
    syndromicProfile: {
      keySymptoms: [
        'fever',
        'dry cough',
        'dyspnea',
        'sore throat',
        'loss of smell/taste',
        'fatigue',
        'hypoxia',
        'chest tightness',
      ],
      cardinalSigns: ['SpO2 < 94% on room air', 'Bilateral lung crepitations'],
      incubationPeriodDays: '3 to 6 days',
      targetAgeGroups: ['Elderly > 60 yrs', 'Immunocompromised', 'Diabetic patients'],
    },
    recommendedClinicalActions: {
      statutoryNotificationRequired: true,
      recommendedLabs: ['Rapid Antigen Test', 'High-Resolution Chest CT', 'D-Dimer & CRP inflammatory markers'],
      confirmatoryTests: ['TaqMan RT-PCR Target Gene Assay'],
      firstLineInterventions: [
        'Supplemental high-flow oxygen titration to maintain SpO2 > 94%',
        'Inhaled bronchodilators and systemic corticosteroids for hypoxic presentation',
        'Early Paxlovid / antiviral therapy for high-risk comorbidities',
      ],
      isolationRequirements: 'Negative-pressure isolation or dedicated airborne respiratory triage wards.',
      warningSigns: ['Respiratory rate > 28/min', 'SpO2 falling rapidly below 92%'],
    },
    advisoryPublicSummary: 'Mild airborne transmission cluster in crowded transit transit nodes. Mask mandates recommended in public transit.',
    vectorIndex: {
      metricName: 'Transit Aerosol Wastewater Viral Load',
      currentValue: 1200,
      thresholdValue: 500,
      status: 'Elevated',
    },
  },
];

export const DEFAULT_GEO_CLUSTERS: GeoCluster[] = [
  {
    id: 'cluster-kukatpally-01',
    clusterCode: 'HYD-NW-04',
    name: 'Kukatpally Vector Epicenter',
    regionName: 'Kukatpally Metro Zone',
    district: 'Hyderabad North-West',
    wardCode: 'Ward 4',
    centerCoordinates: { lat: 17.4948, lng: 78.3996 },
    svgZoneCoordinates: { cx: 220, cy: 150, radius: 48 },
    radiusKm: 3.8,
    primaryDisease: 'Dengue Hemorrhagic Fever (DEN-2)',
    riskLevel: 'Critical',
    caseCount: 84,
    suspectedCount: 162,
    positivityRate: 24.6,
    activeCasesTrend: 'Surging',
    transmissionMode: 'Vector-Borne',
    vectorMetrics: {
      larvalIndexPct: 38.5,
      reproductiveRate: 2.3,
    },
    epicenterDescription: 'Residential constructions & stagnant drainage canals along IDL Road.',
    sentinelFacilityId: 'fac-phc-01',
    sentinelFacilityName: 'PHC Kukatpally',
    lastUpdated: new Date().toISOString(),
    activeInterventions: ['Thermal Fogging Cycle 2', 'Drone Larvicide Spraying', 'Door-to-Door Fever Survey'],
  },
  {
    id: 'cluster-charminar-02',
    clusterCode: 'HYD-SC-08',
    name: 'Old City Water Supply Corridor',
    regionName: 'Charminar & Afzalgunj',
    district: 'Hyderabad South-Central',
    wardCode: 'Ward 8',
    centerCoordinates: { lat: 17.3616, lng: 78.4747 },
    svgZoneCoordinates: { cx: 340, cy: 330, radius: 42 },
    radiusKm: 2.6,
    primaryDisease: 'Vibrio Cholerae (O1 El Tor)',
    riskLevel: 'Critical',
    caseCount: 52,
    suspectedCount: 110,
    positivityRate: 19.8,
    activeCasesTrend: 'Surging',
    transmissionMode: 'Waterborne',
    vectorMetrics: {
      waterContamPpm: 22.4,
      reproductiveRate: 1.9,
    },
    epicenterDescription: 'Aging municipal water main adjacent to high-density commercial markets.',
    sentinelFacilityId: 'fac-gmc-03',
    sentinelFacilityName: 'Government Medical College Hospital',
    lastUpdated: new Date().toISOString(),
    activeInterventions: ['Chlorine Booster Dosing', 'Mobile Tanker Clean Water Distribution', 'Rapid ORS Camps'],
  },
  {
    id: 'cluster-miyapur-03',
    clusterCode: 'HYD-NW-02',
    name: 'Miyapur Peri-Urban Buffer',
    regionName: 'Miyapur & Hafeezpet',
    district: 'Hyderabad North-West',
    wardCode: 'Ward 2',
    centerCoordinates: { lat: 17.4483, lng: 78.3915 },
    svgZoneCoordinates: { cx: 160, cy: 230, radius: 36 },
    radiusKm: 4.1,
    primaryDisease: 'Dengue Hemorrhagic Fever (DEN-2)',
    riskLevel: 'Moderate',
    caseCount: 38,
    suspectedCount: 75,
    positivityRate: 12.4,
    activeCasesTrend: 'Stable',
    transmissionMode: 'Vector-Borne',
    vectorMetrics: {
      larvalIndexPct: 18.2,
      reproductiveRate: 1.4,
    },
    epicenterDescription: 'Peri-urban housing societies with open stormwater drains.',
    sentinelFacilityId: 'fac-ah-04',
    sentinelFacilityName: 'Area Hospital Miyapur',
    lastUpdated: new Date().toISOString(),
    activeInterventions: ['Community Vector Cleanup', 'Mosquito Net Distribution'],
  },
  {
    id: 'cluster-secunderabad-04',
    clusterCode: 'HYD-NC-12',
    name: 'Secunderabad Rail Hub Corridor',
    regionName: 'Secunderabad & Begumpet',
    district: 'Hyderabad North-Central',
    wardCode: 'Ward 12',
    centerCoordinates: { lat: 17.4399, lng: 78.4983 },
    svgZoneCoordinates: { cx: 400, cy: 190, radius: 32 },
    radiusKm: 3.2,
    primaryDisease: 'Viral Pneumonia / SARS-CoV-2 Sub-variant',
    riskLevel: 'Moderate',
    caseCount: 45,
    suspectedCount: 92,
    positivityRate: 8.9,
    activeCasesTrend: 'Monitoring',
    transmissionMode: 'Airborne/Droplet',
    vectorMetrics: {
      airQualityIndex: 165,
      reproductiveRate: 1.3,
    },
    epicenterDescription: 'High-density transit concourse & intercity bus terminus.',
    sentinelFacilityId: 'fac-dh-02',
    sentinelFacilityName: 'District Hospital King Koti',
    lastUpdated: new Date().toISOString(),
    activeInterventions: ['Thermal Screening Kiosks', 'Transit Sanitization'],
  },
];

export const DEFAULT_PUBLIC_ADVISORIES: PublicAdvisory[] = [
  {
    id: 'adv-001',
    title: 'RED ALERT: Severe Dengue Surge in Kukatpally & Miyapur Wards',
    region: 'Kukatpally & Miyapur (North-West Zone)',
    targetDisease: 'Dengue Hemorrhagic Fever',
    severity: 'Urgent',
    effectiveDate: '2026-08-28T00:00:00Z',
    summary: 'The Municipal Health Directorate has issued a critical health advisory due to a 28% weekly surge in confirmed Dengue cases in Ward 4 & Sector 2.',
    preventiveMeasures: [
      'Empty and scrub all water coolers, flower vases, and open drums every 3 days ("Dry Day" protocol).',
      'Apply DEET or Picaridin mosquito repellents on exposed skin throughout daylight and dusk hours.',
      'Wear long-sleeved light-colored clothing and sleep under mosquito nets.',
      'Allow municipal fogging and inspection squads access to domestic balconies and gardens.',
      'Do NOT take Brufen, Aspirin, or painkiller combinations without doctor consultation.',
    ],
    symptomChecklist: [
      'Sudden high fever (103°F - 105°F)',
      'Intense pain behind the eyes',
      'Severe bone and joint aching ("break-bone fever")',
      'Red skin rash or pinhead bleeding spots',
      'Persistent vomiting or severe abdominal cramping',
    ],
    affectedWards: ['Ward 4 (Kukatpally)', 'Ward 2 (Miyapur)', 'Ward 9 (Balanagar)'],
    emergencyContacts: [
      { name: 'State Fever Triage Helpline', phone: '104', service: 'Toll-Free Health Advice', availableHours: '24/7' },
      { name: 'PHC Kukatpally Rapid Response Desk', phone: '040-23050001', service: 'Fever Clinic Registration', availableHours: '8 AM - 8 PM' },
      { name: 'Emergency Ambulance Central', phone: '108', service: 'Critical Patient Transport', availableHours: '24/7' },
    ],
    safeZones: ['Gachibowli Green Zone', 'Madhapur Sector A', 'Jubilee Hills Ward 10'],
    highRiskActivitiesToAvoid: [
      'Outdoor morning/dusk sports near stagnant water bodies',
      'Storing uncovered rainwater containers',
      'Ignoring continuous fever lasting > 48 hours',
    ],
    issuedBy: 'Directorate of Public Health & Preventive Medicine',
    status: 'Active',
    broadcastChannels: ['SMS Gateway', 'Municipal PWA', 'Public Radio', 'Health Post Posters'],
  },
  {
    id: 'adv-002',
    title: 'WATER SAFETY NOTICE: Boil Water Order for Charminar & Afzalgunj',
    region: 'Charminar Ward 8 & Afzalgunj',
    targetDisease: 'Vibrio Cholerae / Acute Gastroenteritis',
    severity: 'Severe',
    effectiveDate: '2026-08-25T00:00:00Z',
    summary: 'Boil all tap water for a minimum of 3 rolling minutes before consumption due to pipeline leakage near Afzalgunj bridge.',
    preventiveMeasures: [
      'Boil all drinking, cooking, and teeth-brushing water for at least 3 minutes.',
      'Use water purification chlorine tablets (1 tablet per 20 liters) distributed at local PHCs.',
      'Wash hands thoroughly with soap for 20 seconds before preparing food or eating.',
      'Avoid raw cut fruits, roadside juices, and ice made from unverified water sources.',
      'Keep oral rehydration salt (ORS) packets ready in every household.',
    ],
    symptomChecklist: [
      'Frequent loose watery stools',
      'Severe dry mouth and extreme thirst',
      'Rapid fatigue and muscle cramps in legs',
      'Sunken eyes or skin that does not bounce back when pinched',
    ],
    affectedWards: ['Ward 8 (Charminar)', 'Afzalgunj High Road', 'Begum Bazaar Corridor'],
    emergencyContacts: [
      { name: 'GMC Hospital Waterborne Emergency Desk', phone: '040-24600003', service: 'IV Rehydration Triage', availableHours: '24/7' },
      { name: 'Water Board Leakage Control Unit', phone: '155313', service: 'Pipeline Emergency Repair', availableHours: '24/7' },
    ],
    safeZones: ['Secunderabad Cantonment', 'Banjara Hills Sector 3'],
    highRiskActivitiesToAvoid: ['Consuming unpasteurized drinks or street food', 'Drinking untreated tap water'],
    issuedBy: 'State Health Command & Municipal Water Board',
    status: 'Active',
    broadcastChannels: ['Municipal Audio Vans', 'PWA Portal', 'Community Mosques & Temples'],
  },
];

export const DEFAULT_INTERVENTION_POLICIES: InterventionPolicy[] = [
  {
    id: 'pol-01',
    title: 'Mobilize 12 Ultra-Low-Volume (ULV) Thermal Fogging Squads',
    description: 'Deploys mechanized vector abatement teams across Kukatpally Ward 4 and Miyapur Sector 2 targeting Aedes mosquito resting sites.',
    targetDisease: 'Dengue Hemorrhagic Fever',
    targetRegion: 'Kukatpally & Miyapur',
    category: 'Vector Control',
    status: 'Active',
    r0ImpactEstimate: -0.55,
    hospitalReliefPct: 24,
    costEstimate: '₹ 4,80,000',
    deployedAt: '2026-08-29T06:00:00Z',
    deployedBy: 'Chief Health Officer',
    leadTimeHours: 6,
  },
  {
    id: 'pol-02',
    title: 'Emergency Super-Chlorination of Afzalgunj Municipal Trunk Line',
    description: 'Boosts residual chlorine levels to 2.5 PPM and isolates suspect cross-connected pipelines near Afzalgunj bridge.',
    targetDisease: 'Vibrio Cholerae',
    targetRegion: 'Old City Charminar',
    category: 'Sanitation',
    status: 'Active',
    r0ImpactEstimate: -0.85,
    hospitalReliefPct: 38,
    costEstimate: '₹ 2,20,000',
    deployedAt: '2026-08-28T14:30:00Z',
    deployedBy: 'Municipal Water Commissioner',
    leadTimeHours: 4,
  },
  {
    id: 'pol-03',
    title: 'Reallocate 40 High-Flow Oxygen Concentrators to District Hospital',
    description: 'Dispatches strategic buffer oxygen generators from state reserve to handle projected respiratory and severe shock admissions.',
    targetDisease: 'Multidisease Surge Buffer',
    targetRegion: 'District Hospital & GMC',
    category: 'Logistics & Supplies',
    status: 'Pending',
    r0ImpactEstimate: 0.0,
    hospitalReliefPct: 30,
    costEstimate: '₹ 12,00,000',
    leadTimeHours: 12,
  },
  {
    id: 'pol-04',
    title: 'Deploy Rapid Fever & NS1 Antigen Point-of-Care Kiosks at PHCs',
    description: 'Sets up 15-minute diagnostic triage stations in peripheral primary health centres to filter non-severe cases from tertiary hospitals.',
    targetDisease: 'Dengue & Febrile Illness',
    targetRegion: 'All Peripheral PHCs',
    category: 'Clinical Triage',
    status: 'Pending',
    r0ImpactEstimate: -0.30,
    hospitalReliefPct: 42,
    costEstimate: '₹ 6,50,000',
    leadTimeHours: 8,
  },
];

// Predictive Resource Modeling Logic
export function calculateHospitalForecasts(
  facilities: Facility[],
  activeOutbreaks: OutbreakAlert[],
  activePolicies: InterventionPolicy[] = []
): HospitalCapacityForecast[] {
  const policyReliefMultiplier = activePolicies
    .filter((p) => p.status === 'Active' || p.status === 'Deployed')
    .reduce((acc, p) => acc * (1 - p.hospitalReliefPct / 100), 1.0);

  const highestR0 = Math.max(...activeOutbreaks.map((o) => o.r0Estimated), 1.2);
  const totalActiveCases = activeOutbreaks.reduce((acc, o) => acc + o.confirmedCases + o.suspectedCases, 0);

  return facilities.map((facility) => {
    // Base capacity statistics
    const totalBeds = facility.capacity;
    const currentOccupied = facility.current_load;
    const availableBeds = Math.max(0, totalBeds - currentOccupied);
    const occupancyRate = totalBeds > 0 ? Math.round((currentOccupied / totalBeds) * 100) : 50;

    // Derived specialty quotas based on facility tier
    const isTertiary = facility.type === 'Medical College Hospital' || facility.type === 'District Hospital';
    const icuRatio = isTertiary ? 0.22 : 0.08;
    const totalIcuBeds = Math.max(2, Math.round(totalBeds * icuRatio));
    const occupiedIcuBeds = Math.min(totalIcuBeds, Math.round(currentOccupied * icuRatio * 1.15));
    const availableIcuBeds = Math.max(0, totalIcuBeds - occupiedIcuBeds);

    // Oxygen & consumable stocks
    const oxygenCylindersAvailable = isTertiary ? 140 : 25;
    const oxygenDailyConsumption = isTertiary ? 18 : 3.5;
    const oxygenBufferDays = oxygenDailyConsumption > 0 ? Math.round((oxygenCylindersAvailable / oxygenDailyConsumption) * 10) / 10 : 30;

    const ivFluidsUnitsAvailable = isTertiary ? 2400 : 350;
    const ivFluidsDailyUsage = isTertiary ? 220 : 35;
    const ivFluidsBufferDays = ivFluidsDailyUsage > 0 ? Math.round((ivFluidsUnitsAvailable / ivFluidsDailyUsage) * 10) / 10 : 30;

    const ventilatorsAvailable = isTertiary ? 18 : 2;

    // Surge projection: 14-day projection using transmission velocity
    const facilityShareOfOutbreak = isTertiary ? 0.45 : 0.15;
    const baseProjectedSurge = Math.round(totalActiveCases * facilityShareOfOutbreak * (highestR0 * 0.75) * policyReliefMultiplier);
    const projected14DayIntake = Math.max(12, baseProjectedSurge);
    const projectedIcuSurge = Math.round(projected14DayIntake * (isTertiary ? 0.25 : 0.1));

    // Days to capacity limit
    const netDailyIntake = (projected14DayIntake / 14);
    let daysToCapacityLimit = 14;
    if (netDailyIntake > 0 && availableBeds < projected14DayIntake) {
      daysToCapacityLimit = Math.max(1, Math.round(availableBeds / netDailyIntake));
    }

    // Surge risk categorization
    let surgeRiskStatus: 'Safe' | 'Warning' | 'Critical_Deficit' = 'Safe';
    if (daysToCapacityLimit <= 3 || availableIcuBeds < projectedIcuSurge || oxygenBufferDays < 4) {
      surgeRiskStatus = 'Critical_Deficit';
    } else if (daysToCapacityLimit <= 7 || availableIcuBeds <= projectedIcuSurge * 1.5 || oxygenBufferDays < 7) {
      surgeRiskStatus = 'Warning';
    }

    // Projected shortages
    const projectedShortages = {
      generalBeds: Math.max(0, projected14DayIntake - availableBeds),
      icuBeds: Math.max(0, projectedIcuSurge - availableIcuBeds),
      oxygenCylinders: Math.max(0, Math.round((projected14DayIntake * 0.8) - oxygenCylindersAvailable)),
      ivFluids: Math.max(0, Math.round((projected14DayIntake * 12) - ivFluidsUnitsAvailable)),
      isolationWards: Math.max(0, Math.round(projected14DayIntake * 0.35) - Math.round(totalBeds * 0.15)),
    };

    // 14-day chronological curve
    const forecastTimeline = Array.from({ length: 14 }, (_, idx) => {
      const dayOffset = idx + 1;
      const date = new Date(Date.now() + dayOffset * 86400000).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
      // Growth sigmoid curve
      const growthFactor = 1 / (1 + Math.exp(-0.35 * (dayOffset - 7)));
      const dayIntake = Math.round(projected14DayIntake * (growthFactor / 7) * (0.85 + Math.sin(dayOffset) * 0.15));
      const dayIcu = Math.round(dayIntake * (isTertiary ? 0.28 : 0.08));
      const oxygenDemand = Math.round(dayIntake * 24 + dayIcu * 60);
      const simulatedOccupied = Math.min(totalBeds, currentOccupied + Math.round(dayOffset * (projected14DayIntake / 14) * 0.6));
      const remBeds = Math.max(0, totalBeds - simulatedOccupied);
      const occPct = Math.min(100, Math.round((simulatedOccupied / totalBeds) * 100));

      return {
        dayOffset,
        date,
        projectedAdmissions: Math.max(1, dayIntake),
        projectedIcuDemand: Math.max(0, dayIcu),
        oxygenDemandLitres: oxygenDemand,
        availableBeds: remBeds,
        occupancyPct: occPct,
      };
    });

    return {
      facilityId: facility.id,
      facilityName: facility.name,
      facilityType: facility.type,
      district: facility.address.includes('Kukatpally') || facility.address.includes('Miyapur')
        ? 'Hyderabad North-West'
        : 'Hyderabad Central',
      coordinates: {
        lat: facility.latitude,
        lng: facility.longitude,
      },
      currentOccupancyRate: occupancyRate,
      totalBeds,
      occupiedBeds: currentOccupied,
      availableBeds,
      totalIcuBeds,
      occupiedIcuBeds,
      availableIcuBeds,
      oxygenCylindersAvailable,
      oxygenDailyConsumptionLitres: oxygenDailyConsumption,
      oxygenBufferDays,
      ivFluidsUnitsAvailable,
      ivFluidsBufferDays,
      ventilatorsAvailable,
      projected14DayIntake,
      projectedIcuSurge,
      daysToCapacityLimit,
      surgeRiskStatus,
      projectedShortages,
      forecastTimeline,
    };
  });
}

// Syndromic Match Engine for Clinical Decision Support
export function evaluateSyndromicMatch(
  symptomsText: string,
  diagnosisText: string,
  patientAddress: string = '',
  vitals?: { temperature?: string | number; bloodPressure?: string; hr?: string | number; spo2?: string | number },
  activeOutbreaks: OutbreakAlert[] = DEFAULT_OUTBREAK_ALERTS,
  activeClusters: GeoCluster[] = DEFAULT_GEO_CLUSTERS
): SyndromicMatchResult {
  const normalizedInput = `${symptomsText} ${diagnosisText} ${patientAddress}`.toLowerCase();

  let highestScore = 0;
  let bestOutbreak: OutbreakAlert | undefined;
  let bestCluster: GeoCluster | undefined;
  let matchedSymptoms: string[] = [];
  let unmatchedSymptoms: string[] = [];

  for (const outbreak of activeOutbreaks) {
    const keySymptoms = outbreak.syndromicProfile.keySymptoms;
    const currentMatched: string[] = [];
    const currentUnmatched: string[] = [];

    for (const symptom of keySymptoms) {
      if (normalizedInput.includes(symptom.toLowerCase()) || normalizedInput.includes(symptom.split(' ')[0])) {
        currentMatched.push(symptom);
      } else {
        currentUnmatched.push(symptom);
      }
    }

    // Check location match
    const locationMatched = outbreak.affectedRegions.some((region) =>
      normalizedInput.includes(region.toLowerCase().split(' ')[0])
    );

    // Calculate score
    const symptomScore = keySymptoms.length > 0 ? (currentMatched.length / keySymptoms.length) * 70 : 0;
    const locationScore = locationMatched ? 30 : 0;
    const totalScore = Math.min(100, Math.round(symptomScore + locationScore));

    if (totalScore > highestScore) {
      highestScore = totalScore;
      bestOutbreak = outbreak;
      matchedSymptoms = currentMatched;
      unmatchedSymptoms = currentUnmatched;

      // Find matching cluster
      bestCluster = activeClusters.find((c) =>
        c.primaryDisease.toLowerCase().includes(outbreak.diseaseName.toLowerCase().split(' ')[0]) ||
        c.regionName.toLowerCase().includes(patientAddress.toLowerCase().split(' ')[0])
      );
    }
  }

  // Check vitals triggers (e.g. fever or hypoxia)
  const isFebrile = vitals?.temperature
    ? (typeof vitals.temperature === 'number' ? vitals.temperature >= 38.0 : parseFloat(vitals.temperature) >= 100.4)
    : false;

  const isHypoxic = vitals?.spo2
    ? (typeof vitals.spo2 === 'number' ? vitals.spo2 < 94 : parseFloat(vitals.spo2) < 94)
    : false;

  if (highestScore >= 35 || (isFebrile && matchedSymptoms.length >= 2)) {
    const severity: OutbreakSeverity =
      highestScore >= 70 ? 'Critical' : highestScore >= 50 ? 'High' : 'Moderate';

    const riskRationale = `Patient symptoms (${matchedSymptoms.join(
      ', '
    )}) match clinical profile for ${bestOutbreak?.diseaseName || 'Active Cluster'} in ${
      bestCluster?.name || 'Regional Zone'
    } with ${highestScore}% syndromic correlation.`;

    return {
      hasMatch: true,
      alertSeverity: severity,
      outbreakAlert: bestOutbreak,
      matchedCluster: bestCluster,
      matchScore: highestScore,
      matchedSymptoms,
      unmatchedSymptoms,
      riskRationale,
      recommendedLabOrders: bestOutbreak?.recommendedClinicalActions.recommendedLabs || [
        'Complete Blood Count (CBC)',
        'Point-of-Care Rapid Antigen',
      ],
      clinicalGuidanceNotes:
        bestOutbreak?.recommendedClinicalActions.firstLineInterventions.join(' • ') ||
        'Initiate early supportive therapy and maintain fluid balance.',
      isolationProtocol:
        bestOutbreak?.recommendedClinicalActions.isolationRequirements ||
        'Standard barrier precautions recommended.',
      statutoryReportRecommended: bestOutbreak?.recommendedClinicalActions.statutoryNotificationRequired ?? true,
    };
  }

  return {
    hasMatch: false,
    matchScore: highestScore,
    matchedSymptoms: [],
    unmatchedSymptoms: [],
    riskRationale: 'No active epidemiological cluster match detected.',
    recommendedLabOrders: [],
    clinicalGuidanceNotes: '',
    isolationProtocol: 'Standard clinic protocol',
    statutoryReportRecommended: false,
  };
}

// Spatial Cluster Extraction from Patient Registry
export function extractGeoClustersFromPatients(
  patients: Patient[],
  activeOutbreaks: OutbreakAlert[] = DEFAULT_OUTBREAK_ALERTS
): GeoCluster[] {
  // Combine pre-configured clusters with dynamic patient density aggregation
  const clusters: GeoCluster[] = [...DEFAULT_GEO_CLUSTERS];

  // Group patients by address keywords
  const locationMap: Record<string, number> = {};
  patients.forEach((p) => {
    const loc = p.address.toLowerCase();
    if (loc.includes('kukatpally')) locationMap['kukatpally'] = (locationMap['kukatpally'] || 0) + 1;
    else if (loc.includes('charminar') || loc.includes('afzalgunj')) locationMap['charminar'] = (locationMap['charminar'] || 0) + 1;
    else if (loc.includes('miyapur')) locationMap['miyapur'] = (locationMap['miyapur'] || 0) + 1;
    else if (loc.includes('secunderabad')) locationMap['secunderabad'] = (locationMap['secunderabad'] || 0) + 1;
  });

  return clusters.map((c) => {
    const key = c.name.toLowerCase();
    let bonusCases = 0;
    if (key.includes('kukatpally')) bonusCases = (locationMap['kukatpally'] || 0) * 12;
    else if (key.includes('charminar') || key.includes('water')) bonusCases = (locationMap['charminar'] || 0) * 8;
    else if (key.includes('miyapur')) bonusCases = (locationMap['miyapur'] || 0) * 6;

    return {
      ...c,
      caseCount: c.caseCount + bonusCases,
      suspectedCount: c.suspectedCount + bonusCases * 2,
    };
  });
}

// Disease Epidemiological Trend Curves (14-day history + 14-day projection)
export function generateDiseaseTrends(): DiseaseTrend[] {
  const dates = [
    'Aug 16', 'Aug 18', 'Aug 20', 'Aug 22', 'Aug 24', 'Aug 26', 'Aug 28',
    'Aug 30', 'Sep 01', 'Sep 03', 'Sep 05', 'Sep 07', 'Sep 09', 'Sep 11',
  ];

  return [
    {
      diseaseName: 'Dengue Hemorrhagic Fever',
      category: 'Vector-Borne',
      currentR0: 2.15,
      peakProjectedDate: 'Sep 06, 2026',
      peakProjectedDailyCases: 48,
      confidenceInterval: { lower: 38, upper: 62 },
      seasonalBaselineComparisonPct: 145, // 145% of 5-year average
      dominantStrain: 'DEN-2 (Cosmopolitan Genotype)',
      timeSeries: [
        { date: 'Aug 16', caseCount: 12, hospitalizations: 4, mortalityCount: 0, recoveryCount: 8, r0: 1.6 },
        { date: 'Aug 18', caseCount: 18, hospitalizations: 6, mortalityCount: 0, recoveryCount: 11, r0: 1.75 },
        { date: 'Aug 20', caseCount: 26, hospitalizations: 9, mortalityCount: 0, recoveryCount: 15, r0: 1.9 },
        { date: 'Aug 22', caseCount: 34, hospitalizations: 14, mortalityCount: 1, recoveryCount: 22, r0: 2.05 },
        { date: 'Aug 24', caseCount: 42, hospitalizations: 19, mortalityCount: 1, recoveryCount: 28, r0: 2.15 },
        { date: 'Aug 26', caseCount: 56, hospitalizations: 24, mortalityCount: 1, recoveryCount: 36, r0: 2.2 },
        { date: 'Aug 28', caseCount: 68, hospitalizations: 31, mortalityCount: 2, recoveryCount: 45, r0: 2.15 },
        { date: 'Aug 30', caseCount: 78, hospitalizations: 38, mortalityCount: 2, recoveryCount: 54, r0: 2.05 },
        { date: 'Sep 01', caseCount: 86, hospitalizations: 44, mortalityCount: 2, recoveryCount: 62, r0: 1.95 },
        { date: 'Sep 03', caseCount: 92, hospitalizations: 46, mortalityCount: 3, recoveryCount: 71, r0: 1.8 },
        { date: 'Sep 05', caseCount: 96, hospitalizations: 48, mortalityCount: 3, recoveryCount: 80, r0: 1.65 },
        { date: 'Sep 07', caseCount: 90, hospitalizations: 42, mortalityCount: 3, recoveryCount: 88, r0: 1.45 },
        { date: 'Sep 09', caseCount: 78, hospitalizations: 35, mortalityCount: 3, recoveryCount: 92, r0: 1.25 },
        { date: 'Sep 11', caseCount: 62, hospitalizations: 26, mortalityCount: 3, recoveryCount: 96, r0: 1.05 },
      ],
    },
    {
      diseaseName: 'Vibrio Cholerae',
      category: 'Waterborne',
      currentR0: 1.85,
      peakProjectedDate: 'Aug 31, 2026',
      peakProjectedDailyCases: 28,
      confidenceInterval: { lower: 20, upper: 36 },
      seasonalBaselineComparisonPct: 210,
      dominantStrain: 'O1 El Tor Ogawa',
      timeSeries: [
        { date: 'Aug 16', caseCount: 4, hospitalizations: 3, mortalityCount: 0, recoveryCount: 2, r0: 1.4 },
        { date: 'Aug 18', caseCount: 9, hospitalizations: 7, mortalityCount: 0, recoveryCount: 5, r0: 1.65 },
        { date: 'Aug 20', caseCount: 16, hospitalizations: 12, mortalityCount: 0, recoveryCount: 9, r0: 1.8 },
        { date: 'Aug 22', caseCount: 24, hospitalizations: 18, mortalityCount: 1, recoveryCount: 15, r0: 1.9 },
        { date: 'Aug 24', caseCount: 32, hospitalizations: 22, mortalityCount: 1, recoveryCount: 21, r0: 1.85 },
        { date: 'Aug 26', caseCount: 38, hospitalizations: 25, mortalityCount: 1, recoveryCount: 28, r0: 1.75 },
        { date: 'Aug 28', caseCount: 42, hospitalizations: 26, mortalityCount: 1, recoveryCount: 34, r0: 1.6 },
        { date: 'Aug 30', caseCount: 40, hospitalizations: 24, mortalityCount: 1, recoveryCount: 38, r0: 1.4 },
        { date: 'Sep 01', caseCount: 34, hospitalizations: 20, mortalityCount: 1, recoveryCount: 42, r0: 1.2 },
        { date: 'Sep 03', caseCount: 26, hospitalizations: 14, mortalityCount: 1, recoveryCount: 45, r0: 1.05 },
        { date: 'Sep 05', caseCount: 18, hospitalizations: 9, mortalityCount: 1, recoveryCount: 47, r0: 0.9 },
        { date: 'Sep 07', caseCount: 12, hospitalizations: 6, mortalityCount: 1, recoveryCount: 48, r0: 0.8 },
        { date: 'Sep 09', caseCount: 8, hospitalizations: 4, mortalityCount: 1, recoveryCount: 49, r0: 0.7 },
        { date: 'Sep 11', caseCount: 5, hospitalizations: 2, mortalityCount: 1, recoveryCount: 50, r0: 0.6 },
      ],
    },
  ];
}
