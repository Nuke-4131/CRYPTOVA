/* ============================================================
   CRYPTOVA — Decrypt & Verify Page (Signature Page)
   ============================================================ */

let decryptState = {
  file: null,
  verifying: false,
  mode: 'idle',  // idle | running | success | failed
};

const VERIFY_STEPS = [
  {
    id: 'received',
    title: 'Package Received',
    desc: 'Encrypted package loaded into verification environment',
  },
  {
    id: 'format',
    title: 'Format Validation',
    desc: 'Validating package structure, headers, and required metadata fields',
  },
  {
    id: 'auth',
    title: 'Authentication',
    desc: 'Verifying passphrase derivation and key authentication tag',
  },
  {
    id: 'integrity',
    title: 'Integrity Verification',
    desc: 'Computing and comparing HMAC-SHA-256 signature against stored value',
  },
  {
    id: 'ready',
    title: 'Ready to Decrypt',
    desc: 'All checks passed — decryption is authorised',
  },
];

function renderDecrypt(container) {
  decryptState = { file: null, verifying: false, mode: 'idle' };

  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Decrypt & Verify</h1>
      <p class="page-desc">Authenticate an encrypted package before decryption. Every package must pass a five-stage verification pipeline.</p>
    </div>

    <div class="verify-layout">

      <!-- Left: Upload + Verification Pipeline -->
      <div style="display:flex;flex-direction:column;gap:var(--space-4);">

        <!-- Upload -->
        <div class="card" id="dec-upload-card">
          <div class="card-header">
            <div class="card-title">Load Encrypted Package</div>
            <div class="card-subtitle">Accept a .cvp or any encrypted file</div>
          </div>
          <div class="card-body">
            <div class="upload-zone" id="dec-dropzone" tabindex="0">
              <div class="upload-zone-icon">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div class="upload-zone-title">Drop encrypted package or click to browse</div>
              <div class="upload-zone-sub">Supported: .cvp, .enc, or any encrypted file</div>
            </div>
            <input type="file" id="dec-file-input" style="display:none;">
          </div>
          <div class="card-footer" id="dec-file-footer" style="display:none;">
            <!-- filled when file selected -->
          </div>
        </div>

        <!-- Verification Pipeline -->
        <div class="card" id="dec-pipeline-card">
          <div class="card-header">
            <div>
              <div class="card-title">Verification Pipeline</div>
              <div class="card-subtitle" id="dec-pipeline-subtitle">Upload a package to begin verification</div>
            </div>
            <span class="badge badge-neutral" id="dec-pipeline-badge">Awaiting Input</span>
          </div>
          <div class="card-body">
            <div class="verify-pipeline" id="dec-pipeline">
              ${VERIFY_STEPS.map((step, i) => `
                <div class="pipeline-step" id="pstep-${step.id}">
                  <div class="pipeline-step-indicator">
                    <div class="pipeline-dot pending" id="pdot-${step.id}">
                      <span id="pdot-icon-${step.id}">${i + 1}</span>
                    </div>
                    ${i < VERIFY_STEPS.length - 1 ? `<div class="pipeline-connector" id="pconn-${step.id}"></div>` : ''}
                  </div>
                  <div class="pipeline-step-content">
                    <div class="pipeline-step-title">${step.title}</div>
                    <div class="pipeline-step-desc">${step.desc}</div>
                    <div class="pipeline-step-time" id="ptime-${step.id}" style="display:none;"></div>
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- Failure Panel (hidden by default) -->
            <div class="integrity-fail-panel" id="dec-fail-panel" style="display:none;margin-top:var(--space-4);">
              <div class="integrity-fail-title">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="display:inline;vertical-align:middle;margin-right:6px;"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                Integrity Check Failed
              </div>
              <p class="integrity-fail-msg">Decryption has been blocked because the package could not be authenticated. The file may have been tampered with, corrupted, or the passphrase is incorrect.</p>
              <div style="margin-top:var(--space-4);display:flex;gap:var(--space-3);">
                <button class="btn btn-danger btn-sm" onclick="resetDecrypt()">Clear &amp; Try Again</button>
                <a href="#activity" class="btn btn-ghost btn-sm" onclick="navigate('activity',null);return false;">View Security Log →</a>
              </div>
            </div>

            <!-- Success Panel -->
            <div class="alert-strip success" id="dec-success-panel" style="display:none;margin-top:var(--space-4);">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              <span>All verification checks passed. Decryption is authorised.</span>
            </div>
          </div>
          <div class="card-footer" id="dec-pipeline-footer" style="display:none;">
            <!-- Actions after pipeline -->
          </div>
        </div>
      </div>

      <!-- Right Panel -->
      <div style="display:flex;flex-direction:column;gap:var(--space-4);">

        <!-- Passphrase -->
        <div class="card" id="dec-pass-card">
          <div class="card-header">
            <div class="card-title">Decryption Passphrase</div>
          </div>
          <div class="card-body" style="display:flex;flex-direction:column;gap:var(--space-3);">
            <div class="form-group">
              <label class="form-label" for="dec-passphrase">Passphrase</label>
              <div style="position:relative;">
                <input class="form-control" type="password" id="dec-passphrase" placeholder="Enter the decryption passphrase" style="padding-right:44px;">
                <button type="button" class="btn btn-ghost btn-icon" onclick="togglePassphrase('dec-passphrase')" style="position:absolute;right:4px;top:1px;height:34px;color:var(--color-text-secondary);">
                  <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
              <span class="form-hint">Required to authenticate and decrypt the package</span>
            </div>

            <div class="form-group">
              <label class="form-label" for="dec-simulate">Simulate Outcome</label>
              <select class="form-control" id="dec-simulate">
                <option value="success">✓ Successful Verification</option>
                <option value="fail-integrity">✕ Integrity Check Failure</option>
                <option value="fail-auth">✕ Authentication Failure</option>
              </select>
              <span class="form-hint">For demonstration purposes</span>
            </div>

            <button class="btn btn-primary w-full" id="dec-verify-btn" onclick="startVerification()" disabled>
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
              Begin Verification
            </button>
          </div>
        </div>

        <!-- Package Info -->
        <div class="card" id="dec-pkg-info" style="display:none;">
          <div class="card-header">
            <div class="card-title">Package Information</div>
          </div>
          <div class="card-body" id="dec-pkg-body" style="display:flex;flex-direction:column;gap:var(--space-3);">
            <!-- filled when file selected -->
          </div>
        </div>

        <!-- Verification Guidance -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">Verification Protocol</div>
          </div>
          <div class="card-body" style="font-size:var(--text-md);color:var(--color-text-secondary);line-height:var(--leading-loose);">
            <p>CRYPTOVA enforces a <strong style="color:var(--color-text-primary);">five-stage verification pipeline</strong> before any decryption is permitted.</p>
            <br>
            <p>If any stage fails, decryption is <strong style="color:var(--color-danger);">immediately blocked</strong> and the event is recorded in the audit log. The file content is never accessed.</p>
            <br>
            <p style="color:var(--color-text-tertiary);font-size:var(--text-sm);">All verification operations run locally in your browser. Your passphrase and file contents are never transmitted.</p>
          </div>
        </div>
      </div>
    </div>
  `;

  // Bind file input
  const dropzone = document.getElementById('dec-dropzone');
  const fileInput = document.getElementById('dec-file-input');

  dropzone.addEventListener('click', () => fileInput.click());
  dropzone.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') fileInput.click(); });
  dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('drag-over'); });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));
  dropzone.addEventListener('drop', e => {
    e.preventDefault();
    dropzone.classList.remove('drag-over');
    const f = e.dataTransfer.files[0];
    if (f) handleDecryptFile(f);
  });
  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) handleDecryptFile(fileInput.files[0]);
  });
}

function handleDecryptFile(file) {
  decryptState.file = file;

  // Show file in footer
  const footer = document.getElementById('dec-file-footer');
  if (footer) {
    footer.style.display = '';
    const ext = file.name.split('.').pop().toUpperCase() || 'BIN';
    footer.innerHTML = `
      <div class="file-info-panel" style="flex:1;">
        <div class="file-type-icon">${ext.slice(0,4)}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:var(--text-md);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${file.name}</div>
          <div style="font-size:var(--text-sm);color:var(--color-text-secondary);margin-top:2px;">${formatSize(file.size)}</div>
        </div>
        <button class="btn btn-ghost btn-icon btn-sm" onclick="resetDecrypt()" title="Remove" style="color:var(--color-text-secondary);">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    `;
  }

  // Enable verify button
  const btn = document.getElementById('dec-verify-btn');
  if (btn) btn.disabled = false;

  // Show package info
  const pkgInfo = document.getElementById('dec-pkg-info');
  const pkgBody = document.getElementById('dec-pkg-body');
  if (pkgInfo) pkgInfo.style.display = '';
  if (pkgBody) {
    const fakePackageId = 'CVP-' + Math.random().toString(36).slice(2,10).toUpperCase();
    const fakeHmac = Array.from({length:8}, () => Math.floor(Math.random()*256).toString(16).padStart(2,'0')).join('') + '…';
    pkgBody.innerHTML = `
      ${[
        { label: 'Filename', value: file.name },
        { label: 'Package Size', value: formatSize(file.size) },
        { label: 'Package ID', value: fakePackageId, mono: true },
        { label: 'Algorithm', value: 'AES-256-GCM', mono: true },
        { label: 'HMAC Signature', value: fakeHmac, mono: true },
        { label: 'Created', value: formatDate(new Date(file.lastModified)) },
      ].map(r => `
        <div class="flex items-center justify-between" style="font-size:var(--text-sm);">
          <span class="text-secondary">${r.label}</span>
          <span class="${r.mono ? 'text-mono' : ''} weight-medium">${r.value}</span>
        </div>
      `).join('')}
    `;
  }

  // Reset pipeline to pending
  resetPipelineVisuals();
}

function resetPipelineVisuals() {
  VERIFY_STEPS.forEach((step, i) => {
    const dot = document.getElementById('pdot-' + step.id);
    const icon = document.getElementById('pdot-icon-' + step.id);
    const time = document.getElementById('ptime-' + step.id);
    if (dot) { dot.className = 'pipeline-dot pending'; }
    if (icon) icon.textContent = i + 1;
    if (time) time.style.display = 'none';

    if (i < VERIFY_STEPS.length - 1) {
      const conn = document.getElementById('pconn-' + step.id);
      if (conn) { conn.className = 'pipeline-connector'; }
    }
  });

  const badge = document.getElementById('dec-pipeline-badge');
  if (badge) { badge.className = 'badge badge-neutral'; badge.textContent = 'Awaiting Input'; }

  const sub = document.getElementById('dec-pipeline-subtitle');
  if (sub) sub.textContent = 'Ready to begin verification';

  document.getElementById('dec-fail-panel')?.style && (document.getElementById('dec-fail-panel').style.display = 'none');
  document.getElementById('dec-success-panel')?.style && (document.getElementById('dec-success-panel').style.display = 'none');
  document.getElementById('dec-pipeline-footer').style.display = 'none';
  decryptState.mode = 'idle';
}

function startVerification() {
  if (!decryptState.file) { showToast('No package selected.', 'error'); return; }
  if (decryptState.verifying) return;

  const pass = document.getElementById('dec-passphrase')?.value || '';
  if (!pass) { showToast('Enter the decryption passphrase.', 'error'); return; }

  const simMode = document.getElementById('dec-simulate')?.value || 'success';

  decryptState.verifying = true;
  decryptState.mode = 'running';

  const verifyBtn = document.getElementById('dec-verify-btn');
  if (verifyBtn) { verifyBtn.disabled = true; verifyBtn.textContent = 'Verifying…'; }

  const badge = document.getElementById('dec-pipeline-badge');
  if (badge) { badge.className = 'badge badge-info'; badge.textContent = 'Verifying'; }

  const sub = document.getElementById('dec-pipeline-subtitle');
  if (sub) sub.textContent = 'Verification in progress…';

  // Determine fail step
  let failStep = null;
  if (simMode === 'fail-integrity') failStep = 'integrity';
  if (simMode === 'fail-auth') failStep = 'auth';

  let si = 0;
  function runStep() {
    if (si >= VERIFY_STEPS.length) return;

    const step = VERIFY_STEPS[si];
    const isLastBeforeFail = failStep && step.id === failStep;

    // Mark current step as running
    const dot  = document.getElementById('pdot-' + step.id);
    const icon = document.getElementById('pdot-icon-' + step.id);
    if (dot)  dot.className = 'pipeline-dot running';
    if (icon) icon.innerHTML = `<svg width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" style="animation:spin 0.8s linear infinite;"><path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" stroke-dasharray="56" stroke-dashoffset="14"/></svg>`;

    const delay = [400, 700, 900, 1100, 500][si] || 600;

    setTimeout(() => {
      const time = document.getElementById('ptime-' + step.id);
      if (time) { time.style.display = ''; time.textContent = formatTime(new Date()); }

      if (isLastBeforeFail) {
        // Mark as failed
        if (dot)  dot.className = 'pipeline-dot failed';
        if (icon) icon.innerHTML = `<svg width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
        // Show fail panel
        finishVerification(false, step.id);
        return;
      }

      // Mark step as success
      if (dot)  dot.className = 'pipeline-dot success';
      if (icon) icon.innerHTML = `<svg width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`;

      // Fill connector
      if (si < VERIFY_STEPS.length - 1) {
        const conn = document.getElementById('pconn-' + step.id);
        if (conn) conn.className = 'pipeline-connector filled';
      }

      si++;
      if (si >= VERIFY_STEPS.length) {
        finishVerification(true, null);
      } else {
        setTimeout(runStep, 200);
      }
    }, delay);
  }

  runStep();
}

function finishVerification(success, failedAt) {
  decryptState.verifying = false;
  decryptState.mode = success ? 'success' : 'failed';

  const badge = document.getElementById('dec-pipeline-badge');
  const sub   = document.getElementById('dec-pipeline-subtitle');
  const footer = document.getElementById('dec-pipeline-footer');
  const verifyBtn = document.getElementById('dec-verify-btn');

  if (success) {
    if (badge) { badge.className = 'badge badge-success'; badge.textContent = 'Verified'; }
    if (sub)   sub.textContent = 'All checks passed — decryption authorised';

    document.getElementById('dec-success-panel').style.display = '';

    if (footer) {
      footer.style.display = '';
      footer.innerHTML = `
        <button class="btn btn-primary" onclick="showToast('File decrypted and saved.', 'success');logActivity('File Decrypted', '${decryptState.file?.name || 'package'}', 'success', 'AES-256-GCM');">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>
          Decrypt File
        </button>
        <button class="btn btn-secondary" onclick="resetDecrypt()">Verify Another</button>
      `;
    }
    showToast('Package verified successfully.', 'success');
    logActivity('Integrity Verified', decryptState.file?.name || 'package', 'success', 'HMAC-SHA-256');
  } else {
    if (badge) { badge.className = 'badge badge-danger'; badge.textContent = 'Failed'; }
    if (sub)   sub.textContent = `Verification failed at: ${failedAt}`;

    document.getElementById('dec-fail-panel').style.display = '';

    if (footer) {
      footer.style.display = '';
      footer.innerHTML = `<button class="btn btn-secondary" onclick="resetDecrypt()">Clear &amp; Try Again</button>`;
    }
    showToast('Integrity check failed. Decryption blocked.', 'error', 5000);
    logActivity('Decrypt Blocked', decryptState.file?.name || 'package', 'danger', 'HMAC-SHA-256');
  }

  if (verifyBtn) {
    verifyBtn.disabled = true;
    verifyBtn.textContent = success ? '✓ Verified' : '✕ Failed';
  }
}

function resetDecrypt() {
  decryptState = { file: null, verifying: false, mode: 'idle' };
  // Re-render the page
  const container = document.getElementById('page-content');
  if (container) renderDecrypt(container);
}

// Spin keyframe (inject once)
if (!document.getElementById('spin-kf')) {
  const style = document.createElement('style');
  style.id = 'spin-kf';
  style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
  document.head.appendChild(style);
}
