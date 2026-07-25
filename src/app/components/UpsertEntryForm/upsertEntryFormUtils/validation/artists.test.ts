import { validateArtists } from "./artists";

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

const artistId = "11111111-1111-4111-8111-111111111111";
const otherArtistId = "22222222-2222-4222-8222-222222222222";
const altNameId = "33333333-3333-4333-8333-333333333333";
const otherAltNameId = "44444444-4444-4444-8444-444444444444";

describe("validateArtists", () => {
  it("accepts valid artist rows", () => {
    expect(
      validateArtists([
        artistRow("row-1", artistId, altNameId, true),
        artistRow("row-2", otherArtistId),
      ]),
    ).toEqual({
      valid: true,
      value: [
        artistRow("row-1", artistId, altNameId, true),
        artistRow("row-2", otherArtistId),
      ],
    });
  });

  it("accepts an empty list", () => {
    expect(validateArtists([])).toEqual({
      valid: true,
      value: [],
      notifications: undefined,
    });
  });

  it("trims artist and alternative name ids in the validated value", () => {
    expect(
      validateArtists([
        artistRow("row-1", `  ${artistId}  `, `  ${altNameId}  `, true),
      ]),
    ).toEqual({
      valid: true,
      value: [artistRow("row-1", artistId, altNameId, true)],
      notifications: [
        {
          notification: `Note: artist ID "${artistId}" has been trimmed`,
          sources: ["artistId"],
        },
        {
          notification: `Note: alternative artist name ID "${altNameId}" has been trimmed`,
          sources: ["entryArtistAltNameId"],
        },
      ],
    });
  });

  it("reports invalid artist ids per row", () => {
    const result = validateArtists([
      artistRow("row-1", "not-a-uuid"),
      artistRow("row-2", artistId),
    ]);

    expect(result.valid).toBe(false);

    if (result.valid) {
      return;
    }

    expect(result.errorMessages).toEqual({
      "row-1": [
        {
          message: "Artist ID must be a valid UUID.",
          sources: ["artistId"],
        },
      ],
    });
    expect(result.value).toEqual([
      artistRow("row-1", "not-a-uuid"),
      artistRow("row-2", artistId),
    ]);
  });

  it("requires alternative artist name ids to be valid UUIDs when provided", () => {
    const result = validateArtists([
      artistRow("row-1", artistId, "not-a-uuid"),
      artistRow("row-2", otherArtistId, altNameId),
    ]);

    expect(result.valid).toBe(false);

    if (result.valid) {
      return;
    }

    expect(result.errorMessages).toEqual({
      "row-1": [
        {
          message: "Alternative artist name ID must be a valid UUID.",
          sources: ["entryArtistAltNameId"],
        },
      ],
    });
  });

  it("rejects duplicate artist ids regardless of alternative name id", () => {
    const result = validateArtists([
      artistRow("row-1", artistId, altNameId),
      artistRow("row-2", artistId, otherAltNameId),
    ]);

    expect(result.valid).toBe(false);

    if (result.valid) {
      return;
    }

    expect(result.errorMessages).toEqual({
      "row-2": [
        {
          message: `Duplicate artist id ${artistId}.`,
          sources: ["artistId"],
        },
      ],
    });
  });

  it("rejects duplicate artist ids when alternative name id is empty", () => {
    const result = validateArtists([
      artistRow("row-1", artistId),
      artistRow("row-2", artistId),
    ]);

    expect(result.valid).toBe(false);

    if (result.valid) {
      return;
    }

    expect(result.errorMessages).toEqual({
      "row-2": [
        {
          message: `Duplicate artist id ${artistId}.`,
          sources: ["artistId"],
        },
      ],
    });
  });
});
