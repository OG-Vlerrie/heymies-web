"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

/* ----------------------------- HELPERS ----------------------------- */

function formatZAR(n: number) {
  if (!isFinite(n)) return "R 0";
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(n)));
}

function clampNum(v: string) {
  const n = Number(String(v).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function monthlyPayment(principal: number, annualRatePct: number, years: number) {
  const r = (annualRatePct / 100) / 12;
  const n = Math.max(1, Math.round(years * 12));
  if (r === 0) return principal / n;
  return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

/** Transfer Duty per SARS brackets effective 1 April 2025 */
function transferDuty_2025(price: number) {
  const p = Math.max(0, price);

  if (p <= 1_210_000) return 0;
  if (p <= 1_663_800) return 0.03 * (p - 1_210_000);
  if (p <= 2_329_300) return 13_614 + 0.06 * (p - 1_663_800);
  if (p <= 2_994_800) return 53_544 + 0.08 * (p - 2_329_300);
  if (p <= 13_310_000) return 106_784 + 0.11 * (p - 2_994_800);
  return 1_241_456 + 0.13 * (p - 13_310_000);
}

/* ----------------------------- PAGE ----------------------------- */

export default function ForBuyersPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <Hero />

      <Section title="Buying a home in South Africa" tone="blue">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <strong>What you’ll typically need</strong>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li>• SA ID / passport (and co-applicant if applicable)</li>
              <li>• Proof of income (payslips or accountant letter if self-employed)</li>
              <li>• Bank statements (commonly 3–6 months)</li>
              <li>• Proof of address (FICA)</li>
              <li>• Deposit (often improves approval + rate)</li>
              <li>• Credit record matters</li>
            </ul>
          </Card>

          <Card>
            <strong>How the process usually works</strong>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-700">
              <li>Offer to Purchase accepted</li>
              <li>Bond application + approval</li>
              <li>Conveyancer appointed (transfer + bond registration)</li>
              <li>Costs paid (duty/fees)</li>
              <li>Deeds Office registration</li>
              <li>Keys + occupation</li>
            </ol>
          </Card>
        </div>

        <p className="mt-6 text-sm text-slate-600">
          Note: If the seller is VAT-registered and the sale is a VAT transaction (often developer sales),
          transfer duty is typically not payable (your conveyancer confirms).
        </p>
      </Section>

      {/* Bond calculator BEFORE transfer cost calculator */}
      <Section title="Bond repayment calculator" tone="green">
        <BondRepaymentCalc />
      </Section>

      <Section title="Transfer Cost Calculator" tone="green">
        <TransferCostCalculator />
      </Section>

      <FinalCTA />
      <Footer />
    </main>
  );
}

/* ----------------------------- HERO ----------------------------- */

function Hero() {
  return (
    <section className="relative w-full overflow-hidden">
      <div aria-hidden className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at top, rgba(16,185,129,0.45) 0%, rgba(16,185,129,0.25) 35%, rgba(16,185,129,0.12) 60%, transparent 85%)",
          }}
        />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 pt-20 pb-16 text-center">
        <h1 className="text-4xl font-semibold md:text-5xl">For Buyers</h1>
        <p className="mt-5 max-w-2xl text-lg text-slate-700">
          Budget properly before you buy. Estimate repayments and transfer-related costs.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/listings"
            className="rounded-xl bg-slate-900 px-7 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Browse listings
          </Link>
          <Link
            href="/contact"
            className="rounded-xl border border-slate-300 px-7 py-3 text-sm font-semibold hover:bg-white/60"
          >
            Ask a question
          </Link>
        </div>

        <p className="mt-12 text-sm font-semibold uppercase tracking-[0.25em] text-emerald-700">
          Smart. Simple. Sorted.
        </p>
      </div>
    </section>
  );
}

/* ----------------------------- BOND REPAYMENT ----------------------------- */

function BondRepaymentCalc() {
  const [price, setPrice] = useState(2_000_000);
  const [deposit, setDeposit] = useState(200_000);
  const [rate, setRate] = useState(11.75);
  const [termYears, setTermYears] = useState(20);

  const principal = useMemo(() => Math.max(0, price - deposit), [price, deposit]);
  const payment = useMemo(() => monthlyPayment(principal, rate, termYears), [principal, rate, termYears]);
  const nMonths = Math.max(1, Math.round(termYears * 12));
  const totalPaid = payment * nMonths;
  const totalInterest = Math.max(0, totalPaid - principal);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <div className="grid gap-4">
          <Field label="Purchase price (R)">
            <input
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
              value={price}
              onChange={(e) => setPrice(clampNum(e.target.value))}
              inputMode="numeric"
            />
          </Field>

          <Field label="Deposit (R)">
            <input
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
              value={deposit}
              onChange={(e) => setDeposit(clampNum(e.target.value))}
              inputMode="numeric"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Interest rate (% p.a.)">
              <input
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                value={rate}
                onChange={(e) => setRate(clampNum(e.target.value))}
                inputMode="decimal"
              />
            </Field>

            <Field label="Term (years)">
              <input
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                value={termYears}
                onChange={(e) => setTermYears(clampNum(e.target.value))}
                inputMode="numeric"
              />
            </Field>
          </div>
        </div>

        <p className="mt-4 text-xs text-slate-500">Estimate only. Your bank rate and fees determine the real figure.</p>
      </Card>

      <Card>
        <strong>Estimate</strong>
        <div className="mt-4 grid gap-3">
          <Row label="Bond amount (principal)" value={formatZAR(principal)} />
          <Row label="Monthly repayment" value={formatZAR(payment)} />
          <Row label="Total paid over term" value={formatZAR(totalPaid)} />
          <Row label="Total interest" value={formatZAR(totalInterest)} />
        </div>
      </Card>
    </div>
  );
}

/* ----------------------------- OOBA-LIKE TRANSFER COST ----------------------------- */

function TransferCostCalculator() {
  const [price, setPrice] = useState(1_000_000);
  const [loan, setLoan] = useState(1_000_000);
  const [ownership, setOwnership] = useState("Freehold");
  const [vatVendor, setVatVendor] = useState("No");
  const [purchaser, setPurchaser] = useState("Natural Person");

  // Simple estimates (we can later make these scale with price/loan)
  const bondInitiation = 6038;
  const bondAttorney = 29716;
  const deedsFee = 1464;
  const petties = 2200;

  const transferAttorney = 29716;
  const vatRate = 0.15;

  const transferDuty = vatVendor === "Yes" ? 0 : transferDuty_2025(price);

  const bondSubtotal = bondInitiation + bondAttorney + deedsFee + petties;
  const transferSubtotal = transferAttorney + deedsFee + petties;

  const bondVat = (bondAttorney + petties) * vatRate;
  const transferVat = (transferAttorney + petties) * vatRate;

  const bondTotal = bondSubtotal + bondVat;
  const transferTotal = transferSubtotal + transferVat + transferDuty;

  const grandTotal = bondTotal + transferTotal;

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/* LEFT */}
      <div className="space-y-4">
        <Field label="Purchase price (including VAT) *">
          <input
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
            value={price}
            onChange={(e) => setPrice(clampNum(e.target.value))}
            inputMode="numeric"
          />
        </Field>

        <Field label="Loan amount *">
          <input
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
            value={loan}
            onChange={(e) => setLoan(clampNum(e.target.value))}
            inputMode="numeric"
          />
        </Field>

        <Field label="Type of property ownership *">
          <select
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
            value={ownership}
            onChange={(e) => setOwnership(e.target.value)}
          >
            <option>Freehold</option>
            <option>Sectional title</option>
          </select>
        </Field>

        <Field label="Seller registered for VAT *">
          <select
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
            value={vatVendor}
            onChange={(e) => setVatVendor(e.target.value)}
          >
            <option>No</option>
            <option>Yes</option>
          </select>
        </Field>

        <Field label="Status of purchaser *">
          <select
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
            value={purchaser}
            onChange={(e) => setPurchaser(e.target.value)}
          >
            <option>Natural Person</option>
            <option>Company</option>
            <option>Trust</option>
          </select>
        </Field>

        <button type="button" className="mt-4 w-full rounded-xl bg-lime-400 py-3 font-semibold text-slate-900">
          Recalculate
        </button>

        <p className="text-xs text-slate-500">
          (Loan: {formatZAR(loan)}) Ownership/purchaser are captured for future workflow — costs are estimates for now.
        </p>
      </div>

      {/* RIGHT */}
      <div className="rounded-3xl bg-gradient-to-br from-emerald-600 to-blue-600 p-8 text-white">

        <div className="mb-6">
          <div className="text-sm opacity-90">Total costs (including VAT)</div>
          <div className="text-3xl font-bold">{formatZAR(grandTotal)}</div>
        </div>

        <div className="mb-6">
          <div className="font-semibold">Bond registration costs (incl VAT)</div>
          <div className="mt-2 space-y-1 text-sm">
            <RowDark label="Bond registration costs" value={formatZAR(bondAttorney)} />
            <RowDark label="Bank initiation fee" value={formatZAR(bondInitiation)} />
            <RowDark label="Deeds office fees" value={formatZAR(deedsFee)} />
            <RowDark label="Post, petties & FICA" value={formatZAR(petties)} />
          </div>
          <div className="mt-2 font-semibold">{formatZAR(bondTotal)}</div>
        </div>

        <div className="mb-6">
          <div className="font-semibold">Transfer costs (incl VAT)</div>
          <div className="mt-2 space-y-1 text-sm">
            <RowDark label="Property transfer costs" value={formatZAR(transferAttorney)} />
            <RowDark label="Transfer duty" value={formatZAR(transferDuty)} />
            <RowDark label="Deeds office fees" value={formatZAR(deedsFee)} />
            <RowDark label="Post, petties & FICA" value={formatZAR(petties)} />
          </div>
          <div className="mt-2 font-semibold">{formatZAR(transferTotal)}</div>
        </div>

        <div className="mt-6 flex gap-3">
  <button
    type="button"
    className="flex-1 rounded-full border border-white/60 py-2 text-sm font-semibold hover:bg-white/10"
  >
    Check credit score
  </button>

  <button
    type="button"
    className="flex-1 rounded-full bg-white py-2 text-sm font-semibold text-emerald-700"
  >
    Email my results
  </button>
</div>

      </div>
    </div>
  );
}

function RowDark({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 opacity-95">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

/* ----------------------------- CTA / FOOTER / UI ----------------------------- */

function FinalCTA() {
  return (
    <section className="bg-slate-900 px-4 py-20 text-white">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-semibold">Want help getting buyer-ready?</h2>
        <p className="mt-3 text-slate-300">Tell us what you’re looking for — we’ll guide the next step.</p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/listings"
            className="inline-block rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100"
          >
            Browse listings
          </Link>
          <Link
            href="/contact"
            className="inline-block rounded-xl border border-white/30 px-6 py-3 text-sm font-semibold hover:bg-white/10"
          >
            Contact us
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t px-4 py-10 text-sm text-slate-600">
      <div className="mx-auto max-w-6xl">© {new Date().getFullYear()} HeyMies</div>
    </footer>
  );
}

function Section({
  id,
  title,
  children,
  tone = "none",
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
  tone?: "none" | "blue" | "green";
}) {
  const bg = tone === "blue" ? "bg-blue-50" : tone === "green" ? "bg-emerald-50" : "bg-white";

  return (
    <section id={id} className={bg}>
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-6">{children}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-xs font-semibold text-slate-600">{label}</div>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="text-slate-700">{label}</div>
      <div className="font-semibold text-slate-900">{value}</div>
    </div>
  );
}
