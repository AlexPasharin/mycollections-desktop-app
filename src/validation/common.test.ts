import { checkSequentialStringsSuffixNumberingValidity } from "./common";

describe("checkSequentialStringsSuffixNumberingValidity", () => {
  it("accepts an empty array", () => {
    expect(checkSequentialStringsSuffixNumberingValidity([])).toBe(true);
  });

  it("accepts a single string without a numeric suffix", () => {
    expect(checkSequentialStringsSuffixNumberingValidity(["CD"])).toBe(true);
    expect(checkSequentialStringsSuffixNumberingValidity(["LP"])).toBe(true);
    expect(checkSequentialStringsSuffixNumberingValidity(["4HD_BD"])).toBe(
      true,
    );
  });

  it("rejects a single string with a numeric suffix", () => {
    expect(checkSequentialStringsSuffixNumberingValidity(["CD1"])).toBe(false);
    expect(checkSequentialStringsSuffixNumberingValidity(["DVD1"])).toBe(false);
  });

  it("accepts a sequential suffix run starting at 1", () => {
    expect(
      checkSequentialStringsSuffixNumberingValidity(["CD1", "CD2", "CD3"]),
    ).toBe(true);
    expect(
      checkSequentialStringsSuffixNumberingValidity(["DVD1", "DVD2"]),
    ).toBe(true);
  });

  it("rejects multiple strings when any lacks a numeric suffix", () => {
    expect(checkSequentialStringsSuffixNumberingValidity(["CD", "CD2"])).toBe(
      false,
    );
    expect(
      checkSequentialStringsSuffixNumberingValidity(["SideA", "SideB"]),
    ).toBe(false);
  });

  it("rejects numbered sequences that do not include suffix 1", () => {
    expect(checkSequentialStringsSuffixNumberingValidity(["CD2"])).toBe(false);
    expect(checkSequentialStringsSuffixNumberingValidity(["CD2", "CD3"])).toBe(
      false,
    );
  });

  it("rejects numbered sequences with gaps", () => {
    expect(checkSequentialStringsSuffixNumberingValidity(["CD1", "CD3"])).toBe(
      false,
    );
    expect(
      checkSequentialStringsSuffixNumberingValidity(["CD1", "CD2", "CD4"]),
    ).toBe(false);
  });

  it("rejects duplicate suffix numbers", () => {
    expect(checkSequentialStringsSuffixNumberingValidity(["CD1", "CD1"])).toBe(
      false,
    );
    expect(
      checkSequentialStringsSuffixNumberingValidity(["CD1", "CD2", "CD2"]),
    ).toBe(false);
  });

  it("uses only the trailing digit run as the suffix", () => {
    expect(
      checkSequentialStringsSuffixNumberingValidity(["4HD_BD1", "4HD_BD2"]),
    ).toBe(true);
  });

  it("requires an exact suffix of 1, not a leading-zero form", () => {
    expect(checkSequentialStringsSuffixNumberingValidity(["CD01"])).toBe(false);
    expect(
      checkSequentialStringsSuffixNumberingValidity(["CD01", "CD02"]),
    ).toBe(false);
  });
});
