import assert from "node:assert";

import { createGeneralizedDateSchema } from "./generalizedDate";

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

    expect(schema.parse({ year: 2000 })).toEqual({ year: 2000 });
    expect(schema.parse({ year: 2025 })).toEqual({ year: 2025 });
  });

  it("accepts year-month and full dates", () => {
    const schema = createGeneralizedDateSchema();

    expect(schema.parse({ year: 2020, month: 6 })).toEqual({
      year: 2020,
      month: 6,
    });

    expect(schema.parse({ year: 2024, month: 2, day: 29 })).toEqual({
      year: 2024,
      month: 2,
      day: 29,
    });
  });

  it("rejects years before 1900", () => {
    const schema = createGeneralizedDateSchema();

    const result = schema.safeParse({ year: 1899 });

    expect(result.success).toBe(false);
    assert(!result.success);
    expect(result.error.issues.map((issue) => issue.message)).toEqual([
      "Year must be 1900 or later.",
    ]);
  });

  it("rejects non-integer year, month, or day", () => {
    const schema = createGeneralizedDateSchema();

    expect(() => schema.parse({ year: 2000.5 })).toThrow();
    expect(() => schema.parse({ year: 2000, month: 6.5 })).toThrow();
    expect(() => schema.parse({ year: 2000, month: 1, day: 15.5 })).toThrow();
  });

  it("rejects strictObject shapes with unknown keys", () => {
    const schema = createGeneralizedDateSchema();

    const withExtra = { year: 2000, extra: true };

    expect(() => schema.parse(withExtra)).toThrow();

    const withExtraFull = {
      year: 2000,
      month: 1,
      day: 1,
      extra: true,
    };

    expect(() => schema.parse(withExtraFull)).toThrow();
  });

  it("rejects day without month", () => {
    const schema = createGeneralizedDateSchema();

    const dayOnly = { year: 2000, day: 15 };

    expect(() => schema.parse(dayOnly)).toThrow();
  });

  it("rejects invalid calendar dates", () => {
    const schema = createGeneralizedDateSchema();

    const result = schema.safeParse({ year: 2023, month: 2, day: 30 });

    expect(result.success).toBe(false);
    assert(!result.success);
    expect(result.error.issues.map((issue) => issue.message)).toEqual([
      `Value "2023-02-30" does not represent a valid existing date.`,
    ]);
  });

  it("rejects dates strictly after startOfToday", () => {
    const schema = createGeneralizedDateSchema();

    const result = schema.safeParse({ year: 2026, month: 4, day: 6 });

    expect(result.success).toBe(false);
    assert(!result.success);
    expect(result.error.issues.map((issue) => issue.message)).toEqual([
      `Value "2026-04-06" represents a date in the future.`,
    ]);
  });

  it("accepts mocked today's calendar date (UTC) from mocked startOfToday", () => {
    const schema = createGeneralizedDateSchema();

    expect(schema.parse({ year: 2026, month: 4, day: 5 })).toEqual({
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

      const result = schema.safeParse({ year: 2019, month: 12, day: 31 });

      expect(result.success).toBe(false);
      assert(!result.success);
      expect(result.error.issues.map((issue) => issue.message)).toEqual([
        `Value "2019-12-31" cannot be before "2020-01-01" (given start date).`,
      ]);
    });

    it("accepts values on or after the start date", () => {
      const start = { year: 2020, month: 1, day: 1 };

      const schema = createGeneralizedDateSchema(start);

      expect(schema.parse({ year: 2020, month: 6 })).toEqual({
        year: 2020,
        month: 6,
      });
      expect(schema.parse({ year: 2021, month: 6 })).toEqual({
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

      expect(schema.parse({ year: 2022, month: 1, day: 1 })).toEqual({
        year: 2022,
        month: 1,
        day: 1,
      });
    });
  });
});
