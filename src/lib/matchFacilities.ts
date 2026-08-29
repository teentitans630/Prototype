import { Facility, FacilityMatchScore, FacilityService, ReferralPriority } from '../types';

// Calculate Haversine distance in kilometers
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Keyword inference for clinical specialty
export function inferClinicalSpecialty(
  diagnosis: string = '',
  chiefComplaint: string = '',
  symptoms: string = ''
): string {
  const combined = `${diagnosis} ${chiefComplaint} ${symptoms}`.toLowerCase();

  if (
    combined.includes('cardio') ||
    combined.includes('chest') ||
    combined.includes('heart') ||
    combined.includes('stemi') ||
    combined.includes('nstemi') ||
    combined.includes('angina') ||
    combined.includes('coronary') ||
    combined.includes('myocardial') ||
    combined.includes('palpitation')
  ) {
    return 'Cardiology';
  }

  if (
    combined.includes('fracture') ||
    combined.includes('bone') ||
    combined.includes('ortho') ||
    combined.includes('joint') ||
    combined.includes('knee') ||
    combined.includes('arthritis') ||
    combined.includes('dislocation') ||
    combined.includes('spine')
  ) {
    return 'Orthopedics';
  }

  if (
    combined.includes('stroke') ||
    combined.includes('neuro') ||
    combined.includes('headache') ||
    combined.includes('paralysis') ||
    combined.includes('facial droop') ||
    combined.includes('seizure') ||
    combined.includes('slurred speech') ||
    combined.includes('fast positive') ||
    combined.includes('weakness')
  ) {
    return 'Neurology';
  }

  if (
    combined.includes('trauma') ||
    combined.includes('accident') ||
    combined.includes('unconscious') ||
    combined.includes('hemorrhage') ||
    combined.includes('shock') ||
    combined.includes('poison') ||
    combined.includes('burn')
  ) {
    return 'Emergency';
  }

  if (
    combined.includes('appendix') ||
    combined.includes('appendicitis') ||
    combined.includes('surgery') ||
    combined.includes('hernia') ||
    combined.includes('abdomen') ||
    combined.includes('gallbladder') ||
    combined.includes('peritonitis')
  ) {
    return 'General Surgery';
  }

  if (
    combined.includes('kidney') ||
    combined.includes('renal') ||
    combined.includes('dialysis') ||
    combined.includes('nephro') ||
    combined.includes('creatinine') ||
    combined.includes('anuria')
  ) {
    return 'Nephrology';
  }

  if (
    combined.includes('child') ||
    combined.includes('pediatric') ||
    combined.includes('infant') ||
    combined.includes('baby') ||
    combined.includes('neonate')
  ) {
    return 'Pediatrics';
  }

  if (
    combined.includes('pregnant') ||
    combined.includes('labor') ||
    combined.includes('delivery') ||
    combined.includes('obstetric') ||
    combined.includes('gynae')
  ) {
    return 'Obstetrics & Gynaecology';
  }

  return 'General Medicine';
}

export interface MatchOptions {
  sourceFacility: Facility;
  allFacilities: Facility[];
  allFacilityServices: FacilityService[];
  diagnosis?: string;
  chiefComplaint?: string;
  symptoms?: string;
  priority: ReferralPriority;
  excludedFacilityIds?: string[];
}

export function matchFacilities(options: MatchOptions): FacilityMatchScore[] {
  const {
    sourceFacility,
    allFacilities,
    allFacilityServices,
    diagnosis = '',
    chiefComplaint = '',
    symptoms = '',
    priority = 'routine',
    excludedFacilityIds = [],
  } = options;

  const inferredSpecialty = inferClinicalSpecialty(diagnosis, chiefComplaint, symptoms);

  // Filter out source facility and any excluded facilities
  const candidates = allFacilities.filter(
    (f) =>
      f.id !== sourceFacility.id &&
      !excludedFacilityIds.includes(f.id)
  );

  const scoredList: FacilityMatchScore[] = candidates.map((facility) => {
    const services = allFacilityServices
      .filter((s) => s.facility_id === facility.id && s.available)
      .map((s) => s.service_name);

    const reasons: string[] = [];

    // 1. Specialty Match (40%)
    let specialtyScore = 0;
    const hasInferred = services.some(
      (s) => s.toLowerCase() === inferredSpecialty.toLowerCase()
    );
    const hasGenMed = services.some(
      (s) => s.toLowerCase() === 'general medicine'
    );
    const hasEmergencyService = services.some(
      (s) => s.toLowerCase() === 'emergency'
    );

    if (hasInferred) {
      specialtyScore = 40;
      reasons.push(`${inferredSpecialty} department confirmed available`);
    } else if (inferredSpecialty === 'General Surgery' && (services.includes('General Surgery') || services.includes('General Medicine'))) {
      specialtyScore = 32;
      reasons.push(`Surgical & Medical triage capability present`);
    } else if (hasGenMed) {
      specialtyScore = 24;
      reasons.push(`General Medicine available for secondary assessment`);
    } else {
      specialtyScore = 12;
    }

    // 2. Distance (20%)
    const distanceKm = calculateDistanceKm(
      sourceFacility.latitude,
      sourceFacility.longitude,
      facility.latitude,
      facility.longitude
    );

    let distanceScore = 0;
    if (distanceKm <= 5) {
      distanceScore = 20;
      reasons.push(`Closest distance (${distanceKm} km)`);
    } else if (distanceKm <= 10) {
      distanceScore = 16;
      reasons.push(`Nearby facility (${distanceKm} km)`);
    } else if (distanceKm <= 18) {
      distanceScore = 12;
      reasons.push(`Moderate transit range (${distanceKm} km)`);
    } else if (distanceKm <= 30) {
      distanceScore = 8;
    } else {
      distanceScore = 4;
    }

    // 3. Capacity (20%)
    const loadPercentage = Math.round(
      (facility.current_load / (facility.capacity || 1)) * 100
    );

    let capacityScore = 0;
    let loadCategory: 'Low' | 'Moderate' | 'High' = 'Moderate';
    let estimatedWaitMinutes = 45;

    if (loadPercentage < 40) {
      capacityScore = 20;
      loadCategory = 'Low';
      estimatedWaitMinutes = 15;
      reasons.push(`Low bed/OPD load (${loadPercentage}% capacity occupied)`);
    } else if (loadPercentage <= 75) {
      capacityScore = 14;
      loadCategory = 'Moderate';
      estimatedWaitMinutes = 45;
      reasons.push(`Moderate load (${loadPercentage}% occupied)`);
    } else {
      capacityScore = 6;
      loadCategory = 'High';
      estimatedWaitMinutes = 90;
    }

    // 4. Urgency Compatibility (20%)
    let urgencyScore = 0;
    if (priority === 'emergency') {
      if (hasEmergencyService && loadPercentage <= 85) {
        urgencyScore = 20;
        reasons.push('24/7 Red-Zone Emergency resuscitation active');
      } else if (hasEmergencyService) {
        urgencyScore = 15;
        reasons.push('Emergency services available');
      } else if (distanceScore >= 16) {
        urgencyScore = 10;
      } else {
        urgencyScore = 6;
      }
    } else if (priority === 'urgent') {
      if (hasInferred && loadPercentage < 75) {
        urgencyScore = 20;
        reasons.push('Urgent priority handling with active specialist duty');
      } else if (hasEmergencyService || hasInferred) {
        urgencyScore = 16;
        reasons.push('Equipped for urgent secondary care');
      } else {
        urgencyScore = 10;
      }
    } else {
      // Routine
      if (hasInferred && loadPercentage < 80) {
        urgencyScore = 20;
        reasons.push('Routine specialist consultation available');
      } else {
        urgencyScore = 15;
      }
    }

    const totalScore = Math.min(
      100,
      Math.max(10, Math.round(specialtyScore + distanceScore + capacityScore + urgencyScore))
    );

    return {
      facility,
      services,
      totalScore,
      specialtyScore,
      distanceScore,
      capacityScore,
      urgencyScore,
      distanceKm,
      loadPercentage,
      loadCategory,
      estimatedWaitMinutes,
      reasons: reasons.slice(0, 4),
      inferredSpecialty,
    };
  });

  // Sort descending by total match score
  return scoredList.sort((a, b) => b.totalScore - a.totalScore);
}
