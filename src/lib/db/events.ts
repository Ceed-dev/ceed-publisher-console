import { getAdminDb } from '@/lib/firebase/admin';
import { AdEvent, EventFilters } from '@/types/event';
import { Timestamp } from 'firebase-admin/firestore';

const COLLECTION = 'events';

export async function createEvent(
  data: Omit<AdEvent, 'eventId' | 'meta'>
): Promise<AdEvent> {
  const db = getAdminDb();
  const eventRef = db.collection(COLLECTION).doc();
  const now = Timestamp.now();

  const event: AdEvent = {
    ...data,
    eventId: eventRef.id,
    meta: {
      createdAt: now,
    },
  };

  await eventRef.set(event);
  return event;
}

export async function getEventsByApp(
  appId: string,
  filters: EventFilters = {}
): Promise<{ events: AdEvent[]; nextCursor?: string }> {
  const db = getAdminDb();
  let query = db.collection(COLLECTION).where('appId', '==', appId);

  if (filters.eventType) {
    query = query.where('eventType', '==', filters.eventType);
  }
  if (filters.requestId) {
    query = query.where('requestId', '==', filters.requestId);
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
  const events = docs.docs.slice(0, limit).map((doc) => doc.data() as AdEvent);
  const nextCursor = docs.docs.length > limit ? docs.docs[limit - 1].id : undefined;

  return { events, nextCursor };
}

export async function countEvents(
  appId: string,
  startDate: Date,
  endDate: Date,
  eventType?: 'impression' | 'click'
): Promise<number> {
  const db = getAdminDb();
  let query = db
    .collection(COLLECTION)
    .where('appId', '==', appId)
    .where('meta.createdAt', '>=', Timestamp.fromDate(startDate))
    .where('meta.createdAt', '<=', Timestamp.fromDate(endDate));

  if (eventType) {
    query = query.where('eventType', '==', eventType);
  }

  const result = await query.count().get();
  return result.data().count;
}
