import { describe, expect, it } from "vitest";
import { fmtSize } from "./api";

describe("fmtSize", () => {
  it("formats kilobytes and megabytes", () => {
    expect(fmtSize(2048)).toBe("2 KB");
    expect(fmtSize(3 * 1048576)).toBe("3.0 MB");
  });
});
