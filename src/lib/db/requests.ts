import { getAdminDb } from '@/lib/firebase/admin';
import { AdRequest, RequestFilters } from '@/types/request';
import { Timestamp } from 'firebase-admin/firestore';

const COLLECTION = 'requests';

export async function createRequest(data: Omit<AdRequest, 'requestId' | 'meta'>): Promise<AdRequest> {
  const db = getAdminDb();
  const requestRef = db.collection(COLLECTION).doc();
  const now = Timestamp.now();

  // Filter out undefined values for Firestore compatibility
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  ) as Omit<AdRequest, 'requestId' | 'meta'>;

  const request: AdRequest = {
    ...cleanData,
    requestId: requestRef.id,
    meta: {
      createdAt: now,
    },
  };

  await requestRef.set(request);
  return request;
}

export async function getRequestsByApp(
  appId: string,
  filters: RequestFilters = {}
): Promise<{ requests: AdRequest[]; nextCursor?: string }> {
  const db = getAdminDb();
  let query = db.collection(COLLECTION).where('appId', '==', appId);

  if (filters.status) {
    query = query.where('status', '==', filters.status);
  }
  if (filters.platform) {
    query = query.where('platform', '==', filters.platform);
  }
  if (filters.startDate) {
    query = query.where('meta.createdAt', '>=', Timestamp.fromDate(filters.startDate));
  }
  if (filters.endDate) {
    query = query.where('meta.createdAt', '<=', Timestamp.fromDate(filters.endDate));
  }

  query = query.orderBy('meta.createdAt', 'desc');

  if (filters.cursor) {
    const cursorDoc = await db.collection(COLLECTION).doc(filters.cursor).get();
    if (cursorDoc.exists) {
      query = query.startAfter(cursorDoc);
    }
  }

  const limit = filters.limit || 50;
  query = query.limit(limit + 1);

  const docs = await query.get();
  const requests = docs.docs.slice(0, limit).map((doc) => doc.data() as AdRequest);
  const nextCursor = docs.docs.length > limit ? docs.docs[limit - 1].id : undefined;

  return { requests, nextCursor };
}

export async function getRequest(requestId: string): Promise<AdRequest | null> {
  const db = getAdminDb();
  const doc = await db.collection(COLLECTION).doc(requestId).get();
  if (!doc.exists) return null;
  return doc.data() as AdRequest;
}

export async function countRequests(
  appId: string,
  startDate: Date,
  endDate: Date,
  status?: 'success' | 'error' | 'no_fill'
): Promise<number> {
  const db = getAdminDb();
  let query = db
    .collection(COLLECTION)
    .where('appId', '==', appId)
    .where('meta.createdAt', '>=', Timestamp.fromDate(startDate))
    .where('meta.createdAt', '<=', Timestamp.fromDate(endDate));

  if (status) {
    query = query.where('status', '==', status);
  }

  const result = await query.count().get();
  return result.data().count;
}
