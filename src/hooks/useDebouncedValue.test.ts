/**
 * @jest-environment jsdom
 */

import { act, renderHook } from "@testing-library/react";

import { useDebouncedValue } from "./useDebouncedValue";

const DELAY_MS = 300;

describe("useDebouncedValue", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("starts with the trimmed initial value and is not debouncing", () => {
    const { result } = renderHook(() => useDebouncedValue("  abc  ", DELAY_MS));

    expect(result.current).toEqual(["abc", false]);
  });

  it("reports debouncing on the same render the value changes", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, DELAY_MS),
      { initialProps: { value: "" } },
    );

    rerender({ value: "a" });

    expect(result.current).toEqual(["", true]);
  });

  it("applies the trimmed value after the delay", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, DELAY_MS),
      { initialProps: { value: "" } },
    );

    rerender({ value: "  abc  " });

    act(() => {
      jest.advanceTimersByTime(DELAY_MS - 1);
    });

    expect(result.current).toEqual(["", true]);

    act(() => {
      jest.advanceTimersByTime(1);
    });

    expect(result.current).toEqual(["abc", false]);
  });

  it("resets the timer on rapid input", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, DELAY_MS),
      { initialProps: { value: "" } },
    );

    rerender({ value: "a" });

    act(() => {
      jest.advanceTimersByTime(DELAY_MS - 100);
    });

    expect(result.current).toEqual(["", true]);

    rerender({ value: "ab" });

    act(() => {
      jest.advanceTimersByTime(DELAY_MS - 100);
    });

    expect(result.current).toEqual(["", true]);

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(result.current).toEqual(["ab", false]);
  });

  it("clears immediately when the input becomes empty", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, DELAY_MS),
      { initialProps: { value: "abc" } },
    );

    rerender({ value: "" });

    expect(result.current).toEqual(["", false]);
  });

  it("clears immediately when the input becomes whitespace-only", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, DELAY_MS),
      { initialProps: { value: "abc" } },
    );

    rerender({ value: "   " });

    expect(result.current).toEqual(["", false]);
  });

  it("does not report debouncing for whitespace-only edits", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, DELAY_MS),
      { initialProps: { value: "abc" } },
    );

    rerender({ value: "abc " });

    expect(result.current).toEqual(["abc", false]);
  });

  it("cancels the pending update when the input is cleared", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, DELAY_MS),
      { initialProps: { value: "" } },
    );

    rerender({ value: "abc" });
    rerender({ value: "" });

    act(() => {
      jest.advanceTimersByTime(DELAY_MS * 2);
    });

    expect(result.current).toEqual(["", false]);
  });

  it("restarts the timer with the new delay when delayMs changes", () => {
    const { result, rerender } = renderHook(
      ({ value, delayMs }) => useDebouncedValue(value, delayMs),
      { initialProps: { value: "", delayMs: DELAY_MS } },
    );

    rerender({ value: "x", delayMs: DELAY_MS });
    rerender({ value: "x", delayMs: 1000 });

    act(() => {
      jest.advanceTimersByTime(DELAY_MS);
    });

    expect(result.current).toEqual(["", true]);

    act(() => {
      jest.advanceTimersByTime(1000 - DELAY_MS);
    });

    expect(result.current).toEqual(["x", false]);
  });
});
