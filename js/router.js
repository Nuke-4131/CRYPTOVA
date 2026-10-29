/* ============================================================
   CRYPTOVA — Hash Router
   ============================================================ */

// Page registry
const PAGE_REGISTRY = {
  overview: { title: 'Overview',        label: 'Overview',        render: renderOverview  },
  encrypt:  { title: 'Encrypt',         label: 'Encrypt',         render: renderEncrypt   },
  decrypt:  { title: 'Decrypt & Verify',label: 'Decrypt & Verify',render: renderDecrypt   },
  vault:    { title: 'Vault',           label: 'Vault',           render: renderVault     },
  activity: { title: 'Activity',        label: 'Activity',        render: renderActivity  },
  settings: { title: 'Settings',        label: 'Settings',        render: renderSettings  },
};

let currentPage = null;

function navigate(page, linkEl) {
  // Update URL hash without triggering hashchange loop
  history.replaceState(null, '', '#' + page);

  // Update active nav item
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  if (linkEl) linkEl.classList.add('active');
  else {
    const el = document.getElementById('nav-' + page);
    if (el) el.classList.add('active');
  }

  // Update breadcrumb
  const meta = PAGE_REGISTRY[page];
  if (meta) {
    const bc = document.getElementById('breadcrumb-current');
    if (bc) bc.textContent = meta.label;
    document.title = 'CRYPTOVA — ' + meta.title;
  }

  // Render page
  const container = document.getElementById('page-content');
  if (!container) return;

  if (currentPage === page) return;
  currentPage = page;

  // Clear and render
  container.innerHTML = '';
  if (meta && typeof meta.render === 'function') {
    meta.render(container);
    container.classList.remove('page-enter');
    void container.offsetWidth; // reflow
    container.classList.add('page-enter');
  }
}

// Toast utility
function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = {
    success: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`,
    error:   `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    info:    `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  };

  const colorMap = { success: 'var(--color-success)', error: 'var(--color-danger)', info: 'var(--color-accent)' };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.style.color = colorMap[type] || colorMap.info;
  toast.innerHTML = `${icons[type] || icons.info}<span style="color:var(--color-text-primary);flex:1;">${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.2s';
    setTimeout(() => toast.remove(), 200);
  }, duration);
}

// Format file size
function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Format timestamp
function formatTime(date) {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

function formatDate(date) {
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// SVG icon helper
function icon(d, w = 14, h = 14) {
  return `<svg width="${w}" height="${h}" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">${d}</svg>`;
}

// Init on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const hash = window.location.hash.replace('#', '') || 'overview';
  navigate(hash.split('?')[0]);
});

window.addEventListener('hashchange', () => {
  const hash = window.location.hash.replace('#', '') || 'overview';
  const page = hash.split('?')[0];
  navigate(page);
});
