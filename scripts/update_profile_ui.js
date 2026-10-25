const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'public/plugins/sketchup/noithatpro_profile/ui/index.html');
const raw = fs.readFileSync(targetPath, 'utf8');

// Find marker
const marker = 'window.DEFAULT_PROFILES = {';
const markerPos = raw.indexOf(marker);

if (markerPos === -1) {
  console.error("Marker not found!");
  process.exit(1);
}

// Find preceding <script>
const scriptTagPos = raw.lastIndexOf('<script>', markerPos);
if (scriptTagPos === -1) {
  console.error("<script> tag not found before DEFAULT_PROFILES!");
  process.exit(1);
}

let scriptPart = raw.substring(scriptTagPos);

// Adjust scriptPart colors for light mode
scriptPart = scriptPart.replace(
  'polygon.setAttribute("fill", "rgba(56, 189, 248, 0.2)");',
  'polygon.setAttribute("fill", "rgba(245, 158, 11, 0.18)");'
);
scriptPart = scriptPart.replace(
  'polygon.setAttribute("stroke", "#38bdf8");',
  'polygon.setAttribute("stroke", "#d97706");'
);
scriptPart = scriptPart.replace(
  '<strong style="color: #fff;">${escapeHtml(item.name)}</strong>',
  '<strong style="color: #0f172a;">${escapeHtml(item.name)}</strong>'
);
scriptPart = scriptPart.replace(
  '<td style="text-align: right; font-weight: 700; color: #fff;">${formatMoney(item.cost)} đ</td>',
  '<td style="text-align: right; font-weight: 700; color: #0f172a;">${formatMoney(item.cost)} đ</td>'
);

const selectProfileTarget = 'document.getElementById(\'active-profile-dim\').textContent = `${item.width} x ${item.height} mm (Dài cây: ${item.bar_length || 2.5}m)`;';
const selectProfileAddition = `document.getElementById('active-profile-dim').textContent = \`\${item.width} x \${item.height} mm (Dài cây: \${item.bar_length || 2.5}m)\`;
      const ribName = document.getElementById('ribbon-active-name'); if (ribName) ribName.textContent = item.name;
      const ribDim = document.getElementById('ribbon-active-dim'); if (ribDim) ribDim.textContent = \`\${item.width} x \${item.height} mm\`;
      const ribBar = document.getElementById('ribbon-active-bar'); if (ribBar) ribBar.textContent = \`\${item.bar_length || 2.5} m\`;`;
scriptPart = scriptPart.replace(selectProfileTarget, selectProfileAddition);

const newHeaderAndHtml = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NoiThatPro - Profile &amp; Moulding Pro V2.0 (Web-Twin Architecture)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #f8fafc;
      --card-bg: #ffffff;
      --card-hover: #f1f5f9;
      --border: rgba(226, 232, 240, 0.85);
      --border-strong: #cbd5e1;
      --text: #0f172a;
      --text-muted: #64748b;
      --brand: #f59e0b;
      --brand-hover: #d97706;
      --primary: #059669;
      --primary-hover: #047857;
      --accent: #0284c7;
      --accent-hover: #0369a1;
      --warning: #f59e0b;
      --danger: #ef4444;
      --blueprint-line: rgba(148, 163, 184, 0.09);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: var(--bg);
      background-image: 
        linear-gradient(to right, var(--blueprint-line) 1px, transparent 1px),
        linear-gradient(to bottom, var(--blueprint-line) 1px, transparent 1px);
      background-size: 24px 24px;
      color: var(--text);
      line-height: 1.5;
      padding: 16px;
      font-size: 13px;
      overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
    }

    .font-mono, .tabular-nums, .metric-value, .stat-value, .hwid-box, td:nth-child(4), td:nth-child(5), td:nth-child(6), td:nth-child(7), td:nth-child(8), td:nth-child(9) {
      font-family: 'JetBrains Mono', monospace;
      font-variant-numeric: tabular-nums;
      font-feature-settings: "tnum" 1, "zero" 1;
    }

    /* Brand Header Card */
    .header-card {
      background: #ffffff;
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 14px 18px;
      margin-bottom: 12px;
      box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.04);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }
    .brand-group { display: flex; align-items: center; gap: 12px; }
    .brand-logo-box {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: var(--brand);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(245, 158, 11, 0.25);
    }
    .brand-title-row { display: flex; align-items: center; gap: 6px; }
    .brand-title { font-size: 16px; font-weight: 800; color: #0f172a; letter-spacing: -0.3px; }
    .brand-title .text-amber { color: #d97706; }
    .badge-tag {
      font-size: 10px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 6px;
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #e2e8f0;
      font-family: 'JetBrains Mono', monospace;
    }
    .badge-tag.tool-tag {
      background: #fef3c7;
      color: #92400e;
      border-color: #fde68a;
    }
    .brand-sub { font-size: 11.5px; color: var(--text-muted); font-weight: 500; margin-top: 1px; }

    /* Header Actions */
    .header-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .badge-master {
      background: #ecfdf5;
      color: #065f46;
      border: 1px solid #a7f3d0;
      padding: 5px 12px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }
    .badge-master:hover { background: #d1fae5; }
    .badge-dot {
      width: 7px;
      height: 7px;
      background-color: #10b981;
      border-radius: 50%;
      box-shadow: 0 0 6px #10b981;
      display: inline-block;
      animation: pulseDot 2s infinite;
    }
    @keyframes pulseDot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.8); }
    }

    /* Technical Status Ribbon */
    .tech-ribbon {
      background: #0f172a;
      color: #f8fafc;
      border-radius: 12px;
      padding: 8px 14px;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11.5px;
      box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.1);
    }
    .ribbon-left { display: flex; align-items: center; gap: 10px; }
    .ribbon-dot {
      width: 8px;
      height: 8px;
      background: #10b981;
      border-radius: 50%;
      box-shadow: 0 0 8px #10b981;
    }
    .ribbon-label { font-weight: 600; color: #94a3b8; font-size: 11px; }
    .ribbon-val { font-weight: 700; color: #f8fafc; font-family: 'JetBrains Mono', monospace; }
    .ribbon-right { display: flex; align-items: center; gap: 14px; color: #94a3b8; font-size: 11px; }

    /* Segmented Pill Navigation */
    .tabs-bar {
      display: inline-flex;
      background: rgba(241, 245, 249, 0.9);
      border: 1px solid var(--border);
      padding: 4px;
      border-radius: 9999px;
      gap: 4px;
      margin-bottom: 14px;
      box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.04);
    }
    .tab-btn {
      padding: 7px 16px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
      color: var(--text-muted);
      border: none;
      background: transparent;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
      font-family: inherit;
    }
    .tab-btn:hover { color: var(--text); }
    .tab-btn.active {
      background: #ffffff;
      color: #0f172a;
      box-shadow: 0 1px 4px rgba(15, 23, 42, 0.1), 0 1px 1px rgba(15, 23, 42, 0.06);
    }

    /* Views */
    .view-content { display: none; }
    .view-content.active { display: block; animation: tabFadeIn 0.2s ease; }
    @keyframes tabFadeIn {
      from { opacity: 0; transform: translateY(3px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* VIEW 1: SETUP GRID */
    .setup-grid {
      display: grid;
      grid-template-columns: 340px 1fr;
      gap: 14px;
      align-items: start;
    }

    /* Left Sidebar: Profile Library */
    .sidebar-panel {
      background: #ffffff;
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 14px;
      box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.03);
    }
    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .panel-title {
      font-size: 13px;
      font-weight: 800;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: -0.2px;
    }
    .search-box {
      width: 100%;
      background: #f8fafc;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 11.5px;
      color: #0f172a;
      font-family: inherit;
      margin-bottom: 10px;
      outline: none;
      transition: all 0.15s;
    }
    .search-box:focus {
      border-color: var(--brand);
      background: #ffffff;
      box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.12);
    }

    .category-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-bottom: 12px;
    }
    .cat-pill {
      font-size: 10.5px;
      padding: 3px 8px;
      border-radius: 6px;
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #e2e8f0;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.15s;
    }
    .cat-pill:hover {
      background: #e2e8f0;
      color: #0f172a;
    }
    .cat-pill.active {
      background: #0f172a;
      color: #ffffff;
      border-color: #0f172a;
    }

    .profile-list {
      max-height: 480px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding-right: 4px;
    }
    .profile-list::-webkit-scrollbar { width: 5px; }
    .profile-list::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 4px; }
    .profile-list::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }

    .profile-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 10px 12px;
      cursor: pointer;
      transition: all 0.15s;
      position: relative;
    }
    .profile-card:hover {
      border-color: #cbd5e1;
      background: #f8fafc;
      transform: translateY(-1px);
    }
    .profile-card.selected {
      border-color: var(--brand);
      background: #fffbeb;
      box-shadow: 0 2px 8px rgba(245, 158, 11, 0.12);
    }
    .profile-card.selected::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: var(--brand);
      border-top-left-radius: 9px;
      border-bottom-left-radius: 9px;
    }
    .profile-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 6px;
    }
    .profile-name {
      font-size: 12px;
      font-weight: 700;
      color: #0f172a;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .profile-tag {
      font-size: 9.5px;
      padding: 1px 5px;
      border-radius: 4px;
      background: #f1f5f9;
      color: #64748b;
      border: 1px solid #e2e8f0;
      font-weight: 600;
      white-space: nowrap;
    }
    .profile-card.selected .profile-tag {
      background: #fef3c7;
      color: #92400e;
      border-color: #fde68a;
    }
    .profile-meta {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 4px;
      font-family: 'JetBrains Mono', monospace;
    }

    /* Right Controls Panel */
    .controls-panel {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    /* Preview Card */
    .preview-card {
      background: #ffffff;
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 14px 16px;
      box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.03);
    }
    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 10px;
    }
    .svg-container {
      width: 100%;
      height: 240px;
      background-color: #f8fafc;
      background-image: 
        linear-gradient(to right, rgba(148, 163, 184, 0.12) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(148, 163, 184, 0.12) 1px, transparent 1px);
      background-size: 16px 16px;
      border: 1px solid var(--border);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .profile-svg {
      width: 100%;
      height: 100%;
    }

    /* Transforms Bar */
    .transforms-bar {
      background: #ffffff;
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 8px 14px;
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    .transform-group { display: flex; gap: 6px; align-items: center; }
    .toggle-btn {
      background: #ffffff;
      color: #334155;
      border: 1px solid #cbd5e1;
      padding: 5px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
    }
    .toggle-btn:hover { background: #f8fafc; color: #0f172a; }
    .toggle-btn.active {
      background: #fef3c7;
      color: #92400e;
      border-color: #fde68a;
      font-weight: 700;
    }

    .rot-btn {
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #e2e8f0;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 10.5px;
      font-weight: 600;
      cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      transition: all 0.15s;
    }
    .rot-btn:hover { background: #e2e8f0; color: #0f172a; }
    .rot-btn.active {
      background: #0f172a;
      color: #ffffff;
      border-color: #0f172a;
    }

    /* Settings Row */
    .settings-row {
      display: grid;
      grid-template-columns: 200px 1fr;
      gap: 12px;
    }
    .setting-box {
      background: #ffffff;
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 12px 14px;
    }
    .box-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      font-weight: 700;
      color: #475569;
      margin-bottom: 8px;
    }

    /* 3x3 Matrix Grid */
    .matrix-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 4px;
    }
    .matrix-btn {
      aspect-ratio: 1;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 10px;
      font-weight: 700;
      color: #475569;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'JetBrains Mono', monospace;
      transition: all 0.15s;
    }
    .matrix-btn:hover {
      background: #f1f5f9;
      color: #0f172a;
      border-color: #cbd5e1;
    }
    .matrix-btn.active {
      background: #059669;
      color: #ffffff;
      border-color: #059669;
      box-shadow: 0 1px 3px rgba(5, 150, 105, 0.3);
    }

    /* Inputs */
    .input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 6px; }
    .input-group label {
      display: block;
      font-size: 10.5px;
      font-weight: 600;
      color: #64748b;
      margin-bottom: 3px;
    }
    .input-group input, .input-group select {
      width: 100%;
      background: #f8fafc;
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 6px 8px;
      font-size: 11.5px;
      color: #0f172a;
      outline: none;
      font-family: inherit;
      transition: all 0.15s;
    }
    .input-group input {
      font-family: 'JetBrains Mono', monospace;
    }
    .input-group input:focus, .input-group select:focus {
      border-color: var(--brand);
      background: #ffffff;
      box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.12);
    }

    /* Actions Footer */
    .actions-footer {
      display: grid;
      grid-template-columns: 2fr 1.5fr 1fr;
      gap: 8px;
    }
    .btn-main {
      background: #059669;
      color: #ffffff;
      border: 1px solid #047857;
      padding: 10px 16px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 12.5px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      box-shadow: 0 2px 4px rgba(5, 150, 105, 0.2);
      transition: all 0.15s;
    }
    .btn-main:hover { background: #047857; }
    .btn-update {
      background: #0284c7;
      color: #ffffff;
      border: 1px solid #0369a1;
      padding: 10px 14px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      box-shadow: 0 2px 4px rgba(2, 132, 199, 0.2);
      transition: all 0.15s;
    }
    .btn-update:hover { background: #0369a1; }
    .btn-custom-face {
      color: #b45309;
      border: 1px solid #fde68a;
      background: #fef3c7;
      padding: 10px 12px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 11.5px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      transition: all 0.15s;
    }
    .btn-custom-face:hover { background: #fde68a; }

    /* Status Banner */
    .status-banner {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      color: #065f46;
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 11.5px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .status-banner.error {
      background: #fef2f2;
      border-color: #fecaca;
      color: #991b1b;
    }

    /* VIEW 2: BOM STATS & TABLE */
    .stats-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 12px;
    }
    .stat-card {
      background: #ffffff;
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 12px 16px;
      box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.03);
    }
    .stat-card .label { font-size: 11px; font-weight: 600; color: var(--text-muted); }
    .stat-card .value {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      margin-top: 2px;
      font-family: 'JetBrains Mono', monospace;
    }
    .stat-card .desc { font-size: 10.5px; color: var(--text-muted); margin-top: 2px; }

    .table-container {
      background: #ffffff;
      border: 1px solid var(--border);
      border-radius: 14px;
      overflow: hidden;
      margin-bottom: 12px;
      box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.03);
    }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th {
      background: #f8fafc;
      color: #475569;
      font-weight: 700;
      text-align: left;
      padding: 10px 14px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    td {
      padding: 9px 14px;
      border-bottom: 1px solid #f1f5f9;
      color: #334155;
    }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #f8fafc; }

    .table-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #ffffff;
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 10px 14px;
    }
    .btn-excel {
      background: #059669;
      color: #fff;
      border: 1px solid #047857;
      padding: 7px 14px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 11.5px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .btn-excel:hover { background: #047857; }
    .btn-csv {
      background: #ffffff;
      color: #334155;
      border: 1px solid #cbd5e1;
      padding: 7px 14px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 11.5px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .btn-csv:hover { background: #f8fafc; color: #0f172a; }

    /* Modal License */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.5);
      backdrop-filter: blur(2px);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal-overlay.active { display: flex; }
    .modal-box {
      background: #ffffff;
      border: 1px solid var(--border);
      border-radius: 16px;
      width: 480px;
      padding: 22px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
    }
    .modal-close {
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: 20px;
      cursor: pointer;
    }
    .hwid-box {
      background: #f8fafc;
      border: 1px dashed #cbd5e1;
      padding: 10px;
      border-radius: 8px;
      font-size: 12px;
      color: var(--accent);
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    #toast {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #0f172a;
      color: #fff;
      padding: 10px 18px;
      border-radius: 10px;
      font-weight: 600;
      font-size: 12px;
      display: none;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      z-index: 9999;
      animation: fadeIn 0.2s ease;
    }
  </style>
</head>
<body>

  <!-- BRAND HEADER CARD -->
  <div class="header-card">
    <div class="brand-group">
      <div class="brand-logo-box">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
          <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
      </div>
      <div>
        <div class="brand-title-row">
          <span class="brand-title">NỘI THẤT <span class="text-amber">PRO</span></span>
          <span class="badge-tag">CNC-B2B</span>
          <span class="badge-tag tool-tag">PROFILE PRO V2.0</span>
        </div>
        <div class="brand-sub">Hệ Thống Phào Chỉ, Máng LED, Gola, Cánh Kính &amp; Dự Toán BOM</div>
      </div>
    </div>
    <div class="header-actions">
      <span class="badge-master" id="license-badge" onclick="openLicenseModal()">
        <span class="badge-dot"></span> HOST MASTER: VĨNH VIỄN
      </span>
    </div>
  </div>

  <!-- TECHNICAL STATUS RIBBON -->
  <div class="tech-ribbon">
    <div class="ribbon-left">
      <span class="ribbon-dot"></span>
      <span class="ribbon-label">MẶT CẮT HIỆN TẠI:</span>
      <span class="ribbon-val" id="ribbon-active-name">Phào Nóc Hộp Hiện Đại 40x40</span>
    </div>
    <div class="ribbon-right">
      <span>KÍCH THƯỚC: <strong style="color: #38bdf8;" id="ribbon-active-dim">40.0 x 40.0 mm</strong></span>
      <span>DÀI CÂY: <strong style="color: #34d399;" id="ribbon-active-bar">2.44 m</strong></span>
      <span>TRẠNG THÁI: <strong style="color: #a7f3d0;">SẴN SÀNG</strong></span>
    </div>
  </div>

  <!-- NAVIGATION TABS (SEGMENTED PILL) -->
  <div class="tabs-bar">
    <button class="tab-btn active" id="tab-btn-setup" onclick="switchTab('setup')">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
      KHO BIÊN DẠNG &amp; THIẾT LẬP (28 MẪU)
    </button>
    <button class="tab-btn" id="tab-btn-bom" onclick="switchTab('bom')">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
      DỰ TOÁN VẬT TƯ &amp; ĐẶT MUA (BOM)
    </button>
  </div>

  <!-- VIEW 1: KHO BIÊN DẠNG & THIẾT LẬP -->
  <div class="view-content active" id="view-setup">
    <div class="setup-grid">
      
      <!-- CỘT TRÁI: DANH MỤC PHÀO NẸP -->
      <div class="sidebar-panel">
        <div class="panel-header">
          <div class="panel-title">Thư Viện Phào Nẹp</div>
          <span class="badge-tag tool-tag" id="profile-count-label">28 Mẫu</span>
        </div>

        <!-- Ô tìm kiếm nhanh -->
        <input type="text" class="search-box" id="search-input" placeholder="🔍 Tìm nhanh: Gola, LED, 40x40, Cánh kính..." oninput="onSearchInput()">
        
        <!-- Bộ lọc Chủng loại -->
        <div class="category-pills">
          <span class="cat-pill active" onclick="filterCategory('all', this)">Tất cả</span>
          <span class="cat-pill" onclick="filterCategory('phao_noc', this)">Phào nóc/trần</span>
          <span class="cat-pill" onclick="filterCategory('len_chan', this)">Len chân</span>
          <span class="cat-pill" onclick="filterCategory('nep_nhom', this)">Nẹp T/U/V/L</span>
          <span class="cat-pill" onclick="filterCategory('mang_led', this)">Máng LED</span>
          <span class="cat-pill" onclick="filterCategory('tay_nam', this)">Tay nắm &amp; Gola</span>
          <span class="cat-pill" onclick="filterCategory('canh_kinh', this)">Cánh kính</span>
          <span class="cat-pill" onclick="filterCategory('chi_tuong', this)">Chỉ tường PU</span>
          <span class="cat-pill" onclick="filterCategory('tu_ve', this)">Tự vẽ</span>
        </div>

        <!-- Danh sách card phào nẹp -->
        <div class="profile-list" id="profile-list-container">
          <!-- Render dynamically via JS -->
        </div>
      </div>

      <!-- CỘT PHẢI: XEM TRƯỚC SVG & ĐIỀU KHIỂN NEO/OFFSET -->
      <div class="controls-panel">
        
        <!-- HỘP XEM TRƯỚC MẶT CẮT SVG -->
        <div class="preview-card">
          <div class="preview-header">
            <div>
              <strong id="active-profile-title" style="color: #0f172a; font-size: 14px; font-weight: 800;">Phào Nóc Hộp Hiện Đại 40x40</strong>
              <div id="active-profile-desc" style="font-size: 11px; color: var(--text-muted); margin-top: 1px;">
                Phào nóc che khe hở kịch trần tủ bếp và tủ áo
              </div>
            </div>
            <div style="font-size: 12px; color: var(--accent); font-weight: 700; font-family: 'JetBrains Mono', monospace;" id="active-profile-dim">
              40.0 x 40.0 mm
            </div>
          </div>

          <div class="svg-container" id="svg-container">
            <svg class="profile-svg" id="profile-svg" viewBox="0 0 200 200">
              <!-- SVG path and anchor dynamically rendered -->
            </svg>
          </div>
        </div>

        <!-- THANH CÔNG CỤ BIẾN ĐỔI HÌNH HỌC (MIRROR & ROTATION) -->
        <div class="transforms-bar">
          <span style="font-size: 11px; font-weight: 700; color: #64748b; margin-right: 2px;">BIẾN ĐỔI:</span>
          
          <div class="transform-group">
            <button class="toggle-btn" id="btn-mirror-x" onclick="toggleMirrorX()">
              ↔ Mirror X (Lật Ngang)
            </button>
            <button class="toggle-btn" id="btn-mirror-y" onclick="toggleMirrorY()">
              ↕ Mirror Y (Lật Đứng)
            </button>
          </div>

          <div style="height: 16px; width: 1px; background: #e2e8f0; margin: 0 4px;"></div>

          <span style="font-size: 11px; font-weight: 700; color: #64748b; margin-right: 2px;">XOAY:</span>
          <div class="transform-group">
            <button class="rot-btn active" data-rot="0" onclick="setRotation(0)">0°</button>
            <button class="rot-btn" data-rot="90" onclick="setRotation(90)">90°</button>
            <button class="rot-btn" data-rot="180" onclick="setRotation(180)">180°</button>
            <button class="rot-btn" data-rot="270" onclick="setRotation(270)">270°</button>
          </div>
        </div>

        <!-- HÀNG THIẾT LẬP: MA TRẬN NEO 3X3 & TINH CHỈNH OFFSET -->
        <div class="settings-row">
          
          <!-- Ma trận điểm neo 3x3 (Justification) -->
          <div class="setting-box">
            <div class="box-title">
              <span>ĐIỂM NEO (3x3 ANCHOR)</span>
              <span id="active-just-label" style="color: var(--primary); font-weight: 700;">Bottom-Left</span>
            </div>
            <div class="matrix-grid">
              <button class="matrix-btn" data-just="top_left" onclick="selectJustification('top_left')">TL</button>
              <button class="matrix-btn" data-just="top_center" onclick="selectJustification('top_center')">TC</button>
              <button class="matrix-btn" data-just="top_right" onclick="selectJustification('top_right')">TR</button>
              
              <button class="matrix-btn" data-just="mid_left" onclick="selectJustification('mid_left')">ML</button>
              <button class="matrix-btn" data-just="center" onclick="selectJustification('center')">C</button>
              <button class="matrix-btn" data-just="mid_right" onclick="selectJustification('mid_right')">MR</button>
              
              <button class="matrix-btn active" data-just="bottom_left" onclick="selectJustification('bottom_left')">BL</button>
              <button class="matrix-btn" data-just="bottom_center" onclick="selectJustification('bottom_center')">BC</button>
              <button class="matrix-btn" data-just="bottom_right" onclick="selectJustification('bottom_right')">BR</button>
            </div>
          </div>

          <!-- Tinh chỉnh Offset & Vật liệu -->
          <div class="setting-box">
            <div class="box-title">
              <span>ĐỘ LỆCH OFFSET (mm) &amp; VẬT LIỆU</span>
              <a href="javascript:void(0)" onclick="resetOffsets()" style="color: var(--accent); font-size: 11px; text-decoration: none; font-weight: 600;">Đặt lại 0</a>
            </div>
            <div class="input-row">
              <div class="input-group">
                <label>Offset X (Ngang):</label>
                <input type="number" id="offset-x" value="0.0" step="0.5" oninput="updateSvgPreview()">
              </div>
              <div class="input-group">
                <label>Offset Y (Đứng):</label>
                <input type="number" id="offset-y" value="0.0" step="0.5" oninput="updateSvgPreview()">
              </div>
            </div>
            <div class="input-group" style="margin-top: 4px;">
              <label>Vật liệu / Bề mặt hoàn thiện:</label>
              <select id="material-select">
                <option value="Nhom_Anode_Bac">Nhôm Anode Bạc mờ tiêu chuẩn</option>
                <option value="Nhom_Den_Nham">Nhôm Anode Đen nhám cao cấp</option>
                <option value="Nhom_Vang_Bong">Nhôm Vàng bóng gương / Champagne</option>
                <option value="Go_MDF_Phu_Melamine">Gỗ MDF phủ Melamine vân sồi</option>
                <option value="Go_Son_Trang">Gỗ Sơn bệt trắng cao cấp</option>
              </select>
            </div>
          </div>

        </div>

        <!-- NÚT HÀNH ĐỘNG CHÍNH -->
        <div class="actions-footer">
          <button class="btn-main" id="btn-build" onclick="triggerBuildProfile()">
            <span>🚀 CHẠY PHÀO 1-CLICK</span>
          </button>
          <button class="btn-update" id="btn-update" onclick="triggerUpdateProfile()">
            <span>🔄 CẬP NHẬT ĐÃ CHỌN</span>
          </button>
          <button class="btn-custom-face" onclick="saveCustomFacePrompt()">
            <span>📐 LẤY TỪ FACE</span>
          </button>
        </div>

        <!-- DÒNG THÔNG BÁO TRẠNG THÁI -->
        <div class="status-banner" id="status-banner" style="display: none;">
          <span id="status-text">Sẵn sàng dựng phào nẹp.</span>
        </div>

      </div>

    </div>
  </div>

  <!-- VIEW 2: DỰ TOÁN VẬT TƯ (BOM) -->
  <div class="view-content" id="view-bom">
    
    <!-- STAT CARDS -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="label">Tổng mét dài phào nẹp</div>
        <div class="value" id="stat-total-length">0.0 m</div>
        <div class="desc">Tổng chiều dài đo đạc thực tế trong mô hình</div>
      </div>
      <div class="stat-card">
        <div class="label">Tổng số cây nguyên cần mua</div>
        <div class="value" id="stat-total-bars" style="color: var(--primary);">0 Cây</div>
        <div class="desc">Đã tính 5% hao hụt góc cắt mòi 45 độ</div>
      </div>
      <div class="stat-card">
        <div class="label">Tổng kinh phí dự toán</div>
        <div class="value" id="stat-total-cost" style="color: var(--accent);">0 đ</div>
        <div class="desc">Theo bảng giá vật tư xưởng thiết lập</div>
      </div>
    </div>

    <!-- BẢNG CHI TIẾT VẬT TƯ -->
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th style="width: 40px; text-align: center;">STT</th>
            <th>Tên Phào / Nẹp / Máng LED</th>
            <th style="width: 140px; text-align: center;">Phân Loại</th>
            <th style="width: 90px; text-align: center;">Dài Cây</th>
            <th style="width: 110px; text-align: right;">Tổng Mét Dài</th>
            <th style="width: 80px; text-align: center;">Hao Hụt</th>
            <th style="width: 110px; text-align: right;">Số Cây Mua</th>
            <th style="width: 120px; text-align: right;">Đơn Giá</th>
            <th style="width: 140px; text-align: right;">Thành Tiền</th>
          </tr>
        </thead>
        <tbody id="bom-table-body">
          <tr>
            <td colspan="9" style="text-align: center; color: var(--text-muted); padding: 30px;">
              Chưa có dữ liệu phào nẹp trong mô hình. Hãy dùng công cụ dựng phào nẹp trước!
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ACTION BAR BOM -->
    <div class="table-actions">
      <div style="font-size: 11px; color: var(--text-muted);">
        * Đã bao gồm hệ số an toàn cắt mòi góc 45 độ (1.05)
      </div>
      <div style="display: flex; gap: 8px;">
        <button class="btn-csv" onclick="exportCsv()">
          <span>📊 Xuất File CSV</span>
        </button>
        <button class="btn-excel" onclick="exportExcel()">
          <span>📗 Xuất Bảng Đặt Vật Tư (.XLS)</span>
        </button>
        <button class="btn-csv" onclick="refreshEstimation()">
          <span>🔄 Quét Lại Mô Hình</span>
        </button>
      </div>
    </div>

  </div>

  <!-- MODAL BẢN QUYỀN -->
  <div class="modal-overlay" id="modal-license">
    <div class="modal-box">
      <div class="modal-header">
        <h3 style="color: #0f172a; font-size: 15px; font-weight: 800;">Thông Tin Bản Quyền Profile Pro</h3>
        <button class="modal-close" onclick="closeLicenseModal()">&times;</button>
      </div>
      <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 10px;">
        Mã máy phần cứng (Hardware ID) dùng để đăng ký license:
      </p>
      <div class="hwid-box">
        <span id="modal-hwid" style="font-weight: 700;">Đang kiểm tra...</span>
        <button style="background: #ffffff; border: 1px solid #cbd5e1; color: #0f172a; padding: 3px 10px; border-radius: 6px; font-size: 11px; cursor: pointer; font-weight: 600;" onclick="copyHwid()">Sao Chép</button>
      </div>
      <div style="margin-bottom: 14px;">
        <label style="font-size: 11px; color: #64748b; display: block; margin-bottom: 4px; font-weight: 600;">Nhập License Key kích hoạt:</label>
        <input type="text" id="license-key-input" placeholder="NTPRO-XXXX-XXXX-XXXX-XXXX" style="width: 100%; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 7px 10px; font-family: 'JetBrains Mono', monospace; font-size: 12px;">
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 8px;">
        <button style="background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; padding: 7px 14px; border-radius: 8px; font-weight: 600;" onclick="closeLicenseModal()">Đóng</button>
        <button style="background: var(--primary); color: #fff; border: none; padding: 7px 18px; border-radius: 8px; font-weight: 700;" onclick="submitActivation()">Kích Hoạt</button>
      </div>
    </div>
  </div>

  `;

const finalContent = newHeaderAndHtml + scriptPart;
fs.writeFileSync(targetPath, finalContent, 'utf8');
console.log('Successfully updated Profile UI to Web-Twin Design System. Total bytes:', finalContent.length);
