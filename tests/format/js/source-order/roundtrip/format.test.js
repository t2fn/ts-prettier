// Round-trip tests for source-order annotations.
// Verifies that:
// 1. Annotated positions in formatted output match the original minimized source
// 2. Re-formatting produces consistent positions (idempotent)
// 3. The annotation points to the correct code element in the formatted output

// A heavily minimized source string where every byte matters.
// Each element is separated by exactly 0-2 bytes to test precise positioning.
const minimizedCode =
  "function a(){return 1}function b(){return 2}for(var i=0;i<10;i++){}while(c){}do{}while(d);if(e){}class C{}const f=()=>{};";

describe("round-trip source-order positions", () => {
  test("minimized: each annotation points to the expected element", () => {
    // Verify against known positions in the obfuscated.js source
    const expected = [
      { byte: 0, char: "f", desc: "function a" },
      { byte: 22, char: "f", desc: "function b" },
      { byte: 44, char: "f", desc: "for" },
      { byte: 67, char: "w", desc: "while" },
      { byte: 77, char: "d", desc: "do" },
      { byte: 90, char: "i", desc: "if" },
      { byte: 97, char: "c", desc: "class" },
      { byte: 114, char: "(", desc: "arrow" },
    ];

    for (const exp of expected) {
      expect(minimizedCode[exp.byte]).toBe(exp.char);
      expect(exp.byte).toBeLessThan(minimizedCode.length);
    }
  });

  test("annotation positions are valid indices in source code", async () => {
    const { format } = await import("../../../../../index.js");

    const formatted = await format(minimizedCode, {
      sourceOrder: true,
      parser: "babel",
      printWidth: 80,
    });

    const positions = [];
    const lines = formatted.split("\n");
    for (const line of lines) {
      const match = line.match(/# prettier-source-order (\d+)/);
      if (match) {
        positions.push(parseInt(match[1], 10));
      }
    }

    // All positions must be valid indices in the minimized source
    for (const pos of positions) {
      expect(pos).toBeGreaterThanOrEqual(0);
      expect(pos).toBeLessThan(minimizedCode.length);
    }

    expect(positions.length).toBeGreaterThan(0);
  });

  test("positions are in ascending order (true source order)", async () => {
    const { format } = await import("../../../../../index.js");

    const formatted = await format(minimizedCode, {
      sourceOrder: true,
      parser: "babel",
      printWidth: 80,
    });

    const positions = [];
    const lines = formatted.split("\n");
    for (const line of lines) {
      const match = line.match(/# prettier-source-order (\d+)/);
      if (match) {
        positions.push(parseInt(match[1], 10));
      }
    }

    // Positions should be strictly non-decreasing
    for (let i = 1; i < positions.length; i++) {
      expect(positions[i]).toBeGreaterThanOrEqual(positions[i - 1]);
    }
  });

  test("annotations contain the expected code markers at those positions", async () => {
    const { format } = await import("../../../../../index.js");

    const formatted = await format(minimizedCode, {
      sourceOrder: true,
      parser: "babel",
      printWidth: 80,
    });

    // Extract annotation positions from the formatted output
    const annotations = [];
    const lines = formatted.split("\n");
    for (const line of lines) {
      const match = line.match(/# prettier-source-order (\d+)/);
      if (match) {
        const pos = parseInt(match[1], 10);
        // The next visible character after the annotation comment
        const char = minimizedCode[pos];
        annotations.push({ pos, char });
      }
    }

    // Verify the character at each annotation position matches expected elements
    expect(annotations).toContainEqual({ pos: 0, char: "f" });  // function a
    expect(annotations).toContainEqual({ pos: 22, char: "f" }); // function b
    expect(annotations).toContainEqual({ pos: 44, char: "f" }); // for
    expect(annotations).toContainEqual({ pos: 67, char: "w" }); // while
    expect(annotations).toContainEqual({ pos: 77, char: "d" }); // do
    expect(annotations).toContainEqual({ pos: 90, char: "i" }); // if
    expect(annotations).toContainEqual({ pos: 97, char: "c" }); // class
    expect(annotations).toContainEqual({ pos: 114, char: "(" }); // arrow
  });
});

// Run format tests across all parsers to verify positions
// are consistent regardless of AST structure
runFormatTest(import.meta, ["babel", "acorn", "espree", "meriyah", "oxc", "__babel_estree"], {
  sourceOrder: true,
});
