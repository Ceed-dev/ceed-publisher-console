import { getAdminDb } from '@/lib/firebase/admin';
import { Organization } from '@/types/organization';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

const COLLECTION = 'organizations';

export async function createOrganization(
  name: string,
  userId: string,
  userEmail: string
): Promise<Organization> {
  const db = getAdminDb();
  const orgRef = db.collection(COLLECTION).doc();
  const now = Timestamp.now();

  const organization: Omit<Organization, 'orgId'> & { orgId: string } = {
    orgId: orgRef.id,
    name,
    meta: {
      createdAt: now,
      updatedAt: now,
    },
  };

  const batch = db.batch();

  batch.set(orgRef, organization);

  const memberRef = db.collection('organizationMembers').doc();
  batch.set(memberRef, {
    memberId: memberRef.id,
    orgId: orgRef.id,
    userId,
    email: userEmail,
    role: 'owner',
    meta: {
      createdAt: now,
      updatedAt: now,
    },
  });

  await batch.commit();

  return organization as Organization;
}

export async function getOrganization(orgId: string): Promise<Organization | null> {
  const db = getAdminDb();
  const doc = await db.collection(COLLECTION).doc(orgId).get();

  if (!doc.exists) return null;
  return doc.data() as Organization;
}

export async function getOrganizationsByUser(userId: string): Promise<Organization[]> {
  const db = getAdminDb();

  const memberDocs = await db
    .collection('organizationMembers')
    .where('userId', '==', userId)
    .get();

  if (memberDocs.empty) return [];

  const orgIds = memberDocs.docs.map((doc) => doc.data().orgId);

  const orgDocs = await db
    .collection(COLLECTION)
    .where('orgId', 'in', orgIds)
    .get();

  return orgDocs.docs.map((doc) => doc.data() as Organization);
}

export async function updateOrganization(
  orgId: string,
  updates: { name?: string }
): Promise<void> {
  const db = getAdminDb();
  await db
    .collection(COLLECTION)
    .doc(orgId)
    .update({
      ...updates,
      'meta.updatedAt': FieldValue.serverTimestamp(),
    });
}

export async function deleteOrganization(orgId: string): Promise<void> {
  const db = getAdminDb();
  const batch = db.batch();

  batch.delete(db.collection(COLLECTION).doc(orgId));

  const members = await db
    .collection('organizationMembers')
    .where('orgId', '==', orgId)
    .get();
  members.docs.forEach((doc) => batch.delete(doc.ref));

  const apps = await db.collection('apps').where('orgId', '==', orgId).get();
  apps.docs.forEach((doc) => batch.delete(doc.ref));

  await batch.commit();
}
