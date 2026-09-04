import { describe, it, expect } from "vitest";
import { isValidTaskInput, parseDueDate, getUniqueCategories } from "./task-utils";

// "describe" groups related tests together under one function's name.
// Each "it" is one individual test case - a specific scenario we're
// checking, with a plain-English description of what it proves.

describe("isValidTaskInput", () => {
  it("returns true when name and dueDate are both provided", () => {
    expect(isValidTaskInput("Laundry", "2026-09-10")).toBe(true);
  });

  it("returns false when name is missing", () => {
    expect(isValidTaskInput("", "2026-09-10")).toBe(false);
  });

  it("returns false when dueDate is missing", () => {
    expect(isValidTaskInput("Laundry", "")).toBe(false);
  });
});

describe("parseDueDate", () => {
  it("parses a date string to the matching local calendar day", () => {
    const result = parseDueDate("2026-09-10");
    // Checking the LOCAL date parts (not UTC) is the whole point of this
    // function - it's what prevents the "off by one day" timezone bug
    // we ran into earlier in the project.
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(8); // JS months are 0-indexed, so 8 = September
    expect(result.getDate()).toBe(10);
  });
});

describe("getUniqueCategories", () => {
  it("removes duplicate categories", () => {
    const result = getUniqueCategories(["Work", "Work", "Personal"]);
    expect(result).toEqual(["Work", "Personal"]);
  });

  it("filters out null and empty values", () => {
    const result = getUniqueCategories(["Work", null, "", "Personal"]);
    expect(result).toEqual(["Work", "Personal"]);
  });
});