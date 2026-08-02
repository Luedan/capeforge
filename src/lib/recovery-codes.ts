import "server-only";

import { createHash, randomInt } from "node:crypto";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const RECOVERY_CODE_COUNT = 8;

export function normalizeRecoveryCode(code: string) {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function hashRecoveryCode(code: string) {
  return createHash("sha256").update(normalizeRecoveryCode(code)).digest("hex");
}

export function generateRecoveryCodes() {
  const codes = new Set<string>();
  while (codes.size < RECOVERY_CODE_COUNT) {
    const raw = Array.from({ length: 20 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
    codes.add(raw.match(/.{1,5}/g)!.join("-"));
  }
  return [...codes];
}

export function recoveryCodeRows(codes: string[]) {
  return codes.map((code) => ({ codeHash: hashRecoveryCode(code) }));
}
