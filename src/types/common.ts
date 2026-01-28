// Native Firestore Timestamp interface
export interface FirebaseTimestamp {
  seconds: number;
  nanoseconds: number;
  toDate?: () => Date;
  // Serialized format from API (JSON)
  _seconds?: number;
  _nanoseconds?: number;
}
