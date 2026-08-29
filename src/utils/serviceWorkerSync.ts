/**
 * Service Worker Offline Patient Referral Caching Utility
 * Synchronizes and persists key patient triage data, digital pass QR payloads,
 * and hospital destination details into the Service Worker Cache Storage.
 */

export interface OfflinePatientDataPayload {
  lastUpdated: string;
  patients: any[];
  referrals: any[];
  facilities: any[];
  statusHistory: any[];
  activePatientId?: string;
}

export const SW_STATIC_CACHE = 'smart-referral-static-v2';
export const SW_DATA_CACHE = 'smart-referral-patient-data-v2';
export const OFFLINE_API_ENDPOINT = '/api/patient-referrals';

/**
 * Saves current patient referral records and active passes to Service Worker Cache
 */
export async function savePatientDataToSWCache(data: {
  patients: any[];
  referrals: any[];
  facilities: any[];
  statusHistory: any[];
  activePatientId?: string;
}): Promise<boolean> {
  const payload: OfflinePatientDataPayload = {
    lastUpdated: new Date().toISOString(),
    patients: data.patients,
    referrals: data.referrals,
    facilities: data.facilities,
    statusHistory: data.statusHistory,
    activePatientId: data.activePatientId,
  };

  let savedSuccessfully = false;

  // 1. Direct CacheStorage API persistence
  if ('caches' in window) {
    try {
      const cache = await caches.open(SW_DATA_CACHE);
      const jsonResponse = new Response(JSON.stringify(payload), {
        headers: {
          'Content-Type': 'application/json',
          'X-Smart-Referral-Offline': 'true',
          'X-Cache-Time': payload.lastUpdated,
        },
      });
      await cache.put(OFFLINE_API_ENDPOINT, jsonResponse);
      
      // Also cache individual patient active passes for fine-grained offline lookup
      if (data.activePatientId) {
        const patientPassResponse = new Response(JSON.stringify(payload), {
          headers: { 'Content-Type': 'application/json' },
        });
        await cache.put(`/api/patient/${data.activePatientId}/referral`, patientPassResponse);
      }
      
      savedSuccessfully = true;
    } catch (e) {
      console.warn('Direct CacheStorage sync error:', e);
    }
  }

  // 2. PostMessage to active Service Worker Controller
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    try {
      navigator.serviceWorker.controller.postMessage({
        type: 'CACHE_PATIENT_REFERRAL_DATA',
        payload,
      });
      savedSuccessfully = true;
    } catch (e) {
      console.warn('Service Worker postMessage sync error:', e);
    }
  }

  // 3. Fallback localStorage backup timestamp
  try {
    localStorage.setItem('smart_referral_sw_last_cache', payload.lastUpdated);
  } catch (e) {
    // Ignore localStorage errors
  }

  return savedSuccessfully;
}

/**
 * Retrieves cached patient referral data from Service Worker Cache Storage
 */
export async function loadPatientDataFromSWCache(): Promise<OfflinePatientDataPayload | null> {
  if (!('caches' in window)) return null;

  try {
    const cache = await caches.open(SW_DATA_CACHE);
    const cachedResponse = await cache.match(OFFLINE_API_ENDPOINT);

    if (cachedResponse) {
      const data: OfflinePatientDataPayload = await cachedResponse.json();
      return data;
    }
  } catch (e) {
    console.warn('Error reading from Service Worker Cache:', e);
  }

  return null;
}

/**
 * Returns the last timestamp when data was cached in the Service Worker
 */
export function getLastSWCacheTime(): string | null {
  try {
    return localStorage.getItem('smart_referral_sw_last_cache');
  } catch {
    return null;
  }
}
