/* ============================================================
   CRYPTOVA — Vault Page
   ============================================================ */

const VAULT_FILES = [
  { id:'CVP-A1B2C3D4', name:'quarterly-report-q3.pdf',     size:2841600,  algo:'AES-256-GCM',       sensitivity:'Confidential', date:new Date('2026-09-15'), status:'protected', checked:true  },
  { id:'CVP-E5F6G7H8', name:'employee-records.xlsx',        size:512000,   algo:'AES-256-GCM',       sensitivity:'Restricted',   date:new Date('2026-09-14'), status:'protected', checked:true  },
  { id:'CVP-I9J0K1L2', name:'design-assets-v4.zip',         size:15728640, algo:'AES-256-GCM',       sensitivity:'Internal',     date:new Date('2026-09-13'), status:'protected', checked:true  },
  { id:'CVP-M3N4O5P6', name:'contract-nda-v3.docx',         size:204800,   algo:'ChaCha20-Poly1305', sensitivity:'Restricted',   date:new Date('2026-09-12'), status:'protected', checked:true  },
  { id:'CVP-Q7R8S9T0', name:'audit-log-2026-q3.csv',        size:102400,   algo:'AES-256-GCM',       sensitivity:'Confidential', date:new Date('2026-09-10'), status:'protected', checked:true  },
  { id:'CVP-U1V2W3X4', name:'archive-backup-2026.zip',      size:104857600,algo:'AES-256-GCM',       sensitivity:'Internal',     date:new Date('2026-09-09'), status:'failed',    checked:false },
  { id:'CVP-Y5Z6A7B8', name:'financial-projections-q4.xlsx',size:1048576,  algo:'AES-256-GCM',       sensitivity:'Restricted',   date:new Date('2026-09-08'), status:'protected', checked:true  },
  { id:'CVP-C9D0E1F2', name:'product-roadmap-2027.pptx',    size:8388608,  algo:'AES-256-CBC',       sensitivity:'Confidential', date:new Date('2026-09-07'), status:'protected', checked:true  },
  { id:'CVP-G3H4I5J6', name:'customer-db-export.csv',       size:5242880,  algo:'AES-256-GCM',       sensitivity:'Restricted',   date:new Date('2026-09-06'), status:'protected', checked:true  },
  { id:'CVP-K7L8M9N0', name:'unknown-package.bin',          size:320000,   algo:'Unknown',           sensitivity:'Unknown',      date:new Date('2026-09-05'), status:'failed',    checked:false },
];

let vaultFilter = '';
let vaultSensFilter = '';

function renderVault(container) {
  vaultFilter = '';
  vaultSensFilter = '';

  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Vault</h1>
      <p class="page-desc">Manage your encrypted file inventory. ${VAULT_FILES.length} packages stored.</p>
    </div>

    <!-- Stats row -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:var(--space-4);margin-bottom:var(--space-5);">
      <div class="stat-card">
        <div class="stat-label">Total Packages</div>
        <div class="stat-value">${VAULT_FILES.length}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Protected</div>
        <div class="stat-value" style="color:var(--color-success);">${VAULT_FILES.filter(f=>f.status==='protected').length}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Failed Integrity</div>
        <div class="stat-value" style="color:var(--color-danger);">${VAULT_FILES.filter(f=>f.status==='failed').length}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Size</div>
        <div class="stat-value">${formatSize(VAULT_FILES.reduce((a,f)=>a+f.size,0))}</div>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="vault-toolbar">
      <div class="vault-filters">
        <div class="search-input-wrap">
          <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" class="search-input" placeholder="Search packages…" id="vault-search" oninput="filterVault()">
        </div>
        <select class="form-control" id="vault-sens-filter" onchange="filterVault()" style="height:32px;width:auto;font-size:var(--text-sm);">
          <option value="">All Sensitivity</option>
          <option value="Restricted">Restricted</option>
          <option value="Confidential">Confidential</option>
          <option value="Internal">Internal</option>
          <option value="Public">Public</option>
        </select>
        <select class="form-control" id="vault-status-filter" onchange="filterVault()" style="height:32px;width:auto;font-size:var(--text-sm);">
          <option value="">All Status</option>
          <option value="protected">Protected</option>
          <option value="failed">Failed</option>
        </select>
      </div>
      <div class="flex gap-2">
        <button class="btn btn-secondary btn-sm" onclick="showToast('Integrity scan initiated for all packages.','info')">
          <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Verify All
        </button>
        <a href="#encrypt" class="btn btn-primary btn-sm" onclick="navigate('encrypt',null);return false;">
          <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add File
        </a>
      </div>
    </div>

    <!-- Table -->
    <div class="card">
      <div style="overflow-x:auto;">
        <table class="data-table" id="vault-table">
          <thead>
            <tr>
              <th style="width:44px;"><input type="checkbox" id="vault-check-all" onchange="toggleAllVault(this)"></th>
              <th>Package ID</th>
              <th>Filename</th>
              <th>Size</th>
              <th>Algorithm</th>
              <th>Sensitivity</th>
              <th>Created</th>
              <th>Status</th>
              <th style="width:120px;"></th>
            </tr>
          </thead>
          <tbody id="vault-tbody">
            <!-- populated by filterVault() -->
          </tbody>
        </table>
      </div>
      <div class="card-footer">
        <span class="text-sm text-secondary" id="vault-count">${VAULT_FILES.length} packages</span>
        <div style="flex:1;"></div>
        <button class="btn btn-ghost btn-sm" style="color:var(--color-danger);" onclick="showToast('Selected packages deleted.','info')">Delete Selected</button>
      </div>
    </div>
  `;

  filterVault();
}

function sensitivityBadge(s) {
  const map = {
    Restricted:   'danger',
    Confidential: 'warning',
    Internal:     'info',
    Public:       'neutral',
    Unknown:      'neutral',
  };
  return `<span class="badge badge-${map[s]||'neutral'}">${s}</span>`;
}

function filterVault() {
  const search = (document.getElementById('vault-search')?.value || '').toLowerCase();
  const sens   = document.getElementById('vault-sens-filter')?.value || '';
  const status = document.getElementById('vault-status-filter')?.value || '';

  const filtered = VAULT_FILES.filter(f => {
    const matchSearch = !search || f.name.toLowerCase().includes(search) || f.id.toLowerCase().includes(search);
    const matchSens   = !sens   || f.sensitivity === sens;
    const matchStatus = !status || f.status === status;
    return matchSearch && matchSens && matchStatus;
  });

  const tbody = document.getElementById('vault-tbody');
  const count = document.getElementById('vault-count');
  if (!tbody) return;

  if (count) count.textContent = `${filtered.length} of ${VAULT_FILES.length} packages`;

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9"><div class="empty-state" style="padding:var(--space-10) 0;"><svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="14" rx="2"/><path d="M8 6V4a4 4 0 0 1 8 0v2"/></svg><h3>No packages found</h3><p>Adjust your search or filters</p></div></td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(f => `
    <tr>
      <td><input type="checkbox" ${f.checked ? 'checked' : ''}></td>
      <td class="col-mono">${f.id}</td>
      <td style="max-width:180px;">
        <div style="font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${f.name}">${f.name}</div>
      </td>
      <td class="col-mono">${formatSize(f.size)}</td>
      <td class="col-mono">${f.algo}</td>
      <td>${sensitivityBadge(f.sensitivity)}</td>
      <td class="col-mono">${formatDate(f.date)}</td>
      <td>
        <span class="badge badge-${f.status==='protected'?'success':'danger'}">
          ${f.status === 'protected' ? 'Protected' : 'Failed'}
        </span>
      </td>
      <td>
        <div class="flex gap-1">
          <button class="btn btn-ghost btn-icon btn-sm" title="Download" onclick="showToast('Downloading ${f.name}…','info')">
            <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </button>
          <button class="btn btn-ghost btn-icon btn-sm" title="Verify" onclick="navigate('decrypt',null);showToast('Verification started for ${f.name}','info')">
            <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
          </button>
          <button class="btn btn-ghost btn-icon btn-sm" title="Delete" style="color:var(--color-danger);" onclick="showToast('Package ${f.id} deleted.','info')">
            <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function toggleAllVault(cb) {
  document.querySelectorAll('#vault-tbody input[type=checkbox]').forEach(el => el.checked = cb.checked);
}
