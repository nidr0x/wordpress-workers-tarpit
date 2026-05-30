export function getDashboardHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex,nofollow">
<title>WordPress Workers Tarpit // Threat Analytics Dashboard</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg: #030712;
  --surface: rgba(17, 24, 39, 0.7);
  --surface-hover: rgba(31, 41, 55, 0.8);
  --border: rgba(55, 65, 81, 0.4);
  
  --text-bright: #f9fafb;
  --text: #d1d5db;
  --text-dim: #9ca3af;
  --text-dark: #6b7280;

  --primary: #8b5cf6;
  --primary-glow: rgba(139, 92, 246, 0.15);
  --cyan: #06b6d4;
  --cyan-glow: rgba(6, 182, 212, 0.15);
  
  --green: #10b981;
  --green-glow: rgba(16, 185, 129, 0.1);
  --red: #f43f5e;
  --red-glow: rgba(244, 63, 94, 0.12);
  --yellow: #f59e0b;
  --yellow-glow: rgba(245, 158, 11, 0.12);
  
  --radius: 16px;
  --font-sans: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  --shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5);
  --transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

html, body {
  min-height: 100vh;
  background: radial-gradient(circle at 50% 0%, #1e1b4b 0%, #030712 60%);
  color: var(--text);
  font-family: var(--font-sans);
  line-height: 1.5;
  padding: 32px 16px;
}

.container {
  max-width: 1300px;
  margin: 0 auto;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 24px;
}

.logo-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 42px;
  height: 42px;
  background: linear-gradient(135deg, var(--primary), var(--cyan));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  color: #fff;
  font-size: 1.4rem;
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.4);
}

.title-area h1 {
  font-size: 1.8rem;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: var(--text-bright);
}

.title-area h1 span {
  background: linear-gradient(to right, var(--primary), var(--cyan));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.title-area p {
  color: var(--text-dim);
  font-size: 0.9rem;
  margin-top: 4px;
}

.radar-pulse {
  width: 10px;
  height: 10px;
  background: var(--green);
  border-radius: 50%;
  display: inline-block;
  position: relative;
}

.radar-pulse::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  border: 2px solid var(--green);
  border-radius: 50%;
  animation: pulse 1.8s infinite ease-out;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(3.5); opacity: 0; }
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--surface);
  border: 1px solid var(--border);
  padding: 8px 16px;
  border-radius: 30px;
  font-size: 0.8rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
}

/* CARDS */
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 24px;
  box-shadow: var(--shadow);
  backdrop-filter: blur(12px);
  position: relative;
  overflow: hidden;
  transition: var(--transition);
}

.card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; width: 4px; height: 100%;
}

.card:hover {
  transform: translateY(-4px);
  border-color: rgba(255,255,255,0.15);
}

.card.primary::before { background: var(--primary); }
.card.cyan::before { background: var(--cyan); }
.card.green::before { background: var(--green); }
.card.red::before { background: var(--red); }
.card.yellow::before { background: var(--yellow); }

.card .value {
  font-size: 2.2rem;
  font-weight: 800;
  font-family: var(--font-mono);
  color: var(--text-bright);
  letter-spacing: -1px;
}

.card .label {
  font-size: 0.75rem;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 6px;
  font-weight: 600;
}

.card .trend {
  font-size: 0.75rem;
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* PANELS */
.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.grid-3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

@media (max-width: 1024px) {
  .grid-2, .grid-3 { grid-template-columns: 1fr; }
}

.panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 24px;
  box-shadow: var(--shadow);
  backdrop-filter: blur(12px);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.panel h2 {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-bright);
  display: flex;
  align-items: center;
  gap: 10px;
}

.panel h2 .icon {
  width: 28px;
  height: 28px;
  background: var(--primary-glow);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  font-size: 0.95rem;
}

.panel h2.cyan .icon {
  background: var(--cyan-glow);
  color: var(--cyan);
}

/* TABLES */
table {
  width: 100%;
  border-collapse: collapse;
}

th {
  text-align: left;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-dark);
  padding: 10px 12px;
  border-bottom: 1px solid var(--border);
  font-weight: 600;
}

td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--border);
  font-size: 0.85rem;
}

tr:last-child td {
  border-bottom: none;
}

.table-hover tr:hover {
  background: rgba(255, 255, 255, 0.02);
}

.font-mono {
  font-family: var(--font-mono);
}

/* PROGRESS METERS */
.bar-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.bar-row:last-child {
  margin-bottom: 0;
}

.bar-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  font-weight: 600;
}

.bar-labels .value {
  color: var(--text-bright);
  font-family: var(--font-mono);
}

.bar-track {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.bar-fill {
  height: 100%;
  border-radius: 4px;
  background: linear-gradient(to right, var(--primary), var(--cyan));
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.bar-fill.purple { background: var(--primary); }
.bar-fill.cyan { background: var(--cyan); }
.bar-fill.green { background: var(--green); }
.bar-fill.red { background: var(--red); }
.bar-fill.yellow { background: var(--yellow); }

/* BADGES */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-login { background: var(--red-glow); color: var(--red); }
.badge-login-submit { background: var(--red-glow); color: var(--red); border: 1px solid rgba(244, 63, 94, 0.3); }
.badge-env { background: var(--yellow-glow); color: var(--yellow); }
.badge-git { background: var(--green-glow); color: var(--green); }
.badge-admin { background: var(--primary-glow); color: var(--primary); }
.badge-xmlrpc { background: var(--primary-glow); color: var(--primary); }
.badge-wp-probe { background: var(--cyan-glow); color: var(--cyan); }
.badge-probe { background: var(--cyan-glow); color: var(--cyan); }
.badge-bad-user-agent { background: var(--red-glow); color: var(--red); }
.badge-other { background: rgba(255,255,255,0.06); color: var(--text); }

/* SEARCH BAR */
.search-container {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  background: var(--surface);
  border: 1px solid var(--border);
  padding: 12px;
  border-radius: var(--radius);
  backdrop-filter: blur(10px);
}

.search-input {
  flex: 1;
  background: rgba(0,0,0,0.25);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px 16px;
  color: var(--text-bright);
  font-family: var(--font-sans);
  font-size: 0.9rem;
  outline: none;
  transition: var(--transition);
}

.search-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 10px rgba(139, 92, 246, 0.25);
}

/* CHART */
.chart-panel {
  margin-bottom: 24px;
}

.chart-bars {
  height: 180px;
  display: flex;
  align-items: flex-end;
  gap: 4px;
  padding-top: 24px;
  border-bottom: 1px solid var(--border);
}

.chart-bar-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  justify-content: flex-end;
  position: relative;
}

.chart-bar {
  width: 100%;
  background: linear-gradient(to top, var(--primary-glow), var(--primary));
  border-radius: 4px 4px 0 0;
  min-height: 2px;
  transition: var(--transition);
  cursor: default;
  box-shadow: 0 0 8px rgba(139, 92, 246, 0.2);
}

.chart-bar:hover {
  background: linear-gradient(to top, var(--cyan-glow), var(--cyan));
  box-shadow: 0 0 12px rgba(6, 182, 212, 0.4);
}

.chart-bar .tooltip {
  opacity: 0;
  visibility: hidden;
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translate(-50%, -8px);
  background: #111827;
  border: 1px solid var(--border);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.72rem;
  font-family: var(--font-mono);
  color: var(--text-bright);
  z-index: 10;
  box-shadow: var(--shadow);
  transition: var(--transition);
  pointer-events: none;
  white-space: nowrap;
}

.chart-bar-col:hover .tooltip {
  opacity: 1;
  visibility: visible;
  transform: translate(-50%, -4px);
}

.chart-label {
  font-size: 0.65rem;
  color: var(--text-dark);
  margin-top: 8px;
  font-family: var(--font-mono);
}

/* CREDENTIAL REDACTED LIST */
.cred-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cred-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255,255,255,0.015);
  border: 1px solid var(--border);
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 0.85rem;
  transition: var(--transition);
}

.cred-item:hover {
  background: rgba(255,255,255,0.03);
  border-color: rgba(255,255,255,0.1);
}

.cred-identity {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cred-count {
  font-family: var(--font-mono);
  font-weight: 700;
  color: var(--cyan);
  background: var(--cyan-glow);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 350px;
  gap: 16px;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.footer {
  text-align: center;
  margin-top: 60px;
  padding: 24px;
  color: var(--text-dark);
  font-size: 0.8rem;
  border-top: 1px solid var(--border);
}

.flag {
  font-size: 1.1rem;
  vertical-align: middle;
  display: inline-block;
  margin-right: 6px;
}
</style>
</head>
<body>
<div class="container">
  <header>
    <div class="logo-group">
      <div class="logo-icon">T</div>
      <div class="title-area">
        <h1>WordPress Workers<span>Tarpit</span> Analytics</h1>
        <p>Advanced serverless security telemetry & client tarpitting</p>
      </div>
    </div>
    <div class="status-badge">
      <div class="radar-pulse"></div>
      ACTIVE DEFENSE MONITORING
    </div>
  </header>

  <div id="app">
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <p style="color: var(--text-dim); font-weight: 600;">Harvesting threat telemetry...</p>
    </div>
  </div>

  <div class="footer">
    WordPress Workers Tarpit Engine v2.0 • Serving real-time protection • Wasting crawler memory & CPU resources safely
  </div>
</div>

<script>
const $ = s => document.querySelector(s);

function getFlagEmoji(countryCode) {
  if (!countryCode || countryCode === 'XX') return '🏳️';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

function fmt(n) {
  if (n >= 1000000) return (n/1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n/1000).toFixed(1) + 'K';
  return n.toLocaleString();
}

function duration(secs) {
  if (!secs) return '0s';
  if (secs < 60) return secs + 's';
  if (secs < 3600) return Math.floor(secs/60) + 'm ' + (secs%60) + 's';
  const h = Math.floor(secs/3600);
  const m = Math.floor((secs%3600)/60);
  if (h < 24) return h + 'h ' + m + 'm';
  const d = Math.floor(h/24);
  return d + 'd ' + (h%24) + 'h';
}

function typeBadge(type) {
  const label = type.toUpperCase().replace('_', ' ');
  return '<span class="badge badge-' + type + '">' + label + '</span>';
}

let activeRecent = [];

// Global Filter function
window.filterLogs = function(val) {
  const query = val.toLowerCase().trim();
  const rows = document.querySelectorAll('.recent-log-row');
  rows.forEach(row => {
    const text = row.getAttribute('data-search').toLowerCase();
    if (text.includes(query)) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
};

async function load() {
  try {
    const [stats, recent] = await Promise.all([
      fetch('/api/stats').then(r => r.json()),
      fetch('/api/recent?limit=150').then(r => r.json()),
    ]);
    activeRecent = recent;
    render(stats, recent);
  } catch(e) {
    $('#app').innerHTML = '<div class="panel"><h2>No telemetry harvested yet</h2><p style="color:var(--text-dim); margin-top: 10px;">The WordPress Workers Tarpit engine is active, but has not logged any bot traps yet. Deploy the core library package to your production handlers and bind this D1 instance as <b>TARPIT_DB</b>.</p></div>';
  }
}

function render(s, recent) {
  let html = '';

  // 1. CARDS
  html += '<div class="cards">';
  html += '<div class="card primary"><div class="value">' + fmt(s.total) + '</div><div class="label">Total Traps Sprung</div></div>';
  html += '<div class="card red"><div class="value">' + fmt(s.unique_ips) + '</div><div class="label">Unique Bot IPs</div></div>';
  html += '<div class="card green"><div class="value">' + duration(s.wasted_seconds) + '</div><div class="label">Bot CPU Time Wasted</div></div>';
  html += '<div class="card yellow"><div class="value">' + fmt(s.today) + '</div><div class="label">Traps Today (24h)</div></div>';
  html += '<div class="card cyan"><div class="value">' + s.sites + '</div><div class="label">Sites Protected</div></div>';
  html += '</div>';

  // 2. CHART - LAST 30 DAYS
  if (s.by_day && s.by_day.length > 0) {
    const maxDay = Math.max(...s.by_day.map(d => d.count || 1));
    html += '<div class="panel chart-panel" style="margin-bottom: 24px;">';
    html += '<div class="panel-header"><h2><div class="icon">&#x1F4C8;</div> Daily Threat Velocity (30 Days)</h2></div>';
    html += '<div class="chart-bars">';
    s.by_day.forEach(d => {
      const pct = maxDay > 0 ? (d.count / maxDay * 100) : 0;
      html += '<div class="chart-bar-col">';
      html += '<div class="chart-bar" style="height:' + Math.max(pct, 4) + '%">';
      html += '<div class="tooltip">' + d.day + '<br/><b>' + d.count + ' hits</b></div>';
      html += '</div>';
      html += '<span class="chart-label">' + d.day.substring(8) + '</span>';
      html += '</div>';
    });
    html += '</div></div>';
  }

  // 3. MIDDLE PANELS: Attack Types + Countries + Credentials
  html += '<div class="grid-3">';
  
  // Attack type distribution
  const maxType = s.by_type && s.by_type.length > 0 ? Math.max(...s.by_type.map(t => t.count)) : 1;
  html += '<div class="panel">';
  html += '<h2><div class="icon">&#x1F3AF;</div> Threat Distributions</h2><div style="margin-top: 20px;">';
  if (s.by_type && s.by_type.length > 0) {
    s.by_type.forEach(t => {
      const pct = maxType > 0 ? (t.count / maxType * 100) : 0;
      html += '<div class="bar-row">';
      html += '<div class="bar-labels"><span>' + typeBadge(t.type) + '</span><span class="value">' + fmt(t.count) + '</span></div>';
      html += '<div class="bar-track"><div class="bar-fill purple" style="width:' + pct + '%"></div></div>';
      html += '</div>';
    });
  } else {
    html += '<p style="color:var(--text-dark)">No details collected</p>';
  }
  html += '</div></div>';

  // Country breakdown
  const maxCountry = s.by_country && s.by_country.length > 0 ? Math.max(...s.by_country.map(c => c.count)) : 1;
  html += '<div class="panel">';
  html += '<h2 class="cyan"><div class="icon">&#x1F310;</div> Geo-IP Originations</h2><div style="margin-top: 20px;">';
  if (s.by_country && s.by_country.length > 0) {
    s.by_country.slice(0, 5).forEach(c => {
      const pct = maxCountry > 0 ? (c.count / maxCountry * 100) : 0;
      const flag = getFlagEmoji(c.country);
      html += '<div class="bar-row">';
      html += '<div class="bar-labels"><span><span class="flag">' + flag + '</span> ' + c.country + '</span><span class="value">' + fmt(c.count) + '</span></div>';
      html += '<div class="bar-track"><div class="bar-fill cyan" style="width:' + pct + '%"></div></div>';
      html += '</div>';
    });
  } else {
    html += '<p style="color:var(--text-dark)">No country logs</p>';
  }
  html += '</div></div>';

  // Redacted Credentials Honeypot
  html += '<div class="panel">';
  html += '<h2><div class="icon">&#x1F511;</div> Honeypot Credentials</h2><div class="cred-list" style="margin-top: 20px;">';
  if (s.credentials && s.credentials.length > 0) {
    s.credentials.slice(0, 5).forEach(c => {
      html += '<div class="cred-item">';
      html += '<div class="cred-identity"><span style="color:var(--text-bright);font-family:var(--font-mono)">' + c.username + '</span><span style="color:var(--text-dark)">:</span><span style="color:var(--text-dim);font-size:0.75rem">' + c.password + '</span></div>';
      html += '<div class="cred-count">' + c.count + ' tries</div>';
      html += '</div>';
    });
  } else {
    html += '<p style="color:var(--text-dark); padding-top: 10px;">No credentials harvested yet.<br/><span style="font-size:0.8rem">Bots hitting /wp-login.php will appear here.</span></p>';
  }
  html += '</div></div>';

  html += '</div>';

  // 4. LOWER PANELS: Top Sites + Top Paths + Top IPs
  html += '<div class="grid-3">';

  // Top sites
  html += '<div class="panel"><h2><div class="icon">&#x1F4BB;</div> Top Targeted Sites</h2><div style="margin-top: 15px;"><table>';
  s.top_sites.slice(0, 6).forEach(t => {
    html += '<tr><td style="color:var(--text-bright)">' + t.site + '</td><td align="right" class="font-mono" style="color:var(--cyan)">' + fmt(t.count) + ' hits</td></tr>';
  });
  if (s.top_sites.length === 0) html += '<tr><td colspan="2" style="color:var(--text-dark)">No sites targeted</td></tr>';
  html += '</table></div></div>';

  // Top paths
  html += '<div class="panel"><h2><div class="icon">&#x1F4D1;</div> Top Probed Paths</h2><div style="margin-top: 15px;"><table>';
  s.top_paths.slice(0, 6).forEach(t => {
    html += '<tr><td style="max-width:250px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:var(--text-dim)" title="' + t.path + '">' + t.path + '</td><td align="right" class="font-mono" style="color:var(--primary)">' + fmt(t.count) + ' hits</td></tr>';
  });
  if (s.top_paths.length === 0) html += '<tr><td colspan="2" style="color:var(--text-dark)">No paths probed</td></tr>';
  html += '</table></div></div>';

  // Top IPs
  html += '<div class="panel"><h2><div class="icon">&#x1F916;</div> Top Offending Bot IPs</h2><div style="margin-top: 15px;"><table>';
  s.top_ips.slice(0, 6).forEach(t => {
    html += '<tr><td class="font-mono" style="color:var(--text-bright)">' + t.ip + '</td><td align="right" class="font-mono" style="color:var(--red)">' + fmt(t.count) + ' hits</td></tr>';
  });
  if (s.top_ips.length === 0) html += '<tr><td colspan="2" style="color:var(--text-dark)">No bots caught</td></tr>';
  html += '</table></div></div>';

  html += '</div>';

  // 5. LIVE SEARCH & FILTER CATCH LOG
  html += '<div class="panel" style="margin-top: 24px;">';
  html += '<div class="panel-header"><h2><div class="icon">&#x1F4DC;</div> Real-Time Capture Streams</h2></div>';
  
  html += '<div class="search-container">';
  html += '<input type="text" class="search-input" placeholder="Search by IP, Site Host, Request Path, or Country..." onkeyup="filterLogs(this.value)">';
  html += '</div>';

  html += '<div style="max-height: 480px; overflow-y: auto;">';
  html += '<table class="table-hover">';
  html += '<tr><th>Timestamp</th><th>Protected Site</th><th>Method</th><th>Target Path</th><th>Source IP</th><th>Country</th><th>Action Type</th></tr>';
  
  recent.forEach(r => {
    const time = r.ts ? new Date(r.ts + 'Z').toLocaleString() : '--';
    const flag = getFlagEmoji(r.country);
    
    // Concatenate search parameters to the row attributes
    const searchString = [r.ip, r.site, r.path, r.country, r.type, r.method].join(' ').toLowerCase();

    html += '<tr class="recent-log-row" data-search="' + searchString + '">';
    html += '<td style="font-size:0.75rem; white-space:nowrap; color:var(--text-dark);" class="font-mono">' + time + '</td>';
    html += '<td style="color:var(--text-bright);">' + (r.site || '--') + '</td>';
    html += '<td class="font-mono" style="color:var(--cyan); font-weight:700;">' + (r.method || 'GET') + '</td>';
    html += '<td style="max-width:280px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:var(--text-dim);" class="font-mono" title="' + (r.path || '') + '">' + (r.path || '--') + '</td>';
    html += '<td class="font-mono" style="color:var(--text-bright);">' + (r.ip || '--') + '</td>';
    html += '<td><span class="flag">' + flag + '</span> <b class="font-mono">' + (r.country || '--') + '</b></td>';
    html += '<td>' + typeBadge(r.type || 'other') + '</td>';
    html += '</tr>';
  });

  if (recent.length === 0) {
    html += '<tr><td colspan="7" align="center" style="color:var(--text-dark); padding: 40px 0;">No logs capture streams recorded yet.</td></tr>';
  }

  html += '</table></div></div>';

  $('#app').innerHTML = html;
}

load();
// Autorefresh dashboard telemetry every 45 seconds
setInterval(load, 45000);
</script>
</body>
</html>`;
}
