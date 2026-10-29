import nodemailer from 'nodemailer';

export async function sendAdminNotification(subject: string, htmlContent: string) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL;

  // No-op silently if SMTP is not configured
  if (!host || !user || !pass || !adminEmail) {
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: `"HackX System" <${user}>`,
      to: adminEmail,
      subject,
      html: htmlContent,
    });
  } catch (error) {
    console.error('SMTP Mailer warning:', error);
  }
}
