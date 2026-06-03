import { Resend } from "resend";

const resendKey = process.env.RESEND_API_KEY?.trim();

export const resend = resendKey ? new Resend(resendKey) : null;
