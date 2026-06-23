import { validateEntryDiscogsUrl } from "./entryDiscogsUrl";

describe("validateEntryDiscogsUrl", () => {
  it("accepts an empty value", () => {
    expect(validateEntryDiscogsUrl("")).toEqual({
      valid: true,
      value: "",
      notifications: undefined,
    });
  });

  it("accepts master and release Discogs URLs", () => {
    const masterUrl = "https://www.discogs.com/master/123456-queen-title";
    const releaseUrl = "https://www.discogs.com/release/789012-queen-title";

    expect(validateEntryDiscogsUrl(masterUrl)).toEqual({
      valid: true,
      value: masterUrl,
      notifications: undefined,
    });

    expect(validateEntryDiscogsUrl(releaseUrl)).toEqual({
      valid: true,
      value: releaseUrl,
      notifications: undefined,
    });
  });

  it("trims surrounding whitespace and reports a notification", () => {
    expect(
      validateEntryDiscogsUrl(
        "  https://www.discogs.com/master/123456-queen-title  ",
      ),
    ).toEqual({
      valid: true,
      value: "https://www.discogs.com/master/123456-queen-title",
      notifications: [{ notification: "Note: value has been trimmed" }],
    });
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
      const result = validateEntryDiscogsUrl(value);

      expect(result.valid).toBe(false);

      if (result.valid) {
        continue;
      }

      expect(result.errorMessages).toEqual([
        {
          message:
            "Discogs URL must be of the form https://www.discogs.com/(master or release)/<numerical id>-<arbitrary text>",
        },
      ]);
    }
  });
});
