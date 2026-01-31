import { getAdminDb } from '@/lib/firebase/admin';
import { OrganizationMember, MemberRole, MemberStatus } from '@/types/member';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { randomBytes } from 'crypto';

const COLLECTION = 'organizationMembers';
const INVITE_EXPIRY_DAYS = 7;

export async function getMembersByOrg(orgId: string): Promise<OrganizationMember[]> {
  const db = getAdminDb();
  const docs = await db.collection(COLLECTION).where('orgId', '==', orgId).get();
  return docs.docs.map((doc) => doc.data() as OrganizationMember);
}

export async function getMember(memberId: string): Promise<OrganizationMember | null> {
  const db = getAdminDb();
  const doc = await db.collection(COLLECTION).doc(memberId).get();
  if (!doc.exists) return null;
  return doc.data() as OrganizationMember;
}

export async function getMemberByUserAndOrg(
  userId: string,
  orgId: string
): Promise<OrganizationMember | null> {
  const db = getAdminDb();
  const docs = await db
    .collection(COLLECTION)
    .where('userId', '==', userId)
    .where('orgId', '==', orgId)
    .limit(1)
    .get();

  if (docs.empty) return null;
  return docs.docs[0].data() as OrganizationMember;
}

export async function getUserMemberships(userId: string): Promise<OrganizationMember[]> {
  const db = getAdminDb();
  const docs = await db.collection(COLLECTION).where('userId', '==', userId).get();
  return docs.docs.map((doc) => doc.data() as OrganizationMember);
}

function generateInviteToken(): string {
  return randomBytes(32).toString('hex');
}

function getInviteExpiration(): Timestamp {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRY_DAYS);
  return Timestamp.fromDate(expiresAt);
}

export async function inviteMember(
  orgId: string,
  email: string,
  role: MemberRole,
  invitedBy: string,
  userId?: string
): Promise<OrganizationMember> {
  const db = getAdminDb();
  const memberRef = db.collection(COLLECTION).doc();
  const now = Timestamp.now();
  const inviteToken = generateInviteToken();
  const inviteExpiresAt = getInviteExpiration();

  const member: OrganizationMember = {
    memberId: memberRef.id,
    orgId,
    userId: userId || '',
    email,
    role,
    status: userId ? 'active' : 'pending',
    inviteToken: userId ? undefined : inviteToken,
    inviteExpiresAt: userId ? undefined : inviteExpiresAt,
    invitedBy: userId ? undefined : invitedBy,
    meta: {
      createdAt: now,
      updatedAt: now,
    },
  };

  await memberRef.set(member);
  return member;
}

export async function getMemberByInviteToken(
  token: string
): Promise<OrganizationMember | null> {
  const db = getAdminDb();
  const docs = await db
    .collection(COLLECTION)
    .where('inviteToken', '==', token)
    .limit(1)
    .get();

  if (docs.empty) return null;
  return docs.docs[0].data() as OrganizationMember;
}

export async function acceptInvitation(
  memberId: string,
  userId: string,
  displayName?: string
): Promise<void> {
  const db = getAdminDb();
  await db.collection(COLLECTION).doc(memberId).update({
    userId,
    displayName: displayName || null,
    status: 'active' as MemberStatus,
    inviteToken: FieldValue.delete(),
    inviteExpiresAt: FieldValue.delete(),
    'meta.updatedAt': FieldValue.serverTimestamp(),
    'meta.acceptedAt': FieldValue.serverTimestamp(),
  });
}

export async function updateInviteToken(
  memberId: string
): Promise<{ token: string; expiresAt: Timestamp }> {
  const db = getAdminDb();
  const newToken = generateInviteToken();
  const newExpiresAt = getInviteExpiration();

  await db.collection(COLLECTION).doc(memberId).update({
    inviteToken: newToken,
    inviteExpiresAt: newExpiresAt,
    'meta.updatedAt': FieldValue.serverTimestamp(),
  });

  return { token: newToken, expiresAt: newExpiresAt };
}

export async function updateMemberRole(memberId: string, role: MemberRole): Promise<void> {
  const db = getAdminDb();
  await db.collection(COLLECTION).doc(memberId).update({
    role,
    'meta.updatedAt': FieldValue.serverTimestamp(),
  });
}

export async function removeMember(memberId: string): Promise<void> {
  const db = getAdminDb();
  await db.collection(COLLECTION).doc(memberId).delete();
}

export async function countOwners(orgId: string): Promise<number> {
  const db = getAdminDb();
  const result = await db
    .collection(COLLECTION)
    .where('orgId', '==', orgId)
    .where('role', '==', 'owner')
    .count()
    .get();
  return result.data().count;
}
