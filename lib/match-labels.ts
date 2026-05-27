export function buyerMatchLabel(score: number | null | undefined) {
  const value = score ?? 0;
  if (value >= 75) return "Strong match";
  if (value >= 55) return "Good fit";
  if (value >= 35) return "Worth a look";
  return "May need checking";
}

export function buyerProfileStrengthLabel(score: number | null | undefined) {
  const value = score ?? 0;
  if (value >= 70) return "Ready for matching";
  if (value >= 45) return "Good context";
  if (value >= 20) return "Getting clearer";
  return "Needs a few details";
}
