import { z } from "zod";

import { uniquePropertyArraySchema } from "@/validation/common";

const labelInputValuesSchema = uniquePropertyArraySchema(
  z.object({
    id: z.string(),
    name: z
      .string()
      .trim()
      .min(
        1,
        "Label is required (or remove catalogue number section all together)",
      ),
  }),
  "Label names must be unique",
  [""],
  "name",
);

const catalogueNumberInputValuesSchema = uniquePropertyArraySchema(
  z.object({
    id: z.string(),
    value: z
      .string()
      .trim()
      .min(
        1,
        "Value for catalogue number is required (or remove catalogue number section all together)",
      ),
  }),
  "Catalogue number values must be unique",
  [""],
  "value",
);

export const catalogueNumberRowSchema = z
  .object({
    id: z.string(),
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
