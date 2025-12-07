/**
 * Type reference extraction utilities for API documentation
 *
 * These utilities recursively extract type names from TypeScript
 * type definitions for building cross-reference links.
 */
import type { TsTypeDef, TsTypeParamDef } from "./api-docs.ts";

/**
 * Extract all type names referenced in a TsTypeDef (recursively)
 */
export function extractTypeRefs(type: TsTypeDef | undefined): Set<string> {
  const refs = new Set<string>();
  if (!type) return refs;

  function walk(t: TsTypeDef) {
    switch (t.kind) {
      case "typeRef":
        if (t.typeRef?.typeName) {
          refs.add(t.typeRef.typeName);
          t.typeRef.typeParams?.forEach(walk);
        }
        break;
      case "array":
        if (t.array) walk(t.array);
        break;
      case "union":
        t.union?.forEach(walk);
        break;
      case "intersection":
        t.intersection?.forEach(walk);
        break;
      case "tuple":
        t.tuple?.forEach(walk);
        break;
      case "fnOrConstructor":
        if (t.fnOrConstructor) {
          t.fnOrConstructor.params.forEach((p) => {
            if (p.tsType) walk(p.tsType);
          });
          if (t.fnOrConstructor.returnType) walk(t.fnOrConstructor.returnType);
        }
        break;
      case "typeOperator":
        if (t.typeOperator?.tsType) walk(t.typeOperator.tsType);
        break;
      case "typeLiteral":
        if (t.typeLiteral) {
          t.typeLiteral.properties.forEach((p) => {
            if (p.tsType) walk(p.tsType);
          });
          t.typeLiteral.methods.forEach((m) => {
            m.params.forEach((p) => {
              if (p.tsType) walk(p.tsType);
            });
            if (m.returnType) walk(m.returnType);
          });
        }
        break;
    }
  }

  walk(type);
  return refs;
}

/**
 * Extract type refs from type parameters (constraints and defaults)
 */
export function extractTypeParamRefs(
  typeParams: TsTypeParamDef[] | undefined,
): Set<string> {
  const refs = new Set<string>();
  if (!typeParams) return refs;

  for (const p of typeParams) {
    if (p.constraint) {
      for (const ref of extractTypeRefs(p.constraint)) {
        refs.add(ref);
      }
    }
    if (p.default) {
      for (const ref of extractTypeRefs(p.default)) {
        refs.add(ref);
      }
    }
  }
  return refs;
}
