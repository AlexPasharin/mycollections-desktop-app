import type { UpsertEntryAltNameRow } from "./formValues";
import { toCreateMusicalEntryInput } from "./toCreateMusicalEntryInput";

const altNameRow = (id: string, name: string): UpsertEntryAltNameRow => ({
  id,
  name,
});

describe("toCreateMusicalEntryInput", () => {
  it("maps form values to create input with artistId and trimmed alt names", () => {
    expect(
      toCreateMusicalEntryInput({
        artistId: "artist-1",
        entryId: "entry-new",
        mainName: "  A Night at the Opera  ",
        originalReleaseDate: { year: "1975", month: "11", day: "21" },
        discogsUrl: "https://www.discogs.com/master/123-title",
        comment: "  Studio album  ",
        selectedTags: new Set(["tag-a"]),
        selectedTypes: new Set(["type-1"]),
        altNames: [
          altNameRow("row-1", "  ANATO  "),
          altNameRow("row-2", "   "),
        ],
        partOfQueenCollection: true,
        relationToQueen: "  Core album  ",
      }),
    ).toEqual({
      artistId: "artist-1",
      entry: {
        entryId: "entry-new",
        mainName: "  A Night at the Opera  ",
        originalReleaseDate: "1975-11-21",
        discogsUrl: "https://www.discogs.com/master/123-title",
        comment: "Studio album",
        partOfQueenCollection: true,
        relationToQueen: "Core album",
      },
      tagIds: ["tag-a"],
      typeIds: ["type-1"],
      altNames: ["ANATO"],
    });
  });

  it("omits entryId when not provided", () => {
    expect(
      toCreateMusicalEntryInput({
        artistId: "artist-1",
        mainName: "Queen",
        originalReleaseDate: { year: "", month: "", day: "" },
        discogsUrl: "",
        comment: "",
        selectedTags: new Set(),
        selectedTypes: new Set(),
        altNames: [],
        partOfQueenCollection: false,
        relationToQueen: "",
      }).entry,
    ).not.toHaveProperty("entryId");
  });
});
