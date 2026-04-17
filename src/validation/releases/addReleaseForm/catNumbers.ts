import { z } from "zod";

import { uniquePropertyArraySchema } from "@/validation/common";

export const labelInputValuesSchema = uniquePropertyArraySchema(
  z.string().trim().min(1, "Label is required"),
  "Label names must be unique",
  [""],
);

export const catalogueNumberInputValuesSchema = uniquePropertyArraySchema(
  z.string().trim().min(1, "Value for catalogue number is required"),
  "Catalogue number values must be unique",
  [""],
);

export const catalogueNumberRowSchema = z
  .object({
    labelInputValues: labelInputValuesSchema,
    catalogueNumberInputValues: catalogueNumberInputValuesSchema,
  })
  .refine(
    (row) =>
      row.labelInputValues.length + row.catalogueNumberInputValues.length >= 1,
    {
      message:
        "Each catalogue row needs at least one label or catalogue number field",
    },
  );
