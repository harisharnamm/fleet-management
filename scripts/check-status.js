#!/usr/bin/env node

/**
 * Health & Connectivity Verification Script
 * Checks the availability and response states of Gateway, Backend, and Frontend.
 */

const services = [
  { name: 'API Gateway', url: 'http://localhost:4000/health', port: 4000 },
  { name: 'Backend Monolith', url: 'http://localhost:4001/health', port: 4001 },
  { name: 'Swagger UI Docs', url: 'http://localhost:4001/api-docs/', port: 4001 },
  { name: 'React Frontend', url: 'http://localhost:5173', port: 5173 }
];

async function checkService(service) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const response = await fetch(service.url, { signal: controller.signal });
    clearTimeout(timeout);

    return {
      name: service.name,
      url: service.url,
      port: service.port,
      status: response.status === 200 ? 'ONLINE' : `HTTP ${response.status}`,
      ok: response.status === 200
    };
  } catch (err) {
    return {
      name: service.name,
      url: service.url,
      port: service.port,
      status: 'OFFLINE / UNREACHABLE',
      ok: false
    };
  }
}

async function main() {
  console.log('\n==================================================');
  console.log(' Fleet Management System — Service Status Check');
  console.log('==================================================\n');

  for (const s of services) {
    const result = await checkService(s);
    const badge = result.ok ? '✅ ONLINE ' : '❌ OFFLINE';
    console.log(`${badge} | ${result.name.padEnd(20)} | Port ${result.port} | ${result.url}`);
  }

  console.log('\n==================================================\n');
}

main();
