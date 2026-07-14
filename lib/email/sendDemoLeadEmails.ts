import type { CreateEmailResponse } from "resend";
import { resend } from "@/lib/resend";

type DemoLeadEmailInput = {
  kind?: "demo" | "contact";
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
  kind = "demo",
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
  const internalEmail = process.env.INTERNAL_LEADS_EMAIL?.trim() || "gerhard@vertacore.co.za";
  const isContact = kind === "contact";
  const internalSubject = isContact
    ? "New HeyMies contact message"
    : "New HeyMies demo lead";
  const confirmationSubject = isContact
    ? "Mia received your HeyMies message"
    : "Mia received your HeyMies request";
  const greeting = firstName(name) ? `Hi ${firstName(name)},` : "Hi,";
  const confirmationParagraphs = isContact
    ? [
        greeting,
        "Thanks for reaching out to HeyMies. I've received your message and passed it on to Gerhard so he can come back to you personally.",
        "If there is anything extra you want to add before then, you can reply to this email and it will go straight to Gerhard.",
      ]
    : [
        greeting,
        "Thanks for your interest in HeyMies. I've received your request and shared it with the team so we can help you take the next step.",
        "We'll come back to you shortly with a practical way to see how HeyMies can support your buyer, seller, or agent workflow.",
      ];
  const confirmationText = [...confirmationParagraphs, "Warmly,\nMia from HeyMies"].join("\n\n");

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
    const fields = [
      ["Name", field(name)],
      ...(isContact ? [] : [["Agency name", field(agencyName)]]),
      ["Email", field(email)],
      ["Phone", field(phone)],
      ...(isContact ? [] : [["City", field(city)]]),
      ["Source", field(source)],
    ];

    const result = await resend.emails.send({
      from,
      to: [internalEmail],
      replyTo: email,
      subject: internalSubject,
      text: [
        internalSubject,
        "",
        ...fields.map(([label, value]) => `${label}: ${value}`),
        "",
        "Message:",
        field(message),
      ].join("\n"),
      html: `
        <h2>${escapeHtml(internalSubject)}</h2>
        ${fields
          .map(
            ([label, value]) =>
              `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`
          )
          .join("")}
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
        replyTo: internalEmail,
        subject: confirmationSubject,
        text: confirmationText,
        html: `
          ${confirmationParagraphs
            .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
            .join("")}
          <p>Warmly,<br /><strong>Mia from HeyMies</strong></p>
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

function firstName(value: string) {
  return value.trim().split(/\s+/)[0] ?? "";
}

function errorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error.trim()) return error;
  return "Failed to send lead email.";
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
