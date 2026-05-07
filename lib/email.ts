import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.RESEND_FROM_EMAIL ?? "noreply@example.com";

export type EmailType =
  | "invite"
  | "save-the-date"
  | "rsvp-confirmation"
  | "custom";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  type: EmailType;
}

export async function sendEmail(opts: SendEmailOptions) {
  const { data, error } = await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  });

  if (error) throw new Error(error.message);

  return data?.id ?? null;
}
