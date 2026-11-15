import React from 'react';
import {
  FileCode2,
  ExternalLink,
  ShieldCheck,
  Server,
  Layers,
  Copy,
  Check
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export function ApiDocsPage() {
  const [copied, setCopied] = React.useState(false);

  const sampleCurl = `curl -X GET "http://localhost:4000/api/vehicles" \\
  -H "x-api-key: dev-secret-key-12345" \\
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sampleCurl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardLayout title="API Documentation & Swagger UI">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">OpenAPI 3.0 & Swagger UI</h2>
          <p className="text-sm text-slate-500">
            Interactive endpoint specifications and documentation hosted on backend port 4001
          </p>
        </div>
        <a href="http://localhost:4001/api-docs" target="_blank" rel="noreferrer">
          <Button className="bg-blue-600 hover:bg-blue-500 text-white gap-2 shadow-sm">
            <ExternalLink className="h-4 w-4" />
            <span>Open Swagger UI (/api-docs)</span>
          </Button>
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 space-y-6 p-6">
          <div>
            <h3 className="font-semibold text-slate-900 text-base mb-2">API Gateway Route Forwarding</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Client requests are submitted to the API Gateway (<code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700">http://localhost:4000/api</code>).
              The Gateway verifies the <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">x-api-key</code> header, applies rate limits, and proxies to the modular backend services on port 4001.
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Gateway Endpoint</th>
                  <th className="py-2.5 px-3">Backend Upstream</th>
                  <th className="py-2.5 px-3">Access Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2 px-3 font-mono text-blue-600">/api/auth/*</td>
                  <td className="py-2 px-3 font-mono text-slate-600">http://localhost:4001/api/auth/*</td>
                  <td className="py-2 px-3"><Badge variant="outline">API Key Only</Badge></td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono text-blue-600">/api/users/*</td>
                  <td className="py-2 px-3 font-mono text-slate-600">http://localhost:4001/api/users/*</td>
                  <td className="py-2 px-3"><Badge variant="default">Admin Only</Badge></td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono text-blue-600">/api/vehicles/*</td>
                  <td className="py-2 px-3 font-mono text-slate-600">http://localhost:4001/api/vehicles/*</td>
                  <td className="py-2 px-3"><Badge variant="secondary">JWT Auth</Badge></td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono text-blue-600">/api/telemetry/*</td>
                  <td className="py-2 px-3 font-mono text-slate-600">http://localhost:4001/api/telemetry/*</td>
                  <td className="py-2 px-3"><Badge variant="secondary">JWT Auth</Badge></td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono text-blue-600">/api/maps/*</td>
                  <td className="py-2 px-3 font-mono text-slate-600">http://localhost:4001/api/maps/*</td>
                  <td className="py-2 px-3"><Badge variant="secondary">JWT Auth</Badge></td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono text-blue-600">/api/notifications/*</td>
                  <td className="py-2 px-3 font-mono text-slate-600">http://localhost:4001/api/notifications/*</td>
                  <td className="py-2 px-3"><Badge variant="secondary">JWT Auth</Badge></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">Sample cURL Command</h4>
              <Button variant="ghost" size="sm" onClick={copyToClipboard} className="h-7 text-xs gap-1 text-slate-500">
                {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? 'Copied' : 'Copy cURL'}</span>
              </Button>
            </div>
            <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg text-xs font-mono overflow-x-auto">
              {sampleCurl}
            </pre>
          </div>
        </Card>

        {/* Documentation Sidebar Information */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileCode2 className="h-4 w-4 text-blue-600" />
                <span>OpenAPI 3.0 Contract</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-600 space-y-2">
              <p>The contract file is permanently maintained at:</p>
              <p className="font-mono bg-slate-100 p-1.5 rounded text-[11px] text-slate-800 break-all">
                docs/openapi.yaml
              </p>
              <p className="text-slate-500 text-[11px] pt-1">
                Swagger UI renders schemas, path definitions, parameters, and live execution directly in the browser.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Security Guidelines</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-600 space-y-2">
              <p>
                1. <strong>API Gateway Key:</strong> Required in <code className="bg-slate-100 px-1 py-0.5 rounded">x-api-key</code> header.
              </p>
              <p>
                2. <strong>JWT Authorization:</strong> Required in <code className="bg-slate-100 px-1 py-0.5 rounded">Authorization: Bearer &lt;token&gt;</code> header.
              </p>
              <p>
                3. <strong>Rate Limiting:</strong> 100 requests per minute per IP address. Exceeding triggers HTTP 429.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
