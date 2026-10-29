/* ============================================================
   CRYPTOVA — Overview / Dashboard Page
   ============================================================ */

function renderOverview(container) {
  const now = new Date();

  const recentActivity = [
    { time: new Date(now - 120000), event: 'File Encrypted',     target: 'quarterly-report.pdf',    status: 'success', algo: 'AES-256-GCM' },
    { time: new Date(now - 480000), event: 'Integrity Verified', target: 'contract-v3.docx',         status: 'success', algo: 'HMAC-SHA-256' },
    { time: new Date(now - 900000), event: 'Decrypt Blocked',    target: 'archive-backup.zip',       status: 'danger',  algo: 'AES-256-GCM' },
    { time: new Date(now - 1800000),event: 'File Encrypted',     target: 'employee-records.xlsx',   status: 'success', algo: 'AES-256-GCM' },
    { time: new Date(now - 3600000),event: 'File Decrypted',     target: 'design-assets.zip',        status: 'success', algo: 'AES-256-GCM' },
    { time: new Date(now - 7200000),event: 'Integrity Verified', target: 'audit-log-2026-q3.csv',    status: 'success', algo: 'HMAC-SHA-256' },
    { time: new Date(now - 10800000),event:'Decrypt Blocked',    target: 'unknown-package.bin',      status: 'danger',  algo: 'AES-256-GCM' },
  ];

  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Security Overview</h1>
      <p class="page-desc">Platform health, activity summary, and security posture at a glance.</p>
    </div>

    <!-- Stats Row -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon-row">
          <span class="stat-label">Protected Files</span>
          <span class="stat-icon accent">
            <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </span>
        </div>
        <div class="stat-value">1,284</div>
        <div class="stat-meta">+47 this week</div>
      </div>

      <div class="stat-card">
        <div class="stat-icon-row">
          <span class="stat-label">Encrypted Storage</span>
          <span class="stat-icon success">
            <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </span>
        </div>
        <div class="stat-value">48.3 GB</div>
        <div class="stat-meta">of 100 GB allocated</div>
      </div>

      <div class="stat-card">
        <div class="stat-icon-row">
          <span class="stat-label">Integrity Checks</span>
          <span class="stat-icon accent">
            <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </span>
        </div>
        <div class="stat-value">3,651</div>
        <div class="stat-meta">3,629 passed · 22 failed</div>
      </div>

      <div class="stat-card">
        <div class="stat-icon-row">
          <span class="stat-label">Security Events</span>
          <span class="stat-icon danger">
            <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </span>
        </div>
        <div class="stat-value">22</div>
        <div class="stat-meta" style="color:var(--color-danger);">2 in last 24h</div>
      </div>
    </div>

    <!-- Main Grid -->
    <div class="dashboard-grid">

      <!-- Left: Recent Activity Table -->
      <div>
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">Recent Activity</div>
              <div class="card-subtitle">Last 7 security operations</div>
            </div>
            <a href="#activity" class="btn btn-ghost btn-sm" onclick="navigate('activity',null); return false;">View all →</a>
          </div>
          <div style="overflow-x:auto;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Event</th>
                  <th>Target File</th>
                  <th>Algorithm</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${recentActivity.map(row => `
                  <tr>
                    <td class="col-mono">${formatTime(row.time)}</td>
                    <td style="font-weight:500;">${row.event}</td>
                    <td class="col-mono" style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${row.target}</td>
                    <td class="col-mono">${row.algo}</td>
                    <td>
                      <span class="badge badge-${row.status}">
                        ${row.status === 'success' ? 'Verified' : 'Blocked'}
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Integrity check breakdown -->
        <div class="card" style="margin-top:var(--space-4);">
          <div class="card-header">
            <div class="card-title">Integrity Check Results</div>
          </div>
          <div class="card-body">
            <div style="display:flex;flex-direction:column;gap:var(--space-4);">
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm text-secondary">Passed</span>
                  <span class="text-sm weight-medium" style="color:var(--color-success);">3,629 (99.4%)</span>
                </div>
                <div class="progress-bar"><div class="progress-fill success" style="width:99.4%"></div></div>
              </div>
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm text-secondary">Failed</span>
                  <span class="text-sm weight-medium" style="color:var(--color-danger);">22 (0.6%)</span>
                </div>
                <div class="progress-bar"><div class="progress-fill danger" style="width:0.6%"></div></div>
              </div>
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm text-secondary">Storage Used</span>
                  <span class="text-sm weight-medium text-primary">48.3%</span>
                </div>
                <div class="progress-bar"><div class="progress-fill" style="width:48.3%"></div></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Security Posture + System Health -->
      <div style="display:flex;flex-direction:column;gap:var(--space-4);">

        <!-- Security Posture -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">Security Posture</div>
          </div>
          <div class="card-body">
            <div style="text-align:center;padding:var(--space-4) 0;">
              <div class="posture-score">94</div>
              <div style="font-size:var(--text-sm);color:var(--color-text-secondary);margin-top:var(--space-2);">out of 100</div>
              <div style="margin-top:var(--space-3);">
                <span class="badge badge-success" style="font-size:var(--text-sm);">Strong</span>
              </div>
            </div>
            <div style="display:flex;flex-direction:column;gap:var(--space-2);margin-top:var(--space-3);">
              <div class="flex items-center justify-between" style="font-size:var(--text-sm);">
                <span class="text-secondary">Encryption coverage</span>
                <span class="weight-medium" style="color:var(--color-success);">100%</span>
              </div>
              <div class="flex items-center justify-between" style="font-size:var(--text-sm);">
                <span class="text-secondary">Key rotation</span>
                <span class="weight-medium" style="color:var(--color-warning);">Overdue (12d)</span>
              </div>
              <div class="flex items-center justify-between" style="font-size:var(--text-sm);">
                <span class="text-secondary">Failed auth blocks</span>
                <span class="weight-medium text-primary">22 / 3,651</span>
              </div>
              <div class="flex items-center justify-between" style="font-size:var(--text-sm);">
                <span class="text-secondary">Audit log</span>
                <span class="badge badge-success" style="font-size:11px;">Active</span>
              </div>
            </div>
          </div>
        </div>

        <!-- System Health -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">System Health</div>
          </div>
          <div class="card-body" style="display:flex;flex-direction:column;gap:var(--space-3);">
            ${[
              { name: 'Encryption Engine',  status: 'success', label: 'Operational' },
              { name: 'Key Derivation',      status: 'success', label: 'Operational' },
              { name: 'Integrity Verifier',  status: 'success', label: 'Operational' },
              { name: 'Vault Storage',       status: 'warning', label: 'High Usage' },
              { name: 'Audit Logger',        status: 'success', label: 'Active' },
            ].map(item => `
              <div class="flex items-center justify-between" style="font-size:var(--text-md);">
                <span style="color:var(--color-text-primary);font-weight:500;">${item.name}</span>
                <span class="badge badge-${item.status}">${item.label}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">Quick Actions</div>
          </div>
          <div class="card-body" style="display:flex;flex-direction:column;gap:var(--space-2);">
            <a href="#encrypt" class="btn btn-primary w-full" onclick="navigate('encrypt',null); return false;">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Encrypt a File
            </a>
            <a href="#decrypt" class="btn btn-secondary w-full" onclick="navigate('decrypt',null); return false;">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Verify & Decrypt
            </a>
            <a href="#vault" class="btn btn-secondary w-full" onclick="navigate('vault',null); return false;">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="14" rx="2"/><path d="M8 6V4a4 4 0 0 1 8 0v2"/></svg>
              Browse Vault
            </a>
          </div>
        </div>
      </div>
    </div>
  `;
}
