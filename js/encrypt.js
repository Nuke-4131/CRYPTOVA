/* ============================================================
   CRYPTOVA — Encrypt Page
   ============================================================ */

let encryptState = {
  file: null,
  step: 0,  // 0=upload 1=info 2=config 3=action 4=result
  encrypting: false,
  result: null,
};

function renderEncrypt(container) {
  encryptState = { file: null, step: 0, encrypting: false, result: null };

  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Encrypt</h1>
      <p class="page-desc">Select a file, configure protection settings, and generate an authenticated encrypted package.</p>
    </div>

    <div class="encrypt-layout">

      <!-- Left: Main Workspace -->
      <div style="display:flex;flex-direction:column;gap:var(--space-4);" id="encrypt-workspace">

        <!-- Step 1: Upload -->
        <div class="card" id="enc-step-upload">
          <div class="card-header">
            <div>
              <div class="card-title">1 — Select File</div>
              <div class="card-subtitle">Choose the file you want to protect</div>
            </div>
          </div>
          <div class="card-body">
            <div class="upload-zone" id="enc-dropzone" tabindex="0">
              <div class="upload-zone-icon">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              </div>
              <div class="upload-zone-title">Drop file here or click to browse</div>
              <div class="upload-zone-sub">Maximum file size: 500 MB · Any file type</div>
            </div>
            <input type="file" id="enc-file-input" style="display:none;" accept="*/*">
          </div>
        </div>

        <!-- Step 2: File Info (hidden until file selected) -->
        <div class="card" id="enc-step-info" style="display:none;">
          <div class="card-header">
            <div class="card-title">2 — File Information</div>
          </div>
          <div class="card-body" style="display:flex;flex-direction:column;gap:var(--space-4);">

            <!-- File info panel -->
            <div class="file-info-panel" id="enc-file-info">
              <!-- populated by JS -->
            </div>

            <!-- Sensitivity classification -->
            <div class="form-group">
              <label class="form-label" for="enc-sensitivity">Sensitivity Classification</label>
              <select class="form-control" id="enc-sensitivity">
                <option value="public">Public — Not sensitive, safe for external sharing</option>
                <option value="internal" selected>Internal — Limited to organisation members</option>
                <option value="confidential">Confidential — Restricted distribution</option>
                <option value="restricted">Restricted — Strictly controlled access</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="enc-description">Description <span style="color:var(--color-text-tertiary);font-weight:400;">(optional)</span></label>
              <textarea class="form-control" id="enc-description" rows="2" placeholder="Brief description of this file's purpose..."></textarea>
            </div>
          </div>
        </div>

        <!-- Step 3: Protection Config -->
        <div class="card" id="enc-step-config" style="display:none;">
          <div class="card-header">
            <div class="card-title">3 — Protection Configuration</div>
          </div>
          <div class="card-body" style="display:flex;flex-direction:column;gap:var(--space-4);">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="enc-algo">Encryption Algorithm</label>
                <select class="form-control" id="enc-algo">
                  <option value="AES-256-GCM" selected>AES-256-GCM (Recommended)</option>
                  <option value="AES-256-CBC">AES-256-CBC</option>
                  <option value="ChaCha20-Poly1305">ChaCha20-Poly1305</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="enc-kdf">Key Derivation</label>
                <select class="form-control" id="enc-kdf">
                  <option value="PBKDF2-SHA256" selected>PBKDF2-SHA256 (310,000 rounds)</option>
                  <option value="scrypt">scrypt (n=32768)</option>
                  <option value="Argon2id">Argon2id</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="enc-passphrase">Encryption Passphrase</label>
              <div style="position:relative;">
                <input class="form-control" type="password" id="enc-passphrase" placeholder="Enter a strong passphrase" style="padding-right:44px;">
                <button type="button" class="btn btn-ghost btn-icon" onclick="togglePassphrase('enc-passphrase')" style="position:absolute;right:4px;top:1px;height:34px;color:var(--color-text-secondary);">
                  <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
              <span class="form-hint">Use a minimum of 12 characters. This passphrase is required for decryption.</span>
            </div>

            <div class="form-group">
              <label class="form-label" for="enc-passphrase2">Confirm Passphrase</label>
              <input class="form-control" type="password" id="enc-passphrase2" placeholder="Repeat passphrase">
            </div>

            <!-- Options -->
            <div style="border:var(--border-width) solid var(--color-border);border-radius:var(--radius-lg);padding:0 var(--space-4);">
              <div class="toggle-group">
                <div class="toggle-info">
                  <div class="toggle-label">Include HMAC integrity signature</div>
                  <div class="toggle-desc">Binds a cryptographic signature to file content and metadata</div>
                </div>
                <label class="toggle" style="margin-left:var(--space-4);">
                  <input type="checkbox" id="enc-opt-hmac" checked>
                  <span class="toggle-slider"></span>
                </label>
              </div>
              <div class="toggle-group">
                <div class="toggle-info">
                  <div class="toggle-label">Compress before encryption</div>
                  <div class="toggle-desc">Reduces file size using deflate compression</div>
                </div>
                <label class="toggle" style="margin-left:var(--space-4);">
                  <input type="checkbox" id="enc-opt-compress">
                  <span class="toggle-slider"></span>
                </label>
              </div>
              <div class="toggle-group">
                <div class="toggle-info">
                  <div class="toggle-label">Add to Vault on completion</div>
                  <div class="toggle-desc">Stores the encrypted package in the secure vault</div>
                </div>
                <label class="toggle" style="margin-left:var(--space-4);">
                  <input type="checkbox" id="enc-opt-vault" checked>
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 4: Action -->
        <div class="card" id="enc-step-action" style="display:none;">
          <div class="card-header">
            <div class="card-title">4 — Encrypt</div>
          </div>
          <div class="card-body" style="display:flex;flex-direction:column;gap:var(--space-4);">
            <div class="alert-strip info" id="enc-action-summary">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span id="enc-summary-text">Ready to encrypt.</span>
            </div>
            <div id="enc-progress-wrap" style="display:none;">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm text-secondary" id="enc-progress-label">Deriving key…</span>
                <span class="text-sm text-secondary" id="enc-progress-pct">0%</span>
              </div>
              <div class="progress-bar"><div class="progress-fill" id="enc-progress-bar" style="width:0%"></div></div>
            </div>
            <div class="flex gap-3">
              <button class="btn btn-primary" id="enc-start-btn" onclick="startEncryption()">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                Encrypt File
              </button>
              <button class="btn btn-ghost" onclick="resetEncrypt()">Reset</button>
            </div>
          </div>
        </div>

        <!-- Step 5: Result -->
        <div class="card" id="enc-step-result" style="display:none;">
          <div class="card-header">
            <div class="card-title">5 — Result</div>
          </div>
          <div class="card-body" id="enc-result-body">
            <!-- populated -->
          </div>
        </div>
      </div>

      <!-- Right: Step Tracker -->
      <div>
        <div class="card" style="position:sticky;top:var(--space-6);">
          <div class="card-header">
            <div class="card-title">Encryption Workflow</div>
          </div>
          <div class="card-body">
            <div class="encrypt-steps" id="enc-step-tracker">
              ${[
                { num: 1, label: 'Select File' },
                { num: 2, label: 'File Information' },
                { num: 3, label: 'Protection Config' },
                { num: 4, label: 'Encrypt' },
                { num: 5, label: 'Result' },
              ].map((s, i) => `
                <div class="encrypt-step ${i === 0 ? 'active' : ''}" id="enc-tracker-${i+1}">
                  <span class="step-num">${s.num}</span>
                  ${s.label}
                </div>
              `).join('')}
            </div>

            <hr class="divider" style="margin:var(--space-4) 0;">
            <div style="font-size:var(--text-sm);color:var(--color-text-secondary);line-height:var(--leading-loose);">
              <strong style="color:var(--color-text-primary);display:block;margin-bottom:var(--space-2);">What CRYPTOVA does</strong>
              <ul style="list-style:disc;padding-left:var(--space-4);display:flex;flex-direction:column;gap:var(--space-1);">
                <li>Derives an encryption key from your passphrase using PBKDF2</li>
                <li>Encrypts file content with AES-256-GCM</li>
                <li>Generates an HMAC-SHA-256 integrity signature</li>
                <li>Bundles into a tamper-evident package</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Bind file input events
  const dropzone = document.getElementById('enc-dropzone');
  const fileInput = document.getElementById('enc-file-input');

  dropzone.addEventListener('click', () => fileInput.click());
  dropzone.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') fileInput.click(); });
  dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('drag-over'); });
  dropzone.addEventListener('dragleave',() => dropzone.classList.remove('drag-over'));
  dropzone.addEventListener('drop', e => {
    e.preventDefault();
    dropzone.classList.remove('drag-over');
    const f = e.dataTransfer.files[0];
    if (f) handleFileSelected(f);
  });
  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) handleFileSelected(fileInput.files[0]);
  });
}

function togglePassphrase(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.type = el.type === 'password' ? 'text' : 'password';
}

function handleFileSelected(file) {
  encryptState.file = file;

  // Update file info panel
  const ext = file.name.split('.').pop().toUpperCase() || 'BIN';
  const infoPanel = document.getElementById('enc-file-info');
  if (infoPanel) {
    infoPanel.innerHTML = `
      <div class="file-type-icon">${ext.slice(0,4)}</div>
      <div style="flex:1;min-width:0;">
        <div style="font-size:var(--text-md);font-weight:600;color:var(--color-text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${file.name}</div>
        <div style="font-size:var(--text-sm);color:var(--color-text-secondary);margin-top:2px;display:flex;gap:var(--space-4);">
          <span>${formatSize(file.size)}</span>
          <span>${file.type || 'Unknown type'}</span>
          <span>Modified: ${formatDate(new Date(file.lastModified))}</span>
        </div>
      </div>
      <button class="btn btn-ghost btn-icon btn-sm" onclick="clearFile()" title="Remove file" style="color:var(--color-text-secondary);">
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    `;
  }

  // Show steps
  document.getElementById('enc-step-info').style.display = '';
  document.getElementById('enc-step-config').style.display = '';
  document.getElementById('enc-step-action').style.display = '';

  updateEncTrackerStep(2);
  updateActionSummary();
}

function clearFile() {
  encryptState.file = null;
  document.getElementById('enc-step-info').style.display = 'none';
  document.getElementById('enc-step-config').style.display = 'none';
  document.getElementById('enc-step-action').style.display = 'none';
  document.getElementById('enc-step-result').style.display = 'none';
  document.getElementById('enc-file-input').value = '';
  updateEncTrackerStep(1);
}

function updateEncTrackerStep(active) {
  for (let i = 1; i <= 5; i++) {
    const el = document.getElementById('enc-tracker-' + i);
    if (!el) continue;
    el.classList.remove('active', 'complete');
    if (i < active) el.classList.add('complete');
    else if (i === active) el.classList.add('active');
  }
}

function updateActionSummary() {
  const algo = document.getElementById('enc-algo')?.value || 'AES-256-GCM';
  const kdf  = document.getElementById('enc-kdf')?.value  || 'PBKDF2-SHA256';
  const hmac = document.getElementById('enc-opt-hmac')?.checked;
  const file = encryptState.file;
  if (!file) return;

  const txt = document.getElementById('enc-summary-text');
  if (txt) {
    txt.textContent = `Ready to encrypt "${file.name}" (${formatSize(file.size)}) using ${algo} · KDF: ${kdf}${hmac ? ' · HMAC-SHA-256 integrity' : ''}.`;
  }
  updateEncTrackerStep(4);
}

function startEncryption() {
  const file = encryptState.file;
  if (!file) { showToast('No file selected.', 'error'); return; }

  const pass  = document.getElementById('enc-passphrase')?.value || '';
  const pass2 = document.getElementById('enc-passphrase2')?.value || '';

  if (!pass) { showToast('Enter an encryption passphrase.', 'error'); return; }
  if (pass.length < 8) { showToast('Passphrase must be at least 8 characters.', 'error'); return; }
  if (pass !== pass2) { showToast('Passphrases do not match.', 'error'); return; }

  if (encryptState.encrypting) return;
  encryptState.encrypting = true;

  const startBtn = document.getElementById('enc-start-btn');
  if (startBtn) startBtn.disabled = true;

  // Show progress
  const progressWrap = document.getElementById('enc-progress-wrap');
  if (progressWrap) progressWrap.style.display = '';

  updateEncTrackerStep(4);

  const steps = [
    { label: 'Reading file…', pct: 10 },
    { label: 'Deriving encryption key (PBKDF2)…', pct: 35 },
    { label: 'Encrypting content (AES-256-GCM)…', pct: 65 },
    { label: 'Computing HMAC-SHA-256 signature…', pct: 85 },
    { label: 'Building package…', pct: 95 },
    { label: 'Complete', pct: 100 },
  ];

  let si = 0;
  function nextStep() {
    if (si >= steps.length) {
      finishEncryption();
      return;
    }
    const s = steps[si++];
    const labelEl = document.getElementById('enc-progress-label');
    const pctEl   = document.getElementById('enc-progress-pct');
    const barEl   = document.getElementById('enc-progress-bar');
    if (labelEl) labelEl.textContent = s.label;
    if (pctEl) pctEl.textContent = s.pct + '%';
    if (barEl) barEl.style.width = s.pct + '%';
    const delay = si === 1 ? 300 : si === 2 ? 600 : si === 3 ? 800 : si === 4 ? 500 : si === 5 ? 300 : 200;
    setTimeout(nextStep, delay);
  }
  nextStep();
}

function finishEncryption() {
  const file = encryptState.file;
  const algo = document.getElementById('enc-algo')?.value || 'AES-256-GCM';
  const kdf  = document.getElementById('enc-kdf')?.value  || 'PBKDF2-SHA256';
  const sensitivity = document.getElementById('enc-sensitivity')?.value || 'internal';
  const hmac = document.getElementById('enc-opt-hmac')?.checked !== false;

  // Simulate package ID and HMAC
  const packageId = 'CVP-' + Math.random().toString(36).slice(2,10).toUpperCase();
  const hmacHex = Array.from({length: 32}, () => Math.floor(Math.random()*256).toString(16).padStart(2,'0')).join('');
  const ivHex   = Array.from({length: 12}, () => Math.floor(Math.random()*256).toString(16).padStart(2,'0')).join('');
  const outSize = Math.round(file.size * 1.04); // slight overhead

  encryptState.result = { packageId, hmacHex, ivHex, outSize, algo, kdf, sensitivity, hmac };

  const resultDiv = document.getElementById('enc-step-result');
  const resultBody = document.getElementById('enc-result-body');

  if (resultBody) {
    resultBody.innerHTML = `
      <div class="alert-strip success" style="margin-bottom:var(--space-4);">
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
        <span>File encrypted successfully. Package is ready.</span>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4);margin-bottom:var(--space-5);">
        <div>
          <div class="text-sm text-secondary">Package ID</div>
          <div class="text-mono weight-semibold" style="margin-top:2px;color:var(--color-text-primary);">${packageId}</div>
        </div>
        <div>
          <div class="text-sm text-secondary">Algorithm</div>
          <div class="text-mono weight-semibold" style="margin-top:2px;color:var(--color-text-primary);">${algo}</div>
        </div>
        <div>
          <div class="text-sm text-secondary">Package Size</div>
          <div class="text-mono" style="margin-top:2px;">${formatSize(outSize)}</div>
        </div>
        <div>
          <div class="text-sm text-secondary">Sensitivity</div>
          <div style="margin-top:2px;text-transform:capitalize;">${sensitivity}</div>
        </div>
        <div style="grid-column:1/-1;">
          <div class="text-sm text-secondary">HMAC-SHA-256 Signature</div>
          <div class="text-mono" style="margin-top:2px;font-size:10px;word-break:break-all;color:var(--color-text-secondary);">${hmacHex}</div>
        </div>
        <div style="grid-column:1/-1;">
          <div class="text-sm text-secondary">IV (nonce)</div>
          <div class="text-mono" style="margin-top:2px;font-size:10px;color:var(--color-text-secondary);">${ivHex}</div>
        </div>
      </div>
      <div class="flex gap-3">
        <button class="btn btn-primary" onclick="showToast('Package downloaded: ${packageId}.cvp', 'success')">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Download Package
        </button>
        <button class="btn btn-secondary" onclick="resetEncrypt()">Encrypt Another</button>
        <button class="btn btn-ghost" onclick="navigate('vault',null)">View in Vault →</button>
      </div>
    `;
  }

  if (resultDiv) resultDiv.style.display = '';
  updateEncTrackerStep(5);
  encryptState.encrypting = false;
  showToast('File encrypted successfully.', 'success');

  // Log to activity
  logActivity('File Encrypted', file.name, 'success', algo);
}

function resetEncrypt() {
  clearFile();
  const resultDiv = document.getElementById('enc-step-result');
  if (resultDiv) resultDiv.style.display = 'none';
  const progressWrap = document.getElementById('enc-progress-wrap');
  if (progressWrap) progressWrap.style.display = 'none';
  const startBtn = document.getElementById('enc-start-btn');
  if (startBtn) startBtn.disabled = false;
  encryptState = { file: null, step: 0, encrypting: false, result: null };
}
