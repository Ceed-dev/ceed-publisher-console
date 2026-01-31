'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, CheckCircle2, XCircle, AlertCircle, Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';

type InviteState =
  | 'loading'
  | 'invalid'
  | 'expired'
  | 'already_accepted'
  | 'ready'
  | 'signing_in'
  | 'accepting'
  | 'success'
  | 'email_mismatch'
  | 'error';

interface InvitationDetails {
  email: string;
  role: string;
  orgName: string;
  orgId: string;
}

function AcceptInviteContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { user, loading: authLoading, signIn } = useAuth();
  const t = useTranslations('invite');

  const [state, setState] = useState<InviteState>('loading');
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [expectedEmail, setExpectedEmail] = useState('');

  const validateInvitation = useCallback(async () => {
    if (!token) {
      setState('invalid');
      return;
    }

    try {
      const response = await fetch(`/api/invites/${token}`);
      const data = await response.json();

      if (!response.ok) {
        if (data.code === 'INVALID_TOKEN') {
          setState('invalid');
        } else if (data.code === 'EXPIRED') {
          setState('expired');
        } else if (data.code === 'ALREADY_ACCEPTED') {
          setState('already_accepted');
        } else {
          setErrorMessage(data.error || 'Failed to validate invitation');
          setState('error');
        }
        return;
      }

      setInvitation(data.invitation);
      setState('ready');
    } catch (error) {
      console.error('Failed to validate invitation:', error);
      setErrorMessage('Failed to validate invitation');
      setState('error');
    }
  }, [token]);

  const acceptInvitation = useCallback(async () => {
    if (!token) return;

    setState('accepting');

    try {
      const response = await fetch(`/api/invites/${token}/accept`, {
        method: 'POST',
      });
      const data = await response.json();

      if (!response.ok) {
        if (data.code === 'EMAIL_MISMATCH') {
          setExpectedEmail(data.expectedEmail);
          setState('email_mismatch');
        } else if (data.code === 'EXPIRED') {
          setState('expired');
        } else if (data.code === 'ALREADY_ACCEPTED') {
          setState('already_accepted');
        } else {
          setErrorMessage(data.error || 'Failed to accept invitation');
          setState('error');
        }
        return;
      }

      setState('success');
      setTimeout(() => {
        window.location.href = '/apps';
      }, 2000);
    } catch (error) {
      console.error('Failed to accept invitation:', error);
      setErrorMessage('Failed to accept invitation');
      setState('error');
    }
  }, [token]);

  useEffect(() => {
    if (!authLoading) {
      validateInvitation();
    }
  }, [authLoading, validateInvitation]);

  useEffect(() => {
    if (state === 'ready' && user && invitation) {
      if (user.email?.toLowerCase() === invitation.email.toLowerCase()) {
        acceptInvitation();
      } else {
        setExpectedEmail(invitation.email);
        setState('email_mismatch');
      }
    }
  }, [state, user, invitation, acceptInvitation]);

  const handleSignIn = async () => {
    setState('signing_in');
    try {
      await signIn();
    } catch (error) {
      console.error('Sign in error:', error);
      setState('ready');
    }
  };

  if (authLoading || state === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-2xl font-bold text-primary-foreground">
            C
          </div>
          {state === 'invalid' && (
            <>
              <XCircle className="mx-auto h-12 w-12 text-destructive" />
              <CardTitle className="text-2xl">{t('invalidTitle')}</CardTitle>
              <CardDescription>{t('invalidDescription')}</CardDescription>
            </>
          )}
          {state === 'expired' && (
            <>
              <AlertCircle className="mx-auto h-12 w-12 text-warning text-yellow-500" />
              <CardTitle className="text-2xl">{t('expiredTitle')}</CardTitle>
              <CardDescription>{t('expiredDescription')}</CardDescription>
            </>
          )}
          {state === 'already_accepted' && (
            <>
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
              <CardTitle className="text-2xl">{t('alreadyAcceptedTitle')}</CardTitle>
              <CardDescription>{t('alreadyAcceptedDescription')}</CardDescription>
            </>
          )}
          {(state === 'ready' || state === 'signing_in') && invitation && (
            <>
              <Mail className="mx-auto h-12 w-12 text-primary" />
              <CardTitle className="text-2xl">{t('title')}</CardTitle>
              <CardDescription>
                {t('description', { orgName: invitation.orgName })}
              </CardDescription>
            </>
          )}
          {state === 'accepting' && (
            <>
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
              <CardTitle className="text-2xl">{t('acceptingTitle')}</CardTitle>
              <CardDescription>{t('acceptingDescription')}</CardDescription>
            </>
          )}
          {state === 'success' && (
            <>
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
              <CardTitle className="text-2xl">{t('successTitle')}</CardTitle>
              <CardDescription>{t('successDescription')}</CardDescription>
            </>
          )}
          {state === 'email_mismatch' && (
            <>
              <AlertCircle className="mx-auto h-12 w-12 text-yellow-500" />
              <CardTitle className="text-2xl">{t('emailMismatchTitle')}</CardTitle>
              <CardDescription>
                {t('emailMismatchDescription', { email: expectedEmail })}
              </CardDescription>
            </>
          )}
          {state === 'error' && (
            <>
              <XCircle className="mx-auto h-12 w-12 text-destructive" />
              <CardTitle className="text-2xl">{t('errorTitle')}</CardTitle>
              <CardDescription>{errorMessage}</CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {(state === 'ready' || state === 'signing_in') && invitation && !user && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4 text-center">
                <p className="text-sm text-muted-foreground">{t('invitedAs')}</p>
                <p className="font-medium">{invitation.email}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {t('role')}: <span className="font-medium capitalize">{invitation.role}</span>
                </p>
              </div>
              <Button
                className="w-full"
                onClick={handleSignIn}
                disabled={state === 'signing_in'}
              >
                {state === 'signing_in' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('signingIn')}
                  </>
                ) : (
                  <>
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    {t('signInWithGoogle')}
                  </>
                )}
              </Button>
            </div>
          )}
          {state === 'already_accepted' && (
            <Button
              className="w-full"
              onClick={() => (window.location.href = '/apps')}
            >
              {t('goToDashboard')}
            </Button>
          )}
          {state === 'email_mismatch' && user && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4 text-center">
                <p className="text-sm text-muted-foreground">{t('currentlySignedInAs')}</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <p className="text-sm text-center text-muted-foreground">
                {t('signOutAndRetry')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AcceptInviteContent />
    </Suspense>
  );
}
