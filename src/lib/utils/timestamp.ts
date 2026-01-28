import { FirebaseTimestamp } from '@/types/common';

/**
 * Converts a Firebase Timestamp to a JavaScript Date.
 * Handles both native Firestore Timestamp objects and serialized timestamps from API responses.
 */
export function timestampToDate(timestamp: FirebaseTimestamp): Date {
  // Native Firestore Timestamp with toDate method
  if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  // Serialized timestamp from API (has _seconds and _nanoseconds)
  if (timestamp._seconds !== undefined) {
    return new Date(timestamp._seconds * 1000);
  }
  // Fallback to seconds property
  return new Date(timestamp.seconds * 1000);
}
