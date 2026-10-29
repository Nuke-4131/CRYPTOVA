import { overviewMetrics, postureItems, recentActivity, vaultFiles, activityLogs, landingFeatures, securitySteps } from '../data/mockData';

export const getLandingFeatures = () => landingFeatures;
export const getOverviewMetrics = () => overviewMetrics;
export const getSecurityPosture = () => postureItems;
export const getRecentActivity = () => recentActivity;
export const getVaultFiles = () => vaultFiles;
export const getActivityLogs = () => activityLogs;
export const getSecuritySteps = () => securitySteps;

export const encryptFile = async (file) => ({
  ok: true,
  fileName: file?.name || 'report.pdf',
  status: 'Encrypted',
  message: 'File protected successfully.'
});

export const verifyPackage = async (packageName) => ({
  ok: false,
  packageName: packageName || 'archive.crypt',
  status: 'Integrity Verification Failed',
  message: 'Decryption has been blocked because the protected package could not be authenticated.'
});

export const getVaultSummary = () => ({
  protectedFiles: 24,
  encryptedStorage: '1.8 GB',
  integrityChecks: 42,
  securityEvents: 3
});
