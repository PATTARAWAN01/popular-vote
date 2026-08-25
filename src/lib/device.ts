/**
 * Device Fingerprint & IP Utility for Voting Protection
 */

const STORAGE_KEY_DEVICE_TOKEN = 'popular_vote_device_token';
const STORAGE_KEY_DEVICE_VOTED = 'popular_vote_device_voted_categories';

/**
 * Get or generate a persistent UUID for this physical browser/device
 */
export function getOrCreateDeviceToken(): string {
  if (typeof window === 'undefined') return 'server_side_device';

  let token = localStorage.getItem(STORAGE_KEY_DEVICE_TOKEN);
  if (!token) {
    token = 'dev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
    localStorage.setItem(STORAGE_KEY_DEVICE_TOKEN, token);
  }
  return token;
}

/**
 * Check locally if this device has already submitted a vote for category
 */
export function hasDeviceVotedForCategory(category: 'junior' | 'senior'): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const votedCategories: Record<string, boolean> = JSON.parse(
      localStorage.getItem(STORAGE_KEY_DEVICE_VOTED) || '{}'
    );
    return !!votedCategories[category];
  } catch {
    return false;
  }
}

/**
 * Record that this device submitted a vote for category
 */
export function markDeviceVotedForCategory(category: 'junior' | 'senior'): void {
  if (typeof window === 'undefined') return;

  try {
    const votedCategories: Record<string, boolean> = JSON.parse(
      localStorage.getItem(STORAGE_KEY_DEVICE_VOTED) || '{}'
    );
    votedCategories[category] = true;
    localStorage.setItem(STORAGE_KEY_DEVICE_VOTED, JSON.stringify(votedCategories));
  } catch (e) {
    console.error('Error saving device vote state:', e);
  }
}

/**
 * Fetch voter public IP address via lightweight ipify service with fallback
 */
export async function getVoterPublicIp(): Promise<string> {
  try {
    const res = await fetch('https://api.ipify.org?format=json', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data && data.ip) return data.ip;
    }
  } catch (e) {
    console.warn('Could not fetch public IP via ipify, attempting fallback:', e);
  }

  try {
    const res = await fetch('https://ipapi.co/json/', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data && data.ip) return data.ip;
    }
  } catch (e) {
    console.warn('Fallback IP fetch failed:', e);
  }

  return 'Local / Private IP';
}
