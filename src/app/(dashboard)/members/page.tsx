'use client';

import { useEffect, useState } from 'react';
import { useOrganization } from '@/hooks/use-organization';
import { OrganizationMember, MemberRole } from '@/types/member';
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

export default function MembersPage() {
  const { currentOrg } = useOrganization();
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<MemberRole>('developer');
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState('');

  const fetchMembers = async () => {
    if (!currentOrg) return;

    try {
      const response = await fetch(
        `/api/dashboard/members?orgId=${currentOrg.orgId}`
      );
      if (response.ok) {
        const data = await response.json();
        setMembers(data.members);
      }
    } catch (error) {
      console.error('Failed to fetch members:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [currentOrg]);

  const handleInvite = async () => {
    if (!currentOrg || !inviteEmail.trim()) return;

    setInviting(true);
    setError('');

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

      await fetchMembers();
      setShowInviteDialog(false);
      setInviteEmail('');
      setInviteRole('developer');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to invite member');
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: MemberRole) => {
    try {
      const response = await fetch(`/api/dashboard/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        await fetchMembers();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update role');
      }
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  };

  const handleRemove = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      const response = await fetch(`/api/dashboard/members/${memberId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchMembers();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to remove member');
      }
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  const getRoleBadge = (role: MemberRole) => {
    switch (role) {
      case 'owner':
        return <Badge variant="default">Owner</Badge>;
      case 'developer':
        return <Badge variant="outline">Developer</Badge>;
      case 'analyst':
        return <Badge variant="outline">Analyst</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!currentOrg) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header title="Team" />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">
            Select an organization to manage team members
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        title="Team"
        description={`Manage members of ${currentOrg.name}`}
      >
        <Button onClick={() => setShowInviteDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </Header>

      <div className="flex-1 p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
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
                      { value: 'owner', label: 'Owner' },
                      { value: 'developer', label: 'Developer' },
                      { value: 'analyst', label: 'Analyst' },
                    ]}
                    className="w-32"
                  />
                </TableCell>
                <TableCell>
                  {format(member.meta.createdAt.toDate(), 'MMM d, yyyy')}
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
          <DialogTitle>Invite Team Member</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="colleague@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium">
                Role
              </label>
              <Select
                id="role"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as MemberRole)}
                options={[
                  { value: 'owner', label: 'Owner - Full access' },
                  { value: 'developer', label: 'Developer - Manage apps' },
                  { value: 'analyst', label: 'Analyst - View only' },
                ]}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleInvite} disabled={inviting || !inviteEmail.trim()}>
            {inviting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Invite
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
