import { getAdminDb } from '@/lib/firebase/admin';

const COLLECTION = 'mail';

interface InviteEmailData {
  to: string;
  inviterEmail: string;
  orgName: string;
  inviteToken: string;
  baseUrl: string;
}

export async function sendInviteEmail({
  to,
  inviterEmail,
  orgName,
  inviteToken,
  baseUrl,
}: InviteEmailData): Promise<string> {
  const db = getAdminDb();
  const mailRef = db.collection(COLLECTION).doc();

  const inviteUrl = `${baseUrl}/invite/accept?token=${inviteToken}`;

  await mailRef.set({
    to,
    message: {
      subject: `You've been invited to join ${orgName} on Ceed Publisher Console`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1a1a1a; margin-bottom: 24px;">You're Invited!</h2>

          <p style="color: #4a4a4a; font-size: 16px; line-height: 1.5;">
            <strong>${inviterEmail}</strong> has invited you to join <strong>${orgName}</strong> on Ceed Publisher Console.
          </p>

          <p style="color: #4a4a4a; font-size: 16px; line-height: 1.5;">
            Click the button below to accept this invitation and join the team:
          </p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${inviteUrl}"
               style="background-color: #0070f3; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">
              Accept Invitation
            </a>
          </div>

          <p style="color: #6a6a6a; font-size: 14px; line-height: 1.5;">
            Or copy and paste this link into your browser:<br/>
            <a href="${inviteUrl}" style="color: #0070f3; word-break: break-all;">${inviteUrl}</a>
          </p>

          <p style="color: #6a6a6a; font-size: 14px; line-height: 1.5; margin-top: 32px;">
            This invitation will expire in 7 days.
          </p>

          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 32px 0;" />

          <p style="color: #9a9a9a; font-size: 12px;">
            If you didn't expect this invitation, you can safely ignore this email.
          </p>
        </div>
      `,
      text: `You've been invited to join ${orgName} on Ceed Publisher Console!

${inviterEmail} has invited you to join their team.

Click this link to accept the invitation:
${inviteUrl}

This invitation will expire in 7 days.

If you didn't expect this invitation, you can safely ignore this email.`,
    },
  });

  return mailRef.id;
}
