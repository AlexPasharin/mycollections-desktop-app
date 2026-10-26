import { validateArtists } from "./artists";
import { formStateWith } from "./testUtils";

import type { UpsertEntryArtistRow } from "../formValues";

const artistRow = (
  id: string,
  artistId: string,
  entryArtistAltNameId = "",
  isEntriesMainArtist = false,
): UpsertEntryArtistRow => ({
  id,
  artistId,
  entryArtistAltNameId,
  isEntriesMainArtist,
});

const validateRows = (rows: UpsertEntryArtistRow[]) =>
  validateArtists(formStateWith({ artists: rows }));

const artistId = "11111111-1111-4111-8111-111111111111";
const otherArtistId = "22222222-2222-4222-8222-222222222222";
const altNameId = "33333333-3333-4333-8333-333333333333";
const otherAltNameId = "44444444-4444-4444-8444-444444444444";

describe("validateArtists", () => {
  it("accepts valid artist rows", () => {
    const result = validateRows([
      artistRow("row-1", artistId, altNameId, true),
      artistRow("row-2", otherArtistId),
    ]);

    expect(result.validatedValue).toEqual([
      artistRow("row-1", artistId, altNameId, true),
      artistRow("row-2", otherArtistId),
    ]);
    expect(result.notifications).toEqual([]);
  });

  it("accepts an empty list", () => {
    const result = validateRows([]);

    expect(result.validatedValue).toEqual([]);
    expect(result.notifications).toEqual([]);
  });

  it("trims artist and alternative name ids in the validated value", () => {
    const result = validateRows([
      artistRow("row-1", `  ${artistId}  `, `  ${altNameId}  `, true),
    ]);

    expect(result.validatedValue).toEqual([
      artistRow("row-1", artistId, altNameId, true),
    ]);
    expect(result.notifications).toEqual([
      {
        message: `Note: artist ID "${artistId}" has been trimmed`,
        sources: ["row-1", "artistId"],
      },
      {
        message: `Note: alternative artist name ID "${altNameId}" has been trimmed`,
        sources: ["row-1", "entryArtistAltNameId"],
      },
    ]);
  });

  it("reports invalid artist ids per row", () => {
    const result = validateRows([
      artistRow("row-1", "not-a-uuid"),
      artistRow("row-2", artistId),
    ]);

    expect(result.errors).toEqual([
      {
        message: "Artist ID must be a valid UUID.",
        sources: ["row-1", "artistId"],
      },
    ]);
  });

  it("requires alternative artist name ids to be valid UUIDs when provided", () => {
    const result = validateRows([
      artistRow("row-1", artistId, "not-a-uuid"),
      artistRow("row-2", otherArtistId, altNameId),
    ]);

    expect(result.errors).toEqual([
      {
        message: "Alternative artist name ID must be a valid UUID.",
        sources: ["row-1", "entryArtistAltNameId"],
      },
    ]);
  });

  it("rejects duplicate artist ids regardless of alternative name id", () => {
    const result = validateRows([
      artistRow("row-1", artistId, altNameId),
      artistRow("row-2", artistId, otherAltNameId),
    ]);

    expect(result.errors).toEqual([
      {
        message: `Duplicate artist id ${artistId}.`,
        sources: ["row-2", "artistId"],
      },
    ]);
  });

  it("rejects duplicate artist ids when alternative name id is empty", () => {
    const result = validateRows([
      artistRow("row-1", artistId),
      artistRow("row-2", artistId),
    ]);

    expect(result.errors).toEqual([
      {
        message: `Duplicate artist id ${artistId}.`,
        sources: ["row-2", "artistId"],
      },
    ]);
  });
});
