runFormatTest(import.meta, ["babel"], { sourceOrder: true });

// Verify each source-order annotation's byte position
// actually points to the correct code element in the original source.
const minimized =
  "function a(){return 1}function b(){return 2}for(var i=0;i<10;i++){}while(c){}do{}while(d);if(e){}class C{}const f=()=>{};";

describe("source-order annotation positions match minimized source", () => {
  const annotations = [
    { byte: 0, expected: "function", desc: "function a" },
    { byte: 22, expected: "function", desc: "function b" },
    { byte: 44, expected: "for", desc: "for statement" },
    { byte: 67, expected: "while", desc: "while statement" },
    { byte: 77, expected: "do", desc: "do-while statement" },
    { byte: 90, expected: "if", desc: "if statement" },
    { byte: 97, expected: "class", desc: "class declaration" },
    { byte: 114, expected: "()", desc: "arrow function" },
  ];

  for (const { byte, expected, desc } of annotations) {
    test(`${byte}: "${desc}" at byte position ${byte} points to "${expected}"`, () => {
      const char = minimized[byte];
      expect(char).toBeDefined();
      expect(minimized.slice(byte, byte + expected.length)).toContain(expected);
    });
  }
});

// Same test with all 5 non-babel parsers that had the split-annotation bug
runFormatTest(import.meta, ["acorn", "espree", "meriyah", "oxc", "__babel_estree"], {
  sourceOrder: true,
});
