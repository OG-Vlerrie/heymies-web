import type { CreateEmailResponse } from "resend";
import { resend } from "@/lib/resend";

type DemoLeadEmailInput = {
  name: string;
  agencyName: string;
  email: string;
  phone: string;
  city: string;
  message: string;
  source: string;
  sendConfirmation?: boolean;
};

type EmailSendError = {
  target: "internal" | "confirmation" | "config";
  message: string;
};

export type DemoLeadEmailResult = {
  ok: boolean;
  errors: EmailSendError[];
};

export async function sendDemoLeadEmails({
  name,
  agencyName,
  email,
  phone,
  city,
  message,
  source,
  sendConfirmation = true,
}: DemoLeadEmailInput): Promise<DemoLeadEmailResult> {
  const errors: EmailSendError[] = [];
  const from = process.env.EMAIL_FROM?.trim();
  const internalEmail = process.env.INTERNAL_LEADS_EMAIL?.trim();

  if (!resend) {
    return {
      ok: false,
      errors: [{ target: "config", message: "RESEND_API_KEY is not configured." }],
    };
  }

  if (!from) {
    return {
      ok: false,
      errors: [{ target: "config", message: "EMAIL_FROM is not configured." }],
    };
  }

  if (!internalEmail) {
    return {
      ok: false,
      errors: [{ target: "config", message: "INTERNAL_LEADS_EMAIL is not configured." }],
    };
  }

  try {
    const result = await resend.emails.send({
      from,
      to: [internalEmail],
      subject: "New HeyMies demo lead",
      text: [
        "New HeyMies demo lead",
        "",
        `Name: ${field(name)}`,
        `Agency name: ${field(agencyName)}`,
        `Email: ${field(email)}`,
        `Phone: ${field(phone)}`,
        `City: ${field(city)}`,
        `Source: ${field(source)}`,
        "",
        "Message:",
        field(message),
      ].join("\n"),
      html: `
        <h2>New HeyMies demo lead</h2>
        <p><strong>Name:</strong> ${escapeHtml(field(name))}</p>
        <p><strong>Agency name:</strong> ${escapeHtml(field(agencyName))}</p>
        <p><strong>Email:</strong> ${escapeHtml(field(email))}</p>
        <p><strong>Phone:</strong> ${escapeHtml(field(phone))}</p>
        <p><strong>City:</strong> ${escapeHtml(field(city))}</p>
        <p><strong>Source:</strong> ${escapeHtml(field(source))}</p>
        <p><strong>Message:</strong><br />${escapeHtml(field(message)).replaceAll("\n", "<br />")}</p>
      `,
    });

    const error = responseError(result);
    if (error) errors.push({ target: "internal", message: error });
  } catch (error) {
    errors.push({ target: "internal", message: errorMessage(error) });
  }

  if (sendConfirmation) {
    try {
      const result = await resend.emails.send({
        from,
        to: [email],
        subject: "Thanks for your interest in HeyMies",
        text:
          "Thanks for reaching out. We'll contact you shortly to show you how HeyMies helps agents identify and nurture serious buyers.",
        html: `
          <p>Thanks for reaching out. We'll contact you shortly to show you how HeyMies helps agents identify and nurture serious buyers.</p>
          <p><strong>HeyMies</strong></p>
        `,
      });

      const error = responseError(result);
      if (error) errors.push({ target: "confirmation", message: error });
    } catch (error) {
      errors.push({ target: "confirmation", message: errorMessage(error) });
    }
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}

function field(value: string) {
  return value.trim() || "-";
}

function errorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error.trim()) return error;
  return "Failed to send demo lead email.";
}

function responseError(result: CreateEmailResponse) {
  return result.error?.message ?? null;
}

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
