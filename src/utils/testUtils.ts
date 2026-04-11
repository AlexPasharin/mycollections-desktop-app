import { expect } from "@jest/globals";

/** Asserts parse failed and `error.issues` includes an issue with this message. */
export const expectZodIssuesIncludeMessage = (
  parsingResult: ZodSafeParseResultLike,
  expectedMessage: string,
) => {
  expect(zodSafeParseIssueMessages(parsingResult)).toContain(expectedMessage);
};

type ZodSafeParseResultLike = {
  error?: { issues: ReadonlyArray<{ readonly message: string }> };
};

const zodSafeParseIssueMessages = (parsingResult: ZodSafeParseResultLike) =>
  parsingResult.error?.issues.map((issue) => issue.message) ?? [];
