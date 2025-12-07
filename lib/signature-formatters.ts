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
  const params = formatParams(def.params);
  const returnType = formatType(def.returnType);
  return `${asyncPrefix}function ${generatorPrefix}${name}${typeParams}(${params}): ${returnType}`;
}

/**
 * Format a method signature as a string for syntax highlighting
 */
export function formatMethodSignature(method: MethodDef): string {
  const staticPrefix = method.isStatic ? "static " : "";
  const abstractPrefix = method.isAbstract ? "abstract " : "";
  const typeParams = formatTypeParams(method.typeParams);
  const params = formatParams(method.params);
  const returnType = formatType(method.returnType);
  return `${staticPrefix}${abstractPrefix}${method.name}${typeParams}(${params}): ${returnType}`;
}

/**
 * Format a class signature as a string for syntax highlighting
 */
export function formatClassSignature(name: string, def: ClassDef): string {
  const abstractPrefix = def.isAbstract ? "abstract " : "";
  const typeParams = formatTypeParams(def.typeParams);
  const extendsClause = def.extends ? ` extends ${def.extends}` : "";
  return `${abstractPrefix}class ${name}${typeParams}${extendsClause}`;
}

/**
 * Format an interface signature as a string for syntax highlighting
 */
export function formatInterfaceSignature(
  name: string,
  def: InterfaceDef,
): string {
  const typeParams = formatTypeParams(def.typeParams);
  const extendsClause = def.extends && def.extends.length > 0
    ? ` extends ${def.extends.map(formatType).join(", ")}`
    : "";
  return `interface ${name}${typeParams}${extendsClause}`;
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
  return `type ${name}${typeParams} = ${tsType}`;
}

/**
 * Format a constructor signature as a string for syntax highlighting
 */
export function formatConstructorSignature(
  className: string,
  params: ParamDef[],
): string {
  return `new ${className}(${formatParams(params)})`;
}
