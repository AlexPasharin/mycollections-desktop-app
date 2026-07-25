import type { UpsertEntryAltNameRow, UpsertEntryArtistRow } from "./formValues";
import { toUpsertMusicalEntryInput } from "./toUpsertMusicalEntryInput";

const altNameRow = (
  id: string,
  name: string,
  nameId?: string,
): UpsertEntryAltNameRow => ({
  id,
  name,
  ...(nameId === undefined ? {} : { nameId }),
});

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

describe("toUpsertMusicalEntryInput", () => {
  it("maps scalar entry fields from validated form values", () => {
    expect(
      toUpsertMusicalEntryInput({
        mainName: "  A Night at the Opera  ",
        originalReleaseDate: { year: "1975", month: "11", day: "21" },
        discogsUrl: "https://www.discogs.com/master/123-title",
        comment: "  Studio album  ",
        selectedTags: new Set(["tag-a", "tag-b"]),
        selectedTypes: new Set(["type-1"]),
        artists: [
          artistRow("artist-row-1", "artist-1", "alt-name-1", true),
          artistRow("artist-row-2", "artist-2"),
        ],
        altNames: [altNameRow("row-1", "ANATO", "name-id-1")],
        relatedEntries: [
          {
            id: "row-2",
            entryId: "entry-parent",
            relation: "parent",
            orderNumber: "1",
          },
        ],
        partOfQueenCollection: true,
        relationToQueen: "  Core album  ",
      }),
    ).toEqual({
      entry: {
        mainName: "  A Night at the Opera  ",
        originalReleaseDate: "1975-11-21",
        discogsUrl: "https://www.discogs.com/master/123-title",
        comment: "Studio album",
        partOfQueenCollection: true,
        relationToQueen: "Core album",
      },
      artists: [
        {
          artistId: "artist-1",
          entryArtistAltNameId: "alt-name-1",
          isEntriesMainArtist: true,
        },
        {
          artistId: "artist-2",
          entryArtistAltNameId: null,
          isEntriesMainArtist: false,
        },
      ],
      tagIds: ["tag-a", "tag-b"],
      typeIds: ["type-1"],
      altNames: [{ id: "row-1", name: "ANATO", nameId: "name-id-1" }],
      relatedEntries: [
        {
          relatedEntryId: "entry-parent",
          relation: "parent",
          childEntryOrderNumber: 1,
        },
      ],
    });
  });

  it("converts empty optional strings to null", () => {
    expect(
      toUpsertMusicalEntryInput({
        mainName: "News of the World",
        originalReleaseDate: { year: "", month: "", day: "" },
        discogsUrl: "   ",
        comment: "",
        selectedTags: new Set(),
        selectedTypes: new Set(),
        artists: [],
        altNames: [],
        relatedEntries: [],
        partOfQueenCollection: false,
        relationToQueen: "ignored when unchecked",
      }),
    ).toEqual({
      entry: {
        mainName: "News of the World",
        originalReleaseDate: null,
        discogsUrl: null,
        comment: null,
        partOfQueenCollection: false,
        relationToQueen: null,
      },
      artists: [],
      tagIds: [],
      typeIds: [],
      altNames: [],
      relatedEntries: [],
    });
  });

  it("clears relationToQueen when the entry is not part of the Queen collection", () => {
    expect(
      toUpsertMusicalEntryInput({
        mainName: "Flash Gordon",
        originalReleaseDate: { year: "1980", month: "", day: "" },
        discogsUrl: "",
        comment: "",
        selectedTags: new Set(["tag-a"]),
        selectedTypes: new Set(),
        artists: [],
        altNames: [],
        relatedEntries: [],
        partOfQueenCollection: false,
        relationToQueen: "  Would be cleared  ",
      }).entry.relationToQueen,
    ).toBeNull();
  });

  it("nulls relationToQueen when part of Queen collection but the field is blank", () => {
    expect(
      toUpsertMusicalEntryInput({
        mainName: "A Kind of Magic",
        originalReleaseDate: { year: "1986", month: "", day: "" },
        discogsUrl: "",
        comment: "",
        selectedTags: new Set(),
        selectedTypes: new Set(),
        artists: [],
        altNames: [],
        relatedEntries: [],
        partOfQueenCollection: true,
        relationToQueen: "   ",
      }).entry.relationToQueen,
    ).toBeNull();
  });

  it("serializes year-only and year-month release dates", () => {
    expect(
      toUpsertMusicalEntryInput({
        mainName: "Queen",
        originalReleaseDate: { year: "1973", month: "", day: "" },
        discogsUrl: "",
        comment: "",
        selectedTags: new Set(),
        selectedTypes: new Set(),
        artists: [],
        altNames: [],
        relatedEntries: [],
        partOfQueenCollection: false,
        relationToQueen: "",
      }).entry.originalReleaseDate,
    ).toBe("1973");

    expect(
      toUpsertMusicalEntryInput({
        mainName: "Queen II",
        originalReleaseDate: { year: "1974", month: "3", day: "" },
        discogsUrl: "",
        comment: "",
        selectedTags: new Set(),
        selectedTypes: new Set(),
        artists: [],
        altNames: [],
        relatedEntries: [],
        partOfQueenCollection: false,
        relationToQueen: "",
      }).entry.originalReleaseDate,
    ).toBe("1974-03");
  });

  it("passes alt names through unchanged", () => {
    const altNames = [
      altNameRow("existing", "Existing Name", "name-existing"),
      altNameRow("new", "New Name"),
    ];

    expect(
      toUpsertMusicalEntryInput({
        mainName: "The Game",
        originalReleaseDate: { year: "1980", month: "", day: "" },
        discogsUrl: "",
        comment: "",
        selectedTags: new Set(),
        selectedTypes: new Set(),
        artists: [],
        altNames,
        relatedEntries: [],
        partOfQueenCollection: false,
        relationToQueen: "",
      }).altNames,
    ).toBe(altNames);
  });

  it("trims and nulls empty alt-name ids", () => {
    expect(
      toUpsertMusicalEntryInput({
        mainName: "Jazz",
        originalReleaseDate: { year: "1978", month: "", day: "" },
        discogsUrl: "",
        comment: "",
        selectedTags: new Set(),
        selectedTypes: new Set(),
        artists: [
          artistRow("row-1", "artist-main", "  alt-name-1  ", true),
          artistRow("row-2", "artist-other", "   "),
        ],
        altNames: [],
        relatedEntries: [],
        partOfQueenCollection: false,
        relationToQueen: "",
      }).artists,
    ).toEqual([
      {
        artistId: "artist-main",
        entryArtistAltNameId: "alt-name-1",
        isEntriesMainArtist: true,
      },
      {
        artistId: "artist-other",
        entryArtistAltNameId: null,
        isEntriesMainArtist: false,
      },
    ]);
  });
});
