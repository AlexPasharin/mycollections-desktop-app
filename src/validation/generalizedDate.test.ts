import { createGeneralizedDateSchema } from "./generalizedDate";

import { expectZodSingleIssueMessage } from "@/utils/testUtils";

jest.mock("@/utils/date", () => {
  const actual =
    jest.requireActual<typeof import("@/utils/date")>("@/utils/date");

  return {
    ...actual,

    /** Fixed “today” so future-date checks are stable in tests. */
    startOfToday: jest.fn(() => new Date(Date.UTC(2026, 3, 5))),
  };
});

describe("createGeneralizedDateSchema", () => {
  it("accepts year-only generalized dates that are valid and not in the future", () => {
    const schema = createGeneralizedDateSchema();

    expect(schema.parse({ year: "2000" })).toEqual({ year: 2000 });
    expect(schema.parse({ year: "2025" })).toEqual({ year: 2025 });
  });

  it("accepts year-month and full dates", () => {
    const schema = createGeneralizedDateSchema();

    expect(schema.parse({ year: "2020", month: "6" })).toEqual({
      year: 2020,
      month: 6,
    });

    expect(schema.parse({ year: "2024", month: "2", day: "29" })).toEqual({
      year: 2024,
      month: 2,
      day: 29,
    });
  });

  it("accepts valid dates with numeric year, month, and day", () => {
    const schema = createGeneralizedDateSchema();

    expect(schema.parse({ year: 2000 })).toEqual({ year: 2000 });
    expect(schema.parse({ year: 2020, month: 6 })).toEqual({
      year: 2020,
      month: 6,
    });
    expect(schema.parse({ year: 2024, month: 2, day: 29 })).toEqual({
      year: 2024,
      month: 2,
      day: 29,
    });
    expect(schema.parse({ year: 2026, month: 4, day: 5 })).toEqual({
      year: 2026,
      month: 4,
      day: 5,
    });
  });

  it("rejects month below 1 or above 12", () => {
    const schema = createGeneralizedDateSchema();
    const message = "Month must be between 1 and 12.";

    expectZodSingleIssueMessage(
      schema.safeParse({ year: "2000", month: "0" }),
      message,
    );
    expectZodSingleIssueMessage(
      schema.safeParse({ year: "2000", month: "13" }),
      message,
    );
    expectZodSingleIssueMessage(
      schema.safeParse({ year: 2000, month: 0 }),
      message,
    );
    expectZodSingleIssueMessage(
      schema.safeParse({ year: 2000, month: 13 }),
      message,
    );
  });

  it("rejects years before 1900", () => {
    const schema = createGeneralizedDateSchema();

    const result = schema.safeParse({ year: "1899" });

    expectZodSingleIssueMessage(result, "Year must be 1900 or later.");
  });

  it("rejects non-integer year, month, or day", () => {
    const schema = createGeneralizedDateSchema();

    expect(() => schema.parse({ year: "2000.5" })).toThrow();
    expect(() => schema.parse({ year: "2000", month: "6.5" })).toThrow();
    expect(() =>
      schema.parse({ year: "2000", month: "1", day: "15.5" }),
    ).toThrow();
  });

  it("rejects negative year, month, or day numbers", () => {
    const schema = createGeneralizedDateSchema();

    expect(() => schema.parse({ year: -1 })).toThrow();
    expect(() => schema.parse({ year: 2000, month: -1 })).toThrow();
    expect(() => schema.parse({ year: 2000, month: 1, day: -1 })).toThrow();
  });

  it("rejects non-integer numeric year, month, or day", () => {
    const schema = createGeneralizedDateSchema();

    expect(() => schema.parse({ year: 2000.5 })).toThrow();
    expect(() => schema.parse({ year: 2000, month: 6.5 })).toThrow();
    expect(() => schema.parse({ year: 2000, month: 1, day: 15.5 })).toThrow();
  });

  it("rejects NaN and non-finite numeric year", () => {
    const schema = createGeneralizedDateSchema();

    expect(() => schema.parse({ year: Number.NaN })).toThrow();
    expect(() => schema.parse({ year: Number.POSITIVE_INFINITY })).toThrow();
    expect(() => schema.parse({ year: Number.NEGATIVE_INFINITY })).toThrow();
  });

  it("rejects invalid calendar dates and future dates when fields are numbers", () => {
    const schema = createGeneralizedDateSchema();

    const invalidCalendar = schema.safeParse({
      year: 2023,
      month: 2,
      day: 30,
    });

    expectZodSingleIssueMessage(
      invalidCalendar,
      `Value "2023, February 30" does not represent a valid existing date.`,
    );

    const future = schema.safeParse({
      year: 2026,
      month: 4,
      day: 6,
    });

    expectZodSingleIssueMessage(
      future,
      `Value "2026, April 6" represents a date in the future.`,
    );
  });

  it("rejects year before 1900 when year is a number", () => {
    const schema = createGeneralizedDateSchema();

    const result = schema.safeParse({ year: 1899 });

    expectZodSingleIssueMessage(result, "Year must be 1900 or later.");
  });

  it("rejects year, month, or day values that are not parsable as numbers", () => {
    const schema = createGeneralizedDateSchema();

    expect(() => schema.parse({ year: "not-a-number" })).toThrow();
    expect(() =>
      schema.parse({ year: "2000", month: "not-a-number" }),
    ).toThrow();
    expect(() =>
      schema.parse({ year: "2000", month: "1", day: "not-a-number" }),
    ).toThrow();
  });

  it("rejects string values that look like negative numbers, junk suffixes, or scientific notation", () => {
    const schema = createGeneralizedDateSchema();

    expect(() => schema.parse({ year: "-1" })).toThrow();
    expect(() => schema.parse({ year: "2000", month: "-6" })).toThrow();
    expect(() =>
      schema.parse({ year: "2000", month: "1", day: "-15" }),
    ).toThrow();

    expect(() => schema.parse({ year: "123hello" })).toThrow();
    expect(() => schema.parse({ year: "2000", month: "6abc" })).toThrow();
    expect(() =>
      schema.parse({ year: "2000", month: "1", day: "29x" }),
    ).toThrow();

    expect(() => schema.parse({ year: "1e2" })).toThrow();
    expect(() => schema.parse({ year: "2000", month: "6e0" })).toThrow();
    expect(() =>
      schema.parse({ year: "2000", month: "1", day: "2e1" }),
    ).toThrow();
  });

  it("rejects empty or whitespace-only year strings", () => {
    const schema = createGeneralizedDateSchema();

    expect(() => schema.parse({ year: "" })).toThrow();
    expect(() => schema.parse({ year: "   " })).toThrow();
  });

  it("treats empty or whitespace-only month and day strings as omitted", () => {
    const schema = createGeneralizedDateSchema();

    expect(schema.parse({ year: "2000", month: "" })).toEqual({ year: 2000 });
    expect(schema.parse({ year: "2000", month: "1", day: "  " })).toEqual({
      year: 2000,
      month: 1,
    });
  });

  it("rejects empty month when a day is present", () => {
    const schema = createGeneralizedDateSchema();

    const result = schema.safeParse({
      year: "2000",
      month: "",
      day: "1",
    });

    expectZodSingleIssueMessage(
      result,
      "Month is required when day is provided.",
    );
  });

  it("rejects strictObject shapes with unknown keys", () => {
    const schema = createGeneralizedDateSchema();

    const withExtra = { year: "2000", extra: true };

    expect(() => schema.parse(withExtra)).toThrow();

    const withExtraFull = {
      year: "2000",
      month: "1",
      day: "1",
      extra: true,
    };

    expect(() => schema.parse(withExtraFull)).toThrow();
  });

  it("rejects day without month", () => {
    const schema = createGeneralizedDateSchema();

    const result = schema.safeParse({ year: "2000", day: "15" });

    expectZodSingleIssueMessage(
      result,
      "Month is required when day is provided.",
    );
  });

  it("rejects invalid calendar dates", () => {
    const schema = createGeneralizedDateSchema();

    const result = schema.safeParse({
      year: "2023",
      month: "2",
      day: "30",
    });

    expectZodSingleIssueMessage(
      result,
      `Value "2023, February 30" does not represent a valid existing date.`,
    );
  });

  it("rejects dates strictly after startOfToday", () => {
    const schema = createGeneralizedDateSchema();

    const result = schema.safeParse({
      year: "2026",
      month: "4",
      day: "6",
    });

    expectZodSingleIssueMessage(
      result,
      `Value "2026, April 6" represents a date in the future.`,
    );
  });

  it("accepts mocked today's calendar date (UTC) from mocked startOfToday", () => {
    const schema = createGeneralizedDateSchema();

    expect(schema.parse({ year: "2026", month: "4", day: "5" })).toEqual({
      year: 2026,
      month: 4,
      day: 5,
    });
  });

  describe("with startDate", () => {
    it("fails when the value's upper bound is before the start lower bound", () => {
      const schema = createGeneralizedDateSchema({
        year: 2020,
        month: 1,
        day: 1,
      });

      const result = schema.safeParse({
        year: "2019",
        month: "12",
        day: "31",
      });

      expectZodSingleIssueMessage(
        result,
        `Value "2019, December 31" cannot be before "2020, January 1" (given start date).`,
      );
    });

    it("accepts values on or after the start date", () => {
      const start = { year: 2020, month: 1, day: 1 };

      const schema = createGeneralizedDateSchema(start);

      expect(schema.parse({ year: "2020", month: "6" })).toEqual({
        year: 2020,
        month: 6,
      });
      expect(schema.parse({ year: "2021", month: "6" })).toEqual({
        year: 2021,
        month: 6,
      });
    });

    it("does not apply start bound when startDate is not a valid calendar date", () => {
      const schema = createGeneralizedDateSchema({
        year: 2023,
        month: 2,
        day: 30,
      });

      expect(schema.parse({ year: "2022", month: "1", day: "1" })).toEqual({
        year: 2022,
        month: 1,
        day: 1,
      });
    });
  });
});
