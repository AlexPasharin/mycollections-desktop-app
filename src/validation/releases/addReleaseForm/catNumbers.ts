import { z } from "zod";

import { uniquePropertyArraySchema } from "@/validation/common";

const catalogueNumberLabelInputValueSchema = z.object({
  id: z.string().trim().min(1, "Id is required"),
  name: z.string().trim().min(1, "Name is required"),
});

const catalogueNumberInputValueSchema = z.object({
  id: z.string().trim().min(1, "Id is required"),
  value: z.string().trim().min(1, "Value for catalogue number is required"),
});

export const catalogueNumberRowSchema = z
  .object({
    id: z.string().trim().min(1, "Id is required"),
    labelInputValues: uniquePropertyArraySchema(
      catalogueNumberLabelInputValueSchema,
      "name",
      "Label names must be unique within this row",
    ),
    catalogueNumberInputValues: uniquePropertyArraySchema(
      catalogueNumberInputValueSchema,
      "value",
      "Catalogue number values must be unique within this row",
    ),
  })
  .refine(
    (row) =>
      row.labelInputValues.length + row.catalogueNumberInputValues.length >= 1,
    {
      message:
        "Each catalogue row needs at least one label or catalogue number field",
    },
  );
