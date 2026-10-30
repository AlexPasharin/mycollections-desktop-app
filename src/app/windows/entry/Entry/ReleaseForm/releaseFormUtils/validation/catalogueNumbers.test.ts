import { validateReleaseCatNumbers } from "./catalogueNumbers";
import { formStateWith } from "./testUtils";

const validateCatNumbers = (
  catalogueNumbers: Parameters<typeof formStateWith>[0]["catalogueNumbers"],
) => validateReleaseCatNumbers(formStateWith({ catalogueNumbers }));

describe("validateReleaseCatNumbers", () => {
  it("accepts a flat row with a label and a catalogue number", () => {
    const result = validateCatNumbers({
      activeTab: "rows",
      rows: [
        {
          id: "row-1",
          shape: "flat",
          labelInputValues: [{ id: "label-1", name: "EMI" }],
          catalogueNumberInputValues: [{ id: "cat-1", value: "EMC 1234" }],
        },
      ],
    });

    expect(result.validatedValue).toEqual({
      activeTab: "rows",
      rows: [
        {
          id: "row-1",
          shape: "flat",
          labelInputValues: [{ id: "label-1", name: "EMI" }],
          catalogueNumberInputValues: [{ id: "cat-1", value: "EMC 1234" }],
        },
      ],
    });
    expect(result.notifications).toEqual([]);
  });

  it("reports an empty catalogue number input with row and input sources", () => {
    const result = validateCatNumbers({
      activeTab: "rows",
      rows: [
        {
          id: "row-1",
          shape: "flat",
          labelInputValues: [{ id: "label-1", name: "EMI" }],
          catalogueNumberInputValues: [{ id: "cat-1", value: "   " }],
        },
      ],
    });

    expect(result.errors).toEqual([
      {
        message: "Fill in this catalogue number or remove the slot",
        sources: ["row-1", "cat-1"],
      },
    ]);
  });

  it("reports invalid JSON input without sources", () => {
    const result = validateCatNumbers({
      activeTab: "json",
      value: "{ not: [valid",
    });

    expect(result.errors).toEqual([{ message: "Invalid JSON value" }]);
  });
});
