import type { Kysely } from "kysely";

import { insertEntryRelatedEntries } from "./relatedEntries";

import type { DB } from "@/types/db/database";

const entryId = "11111111-1111-4111-8111-111111111111";
const parentEntryId = "22222222-2222-4222-8222-222222222222";
const childEntryId = "33333333-3333-4333-8333-333333333333";

const createInsertTrxMock = () => {
  const execute = jest.fn().mockResolvedValue(undefined);
  const values = jest.fn().mockReturnValue({ execute });
  const insertInto = jest.fn().mockReturnValue({ values });

  return {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    trx: { insertInto } as unknown as Kysely<DB>,
    insertInto,
    values,
    execute,
  };
};

describe("insertEntryRelatedEntries", () => {
  it("maps parent and child relations to parent-entry rows", async () => {
    const { trx, insertInto, values, execute } = createInsertTrxMock();

    await insertEntryRelatedEntries(trx, entryId, [
      {
        relatedEntryId: parentEntryId,
        relation: "parent",
        childEntryOrderNumber: 2,
      },
      {
        relatedEntryId: childEntryId,
        relation: "child",
        childEntryOrderNumber: 3,
      },
    ]);

    expect(insertInto).toHaveBeenCalledWith("parentMusicalEntries");
    expect(values).toHaveBeenCalledWith([
      {
        parentEntryId,
        childEntryId: entryId,
        childEntryOrderNumber: 2,
      },
      {
        parentEntryId: entryId,
        childEntryId,
        childEntryOrderNumber: 3,
      },
    ]);
    expect(execute).toHaveBeenCalled();
  });

  it("does not insert when there are no related entries", async () => {
    const { trx, insertInto } = createInsertTrxMock();

    await insertEntryRelatedEntries(trx, entryId, []);

    expect(insertInto).not.toHaveBeenCalled();
  });
});
