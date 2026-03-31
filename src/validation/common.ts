import { z } from "zod";

export const stringOrNonEmptyArraySchema = z.union([
  z.string(),
  z.array(z.string()).nonempty(),
]);
