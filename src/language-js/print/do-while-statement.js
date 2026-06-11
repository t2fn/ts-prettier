import { group, hardline } from "../../document/index.js";
import { wrapWithSourceOrder } from "../../utilities/source-order.js";
import { printDoWhileStatementBody } from "./clause.js";
import {
  printDoWhileStatementCondition,
  printSemicolon,
} from "./miscellaneous.js";

function printDoWhileStatement(path, options, print) {
  const doc = [
    group(["do", printDoWhileStatementBody(path, options, print)]),
    path.node.body.type === "BlockStatement" ? " " : hardline,
    "while (",
    printDoWhileStatementCondition(path, options, print),
    ")",
    printSemicolon(options),
  ];

  return wrapWithSourceOrder(path, doc, options);
}

export { printDoWhileStatement };
