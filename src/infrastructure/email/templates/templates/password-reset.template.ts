import { PasswordResetEmailData } from '../../types/email.types';

export function renderPasswordResetHtml(data: PasswordResetEmailData): string {
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
  <title>Reset Your Password</title>
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
    .security-notice {
      background-color: #FEE2E2;
      border: 1px solid #EF4444;
      border-radius: 6px;
      padding: 12px 16px;
      margin-top: 16px;
    }
    .security-notice p {
      color: #991B1B;
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

      <h2>Reset Your Password</h2>

      <p>Hi <span class="highlight">${data.userName}</span>,</p>

      <p>
        We received a request to reset your password for your NexusFlow account.
        Click the button below to create a new password.
      </p>

      <div class="button-container">
        <a href="${data.resetLink}" class="button">Reset Password</a>
      </div>

      <p class="link-fallback">
        If the button doesn't work, copy and paste this link into your browser:<br>
        ${data.resetLink}
      </p>

      <div class="expiry-notice">
        <p>This link will expire on ${expiresAtFormatted}.</p>
      </div>

      <div class="security-notice">
        <p>
          If you didn't request a password reset, please ignore this email or contact
          support if you have concerns about your account security.
        </p>
      </div>

      <div class="footer">
        <p>
          This is an automated message. Please do not reply to this email.
        </p>
        <p>&copy; ${new Date().getFullYear()} NexusFlow. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function renderPasswordResetText(data: PasswordResetEmailData): string {
  const expiresAtFormatted = data.expiresAt.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return `
Reset Your Password

Hi ${data.userName},

We received a request to reset your password for your NexusFlow account.

Click the link below to create a new password:
${data.resetLink}

This link will expire on ${expiresAtFormatted}.

If you didn't request a password reset, please ignore this email or contact support if you have concerns about your account security.

---
NexusFlow - Project Management & Business Operations
  `.trim();
}
