/* ============================================================
   CRYPTOVA — Activity Log Page
   ============================================================ */

// Shared activity log (persists across page navigations in session)
if (!window._activityLog) {
  const base = new Date();
  window._activityLog = [
    { time: new Date(base - 120000),   event: 'File Encrypted',     target: 'quarterly-report-q3.pdf',    actor: 'admin',  status: 'success', algo: 'AES-256-GCM',       detail: 'CVP-A1B2C3D4' },
    { time: new Date(base - 480000),   event: 'Integrity Verified',  target: 'contract-nda-v3.docx',        actor: 'admin',  status: 'success', algo: 'HMAC-SHA-256',      detail: 'CVP-M3N4O5P6' },
    { time: new Date(base - 900000),   event: 'Decrypt Blocked',     target: 'archive-backup-2026.zip',     actor: 'admin',  status: 'danger',  algo: 'AES-256-GCM',       detail: 'Integrity mismatch' },
    { time: new Date(base - 1800000),  event: 'File Encrypted',      target: 'employee-records.xlsx',       actor: 'admin',  status: 'success', algo: 'AES-256-GCM',       detail: 'CVP-E5F6G7H8' },
    { time: new Date(base - 3600000),  event: 'File Decrypted',      target: 'design-assets-v4.zip',        actor: 'admin',  status: 'success', algo: 'AES-256-GCM',       detail: 'CVP-I9J0K1L2' },
    { time: new Date(base - 7200000),  event: 'Integrity Verified',  target: 'audit-log-2026-q3.csv',       actor: 'admin',  status: 'success', algo: 'HMAC-SHA-256',      detail: 'CVP-Q7R8S9T0' },
    { time: new Date(base - 10800000), event: 'Decrypt Blocked',     target: 'unknown-package.bin',         actor: 'admin',  status: 'danger',  algo: 'AES-256-GCM',       detail: 'Auth failure' },
    { time: new Date(base - 14400000), event: 'File Encrypted',      target: 'financial-projections-q4.xlsx',actor:'admin', status: 'success', algo: 'AES-256-GCM',       detail: 'CVP-Y5Z6A7B8' },
    { time: new Date(base - 18000000), event: 'File Decrypted',      target: 'product-roadmap-2027.pptx',   actor: 'admin',  status: 'success', algo: 'AES-256-CBC',       detail: 'CVP-C9D0E1F2' },
    { time: new Date(base - 21600000), event: 'File Encrypted',      target: 'customer-db-export.csv',      actor: 'admin',  status: 'success', algo: 'ChaCha20-Poly1305', detail: 'CVP-G3H4I5J6' },
    { time: new Date(base - 28800000), event: 'Key Rotation',        target: 'Master Key',                  actor: 'system', status: 'warning', algo: '—',                 detail: 'Rotation overdue' },
    { time: new Date(base - 43200000), event: 'File Encrypted',      target: 'design-assets-v4.zip',        actor: 'admin',  status: 'success', algo: 'AES-256-GCM',       detail: 'CVP-I9J0K1L2' },
    { time: new Date(base - 86400000), event: 'Vault Export',        target: 'vault-export-2026-09-14.zip', actor: 'admin',  status: 'success', algo: '—',                 detail: '10 packages' },
    { time: new Date(base - 172800000),event: 'Settings Updated',    target: 'Security Defaults',           actor: 'admin',  status: 'info',    algo: '—',                 detail: 'KDF rounds updated' },
  ];
}

function logActivity(event, target, status, algo) {
  window._activityLog.unshift({
    time:   new Date(),
    event,
    target,
    actor:  'admin',
    status,
    algo:   algo || '—',
    detail: '—',
  });
}

function renderActivity(container) {
  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Activity Log</h1>
      <p class="page-desc">Complete audit trail of all security operations.</p>
    </div>

    <!-- Toolbar -->
    <div class="activity-toolbar">
      <div class="flex gap-2 items-center">
        <div class="search-input-wrap">
          <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" class="search-input" placeholder="Search events…" id="act-search" oninput="filterActivity()">
        </div>
        <select class="form-control" id="act-event-filter" onchange="filterActivity()" style="height:32px;width:auto;font-size:var(--text-sm);">
          <option value="">All Event Types</option>
          <option value="File Encrypted">File Encrypted</option>
          <option value="File Decrypted">File Decrypted</option>
          <option value="Integrity Verified">Integrity Verified</option>
          <option value="Decrypt Blocked">Decrypt Blocked</option>
          <option value="Key Rotation">Key Rotation</option>
        </select>
        <select class="form-control" id="act-status-filter" onchange="filterActivity()" style="height:32px;width:auto;font-size:var(--text-sm);">
          <option value="">All Status</option>
          <option value="success">Success</option>
          <option value="danger">Failed</option>
          <option value="warning">Warning</option>
          <option value="info">Info</option>
        </select>
      </div>
      <div class="flex gap-2">
        <button class="btn btn-secondary btn-sm" onclick="showToast('Audit log exported as CSV.', 'success')">
          <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export CSV
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="card">
      <div style="overflow-x:auto;">
        <table class="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Event Type</th>
              <th>Target</th>
              <th>Actor</th>
              <th>Algorithm</th>
              <th>Status</th>
              <th>Detail</th>
            </tr>
          </thead>
          <tbody id="act-tbody">
            <!-- populated -->
          </tbody>
        </table>
      </div>
      <div class="card-footer">
        <span class="text-sm text-secondary" id="act-count"></span>
      </div>
    </div>
  `;

  filterActivity();
}

function filterActivity() {
  const search  = (document.getElementById('act-search')?.value || '').toLowerCase();
  const evtFilter = document.getElementById('act-event-filter')?.value || '';
  const statFilter = document.getElementById('act-status-filter')?.value || '';

  const log = window._activityLog || [];
  const filtered = log.filter(r => {
    const matchSearch = !search || r.event.toLowerCase().includes(search) || r.target.toLowerCase().includes(search);
    const matchEvt    = !evtFilter   || r.event === evtFilter;
    const matchStat   = !statFilter  || r.status === statFilter;
    return matchSearch && matchEvt && matchStat;
  });

  const tbody = document.getElementById('act-tbody');
  const count = document.getElementById('act-count');
  if (!tbody) return;

  if (count) count.textContent = `${filtered.length} of ${log.length} events`;

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state" style="padding:var(--space-10) 0;"><svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg><h3>No events found</h3><p>Adjust your filters</p></div></td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(r => {
    const statusLabels = { success: 'Success', danger: 'Failed', warning: 'Warning', info: 'Info' };
    return `
      <tr>
        <td class="col-mono">${formatDate(r.time)} ${formatTime(r.time)}</td>
        <td style="font-weight:500;">${r.event}</td>
        <td class="col-mono" style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${r.target}">${r.target}</td>
        <td>${r.actor}</td>
        <td class="col-mono">${r.algo}</td>
        <td><span class="badge badge-${r.status}">${statusLabels[r.status] || r.status}</span></td>
        <td class="col-mono" style="color:var(--color-text-tertiary);">${r.detail}</td>
      </tr>
    `;
  }).join('');
}
