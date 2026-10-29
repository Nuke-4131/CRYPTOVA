import { activityLogs as seedLogs } from '../data/mockData';

const STORAGE_KEY = 'cryptova-activity';

const readLogs = () => {
  if (typeof window === 'undefined') return [...seedLogs];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [...seedLogs];
  try {
    return JSON.parse(raw);
  } catch {
    return [...seedLogs];
  }
};

const writeLogs = (items) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }
};

/** Backend replacement: query an append-only, server-authoritative audit log with pagination. */
export async function getActivityLogs() {
  return readLogs();
}

export async function addActivityLog(log) {
  const items = readLogs();
  const next = [{ ...log, timestamp: new Date().toISOString() }, ...items];
  writeLogs(next);
  return next[0];
}
