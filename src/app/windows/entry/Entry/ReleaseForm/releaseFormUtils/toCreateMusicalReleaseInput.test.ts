import type {
  CatalogueNumberRowState,
  CountrySelectionInput,
} from "./formValues";
import {
  toReleaseCatNumbersJson,
  toReleaseCountriesJson,
} from "./toCreateMusicalReleaseInput";

const country = (codeName: string): CountrySelectionInput => ({
  id: codeName || "empty",
  codeName,
});

const catNumberRow = (
  labels: string[],
  catNumbers: string[],
): CatalogueNumberRowState => ({
  id: `${labels.join(",")}|${catNumbers.join(",")}`,
  shape: "flat",
  labelInputValues: labels.map((name, index) => ({
    id: `label-${index}-${name}`,
    name,
  })),
  catalogueNumberInputValues: catNumbers.map((value, index) => ({
    id: `cat-${index}-${value}`,
    value,
  })),
});

const europeUkCatNumberRow = (
  labels: string[],
  europeCatNumbers: string[],
  ukCatNumbers: string[],
): CatalogueNumberRowState => ({
  id: `${labels.join(",")}|EU:${europeCatNumbers.join(",")}|UK:${ukCatNumbers.join(",")}`,
  shape: "europeUk",
  labelInputValues: labels.map((name, index) => ({
    id: `label-${index}-${name}`,
    name,
  })),
  europeCatalogueNumberInputValues: europeCatNumbers.map((value, index) => ({
    id: `eu-cat-${index}-${value}`,
    value,
  })),
  ukCatalogueNumberInputValues: ukCatNumbers.map((value, index) => ({
    id: `uk-cat-${index}-${value}`,
    value,
  })),
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

  it("drops empty-string label inputs while keeping filled cat numbers", () => {
    expect(toReleaseCatNumbersJson([catNumberRow([""], ["EMC 3001"])])).toEqual(
      { cat_number: "EMC 3001" },
    );
  });

  it("drops empty-string catalogue-number inputs while keeping filled labels", () => {
    expect(toReleaseCatNumbersJson([catNumberRow(["EMI"], [""])])).toEqual({
      label: "EMI",
    });
  });

  it("trims values and skips entries that are whitespace-only", () => {
    expect(
      toReleaseCatNumbersJson([
        catNumberRow(["  EMI  ", "   "], ["EMC 3001", " "]),
      ]),
    ).toEqual({ label: "EMI", cat_number: "EMC 3001" });
  });

  it("drops a row whose inputs are all empty strings", () => {
    expect(toReleaseCatNumbersJson([catNumberRow([""], [""])])).toBeNull();
  });

  it("preserves the order of labels and cat numbers within a row", () => {
    expect(
      toReleaseCatNumbersJson([catNumberRow(["C", "A", "B"], ["3", "1", "2"])]),
    ).toEqual({
      labels: ["C", "A", "B"],
      cat_numbers: ["3", "1", "2"],
    });
  });

  it("emits cat_numbers as an in-Europe/in-UK object for a single europeUk row with one value per side", () => {
    expect(
      toReleaseCatNumbersJson([
        europeUkCatNumberRow(["EMI"], ["EMC 3001"], ["PCS 7066"]),
      ]),
    ).toEqual({
      label: "EMI",
      cat_numbers: { "in Europe": "EMC 3001", "in UK": "PCS 7066" },
    });
  });

  it("uses arrays inside the in-Europe/in-UK object when a side has multiple values", () => {
    expect(
      toReleaseCatNumbersJson([
        europeUkCatNumberRow(
          ["EMI", "Parlophone"],
          ["EMC 3001", "EMC 3002"],
          ["PCS 7066", "PCS 7067"],
        ),
      ]),
    ).toEqual({
      labels: ["EMI", "Parlophone"],
      cat_numbers: {
        "in Europe": ["EMC 3001", "EMC 3002"],
        "in UK": ["PCS 7066", "PCS 7067"],
      },
    });
  });

  it("mixes a single value on one side and multiple on the other inside the regions object", () => {
    expect(
      toReleaseCatNumbersJson([
        europeUkCatNumberRow(["EMI"], ["EMC 3001"], ["PCS 7066", "PCS 7067"]),
      ]),
    ).toEqual({
      label: "EMI",
      cat_numbers: {
        "in Europe": "EMC 3001",
        "in UK": ["PCS 7066", "PCS 7067"],
      },
    });
  });

  it("omits the label side of a europeUk row when there are no labels", () => {
    expect(
      toReleaseCatNumbersJson([
        europeUkCatNumberRow([], ["EMC 3001"], ["PCS 7066"]),
      ]),
    ).toEqual({
      cat_numbers: { "in Europe": "EMC 3001", "in UK": "PCS 7066" },
    });
  });

  it("supports mixing flat and europeUk rows in the same submission", () => {
    expect(
      toReleaseCatNumbersJson([
        catNumberRow(["Capitol"], ["SMAS 11163"]),
        europeUkCatNumberRow(["EMI"], ["EMC 3001"], ["PCS 7066"]),
      ]),
    ).toEqual([
      { label: "Capitol", cat_number: "SMAS 11163" },
      {
        label: "EMI",
        cat_numbers: { "in Europe": "EMC 3001", "in UK": "PCS 7066" },
      },
    ]);
  });

  it("preserves order across mixed flat and europeUk rows", () => {
    expect(
      toReleaseCatNumbersJson([
        europeUkCatNumberRow(["EMI"], ["EMC 3001"], ["PCS 7066"]),
        catNumberRow(["Capitol"], ["SMAS 11163"]),
        europeUkCatNumberRow(
          ["Parlophone"],
          ["EMC 3002"],
          ["PCS 7067", "PCS 7068"],
        ),
      ]),
    ).toEqual([
      {
        label: "EMI",
        cat_numbers: { "in Europe": "EMC 3001", "in UK": "PCS 7066" },
      },
      { label: "Capitol", cat_number: "SMAS 11163" },
      {
        label: "Parlophone",
        cat_numbers: {
          "in Europe": "EMC 3002",
          "in UK": ["PCS 7067", "PCS 7068"],
        },
      },
    ]);
  });
});
