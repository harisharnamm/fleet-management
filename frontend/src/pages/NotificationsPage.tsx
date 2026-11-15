import React, { useState, useEffect } from 'react';
import {
  Bell,
  Send,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Radio,
  AlertTriangle
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { Alert } from '../components/ui/Alert';
import { useAuth } from '../contexts/AuthContext';
import { fleetService } from '../services/fleetService';
import { NotificationRecord } from '../types/fleet';
import { formatDateTime } from '../lib/utils';

export function NotificationsPage() {
  const { isFleetManager } = useAuth();
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dispatch modal state
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [recipient, setRecipient] = useState('+14155551234');
  const [message, setMessage] = useState('CRITICAL DISPATCH: Incident reported for Vehicle FLT-101-TX. Response unit requested.');
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [dispatchSuccessMsg, setDispatchSuccessMsg] = useState<string | null>(null);

  const fetchNotifications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fleetService.getNotifications({ limit: 50 });
      setNotifications(data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load notifications from Gateway.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleSimulateDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setDispatchSuccessMsg(null);

    try {
      const result = await fleetService.simulateSms({
        recipient,
        message,
        simulateFailure
      });
      setShowDispatchModal(false);
      setDispatchSuccessMsg(
        `Simulated SMS ${result.status.toUpperCase()}! Provider message ID: ${result.provider_response?.message_id}`
      );
      fetchNotifications();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to dispatch simulated notification.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <DashboardLayout title="Simulated SMS Notifications">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">SMS Dispatch Log & Delivery Receipts</h2>
          <p className="text-sm text-slate-500">
            Zero-cost simulation engine logging delivery receipts, carrier handshakes, and event triggers
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchNotifications} disabled={isLoading} className="gap-2 bg-white">
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Logs</span>
          </Button>
          {isFleetManager && (
            <Button
              onClick={() => setShowDispatchModal(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white gap-2 shadow-sm"
            >
              <Send className="h-4 w-4" />
              <span>Simulate SMS Alert</span>
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive" title="Notification Service Error">
          {error}
        </Alert>
      )}

      {dispatchSuccessMsg && (
        <Alert variant="success" title="Carrier Handshake Logged">
          {dispatchSuccessMsg}
        </Alert>
      )}

      {/* Notifications History Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Delivery Log ({notifications.length})</CardTitle>
              <p className="text-xs text-slate-500">Stored in database table 'notifications' with provider metadata</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3 py-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-14 w-full rounded-md" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">No notifications dispatched yet</p>
              <p className="text-xs text-slate-500 mt-1">
                Trigger a status change on a vehicle or click 'Simulate SMS Alert' to test delivery receipts.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Recipient</th>
                    <th className="py-3 px-3">Message Content</th>
                    <th className="py-3 px-3">Simulated Provider Receipt</th>
                    <th className="py-3 px-3">Carrier</th>
                    <th className="py-3 px-3 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {notifications.map((n) => (
                    <tr key={n.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3">
                        <Badge
                          variant={n.status === 'delivered' ? 'success' : n.status === 'failed' ? 'destructive' : 'warning'}
                          className="capitalize text-[10px] gap-1"
                        >
                          {n.status === 'delivered' ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : n.status === 'failed' ? (
                            <XCircle className="h-3 w-3" />
                          ) : (
                            <Clock className="h-3 w-3" />
                          )}
                          <span>{n.status}</span>
                        </Badge>
                      </td>
                      <td className="py-3 px-3 font-mono font-semibold text-slate-800">{n.recipient}</td>
                      <td className="py-3 px-3 max-w-md text-slate-700">
                        <p className="line-clamp-2 leading-relaxed">{n.message}</p>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                        {n.provider_response?.message_id ? (
                          <div>
                            <span className="text-blue-700">{n.provider_response.message_id}</span>
                            <span className="text-slate-400 block text-[10px]">
                              {n.provider_response.latency_ms}ms latency • {n.provider_response.status_code}
                            </span>
                          </div>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-medium">
                        {n.provider_response?.carrier || 'Simulated Carrier'}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-500 whitespace-nowrap">
                        {formatDateTime(n.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Simulate SMS Dispatch Modal */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white shadow-2xl">
            <CardHeader>
              <CardTitle className="text-lg">Simulate Custom SMS Alert</CardTitle>
              <p className="text-xs text-slate-500">
                Dispatches simulated alert through custom MockSmsService and stores receipt in PostgreSQL.
              </p>
            </CardHeader>
            <form onSubmit={handleSimulateDispatch}>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Recipient Phone Number</label>
                  <Input
                    required
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="+14155551234"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Alert Message</label>
                  <textarea
                    required
                    rows={3}
                    className="w-full rounded-md border border-slate-300 p-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="simFail"
                    checked={simulateFailure}
                    onChange={(e) => setSimulateFailure(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600"
                  />
                  <label htmlFor="simFail" className="text-xs text-slate-600 cursor-pointer">
                    Simulate Carrier Failure (Test 'failed' status receipt)
                  </label>
                </div>
              </CardContent>
              <div className="p-4 border-t border-slate-100 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowDispatchModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSending} className="bg-blue-600 hover:bg-blue-500 text-white gap-2">
                  <Send className="h-3.5 w-3.5" />
                  <span>{isSending ? 'Transmitting...' : 'Dispatch SMS'}</span>
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
