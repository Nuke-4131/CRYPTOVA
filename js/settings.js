/* ============================================================
   CRYPTOVA — Settings Page
   ============================================================ */

let settingsSection = 'security';

function renderSettings(container) {
  settingsSection = 'security';

  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Settings</h1>
      <p class="page-desc">Configure platform defaults, key management, and account preferences.</p>
    </div>

    <div class="settings-layout">

      <!-- Left Nav -->
      <nav class="settings-nav">
        ${[
          { id:'security',      label:'Security Defaults',  icon:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>' },
          { id:'keys',          label:'Key Management',     icon:'<circle cx="8" cy="15" r="3"/><line x1="10.85" y1="12.15" x2="19" y2="4"/><line x1="18" y1="5" x2="20" y2="7"/><line x1="15" y1="8" x2="17" y2="10"/>' },
          { id:'notifications', label:'Notifications',      icon:'<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>' },
          { id:'account',       label:'Account',            icon:'<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>' },
        ].map(s => `
          <div class="settings-nav-item ${s.id === settingsSection ? 'active' : ''}" id="snav-${s.id}" onclick="showSettingsSection('${s.id}')">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">${s.icon}</svg>
            ${s.label}
          </div>
        `).join('')}
      </nav>

      <!-- Right: Settings Panels -->
      <div id="settings-content">
        <!-- populated by showSettingsSection -->
      </div>
    </div>
  `;

  showSettingsSection('security');
}

function showSettingsSection(section) {
  settingsSection = section;

  // Update nav
  document.querySelectorAll('.settings-nav-item').forEach(el => el.classList.remove('active'));
  const navEl = document.getElementById('snav-' + section);
  if (navEl) navEl.classList.add('active');

  const content = document.getElementById('settings-content');
  if (!content) return;

  const panels = {
    security: `
      <div class="settings-section">

        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">Encryption Defaults</div>
              <div class="card-subtitle">Default settings applied when encrypting new files</div>
            </div>
          </div>
          <div class="card-body" style="display:flex;flex-direction:column;gap:var(--space-4);">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="s-algo">Default Algorithm</label>
                <select class="form-control" id="s-algo">
                  <option selected>AES-256-GCM (Recommended)</option>
                  <option>AES-256-CBC</option>
                  <option>ChaCha20-Poly1305</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="s-kdf">Default KDF</label>
                <select class="form-control" id="s-kdf">
                  <option selected>PBKDF2-SHA256 (310,000 rounds)</option>
                  <option>scrypt (n=32768)</option>
                  <option>Argon2id</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label" for="s-sensitivity">Default Sensitivity</label>
              <select class="form-control" id="s-sensitivity">
                <option value="public">Public</option>
                <option value="internal" selected>Internal</option>
                <option value="confidential">Confidential</option>
                <option value="restricted">Restricted</option>
              </select>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div class="card-title">Protection Options</div>
          </div>
          <div class="card-body" style="padding:0 var(--space-5);">
            <div class="toggle-group">
              <div class="toggle-info">
                <div class="toggle-label">HMAC integrity signatures</div>
                <div class="toggle-desc">Always include HMAC-SHA-256 signatures in encrypted packages</div>
              </div>
              <label class="toggle"><input type="checkbox" checked><span class="toggle-slider"></span></label>
            </div>
            <div class="toggle-group">
              <div class="toggle-info">
                <div class="toggle-label">Require verification before decrypt</div>
                <div class="toggle-desc">Block decryption if any verification stage fails</div>
              </div>
              <label class="toggle"><input type="checkbox" checked><span class="toggle-slider"></span></label>
            </div>
            <div class="toggle-group">
              <div class="toggle-info">
                <div class="toggle-label">Auto-add to Vault on encryption</div>
                <div class="toggle-desc">Automatically register new encrypted packages in the vault</div>
              </div>
              <label class="toggle"><input type="checkbox" checked><span class="toggle-slider"></span></label>
            </div>
            <div class="toggle-group">
              <div class="toggle-info">
                <div class="toggle-label">Compress before encryption</div>
                <div class="toggle-desc">Apply deflate compression before encrypting (default: off)</div>
              </div>
              <label class="toggle"><input type="checkbox"><span class="toggle-slider"></span></label>
            </div>
          </div>
        </div>

        <div class="flex justify-between items-center">
          <span class="text-sm text-secondary">Last updated: 14 Sep 2026 at 09:41</span>
          <button class="btn btn-primary" onclick="showToast('Security settings saved.', 'success')">Save Changes</button>
        </div>
      </div>
    `,

    keys: `
      <div class="settings-section">

        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">Master Key Status</div>
              <div class="card-subtitle">Active key used for all encryption operations</div>
            </div>
            <span class="badge badge-warning">Rotation Overdue</span>
          </div>
          <div class="card-body" style="display:flex;flex-direction:column;gap:var(--space-3);">
            ${[
              { label:'Key ID',          value:'MK-2026-001',              mono: true },
              { label:'Algorithm',       value:'AES-256-GCM',              mono: true },
              { label:'Created',         value:'15 Mar 2026',              mono: false },
              { label:'Last Rotated',    value:'15 Mar 2026 (183 days ago)',mono: false },
              { label:'Next Rotation',   value:'15 Sep 2026 (Overdue)',     mono: false, danger: true },
              { label:'Protected Files', value:'1,284',                    mono: false },
            ].map(r => `
              <div class="flex items-center justify-between" style="font-size:var(--text-md);padding:var(--space-1) 0;">
                <span class="text-secondary">${r.label}</span>
                <span class="${r.mono ? 'text-mono' : ''} weight-medium" ${r.danger ? 'style="color:var(--color-danger);"' : ''}>${r.value}</span>
              </div>
            `).join('')}
          </div>
          <div class="card-footer">
            <button class="btn btn-primary btn-sm" onclick="showToast('Key rotation initiated. Please follow the secure procedure.', 'info')">
              Rotate Master Key
            </button>
            <button class="btn btn-secondary btn-sm" onclick="showToast('Key backup exported.', 'success')">Export Key Backup</button>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div class="card-title">Key Derivation Configuration</div>
          </div>
          <div class="card-body" style="display:flex;flex-direction:column;gap:var(--space-4);">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="s-kdf-algo">KDF Algorithm</label>
                <select class="form-control" id="s-kdf-algo">
                  <option selected>PBKDF2-SHA256</option>
                  <option>scrypt</option>
                  <option>Argon2id</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="s-kdf-rounds">PBKDF2 Rounds</label>
                <input type="number" class="form-control" id="s-kdf-rounds" value="310000" min="100000" step="10000">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label" for="s-salt-len">Salt Length (bytes)</label>
              <input type="number" class="form-control" id="s-salt-len" value="32" min="16" max="64">
              <span class="form-hint">Minimum recommended: 16 bytes</span>
            </div>
          </div>
          <div class="card-footer">
            <button class="btn btn-primary btn-sm" onclick="showToast('KDF configuration saved.', 'success')">Save</button>
          </div>
        </div>
      </div>
    `,

    notifications: `
      <div class="settings-section">

        <div class="card">
          <div class="card-header">
            <div class="card-title">Security Alerts</div>
          </div>
          <div class="card-body" style="padding:0 var(--space-5);">
            <div class="toggle-group">
              <div class="toggle-info">
                <div class="toggle-label">Integrity check failures</div>
                <div class="toggle-desc">Alert when a package fails the integrity verification stage</div>
              </div>
              <label class="toggle"><input type="checkbox" checked><span class="toggle-slider"></span></label>
            </div>
            <div class="toggle-group">
              <div class="toggle-info">
                <div class="toggle-label">Authentication failures</div>
                <div class="toggle-desc">Alert when a passphrase fails authentication</div>
              </div>
              <label class="toggle"><input type="checkbox" checked><span class="toggle-slider"></span></label>
            </div>
            <div class="toggle-group">
              <div class="toggle-info">
                <div class="toggle-label">Key rotation reminders</div>
                <div class="toggle-desc">Alert when master key rotation is due or overdue</div>
              </div>
              <label class="toggle"><input type="checkbox" checked><span class="toggle-slider"></span></label>
            </div>
            <div class="toggle-group">
              <div class="toggle-info">
                <div class="toggle-label">Vault storage threshold</div>
                <div class="toggle-desc">Alert when vault storage exceeds 80% capacity</div>
              </div>
              <label class="toggle"><input type="checkbox" checked><span class="toggle-slider"></span></label>
            </div>
            <div class="toggle-group">
              <div class="toggle-info">
                <div class="toggle-label">Successful encryption events</div>
                <div class="toggle-desc">Alert on every successful file encryption</div>
              </div>
              <label class="toggle"><input type="checkbox"><span class="toggle-slider"></span></label>
            </div>
          </div>
          <div class="card-footer">
            <button class="btn btn-primary btn-sm" onclick="showToast('Notification settings saved.', 'success')">Save</button>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div class="card-title">Audit Report Schedule</div>
          </div>
          <div class="card-body" style="display:flex;flex-direction:column;gap:var(--space-4);">
            <div class="form-group">
              <label class="form-label" for="s-report-freq">Report Frequency</label>
              <select class="form-control" id="s-report-freq">
                <option>Daily</option>
                <option selected>Weekly</option>
                <option>Monthly</option>
                <option>Disabled</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="s-report-email">Report Recipient</label>
              <input type="email" class="form-control" id="s-report-email" value="admin@organisation.com">
            </div>
          </div>
          <div class="card-footer">
            <button class="btn btn-primary btn-sm" onclick="showToast('Report schedule saved.', 'success')">Save</button>
          </div>
        </div>
      </div>
    `,

    account: `
      <div class="settings-section">

        <div class="card">
          <div class="card-header">
            <div class="card-title">Account Information</div>
          </div>
          <div class="card-body" style="display:flex;flex-direction:column;gap:var(--space-4);">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="s-fname">First Name</label>
                <input type="text" class="form-control" id="s-fname" value="Admin">
              </div>
              <div class="form-group">
                <label class="form-label" for="s-lname">Last Name</label>
                <input type="text" class="form-control" id="s-lname" value="User">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label" for="s-email">Email</label>
              <input type="email" class="form-control" id="s-email" value="admin@organisation.com">
            </div>
            <div class="form-group">
              <label class="form-label" for="s-role">Role</label>
              <input type="text" class="form-control" id="s-role" value="Security Engineer" disabled style="background:var(--color-surface-2);">
              <span class="form-hint">Role is managed by your organisation administrator</span>
            </div>
          </div>
          <div class="card-footer">
            <button class="btn btn-primary btn-sm" onclick="showToast('Account information saved.', 'success')">Save Changes</button>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div class="card-title">Change Passphrase</div>
          </div>
          <div class="card-body" style="display:flex;flex-direction:column;gap:var(--space-4);">
            <div class="form-group">
              <label class="form-label" for="s-curr-pass">Current Passphrase</label>
              <input type="password" class="form-control" id="s-curr-pass" placeholder="Enter current passphrase">
            </div>
            <div class="form-group">
              <label class="form-label" for="s-new-pass">New Passphrase</label>
              <input type="password" class="form-control" id="s-new-pass" placeholder="Enter new passphrase (min. 12 chars)">
            </div>
            <div class="form-group">
              <label class="form-label" for="s-conf-pass">Confirm New Passphrase</label>
              <input type="password" class="form-control" id="s-conf-pass" placeholder="Repeat new passphrase">
            </div>
          </div>
          <div class="card-footer">
            <button class="btn btn-primary btn-sm" onclick="showToast('Passphrase updated successfully.', 'success')">Update Passphrase</button>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div class="card-title" style="color:var(--color-danger);">Danger Zone</div>
          </div>
          <div class="card-body" style="display:flex;flex-direction:column;gap:var(--space-4);">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-md weight-medium">Clear Activity Log</div>
                <div class="text-sm text-secondary">Permanently delete all activity records</div>
              </div>
              <button class="btn btn-danger btn-sm" onclick="showToast('Activity log cleared.','info')">Clear Log</button>
            </div>
            <hr class="divider">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-md weight-medium">Reset Platform</div>
                <div class="text-sm text-secondary">Clear all vault data, keys, and settings</div>
              </div>
              <button class="btn btn-danger btn-sm" onclick="showToast('Platform reset requires confirmation. Contact your admin.','error')">Reset</button>
            </div>
          </div>
        </div>
      </div>
    `,
  };

  content.innerHTML = panels[section] || `<div class="text-secondary">Section not found.</div>`;
  content.classList.remove('page-enter');
  void content.offsetWidth;
  content.classList.add('page-enter');
}
