import { group, indent, line, softline } from "../../document/index.js";
import { printDanglingComments } from "../../main/comments/print.js";
import { wrapWithSourceOrder } from "../../utilities/source-order.js";
import { printForXStatementBody } from "./clause.js";

function printForStatement(path, options, print) {
  const { node } = path;
  const body = printForXStatementBody(path, options, print);

  // We want to keep dangling comments above the loop to stay consistent.
  // Any comment positioned between the for statement and the parentheses
  // is going to be printed before the statement.
  const dangling = printDanglingComments(path, options);
  const printedComments = dangling ? [dangling, softline] : "";

  const doc = !node.init && !node.test && !node.update
    ? [printedComments, group(["for (;;)", body])]
    : [
        printedComments,
        group([
          "for (",
          group([
            indent([
              softline,
              print("init"),
              ";",
              line,
              print("test"),
              ";",
              node.update ? [line, print("update")] : "",
            ]),
            softline,
          ]),
          ")",
          body,
        ]),
      ];

  return wrapWithSourceOrder(path, doc, options);
}

export { printForStatement };
