import { describe, it, expect } from "vitest";
import { hashPin, verifyPin } from "./pin";

describe("pin", () => {
  it("verifies a correct PIN against its hash", async () => {
    const hash = await hashPin("4821");
    expect(await verifyPin("4821", hash)).toBe(true);
  });

  it("rejects an incorrect PIN against a hash", async () => {
    const hash = await hashPin("4821");
    expect(await verifyPin("0000", hash)).toBe(false);
  });

  it("never stores the PIN in plaintext in the hash", async () => {
    const hash = await hashPin("4821");
    expect(hash).not.toContain("4821");
  });
});
