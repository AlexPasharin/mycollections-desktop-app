import { core } from "zod";

export const addCustomValidationIssues = (
  ctx: core.$RefinementCtx<unknown>,
  message: string,
  ...paths: PropertyKey[][]
) => {
  if (paths.length === 0) {
    ctx.addIssue({ code: "custom", message });

    return;
  }

  for (const path of paths) {
    ctx.addIssue({
      code: "custom",
      message,
      path,
    });
  }
};

export type ValidationResultErrorMessages = {
  message: string;
  path: PropertyKey[];
}[];
