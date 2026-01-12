/**
 * Signature formatting utilities for API documentation
 *
 * These formatters convert TypeScript definition objects to string
 * representations for syntax highlighting and Markdown output.
 */
import type {
  ClassDef,
  FunctionDef,
  InterfaceDef,
  MethodDef,
  ParamDef,
  TypeAliasDef,
} from "./api-docs.ts";
import { formatParams, formatType, formatTypeParams } from "./api-docs.ts";

/** Line length threshold for breaking into multiple lines */
const LINE_LENGTH_THRESHOLD = 80;

/**
 * Format parameters with line breaks if the list is long
 */
function formatParamsMultiline(
  params: ParamDef[] | undefined,
  baseIndent: string,
): { inline: string; multiline: string } {
  const inline = formatParams(params);
  if (!params || params.length === 0) {
    return { inline, multiline: inline };
  }

  const paramStrings = params.map((p) => {
    const optional = p.optional ? "?" : "";
    const name = p.name ?? "_";
    const type = formatType(p.tsType);
    return `${name}${optional}: ${type}`;
  });

  const multiline = paramStrings
    .map((s) => `\n${baseIndent}  ${s},`)
    .join("") + `\n${baseIndent}`;

  return { inline, multiline };
}

/**
 * Format a function signature as a string for syntax highlighting
 */
export function formatFunctionSignature(
  name: string,
  def: FunctionDef,
): string {
  const asyncPrefix = def.isAsync ? "async " : "";
  const generatorPrefix = def.isGenerator ? "*" : "";
  const typeParams = formatTypeParams(def.typeParams);
  const returnType = formatType(def.returnType);
  const { inline, multiline } = formatParamsMultiline(def.params, "");

  const singleLine =
    `${asyncPrefix}function ${generatorPrefix}${name}${typeParams}(${inline}): ${returnType}`;

  if (singleLine.length <= LINE_LENGTH_THRESHOLD) {
    return singleLine;
  }

  return `${asyncPrefix}function ${generatorPrefix}${name}${typeParams}(${multiline}): ${returnType}`;
}

/**
 * Format a method signature as a string for syntax highlighting
 */
export function formatMethodSignature(method: MethodDef): string {
  const staticPrefix = method.isStatic ? "static " : "";
  const abstractPrefix = method.isAbstract ? "abstract " : "";
  const typeParams = formatTypeParams(method.typeParams);
  const returnType = formatType(method.returnType);
  const { inline, multiline } = formatParamsMultiline(method.params, "");

  const singleLine =
    `${staticPrefix}${abstractPrefix}${method.name}${typeParams}(${inline}): ${returnType}`;

  if (singleLine.length <= LINE_LENGTH_THRESHOLD) {
    return singleLine;
  }

  return `${staticPrefix}${abstractPrefix}${method.name}${typeParams}(${multiline}): ${returnType}`;
}

/**
 * Format a class signature as a string for syntax highlighting
 */
export function formatClassSignature(name: string, def: ClassDef): string {
  const abstractPrefix = def.isAbstract ? "abstract " : "";
  const typeParams = formatTypeParams(def.typeParams);

  // Extends clause with super type params
  let extendsClause = "";
  if (def.extends) {
    extendsClause = ` extends ${def.extends}`;
    if (def.superTypeParams && def.superTypeParams.length > 0) {
      extendsClause += `<${def.superTypeParams.map(formatType).join(", ")}>`;
    }
  }

  // Implements clause
  const implementsTypes = def.implements?.map(formatType) ?? [];
  const implementsInline = implementsTypes.length > 0
    ? ` implements ${implementsTypes.join(", ")}`
    : "";

  const singleLine =
    `${abstractPrefix}class ${name}${typeParams}${extendsClause}${implementsInline}`;

  if (
    singleLine.length <= LINE_LENGTH_THRESHOLD || implementsTypes.length <= 1
  ) {
    return singleLine;
  }

  // Break implements into multiple lines
  const implementsMultiline = implementsTypes
    .map((t, i) => i === 0 ? ` implements ${t}` : `  ${t}`)
    .join(",\n");

  return `${abstractPrefix}class ${name}${typeParams}${extendsClause}\n${implementsMultiline}`;
}

/**
 * Format an interface signature as a string for syntax highlighting
 */
export function formatInterfaceSignature(
  name: string,
  def: InterfaceDef,
): string {
  const typeParams = formatTypeParams(def.typeParams);
  const extendsTypes = def.extends?.map(formatType) ?? [];
  const extendsInline = extendsTypes.length > 0
    ? ` extends ${extendsTypes.join(", ")}`
    : "";

  const singleLine = `interface ${name}${typeParams}${extendsInline}`;

  if (singleLine.length <= LINE_LENGTH_THRESHOLD || extendsTypes.length <= 1) {
    return singleLine;
  }

  // Break extends into multiple lines
  const extendsMultiline = extendsTypes
    .map((t, i) => i === 0 ? ` extends ${t}` : `  ${t}`)
    .join(",\n");

  return `interface ${name}${typeParams}\n${extendsMultiline}`;
}

/**
 * Format a type alias signature as a string for syntax highlighting
 */
export function formatTypeAliasSignature(
  name: string,
  def: TypeAliasDef,
): string {
  const typeParams = formatTypeParams(def.typeParams);
  const tsType = formatType(def.tsType);
  const singleLine = `type ${name}${typeParams} = ${tsType}`;

  // If the type contains newlines (e.g., from conditional or union formatting), indent properly
  if (tsType.includes("\n")) {
    const indented = tsType.split("\n").map((line, i) =>
      i === 0 ? line : `  ${line}`
    ).join("\n");
    return `type ${name}${typeParams} = ${indented}`;
  }

  return singleLine;
}

/**
 * Format a constructor signature as a string for syntax highlighting
 */
export function formatConstructorSignature(
  className: string,
  params: ParamDef[],
): string {
  const { inline, multiline } = formatParamsMultiline(params, "");
  const singleLine = `new ${className}(${inline})`;

  if (singleLine.length <= LINE_LENGTH_THRESHOLD) {
    return singleLine;
  }

  return `new ${className}(${multiline})`;
}
