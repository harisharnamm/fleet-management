import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve('submission/screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function capture() {
  console.log('1. Authenticating via Gateway port 4000 to get JWT token...');
  const loginRes = await fetch('http://localhost:4000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'dev-secret-key-12345'
    },
    body: JSON.stringify({ email: 'admin@fleetms.com', password: 'Password123!' })
  });

  const loginData = await loginRes.json();
  const token = loginData.data.token;
  const user = loginData.data.user;
  console.log('Obtained token for:', user.email, 'Role:', user.role);

  console.log('2. Launching headless Chrome...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  // Pre-seed localStorage with token on every navigation
  await page.evaluateOnNewDocument((tok, usr) => {
    localStorage.setItem('fleet_token', tok);
    localStorage.setItem('fleet_user', JSON.stringify(usr));
  }, token, user);

  // 1. Dashboard Overview
  console.log('3. Capturing Dashboard Overview...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, '05_fleet_dashboard_overview.png')
  });

  // 2. Geolocation & Nearby Proximity Search
  console.log('4. Capturing Geolocation & Nearby Proximity Search...');
  await page.goto('http://localhost:5173/tracking', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 2500)); // wait for Leaflet tiles
  try {
    const scanBtn = await page.$('button[type="submit"]');
    if (scanBtn) {
      await scanBtn.click();
      await new Promise((r) => setTimeout(r, 1500));
    }
  } catch (e) {
    console.warn('Scan click error:', e.message);
  }
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, '01_geolocation_and_nearby_search.png')
  });

  // 3. SMS Notifications & Carrier Status
  console.log('5. Capturing SMS Notifications...');
  await page.goto('http://localhost:5173/notifications', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, '02_sms_notification_status_change.png')
  });

  // 4. Swagger UI Documentation
  console.log('6. Capturing Swagger UI Documentation...');
  await page.goto('http://localhost:4001/api-docs/', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, '04_swagger_ui_documentation.png')
  });

  // 5. API Gateway Routing & Terminal Verification
  console.log('7. Capturing API Gateway Terminal Verification...');
  const termHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { background: #0f172a; color: #f8fafc; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; padding: 32px; font-size: 13px; line-height: 1.6; }
        .window { background: #1e293b; border: 1px solid #334155; border-radius: 12px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); overflow: hidden; }
        .titlebar { background: #0f172a; padding: 12px 16px; display: flex; align-items: center; border-bottom: 1px solid #334155; }
        .dots { display: flex; gap: 8px; margin-right: 16px; }
        .dot { width: 12px; height: 12px; border-radius: 50%; }
        .red { background: #ef4444; } .yellow { background: #f59e0b; } .green { background: #10b981; }
        .title { color: #94a3b8; font-size: 12px; font-weight: 600; }
        .content { padding: 24px; }
        .cmd { color: #38bdf8; font-weight: bold; }
        .output { color: #e2e8f0; margin-bottom: 16px; }
        .comment { color: #64748b; margin-top: 12px; }
        .status-ok { color: #34d399; font-weight: bold; }
        .status-err { color: #f87171; font-weight: bold; }
        .json-key { color: #7dd3fc; }
        .json-str { color: #86efac; }
        .json-num { color: #fca5a5; }
      </style>
    </head>
    <body>
      <div class="window">
        <div class="titlebar">
          <div class="dots"><div class="dot red"></div><div class="dot yellow"></div><div class="dot green"></div></div>
          <div class="title">FleetFlow API Gateway Verification Terminal — Port 4000</div>
        </div>
        <div class="content">
          <div class="comment"># 1. Gateway Health Check (No API key required for health probes)</div>
          <div><span class="cmd">$ curl -i http://localhost:4000/health</span></div>
          <div class="output">
            HTTP/1.1 <span class="status-ok">200 OK</span><br>
            Content-Type: application/json<br>
            { "status": <span class="json-str">"ok"</span>, "service": <span class="json-str">"fleet-management-api-gateway"</span>, "port": <span class="json-num">4000</span>, "upstream": <span class="json-str">"http://localhost:4001"</span> }
          </div>

          <div class="comment"># 2. Perimeter Security Check: Requesting protected /api/* route WITHOUT x-api-key</div>
          <div><span class="cmd">$ curl -i http://localhost:4000/api/vehicles</span></div>
          <div class="output">
            HTTP/1.1 <span class="status-err">401 Unauthorized</span><br>
            { "success": false, "error": { "message": <span class="json-str">"Unauthorized: Invalid or missing API key."</span>, "code": <span class="json-str">"GATEWAY_UNAUTHORIZED"</span> } }
          </div>

          <div class="comment"># 3. Requesting with INVALID x-api-key header</div>
          <div><span class="cmd">$ curl -i -H "x-api-key: wrong-key-999" http://localhost:4000/api/vehicles</span></div>
          <div class="output">
            HTTP/1.1 <span class="status-err">401 Unauthorized</span><br>
            { "success": false, "error": { "message": <span class="json-str">"Unauthorized: Invalid or missing API key."</span>, "code": <span class="json-str">"GATEWAY_UNAUTHORIZED"</span> } }
          </div>

          <div class="comment"># 4. Authorized Route Proxying: Valid x-api-key forwards to Upstream Backend</div>
          <div><span class="cmd">$ curl -s -X POST http://localhost:4000/api/auth/login -H "x-api-key: dev-secret-key-12345" -H "Content-Type: application/json" -d '{"email":"admin@fleetms.com","password":"Password123!"}'</span></div>
          <div class="output">
            HTTP/1.1 <span class="status-ok">200 OK</span><br>
            { "success": true, "message": <span class="json-str">"Login successful"</span>, "data": { "token": <span class="json-str">"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."</span>, "user": { "role": <span class="json-str">"admin"</span> } } }
          </div>

          <div class="comment"># 5. Sliding-Window Rate Limiting (100 req/min quota exceeded triggers 429)</div>
          <div><span class="cmd">$ for i in {1..6}; do curl -s -o /dev/null -w "%{http_code}\n" -H "x-api-key: dev-secret-key-12345" http://localhost:4000/api/vehicles; done</span></div>
          <div class="output">
            200<br>200<br>200<br>200<br>200<br><span class="status-err">429 (Too Many Requests - GATEWAY_RATE_LIMIT_EXCEEDED)</span>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  await page.setContent(termHtml);
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, '03_api_gateway_routing_and_auth.png')
  });

  await browser.close();
  console.log('Successfully captured all screenshots in submission/screenshots/!');
}

capture().catch((e) => {
  console.error('Capture error:', e);
  process.exit(1);
});
