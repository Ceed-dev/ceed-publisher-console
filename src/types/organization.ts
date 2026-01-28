import { FirebaseTimestamp } from './common';

export interface Organization {
  orgId: string;
  name: string;
  meta: {
    createdAt: FirebaseTimestamp;
    updatedAt: FirebaseTimestamp;
  };
}

export interface OrganizationCreate {
  name: string;
}
