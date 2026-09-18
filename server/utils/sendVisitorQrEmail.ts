import nodemailer from "nodemailer";
import QRCode from "qrcode";
import * as Sentry from "@sentry/nuxt";

export type VisitorQrEmailInput = {
  to: string;
  fullName?: string | null;
  registrationId: string;
  eventName: string;
  language?: string | null;
};

function smtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.SMTP_FROM,
  );
}

function createTransport() {
  const port = Number(process.env.SMTP_PORT || "465");
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function buildHtml(input: VisitorQrEmailInput, isEn: boolean) {
  const name = input.fullName?.trim() || (isEn ? "Guest" : "Tamu");
  const greeting = isEn ? `Hello ${name},` : `Halo ${name},`;
  const intro = isEn
    ? `Your registration for <strong>${input.eventName}</strong> is confirmed.`
    : `Pendaftaran Anda untuk <strong>${input.eventName}</strong> telah tercatat.`;
  const idLabel = isEn ? "Registration ID" : "Nomor registrasi";
  const qrHint = isEn
    ? "Show this QR code at the event entrance for check-in. Do not share it with others."
    : "Tunjukkan QR code ini saat check-in di pintu acara. Jangan bagikan ke orang lain.";
  const footer = isEn
    ? "If you did not register, you can ignore this email."
    : "Jika Anda tidak mendaftar, abaikan email ini.";

  return `
<!DOCTYPE html>
<html>
<body style="font-family: system-ui, sans-serif; color: #1a1a1a; line-height: 1.5;">
  <p>${greeting}</p>
  <p>${intro}</p>
  <p><strong>${idLabel}:</strong> ${input.registrationId}</p>
  <p style="text-align: center; margin: 24px 0;">
    <img src="cid:visitor-qr" alt="QR ${input.registrationId}" width="220" height="220" style="display: inline-block;" />
  </p>
  <p>${qrHint}</p>
  <p style="color: #666; font-size: 13px;">${footer}</p>
</body>
</html>`.trim();
}

/**
 * Send visitor registration QR by email.
 * Returns true if sent; false if SMTP not configured or send failed.
 * Never throws — callers must not fail RSVP on email errors.
 */
export async function sendVisitorQrEmail(
  input: VisitorQrEmailInput,
): Promise<boolean> {
  if (!input.to?.trim() || !input.registrationId) return false;
  if (!smtpConfigured()) return false;

  try {
    const qrBuffer = await QRCode.toBuffer(input.registrationId, {
      type: "png",
      width: 440,
      margin: 2,
      errorCorrectionLevel: "M",
    });

    const isEn = (input.language || "id").toLowerCase().startsWith("en");
    const subject = isEn
      ? `${input.eventName} — Your check-in QR`
      : `${input.eventName} — QR check-in Anda`;

    const transport = createTransport();
    await transport.sendMail({
      from: process.env.SMTP_FROM,
      to: input.to.trim(),
      subject,
      html: buildHtml(input, isEn),
      text: [
        isEn ? `Hello ${input.fullName || "Guest"},` : `Halo ${input.fullName || "Tamu"},`,
        "",
        isEn
          ? `Your registration for ${input.eventName} is confirmed.`
          : `Pendaftaran Anda untuk ${input.eventName} telah tercatat.`,
        `${isEn ? "Registration ID" : "Nomor registrasi"}: ${input.registrationId}`,
        "",
        isEn
          ? "Show the attached QR at check-in."
          : "Tunjukkan QR terlampir saat check-in.",
      ].join("\n"),
      attachments: [
        {
          filename: `${input.registrationId}.png`,
          content: qrBuffer,
          cid: "visitor-qr",
          contentType: "image/png",
        },
      ],
    });

    return true;
  } catch (error) {
    Sentry.captureException(error);
    console.error("[sendVisitorQrEmail]", error);
    return false;
  }
}
