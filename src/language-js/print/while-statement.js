import { group } from "../../document/index.js";
import { printWhileStatementBody } from "./clause.js";
import { printWhileStatementCondition } from "./miscellaneous.js";
import { wrapWithSourceOrder } from "../../utilities/source-order.js";

function printWhileStatement(path, options, print) {
  const { node } = path;
  const keyword = node.type === "WithStatement" ? "with" : "while";

  const doc = group([
    keyword,
    " (",
    printWhileStatementCondition(path, options, print),
    ")",
    printWhileStatementBody(path, options, print),
  ]);

  return wrapWithSourceOrder(path, doc, options);
}

export { printWhileStatement };
