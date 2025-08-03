import { logger } from './logger';

interface AuditLogData {
  action: string;
  userId: string | null;
  details: any;
  ipAddress: string;
}

export const createAuditLog = async (data: AuditLogData) => {
  logger.info('Audit Log', {
    action: data.action,
    userId: data.userId,
    details: data.details,
    ipAddress: data.ipAddress,
    timestamp: new Date().toISOString(),
  });
};
