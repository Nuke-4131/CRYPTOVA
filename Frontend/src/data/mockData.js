export const navItems = [
  { label: 'Overview', path: '/dashboard', icon: 'LayoutGrid' },
  { label: 'Encrypt', path: '/encrypt', icon: 'Shield' },
  { label: 'Decrypt & Verify', path: '/decrypt', icon: 'CheckCheck' },
  { label: 'Vault', path: '/vault', icon: 'FolderLock' },
  { label: 'Activity', path: '/activity', icon: 'Activity' },
  { label: 'Settings', path: '/settings', icon: 'Settings' }
];

export const overviewMetrics = [
  { label: 'Protected Files', value: '24' },
  { label: 'Encrypted Storage', value: '1.8 GB' },
  { label: 'Integrity Checks', value: '42' },
  { label: 'Security Events', value: '3' }
];

export const postureItems = [
  { label: 'Encryption', value: 'AES-256-GCM', status: 'Operational' },
  { label: 'Integrity Verification', value: 'Enabled', status: 'Operational' },
  { label: 'Secure Vault', value: 'Protected', status: 'Operational' },
  { label: 'Activity Logging', value: 'Enabled', status: 'Operational' }
];

export const recentActivity = [
  { time: '16:42', event: 'File Encrypted', file: 'report.pdf', status: 'Successful' },
  { time: '16:37', event: 'Integrity Verified', file: 'contract.docx', status: 'Verified' },
  { time: '16:31', event: 'Integrity Check Failed', file: 'archive.crypt', status: 'Failed' }
];

export const vaultFiles = [
  { name: 'report.pdf', type: 'PDF', size: '4.2 MB', encryption: 'AES-256-GCM', integrity: 'Verified', created: '18 Sep 2026' },
  { name: 'contract.docx', type: 'DOCX', size: '1.8 MB', encryption: 'AES-256-GCM', integrity: 'Verified', created: '17 Sep 2026' },
  { name: 'archive.crypt', type: 'CRYPT', size: '8.4 MB', encryption: 'AES-256-GCM', integrity: 'Failed', created: '17 Sep 2026' }
];

export const activityLogs = [
  { timestamp: '18 Sep 2026 · 16:42', event: 'File encrypted', resource: 'report.pdf', status: 'Successful', details: 'Protected using authenticated encryption' },
  { timestamp: '18 Sep 2026 · 16:37', event: 'Integrity verified', resource: 'contract.docx', status: 'Verified', details: 'Package authenticity confirmed' },
  { timestamp: '18 Sep 2026 · 16:31', event: 'Integrity verification failed', resource: 'archive.crypt', status: 'Failed', details: 'Authentication invalid, request blocked' },
  { timestamp: '18 Sep 2026 · 16:20', event: 'File decrypted', resource: 'summary.xlsx', status: 'Successful', details: 'Decryption completed after integrity check' },
  { timestamp: '18 Sep 2026 · 15:58', event: 'Decryption blocked', resource: 'secure-transfer.crypt', status: 'Warning', details: 'Package failed authentication' },
  { timestamp: '18 Sep 2026 · 15:22', event: 'Vault file added', resource: 'backup.tar', status: 'Successful', details: 'Protected package stored in secure vault' }
];

export const securitySteps = [
  { id: 1, label: 'Package Received', description: 'Protected package delivered to CRYPTOVA', state: 'Verified' },
  { id: 2, label: 'Format Validation', description: 'Inspect file envelope and metadata', state: 'Verified' },
  { id: 3, label: 'Authentication', description: 'Verify protected package signature', state: 'Verified' },
  { id: 4, label: 'Integrity Verification', description: 'Confirm data integrity before decryption', state: 'Integrity Verification', fail: true },
  { id: 5, label: 'Ready to Decrypt', description: 'Proceed with secure file recovery', state: 'Blocked' }
];

export const settingsSections = [
  { title: 'Encryption', detail: 'AES-256-GCM' },
  { title: 'Key Protection', detail: 'Password-derived key' },
  { title: 'Integrity', detail: 'Integrity verification' },
  { title: 'Session Security', detail: 'Auto-lock enabled · 15 minutes' },
  { title: 'Activity Logging', detail: 'Security activity logging enabled' }
];

export const landingFeatures = [
  {
    title: 'Encrypt',
    text: 'Protect sensitive files using authenticated encryption.',
    icon: 'ShieldCheck'
  },
  {
    title: 'Verify',
    text: 'Detect modification or corruption before protected data is decrypted.',
    icon: 'CheckCircle2'
  },
  {
    title: 'Vault',
    text: 'Organise encrypted files in a controlled secure storage environment.',
    icon: 'FolderLock'
  }
];
