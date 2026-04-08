import { expect } from "@jest/globals";

/** Asserts parse failed with exactly one issue and that message. */
export function expectZodSingleIssueMessage<T>(
  parsingResult: ZodSafeParseResultLike<T>,
  expectedMessage: string,
): void {
  expect(parsingResult.success).toBe(false);
  expect(zodSafeParseIssueMessages(parsingResult)).toEqual([expectedMessage]);
}

type ZodSafeParseResultLike<T> =
  | { success: true; data: T }
  | {
      success: false;
      error: { issues: ReadonlyArray<{ readonly message: string }> };
    };

function zodSafeParseIssueMessages<T>(
  parsingResult: ZodSafeParseResultLike<T>,
): string[] {
  return parsingResult.success
    ? []
    : parsingResult.error.issues.map((issue) => issue.message);
}
