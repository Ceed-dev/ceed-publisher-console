import { FirebaseTimestamp } from './common';

export type MemberRole = 'owner' | 'developer' | 'analyst';
export type MemberStatus = 'pending' | 'active';

export interface OrganizationMember {
  memberId: string;
  orgId: string;
  userId: string;
  email: string;
  displayName?: string;
  role: MemberRole;
  status: MemberStatus;
  inviteToken?: string;
  inviteExpiresAt?: FirebaseTimestamp;
  invitedBy?: string;
  meta: {
    createdAt: FirebaseTimestamp;
    updatedAt: FirebaseTimestamp;
    acceptedAt?: FirebaseTimestamp;
  };
}

export interface MemberInvite {
  email: string;
  role: MemberRole;
}
