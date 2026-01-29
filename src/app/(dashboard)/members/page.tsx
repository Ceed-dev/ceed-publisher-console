'use client';

import { useState } from 'react';
import { useOrganization } from '@/hooks/use-organization';
import { useMembersQuery, useInvalidateMembers } from '@/hooks/use-members-query';
import { MemberRole } from '@/types/member';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogFooter,
} from '@/components/ui/dialog';
import { Plus, Loader2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { timestampToDate } from '@/lib/utils/timestamp';
import { useTranslations } from 'next-intl';

export default function MembersPage() {
  const { currentOrg } = useOrganization();
  const { data: members = [], isLoading, error } = useMembersQuery(currentOrg?.orgId);
  const { invalidateMembers } = useInvalidateMembers();
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<MemberRole>('developer');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const t = useTranslations('team');
  const tCommon = useTranslations('common');

  const handleInvite = async () => {
    if (!currentOrg || !inviteEmail.trim()) return;

    setInviting(true);
    setInviteError('');

    try {
      const response = await fetch('/api/dashboard/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId: currentOrg.orgId,
          email: inviteEmail.trim(),
          role: inviteRole,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to invite member');
      }

      // Invalidate cache to refetch updated members
      invalidateMembers(currentOrg.orgId);
      setShowInviteDialog(false);
      setInviteEmail('');
      setInviteRole('developer');
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : 'Failed to invite member');
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: MemberRole) => {
    if (!currentOrg) return;
    try {
      const response = await fetch(`/api/dashboard/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || 'Failed to update role');
      } else {
        // Invalidate cache to refetch updated members
        invalidateMembers(currentOrg.orgId);
      }
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  };

  const handleRemove = async (memberId: string) => {
    if (!currentOrg) return;
    if (!confirm(t('confirmRemove'))) return;

    try {
      const response = await fetch(`/api/dashboard/members/${memberId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || 'Failed to remove member');
      } else {
        // Invalidate cache to refetch updated members
        invalidateMembers(currentOrg.orgId);
      }
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  const getRoleBadge = (role: MemberRole) => {
    switch (role) {
      case 'owner':
        return <Badge variant="default">{t('owner')}</Badge>;
      case 'developer':
        return <Badge variant="outline">{t('developer')}</Badge>;
      case 'analyst':
        return <Badge variant="outline">{t('analyst')}</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  if (isLoading && members.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!currentOrg) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header title={t('title')} />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">
            {t('noOrg')}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header title={t('title')} description={t('description', { orgName: currentOrg.name })} />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-destructive">Error loading members: {String(error)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        title={t('title')}
        description={t('description', { orgName: currentOrg.name })}
      >
        <Button onClick={() => setShowInviteDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t('inviteMember')}
        </Button>
      </Header>

      <div className="flex-1 p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('email')}</TableHead>
              <TableHead>{t('role')}</TableHead>
              <TableHead>{t('joined')}</TableHead>
              <TableHead className="w-[100px]">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.memberId}>
                <TableCell>
                  <div>
                    <p className="font-medium">{member.email}</p>
                    {member.displayName && (
                      <p className="text-sm text-muted-foreground">
                        {member.displayName}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Select
                    value={member.role}
                    onChange={(e) =>
                      handleRoleChange(member.memberId, e.target.value as MemberRole)
                    }
                    options={[
                      { value: 'owner', label: t('owner') },
                      { value: 'developer', label: t('developer') },
                      { value: 'analyst', label: t('analyst') },
                    ]}
                    className="w-32"
                  />
                </TableCell>
                <TableCell>
                  {format(timestampToDate(member.meta.createdAt), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(member.memberId)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showInviteDialog} onClose={() => setShowInviteDialog(false)}>
        <DialogHeader>
          <DialogTitle>{t('inviteTitle')}</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                {t('emailAddress')}
              </label>
              <Input
                id="email"
                type="email"
                placeholder={t('emailPlaceholder')}
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium">
                {t('role')}
              </label>
              <Select
                id="role"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as MemberRole)}
                options={[
                  { value: 'owner', label: t('ownerDesc') },
                  { value: 'developer', label: t('developerDesc') },
                  { value: 'analyst', label: t('analystDesc') },
                ]}
              />
            </div>
            {inviteError && <p className="text-sm text-destructive">{inviteError}</p>}
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
            {tCommon('cancel')}
          </Button>
          <Button onClick={handleInvite} disabled={inviting || !inviteEmail.trim()}>
            {inviting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('sendInvite')}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
