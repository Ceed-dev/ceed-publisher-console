import { FirebaseTimestamp } from './common';

export type MemberRole = 'owner' | 'developer' | 'analyst';

export interface OrganizationMember {
  memberId: string;
  orgId: string;
  userId: string;
  email: string;
  displayName?: string;
  role: MemberRole;
  meta: {
    createdAt: FirebaseTimestamp;
    updatedAt: FirebaseTimestamp;
  };
}

export interface MemberInvite {
  email: string;
  role: MemberRole;
}
