import { useEffect, useMemo, useRef, useState } from 'react';
import { Routes, Route, Navigate, useLocation, Link, useNavigate } from 'react-router-dom';
import { Activity, ArrowRight, Bell, CheckCheck, CheckCircle2, ChevronDown, Download, FileUp, FolderLock, LayoutGrid, Lock, Search, Settings, Shield, ShieldAlert, ShieldCheck, SlidersHorizontal, Sparkles, UserRound } from 'lucide-react';
import './styles/global.css';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { navItems, securitySteps } from './data/mockData';
import { encryptFile } from './services/encryptionService';
import { verifyPackage, decryptFile } from './services/verificationService';
import { getVaultFiles, addVaultFile, deleteVaultFile, downloadVaultFile } from './services/vaultService';
import { getActivityLogs, addActivityLog } from './services/activityService';

const iconMap = {
  LayoutGrid,
  Shield,
  CheckCheck,
  FolderLock,
  Activity,
  Settings,
  Search,
  SlidersHorizontal,
  Download,
  FileUp,
  CheckCircle2,
  ChevronDown,
  UserRound,
  Bell,
  ShieldAlert,
  Lock,
  Sparkles,
  ShieldCheck,
  ArrowRight
};

const formatBytes = (bytes) => {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const idx = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / (1024 ** idx);
  return `${value.toFixed(value >= 10 || idx === 0 ? 0 : 1)} ${units[idx]}`;
};

const formatTimestamp = (date) => new Date(date).toLocaleString();
const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

function Toast({ message, onClose }) {
  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(onClose, 3200);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;
  return <div className="toast" role="status"><CheckCircle2 size={16} /><span>{message}</span><button className="toast-close" onClick={onClose} aria-label="Dismiss notification">×</button></div>;
}

function CountUpValue({ value }) {
  const match = String(value).match(/^(\d+(?:\.\d+)?)(.*)$/);
  const target = match ? Number(match[1]) : null;
  const suffix = match ? match[2] : '';
  const [current, setCurrent] = useState(target || 0);

  useEffect(() => {
    if (target === null) return undefined;
    let frame;
    const started = performance.now();
    const animate = (now) => {
      const progress = Math.min((now - started) / 520, 1);
      setCurrent(target * (1 - ((1 - progress) ** 3)));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return <>{target === null ? value : `${target % 1 ? current.toFixed(1) : Math.round(current)}${suffix}`}</>;
}

function App() {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const pathname = location.pathname;

  const showShell = pathname !== '/login';

  return (
    <div className={`app-shell ${showShell ? '' : 'public-shell'}`}>
      {showShell && (
        <Sidebar pathname={pathname} user={user} />
      )}
      <div className="main-panel">
        {showShell && <Header pathname={pathname} user={user} />}
        <main className="content">
          <Routes>
            <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
            <Route path="/login" element={<GoogleLoginPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/encrypt" element={<ProtectedRoute><EncryptPage /></ProtectedRoute>} />
            <Route path="/decrypt" element={<ProtectedRoute><DecryptPage /></ProtectedRoute>} />
            <Route path="/vault" element={<ProtectedRoute><VaultPage /></ProtectedRoute>} />
            <Route path="/activity" element={<ProtectedRoute><ActivityPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function Sidebar({ pathname }) {
  const current = pathname === '/' ? null : pathname.replace('/', '');

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark" aria-hidden="true" />
        <div className="brand-copy">
          <strong>CRYPTOVA</strong>
          <span>Secure Data Platform</span>
        </div>
      </div>

      <nav className="nav" aria-label="Sidebar navigation">
        {navItems.map((item) => {
          const Icon = iconMap[item.icon];
          const active = current === item.path.replace('/', '');
          return (
            <Link key={item.path} to={item.path} className={`nav-item ${active ? 'active' : ''}`}>
              <Icon size={16} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="security-status">
          <span className="status-dot" aria-hidden="true" />
          <span>System Operational</span>
        </div>
      </div>
    </aside>
  );
}

function Header({ pathname, user }) {
  const navigate = useNavigate();
  const [showProtectionMenu, setShowProtectionMenu] = useState(false);
  const titleMap = {
    '/dashboard': 'Security Overview',
    '/encrypt': 'Encrypt Data',
    '/decrypt': 'Decrypt & Verify',
    '/vault': 'Secure Vault',
    '/activity': 'Security Activity',
    '/settings': 'Settings'
  };

  const currentTitle = titleMap[pathname] || 'CRYPTOVA';

  return (
    <header className="topbar">
      <div className="page-title">{currentTitle}</div>
      <div className="topbar-actions">
        <div className="protection-menu-wrap">
          <button className="button primary new-protection-button" onClick={() => setShowProtectionMenu((visible) => !visible)} aria-expanded={showProtectionMenu}>
            <Shield size={15} /> New Protection <ChevronDown size={14} />
          </button>
          {showProtectionMenu && (
            <div className="protection-menu">
              <button onClick={() => { setShowProtectionMenu(false); navigate('/encrypt'); }}>
                <Shield size={15} /><span><strong>Protect a File</strong><small>Encrypt a new file</small></span>
              </button>
              <button onClick={() => { setShowProtectionMenu(false); navigate('/decrypt'); }}>
                <CheckCheck size={15} /><span><strong>Verify a Package</strong><small>Check integrity before decryption</small></span>
              </button>
            </div>
          )}
        </div>
        <div className="system-pill">
          <span className="status-dot" aria-hidden="true" />
          System Status
        </div>
        <div className="user-menu">
          <div className="avatar">{(user?.displayName || 'AJ').slice(0, 2).toUpperCase()}</div>
          <div className="user-meta">
            <strong>{user?.displayName || 'Admin User'}</strong>
            <span>{user?.email || 'Security Admin'}</span>
            </div>
            <ChevronDown size={16} color="#667085" />
        </div>
      </div>
    </header>
  );
}

function GoogleLoginPage() {
  const { loginWithGoogle, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const googleButton = useRef(null);
  const [error, setError] = useState('');
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!clientId) {
      setError('Google sign-in is not configured. Add VITE_GOOGLE_CLIENT_ID to the frontend environment.');
      return undefined;
    }

    let attempts = 0;
    const renderGoogleButton = () => {
      if (!window.google?.accounts?.id || !googleButton.current) {
        attempts += 1;
        if (attempts < 20) window.setTimeout(renderGoogleButton, 250);
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          try {
            const payload = JSON.parse(window.atob(response.credential.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
            await loginWithGoogle({
              userId: payload.sub,
              displayName: payload.name,
              email: payload.email
            });
            navigate('/dashboard', { replace: true });
          } catch {
            setError('Google sign-in could not be completed. Please try again.');
          }
        }
      });
      window.google.accounts.id.renderButton(googleButton.current, {
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        width: 360
      });
    };

    renderGoogleButton();
    return undefined;
  }, [clientId, loginWithGoogle, navigate]);

  return (
    <div className="landing-page auth-page">
      <section className="hero auth-box google-login-box">
        <div className="google-mark" aria-hidden="true">G</div>
        <div className="eyebrow">CRYPTOVA</div>
        <h1>
          Welcome to CRYPTOVA
          <span className="muted">Sign in with your Google account to continue.</span>
        </h1>
        <p>Your Google account keeps access simple and secure. No separate CRYPTOVA password is needed.</p>
        {error ? <div className="error-banner">{error}</div> : <div className="google-button" ref={googleButton} />}
        <span className="subtext">Google will show the accounts available in your browser.</span>
      </section>
    </div>
  );
}

function DashboardPage() {
  const [metrics, setMetrics] = useState([
    { label: 'Protected Files', value: '24' },
    { label: 'Encrypted Storage', value: '1.8 GB' },
    { label: 'Integrity Checks', value: '42' },
    { label: 'Security Events', value: '3' }
  ]);
  const [recent, setRecent] = useState([]);
  const [recentFiles, setRecentFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTour, setShowTour] = useState(() => localStorage.getItem('cryptova-tour-dismissed') !== 'true');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const logs = await getActivityLogs();
      const files = await getVaultFiles();
      setRecent(logs.slice(0, 3));
      setRecentFiles(files.slice(0, 5));
      const summary = {
        'Protected Files': '24',
        'Encrypted Storage': '1.8 GB',
        'Integrity Checks': '42',
        'Security Events': String(logs.filter((item) => item.status === 'Failed' || item.status === 'Warning').length || 3)
      };
      setMetrics(Object.entries(summary).map(([label, value]) => ({ label, value })));
      setLoading(false);
    };
    load();
  }, []);

  const cards = useMemo(
    () => [
      { label: 'Protected Files', action: '/vault' },
      { label: 'Encrypted Storage', action: '/encrypt' },
      { label: 'Integrity Checks', action: '/decrypt' },
      { label: 'Security Events', action: '/activity' }
    ],
    []
  );

  return (
    <div className="page-shell">
      <div className="page-header action-row-between">
        <div>
          <h2>Security Overview</h2>
          <p>Choose an action to protect, verify or manage your files.</p>
        </div>
      </div>

      <section className="command-center" aria-labelledby="command-center-title">
        <div className="command-center-heading">
          <div>
            <span className="panel-kicker">COMMAND CENTER</span>
            <h3 id="command-center-title">What do you want to do?</h3>
          </div>
          <button className="button compact-button" onClick={() => window.location.reload()}>Refresh data</button>
        </div>
        {showTour && <div className="walkthrough-hint" role="note"><strong>Start here</strong><span>Protect a new file or check a package from these two actions.</span><button className="text-button" onClick={() => { localStorage.setItem('cryptova-tour-dismissed', 'true'); setShowTour(false); }}>Dismiss</button></div>}
        <div className="command-actions">
          <button className="command-action primary-action" onClick={() => navigate('/encrypt')}>
            <span className="command-action-icon"><Shield size={19} /></span>
            <span><strong>Encrypt File</strong><small>Protect a file with authenticated encryption</small></span>
            <ArrowRight size={17} />
          </button>
          <button className="command-action secondary-action" onClick={() => navigate('/decrypt')}>
            <span className="command-action-icon"><CheckCheck size={19} /></span>
            <span><strong>Verify / Decrypt</strong><small>Check integrity before recovering a file</small></span>
            <ArrowRight size={17} />
          </button>
        </div>
        <div className="secondary-actions">
          <button className="button" onClick={() => navigate('/vault')}><FolderLock size={15} /> Open Vault</button>
          <button className="button" onClick={() => navigate('/activity')}><Activity size={15} /> View Activity</button>
        </div>
      </section>

      <div className="metric-grid">
        {metrics.map((item) => {
          const action = cards.find((card) => card.label === item.label)?.action;
          return (
            <button key={item.label} className="metric-panel metric-button" onClick={action ? () => navigate(action) : undefined}>
              <div className="metric-label">{item.label}</div>
              <div className="metric-value"><CountUpValue value={item.value} /></div>
            </button>
          );
        })}
      </div>

      <div className="grid-two">
        <div className="section-card">
          <div className="section-header">
            <div className="section-title">Security Posture</div>
          </div>
          <div className="status-list">
            {[
              { label: 'Encryption', value: 'AES-256-GCM', status: 'Operational' },
              { label: 'Integrity Verification', value: 'Enabled', status: 'Operational' },
              { label: 'Secure Vault', value: 'Protected', status: 'Operational' },
              { label: 'Activity Logging', value: 'Enabled', status: 'Operational' }
            ].map((item) => (
              <div key={item.label} className="status-row">
                <div>
                  <div className="status-label">{item.label}</div>
                  <div className="subtext">{item.value}</div>
                </div>
                <div className="status-block">
                  <span className="status-dot" aria-hidden="true" />
                  {item.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="section-card">
          <div className="section-header">
            <div className="section-title">Recent Activity</div>
          </div>
          <div className="data-table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Event</th>
                  <th>File</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((item) => (
                  <tr key={`${item.timestamp}-${item.resource}`}>
                    <td>{item.timestamp}</td>
                    <td>{item.event}</td>
                    <td>{item.resource}</td>
                    <td>
                      <span className={`status-badge ${item.status === 'Failed' || item.status === 'Warning' ? 'danger' : 'success'}`}>
                        <span className="status-dot" aria-hidden="true" /> {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <section className="section-card recent-files-section">
        <div className="section-header">
          <div>
            <div className="section-title">Recent Protected Files</div>
            <div className="subtext">Open or verify your latest protected files without leaving the dashboard.</div>
          </div>
          <button className="button" onClick={() => navigate('/vault')}>Open Vault</button>
        </div>
        {recentFiles.length ? (
          <div className="recent-file-list">
            {recentFiles.map((file) => (
              <div className="recent-file-row" key={file.id || `${file.name}-${file.created}`}>
                <div className="recent-file-name"><FolderLock size={16} /><strong>{file.name}</strong><span className="status-badge success"><span className="status-dot" />Protected</span></div>
                <div className="inline-actions">
                  <button className="tiny-btn" onClick={() => navigate('/decrypt')}>Verify</button>
                  <button className="tiny-btn" onClick={() => navigate('/vault')}>Open</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state compact-empty"><h3>Welcome to CRYPTOVA</h3><p>Protect your first file in a few seconds.</p><button className="button primary" onClick={() => navigate('/encrypt')}>Encrypt Your First File</button></div>
        )}
      </section>
    </div>
  );
}

function EncryptPage() {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [processingStage, setProcessingStage] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [toast, setToast] = useState('');
  const navigate = useNavigate();

  const handleFile = (selected) => {
    setFile(selected);
    setError('');
    setResult(null);
  };

  const handleEncrypt = async () => {
    if (!file) {
      setError('Select a file before encrypting.');
      return;
    }

    try {
      setProcessing(true);
      setError('');
      setProcessingStage('Reading file');
      await wait(300);
      setProcessingStage('Encrypting');
      const encrypted = await encryptFile(file, password);
      setProcessingStage('Finalizing');
      await wait(300);
      setResult(encrypted);
      await addActivityLog({
        event: 'File encrypted',
        resource: file.name,
        status: 'Successful',
        user: 'Admin User',
        details: 'Protected using authenticated encryption'
      });
      await addVaultFile({
        name: encrypted.encryptedFileName,
        type: file.name.split('.').pop()?.toUpperCase() || 'FILE',
        size: formatBytes(file.size),
        encryption: 'AES-256-GCM',
        integrity: 'Verified',
        created: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        content: await encrypted.blob.text(),
        contentType: encrypted.blob.type
      });
      setToast('File protected and saved to Vault.');
    } catch (err) {
      setError(err.message || 'Encryption failed.');
    } finally {
      setProcessing(false);
      setProcessingStage('');
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = result.blob;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.encryptedFileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetState = () => {
    setFile(null);
    setResult(null);
    setError('');
    setPassword('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <h2>Encrypt Data</h2>
        <p>Protect sensitive files using authenticated encryption.</p>
      </div>

      <div className="workspace-grid">
        <section className="section-card">
          <div className="section-header">
            <div className="section-title">Select a file to protect</div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            id="encrypt-upload"
            style={{ display: 'none' }}
            onChange={(event) => handleFile(event.target.files?.[0] || null)}
          />

          <div className={`upload-box ${dragActive ? 'drag-active' : ''} ${file ? 'file-landed' : ''}`} onClick={() => fileInputRef.current?.click()} onDragOver={(event) => { event.preventDefault(); setDragActive(true); }} onDragLeave={() => setDragActive(false)} onDrop={(event) => { event.preventDefault(); setDragActive(false); handleFile(event.dataTransfer.files?.[0] || null); }}>
            <FileUp size={24} />
            <strong>{file ? 'Selected file ready for protection' : 'Drag and drop a file here'}</strong>
            <span>{file ? file.name : 'or browse from your device'}</span>
            <button type="button" className="button primary">Browse files</button>
          </div>

          {file && (
            <div className="file-meta metadata-reveal">
              <div className="meta-item">
                <span>File name</span>
                <strong>{file.name}</strong>
              </div>
              <div className="meta-item">
                <span>File type</span>
                <strong>{file.type || 'Unknown'}</strong>
              </div>
              <div className="meta-item">
                <span>File size</span>
                <strong>{formatBytes(file.size)}</strong>
              </div>
            </div>
          )}
        </section>

        <aside className="section-card">
          <div className="section-header">
            <div className="section-title">Protection Configuration</div>
          </div>
          <div className="config-box">
            <div className="config-row"><strong>Encryption</strong><span>AES-256-GCM</span></div>
            <div className="config-row"><strong>Authentication</strong><span>Authenticated Encryption</span></div>
            <div className="config-row"><strong>Integrity Verification</strong><span>Enabled</span></div>
            <div className="config-row"><strong>Key Protection</strong><span>Password-derived key</span></div>
          </div>

          <label className="field-label">Protection password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Used only in this browser session" /></label>
          <div className="info-banner">Prototype note: this local password-derived key is for demonstration. Production key management belongs in a dedicated KMS/backend service.</div>

          {error && <div className="error-banner">{error}</div>}

          <div className="actions-row">
            <button className="button primary" onClick={handleEncrypt} disabled={!file || !password || processing}>
              {processing ? 'Encrypting...' : 'Encrypt File'}
            </button>
            <button className="button" onClick={resetState} disabled={!file && !result}>Reset</button>
          </div>

          {processing && (
            <div className="progress-box">
              <div className="subtext">{processingStage} protected package…</div>
              <div className="progress-track"><div className={`progress-bar progress-${processingStage.toLowerCase()}`} /></div>
              <div className="process-steps"><span className={processingStage === 'Reading file' ? 'current' : processingStage ? 'done' : ''}>Reading file</span><span className={processingStage === 'Encrypting' ? 'current' : processingStage === 'Finalizing' ? 'done' : ''}>Encrypting</span><span className={processingStage === 'Finalizing' ? 'current' : ''}>Finalizing</span></div>
            </div>
          )}

          {result && (
            <>
              <div className="success-banner">
                <CheckCircle2 size={18} />
                <span>File Protected</span>
              </div>
              <div className="actions-row">
                <button className="button primary" onClick={handleDownload}>Download</button>
                <button className="button" onClick={() => navigate('/vault')}>View in Vault</button>
              </div>
            </>
          )}
        </aside>
      </div>
      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  );
}

function DecryptPage() {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [verification, setVerification] = useState(null);
  const [decryptResult, setDecryptResult] = useState(null);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [processingStage, setProcessingStage] = useState('');

  const handlePackageSelection = async (selectedFile) => {
    setFile(selectedFile);
    setVerification(null);
    setDecryptResult(null);
    setError('');
    if (!selectedFile) return;

    try {
      setProcessing(true);
      setProcessingStage('Checking file format');
      await wait(250);
      setProcessingStage('Verifying integrity');
      const result = await verifyPackage(selectedFile, password);
      setProcessingStage('Confirming authenticity');
      await wait(250);
      setVerification(result);
      await addActivityLog({
        event: result.ok ? 'Package verified' : 'Integrity verification failed',
        resource: selectedFile.name,
        status: result.ok ? 'Verified' : 'Failed',
        user: 'Admin User',
        details: result.message
      });
    } catch (err) {
      setError(err.message || 'Unable to verify package.');
    } finally {
      setProcessing(false);
      setProcessingStage('');
    }
  };

  useEffect(() => {
    if (file && password) handlePackageSelection(file);
  }, [password]);

  const resetState = () => {
    setFile(null);
    setVerification(null);
    setDecryptResult(null);
    setError('');
    setPassword('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleVerify = async () => {
    if (!file) {
      setError('Select a protected package before verification.');
      return;
    }

    try {
      setProcessing(true);
      setError('');
      setProcessingStage('Checking file format');
      await wait(250);
      setProcessingStage('Verifying integrity');
      const result = await verifyPackage(file, password);
      setProcessingStage('Confirming authenticity');
      setVerification(result);
      if (!result.ok) {
        setDecryptResult(null);
      }
    } catch (err) {
      setError(err.message || 'Unable to verify package.');
    } finally {
      setProcessing(false);
      setProcessingStage('');
    }
  };

  const handleDecrypt = async () => {
    if (!file || !verification?.ok) {
      setError('The package must be verified successfully before decryption is allowed.');
      return;
    }

    try {
      setProcessing(true);
      setError('');
      const result = await decryptFile(file, password, verification);
      setDecryptResult(result);
      await addActivityLog({
        event: 'File decrypted',
        resource: file.name,
        status: 'Successful',
        user: 'Admin User',
        details: 'Decryption completed after integrity verification'
      });
    } catch (err) {
      setError(err.message || 'Decryption failed.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!decryptResult) return;
    const blob = decryptResult.blob;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = decryptResult.decryptedFileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <h2>Decrypt &amp; Verify</h2>
        <p>Verify the authenticity and integrity of a protected package before decryption.</p>
      </div>

      <section className="section-card">
        <div className="workspace-grid">
          <div>
            <div className="section-header">
              <div className="section-title">Protected package</div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              style={{ display: 'none' }}
              onChange={(event) => handlePackageSelection(event.target.files?.[0] || null)}
            />

            <div className="upload-box" onClick={() => fileInputRef.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); handlePackageSelection(event.dataTransfer.files?.[0] || null); }}>
              <FileUp size={24} />
              <strong>{file ? 'Protected package selected' : 'Select encrypted package'}</strong>
              <span>{file ? file.name : 'Upload package to verify and decrypt'}</span>
              <button className="button primary" type="button">Browse package</button>
            </div>

            {file && (
              <div className="file-meta">
                <div className="meta-item"><span>Package</span><strong>{file.name}</strong></div>
                <div className="meta-item"><span>Type</span><strong>{file.type || 'Encrypted'}</strong></div>
                <div className="meta-item"><span>Size</span><strong>{formatBytes(file.size)}</strong></div>
              </div>
            )}
            <label className="field-label">Protection password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter the password used to protect this package" /></label>
          </div>

          <div className="config-box">
            <div className="actions-row">
              <button className="button primary" onClick={handleVerify} disabled={!file || !password || processing}>
                {processing ? `${processingStage}…` : verification ? 'Verify Again' : 'Verify Package'}
              </button>
              <button className="button" onClick={resetState}>Reset</button>
            </div>

            {error && <div className="error-banner">{error}</div>}

            {verification && (
              <div className={verification.ok ? 'success-banner' : 'failure-banner'}>
                {verification.ok ? <><CheckCircle2 size={18} /> <span>Package Verified: format, authentication, and integrity passed.</span></> : <><ShieldAlert size={18} /> <span>{verification.status}: {verification.message}</span></>}
              </div>
            )}

            <div className="actions-row">
              <button className="button primary" onClick={handleDecrypt} disabled={!file || !verification?.ok || processing}>Decrypt</button>
              {decryptResult && <button className="button" onClick={handleDownload}>Download</button>}
            </div>
          </div>
        </div>

        <div className="stepper">
          {securitySteps.map((step, index) => {
            const isFailed = verification && !verification.ok && index === 3;
            const isCurrent = index === 3 && verification && verification.ok;
            return (
              <div key={step.label} className={`step ${isFailed ? 'fail' : isCurrent ? 'current' : index < 3 || verification?.ok ? 'success' : ''}`}>
                <div className="step-number">{index + 1}</div>
                <h4>{step.label}</h4>
                <p>{step.description}</p>
                <div className="step-state">
                  {isFailed ? 'Integrity Verification Failed' : verification?.ok && index >= 0 ? 'Verified' : step.state}
                </div>
              </div>
            );
          })}
        </div>

        {verification && !verification.ok && (
          <div className="failure-banner">
            <h3>Integrity Check Failed</h3>
            <p>{verification.message}</p>
          </div>
        )}
      </section>
    </div>
  );
}

function VaultPage() {
  const [vaultFiles, setVaultFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [selectedFile, setSelectedFile] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getVaultFiles();
      setVaultFiles(data);
      setLoading(false);
    };
    load();
  }, []);

  const filteredFiles = useMemo(() => {
    const term = search.toLowerCase();
    const next = vaultFiles.filter((file) => {
      const matchesSearch = !term || file.name.toLowerCase().includes(term);
      const matchesFilter = filter === 'All' || (filter === 'Recently Added' ? true : file.integrity === filter);
      return matchesSearch && matchesFilter;
    });

    return [...next].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'size') return Number.parseFloat(b.size) - Number.parseFloat(a.size);
      return a.created.localeCompare(b.created);
    });
  }, [search, filter, sortBy, vaultFiles]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteVaultFile(deleteTarget.name);
    setVaultFiles(await getVaultFiles());
    setDeleteTarget(null);
    setToast('File deleted from Vault.');
  };

  const handleDownload = async (fileName) => {
    const record = await downloadVaultFile(fileName);
    if (!record) return;
    const blob = new Blob([record.content || `Vault file: ${record.name}`], { type: record.contentType || 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = record.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <h2>Secure Vault</h2>
        <p>Manage encrypted files and monitor their protection status.</p>
      </div>

      <div className="filter-row">
        <input className="button input-like" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search vault" />
        <select className="button input-like" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="All">All</option>
          <option value="Verified">Protected</option>
          <option value="Failed">Needs attention</option>
          <option value="Recently Added">Recently Added</option>
        </select>
        <select className="button input-like" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="name">Sort: Name</option>
          <option value="size">Sort: Size</option>
          <option value="date">Sort: Date</option>
        </select>
        <button className="button" onClick={async () => setVaultFiles(await getVaultFiles())}>Refresh</button>
        <button className="button primary" onClick={() => navigate('/encrypt')}><Shield size={15} /> Protect New File</button>
      </div>

      {loading ? <div className="skeleton-list"><div className="skeleton-row" /><div className="skeleton-row" /><div className="skeleton-row" /></div> : filteredFiles.length ? <div className="data-table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>File</th>
              <th>Type</th>
              <th>Size</th>
              <th>Encryption</th>
              <th>Integrity</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredFiles.map((file) => (
              <tr key={file.id || `${file.name}-${file.created}`}>
                <td>{file.name}</td>
                <td>{file.type}</td>
                <td>{file.size}</td>
                <td>{file.encryption}</td>
                <td>
                  <span className={`status-badge ${file.integrity === 'Failed' ? 'danger' : 'success'}`}>
                    <span className="status-dot" aria-hidden="true" /> {file.integrity}
                  </span>
                </td>
                <td>{file.created}</td>
                <td>
                  <div className="inline-actions">
                    <button className="tiny-btn" onClick={() => setSelectedFile(file)}>View</button>
                    <button className="tiny-btn" onClick={() => handleDownload(file.name)}>Download</button>
                    <button className="tiny-btn danger" onClick={() => setDeleteTarget(file)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div> : (
        <div className="empty-state"><h3>{search || filter !== 'All' ? 'Nothing matched that search' : 'Your secure vault is ready'}</h3><p>{search || filter !== 'All' ? 'Try a different file name or filter.' : 'Protect your first file to start building your secure vault.'}</p>{!search && filter === 'All' && <button className="button primary" onClick={() => navigate('/encrypt')}>Encrypt a File</button>}</div>
      )}

      {selectedFile && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3>{selectedFile.name}</h3>
            <p><strong>Type:</strong> {selectedFile.type}</p>
            <p><strong>Size:</strong> {selectedFile.size}</p>
            <p><strong>Encryption:</strong> {selectedFile.encryption}</p>
            <p><strong>Integrity:</strong> {selectedFile.integrity}</p>
            <div className="actions-row">
              <button className="button primary" onClick={() => handleDownload(selectedFile.name)}>Download</button>
              <button className="button" onClick={() => setSelectedFile(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3>Delete encrypted file?</h3>
            <p>This action will permanently remove the selected protected file.</p>
            <div className="actions-row">
              <button className="button" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="button primary danger-btn" onClick={handleDelete}>Delete File</button>
            </div>
          </div>
        </div>
      )}
      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  );
}

function ActivityPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [selectedLog, setSelectedLog] = useState(null);
  const [activityPage, setActivityPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const activityPageSize = 10;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const rows = await getActivityLogs();
      setLogs(rows);
      setLoading(false);
    };
    load();
  }, []);

  const filteredLogs = useMemo(() => {
    const term = search.toLowerCase();
    return logs.filter((log) => {
      const matchesText = !term || [log.event, log.resource, log.user, log.details].join(' ').toLowerCase().includes(term);
      const matchesFilter = filter === 'All' || log.event.toLowerCase().includes(filter.toLowerCase()) || (filter === 'Security Events' && (log.status === 'Warning' || log.status === 'Failed'));
      return matchesText && matchesFilter;
    });
  }, [logs, search, filter]);

  const visibleLogs = filteredLogs.slice((activityPage - 1) * activityPageSize, activityPage * activityPageSize);
  const totalActivityPages = Math.max(1, Math.ceil(filteredLogs.length / activityPageSize));

  const exportAudit = (format) => {
    const payload = format === 'json'
      ? JSON.stringify(filteredLogs, null, 2)
      : [['Timestamp', 'Event', 'Resource', 'Status', 'User', 'Details'], ...filteredLogs.map((log) => [log.timestamp, log.event, log.resource, log.status, log.user || 'Admin User', log.details])].map((row) => row.map((value) => `"${String(value || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([payload], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cryptova-audit-report.${format === 'json' ? 'json' : 'csv'}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <h2>Security Activity</h2>
        <p>Review security operations performed within CRYPTOVA.</p>
      </div>

      <div className="filter-row">
        <input className="button input-like" value={search} onChange={(e) => { setSearch(e.target.value); setActivityPage(1); }} placeholder="Search activity" />
        <select className="button input-like" value={filter} onChange={(e) => { setFilter(e.target.value); setActivityPage(1); }}>
          <option value="All">All</option>
          <option value="Encryption">Encryption</option>
          <option value="Decryption">Decryption</option>
          <option value="Verification">Verification</option>
          <option value="Security Events">Security Events</option>
        </select>
        <button className="button primary" onClick={async () => setLogs(await getActivityLogs())}>Refresh</button>
        {user?.role === 'Compliance Reviewer' && <><button className="button" onClick={() => exportAudit('csv')}>Export CSV</button><button className="button" onClick={() => exportAudit('json')}>Export JSON</button></>}
      </div>

      {loading ? <div className="skeleton-list"><div className="skeleton-row" /><div className="skeleton-row" /><div className="skeleton-row" /></div> : visibleLogs.length ? <div className="data-table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Event</th>
              <th>Resource</th>
              <th>Status</th>
              <th>Details</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {visibleLogs.map((log) => (
              <tr key={`${log.timestamp}-${log.resource}`}>
                <td>{formatTimestamp(log.timestamp || new Date())}</td>
                <td>{log.event}</td>
                <td>{log.resource}</td>
                <td>
                  <span className={`status-badge ${log.status === 'Failed' || log.status === 'Warning' ? 'danger' : 'success'}`}>
                    <span className="status-dot" aria-hidden="true" /> {log.status}
                  </span>
                </td>
                <td>{log.details}</td>
                <td><button className="tiny-btn" onClick={() => setSelectedLog(log)}>View Details</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div> : (
        <div className="empty-state"><h3>No security activity yet</h3><p>Your security events will appear here.</p></div>
      )}

      {filteredLogs.length > activityPageSize && <div className="pagination"><button className="button" disabled={activityPage === 1} onClick={() => setActivityPage((page) => page - 1)}>Previous</button><span>Page {activityPage} of {totalActivityPages}</span><button className="button" disabled={activityPage === totalActivityPages} onClick={() => setActivityPage((page) => page + 1)}>Next</button></div>}

      {selectedLog && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <span className="panel-kicker">SECURITY EVENT</span>
            <h3>{selectedLog.event}</h3>
            <p><strong>File:</strong> {selectedLog.resource}</p>
            <p><strong>Status:</strong> {selectedLog.status}</p>
            <p><strong>Time:</strong> {formatTimestamp(selectedLog.timestamp || new Date())}</p>
            <p><strong>User:</strong> {selectedLog.user || 'Admin User'}</p>
            <p>{selectedLog.details}</p>
            <div className="actions-row"><button className="button" onClick={() => setSelectedLog(null)}>Close</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsPage() {
  const { user, updateRole, updateProfile } = useAuth();
  const canManageSecurity = user?.role === 'Security Administrator';
  const [profile, setProfile] = useState({ displayName: user?.displayName || '', email: user?.email || '' });
  const [settings, setSettings] = useState({
    encryption: 'AES-256-GCM',
    keyProtection: 'Password-derived key',
    integrity: true,
    autoLock: true,
    timeoutMinutes: 15,
    activityLogging: true
  });
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('cryptova-settings') || 'null');
      if (saved) setSettings((current) => ({ ...current, ...saved }));
    } catch {
      // Keep documented defaults when local demo settings are malformed.
    }
  }, []);

  const handleSave = () => {
    setSaving(true);
    setStatus('');
    const timer = setTimeout(() => {
      localStorage.setItem('cryptova-settings', JSON.stringify(settings));
      updateProfile(profile);
      setStatus('Saved');
      setToast('Settings saved.');
      setSaving(false);
    }, 600);
    return () => clearTimeout(timer);
  };

  const handleReset = () => {
    setSettings({
      encryption: 'AES-256-GCM',
      keyProtection: 'Password-derived key',
      integrity: true,
      autoLock: true,
      timeoutMinutes: 15,
      activityLogging: true
    });
    setStatus('Defaults restored');
    setToast('Default settings restored.');
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <h2>Settings</h2>
        <p>Configure secure operations and platform behaviour.</p>
        {!canManageSecurity && <div className="info-banner">Encryption and key settings are limited to Security Administrators in this demo. Real authorization must be enforced server-side.</div>}
      </div>

      <div className="section-card">
        <div className="status-list">
          <div className="status-row profile-settings-row">
            <div><div className="status-label">Profile</div><div className="subtext">Update the display name shown in CRYPTOVA.</div></div>
            <input className="button input-like" value={profile.displayName} onChange={(event) => setProfile({ ...profile, displayName: event.target.value })} aria-label="Display name" />
          </div>
          <div className="status-row">
            <div>
              <div className="status-label">Encryption</div>
              <div className="subtext">AES-256-GCM</div>
            </div>
            <select disabled={!canManageSecurity} value={settings.encryption} onChange={(e) => setSettings({ ...settings, encryption: e.target.value })} className="button input-like">
              <option value="AES-256-GCM">AES-256-GCM</option>
              <option value="ChaCha20-Poly1305">ChaCha20-Poly1305</option>
            </select>
          </div>

          <div className="status-row">
            <div>
              <div className="status-label">Key Protection</div>
              <div className="subtext">Password-derived key</div>
            </div>
            <select disabled={!canManageSecurity} value={settings.keyProtection} onChange={(e) => setSettings({ ...settings, keyProtection: e.target.value })} className="button input-like">
              <option value="Password-derived key">Password-derived key</option>
              <option value="Hardware-backed key">Hardware-backed key</option>
            </select>
          </div>

          <div className="status-row">
            <div>
              <div className="status-label">Integrity</div>
              <div className="subtext">Integrity verification enabled</div>
            </div>
            <label className="switch-wrap">
              <input type="checkbox" checked={settings.integrity} onChange={(e) => setSettings({ ...settings, integrity: e.target.checked })} />
              <span className="switch" />
            </label>
          </div>

          <div className="status-row">
            <div>
              <div className="status-label">Session Security</div>
              <div className="subtext">Auto-lock enabled · {settings.timeoutMinutes} minutes</div>
            </div>
            <label className="switch-wrap">
              <input type="checkbox" checked={settings.autoLock} onChange={(e) => setSettings({ ...settings, autoLock: e.target.checked })} />
              <span className="switch" />
            </label>
          </div>

          <div className="status-row">
            <div><div className="status-label">Demo role</div><div className="subtext">UI simulation only; real authorization must be enforced server-side.</div></div>
            <select value={user?.role || 'Business User'} onChange={(event) => updateRole(event.target.value)} className="button input-like">
              <option>Security Administrator</option><option>Business User</option><option>Compliance Reviewer</option>
            </select>
          </div>

          <div className="status-row">
            <div><div className="status-label">Session timeout</div><div className="subtext">Sign out after inactivity.</div></div>
            <select value={settings.timeoutMinutes} onChange={(event) => setSettings({ ...settings, timeoutMinutes: Number(event.target.value) })} className="button input-like"><option value="15">15 minutes</option><option value="30">30 minutes</option><option value="60">60 minutes</option></select>
          </div>

          <div className="status-row">
            <div>
              <div className="status-label">Activity Logging</div>
              <div className="subtext">Security activity logging enabled</div>
            </div>
            <label className="switch-wrap">
              <input type="checkbox" checked={settings.activityLogging} onChange={(e) => setSettings({ ...settings, activityLogging: e.target.checked })} />
              <span className="switch" />
            </label>
          </div>
        </div>

        <div className="actions-row top-margin">
          <button className="button primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Settings'}</button>
          <button className="button" onClick={handleReset}>Reset</button>
        </div>

        {status && <div className="success-banner compact-banner"><CheckCircle2 size={16} /> <span>{status}</span></div>}
      </div>
      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  );
}

export default App;
