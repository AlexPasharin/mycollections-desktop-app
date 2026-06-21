import type { UpsertEntryAltNameRow, UpsertEntryFormEntry } from "./formValues";
import { toUpdateMusicalEntryInput } from "./toUpdateMusicalEntryInput";

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const entry = { entryId: "entry-abc" } as UpsertEntryFormEntry;

const altNameRow = (
  id: string,
  name: string,
  nameId?: string,
): UpsertEntryAltNameRow => ({
  id,
  name,
  ...(nameId === undefined ? {} : { nameId }),
});

describe("toUpdateMusicalEntryInput", () => {
  it("maps entryId and scalar entry fields from validated form values", () => {
    expect(
      toUpdateMusicalEntryInput({
        entry,
        mainName: "  A Night at the Opera  ",
        originalReleaseDate: { year: "1975", month: "11", day: "21" },
        discogsUrl: "https://www.discogs.com/master/123-title",
        comment: "  Studio album  ",
        selectedTags: new Set(["tag-a", "tag-b"]),
        selectedTypes: new Set(["type-1"]),
        altNames: [altNameRow("row-1", "ANATO", "name-id-1")],
        partOfQueenCollection: true,
        relationToQueen: "  Core album  ",
      }),
    ).toEqual({
      entryId: "entry-abc",
      entry: {
        mainName: "  A Night at the Opera  ",
        originalReleaseDate: "1975-11-21",
        discogsUrl: "https://www.discogs.com/master/123-title",
        comment: "Studio album",
        partOfQueenCollection: true,
        relationToQueen: "Core album",
      },
      tagIds: ["tag-a", "tag-b"],
      typeIds: ["type-1"],
      altNames: [{ id: "row-1", name: "ANATO", nameId: "name-id-1" }],
    });
  });

  it("converts empty optional strings to null", () => {
    expect(
      toUpdateMusicalEntryInput({
        entry,
        mainName: "News of the World",
        originalReleaseDate: { year: "", month: "", day: "" },
        discogsUrl: "   ",
        comment: "",
        selectedTags: new Set(),
        selectedTypes: new Set(),
        altNames: [],
        partOfQueenCollection: false,
        relationToQueen: "ignored when unchecked",
      }),
    ).toEqual({
      entryId: "entry-abc",
      entry: {
        mainName: "News of the World",
        originalReleaseDate: null,
        discogsUrl: null,
        comment: null,
        partOfQueenCollection: false,
        relationToQueen: null,
      },
      tagIds: [],
      typeIds: [],
      altNames: [],
    });
  });

  it("clears relationToQueen when the entry is not part of the Queen collection", () => {
    expect(
      toUpdateMusicalEntryInput({
        entry,
        mainName: "Flash Gordon",
        originalReleaseDate: { year: "1980", month: "", day: "" },
        discogsUrl: "",
        comment: "",
        selectedTags: new Set(["tag-a"]),
        selectedTypes: new Set(),
        altNames: [],
        partOfQueenCollection: false,
        relationToQueen: "  Would be cleared  ",
      }).entry.relationToQueen,
    ).toBeNull();
  });

  it("nulls relationToQueen when part of Queen collection but the field is blank", () => {
    expect(
      toUpdateMusicalEntryInput({
        entry,
        mainName: "A Kind of Magic",
        originalReleaseDate: { year: "1986", month: "", day: "" },
        discogsUrl: "",
        comment: "",
        selectedTags: new Set(),
        selectedTypes: new Set(),
        altNames: [],
        partOfQueenCollection: true,
        relationToQueen: "   ",
      }).entry.relationToQueen,
    ).toBeNull();
  });

  it("serializes year-only and year-month release dates", () => {
    expect(
      toUpdateMusicalEntryInput({
        entry,
        mainName: "Queen",
        originalReleaseDate: { year: "1973", month: "", day: "" },
        discogsUrl: "",
        comment: "",
        selectedTags: new Set(),
        selectedTypes: new Set(),
        altNames: [],
        partOfQueenCollection: false,
        relationToQueen: "",
      }).entry.originalReleaseDate,
    ).toBe("1973");

    expect(
      toUpdateMusicalEntryInput({
        entry,
        mainName: "Queen II",
        originalReleaseDate: { year: "1974", month: "3", day: "" },
        discogsUrl: "",
        comment: "",
        selectedTags: new Set(),
        selectedTypes: new Set(),
        altNames: [],
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
      toUpdateMusicalEntryInput({
        entry,
        mainName: "The Game",
        originalReleaseDate: { year: "1980", month: "", day: "" },
        discogsUrl: "",
        comment: "",
        selectedTags: new Set(),
        selectedTypes: new Set(),
        altNames,
        partOfQueenCollection: false,
        relationToQueen: "",
      }).altNames,
    ).toBe(altNames);
  });
});
