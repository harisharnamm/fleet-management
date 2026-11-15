import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SCREENSHOT_DIR = path.resolve('submission/screenshots');
const OUTPUT_PDF = path.resolve('submission/FleetFlow_SGA2_Report.pdf');

function getBase64Image(filename) {
  const filePath = path.join(SCREENSHOT_DIR, filename);
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath);
    return `data:image/png;base64,${data.toString('base64')}`;
  }
  return '';
}

async function generatePdf() {
  console.log('Encoding all screenshots...');
  const imgGeo = getBase64Image('01_geolocation_and_nearby_search.png');
  const imgSms = getBase64Image('02_sms_notification_status_change.png');
  const imgGw = getBase64Image('03_api_gateway_routing_and_auth.png');
  const imgSwagger = getBase64Image('04_swagger_ui_documentation.png');
  const imgDash = getBase64Image('05_fleet_dashboard_overview.png');
  const imgVehicles = getBase64Image('06_vehicle_inventory_management.png');
  const imgDetails = getBase64Image('07_vehicle_details_and_telemetry.png');
  const imgMocha = getBase64Image('08_automated_mocha_test_run.png');

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>FleetFlow — Fleet Management System Report</title>
  <style>
    @page {
      size: A4;
      margin: 18mm 14mm 18mm 14mm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      line-height: 1.5;
      font-size: 10pt;
    }
    .page-break {
      page-break-before: always;
    }
    header {
      border-bottom: 2px solid #2563eb;
      padding-bottom: 12px;
      margin-bottom: 18px;
    }
    .project-title {
      font-size: 21pt;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
    }
    .project-subtitle {
      font-size: 12.5pt;
      color: #475569;
      margin-top: 4px;
    }
    .meta-box {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 10px 14px;
      margin-top: 12px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
      font-size: 9.5pt;
    }
    h2 {
      font-size: 12.5pt;
      font-weight: 700;
      color: #1e3a8a;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 3px;
      margin-top: 16px;
      margin-bottom: 8px;
    }
    h3 {
      font-size: 10.5pt;
      font-weight: 600;
      color: #0f172a;
      margin-top: 10px;
      margin-bottom: 4px;
    }
    p {
      margin: 0 0 7px 0;
    }
    ul, ol {
      margin: 0 0 9px 0;
      padding-left: 18px;
    }
    li {
      margin-bottom: 3px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 8px 0;
      font-size: 8.5pt;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 5px 7px;
      text-align: left;
    }
    th {
      background: #f1f5f9;
      font-weight: 600;
      color: #0f172a;
    }
    .badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 600;
      font-size: 7.5pt;
    }
    .badge-pass { background: #dcfce7; color: #166534; }
    .screenshot-container {
      margin: 10px 0;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      overflow: hidden;
      background: #f8fafc;
      text-align: center;
    }
    .screenshot-container img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 0 auto;
    }
    .caption {
      font-size: 8pt;
      color: #475569;
      padding: 5px 8px;
      background: #f1f5f9;
      border-top: 1px solid #cbd5e1;
      font-style: italic;
    }
    code {
      font-family: ui-monospace, Menlo, Monaco, Consolas, monospace;
      font-size: 8pt;
      background: #f1f5f9;
      padding: 2px 4px;
      border-radius: 3px;
    }
    .callout {
      background: #eff6ff;
      border-left: 4px solid #3b82f6;
      padding: 8px 12px;
      margin: 10px 0;
      font-size: 8.5pt;
      color: #1e40af;
    }
  </style>
</head>
<body>

  <header>
    <div class="project-title">FleetFlow — Fleet Management System</div>
    <div class="project-subtitle">Staff Graded Assignment 2 (SGA 2) — Technical Submission Report</div>
    <div class="meta-box">
      <div><strong>Name:</strong> Harisharnam</div>
      <div><strong>Roll No:</strong> 2023EBCS406</div>
      <div style="grid-column: span 2;"><strong>Live Deployed URL:</strong> <a href="https://fleet-management-jade-psi.vercel.app/login" style="color: #2563eb; font-weight: 600; text-decoration: none;">https://fleet-management-jade-psi.vercel.app/login</a></div>
      <div><strong>Database:</strong> Neon Serverless PostgreSQL (PostGIS)</div>
      <div><strong>Repository:</strong> https://github.com/harisharnamm/fleet-management.git</div>
    </div>
  </header>

  <h2>1. Project Summary</h2>
  <p>
    FleetFlow is an enterprise web-based fleet management platform built to fulfill all academic and engineering criteria of Staff Graded Assignment 2. The solution addresses real-time vehicle registry, high-frequency GPS telemetry streaming, spatial proximity querying via PostGIS, automated carrier SMS alerting upon critical incidents, perimeter security via an API Gateway, and full OpenAPI documentation.
  </p>

  <h2>2. System Architecture</h2>
  <p>
    The project is implemented as an independently runnable monorepo with three core tiers:
  </p>
  <ul>
    <li><strong>React Single-Page Application (Port 5173):</strong> Built with React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui component primitives, OpenStreetMap (React Leaflet), and Recharts for live telemetry analytics.</li>
    <li><strong>API Gateway (Port 4000):</strong> Independent Express application utilizing <code>http-proxy-middleware</code> for route proxying, sliding-window rate limiting (100 req/min), client API key authentication (<code>x-api-key</code>), and structured 503 error handling.</li>
    <li><strong>Backend Modular Monolith (Port 4001):</strong> Node.js ESM Express server structured into domain modules (Auth, Users, Vehicles, Telemetry, Geolocation, Notifications) with JWT authentication and strict RBAC.</li>
    <li><strong>Neon Lakebase PostgreSQL with PostGIS:</strong> Cloud-hosted serverless PostgreSQL 16 on the <code>production</code> branch with spatial GiST indexing and WGS 84 geography points.</li>
  </ul>

  <h2>3. Key Third-Party & Domain Integrations</h2>
  <h3>A. Geolocation & OpenStreetMap</h3>
  <p>
    Vehicles broadcast GPS fixes to <code>POST /api/telemetry</code>. A PostgreSQL database trigger orders coordinates into <code>POINT(longitude latitude)</code> format and stores them in a PostGIS <code>geography(Point, 4326)</code> column. Proximity queries are resolved through the stored function <code>find_vehicles_within_radius</code>, which evaluates <code>ST_DWithin</code> on the latest telemetry record per vehicle and returns distances in metres. An address geocoding endpoint (<code>GET /api/maps/geocode</code>) connects with OpenStreetMap Nominatim.
  </p>

  <h3>B. Simulated Carrier SMS Notifications</h3>
  <p>
    To satisfy the requirement without third-party paid SMS APIs, a custom carrier simulation engine generates carrier delivery receipts (e.g., Verizon, AT&T, T-Mobile), assigns message IDs, tracks simulated latency, and persists delivery statuses (<code>delivered</code> / <code>failed</code>) to the database. Alerts are automatically triggered on:
  </p>
  <ul>
    <li><strong>Engine Fault / Overheat:</strong> Engine temperature &gt; 105°C or explicit fault flag.</li>
    <li><strong>Low Battery:</strong> Battery percentage dropping below 15%.</li>
    <li><strong>Emergency Stop:</strong> Immediate vehicle emergency stop event.</li>
    <li><strong>Status Change:</strong> Operational status transition (e.g. <code>active</code> &rarr; <code>maintenance</code>).</li>
  </ul>

  <div class="page-break"></div>

  <h2>4. Visual Verification & System Screenshots</h2>
  <p>The following visual captures demonstrate the operational features across all required assignment categories:</p>

  <h3>1. Executive Fleet Dashboard Overview (Fully Loaded)</h3>
  <div class="screenshot-container">
    <img src="${imgDash}" alt="Fleet Overview Dashboard">
    <div class="caption">Figure 1: Fully-rendered Executive Dashboard showing real-time fleet KPIs (9 Vehicles, Active/Maintenance breakdown, Average Speed), battery health distribution, and recent alert logs.</div>
  </div>

  <h3>2. Vehicle Geolocation & Nearby Proximity Search</h3>
  <div class="screenshot-container">
    <img src="${imgGeo}" alt="Live Map Tracking and Radius Search">
    <div class="caption">Figure 2: OpenStreetMap rendering live vehicle markers with custom status pins, search radius boundary circle (5,000 m), address geocoder, and nearest vehicle proximity list calculated in metres by PostGIS.</div>
  </div>

  <div class="page-break"></div>

  <h3>3. SMS Notification Generation on Status Change & Critical Alert</h3>
  <div class="screenshot-container">
    <img src="${imgSms}" alt="Mock SMS Notifications Audit Log">
    <div class="caption">Figure 3: Notifications Center showing persisted carrier receipts (Verizon, T-Mobile, AT&T), simulated latency, delivered statuses, and critical alert messages triggered by telemetry thresholds.</div>
  </div>

  <h3>4. Fleet Vehicle Inventory Management</h3>
  <div class="screenshot-container">
    <img src="${imgVehicles}" alt="Vehicle Inventory Table">
    <div class="caption">Figure 4: Vehicle Inventory screen with status filter tabs, search filter, vehicle details, latest telemetry fix badge, and administrative registration controls.</div>
  </div>

  <div class="page-break"></div>

  <h3>5. Vehicle Telemetry & Incident Details</h3>
  <div class="screenshot-container">
    <img src="${imgDetails}" alt="Vehicle Details and Telemetry">
    <div class="caption">Figure 5: Individual Vehicle view for FLT-101-TX showing real-time telemetry fix, operational status change controls (triggering notifications), and event history.</div>
  </div>

  <h3>6. API Gateway Routing, Authentication & Rate Limiting</h3>
  <div class="screenshot-container">
    <img src="${imgGw}" alt="API Gateway Terminal Verification">
    <div class="caption">Figure 6: Gateway terminal tests verifying public /health, 401 on missing/invalid x-api-key, 200 on authorized proxying, and 429 on sliding-window rate limit exceeded.</div>
  </div>

  <div class="page-break"></div>

  <h3>7. Interactive Swagger UI Documentation</h3>
  <div class="screenshot-container">
    <img src="${imgSwagger}" alt="Swagger UI API Documentation">
    <div class="caption">Figure 7: Swagger UI mounted at http://localhost:4001/api-docs documenting all 14 REST endpoints, schemas, parameters, and security definitions.</div>
  </div>

  <h3>8. Automated Mocha Test Suite Execution (25/25 Passing)</h3>
  <div class="screenshot-container">
    <img src="${imgMocha}" alt="Automated Test Suite Execution">
    <div class="caption">Figure 8: Automated Mocha/Chai/Supertest execution verifying all 7 required SGA 2 test flows directly against live Neon PostgreSQL (25 passing, 27s).</div>
  </div>

  <div class="page-break"></div>

  <h2>5. Automated Test Results (Mocha / Chai / Supertest)</h2>
  <p>
    The automated test suite executes directly against live Neon PostgreSQL, covering all 7 required SGA 2 test flows:
  </p>
  <table>
    <thead>
      <tr>
        <th>Flow ID</th>
        <th>Test Flow Description</th>
        <th>Tests</th>
        <th>Duration</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Flow 1</strong></td>
        <td>Login and JWT Authentication (Valid/invalid login, token verification, RBAC /me)</td>
        <td>5</td>
        <td>5.0s</td>
        <td><span class="badge badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>Flow 2</strong></td>
        <td>Vehicle Registration and Retrieval (Create, retrieve by ID, duplicate 409 conflict, filter)</td>
        <td>3</td>
        <td>3.0s</td>
        <td><span class="badge badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>Flow 3</strong></td>
        <td>Telemetry Submission & PostGIS Persistence (POINT(lng lat) check, critical alerts)</td>
        <td>3</td>
        <td>4.0s</td>
        <td><span class="badge badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>Flow 4</strong></td>
        <td>Vehicle Status Update Triggering Notification (Maintenance trigger, mock carrier logs)</td>
        <td>2</td>
        <td>1.9s</td>
        <td><span class="badge badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>Flow 5</strong></td>
        <td>RBAC Rejection of Unauthorized Deletion (Viewer 403, Manager 403, Admin 200)</td>
        <td>3</td>
        <td>1.8s</td>
        <td><span class="badge badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>Flow 6</strong></td>
        <td>Nearby Vehicle Search with Geolocation (3km radius, 25km radius, Nominatim geocoding)</td>
        <td>4</td>
        <td>1.0s</td>
        <td><span class="badge badge-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>Flow 7</strong></td>
        <td>Gateway API Key Verification & Rate Limiting (Missing key 401, invalid key 401, 429 limit)</td>
        <td>5</td>
        <td>0.1s</td>
        <td><span class="badge badge-pass">PASS</span></td>
      </tr>
      <tr style="background: #f8fafc; font-weight: bold;">
        <td colspan="2">TOTAL TEST RESULTS</td>
        <td>25</td>
        <td>27.4s</td>
        <td><span class="badge badge-pass">25 / 25 PASSING (100%)</span></td>
      </tr>
    </tbody>
  </table>

  <h2>6. Quick Start & Evaluation Instructions</h2>
  <div class="callout" style="background: #f0fdf4; border-left: 4px solid #16a34a; color: #14532d; font-size: 9pt; margin-bottom: 12px;">
    <strong>Live Cloud Deployment on Vercel:</strong> Evaluators can directly access the production application at:<br>
    <a href="https://fleet-management-jade-psi.vercel.app/login" style="color: #15803d; font-weight: 700; text-decoration: underline;">https://fleet-management-jade-psi.vercel.app/login</a>
  </div>
  <ol>
    <li><strong>Install Dependencies:</strong> <code>npm run install:all</code></li>
    <li><strong>Run Automated Tests:</strong> <code>npm test</code> (validates all 25 assertions against Neon PostgreSQL)</li>
    <li><strong>Start Full Application:</strong> <code>npm run dev</code>
      <ul>
        <li>Frontend UI: <code>http://localhost:5173</code> (Login: <code>admin@fleetms.com</code> / <code>Password123!</code>)</li>
        <li>API Gateway: <code>http://localhost:4000</code> (API Key: <code>dev-secret-key-12345</code>)</li>
        <li>Backend API: <code>http://localhost:4001</code></li>
        <li>Swagger UI: <code>http://localhost:4001/api-docs</code></li>
      </ul>
    </li>
  </ol>

  <div class="callout">
    <strong>Note on Evaluator Accounts:</strong> Pre-seeded accounts include Administrator (<code>admin@fleetms.com</code>), Fleet Manager (<code>manager@fleetms.com</code>), and Viewer (<code>viewer@fleetms.com</code>) — all using password <code>Password123!</code>.
  </div>

</body>
</html>
  `;

  console.log('Launching Chrome to print PDF...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.pdf({
    path: OUTPUT_PDF,
    format: 'A4',
    printBackground: true,
    margin: { top: '15mm', right: '12mm', bottom: '15mm', left: '12mm' }
  });

  await browser.close();
  console.log('PDF Report successfully generated at:', OUTPUT_PDF);
}

generatePdf().catch((e) => {
  console.error('PDF generation error:', e);
  process.exit(1);
});
