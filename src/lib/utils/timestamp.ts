import { FirebaseTimestamp } from '@/types/common';

/**
 * Converts a Firebase Timestamp to a JavaScript Date.
 * Handles both native Firestore Timestamp objects and serialized timestamps from API responses.
 */
export function timestampToDate(timestamp: FirebaseTimestamp): Date {
  if ('toDate' in timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  // Handle serialized timestamp from API (has _seconds and _nanoseconds)
  return new Date(timestamp._seconds * 1000);
}
