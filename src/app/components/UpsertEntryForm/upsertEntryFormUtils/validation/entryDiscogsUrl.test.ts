import { validateEntryDiscogsUrl } from "./entryDiscogsUrl";
import { formStateWith } from "./testUtils";

const validateUrl = (discogsUrl: string) =>
  validateEntryDiscogsUrl(formStateWith({ discogsUrl }));

describe("validateEntryDiscogsUrl", () => {
  it("accepts an empty value", () => {
    const result = validateUrl("");

    expect(result.validatedValue).toBe("");
    expect(result.notifications).toEqual([]);
  });

  it("accepts master and release Discogs URLs", () => {
    const masterUrl = "https://www.discogs.com/master/123456-queen-title";
    const releaseUrl = "https://www.discogs.com/release/789012-queen-title";

    expect(validateUrl(masterUrl).validatedValue).toBe(masterUrl);
    expect(validateUrl(releaseUrl).validatedValue).toBe(releaseUrl);
  });

  it("trims surrounding whitespace and reports a notification", () => {
    const result = validateUrl(
      "  https://www.discogs.com/master/123456-queen-title  ",
    );

    expect(result.validatedValue).toBe(
      "https://www.discogs.com/master/123456-queen-title",
    );
    expect(result.notifications).toEqual([
      { message: "Note: value has been trimmed" },
    ]);
  });

  it("rejects URLs that are not master or release entry URLs", () => {
    const invalidUrls = [
      "https://www.discogs.com/artist/123-name",
      "https://discogs.com/master/123-title",
      "https://www.discogs.com/master/abc-title",
      "https://www.discogs.com/master/123",
      "https://www.discogs.com/release/456",
    ];

    for (const value of invalidUrls) {
      const result = validateUrl(value);

      expect(result.errors).toEqual([
        {
          message:
            "Discogs URL must be of the form https://www.discogs.com/(master or release)/<numerical id>-<arbitrary text>",
        },
      ]);
    }
  });
});
