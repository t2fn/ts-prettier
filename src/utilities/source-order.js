import { hardline, indent, line } from "../document/index.js";

/**
 * @import AstPath from "../common/ast-path.js"
 * @import {Doc} from "../document/index.js"
 */

/**
 * Symbol marker to identify source-order comments.
 */
const SOURCE_ORDER_COMMENT = Symbol("source-order-comment");

/**
 * Generate a source-order comment document for the given node.
 * The comment format is: `# prettier-source-order <byte>`
 * where <byte> is the node's start position in the original source text.
 *
 * @param {AstPath} path - Current AST path with the node
 * @param {number} bytePosition - Byte position in the original source
 * @returns {Doc} Document representing the source-order comment
 */
function createSourceOrderComment(path, bytePosition) {
  const useLine = wrapWithSourceOrder._parentAnnotated;
  const lineToken = useLine ? line : hardline;
  return [
    lineToken,
    indent([
      lineToken,
      `# prettier-source-order ${bytePosition}`,
    ]),
  ];
}

/**
 * Check if the given node type should get a source-order annotation.
 * Returns true for function declarations, loops, and class declarations.
 *
 * @param {any} node - AST node to check
 * @returns {boolean}
 */
function shouldAnnotateNode(node) {
  if (!node || !node.type) {
    return false;
  }

  const types = node.type;

  // Function declarations and expressions
  if (
    types === "FunctionDeclaration" ||
    types === "FunctionExpression" ||
    types === "ArrowFunctionExpression"
  ) {
    return true;
  }

  // Loop statements
  if (
    types === "ForStatement" ||
    types === "ForInStatement" ||
    types === "ForOfStatement" ||
    types === "WhileStatement" ||
    types === "DoWhileStatement"
  ) {
    return true;
  }

  // Class declarations and expressions
  if (
    types === "ClassDeclaration" ||
    types === "ClassExpression"
  ) {
    return true;
  }

  // Method definitions in classes
  if (
    types === "ClassMethod" ||
    types === "ClassPrivateMethod" ||
    types === "MethodDefinition"
  ) {
    return true;
  }

  return false;
}

/**
 * Wrap a document with a source-order comment for a node.
 * The comment appears at the start of the node's output,
 * so you can reverse-map from the formatted output back to the
 * original source byte position.
 *
 * @param {AstPath} path - Current AST path with the node
 * @param {Doc} doc - The document to wrap
 * @param {object} options - Prettier options (needs locStart and sourceOrder)
 * @param {object} [wrapOptions] - Optional configuration
 * @param {boolean} [wrapOptions.skip] - Skip annotation when true
 * @returns {Doc}
 */
function wrapWithSourceOrder(path, doc, options, wrapOptions) {
  const node = path.node;
  const { sourceOrder, locStart } = options;

  // Skip annotation when explicitly requested
  if (wrapOptions?.skip === true) {
    return doc;
  }

  // Only annotate when sourceOrder is enabled
  if (sourceOrder !== true) {
    return doc;
  }

  // Skip if the node has no location info
  if (!locStart) {
    return doc;
  }

  // For class methods where the parent already annotated (e.g., MethodDefinition
  // already has an annotation), use the parent's position for the FunctionExpression's
  // annotation and skip creating a duplicate at a different position.
  let bytePosition;
  if (wrapWithSourceOrder._parentAnnotated && path.parent && shouldAnnotateNode(path.parent)) {
    bytePosition = locStart(path.parent);
    // Return the doc directly without adding an annotation when the parent
    // has already annotated at this position. This prevents duplicate annotation
    // entries from appearing on separate lines.
    return doc;
  } else {
    bytePosition = locStart(node);
  }

  // Wrap the document with a source-order comment
  return [createSourceOrderComment(path, bytePosition), doc];
}

export { createSourceOrderComment, shouldAnnotateNode, wrapWithSourceOrder };
