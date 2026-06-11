import { group } from "../../document/index.js";
import { wrapWithSourceOrder } from "../../utilities/source-order.js";
import { printForXStatementBody } from "./clause.js";

function printForXStatement(path, options, print) {
  const { node } = path;
  const isForOfStatement = node.type === "ForOfStatement";
  const doc = group([
    "for",
    isForOfStatement && node.await ? " await" : "",
    " (",
    print("left"),
    " ",
    isForOfStatement ? "of" : "in",
    " ",
    print("right"),
    ")",
    printForXStatementBody(path, options, print),
  ]);

  return wrapWithSourceOrder(path, doc, options);
}

export { printForXStatement };
