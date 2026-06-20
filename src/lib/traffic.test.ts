import { describe, it, expect } from "vitest";
import { vcTone, vcLabel, vcDescriptor, vcSeverity } from "./traffic";

describe("traffic helpers", () => {
  it("vcTone maps V/C ranges to semantic tones", () => {
    expect(vcTone(null)).toBe("danger");
    expect(vcTone(0.5)).toBe("success");
    expect(vcTone(0.8)).toBe("warning");
    expect(vcTone(0.95)).toBe("danger");
  });

  it("vcLabel formats ratios and blocked state", () => {
    expect(vcLabel(null)).toBe("Blocked");
    expect(vcLabel(0.756)).toBe("0.76");
  });

  it("vcDescriptor gives a qualitative label", () => {
    expect(vcDescriptor(null)).toBe("Blocked");
    expect(vcDescriptor(0.6)).toBe("Smooth");
    expect(vcDescriptor(0.8)).toBe("Moderate");
    expect(vcDescriptor(0.95)).toBe("Congested");
  });

  it("vcSeverity ranks blocked corridors worst", () => {
    expect(vcSeverity(null)).toBe(Number.POSITIVE_INFINITY);
    expect(vcSeverity(0.5)).toBe(0.5);
    expect(vcSeverity(0.9)).toBeGreaterThan(vcSeverity(0.4));
  });
});
