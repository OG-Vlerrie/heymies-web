import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Payload = {
  saleType: "sale" | "rent";
  listingType: string;
  title: string;

  suburb: string;
  city: string;
  province: string;

  price: number;
  deposit?: number | null;
  availableFrom?: string | null;

  bedrooms?: number | null;
  bathrooms?: number | null;
  garages?: number | null;
  parking?: number | null;
  floorSize?: number | null;
  erfSize?: number | null;

  petsAllowed?: boolean;
  furnished?: boolean;
  features?: string[];
};

export async function POST(req: Request) {
  try {
    console.log("AI route called.");
    console.log("OPENAI_API_KEY exists:", Boolean(process.env.OPENAI_API_KEY));

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY in environment" },
        { status: 500 }
      );
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const body = (await req.json()) as Payload;

    const prompt = `
Write a clean, professional South African property listing description.

Rules:
- 120–170 words
- No emojis
- No ALL CAPS
- No hype language
- Mention key specs and location
- If rent: include rent per month, deposit (if provided), and available date (if provided)
- End with a short call-to-action

Property Data:
${JSON.stringify(body, null, 2)}
`.trim();

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
      temperature: 0.6,
      max_output_tokens: 300,
    });

    const text = response.output_text?.trim();

    if (!text) {
      console.error("OpenAI returned empty response:", response);
      return NextResponse.json(
        { error: "OpenAI returned empty response" },
        { status: 500 }
      );
    }

    return NextResponse.json({ description: text });
  } catch (e: any) {
    console.error("AI route error FULL:", e);

    const status =
      e?.status ??
      e?.response?.status ??
      e?.cause?.status ??
      null;

    const message =
      e?.message ??
      e?.response?.data?.error?.message ??
      e?.error?.message ??
      "AI generation failed";

    return NextResponse.json(
      { error: message, status },
      { status: 500 }
    );
  }
}