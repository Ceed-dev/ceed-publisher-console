import { getAdminDb } from '@/lib/firebase/admin';
import { OrganizationMember, MemberRole } from '@/types/member';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

const COLLECTION = 'organizationMembers';

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

export async function inviteMember(
  orgId: string,
  email: string,
  role: MemberRole,
  userId?: string
): Promise<OrganizationMember> {
  const db = getAdminDb();
  const memberRef = db.collection(COLLECTION).doc();
  const now = Timestamp.now();

  const member: OrganizationMember = {
    memberId: memberRef.id,
    orgId,
    userId: userId || '',
    email,
    role,
    meta: {
      createdAt: now,
      updatedAt: now,
    },
  };

  await memberRef.set(member);
  return member;
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
