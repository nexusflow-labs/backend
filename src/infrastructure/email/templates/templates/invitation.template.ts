import { InvitationEmailData } from '../../types/email.types';

export function renderInvitationHtml(data: InvitationEmailData): string {
  const expiresAtFormatted = data.expiresAt.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're Invited to Join ${data.workspaceName}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .card {
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      padding: 40px;
    }
    .logo {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo h1 {
      color: #4F46E5;
      font-size: 28px;
      margin: 0;
    }
    h2 {
      color: #1f2937;
      font-size: 24px;
      margin: 0 0 20px 0;
    }
    p {
      color: #4b5563;
      margin: 0 0 16px 0;
    }
    .highlight {
      font-weight: 600;
      color: #1f2937;
    }
    .button {
      display: inline-block;
      background-color: #4F46E5;
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 16px;
      margin: 24px 0;
    }
    .button:hover {
      background-color: #4338CA;
    }
    .button-container {
      text-align: center;
    }
    .expiry-notice {
      background-color: #FEF3C7;
      border: 1px solid #F59E0B;
      border-radius: 6px;
      padding: 12px 16px;
      margin-top: 24px;
    }
    .expiry-notice p {
      color: #92400E;
      margin: 0;
      font-size: 14px;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }
    .footer p {
      color: #9ca3af;
      font-size: 12px;
    }
    .link-fallback {
      word-break: break-all;
      color: #6b7280;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">
        <h1>NexusFlow</h1>
      </div>

      <h2>You're Invited!</h2>

      <p>
        <span class="highlight">${data.inviterName}</span> has invited you to join
        the workspace <span class="highlight">${data.workspaceName}</span> on NexusFlow.
      </p>

      <p>
        NexusFlow is a powerful project management platform that helps teams collaborate
        efficiently and deliver projects on time.
      </p>

      <div class="button-container">
        <a href="${data.inviteLink}" class="button">Accept Invitation</a>
      </div>

      <p class="link-fallback">
        If the button doesn't work, copy and paste this link into your browser:<br>
        ${data.inviteLink}
      </p>

      <div class="expiry-notice">
        <p>This invitation will expire on ${expiresAtFormatted}.</p>
      </div>

      <div class="footer">
        <p>
          If you didn't expect this invitation, you can safely ignore this email.
        </p>
        <p>&copy; ${new Date().getFullYear()} NexusFlow. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function renderInvitationText(data: InvitationEmailData): string {
  const expiresAtFormatted = data.expiresAt.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return `
You're Invited to Join ${data.workspaceName}!

${data.inviterName} has invited you to join the workspace "${data.workspaceName}" on NexusFlow.

NexusFlow is a powerful project management platform that helps teams collaborate efficiently and deliver projects on time.

Accept the invitation by clicking the link below:
${data.inviteLink}

This invitation will expire on ${expiresAtFormatted}.

If you didn't expect this invitation, you can safely ignore this email.

---
NexusFlow - Project Management & Business Operations
  `.trim();
}
