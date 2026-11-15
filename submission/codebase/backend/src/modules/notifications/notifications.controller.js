import { mockSmsService } from './mockSms.service.js';
import { successResponse } from '../../utils/response.js';

export async function listNotificationsController(req, res, next) {
  try {
    const limit = parseInt(req.query.limit || '50', 10);
    const status = req.query.status || null;
    const notifications = await mockSmsService.getNotifications({ limit, status });
    return successResponse(res, notifications, 200, 'Notifications retrieved');
  } catch (err) {
    next(err);
  }
}

export async function simulateSmsController(req, res, next) {
  try {
    const { recipient, message, simulateFailure } = req.body;
    const result = await mockSmsService.sendSms({
      recipient: recipient || '+14155551234',
      message: message || 'Simulated test alert dispatched from Fleet Management console.',
      simulateFailure: Boolean(simulateFailure)
    });
    return successResponse(res, result, 201, 'Simulated SMS processed');
  } catch (err) {
    next(err);
  }
}
