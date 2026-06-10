import { v4 as uuidv4 } from "uuid";

export const withNewId = <T extends object>(fields: T): T & { id: string } => ({
  id: uuidv4(),
  ...fields,
});
