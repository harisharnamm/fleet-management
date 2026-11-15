import crypto from 'crypto';
import { query, pool } from '../../config/db.js';
import { activeStore } from '../../config/seedStore.js';

/**
 * Mock SMS Notification Service
 * Dispatches simulated SMS notifications, records carrier receipts, and persists status to Neon PostgreSQL.
 */
class MockSmsService {
  /**
   * Dispatch a simulated SMS notification
   */
  async sendSms({ recipient, message, eventId = null, simulateFailure = false }) {
    const messageId = `MOCK-SMS-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
    const carriers = ['Verizon Wireless', 'AT&T Mobility', 'T-Mobile US', 'Vodafone'];
    const chosenCarrier = carriers[Math.floor(Math.random() * carriers.length)];
    const simulatedLatencyMs = Math.floor(Math.random() * 120) + 40;

    const isInvalidNumber = recipient && recipient.includes('999');
    const isSuccess = !simulateFailure && !isInvalidNumber;

    const status = isSuccess ? 'delivered' : 'failed';
    const providerResponse = {
      mock_provider: 'SimulatedSMS-v2',
      message_id: messageId,
      carrier: chosenCarrier,
      latency_ms: simulatedLatencyMs,
      status_code: isSuccess ? 'DELIVRD' : 'UNDELIV',
      error_reason: isSuccess ? null : 'Simulated carrier handset unreachable or invalid MSISDN',
      timestamp: new Date().toISOString()
    };

    const id = crypto.randomUUID();
    const sentAt = isSuccess ? new Date().toISOString() : null;

    let notificationRecord = {
      id,
      recipient,
      message,
      channel: 'sms',
      status,
      event_id: eventId,
      provider_response: providerResponse,
      sent_at: sentAt,
      created_at: new Date().toISOString()
    };

    // Persist in Neon PostgreSQL
    if (pool) {
      try {
        const res = await query(
          `INSERT INTO notifications (id, recipient, message, channel, status, event_id, provider_response, sent_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING *`,
          [id, recipient, message, 'sms', status, eventId, JSON.stringify(providerResponse), sentAt]
        );
        if (res.rows.length > 0) {
          notificationRecord = res.rows[0];
          return notificationRecord;
        }
      } catch (err) {
        console.warn('[MockSMS] Neon DB insert failed, using fallback:', err.message);
      }
    }

    activeStore.notifications.unshift(notificationRecord);
    return notificationRecord;
  }

  /**
   * Retrieve notification log history from Neon PostgreSQL
   */
  async getNotifications({ limit = 50, status = null } = {}) {
    if (pool) {
      try {
        let sql = 'SELECT * FROM notifications';
        const params = [];
        if (status) {
          sql += ' WHERE status = $1';
          params.push(status);
        }
        sql += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
        params.push(limit);

        const res = await query(sql, params);
        return res.rows;
      } catch (err) {
        console.warn('[MockSMS] Neon DB query failed, using fallback:', err.message);
      }
    }

    let records = [...activeStore.notifications];
    if (status) {
      records = records.filter((n) => n.status === status);
    }
    return records.slice(0, limit);
  }
}

export const mockSmsService = new MockSmsService();
