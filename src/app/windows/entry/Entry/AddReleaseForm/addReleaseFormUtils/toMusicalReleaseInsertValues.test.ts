import type {
  CatalogueNumberRowState,
  CountrySelectionInput,
} from "./formValues";
import {
  toReleaseCatNumbersJson,
  toReleaseCountriesJson,
  toReleaseDateString,
} from "./toMusicalReleaseInsertValues";

const country = (codeName: string): CountrySelectionInput => ({
  id: codeName || "empty",
  codeName,
});

const catNumberRow = (
  labels: string[],
  catNumbers: string[],
): CatalogueNumberRowState => ({
  id: `${labels.join(",")}|${catNumbers.join(",")}`,
  labelInputValues: labels.map((name, index) => ({
    id: `label-${index}-${name}`,
    name,
  })),
  catalogueNumberInputValues: catNumbers.map((value, index) => ({
    id: `cat-${index}-${value}`,
    value,
  })),
});

describe("toReleaseDateString", () => {
  it("returns null when the year is empty", () => {
    expect(toReleaseDateString({ year: "", month: "", day: "" })).toBeNull();
  });

  it("returns null when the year is whitespace-only", () => {
    expect(toReleaseDateString({ year: "   ", month: "", day: "" })).toBeNull();
  });

  it("returns null even when month and day are provided but year is empty", () => {
    expect(toReleaseDateString({ year: "", month: "6", day: "15" })).toBeNull();
  });

  it("returns just the year when month and day are empty", () => {
    expect(toReleaseDateString({ year: "2020", month: "", day: "" })).toBe(
      "2020",
    );
  });

  it("treats whitespace-only month and day as omitted", () => {
    expect(toReleaseDateString({ year: "2020", month: " ", day: "\t" })).toBe(
      "2020",
    );
  });

  it("joins year and month with a hyphen when day is empty", () => {
    expect(toReleaseDateString({ year: "2020", month: "6", day: "" })).toBe(
      "2020-06",
    );
  });

  it("joins year, month, and day with hyphens", () => {
    expect(toReleaseDateString({ year: "2020", month: "6", day: "5" })).toBe(
      "2020-06-05",
    );
  });

  it("zero-pads single-digit month and day", () => {
    expect(toReleaseDateString({ year: "1999", month: "1", day: "9" })).toBe(
      "1999-01-09",
    );
  });

  it("leaves two-digit month and day unchanged", () => {
    expect(toReleaseDateString({ year: "2024", month: "12", day: "31" })).toBe(
      "2024-12-31",
    );
  });

  it("trims surrounding whitespace from year, month, and day", () => {
    expect(
      toReleaseDateString({ year: " 2020 ", month: " 6 ", day: " 5 " }),
    ).toBe("2020-06-05");
  });

  it("preserves wide years without truncating or padding", () => {
    expect(toReleaseDateString({ year: "12345", month: "", day: "" })).toBe(
      "12345",
    );
  });

  it("preserves a year that already has a leading zero in the input", () => {
    expect(toReleaseDateString({ year: "0999", month: "1", day: "2" })).toBe(
      "0999-01-02",
    );
  });
});

describe("toReleaseCountriesJson", () => {
  it("returns null when both made-in and printed-in are empty", () => {
    expect(toReleaseCountriesJson({ madeIn: [], printedIn: [] })).toBeNull();
  });

  it("returns the single made-in country as a plain string when printed-in is empty", () => {
    expect(
      toReleaseCountriesJson({ madeIn: [country("UK")], printedIn: [] }),
    ).toBe("UK");
  });

  it("returns made-in countries as an array when there are multiple and printed-in is empty", () => {
    expect(
      toReleaseCountriesJson({
        madeIn: [country("UK"), country("DE")],
        printedIn: [],
      }),
    ).toEqual(["UK", "DE"]);
  });

  it("preserves the order of made-in countries in the array form", () => {
    expect(
      toReleaseCountriesJson({
        madeIn: [country("DE"), country("UK"), country("FR")],
        printedIn: [],
      }),
    ).toEqual(["DE", "UK", "FR"]);
  });

  it("returns an object with string sides when both have a single country", () => {
    expect(
      toReleaseCountriesJson({
        madeIn: [country("UK")],
        printedIn: [country("DE")],
      }),
    ).toEqual({ "made in": "UK", "printed in": "DE" });
  });

  it("returns an object with string made-in and array printed-in", () => {
    expect(
      toReleaseCountriesJson({
        madeIn: [country("UK")],
        printedIn: [country("DE"), country("FR")],
      }),
    ).toEqual({ "made in": "UK", "printed in": ["DE", "FR"] });
  });

  it("returns an object with array made-in and string printed-in", () => {
    expect(
      toReleaseCountriesJson({
        madeIn: [country("UK"), country("DE")],
        printedIn: [country("FR")],
      }),
    ).toEqual({ "made in": ["UK", "DE"], "printed in": "FR" });
  });

  it("returns an object with array sides when both have multiple countries", () => {
    expect(
      toReleaseCountriesJson({
        madeIn: [country("UK"), country("DE")],
        printedIn: [country("FR"), country("IT")],
      }),
    ).toEqual({
      "made in": ["UK", "DE"],
      "printed in": ["FR", "IT"],
    });
  });

  it("returns null when made-in is empty even if printed-in is set", () => {
    expect(
      toReleaseCountriesJson({
        madeIn: [],
        printedIn: [country("DE")],
      }),
    ).toBeNull();
  });
});

describe("toReleaseCatNumbersJson", () => {
  it("returns null when there are no rows", () => {
    expect(toReleaseCatNumbersJson([])).toBeNull();
  });

  it("returns a single object for one row with one label and one cat number", () => {
    expect(
      toReleaseCatNumbersJson([catNumberRow(["EMI"], ["EMC 3001"])]),
    ).toEqual({
      label: "EMI",
      cat_number: "EMC 3001",
    });
  });

  it("uses plural keys when a single row has multiple labels and cat numbers", () => {
    expect(
      toReleaseCatNumbersJson([
        catNumberRow(["EMI", "Parlophone"], ["EMC 3001", "PCS 7066"]),
      ]),
    ).toEqual({
      labels: ["EMI", "Parlophone"],
      cat_numbers: ["EMC 3001", "PCS 7066"],
    });
  });

  it("mixes singular and plural keys independently per side", () => {
    expect(
      toReleaseCatNumbersJson([
        catNumberRow(["EMI", "Parlophone"], ["EMC 3001"]),
      ]),
    ).toEqual({
      labels: ["EMI", "Parlophone"],
      cat_number: "EMC 3001",
    });

    expect(
      toReleaseCatNumbersJson([
        catNumberRow(["EMI"], ["EMC 3001", "PCS 7066"]),
      ]),
    ).toEqual({
      label: "EMI",
      cat_numbers: ["EMC 3001", "PCS 7066"],
    });
  });

  it("omits the label side when a row has no labels", () => {
    expect(toReleaseCatNumbersJson([catNumberRow([], ["EMC 3001"])])).toEqual({
      cat_number: "EMC 3001",
    });
  });

  it("omits the label side when a row has no labels but multiple cat numbers", () => {
    expect(
      toReleaseCatNumbersJson([catNumberRow([], ["EMC 3001", "PCS 7066"])]),
    ).toEqual({ cat_numbers: ["EMC 3001", "PCS 7066"] });
  });

  it("omits the cat-number side when a row has no cat numbers", () => {
    expect(toReleaseCatNumbersJson([catNumberRow(["EMI"], [])])).toEqual({
      label: "EMI",
    });
  });

  it("omits the cat-number side when a row has no cat numbers but multiple labels", () => {
    expect(
      toReleaseCatNumbersJson([catNumberRow(["EMI", "Parlophone"], [])]),
    ).toEqual({ labels: ["EMI", "Parlophone"] });
  });

  it("returns null for a single row with no labels and no cat numbers", () => {
    expect(toReleaseCatNumbersJson([catNumberRow([], [])])).toBeNull();
  });

  it("returns null when every row is empty", () => {
    expect(
      toReleaseCatNumbersJson([catNumberRow([], []), catNumberRow([], [])]),
    ).toBeNull();
  });

  it("drops empty rows when mixed with non-empty ones", () => {
    expect(
      toReleaseCatNumbersJson([
        catNumberRow([], []),
        catNumberRow(["EMI"], ["EMC 3001"]),
      ]),
    ).toEqual({ label: "EMI", cat_number: "EMC 3001" });

    expect(
      toReleaseCatNumbersJson([
        catNumberRow(["EMI"], ["EMC 3001"]),
        catNumberRow([], []),
        catNumberRow(["Parlophone"], ["PCS 7066"]),
      ]),
    ).toEqual([
      { label: "EMI", cat_number: "EMC 3001" },
      { label: "Parlophone", cat_number: "PCS 7066" },
    ]);
  });

  it("returns an array of objects when there are multiple rows", () => {
    expect(
      toReleaseCatNumbersJson([
        catNumberRow(["EMI"], ["EMC 3001"]),
        catNumberRow(["Parlophone"], ["PCS 7066"]),
      ]),
    ).toEqual([
      { label: "EMI", cat_number: "EMC 3001" },
      { label: "Parlophone", cat_number: "PCS 7066" },
    ]);
  });

  it("picks singular and plural keys per row independently across rows", () => {
    expect(
      toReleaseCatNumbersJson([
        catNumberRow(["EMI", "Parlophone"], ["EMC 3001", "PCS 7066"]),
        catNumberRow(["Capitol"], ["SMAS 11163"]),
      ]),
    ).toEqual([
      {
        labels: ["EMI", "Parlophone"],
        cat_numbers: ["EMC 3001", "PCS 7066"],
      },
      { label: "Capitol", cat_number: "SMAS 11163" },
    ]);
  });

  it("supports rows with only labels or only cat numbers in a multi-row result", () => {
    expect(
      toReleaseCatNumbersJson([
        catNumberRow(["EMI", "Parlophone"], []),
        catNumberRow([], ["EMC 3001", "PCS 7066"]),
        catNumberRow(["Capitol"], ["SMAS 11163"]),
      ]),
    ).toEqual([
      { labels: ["EMI", "Parlophone"] },
      { cat_numbers: ["EMC 3001", "PCS 7066"] },
      { label: "Capitol", cat_number: "SMAS 11163" },
    ]);
  });

  it("supports mixed singular and plural sides across rows", () => {
    expect(
      toReleaseCatNumbersJson([
        catNumberRow(["EMI", "Parlophone"], ["EMC 3001"]),
        catNumberRow(["Capitol"], ["SMAS 11163", "ST 11163"]),
      ]),
    ).toEqual([
      { labels: ["EMI", "Parlophone"], cat_number: "EMC 3001" },
      { label: "Capitol", cat_numbers: ["SMAS 11163", "ST 11163"] },
    ]);
  });

  it("preserves the order of rows", () => {
    expect(
      toReleaseCatNumbersJson([
        catNumberRow(["B"], ["2"]),
        catNumberRow(["A"], ["1"]),
        catNumberRow(["C"], ["3"]),
      ]),
    ).toEqual([
      { label: "B", cat_number: "2" },
      { label: "A", cat_number: "1" },
      { label: "C", cat_number: "3" },
    ]);
  });

  it("preserves the order of labels and cat numbers within a row", () => {
    expect(
      toReleaseCatNumbersJson([catNumberRow(["C", "A", "B"], ["3", "1", "2"])]),
    ).toEqual({
      labels: ["C", "A", "B"],
      cat_numbers: ["3", "1", "2"],
    });
  });
});
