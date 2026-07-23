import {
  initialReleaseFormStateValue,
  type ReleaseFormEntry,
} from "./formValues";
import { toReleaseCountriesJson } from "./toUpsertMusicalReleaseInput";

import type { ReleaseByIdResult } from "@/types/releases";

const entry: ReleaseFormEntry = {
  entryId: "entry-1",
  mainName: "Album",
  originalReleaseDate: { year: 1980, month: 1, day: 15 },
  comment: null,
  discogsUrl: null,
  partOfQueenCollection: false,
  relationToQueen: null,
  artists: [],
  types: [],
  altNames: [{ nameId: "alt-1", name: "Alt Album" }],
  tags: [],
};

const allFormats = [{ formatId: "fmt-vinyl", shortName: "Vinyl" }];
const allCountries = [
  { codeName: "UK", name: "United Kingdom" },
  { codeName: "DE", name: "Germany" },
];

const release: ReleaseByIdResult = {
  releaseId: "release-1",
  releaseVersion: "UK first press",
  releaseDate: { year: 1981, month: 3, day: 1 },
  discogsUrl: "https://www.discogs.com/release/1-test",
  alternativeName: "Alt Album",
  formats: [
    {
      id: "format-row-1",
      formatId: "fmt-vinyl",
      shortName: "Vinyl",
      amount: 2,
      pictureSleeve: false,
      jukeboxHole: true,
      speed: null,
    },
  ],
  tags: [{ tagId: "tag-promo", tag: "Promo" }],
  countries: {
    "made in": "UK",
    "printed in": "DE",
  },
  catalogueNumbers: {
    label: "EMI",
    cat_number: "EMC 1234",
  },
  matrixRunout: { SideA: "ABC-1", SideB: "ABC-2" },
  comment: "Nice copy",
  conditionProblems: "Minor ring wear",
  partOfQueenCollection: true,
  relationToQueen: "Related single",
  entryId: "entry-1",
  parentReleases: [
    {
      releaseId: "parent-release-1",
      releaseVersion: "Original LP",
      entryId: "entry-2",
      entryMainName: "Parent album",
      artists: [],
    },
  ],
  childReleases: [
    {
      releaseId: "child-release-1",
      releaseVersion: "Single",
      entryId: "entry-3",
      entryMainName: "Child single",
      artists: [],
    },
  ],
};

describe("initialReleaseFormStateValue", () => {
  it("maps release fields into a validated add-release draft when release is given", () => {
    const draft = initialReleaseFormStateValue({
      entry,
      allFormats,
      allCountries,
      releaseBlueprint: release,
    });

    expect(draft.releaseVersion.value).toBe("UK first press");
    expect(draft.name.value).toEqual({
      nameId: "alt-1",
      name: "Alt Album",
    });
    expect(draft.releaseDate.value).toEqual({
      year: "1981",
      month: "3",
      day: "1",
    });
    expect(draft.formats.value).toEqual([
      expect.objectContaining({
        formatId: "fmt-vinyl",
        amount: "2",
        pictureSleeve: false,
        jukeboxHole: true,
      }),
    ]);
    expect(draft.selectedTags.value).toEqual(new Set(["tag-promo"]));
    expect(toReleaseCountriesJson(draft.countries.value)).toEqual({
      "made in": "UK",
      "printed in": "DE",
    });
    expect(draft.matrixRunout.value).toEqual({
      value: JSON.stringify(release.matrixRunout, null, 4),
      treatAsText: false,
    });
    expect(draft.relatedReleases.value).toEqual([
      expect.objectContaining({
        releaseId: "parent-release-1",
        relation: "parent",
      }),
      expect.objectContaining({
        releaseId: "child-release-1",
        relation: "child",
      }),
    ]);
  });
});
