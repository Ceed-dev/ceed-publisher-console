import { getAdminDb } from '@/lib/firebase/admin';
import { App, AppCreate, AppUpdate, AppSettings } from '@/types/app';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

const COLLECTION = 'apps';

const DEFAULT_SETTINGS: AppSettings = {
  cooldownSeconds: 30,
  allowedOrigins: [],
  supportedLanguages: ['eng'],
  contextLoggingMode: 'none',
};

export async function createApp(orgId: string, data: AppCreate): Promise<App> {
  const db = getAdminDb();
  const appRef = db.collection(COLLECTION).doc();
  const now = Timestamp.now();

  const app: App = {
    appId: appRef.id,
    orgId,
    appName: data.appName,
    platforms: data.platforms,
    status: 'active',
    settings: { ...DEFAULT_SETTINGS },
    meta: {
      createdAt: now,
      updatedAt: now,
    },
  };

  await appRef.set(app);
  return app;
}

export async function getApp(appId: string): Promise<App | null> {
  const db = getAdminDb();
  const doc = await db.collection(COLLECTION).doc(appId).get();
  if (!doc.exists) return null;
  return doc.data() as App;
}

export async function getAppsByOrg(orgId: string): Promise<App[]> {
  const db = getAdminDb();
  const docs = await db
    .collection(COLLECTION)
    .where('orgId', '==', orgId)
    .orderBy('meta.createdAt', 'desc')
    .get();
  return docs.docs.map((doc) => doc.data() as App);
}

export async function updateApp(appId: string, updates: AppUpdate): Promise<void> {
  const db = getAdminDb();
  const updateData: Record<string, unknown> = {
    'meta.updatedAt': FieldValue.serverTimestamp(),
  };

  if (updates.appName !== undefined) {
    updateData.appName = updates.appName;
  }
  if (updates.platforms !== undefined) {
    updateData.platforms = updates.platforms;
  }
  if (updates.status !== undefined) {
    updateData.status = updates.status;
  }
  if (updates.settings !== undefined) {
    Object.entries(updates.settings).forEach(([key, value]) => {
      if (value !== undefined) {
        updateData[`settings.${key}`] = value;
      }
    });
  }

  await db.collection(COLLECTION).doc(appId).update(updateData);
}

export async function deleteApp(appId: string): Promise<void> {
  const db = getAdminDb();
  await db.collection(COLLECTION).doc(appId).delete();
}
