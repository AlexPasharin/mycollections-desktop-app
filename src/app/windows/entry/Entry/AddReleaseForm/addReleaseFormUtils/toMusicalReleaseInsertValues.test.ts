import { toReleaseDateString } from "./toMusicalReleaseInsertValues";

describe("toReleaseDateString", () => {
  it("returns null when the year is empty", () => {
    expect(toReleaseDateString({ year: "", month: "", day: "" })).toBeNull();
  });

  it("returns null when the year is whitespace-only", () => {
    expect(toReleaseDateString({ year: "   ", month: "", day: "" })).toBeNull();
  });

  it("returns null even when month and day are provided but year is empty", () => {
    expect(toReleaseDateString({ year: "", month: "6", day: "15" })).toBeNull();
  });

  it("returns just the year when month and day are empty", () => {
    expect(toReleaseDateString({ year: "2020", month: "", day: "" })).toBe(
      "2020",
    );
  });

  it("treats whitespace-only month and day as omitted", () => {
    expect(toReleaseDateString({ year: "2020", month: " ", day: "\t" })).toBe(
      "2020",
    );
  });

  it("joins year and month with a hyphen when day is empty", () => {
    expect(toReleaseDateString({ year: "2020", month: "6", day: "" })).toBe(
      "2020-06",
    );
  });

  it("joins year, month, and day with hyphens", () => {
    expect(toReleaseDateString({ year: "2020", month: "6", day: "5" })).toBe(
      "2020-06-05",
    );
  });

  it("zero-pads single-digit month and day", () => {
    expect(toReleaseDateString({ year: "1999", month: "1", day: "9" })).toBe(
      "1999-01-09",
    );
  });

  it("leaves two-digit month and day unchanged", () => {
    expect(toReleaseDateString({ year: "2024", month: "12", day: "31" })).toBe(
      "2024-12-31",
    );
  });

  it("trims surrounding whitespace from year, month, and day", () => {
    expect(
      toReleaseDateString({ year: " 2020 ", month: " 6 ", day: " 5 " }),
    ).toBe("2020-06-05");
  });

  it("preserves wide years without truncating or padding", () => {
    expect(toReleaseDateString({ year: "12345", month: "", day: "" })).toBe(
      "12345",
    );
  });

  it("preserves a year that already has a leading zero in the input", () => {
    expect(toReleaseDateString({ year: "0999", month: "1", day: "2" })).toBe(
      "0999-01-02",
    );
  });
});
