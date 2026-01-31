import { getAdminDb } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';

const COLLECTION = 'auditLogs';

export type AuditAction =
  | 'org.create'
  | 'org.update'
  | 'org.delete'
  | 'app.create'
  | 'app.update'
  | 'app.delete'
  | 'member.invite'
  | 'member.update'
  | 'member.remove'
  | 'member.resend_invite'
  | 'member.accept_invite'
  | 'settings.update';

export interface AuditLog {
  logId: string;
  orgId: string;
  userId: string;
  userEmail: string;
  action: AuditAction;
  resourceType: 'organization' | 'app' | 'member' | 'settings';
  resourceId: string;
  changes?: Record<string, unknown>;
  meta: {
    createdAt: Timestamp;
  };
}

export async function createAuditLog(
  data: Omit<AuditLog, 'logId' | 'meta'>
): Promise<AuditLog> {
  const db = getAdminDb();
  const logRef = db.collection(COLLECTION).doc();
  const now = Timestamp.now();

  const log: AuditLog = {
    ...data,
    logId: logRef.id,
    meta: {
      createdAt: now,
    },
  };

  await logRef.set(log);
  return log;
}

export async function getAuditLogsByOrg(
  orgId: string,
  limit = 100
): Promise<AuditLog[]> {
  const db = getAdminDb();
  const docs = await db
    .collection(COLLECTION)
    .where('orgId', '==', orgId)
    .orderBy('meta.createdAt', 'desc')
    .limit(limit)
    .get();

  return docs.docs.map((doc) => doc.data() as AuditLog);
}
