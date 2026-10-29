import { vaultFiles as seedVaultFiles } from '../data/mockData';

const STORAGE_KEY = 'cryptova-vault';

const withStableIds = (items) => items.map((file, index) => ({
  ...file,
  id: file.id || `vault-${file.name}-${file.created || 'unknown'}-${index}`
}));

const readVault = () => {
  if (typeof window === 'undefined') return withStableIds(seedVaultFiles);
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seeded = withStableIds(seedVaultFiles);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
  try {
    const files = withStableIds(JSON.parse(raw));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
    return files;
  } catch {
    return withStableIds(seedVaultFiles);
  }
};

const writeVault = (items) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }
};

/** Backend replacement: retrieve only files authorized for the current user from durable storage. */
export async function getVaultFiles() {
  return readVault();
}

export async function addVaultFile(fileRecord) {
  const items = readVault();
  items.unshift({ ...fileRecord, id: fileRecord.id || `vault-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` });
  writeVault(items);
  return fileRecord;
}

export async function deleteVaultFile(fileName) {
  const items = readVault().filter((file) => file.name !== fileName);
  writeVault(items);
  return true;
}

export async function downloadVaultFile(fileName) {
  const items = readVault();
  return items.find((item) => item.name === fileName) || null;
}
